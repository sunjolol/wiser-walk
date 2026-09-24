// The Personality Quiz: deterministic scoring. Pure ES module (no Node APIs) so the preview and the site can share it.
// answers: { [itemId]: -3..3 } for two-sided items (-3 = very much side A), and { b1: [line...], b2: [line...] } for picks.
import { SCALES, ITEMS, THOUGHTS, LINES } from './items.mjs';
import { TYPES, LEANINGS, LINKS, HELP, VIRTUES } from './results.mjs';

export const BAND = 0.18;      // |value| below this: "names no leaning" (the striped middle)
export const LEAN = 2;         // an answer of at least "A" (|v| >= 2), not "a bit", counts for a link (round 3)
const level = (v) => ((v ?? -3) + 3) / 6;   // a "how often" answer as 0 (never) .. 1 (all the time)

const byId = Object.fromEntries(ITEMS.map((it) => [it.id, it]));
const otherPole = (scale, pole) => (SCALES[scale].left === pole ? SCALES[scale].right : SCALES[scale].left);

// The pole an answer leans to, or null when it sits in the middle (min = how strong the lean must be).
export function leanOf(itemId, v) { return leanAt(itemId, v, LEAN); }
function leanAt(itemId, v, min) {
  const it = byId[itemId];
  if (v == null || Math.abs(v) < min) return null;
  if (it.kind === 'freq') return v >= min ? it.thought : null;
  if (it.scale === 'front') return v < 0 ? 'Out in front' : 'Behind the scenes';
  return v < 0 ? it.a : otherPole(it.scale, it.a);
}

// The twelve private statements feed three things outside the private page: the trap check, how long anger lasts,
// and one help-card rule. A shared result carries only these few facts, never a private answer (the promise on the
// private block: "Nobody sees these answers"). derive() works them out on the device from the full answers.
export function derive(answers) {
  const S = scalesOf(answers);
  const lvl = (id) => level(answers[id]);
  const catchC = 0.65 * S.catch + 0.35 * S.temper;
  const holdC = 0.6 * S.hold + 0.4 * ((answers.y4 ?? 0) / 3);
  return {
    lowCheer: lvl('y1') < 0.5 && Math.max(lvl('y2'), lvl('y9')) < 0.5,
    lowSer: lvl('y4') < 0.5,
    lowConf: lvl('y5') < 0.5 && lvl('y10') < 0.5,
    angerCell: catchC < 0 ? (holdC > 0 ? 'worst' : 'reeds') : (holdC > 0 ? 'wood' : 'brief'),
    angerMiddle: Math.abs(catchC) < BAND && Math.abs(holdC) < BAND,
    hardToCorrect: lvl('y7') >= 0.5,
  };
}

function scalesOf(answers) {
  const sums = {}, counts = {};
  for (const it of ITEMS) {
    if (it.kind !== 'two' || !SCALES[it.scale]) continue;
    const v = answers[it.id];
    if (v == null) continue;
    const c = (it.a === SCALES[it.scale].left ? v : -v) / 3;
    sums[it.scale] = (sums[it.scale] || 0) + c;
    counts[it.scale] = (counts[it.scale] || 0) + 1;
  }
  const S = {};
  for (const k of Object.keys(SCALES)) S[k] = counts[k] ? sums[k] / counts[k] : 0;
  return S;
}

