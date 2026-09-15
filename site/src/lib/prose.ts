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
