/**
 * The three account emails, written here rather than in a dashboard.
 *
 * Supabase would happily send these itself from templates pasted into its Email Templates
 * screen. Keeping them here buys three things that matter more than the screen saves:
 *
 *   one link format  The address in the email and the page that parses it are in the same
 *                    repository, so they cannot drift apart. It is the constant below.
 *   one branch       Asking for a link with an address that already has an account sends a
 *                    DIFFERENT action type, so it needs different words. In a dashboard
 *                    that is two templates a person must keep in step; here it is a switch
 *                    with a test per arm.
 *   the code         We can print the six-digit token beside the button, which is the only
 *                    thing standing between the owner and a dead flow if a mail provider's
 *                    link rewriter mangles the query string.
 *
 * Style rules that are asserted in scripts/auth-test.mjs rather than merely intended: no
 * unreplaced template marks, no "faith", never the phrase these are commonly called, no em
 * dashes, no emoji, and exactly one link in the whole message. A password email with three
 * links in it looks like the thing it is trying not to look like.
 *
 * The HTML is deliberately plain: no stylesheet, no table scaffolding, inline styles only,
 * 520px wide, and a button that is a padded inline-block anchor rather than anything that
 * depends on a client understanding modern CSS.
 */

/** The one place the link format lives. The password page parses exactly this. */
export const PASSWORD_PATH = '/account/password/';

/** Where the links point when the request that reached the hook is not one we trust. */
export const HOME_ORIGIN = 'https://wiserwalk.com';

export type EmailKind = 'signup' | 'magiclink' | 'recovery';

export interface Rendered {
  subject: string;
  html: string;
  text: string;
}

/**
 * The origin to build links from.
 *
 * The hook is a public URL, so the request that reaches it decides nothing on trust: an
 * origin is used only when it is the real site or a machine running it locally. Anything
 * else falls back to the live site, because the one outcome worth designing against is an
 * email that sends somebody's one-time token to a host chosen by whoever called us.
 *
 * Vercel previews are deliberately NOT on the list, although the site does run there. A
 * preview sits behind Vercel's login wall, so Supabase's hook cannot reach one in the
 * first place; trusting the whole of `*.vercel.app` would have been a promise about every
 * project on the platform, to protect a credential that takes over an account for an hour.
 * The list is four exact hostnames, and everything else goes to the live site.
 */
export function originFor(raw: string | null | undefined): string {
  const value = (raw ?? '').trim();
  if (!value) return HOME_ORIGIN;
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return HOME_ORIGIN;
  }
  const host = url.hostname.toLowerCase();
  const trusted =
    host === 'wiserwalk.com' ||
    host === 'www.wiserwalk.com' ||
    host === 'localhost' ||
    host === '127.0.0.1';
  if (!trusted) return HOME_ORIGIN;
  if (url.protocol !== 'https:' && host !== 'localhost' && host !== '127.0.0.1') return HOME_ORIGIN;
  return url.origin;
}

/** The link in the email. Query string, not fragment: a redirector cannot drop it. */
export function passwordLink(origin: string, tokenHash: string, kind: EmailKind): string {
  return `${origin}${PASSWORD_PATH}?t=${encodeURIComponent(tokenHash)}&k=${kind}`;
}

/** 483205 reads as a number; 483 205 reads as something to copy. */
export function spacedCode(token: string): string {
  return /^\d{6}$/.test(token) ? `${token.slice(0, 3)} ${token.slice(3)}` : token;
}

