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
