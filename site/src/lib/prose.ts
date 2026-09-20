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
 */
export function paragraphs(text: string, per = 3): string[] {
  const sentences = text.trim().split(/(?<=[.?!])\s+(?=[A-Z“"])/);
  const out: string[] = [];
  for (let i = 0; i < sentences.length; i += per) {
    out.push(sentences.slice(i, i + per).join(' '));
  }
  return out;
}
