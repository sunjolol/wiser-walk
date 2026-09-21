/**
 * Truncation for result-page prose.
 *
 * The rule is an audit rule, not a layout preference: **the first sentence, whole, never
 * mid-sentence**. It is deterministic, symmetric between two poles, needs no viewport
 * knowledge, and the summary splitter's anchor IS the thesis sentence, so the first
 * sentence is the pole's own claim rather than an arbitrary prefix. A clipped claim about
 * someone else's belief is worse than a short one.
 *
 * It lives here rather than inside one component because two pages now truncate the same
 * audited prose, and two copies of a rule like this drift.
 */
export const firstSentence = (text: string): string =>
  text.trim().split(/(?<=\.)\s+/)[0] ?? '';

/** True when the full text on the /axis/ page says more than the truncation shows. */
export const hasMore = (text: string): boolean =>
  text.trim().split(/(?<=\.)\s+/).length > 1;

/**
 * The same prose, broken into paragraphs, for a page that prints it WHOLE.
 *
 * Not a truncation and not an edit: every sentence is kept, in order, and the only thing
 * added is a paragraph break. It exists because the gifts draft's longest summaries run to
 * twelve sentences, and twelve sentences of display serif in one block at 390px is a wall a
 * reader scrolls past rather than reads. Breaking at a sentence end is the one break that
 * cannot change what a sentence says.
 *
 * The split point is a full stop, question mark or exclamation mark followed by a space and
 * a capital or an opening quotation mark, so a quoted question inside a sentence ("Do all
 * have gifts of healings?" (1 Corinthians 12:30)) and a verse reference in brackets both
 * stay where they are. A summary of three sentences or fewer comes back as one paragraph,
 * exactly as it was.
 *
 * A WRITER'S OWN BREAKS WIN, AND THE COUNT STILL GUARDS THE LENGTH (2026-09-21).
 *
 * Counting to three is blind to meaning: the gifts were rewritten as four themed blocks (what
 * it is, an ordinary week, how you notice it, the gift it gets confused with) and the
 * arithmetic cut across every one of them, leaving nine pages ending on a one-sentence
 * paragraph. Honouring the writer's blocks alone is not the answer either: one of them runs
 * to seven sentences, which is the wall this function exists to prevent.
 *
 * So both. A blank line in the source is a break that is always taken, and a block longer
 * than `per` is then broken inside itself, so no paragraph ever spans two themes and none
 * runs long. A block that ends on one spare sentence folds it back into the paragraph before
 * it, because a lone sentence under a paragraph of three reads as something the page dropped.
 * Text with no blank line behaves exactly as it always did, apart from that fold.
 */
export function paragraphs(text: string, per = 3): string[] {
  const out: string[] = [];
  for (const block of text.trim().split(/\n{2,}/).map(s => s.trim()).filter(Boolean)) {
    const sentences = block.split(/(?<=[.?!])\s+(?=[A-Z“"])/);
    const start = out.length;
    for (let i = 0; i < sentences.length; i += per) {
      out.push(sentences.slice(i, i + per).join(' '));
    }
    if (out.length - start > 1 && sentences.length % per === 1) {
      out.splice(out.length - 2, 2, out.slice(-2).join(' '));
    }
  }
  return out;
}
