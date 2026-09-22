/**
 * The Theology Compass's eighteen traditions as a CSV: one row a tradition, and for each of
 * the six axes the audited coordinate (0 = the left pole, 100 = the right pole) and the band
 * adjective the instrument prints for it. Built from compass.json through the same band()
 * the result page uses, so the file can never say something the site does not.
 *
 * The page that describes it, with the pole names and the licence, is /data/theology-compass/.
 */
import type { APIRoute } from 'astro';
import { getQuiz } from '../../lib/engine/registry';
import { band } from '../../lib/strategies/bipolar';

export function csvCell(value: string | number): string {
  const s = String(value);
  return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}

export function traditionsCsv(site: URL): string {
  const quiz = getQuiz('theology-compass')!;
  const head = ['tradition', 'slug', 'page'];
  for (const g of quiz.groups) head.push(`${g.slug}_score`, `${g.slug}_band`);
  const rows = quiz.outcomes.map(o => {
    const cells: Array<string | number> = [o.name, o.slug, new URL(`/tradition/${o.slug}/`, site).href];
    quiz.groups.forEach((g, i) => {
      const v = o.position?.[i] ?? 50;
      cells.push(v, g.bands?.[band(v)] ?? '');
    });
    return cells;
  });
  return [head, ...rows].map(r => r.map(csvCell).join(',')).join('\r\n') + '\r\n';
}

export const GET: APIRoute = context => {
  const site = context.site ?? new URL('https://wiserwalk.com/');
  return new Response(traditionsCsv(site), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'inline; filename="theology-compass-traditions.csv"'
    }
  });
};
