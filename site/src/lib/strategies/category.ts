/**
 * Highest-category-wins: unipolar categories, each scored 0..100, ranked.
 * This is the strategy the spiritual-gifts and seven-deadly-sins quizzes need.
 *
 * It deliberately reuses the same 0..100-per-group value shape as the bipolar
 * strategy, so the permalink codec, the result page and the share card stay generic.
 */
import { makeCodec } from '../engine/codec';
import { groupNoteFor, resultNotes } from '../engine/types';
import type { Quiz, ScoringStrategy, Sheet, UnipolarRow, UnipolarView } from '../engine/types';

function spanOf(quiz: Quiz, group: number): number {
  // Each statement counts its weight (1 unless the quiz says otherwise) at up to two points.
  let n = 0;
  for (const item of quiz.items) if (item.group === group) n += item.weight ?? 1;
  return n * 2;
}

function codecFor(quiz: Quiz) {
  return makeCodec(quiz.config.radix, quiz.groups.length, quiz.codePrefix ?? '');
}

/**
 * A code from an earlier shape of the quiz (Quiz.legacyCodes), read into today's groups by
 * key: a group no longer scored is dropped, and one the old code lacks reads as 50, no net
 * agreement. The gifts' old codes (nineteen gifts at radix 13) land exactly on today's grid,
 * because a thirteenth of the range is five sixtieths.
 */
function decodeLegacy(quiz: Quiz, code: string): number[] | null {
  for (const old of quiz.legacyCodes ?? []) {
    const values = makeCodec(old.radix, old.keys.length, old.prefix).decode(code);
    if (!values) continue;
    const byKey = new Map(old.keys.map((k, i) => [k, values[i]!]));
    return quiz.groups.map(g => byKey.get(g.key) ?? 50);
  }
  return null;
}

/**
 * How strongly a category came out, in words.
 *
 * No percentage and no 0..100 number appears anywhere in a unipolar result, including the
 * aria-labels. At two items per group only nine values are reachable and they sit 12.5
 * points apart, so "63%" claims a precision the instrument cannot express — and it invites
 * "I am 63% Wrath", which is not a claim the data makes. The words are cut on reachable
 * STEPS above the point where agreement and disagreement cancelled out, so they track what
 * was actually measured however long the instrument is.
 *
 * The previous version returned "not a strong pull" for every value at or below 50 — five
 * of the nine reachable values — so a reader who disagreed with every statement about a
 * vice read identically to one who was perfectly balanced on it. That distinction is real
 * and worth keeping.
 */
const ABOVE = ['', 'a slight pull', 'a clear pull', 'a strong pull', 'the strongest here'];
const BELOW = 'leaned away';
const LEVEL = 'no pull either way';

/**
 * The words above were written for VICES, where "leaned away" is good news. A quiz whose
 * categories are gifts supplies its own through `unipolarCopy.strength`; one that supplies
 * nothing keeps these exactly, so the seven-deadly-sins draft is unchanged.
 */
export function pull(quiz: Quiz, score: number): string {
  const words = quiz.unipolarCopy?.strength;
  const above = words ? words.above : ABOVE.slice(1);
  if (score < 50) return words?.below ?? BELOW;
  if (score === 50) return words?.level ?? LEVEL;
  const half = Math.max(1, (quiz.config.radix - 1) / 2);
  /*
   * Rungs above the middle, counted from the rounded score back to a whole rung. It used to
   * work on the rounded score itself, so on the sins quiz (rungs 12.5 points apart) 62.5
   * became 63 and read "a clear pull", 87.5 became 88 and read "the strongest here", and
   * "a slight pull" and "a strong pull" could never print at all (found 2026-09-22).
   */
  const steps = Math.round(((score - 50) / 50) * half);
  return above[Math.min(3, Math.max(0, Math.ceil((steps / half) * 4) - 1))]!;
}

