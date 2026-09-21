/**
 * Headless check of everything the accounts feature runs on the server. Bundles the
 * TypeScript with esbuild and drives it against a stubbed `fetch`, so the request that
 * would go to Supabase or to an email service is asserted field by field without a byte
 * leaving the machine. Run with `npm run test`.
 *
 * Nothing here touches the network and no test uses a real key. The one thing this file
 * must never do is create an account or send an email to anybody.
 *
 * The signature vectors in section 1 come from the Standard Webhooks specification rather
 * than from our own implementation, which is the point: a test that signs with the code it
 * is testing proves only that the code agrees with itself.
 */
import { build } from 'esbuild';
import { createHmac } from 'node:crypto';
import { rmSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(here, '..');
const built = [];

/**
 * One module, bundled and imported.
 *
 * `define` stands in for what Vite does at build time. health.ts reads two PUBLIC_ values
 * literally, because that literal spelling is the only one the real build replaces, and
 * without the same substitution here the module would look for an `import.meta.env` that
 * plain Node does not have.
 */
async function bundle(entry, name, define = {}) {
  const outfile = resolve(ROOT, `node_modules/.auth-test-${name}.mjs`);
  await build({
    entryPoints: [resolve(ROOT, entry)],
    outfile,
    bundle: true,
    format: 'esm',
    platform: 'node',
    target: 'node22',
    logLevel: 'silent',
    define
  });
  built.push(outfile);
  return import(pathToFileURL(outfile).href);
}

const BUILT_ENV = {
  'import.meta.env.PUBLIC_SUPABASE_URL': JSON.stringify('https://demo.supabase.co'),
  'import.meta.env.PUBLIC_SUPABASE_KEY': JSON.stringify('sb_publishable_demo')
};

const hook = await bundle('src/lib/account/hook.ts', 'hook');
const emails = await bundle('src/lib/account/emails.ts', 'emails');
const checks = await bundle('src/lib/account/checks.ts', 'checks');
const send = await bundle('src/lib/email/send.ts', 'send');
const emailRoute = await bundle('src/pages/api/auth/email.ts', 'route-email');
const listRoute = await bundle('src/pages/api/auth/list.ts', 'route-list');
const deleteRoute = await bundle('src/pages/api/auth/delete.ts', 'route-delete');
const healthRoute = await bundle('src/pages/api/auth/health.ts', 'route-health', BUILT_ENV);

let failures = 0;
const fail = m => { failures++; console.log('  FAIL ' + m); };
const ok = m => console.log('  ok   ' + m);
const is = (actual, expected, what) =>
  JSON.stringify(actual) === JSON.stringify(expected)
    ? ok(`${what}: ${JSON.stringify(actual)}`)
    : fail(`${what}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
const has = (haystack, needle, what) =>
  String(haystack).includes(needle) ? ok(what) : fail(`${what}: ${JSON.stringify(needle)} is missing`);
const hasnt = (haystack, needle, what) =>
  String(haystack).includes(needle) ? fail(`${what}: ${JSON.stringify(needle)} is present`) : ok(what);

const realFetch = globalThis.fetch;

/** A stand-in Response with only the parts our code reads. */
const res = (status, body) => ({
  status,
  ok: status >= 200 && status < 300,
  json: async () => {
    if (body === undefined) throw new Error('no body');
    return body;
  }
});

/**
 * Replaces global fetch and routes by a substring of the URL, recording every call.
 * Anything unmatched answers 404, so a request nobody expected shows up as a failure
 * rather than as a silent success.
 */
function routeFetch(handlers) {
  const calls = [];
  globalThis.fetch = async (input, init = {}) => {
    const url = typeof input === 'string' ? input : input.url;
    const method = (init.method || 'GET').toUpperCase();
    let body;
    try {
      body = typeof init.body === 'string' ? JSON.parse(init.body) : undefined;
    } catch {
      body = init.body;
    }
    calls.push({ url, method, headers: init.headers || {}, body });
    for (const [match, reply] of handlers) {
      if (url.includes(match)) return typeof reply === 'function' ? reply({ url, method, body }) : reply;
    }
    return res(404, {});
  };
  return calls;
}

const at = (calls, match) => calls.filter(c => c.url.includes(match));

// ------------------------------------------------------- 1. the webhook signature
console.log('1. standard webhooks');
{
  // The published specification vector. Our code must agree with it, not with itself.
  const SPEC = {
    secret: 'whsec_MfKQ9r8GKYqrTwjUPD8ILPZIo2LaLaSw',
    id: 'msg_p5jXN8AQM9LWM0D4loKWxJek',
    ts: '1614265330',
    body: '{"test": 2432232314}',
    sig: 'v1,g0hM9SsE+OTPJTGt/tmIKtSyZlE3uFJELVlNIOLJ1OE='
  };
  const now = Number(SPEC.ts) * 1000;
  const heads = (over = {}) => ({ id: SPEC.id, timestamp: SPEC.ts, signature: SPEC.sig, ...over });

  is(hook.verifyWebhook(SPEC.secret, heads(), SPEC.body, now).ok, true, 'the specification vector verifies');
  is(
    hook.verifyWebhook(`v1,${SPEC.secret}`, heads(), SPEC.body, now).ok,
    true,
    'the same secret with the v1 prefix Supabase shows verifies too'
  );
  is(
    hook.verifyWebhook('whsec_AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', heads(), SPEC.body, now).ok,
    false,
    'a wrong secret fails'
  );
  is(hook.verifyWebhook(SPEC.secret, heads(), `${SPEC.body} `, now).ok, false, 'one changed byte fails');
  is(
    hook.verifyWebhook(SPEC.secret, heads(), SPEC.body, now + 301_000).ok,
    false,
    'five minutes and one second later fails'
  );
  is(
    hook.verifyWebhook(SPEC.secret, heads(), SPEC.body, now - 301_000).ok,
    false,
    'a timestamp far in the future fails'
  );
  is(hook.verifyWebhook(SPEC.secret, heads(), SPEC.body, now + 299_000).ok, true, 'inside the tolerance passes');

  is(hook.verifyWebhook('', heads(), SPEC.body, now).why, 'no hook secret is set', 'no secret is named as such');
  is(
    hook.verifyWebhook(SPEC.secret, heads({ signature: null }), SPEC.body, now).why,
    'a signing header is missing',
    'a missing header is named as such'
  );
  is(
    hook.verifyWebhook(SPEC.secret, heads({ timestamp: 'lunchtime' }), SPEC.body, now).ok,
    false,
    'a timestamp that is not a number fails'
  );
  is(hook.verifyWebhook(SPEC.secret, heads({ signature: 'nonsense' }), SPEC.body, now).ok, false, 'a malformed header fails');
  is(
    hook.verifyWebhook(SPEC.secret, heads({ signature: SPEC.sig.slice(3) }), SPEC.body, now).ok,
    false,
    'a signature with the version stripped off fails'
  );
  is(
    hook.verifyWebhook(SPEC.secret, heads({ signature: `v1,AAAA ${SPEC.sig} v2,BBBB` }), SPEC.body, now).ok,
    true,
    'one good signature among several passes'
  );
  is(
    hook.verifyWebhook(SPEC.secret, heads({ signature: 'v1,AAAA v1,BBBB' }), SPEC.body, now).ok,
    false,
    'several wrong signatures still fail'
  );
  is(hook.verifyWebhook(SPEC.secret, heads({ signature: 'v2,whatever' }), SPEC.body, now).ok, false, 'no v1 entry fails');
}

// ------------------------------------------------------------- 2. the hook payload
console.log('2. the hook payload');
{
  const good = {
    user: { id: 'u-1', email: 'reader@example.com' },
    email_data: { token: '483205', token_hash: 'abc123', email_action_type: 'signup', site_url: 'https://wiserwalk.com' }
  };
  is(hook.readPayload(good), { email: 'reader@example.com', action: 'signup', tokenHash: 'abc123', token: '483205' }, 'a good payload');
  is(hook.readPayload({ ...good, user: {} }), null, 'no address is refused');
  is(hook.readPayload({ ...good, user: { email: 'not-an-address' } }), null, 'something that is not an address is refused');
  is(hook.readPayload({ ...good, email_data: { ...good.email_data, token_hash: '' } }), null, 'no token hash is refused');
  is(hook.readPayload({ ...good, email_data: { ...good.email_data, email_action_type: '' } }), null, 'no action is refused');
  is(hook.readPayload(null), null, 'nothing is refused');
  is(hook.readPayload('{}'), null, 'a string is refused');
  is(
    hook.readPayload({ ...good, email_data: { ...good.email_data, token: 'abcdef' } }).token,
    '',
    'a token that is not digits is dropped rather than printed'
  );
  is(
    hook.readPayload({ ...good, email_data: { ...good.email_data, email_action_type: 'invite' } }).action,
    'invite',
    'an action we do not handle still parses, so it can be reported'
  );
}

// ------------------------------------------------------------------- 3. the emails
console.log('3. the emails');
{
  const SUBJECTS = {
    signup: 'Set your password for Wiser Walk',
    magiclink: 'Your Wiser Walk password',
    recovery: 'Choose a new password for Wiser Walk'
  };

  for (const kind of ['signup', 'magiclink', 'recovery']) {
    const mail = emails.renderAuthEmail({ action: kind, tokenHash: 'HASH123', token: '483205', origin: 'https://wiserwalk.com' });
    is(mail.subject, SUBJECTS[kind], `${kind}: the subject`);

    const link = `https://wiserwalk.com/account/password/?t=HASH123&k=${kind}`;
    has(mail.html, `href="https://wiserwalk.com/account/password/?t=HASH123&amp;k=${kind}"`, `${kind}: the button points at the password page`);
    has(mail.text, link, `${kind}: the plain text carries the same link`);

    // One link, and it is that one. A password email full of links looks like the thing it
    // is trying not to look like.
    is((mail.html.match(/href=/g) || []).length, 1, `${kind}: exactly one link in the whole message`);

    has(mail.html, '483 205', `${kind}: the code is printed in threes`);
    has(mail.text, '483 205', `${kind}: the plain text carries the code too`);
    has(mail.html, 'wiserwalk.com/account/password/ and type this code', `${kind}: it says where to type the code`);

    for (const [needle, what] of [
      ['{{', 'no unreplaced template marks'],
      ['—', 'no em dash'],
      ['faith', 'not the word this site never uses of itself']
    ]) {
      hasnt(mail.html.toLowerCase(), needle.toLowerCase(), `${kind}: ${what}`);
      hasnt(mail.text.toLowerCase(), needle.toLowerCase(), `${kind}: ${what}, in the plain text`);
    }
    hasnt(mail.html.toLowerCase(), 'magic link', `${kind}: never the phrase these are usually called`);
    hasnt(mail.text.toLowerCase(), 'magic link', `${kind}: never that phrase in the plain text either`);

    // Anything outside the basic multilingual plane is an emoji or a symbol; none belong
    // in an email whose job is to look like it came from a bank rather than a newsletter.
    const emoji = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/u;
    is(emoji.test(mail.html) || emoji.test(mail.text), false, `${kind}: no emoji`);

    // The parts an email client needs to render it at all.
    has(mail.html, 'max-width:520px', `${kind}: the message is 520px wide`);
    has(mail.html, 'display:inline-block', `${kind}: the button is a padded inline block`);
    has(mail.html, 'background-color:#7ebaee;background-image:linear-gradient', `${kind}: the gradient rule has a solid fallback`);
    has(mail.html, '#444444', `${kind}: dark ink`);
    hasnt(mail.html, '<style', `${kind}: inline styles only, no stylesheet`);
    hasnt(mail.html, '<table', `${kind}: no table scaffolding`);
  }

  // The site cannot know which of the three was sent, because saying so would tell anybody
  // with a list of addresses who has an account here. So "Check your email" quotes no
  // subject line and says instead that the subject is about your password — a sentence that
  // is only true while every one of the three subjects is about the password.
  for (const kind of ['signup', 'magiclink', 'recovery']) {
    has(
      emails.renderAuthEmail({ action: kind, tokenHash: 'H', token: '483205' }).subject.toLowerCase(),
      'password',
      `${kind}: the subject is about the password, so the site can say so without naming it`
    );
  }

  has(
    emails.renderAuthEmail({ action: 'magiclink', tokenHash: 'H', token: '483205' }).html,
    'You already have a Wiser Walk account',
    'a known address is told so, rather than being invited to sign up again'
  );
  has(
    emails.renderAuthEmail({ action: 'magiclink', tokenHash: 'H', token: '483205' }).html,
    'Choose a new password',
    'and the button says the same words as the page it opens'
  );

  is(emails.renderAuthEmail({ action: 'invite', tokenHash: 'H', token: '1' }), null, 'an action we do not handle renders nothing');
  is(emails.renderAuthEmail({ action: '', tokenHash: 'H' }), null, 'no action renders nothing');

  const noCode = emails.renderAuthEmail({ action: 'signup', tokenHash: 'H' });
  has(noCode.html, 'ask for a new one at wiserwalk.com/account/password/', 'with no code, the fallback still names the page');
  hasnt(noCode.html, 'type this code', 'with no code, it does not ask for one');

  is(emails.spacedCode('483205'), '483 205', 'six digits are spaced');
  is(emails.spacedCode('48320'), '48320', 'anything else is left alone');
}

