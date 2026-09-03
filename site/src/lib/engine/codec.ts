/**
 * Permalink codec, parameterised by radix and slot count rather than hard-coded to
 * six axes and base 13. The radix is the number of values a group can actually take,
 * so every reachable result round-trips exactly and no code decodes to a score the
 * instrument cannot produce.
 */

export interface Codec {
  readonly radix: number;
  readonly slots: number;
  readonly length: number;
  encode(values: number[]): string;
  decode(code: string): number[] | null;
}

export function makeCodec(radix: number, slots: number): Codec {
  if (!Number.isInteger(radix) || radix < 2) throw new Error(`bad radix: ${radix}`);
  if (!Number.isInteger(slots) || slots < 1) throw new Error(`bad slot count: ${slots}`);

  const steps = radix - 1;
  const max = Math.pow(radix, slots);
  if (!Number.isSafeInteger(max)) throw new Error(`radix^slots overflows: ${radix}^${slots}`);
  const length = Math.max(6, max.toString(36).length);

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
      return n.toString(36).toUpperCase().padStart(length, '0');
    },

    decode(code: string): number[] | null {
      if (typeof code !== 'string') return null;
      if (code.length !== length || !/^[0-9A-Z]+$/i.test(code)) return null;
      let n = parseInt(code, 36);
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