/**
 * How close two categories must be to count as level.
 *
 * Expressed in REACHABLE STEPS, not points, because a point is not a constant: at two items
 * per group the scale has 9 rungs 12.5 points apart, and at six it has 25 rungs 4.2 apart.
 * A fixed 8-point threshold means "exact tie only" on the first and "two rungs apart is a
 * tie" on the second. `tieSteps` says what was actually meant, at any length of instrument.
 */
function tieMargin(quiz: Quiz): number {
  // 0 is a real setting ("an exact tie only", the sins quiz's), not a missing one; it was
  // quietly raised to 1 until 2026-09-22, so two vices a rung apart printed as level.
  const steps = Math.max(0, quiz.config.tieSteps ?? 1);
  const rung = 100 / Math.max(1, quiz.config.radix - 1);
  return steps * rung + 0.5; // the half-point absorbs score()'s rounding
}

/**
 * Whether anything rose far enough above no-net-agreement to be worth naming.
 *
 * This deliberately does NOT ask how far each score sits from 50 in either direction. That
 * is the bipolar question, and asking it here produced a real and ugly failure: a reader who
 * answered "that is not me" to every statement scored 0 on all seven vices, and was told
 * they were "Envy and gluttony" — the alphabetically first two of seven tied at the bottom.
 * The most emphatic denial the instrument accepts came back as an accusation.
 */
function namingFloor(quiz: Quiz): number {
  return quiz.config.namingFloor ?? 10;
}

function nothingNamed(quiz: Quiz, values: number[]): boolean {
  const floor = namingFloor(quiz);
  return values.every(v => v - 50 <= floor);
}

/**
 * How many level categories are still a result rather than a shrug.
 *
 * Above this the page would print a list as long as a hand and call it a verdict, which
 * says less than saying nothing: thirteen gifts with five at the top is the flat state
 * wearing a headline. Four is the largest list that still reads as "these, and not the
 * others" in one breath.
 */
const MOST_NAMED = 4;

/** "a", "a and b", "a, b and c" — commas, a final "and", and no comma before it. */
function joinNames(names: string[]): string {
  if (names.length < 2) return names[0] ?? '';
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
}

