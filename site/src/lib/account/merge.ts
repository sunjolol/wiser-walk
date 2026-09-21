/**
 * How two devices' game figures become one.
 *
 * Results merge by union (see `mergeShelves` in shelf.ts) because a finished result is a
 * fact with a time on it. Game figures are not like that: a best score is a maximum, a list
 * of seen lines is a set, a confusion tally is a sum, and a chosen canon is a preference
 * where the later choice is the real one. Four rules, one per shape.
 *
 * All seven keys are written out here although v1 only syncs three (`sls.best`, `wsi.best`,
 * `sls.canon`). The other four stay on the device for one reason: the games render their own
 * documents with no layout and no session code, and their storage lives in generated files
 * that must never be hand-edited. Writing the rules now, and testing them now, means the day
 * that changes is a wiring job and not a design job.
 */

/** Every key the two games keep, exactly as they spell them in their own storage. */
export const GAME_KEYS = [
  'sls.best',
  'sls.seen',
  'sls.fooled',
  'sls.canon',
  'wsi.best',
  'wsi.seen',
  'wsi.mix'
] as const;

export type GameKey = (typeof GAME_KEYS)[number];

/** What v1 actually carries between devices. */
export const SYNCED_GAME_KEYS: GameKey[] = ['sls.best', 'wsi.best', 'sls.canon'];

/**
 * A ceiling on a merged "seen" list.
 *
 * Each game empties its own list once it has shown most of its pool, so this number is not a
 * policy about play; it only stops the union of two devices' lists growing without bound in
 * storage the games themselves would have cleared by now.
 */
export const SEEN_CAP = 5000;

/** A value and when it last changed, which is the only way to settle a straight preference. */
export interface Stamped {
  value: unknown;
  /** Epoch milliseconds. */
  updatedAt: number;
}

/** Deep equality, the cheap way. Both sides came out of JSON in the first place. */
export function sameJson(a: unknown, b: unknown): boolean {
  try {
    return JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
  } catch {
    return false;
  }
}

type Shape = 'best' | 'seen' | 'counts' | 'choice';

/** Which rule a key follows. An unknown key has no rule and is never synced. */
function shapeOf(key: string): Shape | null {
  if (key === 'sls.best' || key === 'wsi.best') return 'best';
  if (key === 'sls.seen' || key === 'wsi.seen') return 'seen';
  if (key === 'sls.fooled' || key === 'wsi.mix') return 'counts';
  if (key === 'sls.canon') return 'choice';
  return null;
}

const isScore = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v) && v >= 0;

const isIdList = (v: unknown): v is string[] => Array.isArray(v) && v.every(x => typeof x === 'string');

const isTally = (v: unknown): v is Record<string, number> =>
  Boolean(v) && typeof v === 'object' && !Array.isArray(v) && Object.values(v as object).every(isScore);

function mergeSeen(a: string[], b: string[]): string[] {
  // Local first: its order is this device's idea of newest-first, and the cap should cut the
  // other device's older ids before this one's.
  const out: string[] = [];
  const seen = new Set<string>();
  for (const id of [...a, ...b]) {
    if (seen.has(id)) continue;
    seen.add(id);
    out.push(id);
    if (out.length >= SEEN_CAP) break;
  }
  return out;
}

function mergeTally(a: Record<string, number>, b: Record<string, number>): Record<string, number> {
  // A sum, not a maximum: two devices playing independently really did fool somebody twice.
  const out: Record<string, number> = { ...a };
  for (const [k, v] of Object.entries(b)) out[k] = (out[k] ?? 0) + v;
  return out;
}

/**
 * One key, merged.
 *
 * Either side may be null (this device has never played, or the account has never held it),
 * and either side may be junk somebody typed into storage by hand. Junk is dropped rather
 * than repaired, and a key with nothing usable on either side comes back null so the caller
 * writes nothing anywhere.
 */
export function mergeGame(key: string, local: Stamped | null, remote: Stamped | null): Stamped | null {
  const shape = shapeOf(key);
  if (!shape) return null;

  const l = local ? local.value : undefined;
  const r = remote ? remote.value : undefined;
  const lAt = local && Number.isFinite(local.updatedAt) ? local.updatedAt : 0;
  const rAt = remote && Number.isFinite(remote.updatedAt) ? remote.updatedAt : 0;
  const latest = Math.max(lAt, rAt);

  if (shape === 'best') {
    const a = isScore(l) ? l : null;
    const b = isScore(r) ? r : null;
    if (a === null && b === null) return null;
    return { value: Math.max(a ?? 0, b ?? 0), updatedAt: latest };
  }

  if (shape === 'seen') {
    const a = isIdList(l) ? l : null;
    const b = isIdList(r) ? r : null;
    if (!a && !b) return null;
    return { value: mergeSeen(a ?? [], b ?? []), updatedAt: latest };
  }

  if (shape === 'counts') {
    const a = isTally(l) ? l : null;
    const b = isTally(r) ? r : null;
    if (!a && !b) return null;
    return { value: mergeTally(a ?? {}, b ?? {}), updatedAt: latest };
  }

  // A choice. Nothing is combined: the person picked one, and the later picking is the one
  // they meant. A tie keeps this device's, because that is the one in front of them.
  const a = typeof l === 'string' && l ? l : null;
  const b = typeof r === 'string' && r ? r : null;
  if (!a && !b) return null;
  if (!a) return { value: b, updatedAt: rAt };
  if (!b) return { value: a, updatedAt: lAt };
  return rAt > lAt ? { value: b, updatedAt: rAt } : { value: a, updatedAt: lAt };
}
