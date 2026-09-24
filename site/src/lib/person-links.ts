/**
 * Where a person the site names has a page of their own.
 *
 * The owner, 2026-09-24: "None of the saint cards under 'who else was like this' can be clicked,
 * yet we already have individual pages for many of them ... We really need to make sure we're
 * cross-linking as much as possible so people can keep diving deeper." So every person the
 * Christian Personality Test shows (its saints and Bible figures, the opposites, the saints
 * behind it) links to that person's page wherever one exists, and this is the one place that
 * says where.
 *
 * A person is known by their picture's key: the `img` of a kindred or an opposite in
 * src/data/personality.json ('martin-of-tours', 'martha'), which is the same slug the two
 * existing sets of pages use:
 *
 *   /early-christian/<slug>/   the 22 people of "Which early Christian thinks like you?"
 *                              (src/data/which-early-christian.json, people[*].slug)
 *   /figure/<slug>/            the 25 people of the Bible figure quiz
 *                              (src/data/bible-figures.json, figures[*].slug)
 *
 * ON HOLD, 2026-09-24. The owner then decided on a full Saints database, with a richer page per
 * saint, and asked not to link to /early-christian/ and /figure/ in the meantime ("we'll just need
 * to re-do that again later"). So this returns null for everyone and every card renders plain.
 * The cards are already built to take a link: when the hub lands, return its page here (by the
 * same picture keys) and every card, pair and name across the test follows.
 *
 * SERVER ONLY. Import it in front matter; a <script> must never import it.
 */

/** The page for the person with this picture key, or null while the Saints hub is being built. */
export const personHref = (_img: string | null | undefined): string | null => null;

/**
 * A linked name split where it may wrap: [the start, the end]. The end is the last two words of
 * a longer name ("the Theologian", "of Tours"), and the page keeps it on one line with the arrow
 * after it. So a name that wraps never leaves one word alone on its last line (the owner's rule
 * for the whole site), and the arrow never stands alone either.
 */
export const nameEnds = (name: string): [string, string] => {
  const words = name.split(' ');
  const keep = words.length >= 3 ? 2 : 1;
  return [words.slice(0, -keep).join(' ') + (words.length > keep ? ' ' : ''), words.slice(-keep).join(' ')];
};