console.log('3b. which origin the links use');
{
  const of = raw => emails.originFor(raw);
  is(of('https://wiserwalk.com'), 'https://wiserwalk.com', 'the site itself');
  is(of('https://www.wiserwalk.com'), 'https://www.wiserwalk.com', 'the www form');
  is(of('http://localhost:4321'), 'http://localhost:4321', 'a local run');
  is(of('https://evil.example.com'), 'https://wiserwalk.com', 'anywhere else falls back to the site');
  is(of('http://wiserwalk.com.attacker.net'), 'https://wiserwalk.com', 'a lookalike host falls back');
  is(of('not a url'), 'https://wiserwalk.com', 'nonsense falls back');
  is(of(null), 'https://wiserwalk.com', 'nothing falls back');
  is(of('http://wiserwalk.com'), 'https://wiserwalk.com', 'plain http on the real host falls back to https');

  // The whole of *.vercel.app used to be trusted, which was a promise about every project
  // on the platform made to protect a credential that takes over an account for an hour.
  // The hook cannot reach a preview anyway: previews sit behind Vercel's login wall.
  is(of('https://evil.vercel.app'), 'https://wiserwalk.com', 'somebody else on vercel.app falls back');
  is(of('https://wiser-walk-git-x.vercel.app'), 'https://wiserwalk.com', 'and so does a preview of this very site');
  is(of('https://wiserwalk.com.vercel.app'), 'https://wiserwalk.com', 'and a host that merely starts with ours');
}

