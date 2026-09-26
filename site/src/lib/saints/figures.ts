/**
 * Bible figure pages with a page of their own, drawn like a saint's (components/PersonPage.astro):
 * src/data/figures/<slug>.json, in the SaintPage shape, slug = the figure quiz's slug. The owner,
 * 2026-09-26: the figure pages become "a lightened version of the saints pages". A figure without
 * a file keeps the quiz page it has always had (pages/figure/[slug].astro).
 */
import type { SaintPage } from './types';

const files = import.meta.glob<SaintPage>('../../data/figures/*.json', { eager: true, import: 'default' });

export const FIGURE_PAGES: Record<string, SaintPage> = Object.fromEntries(
  Object.values(files).map(p => [p.slug, p])
);

/**
 * Pictures for a figure the quiz names who has no page yet, so no card or band picture of
 * their own. Only Jesus, whose page needs its own plan: the owner, 2026-09-25, asked for
 * "another image for Him" than Doré's crowded Sermon on the Mount plate (jesus.jpg, which the
 * quiz still uses elsewhere). This is the 6th-century Christ Pantocrator icon of St Catherine's
 * Monastery, Sinai (public domain; CREDITS.md). `card` is the share card's picture, `band` the
 * result page's band where He is the closest, placed so His face is in frame at every width.
 * A figure that gets a page takes FIGURE_PAGES' pictures instead.
 */
export const FIGURE_PICTURES: Record<string, {
  card: { img: string; focus: string };
  band: { src: string; posM: string; posD: string };
}> = {
  jesus: {
    card: { img: '/img/figures/jesus-icon-card.jpg', focus: '50% 38%' },
    band: { src: '/img/figures/jesus-icon-band.jpg', posM: '50% 20%', posD: '50% 20%' }
  }
};
