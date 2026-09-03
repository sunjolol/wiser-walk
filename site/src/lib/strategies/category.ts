/**
 * Highest-category-wins: unipolar categories, each scored 0..100, ranked.
 * This is the strategy the spiritual-gifts and seven-deadly-sins quizzes need.
 *
 * It deliberately reuses the same 0..100-per-group value shape as the bipolar
 * strategy, so the permalink codec, the result page and the share card stay generic.
 */
import { makeCodec } from '../engine/codec';
import type { Bar, Quiz, QuizResult, ScoringStrategy, Sheet } from '../engine/types';

function spanOf(quiz: Quiz, group: number): number {
  let n = 0;
  for (const item of quiz.items) if (item.group === group) n++;
  return n * 2;
}

function codecFor(quiz: Quiz) {
  return makeCodec(quiz.config.radix, quiz.groups.length);
}

/** How far above the midpoint this category sits, as a share of the half-scale. */
export function pull(score: number): string {
  if (score <= 50) return 'not a strong pull';
  return `${Math.round(((score - 50) / 50) * 100)}% pull`;
}

export const category: ScoringStrategy = {
  id: 'category-highest',

  score(quiz: Quiz, sheet: Sheet): number[] {
    const raw = new Array(quiz.groups.length).fill(0);
    quiz.items.forEach((item, i) => {
      raw[item.group] += item.direction * (sheet[i] ?? 0);
    });
    return raw.map((r, g) => {
      const span = spanOf(quiz, g);
      return span === 0 ? 50 : Math.round(((r + span) / (span * 2)) * 100);
    });
  },

  result(quiz: Quiz, values: number[]): QuizResult {
    const ranked = quiz.groups
      .map((g, i) => ({ name: g.name, slug: g.slug, score: values[i] ?? 50 }))
      .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));

    const bars: Bar[] = quiz.groups.map((g, i) => ({
      label: g.name,
      value: values[i] ?? 50,
      emoji: g.emoji,
      lean: pull(values[i] ?? 50)
    }));

    const flat = values.every(s => Math.abs(s - 50) <= quiz.config.centerUnits);
    const tied =
      ranked[1] !== undefined &&
      Math.abs(ranked[0]!.score - ranked[1]!.score) <= quiz.config.tieUnits;

    let headline: string;
    let summary: string;
    if (flat) {
      headline = 'No single one stands out';
      summary = 'Your answers sit near the middle throughout, so no category is named.';
    } else if (tied) {
      headline = `${ranked[0]!.name} and ${ranked[1]!.name}`;
      headline = headline.charAt(0).toUpperCase() + headline.slice(1);
      summary = `Two came out level: ${ranked[0]!.name} and ${ranked[1]!.name}.`;
    } else {
      headline = ranked[0]!.name.charAt(0).toUpperCase() + ranked[0]!.name.slice(1);
      summary = `Strongest pull: ${ranked[0]!.name}. Next: ${ranked[1]?.name ?? '—'}.`;
    }

    return {
      quizSlug: quiz.slug,
      code: this.encode(quiz, values),
      headline,
      summary,
      bars,
      ranked
    };
  },

  encode: (quiz, values) => codecFor(quiz).encode(values),
  decode: (quiz, code) => codecFor(quiz).decode(code),

  shareText(quiz: Quiz, values: number[], origin: string): string {
    const lines = [quiz.shareTitle];
    const ranked = quiz.groups
      .map((g, i) => ({ g, v: values[i] ?? 50 }))
      .sort((a, b) => b.v - a.v);
    ranked.forEach(({ g, v }) => {
      const at = Math.max(0, Math.min(10, Math.round(v / 10)));
      let bar = '';
      for (let k = 0; k < 11; k++) bar += k <= at ? '█' : '░';
      lines.push(`${g.emoji ?? '·'} ${bar} ${g.name}`);
    });
    lines.push(`${origin}/r/${quiz.slug}/${this.encode(quiz, values)}`);
    return lines.join('\n');
  }
};