// -------------------------------------------------------------------- 4. sending
console.log('4. sending one email');
/** One message, fresh each time, so no test can leave a field behind for the next. */
const mail = () => ({
  to: 'reader@example.com',
  subject: 'Set your password',
  html: '<p>hi</p>',
  text: 'hi',
  tag: 'signup',
  idempotencyKey: 'msg_1'
});
{
  const calls = routeFetch([['api.brevo.com', res(201, { messageId: 'm-1' })]]);
  const out = await send.sendTransactional({ BREVO_API_KEY: 'brevo-not-real' }, mail());
  is(out, { ok: true, id: 'm-1', via: 'brevo' }, 'brevo 201 is sent');
  is(calls[0].url, 'https://api.brevo.com/v3/smtp/email', 'the transactional endpoint');
  is(calls[0].method, 'POST', 'method');
  is(calls[0].headers['api-key'], 'brevo-not-real', 'the key rides on the api-key header');
  is(calls[0].body, {
    sender: { email: 'account@wiserwalk.com', name: 'Wiser Walk' },
    to: [{ email: 'reader@example.com' }],
    subject: 'Set your password',
    htmlContent: '<p>hi</p>',
    textContent: 'hi',
    tags: ['auth', 'signup']
  }, 'the body');
  const printed = JSON.stringify({ url: calls[0].url, body: calls[0].body });
  if (printed.includes('brevo-not-real')) fail('the key appears outside the header');
  else ok('the key appears in no url and no body');
}
{
  const calls = routeFetch([['api.resend.com', res(200, { id: 'r-1' })]]);
  const out = await send.sendTransactional({ RESEND_API_KEY: 'resend-not-real', ACCOUNT_EMAIL_FROM: 'Wiser Walk <hello@wiserwalk.com>' }, mail());
  is(out, { ok: true, id: 'r-1', via: 'resend' }, 'resend 200 is sent');
  is(calls[0].url, 'https://api.resend.com/emails', 'the resend endpoint');
  is(calls[0].headers.authorization, 'Bearer resend-not-real', 'the key rides as a bearer token');
  is(calls[0].headers['idempotency-key'], 'msg_1', 'the webhook id is the idempotency key');
  is(calls[0].body.from, 'Wiser Walk <hello@wiserwalk.com>', 'the from address comes from the environment');
  is(calls[0].body.to, ['reader@example.com'], 'one recipient');
  is(calls[0].body.tags, [{ name: 'purpose', value: 'auth' }, { name: 'kind', value: 'signup' }], 'tags');
  const printed = JSON.stringify({ url: calls[0].url, body: calls[0].body });
  if (printed.includes('resend-not-real')) fail('the key appears outside the header');
  else ok('the resend key appears in no url and no body');
}
{
  routeFetch([['api.brevo.com', res(503, { code: 'unavailable' })]]);
  const out = await send.sendTransactional({ BREVO_API_KEY: 'k' }, mail());
  is({ ok: out.ok, retryable: out.retryable }, { ok: false, retryable: true }, 'a busy service is worth retrying');

  routeFetch([['api.brevo.com', res(401, { code: 'unauthorized' })]]);
  const bad = await send.sendTransactional({ BREVO_API_KEY: 'brevo-not-real' }, mail());
  is({ ok: bad.ok, retryable: bad.retryable }, { ok: false, retryable: false }, 'a refused key is not worth retrying');
  hasnt(bad.detail, 'brevo-not-real', 'the failure detail carries no key');

  routeFetch([['api.brevo.com', res(400, { code: 'account_under_validation' })]]);
  const held = await send.sendTransactional({ BREVO_API_KEY: 'k' }, mail());
  is(held.detail, '400 account_under_validation', 'the provider word survives, so the owner knows what to ask for');
}
{
  // A service that never answers. The stub honours the abort signal, which is the only
  // thing that can end this call: if the deadline is ever dropped, this test hangs.
  globalThis.fetch = (url, init) =>
    new Promise((_, reject) => init.signal.addEventListener('abort', () => reject(new Error('aborted'))));
  const started = Date.now();
  const out = await send.sendTransactional({ BREVO_API_KEY: 'k' }, mail());
  const took = Date.now() - started;
  is({ ok: out.ok, retryable: out.retryable }, { ok: false, retryable: true }, 'a timeout is worth retrying');
  if (took < send.SEND_TIMEOUT_MS + 1500) ok(`gave up after ${took}ms rather than hanging`);
  else fail(`waited ${took}ms`);
}
{
  globalThis.fetch = async () => { throw new Error('nothing should be sent'); };
  const preview = await send.sendTransactional({ EMAIL_PREVIEW: '1', BREVO_API_KEY: 'k' }, mail());
  is(preview, { ok: true, id: 'preview', via: 'console' }, 'preview mode beats a real key and sends nothing');

  const none = await send.sendTransactional({}, mail());
  is(none, { ok: false, retryable: false, detail: 'no email service is configured', via: 'none' }, 'nothing configured is an honest failure');

  is(send.senderId({ EMAIL_PREVIEW: '1', RESEND_API_KEY: 'r' }), 'console', 'preview wins');
  is(send.senderId({ RESEND_API_KEY: 'r', BREVO_API_KEY: 'b' }), 'resend', 'resend beats brevo');
  is(send.senderId({ BREVO_API_KEY: '  ' }), 'none', 'a blank key is no key');

  is(send.splitFrom('Wiser Walk <account@wiserwalk.com>'), { name: 'Wiser Walk', email: 'account@wiserwalk.com' }, 'a name and an address');
  is(send.splitFrom('account@wiserwalk.com'), { name: '', email: 'account@wiserwalk.com' }, 'an address on its own');
}