/** Anything that reaches an attribute or a text node goes through here first. */
function esc(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const INK = '#444444';
const PAGE = '#e3e3e3';
const CARD = '#eeeeee';
const MUTE = '#6b6b6b';
const SANS = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
const SERIF = "Georgia,'Times New Roman',Times,serif";

const p = (text: string, extra = '') =>
  `<p style="margin:0 0 14px 0;font-family:${SANS};font-size:16px;line-height:1.6;color:${INK};${extra}">${text}</p>`;

/**
 * The frame every one of them shares.
 *
 * The thin blue-to-orange rule is the site's own gradient and the only colour in the
 * message; it carries a solid fallback because a fair number of clients drop a background
 * image and would otherwise leave a white gap where the site's one signature should be.
 * The button is solid dark ink for the opposite reason: white text on a gradient that
 * fades into pale orange is unreadable in the clients that DO render it.
 */
function shell(a: {
  subject: string;
  preheader: string;
  heading: string;
  body: string;
  link: string;
  button: string;
  tail: string;
}): string {
  return [
    '<!doctype html>',
    '<html lang="en"><head><meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width,initial-scale=1">',
    `<title>${esc(a.subject)}</title></head>`,
    `<body style="margin:0;padding:0;background-color:${PAGE};">`,
    `<div style="display:none;max-height:0;overflow:hidden;font-size:1px;line-height:1px;color:${PAGE};">${esc(a.preheader)}</div>`,
    `<div style="margin:0 auto;padding:24px 16px;max-width:520px;">`,
    `<div style="background-color:${CARD};border-radius:18px;overflow:hidden;">`,
    `<div style="height:5px;font-size:0;line-height:0;background-color:#7ebaee;background-image:linear-gradient(90deg,#7ebaee,#f0a06f);">&nbsp;</div>`,
    `<div style="padding:30px 26px 34px 26px;">`,
    `<h1 style="margin:0 0 18px 0;font-family:${SERIF};font-weight:400;font-size:26px;line-height:1.25;color:${INK};">${esc(a.heading)}</h1>`,
    a.body,
    `<p style="margin:26px 0 22px 0;">`,
    `<a href="${esc(a.link)}" style="display:inline-block;padding:15px 30px;background-color:${INK};color:#ffffff;text-decoration:none;border-radius:40px;font-family:${SANS};font-size:16px;line-height:1.2;font-weight:600;">${esc(a.button)}</a>`,
    `</p>`,
    a.tail,
    `</div></div>`,
    `<p style="margin:18px 6px 0 6px;font-family:${SANS};font-size:13px;line-height:1.6;color:${MUTE};">Wiser Walk, wiserwalk.com</p>`,
    `</div></body></html>`
  ].join('');
}

/**
 * One sentence, and what it says in each part of the message.
 *
 * Almost every line is the same in both. The exceptions are the ones that point at the
 * button, because in the plain-text part there is no button, only a link, and telling
 * somebody reading in a terminal to press a button that is not there is the kind of small
 * wrongness that makes a security email look fake.
 */
interface Line {
  html: string;
  text?: string;
}

/** The one line that makes the flow survive a broken link, in both parts of the message. */
function codeLines(code: string): Line {
  const where = 'wiserwalk.com/account/password/';
  const lasts = (what: string) => `The ${what} works for one hour, and only once.`;
  if (!code) {
    return {
      html: `${lasts('button')} If it has expired, ask for a new one at ${where}`,
      text: `${lasts('link')} If it has expired, ask for a new one at ${where}`
    };
  }
  return {
    html: `${lasts('button')} If it does not work, go to ${where} and type this code:`,
    text: `${lasts('link')} If it does not work, go to ${where} and type this code: ${code}`
  };
}

interface Copy {
  subject: string;
  preheader: string;
  heading: string;
  button: string;
  /** Sentences before the button, and after it, in the order they are read. */
  before: Line[];
  after: Line[];
}

/**
 * EVERY SUBJECT IS ABOUT THE PASSWORD, and that is a contract rather than a coincidence.
 *
 * The site cannot know which of these three was sent: typing an address into the sign-up
 * box sends `signup` to a new address and `magiclink` to one that already has an account,
 * and saying which would tell anybody with a list of addresses who has an account here. So
 * "Check your email" quotes no subject line at all; it says the subject is about your
 * password, and the only way that sentence stays true is if all three subjects are. The
 * news that somebody already HAS an account is carried by the preheader, the heading and
 * the first line, where only its owner reads it.
 */
const COPY: Record<EmailKind, Copy> = {
  signup: {
    subject: 'Set your password for Wiser Walk',
    preheader: 'Choose a password and your results are kept for good.',
    heading: 'Set your password',
    button: 'Choose a password',
    before: [
      { html: 'Hello.' },
      {
        html: 'Someone asked to make a Wiser Walk account with this address. If that was you, the button below takes you to a page where you choose a password. From then on you sign in with your email and that password.',
        text: 'Someone asked to make a Wiser Walk account with this address. If that was you, the link below takes you to a page where you choose a password. From then on you sign in with your email and that password.'
      }
    ],
    after: [{ html: 'If it was not you, you can ignore this. Nothing has been made.' }, { html: 'Wiser Walk' }]
  },
  magiclink: {
    subject: 'Your Wiser Walk password',
    preheader: 'You already have an account with this address.',
    heading: 'Your way back in',
    button: 'Choose a new password',
    before: [
      { html: 'Hello.' },
      { html: 'You already have a Wiser Walk account with this address.' },
      {
        html: 'If you know your password, sign in at wiserwalk.com/account/sign-in/. If you do not, the button below lets you choose a new one.',
        text: 'If you know your password, sign in at wiserwalk.com/account/sign-in/. If you do not, the link below lets you choose a new one.'
      }
    ],
    after: [
      { html: 'If you did not ask for this, you can ignore it. Your password has not changed.' },
      { html: 'Wiser Walk' }
    ]
  },
  recovery: {
    subject: 'Choose a new password for Wiser Walk',
    preheader: 'The link inside sets a new password on your account.',
    heading: 'Choose a new password',
    button: 'Choose a new password',
    before: [
      { html: 'Hello.' },
      {
        html: 'You asked to choose a new password for your Wiser Walk account. The button below takes you to a page where you set one.',
        text: 'You asked to choose a new password for your Wiser Walk account. The link below takes you to a page where you set one.'
      }
    ],
    after: [
      { html: 'If you did not ask for this, you can ignore it. Your password has not changed until you choose a new one.' },
      { html: 'Wiser Walk' }
    ]
  }
};

/** Only the three we handle. Anything else is reported, never guessed at. */
export function isKind(action: string): action is EmailKind {
  return action === 'signup' || action === 'magiclink' || action === 'recovery';
}

/**
 * One email, or null.
 *
 * Null is the answer for an action type this site does not send mail for, such as an
 * invitation or an address change. The caller logs it and answers Supabase normally, so an
 * action we have never seen cannot block somebody signing in; what it must never do is
 * produce a half-built message and report that as sent.
 */
export function renderAuthEmail(a: {
  action: string;
  tokenHash: string;
  token?: string;
  origin?: string;
}): Rendered | null {
  if (!isKind(a.action)) return null;

  const copy = COPY[a.action];
  const origin = originFor(a.origin);
  const link = passwordLink(origin, a.tokenHash, a.action);
  const code = spacedCode((a.token ?? '').trim());
  const tail = codeLines(code);
  const asText = (line: Line) => line.text ?? line.html;

  // In the HTML the code gets a line of its own, big and spaced, because somebody is going
  // to read it off one screen and type it into another. In the plain text it is already
  // part of the sentence.
  const small = `color:${MUTE};font-size:15px;`;
  const codeHtml = code
    ? p(esc(tail.html), `${small}margin-bottom:6px;`) +
      `<p style="margin:0 0 14px 0;font-family:${SERIF};font-size:24px;line-height:1.2;letter-spacing:2px;color:${INK};white-space:nowrap;">${esc(code)}</p>`
    : p(esc(tail.html), small);

  // The fallback code and the closing sentences sit after the button, in both parts, so
  // somebody who cannot use the button reads the way round it in the same breath.
  const html = shell({
    subject: copy.subject,
    preheader: copy.preheader,
    heading: copy.heading,
    button: copy.button,
    link,
    body: copy.before.map(line => p(esc(line.html))).join(''),
    tail: codeHtml + copy.after.map(line => p(esc(line.html), small)).join('')
  });

  const text = [...copy.before.map(asText), link, asText(tail), ...copy.after.map(asText)].join('\n\n');

  return { subject: copy.subject, html, text };
}
