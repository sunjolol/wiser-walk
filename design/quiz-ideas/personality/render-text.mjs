// Renders a scored result as the plain text a reader would get, for the simulated-people judges and for review.
import { SCALES, ITEMS } from './items.mjs';
import * as R from './results.mjs';

const qt = (Q) => (Q ? `"${Q.q}" (${Q.cite})` : '');
const clean = (s) => s.replace(/ {2,}/g, ' ').trim();
const byId = Object.fromEntries(ITEMS.map((it) => [it.id, it]));

export function renderText(r, answers) {
  const T = R.TYPES[r.type];
  const D = R.DISPOSITIONS[r.disposition];
  const M = R.MAKEUPS[r.makeup];
  const out = [];
  const h = (s) => out.push('', '## ' + s);
  out.push(`# ${T.name}`, T.tagline, `${D.word} by disposition. ${M.word} by make-up.`);
  out.push('Strongest leanings: ' + r.strongest.map((s) => s.pole).join(', '));

  h('Your type');
  out.push(T.portrait);
  const TR = R.DISPOSITIONS[r.trap];
  out.push(`Where the trap is set for you: ${TR.trap.name}. ${R.TRAP_LEAD}${r.trapSwapped ? ' ' + R.TRAP_SWAP.replace('{own}', D.trap.name).replace('{second}', R.DISPOSITIONS[r.trap].word.toLowerCase()) : ''}${r.trapQuiet ? ' ' + R.TRAP_QUIET : ''} ${qt(TR.trap.quote)} ${TR.trap.plain}`);
  out.push('What you bring: ' + D.bring.concat(M.bring).join(' '));
  out.push('What it costs you: ' + D.cost.concat(r.trapSwapped ? [] : [D.trapCost], M.cost).join(' '));
  out.push('Kindred: ' + (T.kindred.length ? T.kindred.map((k) => `${k.who}: ${k.text}`).join(' | ') : T.kindredNote));
  const O = R.TYPES[T.opposite];
  out.push(`Your opposite: ${O.name} (${O.tagline})`);
  for (const c of r.closeCalls) {
    out.push(c.kind === 'balanced'
      ? 'Close call: your disposition is close to balanced. This is your nearest type.'
      : `Close call: ${c.kind === 'disposition' ? 'your second disposition is close' : 'your make-up is balanced'}; you could also be ${R.TYPES[c.type].name}.`);
  }

  h('Your leanings');
  for (const l of r.leanings) {
    const s = SCALES[l.key];
    const pct = Math.round((l.value + 1) * 50);
    out.push(`- ${s.label}: ${s.left} <-> ${s.right}: ${l.side === 'middle' ? 'balanced' : l.pole} (${pct}/100)`);
  }
  out.push('Most like you: ' + r.strongest.map((s) => s.pole).join(', ') + '. Balanced: ' + r.balanced.map((b) => b.label).join(', '));
  for (const s of r.strongest) {
    const side = s.value < 0 ? 'left' : 'right';
    const L = R.LEANINGS[s.key][side];
    out.push(`* ${s.pole}: ${L.you} What you may not see: ${L.unseen} ${qt(L.quote)} Counsel: ${L.counsel}`);
  }

  h('What you might not have noticed');
  if (!r.links.length) out.push('(no links fired)');
  for (const k of r.links.slice(0, 4)) {
    const L = R.LINKS.find((x) => x.id === k.id);
    out.push(`- You said ${L.you[0]}. You also said ${L.you[1]}. ${L.text} ${qt(L.quote)}`);
  }

  h('How your anger works');
  const A = R.ANGER.cells[r.anger.cell];
  out.push(`${A.name}${r.anger.middle ? ' (only just: you sit near the middle)' : ''}. ${A.text} ${qt(A.quote)} ${A.cure}`);

  h('How you speak');
  const S = R.SPEAKER.cells[r.speaker.cell];
  out.push(`${S.name}${r.speaker.middle ? ' (only just)' : ''}. ${S.text}`);

  h('How to help me');
  r.help.forEach((x, i) => out.push(`${i + 1}. ${x.text}`));

  h('Where the fight is for you now (private)');
  if (r.thoughts.none) out.push(R.FIGHT.none);
  else {
    if (r.thoughts.several) out.push(R.FIGHT.several + ' ' + r.thoughts.several.map((t) => R.THOUGHT_TEXT[t].name).join(', ') + '.');
    const TT = R.THOUGHT_TEXT[r.thoughts.lead];
    out.push(`${r.thoughts.several ? 'The first of them' : 'Right now'}: ${TT.name}. ${TT.what} ${TT.speech ? 'How it talks to you: ' + qt(TT.speech) : TT.speechNote || ''} How it shows: ${TT.shows} What feeds it: ${TT.feeds} What takes its place: ${TT.place}`);
  }
  out.push('All eight, strongest first (drawn as bars, no numbers): ' + r.thoughts.order.map((t) => R.THOUGHT_TEXT[t].name).join(', ') + `. Troubles you least: ${R.THOUGHT_TEXT[r.thoughts.least].name}.`);

  h('Your best quality, and its counterfeit');
  if (r.virtue) { const V = R.VIRTUES[r.virtue]; out.push(`${V.best}: ${V.bestText} Counterfeit: ${V.fake}. ${V.warn} (${V.quote.cite})`); }
  if (r.partner) { const P = R.PARTNERS[r.partner]; out.push(`Your strength: ${P.strength}. Its partner: ${P.partner}. ${P.plain}`); }

  h('Who you are in Christ, and in the Body');
  out.push(D.grace.text + ' ' + qt(D.grace.quote));
  const LN = R.LINE_TEXT[r.line.lead];
  out.push(`Your line: ${LN.name} (${LN.work}). ${LN.what} ${LN.cassian} Second: ${R.LINE_TEXT[r.line.second].name}.`);
  if (answers) {
    const picks = (id) => (answers[id] || []).map((l) => byId[id].options.find((o) => o.line === l)?.text).filter(Boolean);
    out.push(`(They picked: gladly do: ${picks('b1').join(' / ')}; people come for: ${picks('b2').join(' / ')})`);
  }
  return out.map(clean).join('\n');
}