// ------------------------------------------------------------- 5. the setup checks
console.log('5. the setup checks');
const FULL = {
  PUBLIC_SUPABASE_URL: 'https://demo.supabase.co',
  PUBLIC_SUPABASE_KEY: 'sb_publishable_demo',
  SUPABASE_SECRET_KEY: 'sb_secret_demo',
  SUPABASE_EMAIL_HOOK_SECRET: 'v1,whsec_ZGVtbw==',
  BREVO_API_KEY: 'brevo-demo',
  ACCOUNT_EMAIL_FROM: 'Wiser Walk <account@wiserwalk.com>',
  [checks.BUILT_URL]: 'https://demo.supabase.co',
  [checks.BUILT_KEY]: 'sb_publishable_demo'
};
{
  const none = await checks.checkWebsiteKeys(realFetch, {});
  is(none.state, 'todo', 'no website keys is something to do');
  has(none.say, 'PUBLIC_SUPABASE_URL', 'it names the variable');
  is((await checks.checkWebsiteKeys(realFetch, { PUBLIC_SUPABASE_URL: 'https://x.supabase.co' })).state, 'todo', 'one of two is still to do');
  is((await checks.checkWebsiteKeys(realFetch, { PUBLIC_SUPABASE_URL: 'x', PUBLIC_SUPABASE_KEY: 'k' })).state, 'bad', 'a url that is not one is wrong');
  is((await checks.checkWebsiteKeys(realFetch, FULL)).state, 'ok', 'both set is fine');
}
{
  const swapped = await checks.checkSecretKey(realFetch, { ...FULL, SUPABASE_SECRET_KEY: 'sb_publishable_demo' });
  is(swapped.state, 'bad', 'the publishable key pasted as the secret one is caught');
  has(swapped.say, 'publishable', 'it says which two were confused');
  is((await checks.checkSecretKey(realFetch, {})).state, 'todo', 'no secret key is something to do');
  is((await checks.checkSecretKey(realFetch, FULL)).state, 'ok', 'a real-looking secret key is fine');

  is((await checks.checkHookSecret(realFetch, {})).state, 'todo', 'no hook secret is something to do');
  is((await checks.checkHookSecret(realFetch, { SUPABASE_EMAIL_HOOK_SECRET: 'abc' })).state, 'bad', 'a hook secret of the wrong shape is wrong');
  is((await checks.checkHookSecret(realFetch, FULL)).state, 'ok', 'the whole pasted secret is fine');
}
{
  const stale = await checks.checkRedeploy(realFetch, { ...FULL, [checks.BUILT_URL]: '', [checks.BUILT_KEY]: '' });
  is(stale.state, 'todo', 'keys set but not built in needs a redeploy');
  has(stale.say, 'Redeploy', 'and it says the word on the button');
  is((await checks.checkRedeploy(realFetch, { ...FULL, [checks.BUILT_KEY]: 'sb_publishable_old' })).state, 'todo', 'a changed key needs a redeploy');
  is((await checks.checkRedeploy(realFetch, FULL)).state, 'ok', 'matching values need nothing');
  is((await checks.checkRedeploy(realFetch, {})).state, 'todo', 'with no keys at all there is nothing to redeploy for');
}
{
  routeFetch([['/auth/v1/health', res(540, {})]]);
  const paused = await checks.checkProject(globalThis.fetch, FULL);
  is(paused.state, 'bad', 'a paused project is wrong');
  has(paused.say, 'paused', 'and it says paused');
  has(paused.say, 'Resume project', 'and it names the button that fixes it');

  routeFetch([['/auth/v1/health', res(401, {})]]);
  is((await checks.checkProject(globalThis.fetch, FULL)).state, 'bad', 'a refused key is wrong');

  const live = routeFetch([['/auth/v1/health', res(200, { name: 'GoTrue' })]]);
  is((await checks.checkProject(globalThis.fetch, FULL)).state, 'ok', 'an answering project is fine');
  is(live[0].headers.apikey, 'sb_publishable_demo', 'the key rides on the apikey header');
  is(live[0].headers.authorization, undefined, 'and never as a bearer token');

  // The destination host is whatever PUBLIC_SUPABASE_URL happens to hold, and this check
  // runs on a route any stranger can call. It used to fall back to the secret key when the
  // publishable one was missing, which is the exact state the owner passes through during
  // setup: one mistyped project ref would have posted the key that bypasses every policy
  // on the database to a host of somebody else's choosing. /auth/v1/health needs no key.
  const bare = routeFetch([['/auth/v1/health', res(200, {})]]);
  is(
    (await checks.checkProject(globalThis.fetch, { ...FULL, PUBLIC_SUPABASE_KEY: undefined })).state,
    'ok',
    'with no publishable key the check still runs'
  );
  is(bare.length, 1, 'it still asks the project');
  is(bare[0].headers.apikey, undefined, 'and sends NO key rather than borrowing the secret one');
  hasnt(JSON.stringify(bare[0]), 'sb_secret_demo', 'the secret key never leaves on this call');

  globalThis.fetch = async () => { throw new Error('offline'); };
  is((await checks.checkProject(globalThis.fetch, FULL)).state, 'bad', 'an unreachable project is wrong');
}
{
  // How long ago, in the three widths a public page is allowed to say. The route is
  // unlinked rather than private, so a minute-accurate time for the last account email is
  // live sign-up traffic that anybody polling can watch.
  const now = Date.parse('2026-09-21T12:00:00Z');
  is(checks.roughly('2026-09-21T09:00:00Z', now), 'today', 'this morning is today');
  is(checks.roughly('2026-09-21T11:59:30Z', now), 'today', 'and so is thirty seconds ago, to the day and no closer');
  is(checks.roughly('2026-09-20T23:00:00Z', now), 'in the last week', 'last night is not today');
  is(checks.roughly('2026-09-16T12:00:00Z', now), 'in the last week', 'five days ago');
  is(checks.roughly('2026-09-01T12:00:00Z', now), 'more than a week ago', 'three weeks ago');
  is(checks.roughly('lunchtime', now), 'at some point', 'a date we cannot read');
}
{
  routeFetch([['/rest/v1/profiles', res(404, { code: 'PGRST205' })]]);
  const noTables = await checks.checkTables(globalThis.fetch, FULL);
  is(noTables.state, 'todo', 'no tables is something to do');
  has(noTables.say, 'SQL Editor', 'and it names the screen');

  const fine = routeFetch([['/rest/v1/profiles', res(200, [])]]);
  is((await checks.checkTables(globalThis.fetch, FULL)).state, 'ok', 'tables that answer are fine');
  is(fine[0].headers.apikey, 'sb_secret_demo', 'the secret key rides on the apikey header');
  is(fine[0].headers.authorization, undefined, 'and never as a bearer token');

  routeFetch([['/rest/v1/profiles', res(401, {})]]);
  is((await checks.checkTables(globalThis.fetch, FULL)).state, 'bad', 'a refused secret key is wrong');
  routeFetch([['/rest/v1/profiles', res(540, {})]]);
  has((await checks.checkTables(globalThis.fetch, FULL)).say, 'paused', 'a paused project is named here too');
}
{
  routeFetch([['/rest/v1/auth_email_log', res(200, [])]]);
  const never = await checks.checkHookFired(globalThis.fetch, FULL);
  is(never.state, 'todo', 'a hook that has never fired is something to do');
  has(never.say, 'never asked us', 'and it says so plainly');

  const asked = routeFetch([['/rest/v1/auth_email_log', res(200, [{ at: new Date(Date.now() - 4 * 60_000).toISOString(), action: 'signup', ok: true }])]]);
  const fired = await checks.checkHookFired(globalThis.fetch, FULL);
  is(fired.state, 'ok', 'a hook that fired and went out is fine');
  has(fired.say, 'went out', 'and it says that it went');
  hasnt(fired.say, 'minutes ago', 'without timing it to the minute for whoever is reading');
  has(asked[0].url, 'select=at,ok', 'it asks for the two columns it prints and no others');
  hasnt(asked[0].url, 'detail', 'never for the reason a provider refused us');

  routeFetch([['/rest/v1/auth_email_log', res(200, [{ at: new Date().toISOString(), action: 'signup', ok: false, detail: 'brevo: 401 key refused' }])]]);
  const broke = await checks.checkHookFired(globalThis.fetch, FULL);
  is(broke.state, 'bad', 'a failed send is wrong');
  has(broke.say, 'did not go out', 'and says so plainly');
  hasnt(broke.say, 'key refused', 'but never repeats what the email service said, on a public route');
  for (const fine of ['minutes ago', 'hours ago', 'days ago']) {
    hasnt(broke.say, fine, `and never says "${fine}"`);
  }

  routeFetch([['/rest/v1/auth_email_log', res(404, {})]]);
  is((await checks.checkHookFired(globalThis.fetch, FULL)).state, 'todo', 'no log table sends him back to the SQL step');
}
{
  routeFetch([['api.brevo.com/v3/senders', res(200, { senders: [{ email: 'account@wiserwalk.com', active: true }] })]]);
  is((await checks.checkSending(globalThis.fetch, FULL)).state, 'ok', 'a verified sender is fine');

  routeFetch([['api.brevo.com/v3/senders', res(200, { senders: [{ email: 'someone.else@wiserwalk.com', active: true }] })]]);
  const noSender = await checks.checkSending(globalThis.fetch, FULL);
  is(noSender.state, 'todo', 'no sender for our address is something to do');
  hasnt(noSender.say, 'account@wiserwalk.com', 'and it does not print the address back');

  routeFetch([['api.brevo.com/v3/senders', res(200, { senders: [{ email: 'account@wiserwalk.com', active: false }] })]]);
  is((await checks.checkSending(globalThis.fetch, FULL)).state, 'todo', 'an unverified sender is something to do');

  routeFetch([['api.brevo.com/v3/senders', res(401, {})]]);
  is((await checks.checkSending(globalThis.fetch, FULL)).state, 'bad', 'a refused key is wrong');

  is((await checks.checkSending(realFetch, { ...FULL, EMAIL_PREVIEW: '1' })).state, 'todo', 'preview mode is named, not counted as working');
  const nothing = await checks.checkSending(realFetch, { PUBLIC_SUPABASE_URL: 'https://demo.supabase.co' });
  is(nothing.state, 'bad', 'nothing to send with is wrong');
  has(nothing.say, 'nobody can finish signing up', 'and it says what that means for people');
}
{
  // Everything at once, against a world where nothing answers. The output is what a public
  // URL returns, so it must give away nothing whatever the state.
  routeFetch([]);
  const all = await checks.runChecks(globalThis.fetch, { ...FULL, RESEND_API_KEY: 'resend-demo' });
  is(all.length >= 8, true, `every check ran (${all.length})`);
  const printed = JSON.stringify(all);
  for (const secret of ['sb_publishable_demo', 'sb_secret_demo', 'whsec_', 'brevo-demo', 'resend-demo', 'account@wiserwalk.com']) {
    hasnt(printed, secret, `the checks never print ${secret.slice(0, 12)}`);
  }
  is(all.every(c => typeof c.say === 'string' && c.say.length > 10), true, 'every check says a whole sentence');
  is(all.every(c => ['ok', 'todo', 'bad'].includes(c.state)), true, 'every state is one of the three');
}
{
  is(checks.accountsReady({ PUBLIC_SUPABASE_URL: 'u', PUBLIC_SUPABASE_KEY: 'k' }), true, 'both values means ready');
  is(checks.accountsReady({ PUBLIC_SUPABASE_URL: 'u' }), false, 'one value does not');
  is(checks.accountsReady({ PUBLIC_SUPABASE_URL: '  ', PUBLIC_SUPABASE_KEY: 'k' }), false, 'whitespace is not a value');

  const req = o => new Request('https://wiserwalk.com/api/auth/list', { method: 'POST', headers: o });
  const here = new URL('https://wiserwalk.com/api/auth/list');
  is(checks.sameOrigin(req({ origin: 'https://wiserwalk.com' }), here), true, 'our own origin passes');
  is(checks.sameOrigin(req({ origin: 'https://evil.example.com' }), here), false, 'another origin does not');
  is(checks.sameOrigin(req({}), here), false, 'no origin at all does not');

  is(checks.bearerFrom(req({ authorization: 'Bearer abc.def' })), 'abc.def', 'a bearer token is read');
  is(checks.bearerFrom(req({ authorization: 'abc.def' })), '', 'a bare value is not a bearer token');
  is(checks.bearerFrom(req({})), '', 'no header is no token');

  const who = routeFetch([['/auth/v1/user', res(200, { id: 'u-1', email: 'reader@example.com' })]]);
  is(await checks.whoIs(globalThis.fetch, FULL, 'tok'), { id: 'u-1', email: 'reader@example.com' }, 'supabase says who it is');
  is(who[0].headers.apikey, 'sb_publishable_demo', 'the publishable key identifies the project');
  is(who[0].headers.authorization, 'Bearer tok', 'and the token says who');
  routeFetch([['/auth/v1/user', res(401, {})]]);
  is(await checks.whoIs(globalThis.fetch, FULL, 'tok'), null, 'a refused token is nobody');
  is(await checks.whoIs(globalThis.fetch, FULL, ''), null, 'no token is nobody, with no request made');
}

