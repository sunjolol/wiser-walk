/**
 * The saints' data files carry three marks in their text and nothing else (lib/saints/types.ts,
 * "RICH TEXT"): **bold**, *italic* and {la|Latin} (or {el|Greek}). This turns them into HTML.
 * Everything else is escaped first, so a stray < in the data can never become markup.
 */
const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const rich = (s: string | undefined | null): string =>
  esc(String(s ?? ''))
    .replace(/\{(la|el)\|([^}]*)\}/g, '<i lang="$1">$2</i>')
    .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')
    .replace(/\*([^*]+)\*/g, '<i>$1</i>');

/** The same text with the marks taken off: for alt text, titles and JSON-LD. */
export const plain = (s: string | undefined | null): string =>
  String(s ?? '').replace(/\{(?:la|el)\|([^}]*)\}/g, '$1').replace(/\*\*([^*]+)\*\*/g, '$1').replace(/\*([^*]+)\*/g, '$1');

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const monthShort = (m: number) => MONTHS[m - 1] ?? '';

/** Numbers spelled out for "His life in six moments". */
const NUM = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];
export const spell = (n: number) => NUM[n] ?? String(n);
