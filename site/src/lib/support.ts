/**
 * Where giving happens.
 *
 * The site takes no payments itself and never will: the button on /support/ points at
 * whatever page the owner sets up (PayPal, Ko-fi, a Stripe payment link), and a card
 * number never touches this domain. That is also why the URL is a build-time constant
 * rather than anything clever — there is nothing here to keep secret.
 *
 * It is deliberately allowed to be EMPTY. The page has to be designable and reviewable
 * before the giving account exists, so an empty value renders the button disabled and
 * says so, instead of shipping a link to nowhere.
 *
 * PUBLIC_ prefix because /support/ is a static page: the value is inlined at build time,
 * which is the only way a page with no server behind it can carry one.
 */
/** The owner's Ko-fi page, enabled for donations on 2026-09-21. Ko-fi takes no platform cut on gifts. */
const DEFAULT_URL = 'https://ko-fi.com/sunjolol';

const raw = (import.meta.env.PUBLIC_SUPPORT_URL as string | undefined) ?? DEFAULT_URL;

export const SUPPORT_URL = raw.trim();

/** True when there is somewhere to send a reader who taps the button. */
export const SUPPORT_READY = SUPPORT_URL.length > 0;