// -------------------------------------------------------- 6. the email hook route
console.log('6. /api/auth/email');
const HOOK_SECRET = 'v1,whsec_' + Buffer.from('a-test-secret-not-real').toString('base64');
const HOOK_ENV = {
  PUBLIC_SUPABASE_URL: 'https://demo.supabase.co',
  PUBLIC_SUPABASE_KEY: 'sb_publishable_demo',
  SUPABASE_SECRET_KEY: 'sb_secret_demo',
  SUPABASE_EMAIL_HOOK_SECRET: HOOK_SECRET,
  BREVO_API_KEY: 'brevo-demo',
  // Every variable this code path reads is named here, including the ones it must NOT
  // find, because readEnv merges the real process environment underneath and a key that
  // happens to be exported on this machine would quietly change what is under test.
  BREVO_LIST_ID: undefined,
  BREVO_DOI_TEMPLATE_ID: undefined,
  BREVO_DOI_REDIRECT: undefined,
  ACCOUNT_EMAIL_FROM: undefined,
  EMAIL_PREVIEW: undefined,
  RESEND_API_KEY: undefined,
  MAILERLITE_API_KEY: undefined,
  MAILERLITE_GROUP_ID: undefined,
  CRON_SECRET: undefined,
  PROD: true
};
const PAYLOAD = JSON.stringify({
  user: { id: 'u-1', email: 'reader@example.com' },
  email_data: { token: '483205', token_hash: 'HASH123', email_action_type: 'signup', site_url: 'https://wiserwalk.com' }
});

function hookRequest(body = PAYLOAD, { id = 'msg_1', ts = Math.floor(Date.now() / 1000), secret = HOOK_SECRET, unsigned = false } = {}) {
  const key = Buffer.from(secret.replace(/^v1,/, '').replace(/^whsec_/, ''), 'base64');
  const sig = 'v1,' + createHmac('sha256', key).update(`${id}.${ts}.${body}`).digest('base64');
  return new Request('https://wiserwalk.com/api/auth/email', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'webhook-id': id,
      'webhook-timestamp': String(ts),
      ...(unsigned ? {} : { 'webhook-signature': sig })
    },
    body
  });
}
/** What Astro hands a route: the request, the parsed URL, and the adapter's env bag. */
const ctx = (request, env) => ({ request, url: new URL(request.url), locals: { runtime: { env } }, params: {} });

const LOG_EMPTY = ['/rest/v1/auth_email_log', ({ method }) => (method === 'GET' ? res(200, []) : res(201, {}))];

