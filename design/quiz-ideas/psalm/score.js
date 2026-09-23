// The Psalm quiz's scorer (draft 5). Plain JS with no imports, so the same text runs in node, in the preview page and
// inside a workflow script. `quiz` is quiz.json; `a` is { questionId: optionKey } or, for a question that takes up
// to two picks, { questionId: [optionKey, ...] }. A facet matches when any picked key is among its values.

function picks(v) {
  return v === undefined ? [] : Array.isArray(v) ? v : [v];
}

function meets(cond, a) {
  return Object.entries(cond).every(([k, vals]) => picks(a[k]).some(x => vals.includes(x)));
}

/** Follow-up questions whose `when` is met by the answers so far, in order, not yet answered. */
function pending(quiz, a) {
  return quiz.follow.filter(f => a[f.id] === undefined && f.when.some(w => meets(w, a)));
}

/** The next question to ask, or null when the answers are complete. */
function nextQuestion(quiz, a) {
  const c = quiz.core.find(q => a[q.id] === undefined);
  if (c) return c;
  return pending(quiz, a)[0] || null;
}

/** Eligible outcomes, best first: need facets score quiz.weights (default 2), like facets 1; ties keep data order. */
function rank(quiz, a) {
  const out = [];
  Object.entries(quiz.outcomes).forEach(([id, o], order) => {
    const hit = o.need.find(n => meets(n, a));
    if (!hit) return;
    const likes = Object.entries(o.like || {}).filter(([k, vals]) => picks(a[k]).some(x => vals.includes(x))).length;
    const w = quiz.weights || {};
    const needScore = Object.keys(hit).reduce((n, k) => n + (w[k] || w.default || 2), 0);
    out.push({ id, score: needScore + likes, order });
  });
  return out.sort((x, y) => y.score - x.score || x.order - y.order);
}

if (typeof module !== 'undefined') module.exports = { picks, meets, pending, nextQuestion, rank };
