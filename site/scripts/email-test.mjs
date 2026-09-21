/**
 * Headless check of the email providers. Bundles src/lib/email/provider.ts with esbuild
 * and drives it against a stubbed `fetch`, so the request that would go to Brevo is
 * asserted field by field without a byte leaving the machine. Run with `npm run test`.
 *
 * Nothing here touches the network, and no test uses a real key: the one thing this file
 * must never do is turn into a live sign-up.
 */
import { build } from 'esbuild';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(here, '..');
const OUT = resolve(ROOT, 'node_modules/.email-test.mjs');

await build({
  entryPoints: [resolve(ROOT, 'src/lib/email/provider.ts')],
  outfile: OUT,
  bundle: true,
  format: 'esm',
  platform: 'node',
  target: 'node18',
  logLevel: 'silent'
});

const { brevo, getProvider, isConfigured, looksLikeEmail } = await import(pathToFileURL(OUT).href);

let failures = 0;
const fail = m => { failures++; console.log('  FAIL ' + m); };
const ok = m => console.log('  ok   ' + m);
const is = (actual, expected, what) =>
  JSON.stringify(actual) === JSON.stringify(expected)
    ? ok(`${what}: ${JSON.stringify(actual)}`)
    : fail(`${what}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);

/** Replaces global fetch for one call and records what it was asked to send. */
function stub(handler) {
  const calls = [];
  globalThis.fetch = async (url, init) => {
    calls.push({ url, init, body: init?.body ? JSON.parse(init.body) : undefined });
    return handler({ url, init });
  };
  return calls;
}
const reply = (status, body) => ({
  status,
  json: async () => {
    if (body === undefined) throw new Error('no body');
    return body;
  }
});

const SUB = {
  email: 'reader@example.com',
  quiz: 'theology-compass',
  code: '01VJSE',
  headline: 'Monergist-leaning, sacramental-leaning'
};

const realFetch = globalThis.fetch;

// ------------------------------------------------------------ 1. the plain request
console.log('1. brevo, plain');
{
  const calls = stub(() => reply(201, { id: 42 }));
  const out = await brevo('key-not-real', { listId: 7 }).subscribe(SUB);

  is(calls.length, 1, 'one request');
  is(calls[0].url, 'https://api.brevo.com/v3/contacts', 'endpoint');
  is(calls[0].init.method, 'POST', 'method');
  is(calls[0].init.headers['api-key'], 'key-not-real', 'api-key header');
  is(calls[0].body, {
    email: 'reader@example.com',
    updateEnabled: true,
    listIds: [7],
    attributes: {
      QUIZ: 'theology-compass',
      RESULT_CODE: '01VJSE',
      RESULT_HEADLINE: 'Monergist-leaning, sacramental-leaning'
    }
  }, 'body');
  is(out, { ok: true, already: false }, '201 is a new contact');

  // The key must not travel anywhere but that one header.
  const printed = JSON.stringify({ url: calls[0].url, body: calls[0].body });
  if (printed.includes('key-not-real')) fail('the key appears outside the header');
  else ok('the key appears in no url and no body');
}

// ---------------------------------------------------- 2. attributes that are absent
console.log('2. brevo, an address on its own');
{
  const calls = stub(() => reply(201, { id: 43 }));
  await brevo('k', {}).subscribe({ email: 'reader@example.com' });
  is(calls[0].body, { email: 'reader@example.com', updateEnabled: true }, 'no empty attributes, no listIds');
}

// -------------------------------------------------------------- 3. double opt-in
console.log('3. brevo, double opt-in');
{
  const calls = stub(() => reply(204, undefined));
  const out = await brevo('k', {
    listId: 7,
    doiTemplateId: 3,
    doiRedirect: 'https://wiserwalk.com/?sub=confirmed'
  }).subscribe(SUB);

  is(calls[0].url, 'https://api.brevo.com/v3/contacts/doubleOptinConfirmation', 'endpoint');
  is(calls[0].body, {
    email: 'reader@example.com',
    includeListIds: [7],
    templateId: 3,
    redirectionUrl: 'https://wiserwalk.com/?sub=confirmed',
    attributes: {
      QUIZ: 'theology-compass',
      RESULT_CODE: '01VJSE',
      RESULT_HEADLINE: 'Monergist-leaning, sacramental-leaning'
    }
  }, 'body');
  // 204 here means "the confirmation mail is on its way", which is not "already on the
  // list" — telling a new reader nothing has changed would be wrong.
  is(out, { ok: true, already: false }, '204 after a DOI request is a fresh sign-up');
}
{
  const calls = stub(() => reply(204, undefined));
  await brevo('k', { doiTemplateId: 3 }).subscribe({ email: 'reader@example.com' });
  is(calls[0].body.redirectionUrl, 'https://wiserwalk.com/?sub=confirmed', 'a redirect is always sent');
  is(calls[0].body.includeListIds, [], 'no list means an empty list, not a missing field');
}

// ------------------------------------------------------------ 4. already a contact
console.log('4. brevo, already on the list');
{
  stub(() => reply(204, undefined));
  is(await brevo('k', { listId: 7 }).subscribe(SUB), { ok: true, already: true }, '204 is an update');
}
{
  stub(() => reply(400, { code: 'duplicate_parameter', message: 'Contact already exist' }));
  is(await brevo('k', { listId: 7 }).subscribe(SUB), { ok: true, already: true }, '400 duplicate_parameter is not a failure');
}
{
  stub(() => reply(400, { code: 'invalid_parameter', message: 'Invalid email address' }));
  is(
    await brevo('k', { listId: 7 }).subscribe(SUB),
    { ok: false, retryable: false, message: 'That address was not accepted.' },
    'any other 400 is refused, not retried'
  );
}

// ------------------------------------------------------------------- 5. a bad key
console.log('5. brevo, failures');
{
  stub(() => reply(401, { code: 'unauthorized' }));
  const out = await brevo('k', { listId: 7 }).subscribe(SUB);
  is(out.ok, false, '401 fails');
  is(out.retryable, false, '401 is not worth retrying');
  if (out.message.includes('our fault')) ok('401 blames us, not the reader');
  else fail('401 message blames the reader: ' + out.message);
}
{
  stub(() => reply(503, { code: 'unavailable' }));
  is(
    await brevo('k').subscribe(SUB),
    { ok: false, retryable: true, message: 'The email service is busy. Try again shortly.' },
    '503 is retryable'
  );
}
{
  stub(() => reply(429, { code: 'too_many_requests' }));
  is((await brevo('k').subscribe(SUB)).retryable, true, '429 is retryable');
}

// ------------------------------------------------------------------ 6. the deadline
console.log('6. brevo, the deadline');
{
  // A provider that never answers. The stub honours the abort signal, which is the only
  // thing that can end this call — if the timeout is ever dropped, this test hangs.
  let sawSignal = false;
  globalThis.fetch = (url, init) =>
    new Promise((_, reject) => {
      sawSignal = Boolean(init?.signal);
      init.signal.addEventListener('abort', () => reject(new Error('aborted')));
    });

  const started = Date.now();
  const out = await brevo('k', { listId: 7, timeoutMs: 40 }).subscribe(SUB);
  const took = Date.now() - started;

  is(sawSignal, true, 'the request carries an abort signal');
  is(out, { ok: false, retryable: true, message: 'Could not reach the email service.' }, 'a timeout is retryable');
  if (took < 2000) ok(`gave up after ${took}ms rather than hanging`);
  else fail(`waited ${took}ms`);
}
{
  globalThis.fetch = async () => { throw new TypeError('fetch failed'); };
  is(
    await brevo('k').subscribe(SUB),
    { ok: false, retryable: true, message: 'Could not reach the email service.' },
    'a dead network is retryable'
  );
}

// -------------------------------------------------------------- 7. which provider
console.log('7. provider choice');
{
  globalThis.fetch = realFetch;
  is(getProvider({ BREVO_API_KEY: 'k' }).id, 'brevo', 'a Brevo key wins');
  is(getProvider({ BREVO_API_KEY: 'k', BREVO_DOI_TEMPLATE_ID: '3' }).id, 'brevo-doi', 'a DOI template switches mode');
  is(getProvider({ BREVO_API_KEY: 'k', MAILERLITE_API_KEY: 'm' }).id, 'brevo', 'Brevo beats MailerLite');
  is(getProvider({ MAILERLITE_API_KEY: 'm' }).id, 'mailerlite', 'MailerLite still works on its own');
  is(getProvider({}).id, 'console', 'no key subscribes nobody');
  is(getProvider({ EMAIL_PREVIEW: '1', BREVO_API_KEY: 'k' }).id, 'console', 'EMAIL_PREVIEW beats a real key');
  is(getProvider({ BREVO_API_KEY: '   ' }).id, 'console', 'a blank key is no key');

  is(isConfigured({ BREVO_API_KEY: 'k' }), true, 'a Brevo key shows the form');
  is(isConfigured({ MAILERLITE_API_KEY: 'm' }), true, 'a MailerLite key shows the form');
  is(isConfigured({}), false, 'nothing set hides the form');
}

// ----------------------------------------------- 8. a list id that is not a number
console.log('8. a list id that is not a number');
{
  const calls = stub(() => reply(201, { id: 44 }));
  await getProvider({ BREVO_API_KEY: 'k', BREVO_LIST_ID: 'the-list' }).subscribe(SUB);
  is(calls[0].body.listIds, undefined, 'junk is dropped rather than sent as a list id');
}
{
  const calls = stub(() => reply(201, { id: 45 }));
  await getProvider({ BREVO_API_KEY: 'k', BREVO_LIST_ID: ' 12 ' }).subscribe(SUB);
  is(calls[0].body.listIds, [12], 'a padded number still reads as one');
}

// ------------------------------------------------------------ 9. the address check
console.log('9. what counts as an address');
{
  globalThis.fetch = realFetch;
  for (const good of ['a@b.co', 'reader+tag@example.com']) {
    if (looksLikeEmail(good)) ok(`accepts ${good}`);
    else fail(`rejects ${good}`);
  }
  for (const bad of ['', 'reader', 'reader@', '@example.com', 'a b@example.com', 'a@b@c.com', 'a@b', 42, null]) {
    if (!looksLikeEmail(bad)) ok(`rejects ${JSON.stringify(bad)}`);
    else fail(`accepts ${JSON.stringify(bad)}`);
  }
}

console.log(failures === 0 ? '\nemail: all checks passed' : `\nemail: ${failures} FAILED`);
process.exit(failures === 0 ? 0 : 1);