{
  const r = await emailRoute.ALL();
  is(r.status, 405, 'anything but POST is refused');
  is(r.headers.get('allow'), 'POST', 'and it says what is allowed');
}
{
  routeFetch([]);
  const r = await emailRoute.POST(ctx(hookRequest(), { ...HOOK_ENV, PUBLIC_SUPABASE_URL: undefined, PUBLIC_SUPABASE_KEY: undefined }));
  is(r.status, 503, 'an unconfigured site says so');
  is((await r.json()).error, 'Accounts are not switched on yet.', 'in the same words the rest of the site uses');
  is(r.headers.get('cache-control'), 'no-store', 'and is never cached');
}
{
  routeFetch([]);
  const r = await emailRoute.POST(ctx(hookRequest(), { ...HOOK_ENV, SUPABASE_EMAIL_HOOK_SECRET: undefined }));
  is(r.status, 503, 'no hook secret is a configuration problem, not a bad request');
}
{
  const calls = routeFetch([LOG_EMPTY, ['api.brevo.com', res(201, { messageId: 'm-1' })]]);
  const r = await emailRoute.POST(ctx(hookRequest(PAYLOAD, { secret: 'v1,whsec_' + Buffer.from('wrong').toString('base64') }), HOOK_ENV));
  is(r.status, 401, 'a signature signed with the wrong secret is refused');
  is(at(calls, 'api.brevo.com').length, 0, 'and NOTHING is sent');
}
{
  const calls = routeFetch([LOG_EMPTY, ['api.brevo.com', res(201, { messageId: 'm-1' })]]);
  const r = await emailRoute.POST(ctx(hookRequest(PAYLOAD, { unsigned: true }), HOOK_ENV));
  is(r.status, 401, 'no signature at all is refused');
  is(at(calls, 'api.brevo.com').length, 0, 'and nothing is sent');
}
{
  const calls = routeFetch([LOG_EMPTY, ['api.brevo.com', res(201, { messageId: 'm-1' })]]);
  const r = await emailRoute.POST(ctx(hookRequest(), HOOK_ENV));
  is(r.status, 200, 'a signed request is accepted');
  is(await r.json(), { ok: true }, 'and reports that it went');

  const sends = at(calls, 'api.brevo.com');
  is(sends.length, 1, 'exactly one email');
  is(sends[0].body.to, [{ email: 'reader@example.com' }], 'to the address in the payload');
  is(sends[0].body.subject, 'Set your password for Wiser Walk', 'with the sign-up subject');
  has(sends[0].body.htmlContent, 'https://wiserwalk.com/account/password/?t=HASH123&amp;k=signup', 'and the link built from the token hash');

  const written = at(calls, '/rest/v1/auth_email_log').filter(c => c.method === 'POST');
  is(written.length, 1, 'one line written to the log');
  is(written[0].body[0].webhook_id, 'msg_1', 'keyed on the webhook id, so a retry cannot send twice');
  is(written[0].body[0].ok, true, 'recorded as sent');
  hasnt(JSON.stringify(written[0].body), 'reader@example.com', 'and the log holds no address');
  is(written[0].headers.apikey, 'sb_secret_demo', 'written with the secret key on the apikey header');
  is(written[0].headers.authorization, undefined, 'never as a bearer token');
}
{
  const calls = routeFetch([
    ['/rest/v1/auth_email_log', ({ method }) => (method === 'GET' ? res(200, [{ ok: true }]) : res(201, {}))],
    ['api.brevo.com', res(201, { messageId: 'm-2' })]
  ]);
  const r = await emailRoute.POST(ctx(hookRequest(), HOOK_ENV));
  is(r.status, 200, 'a retry of one we already sent is accepted');
  is(await r.json(), { ok: true, already: true }, 'and says it was already done');
  is(at(calls, 'api.brevo.com').length, 0, 'the same webhook id twice sends once');
}
{
  const calls = routeFetch([LOG_EMPTY, ['api.brevo.com', res(503, { code: 'unavailable' })]]);
  const r = await emailRoute.POST(ctx(hookRequest(), HOOK_ENV));
  is(r.status, 503, 'a busy email service answers 503, which is one of the two Supabase retries');
  const written = at(calls, '/rest/v1/auth_email_log').filter(c => c.method === 'POST');
  is(written[0].body[0].ok, false, 'and the attempt is recorded as failed');
}
{
  const calls = routeFetch([LOG_EMPTY, ['api.brevo.com', res(400, { code: 'not_enough_credits' })]]);
  const r = await emailRoute.POST(ctx(hookRequest(), HOOK_ENV));
  is(r.status, 200, 'a permanent refusal answers 200, because retrying it would end the same way');
  const written = at(calls, '/rest/v1/auth_email_log').filter(c => c.method === 'POST');
  is(written[0].body[0].ok, false, 'recorded as failed');
  has(written[0].body[0].detail, 'not_enough_credits', 'with the word the owner needs');
}
{
  const body = JSON.stringify({
    user: { id: 'u-1', email: 'reader@example.com' },
    email_data: { token: '1', token_hash: 'H', email_action_type: 'email_change' }
  });
  const calls = routeFetch([LOG_EMPTY, ['api.brevo.com', res(201, {})]]);
  const r = await emailRoute.POST(ctx(hookRequest(body), HOOK_ENV));
  is(r.status, 200, 'an action we do not handle never blocks the sign-in it belongs to');
  is(at(calls, 'api.brevo.com').length, 0, 'and nothing is sent');
  const written = at(calls, '/rest/v1/auth_email_log').filter(c => c.method === 'POST');
  is(written[0].body[0].action, 'email_change', 'the action is recorded by name');
  is(written[0].body[0].ok, false, 'as something that did not go, rather than a quiet success');
}
{
  const calls = routeFetch([LOG_EMPTY, ['api.brevo.com', res(201, {})]]);
  const r = await emailRoute.POST(ctx(hookRequest('{"nonsense":true}'), HOOK_ENV));
  is(r.status, 200, 'a payload we cannot read is still answered');
  is(at(calls, 'api.brevo.com').length, 0, 'and nothing is sent');
}
{
  const calls = routeFetch([LOG_EMPTY, ['api.brevo.com', res(201, {})]]);
  const r = await emailRoute.POST(ctx(hookRequest(), { ...HOOK_ENV, EMAIL_PREVIEW: '1' }));
  is(r.status, 200, 'preview mode answers normally');
  is(at(calls, 'api.brevo.com').length, 0, 'and sends nothing at all');
}
{
  // Supabase gives the whole invocation five seconds, cold start included, and a timeout is
  // neither a 429 nor a 503, so it is not retried: the reader gets the email and the sign-up
  // call reports a failure. The log is bookkeeping and must never be able to cause that.
  //
  // This stub never resolves AND never honours the abort signal, which is the case a
  // deadline built only on AbortController misses entirely.
  const sends = [];
  globalThis.fetch = async (input, init = {}) => {
    const url = typeof input === 'string' ? input : input.url;
    if (url.includes('/rest/v1/auth_email_log')) return new Promise(() => {});
    if (url.includes('api.brevo.com')) {
      sends.push(url);
      return res(201, { messageId: 'm-hang' });
    }
    return res(404, {});
  };

  const started = Date.now();
  const r = await emailRoute.POST(ctx(hookRequest(PAYLOAD, { id: 'msg_hang' }), HOOK_ENV));
  const took = Date.now() - started;

  is(r.status, 200, 'a log that never answers still reports the email as sent');
  is(sends.length, 1, 'and the email really went');
  if (took < 1500) ok(`answered in ${took}ms, well inside the five seconds Supabase allows`);
  else fail(`took ${took}ms, which is the failed sign-up this budget exists to prevent`);
}

// ------------------------------------------------------------- 7. the notes route
console.log('7. /api/auth/list');
const LIST_ENV = { ...HOOK_ENV, BREVO_LIST_ID: '7' };
const listRequest = (body, headers = {}) =>
  new Request('https://wiserwalk.com/api/auth/list', {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: 'https://wiserwalk.com', authorization: 'Bearer tok', ...headers },
    body: JSON.stringify(body)
  });
const WHO_OK = ['/auth/v1/user', res(200, { id: 'u-1', email: 'reader@example.com' })];

