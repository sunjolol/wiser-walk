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
 * THE SAINTS HUB IS LIVE (2026-09-25). The owner had put this on hold while the hub was built,
 * so that nothing would have to be re-done ("we'll just need to re-do that again later"). Now a
 * person's page is looked up in one place, the hub's own list (lib/saints/data.ts), which knows
 * whether he has a full /saints/ page yet or is still on /early-christian/, so a saint who moves
 * takes every card that names him along with him and nothing here changes. Bible people link to
 * the Bible figure quiz's pages. Someone with no page yet (Mary of Bethany, Arsenius, Monica,
 * Isaiah, Jeremiah, Cuthbert, Guthlac, Philip Neri) renders plain, as every card did before.
 *
 * SERVER ONLY. Import it in front matter; a <script> must never import it.
 */
import figures from '../data/bible-figures.json';
import { hubHref } from './saints/data';

const FIGURES = new Set((figures as { figures: Array<{ slug: string }> }).figures.map(f => f.slug));

/** The page for the person with this picture key, or null where the site has none yet. */
export const personHref = (img: string | null | undefined): string | null => {
  if (!img) return null;
  return hubHref(img) ?? (FIGURES.has(img) ? `/figure/${img}/` : null);
};

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
