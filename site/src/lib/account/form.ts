/**
 * What every account form does the same way, so seven pages cannot drift apart.
 *
 * No Supabase in here and nothing that reaches the network: this is the form's own
 * behaviour, the part a password manager, a screen reader and a thumb notice. It follows
 * the GOV.UK password input and web.dev's sign-in form guidance (design/accounts/PASS-BRIEF.md
 * has the sources), because those are the two a reader's browser has been trained on.
 */

/**
 * The Show / Hide control beside a password field.
 *
 * Its name says what it does to the password ("Show password"), not just "Show", and a
 * polite live region says what happened, because a sighted reader sees the dots turn into
 * letters and a screen reader user otherwise hears nothing at all.
 */
export function wirePasswordToggles(root: ParentNode = document): void {
  root.querySelectorAll<HTMLButtonElement>('.ac-show[data-show]').forEach(toggle => {
    const field = document.getElementById(toggle.dataset.show ?? '') as HTMLInputElement | null;
    if (!field) return;
    const said = document.createElement('span');
    said.className = 'sr-only';
    said.setAttribute('aria-live', 'polite');
    toggle.after(said);

    const paint = (visible: boolean, announce: boolean) => {
      field.type = visible ? 'text' : 'password';
      toggle.textContent = visible ? 'Hide' : 'Show';
      toggle.setAttribute('aria-label', visible ? 'Hide password' : 'Show password');
      toggle.setAttribute('aria-pressed', String(visible));
      if (announce) said.textContent = visible ? 'Your password is visible' : 'Your password is hidden';
    };
    paint(false, false);
    toggle.addEventListener('click', () => paint(field.type === 'password', true));
    // Put back to dots on the way out and on the way back in, so a password left showing is
    // never what the next person at this screen, or the back button, finds.
    field.form?.addEventListener('submit', () => paint(false, false));
    window.addEventListener('pageshow', event => {
      if ((event as PageTransitionEvent).persisted) paint(false, false);
    });
  });
}

/**
 * Where to go after logging in: the page they came from, if it is one of ours.
 *
 * Only a path on this site. `//evil.example` and `/\evil.example` are both read by browsers
 * as another host, so anything that is not a plain single-slash path goes to the profile.
 */
export function safeNext(raw: string | null | undefined, fallback = '/me/'): string {
  const value = (raw ?? '').trim();
  if (!value.startsWith('/') || value.startsWith('//') || value.startsWith('/\\')) return fallback;
  if (value.startsWith('/account/')) return fallback;
  return value;
}

/** Mark the fields a failure belongs to, and tie them to the sentence that says so. */
export function flagFields(fields: (HTMLInputElement | null)[], on: boolean): void {
  for (const field of fields) {
    if (!field) continue;
    if (on) field.setAttribute('aria-invalid', 'true');
    else field.removeAttribute('aria-invalid');
  }
}

/**
 * The address somebody typed, carried from one account page to the next (log in to
 * "forgot your password", for instance) so they never type it twice. Session storage, not
 * the address bar: an email address has no business in a URL or a server log.
 */
const TYPED = 'ww.acct.typed';
export function carryEmail(value: string): void {
  try {
    const clean = value.trim();
    if (clean) sessionStorage.setItem(TYPED, clean);
  } catch {
    /* storage refused: they type it again, which is all that happens */
  }
}
export function carriedEmail(): string {
  try {
    return sessionStorage.getItem(TYPED) ?? '';
  } catch {
    return '';
  }
}