{
  const r = await listRoute.ALL();
  is(r.status, 405, 'anything but POST is refused');
}
{
  routeFetch([]);
  const r = await listRoute.POST(ctx(listRequest({ on: true }), { ...LIST_ENV, PUBLIC_SUPABASE_URL: undefined }));
  is(r.status, 503, 'an unconfigured site says so');
}
{
  const calls = routeFetch([WHO_OK]);
  const r = await listRoute.POST(ctx(listRequest({ on: true }, { origin: 'https://evil.example.com' }), LIST_ENV));
  is(r.status, 403, 'a request from another origin is refused');
  is(calls.length, 0, 'before anything is asked of anybody');
}
{
  routeFetch([['/auth/v1/user', res(401, {})]]);
  const r = await listRoute.POST(ctx(listRequest({ on: true }), LIST_ENV));
  is(r.status, 401, 'a token Supabase does not recognise is refused');
}
{
  const calls = routeFetch([WHO_OK, ['api.brevo.com/v3/contacts', res(201, {})], ['/rest/v1/profiles', res(204, {})]]);
  const r = await listRoute.POST(ctx(listRequest({ on: true, email: 'someone.else@example.com' }), LIST_ENV));
  is(r.status, 200, 'switching the notes on works');
  const contact = at(calls, 'api.brevo.com/v3/contacts')[0];
  is(contact.body.email, 'reader@example.com', 'the address comes from the token, NEVER from the body');
  is(contact.body.attributes.SOURCE, 'account', 'and is marked as having come from an account');
  is(contact.body.listIds, [7], 'onto the one list');
  const stamped = at(calls, '/rest/v1/profiles')[0];
  is(stamped.method, 'PATCH', 'the profile is stamped');
  is(Object.keys(stamped.body), ['list_synced_at'], 'with the one column the person cannot write themselves');
  is(stamped.headers.apikey, 'sb_secret_demo', 'using the secret key on the apikey header');
}
{
  const calls = routeFetch([WHO_OK, ['contacts/remove', res(204, {})], ['/rest/v1/profiles', res(204, {})]]);
  const r = await listRoute.POST(ctx(listRequest({ on: false }), LIST_ENV));
  is(r.status, 200, 'switching the notes off works');
  const removed = at(calls, 'contacts/remove')[0];
  is(removed.url, 'https://api.brevo.com/v3/contacts/lists/7/contacts/remove', 'off means off the list');
  is(removed.body, { emails: ['reader@example.com'] }, 'for the address on the token');
  is(at(calls, 'api.brevo.com/v3/contacts').filter(c => c.method === 'POST' && !c.url.includes('remove')).length, 0, 'and nobody is added');
}
{
  const calls = routeFetch([WHO_OK]);
  const r = await listRoute.POST(ctx(listRequest({ on: true, website: 'https://spam.example' }), LIST_ENV));
  is(r.status, 200, 'the honeypot gets the same cheerful answer a person gets');
  is(calls.length, 0, 'and nothing is asked of anybody');
}
{
  routeFetch([WHO_OK, ['api.brevo.com/v3/contacts', res(503, {})]]);
  const r = await listRoute.POST(ctx(listRequest({ on: true }), LIST_ENV));
  is(r.status, 503, 'a busy email service is worth trying again');
}

// ------------------------------------------------------------ 8. the delete route
console.log('8. /api/auth/delete');
const deleteRequest = (headers = {}) =>
  new Request('https://wiserwalk.com/api/auth/delete', {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: 'https://wiserwalk.com', authorization: 'Bearer tok', ...headers }
  });
{
  const r = await deleteRoute.ALL();
  is(r.status, 405, 'anything but POST is refused');
}
{
  const calls = routeFetch([]);
  const r = await deleteRoute.POST(ctx(deleteRequest({ origin: 'https://evil.example.com' }), LIST_ENV));
  is(r.status, 403, 'a request from another origin is refused');
  is(calls.length, 0, 'before anything is deleted');
}
{
  routeFetch([['/auth/v1/user', res(401, {})]]);
  const r = await deleteRoute.POST(ctx(deleteRequest(), LIST_ENV));
  is(r.status, 401, 'a token Supabase does not recognise deletes nothing');
}
{
  const calls = routeFetch([WHO_OK]);
  const r = await deleteRoute.POST(ctx(deleteRequest(), { ...LIST_ENV, SUPABASE_SECRET_KEY: undefined }));
  is(r.status, 503, 'with no secret key it refuses rather than pretending');
  has((await r.json()).error, 'Nothing was deleted', 'and says plainly that nothing happened');
  is(at(calls, '/admin/users').length, 0, 'nothing was asked of Supabase');
}
{
  const calls = routeFetch([WHO_OK, ['/admin/users/', res(200, {})], ['api.brevo.com', res(204, {})]]);
  const r = await deleteRoute.POST(ctx(deleteRequest(), LIST_ENV));
  is(r.status, 200, 'deleting works');
  is(await r.json(), { ok: true, listRemoved: true }, 'and says the list was cleared too');
  const admin = at(calls, '/admin/users/')[0];
  is(admin.url, 'https://demo.supabase.co/auth/v1/admin/users/u-1', 'the user id comes from the token, never from the body');
  is(admin.method, 'DELETE', 'method');
  is(admin.headers.apikey, 'sb_secret_demo', 'the secret key rides on the apikey header');
  is(admin.headers.authorization, undefined, 'and NEVER as a bearer token');
  const forgotten = at(calls, 'api.brevo.com')[0];
  is(forgotten.method, 'DELETE', 'the contact is deleted outright');
  has(forgotten.url, 'reader%40example.com', 'for the address on the token');
}
{
  routeFetch([WHO_OK, ['/admin/users/', res(404, {})], ['api.brevo.com', res(404, {})]]);
  const r = await deleteRoute.POST(ctx(deleteRequest(), LIST_ENV));
  is(r.status, 200, 'an account that is already gone is the state that was asked for');
}
{
  routeFetch([WHO_OK, ['/admin/users/', res(401, {})]]);
  const r = await deleteRoute.POST(ctx(deleteRequest(), LIST_ENV));
  is(r.status, 500, 'a refused secret key is our fault');
  has((await r.json()).error, 'Nothing was deleted', 'and nothing is claimed to have happened');
}
{
  const calls = routeFetch([WHO_OK, ['/admin/users/', res(204, {})], ['api.brevo.com', res(503, {})]]);
  const r = await deleteRoute.POST(ctx(deleteRequest(), LIST_ENV));
  is(await r.json(), { ok: true, listRemoved: false }, 'the account going and the list failing are reported separately');
  is(at(calls, '/admin/users/').length, 1, 'the account really was deleted');
}
{
  routeFetch([WHO_OK, ['/admin/users/', res(204, {})], ['api.brevo.com', res(401, { code: 'unauthorized' })]]);
  const r = await deleteRoute.POST(ctx(deleteRequest(), LIST_ENV));
  is(await r.json(), { ok: true, listRemoved: false }, 'a key the email service refuses is not a removal either');
}
{
  // The stand-in provider reports success for everything it is asked to do, because it
  // exists so the pages can be exercised with no keys set. Reading that as a removal would
  // have the page tell somebody their address is off a list nothing ever spoke to.
  //
  // Nor is it a FAILED removal, which is the other way to get this wrong and the state the
  // site is actually in today: no key is set, so nobody was ever subscribed, so there is no
  // address left on any list to warn them about. The route says nothing rather than `false`,
  // and the page reads a missing field as "no problem". These two are exact-shape checks:
  // a `listRemoved` of either value appearing here is a failure.
  const calls = routeFetch([WHO_OK, ['/admin/users/', res(204, {})]]);
  const r = await deleteRoute.POST(
    ctx(deleteRequest(), { ...LIST_ENV, BREVO_API_KEY: undefined, MAILERLITE_API_KEY: undefined })
  );
  is(await r.json(), { ok: true }, 'with no email service configured there is no list to report on');
  is(at(calls, 'api.brevo.com').length, 0, 'and nothing was asked of one');
}
{
  routeFetch([WHO_OK, ['/admin/users/', res(204, {})]]);
  const r = await deleteRoute.POST(ctx(deleteRequest(), { ...LIST_ENV, EMAIL_PREVIEW: '1' }));
  is(await r.json(), { ok: true }, 'preview mode removes nobody, and does not claim a failure either');
}

