/**
 * Permalink codec, parameterised by radix and slot count rather than hard-coded to
 * six axes and base 13. The radix is the number of values a group can actually take,
 * so every reachable result round-trips exactly and no code decodes to a score the
 * instrument cannot produce.
 */

export interface Codec {
  readonly radix: number;
  readonly slots: number;
  /** Total characters, including any quiz prefix. */
  readonly length: number;
  encode(values: number[]): string;
  decode(code: string): number[] | null;
}

/**
 * `prefix` binds a code to its quiz.
 *
 * Without it, two quizzes whose radix^slots ranges overlap accept each other's codes. That
 * is not hypothetical: the Compass is 13^6 = 4,826,809 and the seven deadly sins 9^7 =
 * 4,782,969, both six base-36 characters, so a Compass code pasted under the sins slug
 * decoded to a complete, plausible, entirely fabricated result. A wrong URL must 404, not
 * invent an answer — that is the same rule the junk-code test already enforces.
 *
 * The Compass takes NO prefix, because its permalinks are already live and a result link is
 * the only copy of a result that exists. Every other quiz takes one, and the registry
 * enforces that at most one quiz can go without — so the ambiguity cannot come back.
 */
export function makeCodec(radix: number, slots: number, prefix = ''): Codec {
  if (!Number.isInteger(radix) || radix < 2) throw new Error(`bad radix: ${radix}`);
  if (!Number.isInteger(slots) || slots < 1) throw new Error(`bad slot count: ${slots}`);

  const steps = radix - 1;
  const max = Math.pow(radix, slots);
  if (!Number.isSafeInteger(max)) throw new Error(`radix^slots overflows: ${radix}^${slots}`);
  if (prefix && !/^[A-Z]{1,3}$/.test(prefix)) throw new Error(`bad code prefix: ${prefix}`);
  const body = Math.max(6, max.toString(36).length);
  const length = prefix.length + body;

  return {
    radix,
    slots,
    length,

    encode(values: number[]): string {
      let n = 0;
      for (let i = 0; i < slots; i++) {
        const v = values[i] ?? 50;
        const step = Math.max(0, Math.min(steps, Math.round((v * steps) / 100)));
        n = n * radix + step;
      }
      return prefix + n.toString(36).toUpperCase().padStart(body, '0');
    },

    decode(code: string): number[] | null {
      if (typeof code !== 'string') return null;
      if (code.length !== length || !/^[0-9A-Z]+$/i.test(code)) return null;
      if (prefix && code.slice(0, prefix.length).toUpperCase() !== prefix) return null;
      let n = parseInt(code.slice(prefix.length), 36);
      if (!Number.isFinite(n) || n < 0 || n >= max) return null;
      const out: number[] = [];
      for (let i = 0; i < slots; i++) {
        out.unshift(Math.round(((n % radix) * 100) / steps));
        n = Math.floor(n / radix);
      }
      return n === 0 ? out : null;
    }
  };
}
