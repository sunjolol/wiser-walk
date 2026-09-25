/**
 * The early Christians who have moved to the Saints hub.
 *
 * The owner, 2026-09-24: each of the 22 people of "Which early Christian thinks like you?" moves
 * from /early-christian/<slug>/ to /saints/<slug>/ only when his new page is as full as St
 * Martin's. This is the list of those who have. Adding a slug here, with its data file in
 * src/data/saints/ and its 301 in vercel.json, is the whole move: every link on the site (the
 * quiz's results, its person and question pages, the hub, the personality test's cards) goes
 * straight to the new page, and the old page stops being built.
 *
 * scripts/saints-test.mjs checks that this list, the data files and the redirects agree.
 *
 * Browser-safe: a plain list, no data. When all 22 have moved, /early-christian/ itself
 * redirects to /saints/ (design/saints-hub/README.md).
 */
export const MOVED: readonly string[] = ['martin-of-tours'];

export const hasMoved = (slug: string) => MOVED.includes(slug);