// ------------------------------------------------------------ 9. the health route
console.log('9. /api/auth/health');
{
  const r = await healthRoute.ALL();
  is(r.status, 405, 'anything but GET is refused');
  is(r.headers.get('allow'), 'GET', 'and it says what is allowed');
}
{
  routeFetch([]);
  const request = new Request('https://wiserwalk.com/api/auth/health');
  const r = await healthRoute.GET(ctx(request, HOOK_ENV));
  is(r.status, 200, 'the health page always gets an answer, because saying what is missing is its job');
  // The report is public on purpose: the owner needs it before there is an account to check
  // him against. Two minutes at the edge is what stops a loop turning one request into four
  // outbound ones against Supabase and the email service.
  is(r.headers.get('cache-control'), 'public, s-maxage=120, max-age=0', 'the report is cached at the edge');
  const body = await r.json();
  is(Array.isArray(body.checks), true, 'it returns a list of checks');
  is(body.checks.length >= 8, true, `all of them (${body.checks.length})`);
  hasnt(JSON.stringify(body), 'sb_secret_demo', 'and never the secret key');
}
{
  // What a stranger actually reads. This is a public URL, so what the report is willing to
  // say is part of the security of the feature, not a detail of the page that prints it.
  routeFetch([
    ['/auth/v1/health', res(200, {})],
    ['/rest/v1/profiles', res(200, [])],
    [
      '/rest/v1/auth_email_log',
      res(200, [{ at: new Date(Date.now() - 4 * 60_000).toISOString(), ok: false, detail: 'brevo: 401 key refused' }])
    ],
    ['api.brevo.com', res(200, { senders: [] })]
  ]);
  const r = await healthRoute.GET(ctx(new Request('https://wiserwalk.com/api/auth/health'), HOOK_ENV));
  const printed = JSON.stringify(await r.json());
  hasnt(printed, 'key refused', 'the report never repeats the reason the email service refused us');
  for (const fine of ['minutes ago', 'hours ago', 'days ago', 'less than a minute ago']) {
    hasnt(printed, fine, `and nothing in it says "${fine}"`);
  }
}
{
  const calls = routeFetch([['/rest/v1/', ({ method }) => res(method === 'DELETE' ? 204 : 200, [])]]);
  const request = new Request('https://wiserwalk.com/api/auth/health?ping=1');
  const r = await healthRoute.GET(ctx(request, HOOK_ENV));
  is(r.status, 200, 'the keep-alive answers');
  is(r.headers.get('cache-control'), 'no-store', 'and is never cached');
  is(await r.json(), { ok: true, read: true, trimmed: true }, 'and says what it did');

  const read = calls.filter(c => c.method === 'GET');
  is(read.length, 1, 'one real read, which is what keeps a free project awake');
  is(read[0].headers.apikey, 'sb_secret_demo', 'with the secret key on the apikey header');

  const trim = calls.filter(c => c.method === 'DELETE');
  is(trim.length, 2, 'two sweeps of tables that otherwise only grow');
  has(trim.find(c => c.url.includes('auth_email_log')).url, 'at=lt.', 'the email log, older than the cutoff');
  is(checks.LOG_KEEP_DAYS, 60, 'which is sixty days');
  // `deleted_at=lt.<date>` cannot match a null, so a result somebody still has is safe: only
  // the markers left behind by "clear my results" are dated at all.
  const swept = trim.find(c => c.url.includes('/results'));
  has(swept.url, 'deleted_at=lt.', 'and the markers left by cleared results, never a live one');
  is(checks.TOMBSTONE_KEEP_DAYS, 90, 'which are kept ninety days');
  is(calls.some(c => c.url.includes('api.brevo.com')), false, 'the keep-alive asks nothing of the email service');
}
{
  // A loop on the ping used to be a select and a delete each time. One real run per
  // instance per ten minutes; everything else gets a cheap, honest answer.
  const calls = routeFetch([['/rest/v1/', ({ method }) => res(method === 'DELETE' ? 204 : 200, [])]]);
  const r = await healthRoute.GET(ctx(new Request('https://wiserwalk.com/api/auth/health?ping=1'), HOOK_ENV));
  is(r.status, 200, 'a second keep-alive inside ten minutes still answers');
  is(await r.json(), { ok: true, skipped: true }, 'and says it did nothing');
  is(calls.length, 0, 'nothing at all is asked of Supabase');
  is(healthRoute.PING_EVERY_MS, 600_000, 'the window is ten minutes');
}
{
  // Vercel sends `Authorization: Bearer <CRON_SECRET>` on its own cron calls. A fresh
  // instance, because the throttle above belongs to the module rather than to the request.
  const gated = await bundle('src/pages/api/auth/health.ts', 'route-health-cron', BUILT_ENV);
  const GATED = { ...HOOK_ENV, CRON_SECRET: 'cron-not-real' };
  const pingWith = headers =>
    ctx(new Request('https://wiserwalk.com/api/auth/health?ping=1', { headers }), GATED);

  let calls = routeFetch([['/rest/v1/', ({ method }) => res(method === 'DELETE' ? 204 : 200, [])]]);
  let r = await gated.GET(pingWith({}));
  is(r.status, 404, 'with CRON_SECRET set, no header is told the route is not there');
  is(calls.length, 0, 'and nothing is run');

  calls = routeFetch([['/rest/v1/', ({ method }) => res(method === 'DELETE' ? 204 : 200, [])]]);
  r = await gated.GET(pingWith({ authorization: 'Bearer wrong-secret-x' }));
  is(r.status, 404, 'a wrong secret gets the same answer, which gives nothing away');
  is(calls.length, 0, 'and nothing is run');

  calls = routeFetch([['/rest/v1/', ({ method }) => res(method === 'DELETE' ? 204 : 200, [])]]);
  r = await gated.GET(pingWith({ authorization: 'Bearer cron-not-real' }));
  is(r.status, 200, 'the real secret gets in');
  is(await r.json(), { ok: true, read: true, trimmed: true }, 'and the keep-alive runs');

  // The report itself stays public, gate or no gate: the owner reads it before there is an
  // account to check him against, so there is nobody to check.
  routeFetch([]);
  const report = await gated.GET(ctx(new Request('https://wiserwalk.com/api/auth/health'), GATED));
  is(report.status, 200, 'the report is not behind the gate');
}
{
  // With no CRON_SECRET set the keep-alive stays open, because one that quietly stops
  // working is a worse outcome than one a stranger can trigger, and the throttle bounds it.
  const open = await bundle('src/pages/api/auth/health.ts', 'route-health-open', BUILT_ENV);
  routeFetch([['/rest/v1/', ({ method }) => res(method === 'DELETE' ? 204 : 200, [])]]);
  const r = await open.GET(ctx(new Request('https://wiserwalk.com/api/auth/health?ping=1'), HOOK_ENV));
  is(r.status, 200, 'no secret set means no gate');
  is((await r.json()).ok, true, 'and the keep-alive runs');
}

globalThis.fetch = realFetch;
for (const file of built) rmSync(file, { force: true });

console.log(failures === 0 ? '\nauth: all checks passed' : `\nauth: ${failures} FAILED`);
process.exit(failures === 0 ? 0 : 1);
