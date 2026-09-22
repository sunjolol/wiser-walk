/**
 * Headless check of the account library. Bundles each module with esbuild and drives it
 * against a fake storage object and a stubbed `fetch`, so every request that would go to
 * Supabase is asserted field by field without a byte leaving the machine.
 *
 * Nothing here touches the network, no test uses a real key, and the Supabase SDK is marked
 * external so that no code path can quietly load it: the whole point of this library is that
 * it works from the stored session alone.
 *
 * Run with `node scripts/account-test.mjs`.
 */
import { build } from 'esbuild';
import { rmSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(here, '..');
const built = [];

/** One module, bundled to a temp file under node_modules and imported back. */
async function bundle(name, entry, define = undefined, options = {}) {
  const out = resolve(ROOT, `node_modules/.account-test-${name}.mjs`);
  await build({
    entryPoints: [resolve(ROOT, entry)],
    outfile: out,
    bundle: true,
    format: 'esm',
    platform: 'node',
    target: 'node18',
    logLevel: 'silent',
    // Never bundled, never loaded: if a test ever reaches for it, that is the bug.
    external: ['@supabase/supabase-js'],
    define,
    ...options
  });
  built.push(out);
  return import(pathToFileURL(out).href);
}

/**
 * A stand-in for the SDK, so the calls client.ts makes through it can be checked.
 *
 * It is written to disk and resolved in place of `@supabase/supabase-js` for one bundle
 * only. Every answer comes from `globalThis.__sdk`, which a test sets before it calls, and
 * every call is recorded in `globalThis.__sdkCalls`, so a test reads as the conversation it
 * is. What it cannot prove is the HTTP request the real SDK would build from these calls;
 * it proves the call, which is the part this repository writes.
 */
const FAKE_SDK = resolve(ROOT, 'node_modules/.account-test-fake-sdk.mjs');
writeFileSync(
  FAKE_SDK,
  `const plan = () => globalThis.__sdk || {};
const note = call => { (globalThis.__sdkCalls || (globalThis.__sdkCalls = [])).push(call); };

function table(name) {
  const q = {
    select(columns) { note({ table: name, op: 'select', columns }); return q; },
    eq(column, value) { note({ table: name, op: 'eq', column, value }); return q; },
    async maybeSingle() { return { data: plan().profile || null, error: plan().profileError || null }; },
    async upsert(values, options) {
      note({ table: name, op: 'upsert', values, options });
      return { data: null, error: plan().upsertError || null };
    }
  };
  return q;
}

export function createClient(url, key, options) {
  note({ op: 'createClient', url, key, storageKey: options && options.auth && options.auth.storageKey });
  return {
    auth: {
      async getUser() {
        return plan().getUser
          ? plan().getUser()
          : { data: { user: null }, error: { name: 'AuthSessionMissingError', code: 'session_not_found', status: 400 } };
      },
      async getSession() { return plan().getSession ? plan().getSession() : { data: { session: null } }; },
      async updateUser(attributes) {
        note({ op: 'updateUser', attributes });
        return plan().updateUser ? plan().updateUser(attributes) : { data: { user: null }, error: null };
      },
      async signOut(o) { note({ op: 'signOut', scope: o && o.scope }); return {}; },
      async verifyOtp(params) {
        note({ op: 'verifyOtp', params });
        return plan().verifyOtp ? plan().verifyOtp(params) : { error: null };
      }
    },
    async rpc(name) { note({ op: 'rpc', name }); return { error: null }; },
    from: table
  };
}
`
);
built.push(FAKE_SDK);

const fakeSdkPlugin = {
  name: 'fake-supabase',
  setup(b) {
    b.onResolve({ filter: /^@supabase\/supabase-js$/ }, () => ({ path: FAKE_SDK }));
  }
};

const READY = {
  'import.meta.env.PUBLIC_SUPABASE_URL': '"https://test-project.supabase.co"',
  'import.meta.env.PUBLIC_SUPABASE_KEY': '"sb_publishable_not_real"',
  'import.meta.env.PUBLIC_ACCOUNT_LINKS': '""',
  'import.meta.env.DEV': 'false'
};

/** The same project, built for a Vercel preview, for production, and for a dev machine. */
const PREVIEW = { ...READY, __WW_VERCEL_ENV__: '"preview"' };
const PRODUCTION = { ...READY, __WW_VERCEL_ENV__: '"production"' };
const DEV_LINKS = {
  ...READY,
  'import.meta.env.PUBLIC_ACCOUNT_LINKS': '"1"',
  'import.meta.env.DEV': 'true'
};

const shelf = await bundle('shelf', 'src/lib/shelf.ts');
const merge = await bundle('merge', 'src/lib/account/merge.ts');
const session = await bundle('session', 'src/lib/account/session.ts');
const configOff = await bundle('config-off', 'src/lib/account/config.ts');
const configOn = await bundle('config-on', 'src/lib/account/config.ts', READY);
const configPreview = await bundle('config-preview', 'src/lib/account/config.ts', PREVIEW);
const configProd = await bundle('config-prod', 'src/lib/account/config.ts', PRODUCTION);
const configDev = await bundle('config-dev', 'src/lib/account/config.ts', DEV_LINKS);
const sync = await bundle('sync', 'src/lib/account/sync.ts');
const clientOff = await bundle('client-off', 'src/lib/account/client.ts');
const clientOn = await bundle('client-on', 'src/lib/account/client.ts', READY);
// The one bundle that may load a client: a fake one, resolved in place of the SDK.
const clientSdk = await bundle('client-sdk', 'src/lib/account/client.ts', READY, {
  external: [],
  plugins: [fakeSdkPlugin]
});

let failures = 0;
const fail = m => { failures++; console.log('  FAIL ' + m); };
const ok = m => console.log('  ok   ' + m);
const is = (actual, expected, what) =>
  JSON.stringify(actual) === JSON.stringify(expected)
    ? ok(`${what}: ${JSON.stringify(actual)}`)
    : fail(`${what}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
const yes = (cond, what) => (cond ? ok(what) : fail(what));

/** Storage, faked: any key, plus a way to look at what was written. */
function fakeStore(initial = {}) {
  const data = new Map(Object.entries(initial));
  return {
    getItem: k => (data.has(k) ? data.get(k) : null),
    setItem: (k, v) => { data.set(k, String(v)); },
    removeItem: k => { data.delete(k); },
    keys: () => [...data.keys()],
    peek: k => (data.has(k) ? data.get(k) : null)
  };
}

/** A store that refuses everything, the way a locked-down browser does. */
const brokenStore = {
  getItem() { throw new Error('blocked'); },
  setItem() { throw new Error('blocked'); },
  removeItem() { throw new Error('blocked'); }
};

const NOW = Date.parse('2026-09-21T12:00:00Z');
const now = () => NOW;
const iso = ms => new Date(ms).toISOString();

const URL_BASE = 'https://test-project.supabase.co';
const KEY = 'sb_publishable_not_real';
const USER = '11111111-2222-3333-4444-555555555555';

/** A live session, exactly the shape supabase-js writes under its storage key. */
const liveAuth = (secondsLeft = 3600) =>
  JSON.stringify({
    access_token: 'token-abc',
    refresh_token: 'refresh-xyz',
    expires_at: Math.floor(NOW / 1000) + secondsLeft,
    token_type: 'bearer',
    user: { id: USER, email: 'reader@example.com' }
  });

/** A fake Response. `headers.get` is there because the live count is read from a header. */
const res = (status, body, headers = {}) => ({
  status,
  headers: { get: name => headers[name.toLowerCase()] ?? null },
  json: async () => {
    if (body === undefined) throw new Error('no body');
    return body;
  }
});

/**
 * A fetch that records what it was asked to send and answers from a handler. The handler
 * sees the path after /rest/v1/ so the tests read as the requests they are.
 */
function fakeFetch(handler) {
  const calls = [];
  const fn = async (url, init = {}) => {
    const path = String(url).startsWith(`${URL_BASE}/rest/v1/`)
      ? String(url).slice(`${URL_BASE}/rest/v1/`.length)
      : String(url);
    const call = {
      url: String(url),
      path,
      method: init.method ?? 'GET',
      headers: init.headers ?? {},
      body: init.body ? JSON.parse(init.body) : undefined
    };
    calls.push(call);
    return handler(call) ?? res(200, []);
  };
  fn.calls = calls;
  return fn;
}

const deps = (store, fetch, extra = {}) => ({
  store,
  fetch,
  url: URL_BASE,
  key: KEY,
  now,
  refresh: async () => null,
  ...extra
});

// ------------------------------------------------------------- 1. merging shelves
console.log('1. two shelves become one');
{
  const { mergeShelves, SHELF_CAP, SAME_RUN_MS } = shelf;
  const e = (quiz, code, at) => ({ quiz, code, at });
  const set = list => list.map(x => `${x.quiz}/${x.code}/${x.at}`).sort().join(',');

  const a = [e('theology-compass', 'AAA', '2026-09-20T10:00:00.000Z')];
  const b = [e('bible-figure', 'BBB', '2026-09-19T10:00:00.000Z')];

  is(mergeShelves(a, b).map(x => x.code), ['AAA', 'BBB'], 'a union, newest first');
  yes(set(mergeShelves(a, b)) === set(mergeShelves(b, a)), 'the same set whichever way round');
  yes(
    set(mergeShelves(mergeShelves(a, b), b)) === set(mergeShelves(a, b)),
    'merging the same side twice changes nothing'
  );

  // a tombstone wins over both sides
  {
    const gone = [e('theology-compass', 'AAA', '2026-09-20T10:00:00.000Z')];
    is(mergeShelves(a, a, gone), [], 'a deleted result does not come back');
    // and it kills a near-miss of the same finish, not only an exact instant
    const nearby = [e('theology-compass', 'AAA', '2026-09-20T10:00:30.000Z')];
    is(mergeShelves(nearby, [], gone), [], 'a deleted result stays deleted 30 seconds either side');
    const later = [e('theology-compass', 'AAA', '2026-09-20T11:00:00.000Z')];
    is(mergeShelves(later, [], gone).length, 1, 'taking the same quiz again an hour later is a new result');
  }

  // the 60-second collapse keeps the EARLIER save
  {
    const early = e('theology-compass', 'AAA', '2026-09-20T10:00:00.000Z');
    const late = e('theology-compass', 'AAA', '2026-09-20T10:00:59.000Z');
    const out = mergeShelves([late], [early]);
    is(out.length, 1, 'two saves of one finish are one result');
    is(out[0].at, early.at, 'and the one kept is when they actually finished');

    const apart = e('theology-compass', 'AAA', iso(Date.parse(early.at) + SAME_RUN_MS + 1000));
    is(mergeShelves([early], [apart]).length, 2, 'past the window they are two finishes');
  }

  // the cap trims the oldest, and junk never survives
  {
    const many = [];
    for (let i = 0; i < SHELF_CAP + 30; i++) {
      many.push(e('theology-compass', 'C' + i, iso(Date.UTC(2026, 0, 1) + i * 3600000)));
    }
    const out = mergeShelves(many, []);
    is(out.length, SHELF_CAP, 'the cap holds');
    is(out[0].code, 'C' + (SHELF_CAP + 29), 'and it drops the oldest, not the newest');
  }
  {
    const junk = [null, 42, { quiz: 'x' }, { quiz: 'x', code: 'Y', at: 'not a date' }];
    is(mergeShelves(junk, a).map(x => x.code), ['AAA'], 'junk is dropped, the real entry stays');
    is(mergeShelves([], []), [], 'two empty shelves are an empty shelf');
    is(mergeShelves(null, undefined), [], 'not even a list is still not an error');
  }
}

// ------------------------------------------------------------ 2. merging game stats
console.log('2. game figures from two devices');
{
  const { mergeGame, SYNCED_GAME_KEYS, SEEN_CAP, sameJson } = merge;
  const at = (v, t) => ({ value: v, updatedAt: t });

  is(SYNCED_GAME_KEYS, ['sls.best', 'wsi.best', 'sls.canon'], 'v1 syncs three keys');

  is(mergeGame('sls.best', at(12, 1), at(30, 2)).value, 30, 'a best score is the larger one');
  is(mergeGame('wsi.best', at(41, 2), at(9, 1)).value, 41, 'whichever side it is on');
  is(mergeGame('sls.best', null, at(7, 1)).value, 7, 'a device that has never played takes the account\'s');
  is(mergeGame('sls.best', at(7, 1), null).value, 7, 'and the other way round');
  is(mergeGame('sls.best', at('lots', 1), at(5, 2)).value, 5, 'junk on one side is ignored');
  is(mergeGame('sls.best', at('lots', 1), null), null, 'junk on both sides writes nothing anywhere');

  is(mergeGame('sls.seen', at(['a', 'b'], 1), at(['b', 'c'], 2)).value, ['a', 'b', 'c'], 'seen lines are a union');
  {
    const big = Array.from({ length: SEEN_CAP + 10 }, (_, i) => 'x' + i);
    is(mergeGame('wsi.seen', at(big, 1), at(['later'], 2)).value.length, SEEN_CAP, 'a merged seen list is capped');
  }

  is(
    mergeGame('sls.fooled', at({ Augustine: 2 }, 1), at({ Augustine: 3, Kempis: 1 }, 2)).value,
    { Augustine: 5, Kempis: 1 },
    'independent plays on two devices are summed, not maximised'
  );

  is(mergeGame('sls.canon', at('p', 10), at('o', 20)).value, 'o', 'a canon choice is the later one');
  is(mergeGame('sls.canon', at('p', 30), at('o', 20)).value, 'p', 'and this device wins when it is newer');
  is(mergeGame('sls.canon', at('p', 20), at('o', 20)).value, 'p', 'a tie keeps what is in front of them');

  is(mergeGame('ww.something', at(1, 1), at(2, 2)), null, 'an unknown key has no rule and is never synced');
  yes(sameJson({ a: 1 }, { a: 1 }) && !sameJson({ a: 1 }, { a: 2 }), 'sameJson compares values, not references');
}

// ------------------------------------------------------- 3. what the browser knows
console.log('3. the session and the hint, read from storage');
{
  const { AUTH_KEY, HINT_KEY, QUEUE_KEY, readHint, markSignedIn, clearSignedIn, storedSession } = session;

  is([AUTH_KEY, HINT_KEY, QUEUE_KEY], ['ww.auth', 'ww.acct.v1', 'ww.acct.queue'], 'the three keys');

  {
    const store = fakeStore({ [AUTH_KEY]: liveAuth() });
    const s = storedSession(store);
    is(s.accessToken, 'token-abc', 'the access token');
    is(s.userId, USER, 'the user id');
    is(s.email, 'reader@example.com', 'the address');
    yes(s.expiresAt > NOW, 'expiry comes back in milliseconds, comparable with Date.now()');
  }
  {
    // A browser that has been through an SDK upgrade can still hold the older wrapper.
    const inner = JSON.parse(liveAuth());
    const store = fakeStore({ [AUTH_KEY]: JSON.stringify({ currentSession: inner }) });
    is(storedSession(store)?.accessToken, 'token-abc', 'the older wrapped shape still reads');
  }
  for (const [what, raw] of [
    ['nothing at all', null],
    ['malformed JSON', '{not json'],
    ['a list', '[1,2,3]'],
    ['no token', JSON.stringify({ user: { id: USER } })],
    ['no user', JSON.stringify({ access_token: 't' })]
  ]) {
    const store = fakeStore(raw === null ? {} : { [AUTH_KEY]: raw });
    is(storedSession(store), null, `${what} is not a session`);
  }
  {
    const noExpiry = JSON.stringify({ access_token: 't', user: { id: USER } });
    is(storedSession(fakeStore({ [AUTH_KEY]: noExpiry }))?.expiresAt, 0, 'a session with no expiry reads as long expired');
  }

  {
    const store = fakeStore();
    markSignedIn('reader@example.com', store);
    is(readHint(store), { email: 'reader@example.com' }, 'the hint round-trips');
    const raw = JSON.parse(store.peek(HINT_KEY));
    is(Object.keys(raw).sort(), ['e', 'x'], 'and it stays two short fields');
    clearSignedIn(store);
    is(readHint(store), null, 'clearing it leaves nothing');

    markSignedIn('   ', store);
    is(store.peek(HINT_KEY), null, 'a blank address is not somebody signed in');
  }
  {
    const stale = JSON.stringify({ e: 'reader@example.com', x: Math.floor(Date.now() / 1000) - 10 });
    is(readHint(fakeStore({ [HINT_KEY]: stale })), null, 'a hint past its date is not believed');
    is(readHint(fakeStore({ [HINT_KEY]: '{"x":1}' })), null, 'a hint with no address is nothing');
  }

  try {
    markSignedIn('reader@example.com', brokenStore);
    clearSignedIn(brokenStore);
    is([readHint(brokenStore), storedSession(brokenStore), readHint(null)], [null, null, null], 'blocked storage');
    ok('blocked storage is a no-op, never an error');
  } catch (e) {
    fail('blocked storage threw: ' + e.message);
  }
}

// ---------------------------------------------------------------- 4. the switches
console.log('4. is there a project, and may anyone see it');
{
  is(configOff.ACCOUNTS_READY, false, 'no environment, no accounts');
  is(configOff.SUPABASE_URL, '', 'and no url to reach for');
  is(configOn.ACCOUNTS_READY, true, 'both values set switches accounts on');
  is(configOn.SUPABASE_URL, URL_BASE, 'the url, with no trailing slash');
  is(configOn.SUPABASE_KEY, KEY, 'the publishable key');
  // Public since 2026-09-22, on the owner's go. With a project behind the build, every
  // entry point shows; with none, nothing does (configOff below), whatever this says.
  is(configOn.ACCOUNT_LINKS_LIVE, true, 'the owner switched the doors on');
  is(configOn.ACCOUNTS_VISIBLE, true, 'so the site links to accounts wherever there is a project');
  is(configOn.MIN_PASSWORD, 8, 'eight characters, the same number Supabase is told');

  // The build variable is absent everywhere but Vite, and reading it must stay harmless.
  is(configOn.IS_PREVIEW, false, 'with no build variable at all, this is not a preview');
  is(configOff.IS_PREVIEW, false, 'and the same with nothing set anywhere');

  is(configPreview.IS_PREVIEW, true, 'a Vercel preview build knows it is one');
  is(configPreview.ACCOUNTS_VISIBLE, true, 'so the owner can see the public entry points there');
  is(configPreview.ACCOUNT_LINKS_LIVE, true, 'the same committed switch as production');

  is(configProd.IS_PREVIEW, false, 'a production build is not a preview');
  is(configProd.ACCOUNTS_VISIBLE, true, 'and production shows the doors, now they are public');
  is(configOff.ACCOUNTS_VISIBLE, false, 'but never without a project: no keys, no doors');

  is(configDev.ACCOUNTS_VISIBLE, true, 'a dev machine may switch the entry points on to look at them');
  is(configDev.ACCOUNT_LINKS_LIVE, true, 'the owner\'s switch, the same on every machine');
}

// ------------------------------------------------------------------ 5. one sync
console.log('5. a sync, request by request');
{
  const { syncNow } = sync;
  const { SHELF_KEY } = shelf;

  const localShelf = [
    { quiz: 'theology-compass', code: 'LOCAL1', at: '2026-09-20T09:00:00.000Z' }
  ];
  const store = fakeStore({
    [session.AUTH_KEY]: liveAuth(),
    [SHELF_KEY]: JSON.stringify(localShelf),
    'sls.best': '40'
  });

  const fetch = fakeFetch(call => {
    if (call.path.startsWith('results?select=') && call.path.includes('deleted_at=is.null')) {
      return res(
        200,
        [{ quiz: 'theology-compass', code: 'REMOTE1', taken_at: '2026-09-18T09:00:00+00:00' }],
        { 'content-range': '0-0/431' }
      );
    }
    if (call.path.startsWith('results?select=') && call.path.includes('deleted_at=not.is.null')) {
      return res(200, [{ quiz: 'theology-compass', code: 'DEAD1', taken_at: '2026-09-17T09:00:00+00:00' }]);
    }
    if (call.path.startsWith('game_stats?select=')) {
      return res(200, [{ key: 'sls.best', value: 55, updated_at: '2026-09-19T09:00:00+00:00' }]);
    }
    return res(201, undefined);
  });

  const out = await syncNow(deps(store, fetch));

  const live = fetch.calls[0];
  is(
    live.url,
    `${URL_BASE}/rest/v1/results?select=quiz,code,taken_at&deleted_at=is.null&order=taken_at.desc&limit=400`,
    'the live read'
  );
  is(live.headers.apikey, KEY, 'the publishable key goes on the apikey header');
  is(live.headers.authorization, 'Bearer token-abc', 'and the session goes on the bearer');
  is(live.headers.prefer, 'count=exact', 'the true total is asked for');
  yes(!JSON.stringify(fetch.calls).includes(`Bearer ${KEY}`), 'the key is never sent as a bearer token');

  is(
    fetch.calls[1].url,
    `${URL_BASE}/rest/v1/results?select=quiz,code,taken_at&deleted_at=not.is.null&order=taken_at.desc&limit=200`,
    'the deletions are read too'
  );

  const push = fetch.calls.find(c => c.method === 'POST' && c.path.startsWith('results?'));
  is(push.path, 'results?on_conflict=user_id,quiz,code,taken_at', 'the upsert names the conflict target');
  is(push.headers.prefer, 'resolution=ignore-duplicates,return=minimal', 'and asks for nothing back');
  is(push.body, [{ user_id: USER, quiz: 'theology-compass', code: 'LOCAL1', taken_at: '2026-09-20T09:00:00.000Z' }],
    'only what the account was missing goes up');

  const games = fetch.calls.find(c => c.method === 'GET' && c.path.startsWith('game_stats?'));
  is(games.path, 'game_stats?select=key,value,updated_at&key=in.(sls.best,wsi.best,sls.canon)', 'the three game keys');
  const gamePush = fetch.calls.find(c => c.method === 'POST' && c.path.startsWith('game_stats?'));
  is(gamePush, undefined, 'a lower local best pushes nothing');
  is(store.peek('sls.best'), '55', 'and the better account score comes down to the device');

  const saved = JSON.parse(store.peek(SHELF_KEY));
  is(saved.map(e => e.code), ['LOCAL1', 'REMOTE1'], 'the shelf now holds both, newest first');
  is(out.ok, true, 'the sync worked');
  is(out.changed, true, 'and it says something moved');
  // The server's own count and nothing added to it. A result the account already held
  // outside the window we read is not a new one, and adding the push made the one line on
  // /me/ whose job is honesty about the gap overstate the account.
  is(out.serverTotal, 431, 'the total is the account\'s own count, exactly as it reported it');
  is(out.full, undefined, 'and there is nothing to say about room');
  is(readHintOf(store), 'reader@example.com', 'a successful sync writes the header hint forward');

  function readHintOf(s) {
    return session.readHint(s)?.email ?? null;
  }
}
{
  // A device with nothing new, and an account with nothing new, should write nothing.
  const { syncNow } = sync;
  const store = fakeStore({
    [session.AUTH_KEY]: liveAuth(),
    [shelf.SHELF_KEY]: JSON.stringify([{ quiz: 'theology-compass', code: 'SAME1', at: '2026-09-20T09:00:00.000Z' }])
  });
  const fetch = fakeFetch(call => {
    if (call.path.includes('deleted_at=is.null')) {
      return res(200, [{ quiz: 'theology-compass', code: 'SAME1', taken_at: '2026-09-20T09:00:00+00:00' }], {
        'content-range': '0-0/1'
      });
    }
    return res(200, []);
  });
  const out = await syncNow(deps(store, fetch));
  is(fetch.calls.filter(c => c.method === 'POST' && c.path.startsWith('results?')).length, 0, 'nothing is pushed');
  is(out, { ok: true, changed: false, serverTotal: 1 }, 'and nothing on the device moved');
}
{
  // A stale token is the one case that costs the SDK. Here the refresh is injected, which
  // is also how the test proves the fresh path never reaches for it.
  const { syncNow } = sync;
  let refreshed = 0;
  const store = fakeStore({ [session.AUTH_KEY]: liveAuth(30), [shelf.SHELF_KEY]: '[]' });
  const fetch = fakeFetch(() => res(200, [], { 'content-range': '0-0/0' }));
  const out = await syncNow(
    deps(store, fetch, {
      refresh: async () => {
        refreshed++;
        return { accessToken: 'token-fresh', userId: USER, email: 'reader@example.com' };
      }
    })
  );
  is(refreshed, 1, 'a token inside a minute of expiry is refreshed');
  is(fetch.calls[0].headers.authorization, 'Bearer token-fresh', 'and the fresh one is used');
  is(out.ok, true, 'the sync carries on');
}
{
  // No session at all: no requests, no error, no claim that it worked.
  const { syncNow } = sync;
  const fetch = fakeFetch(() => res(200, []));
  const out = await syncNow(deps(fakeStore(), fetch));
  is(out, { ok: false, changed: false }, 'signed out, nothing happens');
  is(fetch.calls.length, 0, 'and nothing is asked of the server');
}
{
  // The server refusing is silent: the shelf is untouched and the page says nothing.
  const { syncNow } = sync;
  const before = JSON.stringify([{ quiz: 'theology-compass', code: 'KEEP1', at: '2026-09-20T09:00:00.000Z' }]);
  const store = fakeStore({ [session.AUTH_KEY]: liveAuth(), [shelf.SHELF_KEY]: before });
  const out = await syncNow(deps(store, fakeFetch(() => res(401, { message: 'no' }))));
  is(out, { ok: false, changed: false }, 'a refused read is not a success');
  is(store.peek(shelf.SHELF_KEY), before, 'and the device keeps every result it had');
}

// -------------------------------------------------------------------- 6. the queue
console.log('6. results finished on the way out, and offline');
{
  const { queueResult, flushQueue } = sync;
  const { QUEUE_KEY } = session;

  const store = fakeStore({ [session.AUTH_KEY]: liveAuth() });
  queueResult({ quiz: 'theology-compass', code: 'Q1', at: '2026-09-20T09:00:00.000Z' }, store);
  queueResult({ quiz: 'bible-figure', code: 'Q2', at: '2026-09-20T09:05:00.000Z' }, store);
  queueResult({ quiz: 'theology-compass', code: 'Q1', at: '2026-09-20T09:00:00.000Z' }, store);
  is(JSON.parse(store.peek(QUEUE_KEY)).length, 2, 'the same result queued twice waits once');

  queueResult({ quiz: '', code: '', at: 'nonsense' }, store);
  is(JSON.parse(store.peek(QUEUE_KEY)).length, 2, 'junk is not queued');

  // A flush that fails must leave the queue exactly as it found it.
  const refuse = fakeFetch(() => res(500, { message: 'no' }));
  await flushQueue(deps(store, refuse));
  is(refuse.calls.length, 1, 'one batched request, not one per result');
  is(refuse.calls[0].body.length, 2, 'both results in the one body');
  is(JSON.parse(store.peek(QUEUE_KEY)).length, 2, 'a failed flush loses nothing');

  const accept = fakeFetch(() => res(201, undefined));
  await flushQueue(deps(store, accept));
  is(accept.calls[0].path, 'results?on_conflict=user_id,quiz,code,taken_at', 'the same upsert as a sync');
  is(accept.calls[0].headers.prefer, 'resolution=ignore-duplicates,return=minimal', 'ignoring duplicates');
  is(accept.calls[0].body[0].user_id, USER, 'every row carries the user id row-level security checks');
  is(store.peek(QUEUE_KEY), null, 'a flush that worked empties the queue');

  const quiet = fakeFetch(() => res(200, []));
  await flushQueue(deps(store, quiet));
  is(quiet.calls.length, 0, 'an empty queue costs no request at all');
}
{
  // The queue is storage only. Nothing about finishing a quiz may touch the network.
  const { queueResult } = sync;
  const store = fakeStore();
  const before = globalThis.fetch;
  globalThis.fetch = () => { throw new Error('the queue must not fetch'); };
  try {
    queueResult({ quiz: 'theology-compass', code: 'Q9', at: '2026-09-20T09:00:00.000Z' }, store);
    ok('queueing a result makes no request');
  } catch (e) {
    fail(e.message);
  }
  globalThis.fetch = before;
  try {
    queueResult({ quiz: 'theology-compass', code: 'Q9', at: '2026-09-20T09:00:00.000Z' }, brokenStore);
    ok('and blocked storage is a no-op, never an error');
  } catch (e) {
    fail('blocked storage threw: ' + e.message);
  }
}

// ------------------------------------------------------- 7. clearing, server first
console.log('7. clear my results everywhere');
{
  const { clearEverywhere } = sync;
  const before = JSON.stringify([{ quiz: 'theology-compass', code: 'KEEP1', at: '2026-09-20T09:00:00.000Z' }]);

  {
    const store = fakeStore({ [session.AUTH_KEY]: liveAuth(), [shelf.SHELF_KEY]: before });
    const fetch = fakeFetch(() => res(500, { message: 'no' }));
    const out = await clearEverywhere(deps(store, fetch));
    is(out.ok, false, 'a server that refuses is a failure');
    yes(typeof out.say === 'string' && out.say.length > 10, 'with a sentence the page can print: ' + out.say);
    is(store.peek(shelf.SHELF_KEY), before, 'and the device is left exactly as it was');
  }
  {
    const store = fakeStore({ [session.AUTH_KEY]: liveAuth(), [shelf.SHELF_KEY]: before });
    const fetch = fakeFetch(() => res(204, undefined));
    const out = await clearEverywhere(deps(store, fetch));
    is(fetch.calls[0].method, 'PATCH', 'a result is marked, never dropped');
    is(fetch.calls[0].path, 'results?deleted_at=is.null', 'every row still standing');
    is(Object.keys(fetch.calls[0].body), ['deleted_at'], 'and the only column written is the tombstone');
    is(out.ok, true, 'the account said yes');
    is(store.peek(shelf.SHELF_KEY), null, 'so now the device is cleared too');
  }
  {
    const fetch = fakeFetch(() => res(204, undefined));
    const out = await clearEverywhere(deps(fakeStore(), fetch));
    is(out.ok, false, 'signed out, there is nothing to clear in an account');
    is(fetch.calls.length, 0, 'and nothing is asked of the server');
  }
}

// -------------------------------------------------------------- 8. removing one
console.log('8. one result, gone from both');
{
  const { removeEverywhere } = sync;
  const two = JSON.stringify([
    { quiz: 'theology-compass', code: 'AAA', at: '2026-09-20T09:00:00.000Z' },
    { quiz: 'bible-figure', code: 'BBB', at: '2026-09-19T09:00:00.000Z' }
  ]);

  {
    const store = fakeStore({ [session.AUTH_KEY]: liveAuth(), [shelf.SHELF_KEY]: two });
    const fetch = fakeFetch(() => res(204, undefined));
    const out = await removeEverywhere(
      { quiz: 'theology-compass', code: 'AAA', at: '2026-09-20T09:00:00.000Z' },
      deps(store, fetch)
    );
    is(fetch.calls[0].method, 'PATCH', 'marked, not dropped');
    is(
      fetch.calls[0].path,
      'results?quiz=eq.theology-compass&code=eq.AAA&taken_at=eq.2026-09-20T09%3A00%3A00.000Z',
      'the one row, with the instant escaped'
    );
    is(out.ok, true, 'the account said yes');
    is(JSON.parse(store.peek(shelf.SHELF_KEY)).map(e => e.code), ['BBB'], 'and only that one left the device');
  }
  {
    const store = fakeStore({ [session.AUTH_KEY]: liveAuth(), [shelf.SHELF_KEY]: two });
    const out = await removeEverywhere(
      { quiz: 'theology-compass', code: 'AAA', at: '2026-09-20T09:00:00.000Z' },
      deps(store, fakeFetch(() => res(500, { message: 'no' })))
    );
    is(out.ok, false, 'a server that refuses is a failure');
    is(JSON.parse(store.peek(shelf.SHELF_KEY)).length, 2, 'and the device keeps both');
  }
  {
    const out = await removeEverywhere({ quiz: 'x', code: 'Y', at: 'not a date' }, deps(fakeStore(), fakeFetch(() => res(204))));
    is(out.ok, false, 'an entry that is not an entry is refused before anything is sent');
  }
}

// ------------------------------------------------------------- 9. what to say
console.log('9. an error becomes a sentence');
{
  const { codeFor, sayFor } = clientOn;

  const cases = [
    [{ code: 'otp_expired', status: 403 }, 'expired'],
    [{ code: 'over_email_send_rate_limit', status: 429 }, 'cooldown'],
    [{ code: 'over_request_rate_limit', status: 429 }, 'busy'],
    [{ code: 'weak_password', status: 422 }, 'weak'],
    [{ code: 'same_password', status: 422 }, 'same'],
    [{ code: 'invalid_credentials', status: 400 }, 'wrong'],
    [{ code: 'email_not_confirmed', status: 400 }, 'unconfirmed'],
    [{ status: 540, message: 'project paused' }, 'paused'],
    // A paused project answers with an HTML page, and the SDK only attaches a status when
    // the body parses as JSON. The word has to be enough on its own.
    [{ name: 'AuthUnknownError', message: 'This project is paused.' }, 'paused'],
    [{ name: 'AuthRetryableFetchError', message: 'Failed to fetch', status: 0 }, 'offline'],
    [new TypeError('Failed to fetch'), 'offline'],
    // Firefox's wording for a module that could not be fetched. It is the network, and
    // Chrome's wording already matched, so this reader was the only one told to reload.
    [new Error('error loading dynamically imported module: https://wiserwalk.com/x.js'), 'offline'],
    [new Error('Loading chunk 42 failed.'), 'offline'],
    [{ status: 503 }, 'busy'],
    [{ code: 'something_new', status: 400 }, 'unknown'],
    [null, 'unknown']
  ];
  for (const [error, want] of cases) {
    is(codeFor(error), want, `${want} <- ${error?.code ?? error?.message ?? error?.name ?? error?.status ?? 'nothing'}`);
  }

  const codes = [
    'expired', 'cooldown', 'busy', 'weak', 'same', 'wrong',
    'unconfirmed', 'offline', 'off', 'paused', 'unknown', 'nosession', 'address'
  ];
  let sentences = 0;
  for (const code of codes) {
    const say = sayFor(code);
    if (typeof say !== 'string' || say.length < 12) fail(`${code} has no sentence`);
    else if (!/[.!?]$/.test(say)) fail(`${code} is not a finished sentence: ${say}`);
    else if (say.includes('—') || say.includes('--')) fail(`${code} has a dash in it: ${say}`);
    else if (/token|otp|supabase|rls|api|401|403|429/i.test(say)) fail(`${code} talks shop: ${say}`);
    else sentences++;
  }
  is(sentences, codes.length, 'every code has a finished sentence in the site\'s own voice');
  is(sayFor('not-a-code'), sayFor('unknown'), 'an unknown code still prints something sensible');

  // The same refusal covers the minute between two asks for one address AND the whole
  // project's hourly ceiling, and in the second case nothing was sent to this person at all.
  const cooldown = sayFor('cooldown');
  yes(!/we have just sent|we have sent/i.test(cooldown), 'the cooldown sentence promises nobody an email: ' + cooldown);
  yes(/try|again/i.test(cooldown), 'and still says what to do');
}

// --------------------------------------------------- 10. with accounts switched off
console.log('10. before the owner has pasted anything into Vercel');
{
  const before = globalThis.fetch;
  let reached = 0;
  globalThis.fetch = async () => { reached++; return res(200, {}); };

  const results = {
    requestLink: await clientOff.requestLink('reader@example.com'),
    requestReset: await clientOff.requestReset('reader@example.com'),
    finishWithToken: await clientOff.finishWithToken({ tokenHash: 'abc', kind: 'signup', password: 'longenough' }),
    finishWithCode: await clientOff.finishWithCode({ email: 'reader@example.com', code: '483205', password: 'longenough' }),
    signIn: await clientOff.signIn('reader@example.com', 'longenough'),
    signOut: await clientOff.signOut(),
    changePassword: await clientOff.changePassword('oldpassword', 'newpassword'),
    setNotes: await clientOff.setNotes(false),
    deleteAccount: await clientOff.deleteAccount()
  };
  for (const [name, out] of Object.entries(results)) {
    if (out.ok !== false) fail(`${name} claimed to work with no project behind it`);
    else if (out.code !== 'off') fail(`${name} answered ${out.code}, not off`);
    else if (out.say !== clientOff.sayFor('off')) fail(`${name} said something else: ${out.say}`);
    else ok(`${name} answers "off" and does nothing`);
  }
  is(await clientOff.whoAmI(), null, 'and nobody is signed in');
  is(reached, 0, 'not one request left the browser');

  globalThis.fetch = before;
}
{
  // The address check runs before anything is sent, so a typo never costs an email.
  const out = await clientOn.requestLink('not an address');
  is(out.code, 'address', 'an obvious typo is refused here, not at Supabase');
}

// ------------------------------------------------- 11. a session the server disowns
console.log('11. when the account says nobody is there');
{
  const { syncNow } = sync;
  const { AUTH_KEY, markSignedIn, readHint } = session;

  const signedIn = () => {
    const store = fakeStore({ [AUTH_KEY]: liveAuth(), [shelf.SHELF_KEY]: '[]' });
    markSignedIn('reader@example.com', store);
    return store;
  };
  const freshToken = async () => ({ accessToken: 'token-fresh', userId: USER, email: 'reader@example.com' });

  {
    // A stored token refused once may only be stale. It is worth one refresh and one retry.
    const store = signedIn();
    let refreshed = 0;
    const fetch = fakeFetch(call =>
      call.headers.authorization === 'Bearer token-fresh'
        ? res(200, [], { 'content-range': '0-0/0' })
        : res(401, { message: 'JWT expired' })
    );
    const out = await syncNow(deps(store, fetch, { refresh: async () => { refreshed++; return freshToken(); } }));
    is(refreshed, 1, 'a refused token is refreshed once');
    is(out.ok, true, 'and the sync carries on with the fresh one');
    is(readHint(store)?.email, 'reader@example.com', 'so the header is left alone');
  }
  {
    // Refused again with a token minted seconds ago: this session is genuinely over.
    const store = signedIn();
    const fetch = fakeFetch(() => res(401, { message: 'invalid claim' }));
    const out = await syncNow(deps(store, fetch, { refresh: freshToken }));
    is(out.ok, false, 'the sync cannot do anything');
    is(readHint(store), null, 'and the header stops saying somebody is signed in');
  }
  {
    // The refresh itself failing proves nothing about the session: it may be the network.
    const store = signedIn();
    const fetch = fakeFetch(() => res(401, { message: 'JWT expired' }));
    await syncNow(deps(store, fetch, { refresh: async () => null }));
    is(readHint(store)?.email, 'reader@example.com', 'a refresh that never answered takes nothing away');
  }
  {
    const store = signedIn();
    await syncNow(deps(store, fakeFetch(() => res(500, { message: 'oh dear' })), { refresh: freshToken }));
    is(readHint(store)?.email, 'reader@example.com', 'our own server having a bad day takes nothing away');
  }
  {
    const store = signedIn();
    const dead = () => { throw new Error('Failed to fetch'); };
    await syncNow(deps(store, dead, { refresh: freshToken }));
    is(readHint(store)?.email, 'reader@example.com', 'and neither does a tunnel');
  }
}

// ------------------------------------------------------- 12. an account with no room
console.log('12. two thousand results in, the account is full');
{
  const { syncNow, flushQueue, queueResult, countResults } = sync;
  const { QUEUE_KEY } = session;
  // What PostgREST hands back when the trigger in schema.sql refuses a row.
  const CAP = { code: '23514', message: 'This account already holds 2000 results.' };

  {
    const store = fakeStore({
      [session.AUTH_KEY]: liveAuth(),
      [shelf.SHELF_KEY]: JSON.stringify([{ quiz: 'theology-compass', code: 'MINE1', at: '2026-09-20T09:00:00.000Z' }])
    });
    const fetch = fakeFetch(call => {
      if (call.method === 'POST') return res(400, CAP);
      if (call.path.includes('deleted_at=is.null')) return res(200, [], { 'content-range': '*/2000' });
      return res(200, []);
    });
    const out = await syncNow(deps(store, fetch));
    is(out.ok, true, 'the read still worked, so the page still paints');
    is(out.full, true, 'and the page is told the account would not take it');
    is(out.serverTotal, 2000, 'with the account\'s own count');
  }
  {
    // Any other permanent refusal is not the ceiling, and must not be reported as one.
    const store = fakeStore({
      [session.AUTH_KEY]: liveAuth(),
      [shelf.SHELF_KEY]: JSON.stringify([{ quiz: 'theology-compass', code: 'MINE2', at: '2026-09-20T09:00:00.000Z' }])
    });
    const fetch = fakeFetch(call =>
      call.method === 'POST' ? res(400, { code: '22P02', message: 'invalid input syntax' }) : res(200, [], { 'content-range': '0-0/0' })
    );
    const out = await syncNow(deps(store, fetch));
    is(out.full, undefined, 'a different refusal says nothing about room');
  }

  {
    // A queue that can only ever be refused would otherwise be re-sent on every page load,
    // for ever, with nobody told anything.
    const store = fakeStore({ [session.AUTH_KEY]: liveAuth() });
    queueResult({ quiz: 'theology-compass', code: 'QF1', at: '2026-09-20T09:00:00.000Z' }, store);
    await flushQueue(deps(store, fakeFetch(() => res(400, CAP))));
    is(store.peek(QUEUE_KEY), null, 'a permanent refusal empties the queue');
  }
  for (const [status, why] of [[401, 'a token to refresh'], [403, 'a token to refresh'], [408, 'a timeout'], [429, 'a rate limit']]) {
    const store = fakeStore({ [session.AUTH_KEY]: liveAuth() });
    queueResult({ quiz: 'theology-compass', code: 'QK1', at: '2026-09-20T09:00:00.000Z' }, store);
    await flushQueue(deps(store, fakeFetch(() => res(status, { message: 'not now' }))));
    is(JSON.parse(store.peek(QUEUE_KEY) ?? 'null')?.length, 1, `${status} is ${why}, so the queue waits`);
  }

  {
    // The count /account/ prints. It is the account's number, never the device's.
    const store = fakeStore({ [session.AUTH_KEY]: liveAuth() });
    const fetch = fakeFetch(() => res(200, [], { 'content-range': '0-0/431' }));
    is(await countResults(deps(store, fetch)), 431, 'the live rows, straight from the server');
    is(fetch.calls[0].path, 'results?select=quiz&deleted_at=is.null&limit=1', 'asked for as cheaply as it can be');
    is(fetch.calls[0].headers.prefer, 'count=exact', 'with the true total');
  }
  {
    const store = fakeStore({ [session.AUTH_KEY]: liveAuth() });
    is(await countResults(deps(store, fakeFetch(() => res(500, { message: 'no' })))), null, 'a server that will not say is null, not a guess');
  }
  {
    const fetch = fakeFetch(() => res(200, []));
    is(await countResults(deps(fakeStore(), fetch)), null, 'and signed out there is nothing to count');
    is(fetch.calls.length, 0, 'with nothing asked of the server');
  }
}

// ------------------------------------------------------ 13. the calls through the SDK
console.log('13. what client.ts asks the SDK for');
{
  const savedFetch = globalThis.fetch;
  const savedStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  let store = fakeStore();
  Object.defineProperty(globalThis, 'localStorage', { value: store, configurable: true, writable: true });

  const sdk = plan => { globalThis.__sdk = plan; globalThis.__sdkCalls = []; };
  const calls = () => globalThis.__sdkCalls ?? [];
  const asUser = { data: { user: { id: USER, email: 'reader@example.com' } }, error: null };

  // Anything client.ts does over plain fetch (the sync inside a finish, /api/auth/*) is
  // answered blandly here; the requests themselves are checked in the sections above.
  const answers = [];
  globalThis.fetch = async (url, init = {}) => {
    answers.push({ url: String(url), method: init.method ?? 'GET' });
    return {
      ok: true,
      status: 200,
      headers: { get: name => (name.toLowerCase() === 'content-range' ? '0-0/0' : null) },
      json: async () => []
    };
  };

  {
    sdk({ getUser: () => asUser, profile: { password_set_at: '2026-09-20T00:00:00+00:00', notes_off: true } });
    const who = await clientSdk.whoAmI();
    is(who, { email: 'reader@example.com', passwordSet: true, notesOff: true }, 'whoAmI reports the account');
    is(session.readHint(store)?.email, 'reader@example.com', 'and writes the header hint forward');
  }
  {
    // The server answered, and the answer is nobody. The hint has to go with it.
    sdk({ getUser: () => ({ data: { user: null }, error: { name: 'AuthSessionMissingError', code: 'session_not_found', status: 400 } }) });
    is(await clientSdk.whoAmI(), null, 'no session is null');
    is(session.readHint(store), null, 'and the header stops saying otherwise');
  }
  {
    // The project asleep, or a train. The page must not flip anybody to signed out.
    session.markSignedIn('reader@example.com', store);
    sdk({ getUser: () => ({ data: { user: null }, error: { status: 540, message: 'paused' } }) });
    is(await clientSdk.whoAmI(), 'unreachable', 'a project that is asleep is not an answer about anybody');
    is(session.readHint(store)?.email, 'reader@example.com', 'so the header is left exactly as it was');
  }

  {
    // An upsert, not an update: there may be no row yet, and a PATCH matching nothing is a
    // silent success that would tell somebody their switch had stuck when it had not.
    sdk({ getUser: () => asUser, getSession: () => ({ data: { session: null } }) });
    const out = await clientSdk.setNotes(false);
    is(out.ok, true, 'turning the notes off works');
    const wrote = calls().find(c => c.op === 'upsert');
    is(wrote.values, { id: USER, notes_off: true }, 'writing the row it may have to create');
    is(wrote.options, { onConflict: 'id' }, 'on the account\'s own id');
  }

  {
    // Choosing a password on a session that is already open: the link was spent last time.
    store.setItem(session.AUTH_KEY, liveAuth());
    sdk({
      getSession: () => ({ data: { session: { access_token: 'token-abc', user: { id: USER, email: 'reader@example.com' } } } }),
      updateUser: () => ({ data: { user: { id: USER, email: 'reader@example.com' } }, error: null })
    });
    const out = await clientSdk.finishWithSession('a good long password');
    is(out.ok, true, 'the password is set on the session already here');
    yes(!calls().some(c => c.op === 'verifyOtp'), 'and the spent link is never offered to the server again');
    is(calls().find(c => c.op === 'updateUser')?.attributes, { password: 'a good long password' }, 'the password goes up');
    is(calls().find(c => c.op === 'rpc')?.name, 'mark_password_set', 'and the site records that there is one');
  }
  {
    sdk({ getSession: () => ({ data: { session: null } }) });
    const out = await clientSdk.finishWithSession('a good long password');
    is([out.ok, out.code], [false, 'nosession'], 'with no session there is nothing to finish');
  }
  {
    sdk({ getSession: () => ({ data: { session: { access_token: 'token-abc' } } }) });
    const out = await clientSdk.finishWithSession('short');
    is([out.ok, out.code], [false, 'weak'], 'and a short password is refused before anything is sent');
  }

  {
    // The six digits from a reset email are in the recovery column, so one honest second try.
    let tries = 0;
    sdk({
      verifyOtp: () => (++tries === 1 ? { error: { code: 'otp_expired', status: 403 } } : { error: null }),
      getSession: () => ({ data: { session: { access_token: 'token-abc' } } }),
      updateUser: () => ({ data: { user: { id: USER, email: 'reader@example.com' } }, error: null })
    });
    const out = await clientSdk.finishWithCode({ email: 'reader@example.com', code: '483 205', password: 'a good long password' });
    is(out.ok, true, 'a reset code is accepted');
    const kinds = calls().filter(c => c.op === 'verifyOtp').map(c => c.params.type);
    is(kinds, ['email', 'recovery'], 'the column that holds both first, then the other');
    is(calls().find(c => c.op === 'verifyOtp')?.params.token, '483205', 'with the spaces taken out');
  }

  {
    // Deleting really deletes, on this device too. The games keep their own keys, and the
    // room promises they go.
    store = fakeStore({
      [session.AUTH_KEY]: liveAuth(),
      [shelf.SHELF_KEY]: JSON.stringify([{ quiz: 'theology-compass', code: 'AAA', at: '2026-09-20T09:00:00.000Z' }]),
      'ww.acct.queue': '[]',
      'ww.acct.games': '{}',
      'ww.acct.synced': '2026-09-20T09:00:00.000Z',
      'sls.best': '8400',
      'sls.seen': '["a"]',
      'sls.fooled': '{"Augustine":2}',
      'sls.canon': '"orthodox"',
      'wsi.best': '12',
      'wsi.seen': '["b"]',
      'wsi.mix': '{"x":1}'
    });
    Object.defineProperty(globalThis, 'localStorage', { value: store, configurable: true, writable: true });
    session.markSignedIn('reader@example.com', store);

    sdk({ getSession: () => ({ data: { session: { access_token: 'token-abc' } } }) });
    globalThis.fetch = async () => ({ ok: true, status: 200, json: async () => ({ ok: true, listRemoved: false }) });

    const out = await clientSdk.deleteAccount();
    is(out.ok, true, 'the account is gone');
    is(out.listRemoved, false, 'and the page is told the mailing list was not cleaned');
    // ww.auth is the SDK's own key and the real signOut removes it; this stand-in does not
    // model that, so it is the one thing expected to survive here and nowhere else.
    is(store.keys(), ['ww.auth'], 'the shelf, the queue, the stamps and all seven game keys go');
    is(calls().find(c => c.op === 'signOut')?.scope, 'local', 'and this browser alone is signed out');
  }
  {
    // A refusal keeps the device exactly as it was, and prints the route's own sentence.
    const kept = fakeStore({ [shelf.SHELF_KEY]: '[]', 'sls.best': '8400' });
    Object.defineProperty(globalThis, 'localStorage', { value: kept, configurable: true, writable: true });
    sdk({ getSession: () => ({ data: { session: { access_token: 'token-abc' } } }) });
    globalThis.fetch = async () => ({
      ok: false,
      status: 503,
      json: async () => ({ ok: false, error: 'We could not reach your account just now. Nothing was deleted.' })
    });
    const out = await clientSdk.deleteAccount();
    is(out.ok, false, 'a refusal is a refusal');
    is(out.say, 'We could not reach your account just now. Nothing was deleted.', 'in the route\'s own words');
    is(kept.peek('sls.best'), '8400', 'and nothing on the device was touched');
  }

  delete globalThis.__sdk;
  delete globalThis.__sdkCalls;
  globalThis.fetch = savedFetch;
  if (savedStorage) Object.defineProperty(globalThis, 'localStorage', savedStorage);
  else delete globalThis.localStorage;
}

for (const file of built) rmSync(file, { force: true });

console.log('');
if (failures) {
  console.log(`${failures} account check(s) FAILED`);
  process.exit(1);
}
console.log('All account checks passed.');