/** Said in words, because "3 came out level" is an arithmetic result, not a sentence. */
const HOW_MANY = ['', '', 'Two', 'Three', 'Four'];
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export const category: ScoringStrategy = {
  id: 'category-highest',
  shape: 'unipolar',

  score(quiz: Quiz, sheet: Sheet): number[] {
    const raw = new Array(quiz.groups.length).fill(0);
    quiz.items.forEach((item, i) => {
      raw[item.group] += item.direction * (sheet[i] ?? 0) * (item.weight ?? 1);
    });
    return raw.map((r, g) => {
      const span = spanOf(quiz, g);
      return span === 0 ? 50 : Math.round(((r + span) / (span * 2)) * 100);
    });
  },

  result(quiz: Quiz, values: number[]): UnipolarView {
    const ranked = quiz.groups
      .map((g, i) => ({ name: g.name, slug: g.slug, score: values[i] ?? 50 }))
      .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));

    // Rank by slug, so rows can stay in quiz order and still know where they placed.
    const place = new Map(ranked.map((r, i) => [r.slug, i + 1]));
    const rows: UnipolarRow[] = quiz.groups.map((g, i) => ({
      key: g.key,
      slug: g.slug,
      name: g.name,
      value: values[i] ?? 50,
      rank: place.get(g.slug) ?? i + 1,
      below: (values[i] ?? 50) < 50,
      strength: pull(quiz, values[i] ?? 50)
    }));

    /*
     * EVERY category inside the margin, not the top two.
     *
     * The tie used to be "is the second within the margin of the first", so a result where
     * four gifts came out level named two of them — and which two was decided by
     * localeCompare, the tiebreak in the sort above. Spelling is not a finding about a
     * reader, and a reader who scored the same on administration, giving, mercy and serving
     * was told they were "administration and giving" because a sorts before g. `ranked` is
     * in descending score order, so everything inside the margin is a prefix of it.
     */
    const flatScores = nothingNamed(quiz, values);
    const top = ranked[0]?.score ?? 50;
    /*
     * Being close to the leader is not enough: a row must clear the naming floor ITSELF.
     *
     * The floor is the line below which this instrument says nothing stood out, and the
     * leader has always had to clear it. A row a single rung behind had not, so on the gifts
     * quiz a reader whose best other row was 75 was also told 67 — which is exactly what
     * agreeing with everything scores, on every row, for everybody. Naming a row at the
     * number a content-free sheet produces is naming the keying, not the reader.
     */
    const floor = namingFloor(quiz);
    const level = ranked.filter(r => top - r.score <= tieMargin(quiz) && r.score - 50 > floor);
    /*
     * Five or more level is the flat state, and says so in the flat state's own words.
     * Nothing stood out; a list of five is the instrument admitting that, at length.
     */
    /*
     * A quiz that caps the headline (unipolarCopy.headlineMost, the gifts: the owner, 2026-09-25,
     * found "no single one stands out" over two bars that said "a lot of this") is flat only
     * when nothing clears the floor. A crowd level at the top is named, two of them, and counted.
     */
    const most = quiz.unipolarCopy?.headlineMost;
    const flat = flatScores || (!most && level.length > MOST_NAMED);
    const tied = !flat && level.length > 1;
    const names = level.map(r => r.name);

    /*
     * A quiz may put a lead in front of the leader's name ("Your answers pointed most to
     * serving"), because on a gifts quiz the largest type on the page would otherwise be a
     * bare one-word verdict about a person. Without a lead the name is capitalised, exactly
     * as it was.
     */
    const lead = quiz.unipolarCopy?.headlineLead;
    const name = (s: string) => (lead ? s : s.charAt(0).toUpperCase() + s.slice(1));
    const led = (s: string) => (lead ? `${lead} ${s}` : name(s));

    let headline: string;
    let summary: string;
    let state: UnipolarView['state'];
    if (flat) {
      // "Flat", never "central": a ranking has no centre to sit in the middle of.
      state = 'flat';
      headline = 'No single one stands out';
      // True whether the reader answered neutrally throughout or denied every statement
      // outright. The old copy ("your answers sit near the middle") was false for the second.
      summary =
        quiz.unipolarCopy?.flat ??
        'Nothing here rose far enough above the rest to name one, so none is named.';
    } else if (tied && most) {
      /*
       * The headline is the names and nothing else (the quiz's lead goes above it, through
       * leadFor), at most `most` of them; the rest are counted there and named underneath.
       */
      state = 'tie';
      const shown = names.slice(0, most);
      const extra = names.slice(most);
      headline = cap(joinNames(extra.length ? [...shown, `${extra.length} more`] : shown));
      summary = !extra.length
        ? `The ${HOW_MANY[shown.length]?.toLowerCase() || shown.length} came out level at the top.`
        : extra.length <= 3
          ? `Level with them: ${joinNames(extra)}.`
          : `${extra.length} more came out level with them. The bars below show them all.`;
    } else if (tied) {
      state = 'tie';
      headline = led(joinNames(names));
      summary = `${HOW_MANY[names.length]} came out level: ${joinNames(names)}.`;
    } else if (most) {
      state = 'clear';
      headline = cap(ranked[0]!.name);
      const rest = ranked.slice(1);
      const next = rest.filter(r => r.score === rest[0]?.score && r.score - 50 > floor);
      summary = next.length && next.length <= MOST_NAMED
        ? `Next: ${joinNames(next.map(r => r.name))}.`
        : `${cap(ranked[0]!.name)} came out highest.`;
    } else {
      state = 'clear';
      headline = led(ranked[0]!.name);
      /*
       * Under a lead the headline is already the sentence "Your answers pointed most to
       * tongues", and the summary printed beneath it used to open by saying it again. It now
       * says the one thing the headline does not: what came next. "Next" is every row on the
       * second-highest score, not the first of them by spelling, and only rows that clear
       * the naming floor themselves; more than four level is a crowd, not a runner-up, and
       * is left unsaid. The summary is also the page's meta description, so it has to stand
       * on its own: it names the leader in its own words.
       */
      const first = ranked[0]!.name;
      const rest = ranked.slice(1);
      const next = rest.filter(r => r.score === rest[0]?.score && r.score - 50 > floor);
      const nextNames = next.length && next.length <= MOST_NAMED ? ` Next: ${joinNames(next.map(r => r.name))}.` : '';
      summary = lead
        ? `${first.charAt(0).toUpperCase() + first.slice(1)} came out highest.${nextNames}`
        : // The same "Next" rule as above. It used to be whichever row sorted second, so a
          // vice the reader leaned away from could print as "Next" because of its spelling.
          `Strongest pull: ${ranked[0]!.name}.${nextNames}`;
    }

    return {
      shape: 'unipolar',
      state,
      quizSlug: quiz.slug,
      code: this.encode(quiz, values),
      // What the ranking emphasises: nothing on a flat result, every level category on a
      // tie, the leader otherwise. The stack reads its lead rows from this rather than
      // assuming a tie is two names.
      named: flat ? [] : level.map(r => r.slug),
      headline,
      // A ranking has no side to colour by; the clause is the whole headline.
      headlineParts: [{ text: headline, side: 'centre' as const }],
      summary,
      rows,
      ranked
    };
  },

  encode: (quiz, values) => codecFor(quiz).encode(values),
  decode: (quiz, code) => codecFor(quiz).decode(code) ?? decodeLegacy(quiz, code),

  shareText(quiz: Quiz, values: number[], origin: string): string {
    const lines = [quiz.shareTitle];
    const ranked = quiz.groups
      .map((g, i) => ({ g, v: values[i] ?? 50 }))
      .sort((a, b) => b.v - a.v);
    /*
     * Filled from the PULL, not from the raw score.
     *
     * The eleven-slot bar is an audited Compass artifact, and on that bar the middle slot
     * is the centre of a two-ended axis. Reused here with `round(v / 10)`, a perfectly
     * neutral 50 filled six of eleven cells — telling a reader they were somewhat envious
     * for having answered neither way. The bipolar card marks a POSITION and this one
     * shows a MAGNITUDE; that difference is the whole reason there are two of them, and
     * nobody should later "unify" them.
     */
    const CELLS = 11;
    /*
     * A quiz may print only its top rows. On a gifts quiz the bottom of the ranking is the
     * part a reader would least want pasted into a group chat, and the low rows carry a
     * caveat on the page ("a pattern these statements did not find") that a bar in a text
     * message cannot carry with them. Omit shareTop and every row prints, as before.
     */
    const top = quiz.unipolarCopy?.shareTop;
    const printed = top ? ranked.slice(0, Math.max(1, top)) : ranked;
    printed.forEach(({ g, v }) => {
      const filled = Math.max(0, Math.min(CELLS, Math.round(((v - 50) / 50) * CELLS)));
      let bar = '';
      for (let k = 0; k < CELLS; k++) bar += k < filled ? '█' : '░';
      lines.push(`${bar} ${g.name}`);
    });
    // A named outcome's own sentence travels with it here too, by the same rule as the
    // bipolar card. No ranked quiz lists outcomes today, so today this adds nothing.
    for (const note of resultNotes(quiz, this.result(quiz, values))) lines.push(note);
    /*
     * ...and a sentence that travels with a GROUP name, against the rows this text actually
     * printed rather than the rows the headline named. The share text prints the top three,
     * so a gift the page did not name can still be pasted into a group chat by name — and it
     * is the name travelling that the sentence has to travel with.
     */
    for (const note of groupNoteFor(quiz, printed.map(({ g }) => g.slug), 'share')) {
      lines.push(note);
    }
    lines.push(`${origin}/r/${quiz.slug}/${this.encode(quiz, values)}`);
    return lines.join('\n');
  }
};
