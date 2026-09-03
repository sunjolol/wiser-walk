/**
 * One place that knows where environment variables actually live, because it is three
 * different places depending on where the code is running:
 *
 *   import.meta.env  — Vite's, which is what a local `.env` file populates. In production
 *                      these are inlined at build time.
 *   process.env      — the Node process. This is what Vercel injects into the serverless
 *                      function at runtime, and what a shell export sets.
 *   locals.runtime   — the adapter's own bag, on runtimes that pass one.
 *
 * Read in that order so the most runtime-specific value wins. Reading only one of them is
 * how a key that is correctly set ends up looking unset.
 */
export type Env = Record<string, string | undefined>;

export function readEnv(locals?: unknown): Env {
  const fromVite = (import.meta.env ?? {}) as Env;
  const fromNode = (typeof process !== 'undefined' ? process.env : {}) as Env;
  const fromRuntime = ((locals as { runtime?: { env?: Env } } | undefined)?.runtime?.env ?? {}) as Env;
  return { ...fromVite, ...fromNode, ...fromRuntime };
}
