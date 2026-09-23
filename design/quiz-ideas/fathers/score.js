// Quiz #4 scorer (draft 3). Plain JS, no imports: runs in node, the preview page and a workflow script.
// quiz = quiz.json: { statements: [{id,text}], centre: { id: [usual answer, usual position] },
//                     people: { key: { cells: { statementId: { v: -2..2, never 0 } } } } }.
// answers = { statementId: -2..2 }; 0 or missing = "not sure", which names no position and is never compared (a
// person's middle view is likewise not stored).
//
// LIKENESS to a person = the sum, over the statements you both take a side on, of (your answer - SHRINK x the usual
// answer) x (their position - SHRINK x the usual position among the people), divided by that count plus K. So you are
// matched on where you lean differently from most people, and they on where they differed from the others: a
// statement nearly everyone agrees with cannot hand the same person to every player. K keeps a person you share few
// statements with from winning on a coincidence. Measured on 30 simulated people (people-test-1): raw agreement made
// one person the kindred spirit of 12 in 30.
//
// EVERYONE is ranked, however little you share: K already pulls a thin comparison toward the middle of the list, which
// is where it belongs. (Draft 3 left people off the list below seven shared answers: Benedict and Irenaeus, on record
// on only 7 or 8 questions, vanished for 21 of 30 testers. The owner caught it.) Only NAMING needs a floor: a kindred
// spirit or a sparring partner has to rest on at least MIN_SHARED answers they actually addressed. The sparring partner
// is not whoever you share least with (that is whoever wrote least) nor the most disagreements counted raw (that is
// whoever wrote most: Jerome or Chrysostom for almost everyone); it is the least like you on balance.
// THE KINDRED SPIRIT is the likest person you share MIN_SHARED statements with, except anyone standing at the opposite
// end from you on two statements you both hold strongly (the veteran matched with the man who said Christ unbelted
// every soldier). THE SPARRING PARTNER is the least like you among those you clash with more than you agree with,
// with at least two head-on clashes.
var K = 3, MIN_SHARED = 6, SHRINK = 0.5;

function compare(quiz, answers, shrink) {
  var S = shrink === undefined ? SHRINK : shrink;
  return Object.keys(quiz.people).map(function (key) {
    var cells = quiz.people[key].cells, sum = 0, n = 0, agree = [], clash = [];
    quiz.statements.forEach(function (s) {
      var a = answers[s.id], c = cells[s.id];
      if (!a || !c) return;
      var m = (quiz.centre && quiz.centre[s.id]) || [0, 0];
      var w = (a - S * m[0]) * (c.v - S * m[1]);
      sum += w; n++;
      (a * c.v > 0 ? agree : clash).push({ id: s.id, a: a, v: c.v, raw: a * c.v, w: w });
    });
    agree.sort(function (x, y) { return y.w - x.w || y.raw - x.raw; });
    clash.sort(function (x, y) { return x.w - y.w || x.raw - y.raw; });
    var hard = clash.filter(function (x) { return x.raw <= -4; }).length;
    var sharp = clash.filter(function (x) { return x.raw <= -2; }).length;
    return { key: key, n: n, like: sum / (n + K), agree: agree, clash: clash, hard: hard, sharp: sharp };
  });
}

/** { kindred, sparring, ranked }: ranked = everyone, likest first; the two named come from those you share MIN_SHARED with. */
function result(quiz, answers, shrink) {
  var ranked = compare(quiz, answers, shrink).sort(function (x, y) { return y.like - x.like; });
  var all = ranked.filter(function (r) { return r.n >= MIN_SHARED; });
  var kindred = all.find(function (r) { return r.hard < 2 && r.agree.length >= 3; }) || all[0] || null;
  var sparring = all.slice().reverse().find(function (r) {
    return r !== kindred && r.clash.length > r.agree.length && r.sharp >= 2;
  }) || null;
  return { kindred: kindred, sparring: sparring, ranked: ranked };
}

if (typeof module !== 'undefined') module.exports = { compare: compare, result: result, K: K, MIN_SHARED: MIN_SHARED, SHRINK: SHRINK };