// answers: the full answers (on the device that took the quiz), or the public answers of a shared link together with
// `pub`, the facts derive() gave. With `pub`, the private page (thoughts) is not scored at all.
export function score(answers, pub = null) {
  // 1. Scales: every value runs from -1 (left pole) to +1 (right pole).
  const S = scalesOf(answers);
  const P = pub || derive(answers);

  // 2. The type: the stronger of the two disposition axes, in a quiet or restless mind.
  const dm = Math.abs(S.mood), dn = Math.abs(S.nerve);
  const moodDisp = S.mood < 0 ? 'cheerful' : 'serious';
  const nerveDisp = S.nerve < 0 ? 'confident' : 'careful';
  const disposition = dm >= dn ? moodDisp : nerveDisp;
  const secondDisposition = dm >= dn ? nerveDisp : moodDisp;
  const makeup = S.makeup >= 0 ? 'quiet' : 'restless';
  const typeOf = (d, m) => Object.keys(TYPES).find((k) => TYPES[k].disposition === d && TYPES[k].makeup === m);
  const type = typeOf(disposition, makeup);
  const closeCalls = [];
  if (Math.max(dm, dn) < 0.25) closeCalls.push({ kind: 'balanced' });
  else if (Math.abs(dm - dn) < 0.15) closeCalls.push({ kind: 'disposition', type: typeOf(secondDisposition, makeup), second: secondDisposition });
  if (Math.abs(S.makeup) < BAND) closeCalls.push({ kind: 'makeup', type: typeOf(disposition, makeup === 'quiet' ? 'restless' : 'quiet') });

  // The trap (Moralia XXIX.45) follows the disposition, unless the person's own answers say that pull is weak in
  // them, in which case the trap of their second leaning is shown instead (round 3: "one more helping" went to
  // disciplined cheerful people, and "being right about how badly you were treated" to gentle serious ones).
  const trapWeak = {
    cheerful: S.comforts >= 0.3 && P.lowCheer,
    serious: S.temper >= 0.34 && P.lowSer,
    confident: P.lowConf && S.seen >= 0,
    careful: false,
  };
  // ...and only to a second leaning that is really there (audit 2026-09-24: a nerve of exactly 0 counted as careful).
  const secondReal = Math.abs(['cheerful', 'serious'].includes(secondDisposition) ? S.mood : S.nerve) >= BAND;
  const trapSwapped = trapWeak[disposition] && !trapWeak[secondDisposition] && secondReal;
  const trap = trapSwapped ? secondDisposition : disposition;
  // The pull is weak and there is no real second leaning to swap to: the trap stays, and the report says so.
  const trapQuiet = trapWeak[disposition] && !trapSwapped;

  // 3. Leanings: the eighteen (mood + seventeen pairs), plus the two type axes shown with them.
  const LEAN_KEYS = Object.keys(SCALES).filter((k) => !['nerve', 'makeup'].includes(k) && LEANINGS[k]);
  const side = (k) => (Math.abs(S[k]) < BAND ? 'middle' : S[k] < 0 ? 'left' : 'right');
  const leanings = Object.keys(LEANINGS).map((k) => ({ key: k, value: S[k], side: side(k),
    pole: side(k) === 'middle' ? null : side(k) === 'left' ? SCALES[k].left : SCALES[k].right }));
  const ranked = LEAN_KEYS.map((k) => ({ key: k, value: S[k] })).sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
  const strongest = ranked.slice(0, 3).filter((r) => Math.abs(r.value) >= BAND)
    .map((r) => ({ key: r.key, pole: r.value < 0 ? SCALES[r.key].left : SCALES[r.key].right, value: r.value }));
  const balanced = ranked.slice().reverse().slice(0, 3).filter((r) => Math.abs(r.value) < 0.34).map((r) => ({ key: r.key, label: SCALES[r.key].label }));

  // 4. "What you might not have noticed": a link prints only when BOTH answers lean its way.
  // A clear answer on both sides (|v| >= 2) makes a strong link. If fewer than two strong links fire, the page is
  // topped up from links where both answers lean at least "a bit", so a mild answerer is not left with nothing.
  const linksAt = (min) => collectLinks(min);
  const strong = linksAt(LEAN);
  const links = strong.length >= 2 ? strong : strong.concat(linksAt(1).filter((l) => !strong.some((s) => s.id === l.id))).slice(0, Math.max(2, strong.length));
  function collectLinks(min) {
  const links = [];
  for (const L of LINKS) {
    const hits = L.when.map(([id, pole]) => ({ id, pole, v: answers[id], lean: leanAt(id, answers[id], min) }));
    // Both answers must lean the link's way, AND neither may contradict the person's overall reading on that scale
    // (one "heavy" answer must not fire a heavy-hearted link for someone whose mood comes out light).
    const agrees = (h) => {
      const sc = byId[h.id].scale;
      if (!SCALES[sc]) return true;
      const wantRight = h.pole === SCALES[sc].right;
      return wantRight ? S[sc] > -BAND : S[sc] < BAND;
    };
    if (min < LEAN && L.strongOnly) continue;
    // Page 4 is open to anyone looking at the report, so it never repeats a private answer (audit 2026-09-24).
    if (L.when.some(([id]) => byId[id] && byId[id].block === 'private')) continue;
    if (hits.every((h) => h.lean === h.pole && agrees(h))) links.push({ id: L.id, strength: Math.min(...hits.map((h) => Math.abs(h.v))) });
  }
  return links.sort((a, b) => b.strength - a.strength);
  }

  // 5. The two grids. Anger is read from more than its two questions: temper feeds how fast it catches, and
  // replaying what someone did (the private statement) feeds how long it stays (round 3: self-report of "no
  // grudges" was the commonest miss).
  const anger = { cell: P.angerCell, middle: P.angerMiddle };
  const speaker = { ease: S.ease, weight: S.weight,
    // Gregory blames only the fluent-but-shallow speaker, so that label needs a clear lean, not a tie.
    cell: S.ease < 0 ? (S.weight > -0.34 ? 'full' : 'fluent') : (S.weight > -0.34 ? 'deep' : 'spare'),
    middle: Math.abs(S.ease) < BAND && Math.abs(S.weight) < BAND };

  // 6. The help card: the seven strongest lines, with no line that the person's own answers contradict and
  // no two lines that say the same thing (round 3).
  const hardToCorrect = P.hardToCorrect;
  const careful = S.nerve >= 0.34 || S.critic >= 0.34;
  const suppressed = new Set([
    ...(hardToCorrect ? ['critic:left', 'h_watch:left', 'h_win:left', 'nerve:left'] : []),
    ...(careful ? ['h_watch:left'] : []),
  ]);
  let help = Object.keys(HELP).map((k) => ({ key: k, value: S[k], side: S[k] < 0 ? 'left' : 'right' }))
    .filter((h) => Math.abs(h.value) >= 0.34 && !suppressed.has(h.key + ':' + h.side))
    .sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
  if (help.some((h) => h.key === 'work' && h.side === 'right')) help = help.filter((h) => !(h.key === 'h_praise' && h.side === 'left'));
  help = help.slice(0, 7).map((h) => ({ key: h.key, side: h.side, text: HELP[h.key][h.side], note: HELP[h.key].note }));

  // 7. The eight thoughts: the private "how often" statements (three quarters), and the person's own leanings
  // (one quarter), so a strong run of fiery answers cannot be outvoted by a mild private one. Honest when nothing
  // stands out, and when several are close.
  const pos = (x) => Math.max(0, x);
  const thoughts = pub ? null : thoughtsOf(answers, S, pos);

  // 8. Best quality and its counterfeit; strength and its partner.
  let virtue = null;
  for (const r of ranked.concat([{ key: 'nerve', value: S.nerve }, { key: 'makeup', value: S.makeup }])
    .sort((a, b) => Math.abs(b.value) - Math.abs(a.value))) {
    const key = r.key + ':' + (r.value < 0 ? 'left' : 'right');
    if (VIRTUES[key] && Math.abs(r.value) >= 0.34) { virtue = key; break; }
  }
  // Shown only when the person clearly leans one way (round 3: a weak lean praised "courage" in a man whose
  // whole trouble was finding it).
  const pn = S.pace + S.nerve;
  const partner = Math.abs(pn) < 0.3 ? null : pn > 0 ? 'counsel' : 'fortitude';

  // 9. Your line in the Body (Cassian Conf. 14.4): what you would gladly do, what people come to you for,
  // and small signals from the rest.
  const L = Object.fromEntries(LINES.map((l) => [l, 0]));
  const why = Object.fromEntries(LINES.map((l) => [l, []]));
  for (const l of answers.b1 || []) { L[l] += 2; why[l].push('b1'); }
  for (const l of answers.b2 || []) { L[l] += 1.5; why[l].push('b2'); }
  const behind = (answers.b3 ?? 0) / 3;
  for (const l of ['shepherd', 'teacher', 'advocate']) L[l] += 0.6 * pos(-behind);
  for (const l of ['watcher', 'giver', 'caregiver']) L[l] += 0.6 * pos(behind);
  L.watcher += 0.4 * pos(S.makeup); L.caregiver += 0.2 * pos(S.makeup);
  L.shepherd += 0.4 * pos(-S.makeup); L.host += 0.3 * pos(-S.makeup);
  L.giver += 0.3 * pos(-S.having);
  L.teacher += 0.3 * pos(-S.talk);
  L.advocate += 0.3 * pos(-S.strife);
  const lOrder = LINES.slice().sort((a, b) => L[b] - L[a]);
  const line = { scores: L, lead: lOrder[0], second: lOrder[1], why: why[lOrder[0]], behind };

  return { scales: S, type, disposition, secondDisposition, makeup, closeCalls, trap, trapSwapped, trapQuiet, leanings, strongest, balanced,
    links, anger, speaker, help, thoughts, virtue, partner, line };
}

