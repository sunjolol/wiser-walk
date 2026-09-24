/**
 * The Christian Personality Test's eight paintings: where each one is cropped, and where each
 * type's page is.
 *
 * Every place that shows a type's painting cuts it to a shape of its own: a wide strip in the
 * result page's type popups, a card in a grid, the tall hero on a phone, the band on a type's
 * page. Centred, those crops cut off the very thing the painting is about. The owner, 2026-09-24:
 * in the Deep Well's popup on a desktop "the image is cut off at the top, it should be offset a
 * bit so you can see the faces at the well; the Herald has the same issue".
 *
 * So each painting has a focal point here, as a CSS object-position, and every strip and card
 * crop uses it. An object-position of "40% 15%" pins the point 40% across and 15% down the
 * painting to the same place in the box, so that point stays in view whatever shape the box is.
 * Each value is where the painting's people are (or, for the two landscapes, its subject), tuned
 * by capture at 390 and 1360 wide:
 *
 *   hearth       the three friends' faces across the table, a little above the middle
 *   spark        the dancers' faces across the middle
 *   deepwell     Eliezer drinking and Rebecca's face, near the top and left of centre
 *   forge        the smith and the family in the firelight, right of centre
 *   stillwater   the monastery over the river
 *   lookout      a tall painting: the bell and the lookout's face under it, left of centre
 *   oak          the tree
 *   herald       Paul with his hands raised, high on the left
 *
 * Browser-safe: no data, nothing but these strings. The type pages and the result page read it
 * on the server; a script may import typeHref.
 */
const FOCUS: Record<string, string> = {
  hearth: '50% 40%',
  spark: '50% 40%',
  deepwell: '40% 16%',
  forge: '62% 52%',
  stillwater: '50% 40%',
  lookout: '35% 72%',
  oak: '50% 40%',
  herald: '34% 26%'
};

/*
 * The result page's hero is a shape of its own: tall on a phone (the painting's full height, a
 * half of its width) and near square from 48rem. Two paintings want another point there:
 *
 *   hearth    64% across on the tall phone hero, so the wife and Otto Benzon are both in view
 *             (centred, he was cut in half); from 48rem the whole width shows anyway
 *   lookout   centred, as production had it: the whole bell and its bracket. The strip's low
 *             point lost the bell's top in the near-square hero
 *
 * The other six keep their strip point, which is as good as or better than centred there.
 */
const HERO: Record<string, string> = { ...FOCUS, hearth: '64% 40%', lookout: '50% 50%' };

/** The object-position for a type's painting, by the type's key; 'hero' for the result's hero. */
export const focusOf = (type: string, shape?: 'hero'): string =>
  (shape === 'hero' ? HERO[type] : FOCUS[type]) ?? '50% 50%';

/** A type's own page: /personality-type/<key>/ (the quiz's outcomePathBase). */
export const typeHref = (type: string): string => `/personality-type/${type}/`;