// 7. The eight thoughts (the private page): the private "how often" statements (three quarters), and the person's own
// leanings (one quarter), so a strong run of fiery answers cannot be outvoted by a mild private one. Honest when
// nothing stands out, and when several are close. Only ever scored on the device that took the quiz.
function thoughtsOf(answers, S, pos) {
  const lv = Object.fromEntries(THOUGHTS.map((t) => [t, []]));
  for (const it of ITEMS.filter((x) => x.kind === 'freq')) lv[it.thought].push(level(answers[it.id]));
  const mean = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);
  // Each signal is a mean of one-sided leanings, so no thought is favoured by having more of them; lust has none
  // among the leanings and takes the average level a signal has (a quarter), so it is neither helped nor hurt.
  const sig = {
    gluttony: 0.5 * pos(-S.comforts),
    lust: 0.25,
    greed: 0.25,
    anger: mean([pos(-S.temper), pos(-S.wronged), pos(0.6 * S.hold + 0.4 * ((answers.y4 ?? 0) / 3))]),
    sadness: pos(S.mood),
    listlessness: mean([pos(S.pace), pos(-S.through)]),
    vainglory: pos(-S.seen),
    pride: mean([pos(-S.room), pos(-S.mind), pos(-S.work)]),
  };
  // A thought asked once swings harder than one asked twice, so its level is drawn in toward the middle by the
  // same amount (the spread of one answer against the mean of two), and no thought tops the page just for that.
  const fair = (a) => { const m = mean(a); return m <= 0.5 ? m : 0.5 + (m - 0.5) * Math.sqrt(a.length / 2); };
  const T = Object.fromEntries(THOUGHTS.map((t) => [t, 0.75 * fair(lv[t]) + 0.25 * sig[t]]));
  const tOrder = THOUGHTS.slice().sort((a, b) => T[b] - T[a]);
  const top = T[tOrder[0]];
  const near = tOrder.filter((t) => T[t] >= top - 0.05).slice(0, 3);
  return { scores: T, order: tOrder, lead: tOrder[0], least: tOrder[tOrder.length - 1],
    none: top < 0.35, several: top >= 0.35 && near.length > 1 ? near : null,
    close: near.length > 1 ? near[1] : null,
    bars: Object.fromEntries(THOUGHTS.map((t) => [t, Math.max(0.06, T[t])])) };

}
