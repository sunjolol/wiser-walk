// The Personality Quiz tap-through preview: the quiz, then the ten-page report. PQ (items, results, score), IMG
// (pictures as data URIs), LOGO (the owner's brush W, white and colour, and the wordmark SVG) and EXAMPLE (one
// simulated person's answers) are injected by build.mjs.
(function () {
  var I = PQ.items, R = PQ.results, SC = I.SCALES, ITEMS = I.ITEMS;
  var app = document.getElementById('app');
  var state = { i: 0, answers: {}, seenPrivate: false };
  // Where a shared card sends people. On the live site the result's own short link goes here (the quiz standard).
  var QUIZ_URL = 'wiserwalk.com/q/personality';
  var LIVE = 'https://wiserwalk.com';
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var cap = function (s) { return s.charAt(0).toUpperCase() + s.slice(1); };
  // Philosopher's capital I looks like a small l, so a lone I in a quotation borrows a serif that shows it.
  var q = function (Q) { return Q ? '<blockquote><p>“' + esc(Q.q).replace(/\bI\b/g, '<span class="cap-i">I</span>') + '”</p><cite>' + esc(Q.cite) + '</cite></blockquote>' : ''; };
  var img = function (key, cls, alt) { return key && IMG[key] ? '<img class="' + (cls || '') + '" src="' + IMG[key] + '" alt="' + esc(alt || '') + '">' : '<span class="' + (cls || '') + ' ph" aria-hidden="true"></span>'; };
  var top = function () { window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' }); };
  // The logo is the W and the words together, never the words alone. White only over a picture.
  var brand = function (white) {
    return '<span class="brand' + (white ? ' brand--white' : '') + '"><img class="brand-mark" src="' + (white ? LOGO.wWhite : LOGO.w) + '" alt="">' +
      '<span class="brand-word" aria-hidden="true"></span><span class="sr">Wiser Walk</span></span>';
  };
  // Another quiz on the site, as a card with its own engraving (adapted from the home page's quiz cards).
  var quizCard = function (k, lead, title, facts, href) {
    return '<p class="qc-lead">' + esc(lead) + '</p><a class="qc" href="' + href + '" target="_blank" rel="noopener">' + img(k, 'qc-img', '') +
      '<span class="qc-in"><b>' + esc(title) + '</b><span class="qc-facts">' + facts.map(function (f) { return '<span>' + esc(f) + '</span>'; }).join('') + '</span>' +
      '<span class="qc-go">Start <span aria-hidden="true">&#8599;</span></span></span></a><p class="qc-note">Opens in a new tab, so you keep your place here.</p>';
  };

  // ------------------------------------------------------------------------------------------------ start
  function start() {
    app.className = 'app app--start';
    app.innerHTML =
      '<section class="start">' +
        '<div class="start-top">' + brand(false) + '<span class="start-tag">Preview</span></div>' +
        '<div class="start-art">' + ['hearth', 'spark', 'deepwell', 'forge', 'stillwater', 'lookout', 'oak', 'herald'].map(function (k) { return img(k, 'start-img', ''); }).join('') + '</div>' +
        '<h1>Personality Quiz</h1>' +
        '<p class="lede">Seventy-two quick choices. Then a ten-page portrait of who you are, what trips you up, and where you fit.</p>' +
        '<ul class="facts"><li>About 12 min</li><li>72 questions</li><li>8 types</li></ul>' +
        '<div class="row"><button class="btn" data-act="begin">Start</button><button class="btn ghost" data-act="example">See an example</button></div>' +
        '<p class="fine">A preview for review. Nothing you answer here is saved.</p>' +
      '</section>';
  }

  // ------------------------------------------------------------------------------------------------ questions
  // Seven points, each a column with its dot and its words under it, so nobody has to guess what a dot means (the
  // owner, 2026-09-24: well-made tests label their choices). The whole column is the tap target.
  var LABELS = {
    two: ['Very much A', 'Mostly A', 'A little A', 'Both / neither', 'A little B', 'Mostly B', 'Very much B'],
    freq: ['Never', 'Almost never', 'Rarely', 'Sometimes', 'Often', 'Very often', 'All the time']
  };
  function dots(v, kind) {
    var out = '';
    for (var n = -3; n <= 3; n++) {
      var side = n < 0 ? 'a' : n > 0 ? 'b' : 'm', on = v === n ? ' is-on' : '', label = LABELS[kind][n + 3];
      out += '<button class="pt pt--' + side + on + '" type="button" data-v="' + n + '" aria-pressed="' + (v === n) + '">' +
        '<span class="pt-d"><span class="dot dot--' + side + ' dot--' + Math.abs(n) + on + '"></span></span><span class="pt-l">' + esc(label) + '</span></button>';
    }
    return out;
  }
  function question() {
    var it = ITEMS[state.i];
    if (it.block === 'private' && !state.seenPrivate) return privateNote();
    app.className = 'app app--q' + (it.block === 'private' ? ' is-private' : '');
    var n = state.i + 1, v = state.answers[it.id];
    var head = '<div class="qtop"><button class="back" data-act="back" aria-label="Back">←</button>' +
      '<span class="count">' + n + ' of ' + ITEMS.length + '</span></div>' +
      '<div class="bar"><i style="width:' + (100 * state.i / ITEMS.length) + '%"></i></div>';
    var body;
    if (it.kind === 'two') {
      body = '<p class="stem">' + esc(it.stem) + '</p><div class="choice">' +
        '<button class="opt opt--a' + (v < 0 ? ' is-on' : '') + '" data-v="-3"><span class="tag">A</span><span>' + esc(it.A) + '</span></button>' +
        '<div class="scale" role="group" aria-label="How much A or B">' + dots(v, 'two') + '</div>' +
        '<button class="opt opt--b' + (v > 0 ? ' is-on' : '') + '" data-v="3"><span class="tag">B</span><span>' + esc(it.B) + '</span></button></div>';
    } else if (it.kind === 'freq') {
      body = '<p class="lock-line">Private</p><p class="stem stem--say">' + esc(it.text) + '</p><div class="choice">' +
        '<div class="scale scale--freq" role="group" aria-label="How often">' + dots(v, 'freq') + '</div></div>';
    } else {
      var picked = state.answers[it.id] || [];
      body = '<p class="stem">' + esc(it.stem) + '</p><div class="picks">' +
        it.options.map(function (o) { return '<button class="pick' + (picked.indexOf(o.line) > -1 ? ' is-on' : '') + '" data-line="' + o.line + '">' + esc(o.text) + '</button>'; }).join('') +
        '</div><div class="row"><button class="btn" data-act="next">' + (state.i === ITEMS.length - 1 ? 'See my results' : 'Next') + '</button></div>';
    }
    app.innerHTML = '<section class="qcard' + (it.block === 'private' ? ' starry' : '') + '">' + head + body + '</section>';
  }
  function privateNote() {
    app.className = 'app app--q is-private';
    app.innerHTML = '<section class="qcard pnote starry">' +
      '<svg class="lock" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 10V7a5 5 0 0 1 10 0v3" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><rect x="4.5" y="10" width="15" height="11" rx="3" fill="currentColor"/></svg>' +
      '<h2>Just for you</h2><p>' + esc(I.PRIVATE_NOTE) + '</p>' +
      '<div class="row"><button class="btn" data-act="private">Continue</button></div></section>';
  }
  function answer(v) {
    var it = ITEMS[state.i];
    state.answers[it.id] = v;
    question();
    setTimeout(next, 260);
  }
  function next() {
    if (state.i < ITEMS.length - 1) { state.i++; question(); top(); }
    else result(state.answers);
  }

  // ------------------------------------------------------------------------------------------------ result
  var PAGES = [['p1', 'Your result', 'Your result'], ['p2', 'Your type', 'Your type'], ['p3', 'Leanings', 'Your leanings'], ['p4', 'Not noticed', 'What you might not have noticed'],
    ['p5', 'Anger', 'How your anger works'], ['p6', 'Speaking', 'How you speak'], ['p7', 'Help me', 'How to help someone like you'], ['p8', 'The fight', 'Where the fight is for you now'],
    ['p9', 'Best quality', 'Your best quality, and its counterfeit'], ['p10', 'Your role', 'Who you are in Christ, and in the Body']];

  function rail(key, value) {
    var s = SC[key], pos = (value + 1) / 2 * 100, mid = Math.abs(value) < 0.18;
    var side = mid ? 'm' : value < 0 ? 'a' : 'b';
    var fill = mid ? '' : value < 0 ? '<i class="fill a" style="left:' + pos + '%;width:' + (50 - pos) + '%"></i>' : '<i class="fill b" style="left:50%;width:' + (pos - 50) + '%"></i>';
    var L = R.LEANINGS[key], d = L && !mid ? L[value < 0 ? 'left' : 'right'] : null;
    return '<details class="rail"><summary>' +
      '<span class="rail-name">' + esc(s.label) + '<span class="rail-open" aria-hidden="true"></span></span>' +
      '<span class="poles"><span class="l">' + esc(s.left) + '</span><span class="r">' + esc(s.right) + '</span></span>' +
      '<span class="track"><i class="band"></i>' + fill + '<i class="knob ' + side + '" style="left:' + pos + '%"></i></span></summary>' +
      (d ? '<div class="rail-more"><p><b>' + esc(d.you) + '</b></p><p class="unseen">' + esc(d.unseen) + '</p>' + q(d.quote) + '<p class="counsel">' + esc(d.counsel) + '</p></div>'
         : '<div class="rail-more"><p>You sit in the middle here. Gregory names no leaning for you on this one.</p></div>') +
      '</details>';
  }
  function kin(k) {
    return '<div class="kin">' + img(k.img, 'face', k.who) + '<b>' + esc(k.who) + (k.partial ? '<em>partly like you</em>' : '') + '</b><p>' + esc(k.text) + '</p><span class="src">' + esc(k.src) + '</span></div>';
  }
  function grid(cells, order, you, axisX, axisY) {
    return '<div class="g2" role="img" aria-label="' + esc(cells[you].name) + '">' +
      '<span></span><span class="ax">' + axisX[0] + '</span><span class="ax">' + axisX[1] + '</span>' +
      '<span class="ay">' + axisY[0] + '</span>' + cell(order[0]) + cell(order[1]) +
      '<span class="ay">' + axisY[1] + '</span>' + cell(order[2]) + cell(order[3]) + '</div>';
    function cell(k) { var c = cells[k]; return '<div class="g2-cell' + (k === you ? ' is-you' : '') + '">' + (k === you ? '<span class="you">You</span>' : '') + '<b>' + esc(c.name) + '</b><span>' + esc(c.short) + '</span></div>'; }
  }
  function page(n, id, inner, extra) {
    // Page 2's heading is the type's own name, in the avatar block (as in the draft the owner preferred).
    // No "Page n" label: the pager above already says where you are (the owner, 2026-09-24).
    return '<section class="rp ' + (extra || '') + '" id="' + id + '">' + (n === 2 ? '' : '<h2>' + esc(PAGES[n - 1][2]) + '</h2>') + inner + '</section>';
  }
  // The trap sentence names all four, with the reader's own last (the owner preferred the whole of Gregory's list).
  function trapLead(own) {
    var order = ['cheerful', 'serious', 'confident', 'careful'].filter(function (k) { return k !== own; }).concat([own]);
    return R.TRAP_LEAD + ' ' + order.map(function (k, i) {
      var d = R.DISPOSITIONS[k];
      return 'For ' + d.trapWho + (i === order.length - 1 ? ', it’s ' : ' it’s ') + d.trap.name + '.';
    }).join(' ');
  }
  // The reasons a line was chosen: only the signals that really pushed this line up for this person.
  function lineWhy(answers, r, lead) {
    var LN = R.LINE_TEXT[lead], why = [], S = r.scales;
    if ((answers.b1 || []).indexOf(lead) > -1) why.push(LN.why1);
    if ((answers.b2 || []).indexOf(lead) > -1) why.push(LN.why2);
    var sig = (R.LINE_SIGNALS || {})[lead] || [];
    sig.forEach(function (s) {
      var v = s.from === 'behind' ? r.line.behind : S[s.from];
      if (v * s.sign >= 0.3) why.push(s.say);
    });
    return why.length ? why : ['Your answers, taken together'];
  }

  function result(answers) {
    var r = PQ.score(answers);
    var T = R.TYPES[r.type], D = R.DISPOSITIONS[r.disposition], M = R.MAKEUPS[r.makeup], TR = R.DISPOSITIONS[r.trap];
    var O = R.TYPES[T.opposite];
    var LN = R.LINE_TEXT[r.line.lead], PL = R.LINE_TEXT[LN.partner];
    var why = lineWhy(answers, r, r.line.lead);
    app.className = 'app app--r';
    app.style.setProperty('--ink', T.ink);
    CARD = { r: r, T: T, D: D, M: M, LN: LN, why: why };
    var H = [];

    // 1. The snapshot
    H.push('<header class="hero" id="p1">' + img(T.art, 'hero-img', '') + '<div class="hero-veil"></div>' +
      '<div class="hero-top">' + brand(true) + '<span>Personality Quiz</span></div><div class="hero-in">' +
      '<p class="kicker">Your type</p><h1>' + esc(T.name) + '</h1><p class="tag-line">' + esc(T.tagline) + '</p>' +
      '<div class="badges"><span>' + esc(D.word) + '</span><span>' + esc(M.word) + ' mind</span></div>' +
      '<div class="lean-chips">' + r.strongest.map(function (s) { return '<span>' + esc(s.pole) + '</span>'; }).join('') + '</div>' +
      '<div class="rarity"><b>How common is ' + esc(T.name) + '?</b><span>We’ll show it once 50 people have taken the quiz. So far: 0.</span></div>' +
      '<div class="row"><button class="btn btn--on" data-act="card" data-card="type">Save image</button><button class="btn ghost btn--ghost-on" data-act="copylink">Copy link</button></div>' +
      '</div></header>');
    H.push('<nav class="pager" aria-label="Report pages"><button class="pg-arrow" data-act="pg" data-dir="-1" aria-label="Previous page">‹</button>' +
      '<button class="pg-cur" data-act="pgmenu" aria-expanded="false"><span class="pg-n">1 of 10</span><span class="pg-t">Your result</span><span class="pg-caret" aria-hidden="true"></span></button>' +
      '<button class="pg-arrow" data-act="pg" data-dir="1" aria-label="Next page">›</button><span class="pg-bar"><i></i></span>' +
      '<ol class="pg-menu" hidden>' + PAGES.map(function (p, i) { return '<li><a href="#' + p[0] + '" data-go="' + p[0] + '"><span>' + (i + 1) + '</span>' + esc(p[2]) + '</a></li>'; }).join('') + '</ol></nav>');

    // 2. Your type
    var closeTypes = r.closeCalls.filter(function (c) { return c.type; }).map(function (c) { return c.type; });
    var face = T.kindred.length ? img(T.kindred[0].img, 'type-face', T.kindred[0].who) : img(T.art, 'type-face', '');
    var mine = r.strongest.slice(0, 2).map(function (s) { var L = R.LEANINGS[s.key]; return L ? L[s.value < 0 ? 'left' : 'right'].you : ''; }).join(' ');
    var OP = R.OPPOSITES && R.OPPOSITES[[r.type, T.opposite].sort().join('-')];
    var them = OP ? OP.people[T.opposite] : null;
    H.push(page(2, 'p2',
      '<div class="typehead">' + face + '<div><p class="kicker">Your type</p><h2 class="type-name">' + esc(T.name) + '</h2><p class="type-sub">' + esc(D.word) + ' by disposition. ' + esc(M.word) + ' by make-up.</p></div></div>' +
      '<p class="big">' + esc(T.portrait) + (mine ? ' ' + esc(mine) : '') + '</p>' +
      '<div class="trap starry"><h3>Where the trap is set for you</h3><p class="trap-word">' + esc(cap(TR.trap.name)) + '</p>' +
        '<p>' + esc(trapLead(r.disposition)) + (r.trapSwapped ? ' ' + esc(R.TRAP_SWAP.replace('{own}', D.trap.name).replace('{second}', R.DISPOSITIONS[r.trap].word.toLowerCase())) : '') + '</p>' +
        (r.trapQuiet ? '<p class="trap-quiet">' + esc(R.TRAP_QUIET) + '</p>' : '') +
        q(TR.trap.quote) + '<p class="trap-plain">' + esc(TR.trap.plain) + '</p></div>' +
      '<div class="two"><div class="bring"><h3>What you bring</h3><ul>' + D.bring.concat(M.bring).map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div>' +
        '<div class="cost"><h3>What it costs you</h3><ul>' + D.cost.concat(r.trapSwapped ? [] : [D.trapCost], M.cost).map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div></div>' +
      '<h3 class="sub">Saints and Bible figures like you</h3>' + (T.kindred.length ? T.kindred.map(kin).join('') : '<p class="muted">' + esc(T.kindredNote) + '</p>' + q(T.gregoryLine)) +
      (T.kindredNote && T.kindred.length ? '<p class="muted small kin-note">' + esc(T.kindredNote) + '</p>' : '') +
      '<div class="opp" style="--o:' + O.ink + '">' + img(O.art, 'opp-img', '') + '<div class="opp-in"><p class="kicker">Your opposite, and why you need them</p>' +
        (them ? '<div class="opp-who">' + img(them.img, 'face face--o', them.who) + '<div><h3>' + esc(O.name) + '</h3><p class="opp-person">' + esc(them.who) + '</p></div></div>' +
            '<p class="opp-tag">' + esc(O.tagline) + '</p><p>' + esc(OP.story) + '</p>' + (OP.src ? '<p class="opp-src">' + esc(OP.src) + '</p>' : '')
          : '<h3>' + esc(O.name) + '</h3><p>' + esc(O.tagline) + '</p>') +
        q((OP && OP.quote) || R.BOATS.body) + '</div></div>' +
      '<h3 class="sub">All eight types</h3>' + (r.closeCalls.some(function (c) { return c.kind === 'balanced'; }) ? '<p class="muted small">Your answers sit close to the middle, so your type was a close call.</p>' : '') +
      '<div class="types">' + ['hearth', 'spark', 'deepwell', 'forge', 'stillwater', 'lookout', 'oak', 'herald'].map(function (k) {
        var t = R.TYPES[k], tag = k === r.type ? '<span class="ty-tag">You</span>' : closeTypes.indexOf(k) > -1 ? '<span class="ty-tag ty-tag--close">Close second</span>' : '';
        return '<button class="ty' + (k === r.type ? ' is-you' : closeTypes.indexOf(k) > -1 ? ' is-close' : '') + '" style="--t:' + t.ink + '" data-type="' + k + '">' + img(t.art, 'ty-img', '') + tag + '<span class="ty-in"><b>' + esc(t.name) + '</b><span>' + esc(R.DISPOSITIONS[t.disposition].word) + ' · ' + esc(R.MAKEUPS[t.makeup].word) + '</span></span></button>';
      }).join('') + '</div><p class="muted small ty-hint">Tap a type to read about it.</p>'));

    // 3. Leanings: every line closed at first; the hint says what opening one gives.
    var groups = [['Your type, in detail', ['mood', 'nerve', 'makeup']], ['How you speak', ['talk', 'candour']], ['When you’re wronged', ['wronged', 'temper', 'strife']],
      ['How you work', ['pace', 'through', 'small']], ['How you see yourself', ['work', 'critic', 'room', 'mind']], ['With other people', ['wins', 'seen', 'after']], ['With what you have', ['having', 'comforts']]];
    H.push(page(3, 'p3',
      '<div class="tops"><div><p class="kicker">Most like you</p>' + r.strongest.map(function (s) { return '<span class="chip chip--ink">' + esc(s.pole) + '</span>'; }).join('') + '</div>' +
      '<div><p class="kicker">Where you’re balanced</p>' + (r.balanced.length ? r.balanced.map(function (b) { return '<span class="chip">' + esc(b.label) + '</span>'; }).join('') : '<span class="muted small">Nowhere, really. You lean on everything.</span>') + '</div></div>' +
      '<div class="hint"><span class="hint-i" aria-hidden="true">i</span><p><b>Tap any line to open it.</b> Each one says what your answer means, what you may not see in yourself, and Gregory’s counsel.</p></div>' +
      groups.map(function (g) { return '<div class="grp"><p class="grp-n">' + esc(g[0]) + '</p>' + g[1].map(function (k) { return rail(k, r.scales[k]); }).join('') + '</div>'; }).join('')));

    // 4. What you might not have noticed
    H.push(page(4, 'p4', r.links.slice(0, 4).map(function (l) {
      var L = R.LINKS.find(function (x) { return x.id === l.id; });
      return '<div class="said"><div class="bub bub--a">You said <b>' + esc(L.you[0]) + '.</b></div><div class="bub bub--b">You also said <b>' + esc(L.you[1]) + '.</b></div>' +
        '<p class="insight">' + esc(L.text) + '</p>' + q(L.quote) + '</div>';
    }).join('') || '<p class="muted">Your answers were even enough that no pattern stood out.</p>'));

    // 5. Anger
    var A = R.ANGER.cells[r.anger.cell];
    H.push(page(5, 'p5',
      grid(R.ANGER.cells, ['reeds', 'brief', 'worst', 'wood'], r.anger.cell, ['Catches quickly', 'Catches slowly'], ['Lets go quickly', 'Lets go slowly']) +
      (r.anger.middle ? '<p class="close">Only just: you sit near the middle of all four.</p>' : '') +
      '<h3 class="sub">' + esc(A.name) + '</h3><p class="big">' + esc(A.text) + '</p>' + q(A.quote) +
      '<p class="muted small">Gregory even wrote down what anger says to people. It sounds reasonable:</p>' + q(R.ANGER.speech) +
      '<div class="cure"><p class="kicker">Gregory’s cure</p><p>' + esc(A.cure) + '</p></div>'));

    // 6. Speaking
    var SP = R.SPEAKER.cells[r.speaker.cell];
    H.push(page(6, 'p6',
      grid(R.SPEAKER.cells, ['full', 'deep', 'fluent', 'spare'], r.speaker.cell, ['Words come easily', 'Words come hard'], ['Thinks first', 'Speaks first']) +
      '<h3 class="sub">' + esc(SP.name) + '</h3><p class="big">' + esc(SP.text) + '</p>' + q(SP.quote)));

    // 7. How to help me
    H.push(page(7, 'p7',
      '<p>Send this to someone who lives with you, works with you, or leads you.</p>' +
      '<div class="note"><p class="note-k">How to help me</p><ol>' + r.help.map(function (h) { return '<li>' + esc(h.text) + '<small>' + esc(h.note) + '</small></li>'; }).join('') + '</ol>' +
      '<div class="row"><button class="btn" data-act="copyhelp">Copy this card</button></div></div>' +
      '<hr class="sep"><p class="muted small">Drawn from St Gregory the Theologian, who wrote that some are led by teaching and others by example, and that no one remedy suits everyone.</p>'));

    // 8. Where the fight is
    var tt = R.THOUGHT_TEXT, lead = tt[r.thoughts.lead];
    var fight = r.thoughts.none ? '<div class="fcard"><p class="big">' + esc(R.FIGHT.none) + '</p></div>' :
      (r.thoughts.several ? '<p class="fnote">' + esc(R.FIGHT.several) + ' <b>' + r.thoughts.several.map(function (t) { return esc(tt[t].name); }).join(', ') + '</b>.</p>' : '') +
      '<div class="fcard fcard--lead"><p class="kicker">' + (r.thoughts.several ? 'The first of them' : 'Right now') + '</p><h3>' + esc(lead.name) + ' <span class="old">' + esc(lead.old) + '</span></h3><p>' + esc(lead.what) + '</p></div>' +
      (lead.speech || lead.speechNote ? '<div class="fcard"><p class="kicker">How it talks to you</p>' + (lead.speech ? q(lead.speech) + '<p class="fsmall">It sounds reasonable. That is how it works.</p>' : '<p>' + esc(lead.speechNote) + '</p>') + '</div>' : '') +
      '<div class="fcard"><div class="frow"><p class="kicker">How it shows</p><p>' + esc(lead.shows) + '</p></div>' + (lead.showsQuote ? q(lead.showsQuote) : '') +
        (lead.when ? '<div class="frow"><p class="kicker">When it comes</p><p>' + esc(lead.when) + '</p></div>' : '') + '</div>' +
      '<div class="fcard"><div class="frow"><p class="kicker">What feeds it</p><p>' + esc(lead.feeds) + '</p></div>' +
        '<div class="frow"><p class="kicker">What takes its place</p><p>' + esc(lead.place) + '</p></div>' + q(lead.placeQuote) + '</div>';
    H.push(page(8, 'p8',
      '<div class="locked" id="lock"><svg class="lock" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 10V7a5 5 0 0 1 10 0v3" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><rect x="4.5" y="10" width="15" height="11" rx="3" fill="currentColor"/></svg>' +
        '<p>' + esc(R.FIGHT.intro) + '</p><button class="btn btn--on" data-act="showfight" aria-expanded="false">Show it</button></div>' +
      '<div class="fight" id="fight" hidden>' + fight +
        '<div class="fcard"><p class="kicker">Catch it early</p><ol class="steps">' + R.FIGHT.steps.map(function (s, i) { return '<li><span class="step-n">' + (i + 1) + '</span><b>' + esc(s.name) + '</b><span>' + esc(s.text) + '</span></li>'; }).join('') + '</ol></div>' +
        '<div class="fcard"><p class="kicker">All eight, for you now</p><div class="bars">' + r.thoughts.order.map(function (t, i) {
          return '<div class="barr' + (i === 0 && !r.thoughts.none ? ' is-lead' : '') + '"><span>' + esc(tt[t].name) + '</span><span class="barr-t"><i style="width:' + Math.round(r.thoughts.bars[t] * 100) + '%"></i></span></div>';
        }).join('') + '</div><p class="fsmall">Troubles you least now: ' + esc(tt[r.thoughts.least].name) + '. Cassian says the fight moves, so take it again in a few months.</p>' + q(R.FIGHT.moves) + '</div>' +
        quizCard('q-sins', R.FIGHT.sins, 'Which of the 7 deadly sins are you weakest to?', ['2 min', '14 statements'], LIVE + '/q/seven-deadly-sins/') + '</div>', 'rp--dark starry'));

    // 9. Best quality
    var V = r.virtue ? R.VIRTUES[r.virtue] : null, P = r.partner ? R.PARTNERS[r.partner] : null;
    H.push(page(9, 'p9',
      (V ? '<div class="coin"><div class="coin-a"><p class="kicker">At its best</p><h3>' + esc(V.best) + '</h3><p>' + esc(V.bestText) + '</p></div>' +
        '<div class="coin-b"><p class="kicker">Its counterfeit</p><h3>' + esc(V.fake) + '</h3><p>' + esc(V.warn) + '</p><p class="src">' + esc(V.quote.cite) + '</p></div></div>' : '<p class="muted">No single quality stands out far enough to name here.</p>') +
      (P ? '<div class="partner"><p class="kicker">Your strength needs a partner</p><h3>' + esc(P.strength) + ' needs ' + esc(P.partner.toLowerCase()) + '</h3><p>' + esc(P.plain) + '</p>' + q(P.quote) + '</div>' : '')));

    // 10. In Christ and in the Body: the role first, then how we got there, then the rest.
    H.push(page(10, 'p10',
      '<div class="line" style="--l:' + T.ink + '">' + img('l-' + LN.img, 'line-bg', LN.imgWho) + '<div class="line-veil"></div><div class="line-in"><p class="kicker">Your line in the Body</p><h3>' + esc(LN.name) + '</h3>' +
        '<p class="line-gift">Spiritual gift: <b>' + esc(LN.gift) + '</b></p><p>' + esc(LN.what) + '</p><p class="line-who">Pictured: ' + esc(LN.imgWho) + (LN.imgWhy ? ', ' + esc(LN.imgWhy) : '') + '.</p>' +
        '<button class="btn btn--line" data-act="card" data-card="line">Save this card</button></div></div>' +
      (LN.giftNote ? '<p class="gift-note"><b>Why ' + esc(LN.gift.toLowerCase()) + '?</b> ' + esc(LN.giftNote) + '</p>' : '') +
      '<p class="kicker">How we got there</p><div class="whys">' + why.map(function (w) { return '<span class="chip">' + esc(w) + '</span>'; }).join('') + '</div>' +
      '<p>' + esc(LN.cassian) + '</p>' + q(LN.quote) +
      '<div class="tidbit"><p class="kicker">Did you know?</p><p>' + esc(LN.tidbit) + '</p></div>' +
      '<div class="grace"><p class="kicker">And in Christ</p><p class="big">' + esc(D.grace.text) + '</p>' + q(D.grace.quote) + '<p class="muted">' + esc(R.CHRIST.giftOrVictory) + '</p></div>' +
      '<p>' + esc(R.BODY.stay) + '</p>' + q(R.BODY.stayQuote) +
      '<div class="tidbit tidbit--soft"><p>' + esc(R.BODY.farmer) + '</p></div>' +
      '<div class="need"><p class="kicker">The member you need most</p><p class="need-lead">' + esc(R.BODY.needLead) + '</p>' + q(R.BODY.needQuote) +
        '<div class="partner-line">' + img(PL.img, 'face', PL.imgWho) + '<div><b>' + esc(PL.name) + '</b><p class="pl-gift">Spiritual gift: ' + esc(PL.gift) + '</p></div><p>' + esc(LN.needWhy || PL.what) + '</p></div></div>' +
      quizCard('q-gifts', R.BODY.gifts, 'What are your spiritual gifts?', ['8 min', '57 statements', '19 gifts'], LIVE + '/q/spiritual-gifts/')));

    H.push('<details class="how"><summary>How this quiz works</summary><p>The questions and the report are built on St Gregory the Great’s Pastoral Rule and Moralia on Job (both around 590), which sort people by temperament and say what each needs. Behind him stands St Gregory the Theologian, whom he names as his teacher. The private page follows St John Cassian’s eight thoughts, as the desert fathers taught them. The saints and Bible figures are named only where an early source records their temper. Every quotation is word for word from a public-domain translation.</p></details>');
    H.push('<details class="how"><summary>Picture credits</summary><p class="credits">' + esc(CREDITS) + '</p></details>');
    app.innerHTML = H.join('');
    top();
    pagerUpdate();
  }

  // ------------------------------------------------------------------------------------------------ the pager
  // A sticky bar: previous, the current page (tap for the list of all ten), next, and how far down you are.
  var curPage = 0;
  function pagerUpdate() {
    var nav = document.querySelector('.pager'); if (!nav) return;
    var y = nav.getBoundingClientRect().height + 24, at = 0;
    PAGES.forEach(function (p, i) { var el = document.getElementById(p[0]); if (el && el.getBoundingClientRect().top <= y) at = i; });
    var doc = document.documentElement, done = Math.min(1, window.scrollY / Math.max(1, doc.scrollHeight - innerHeight));
    nav.querySelector('.pg-bar i').style.width = (done * 100) + '%';
    if (at === curPage && nav.dataset.ready) return;
    curPage = at; nav.dataset.ready = '1';
    nav.querySelector('.pg-n').textContent = (at + 1) + ' of ' + PAGES.length;
    nav.querySelector('.pg-t').textContent = PAGES[at][1];
    nav.querySelectorAll('.pg-arrow')[0].disabled = at === 0;
    nav.querySelectorAll('.pg-arrow')[1].disabled = at === PAGES.length - 1;
    nav.querySelectorAll('.pg-menu a').forEach(function (a, i) { a.classList.toggle('is-here', i === at); });
  }
  function goPage(id) {
    var el = document.getElementById(id), nav = document.querySelector('.pager'); if (!el) return;
    var off = id === 'p1' ? 0 : el.getBoundingClientRect().top + window.scrollY - (nav ? nav.getBoundingClientRect().height : 0) - 10;
    window.scrollTo({ top: off, behavior: 'smooth' });
  }
  window.addEventListener('scroll', pagerUpdate, { passive: true });
  window.addEventListener('resize', pagerUpdate);

  // ------------------------------------------------------------------------------------------------ share cards
  // Two cards people would keep or post: the type (page 1) and the role in the Body (page 10). Drawn on a canvas at
  // 1080 x 1350 like the site's own cards, always in the light palette, each with the logo and the way back here.
  var CARD = null;
  var loadImg = function (src) { return new Promise(function (ok) { var im = new Image(); im.onload = function () { ok(im); }; im.onerror = function () { ok(null); }; im.src = src; }); };
  function fonts() {
    if (!document.fonts || !document.fonts.load) return Promise.resolve();
    return Promise.all(['700 120px Philosopher', 'italic 400 44px Philosopher', '600 30px Poppins', '700 26px Poppins', '500 34px Inter'].map(function (f) { return document.fonts.load(f).catch(function () {}); }));
  }
  function logoParts(white) {
    var svg = LOGO.word.replace(/currentColor/g, white ? '#FFFFFF' : '#5A6066').replace('<svg ', '<svg width="540" height="78" ');
    return Promise.all([loadImg(white ? LOGO.wWhite : LOGO.w), loadImg('data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg))]);
  }
  function drawLogo(g, parts, x, y, h) {
    var w = h * 159 / 114, wordH = Math.round(h * 18.5 / 34), wordW = wordH * 5405 / 783;
    if (parts[0]) g.drawImage(parts[0], x, y, w, h);
    if (parts[1]) g.drawImage(parts[1], x + w + h * 15 / 34, y + (h - wordH) / 2 - 1.5, wordW, wordH);
  }
  function cover(g, im, x, y, w, h, fy) {
    if (!im) return;
    var s = Math.max(w / im.width, h / im.height), sw = w / s, sh = h / s;
    g.drawImage(im, (im.width - sw) / 2, (im.height - sh) * (fy == null ? .5 : fy), sw, sh, x, y, w, h);
  }
  function wrap(g, text, maxW) {
    var words = text.split(' '), lines = [], line = '';
    words.forEach(function (w) { var t = line ? line + ' ' + w : w; if (g.measureText(t).width > maxW && line) { lines.push(line); line = w; } else line = t; });
    if (line) lines.push(line);
    return lines;
  }
  // Pills that wrap to new rows. With `dry`, nothing is drawn: it only says how tall they would be.
  function pills(g, list, x, y, maxW, style, dry) {
    g.font = style.font; var px = x, py = y, h = style.h;
    list.forEach(function (t) {
      var w = g.measureText(t).width + style.pad * 2;
      if (px + w > x + maxW && px > x) { px = x; py += h + 14; }
      if (!dry) {
        g.beginPath(); g.roundRect(px, py, w, h, h / 2);
        if (style.fill) { g.fillStyle = style.fill; g.fill(); }
        if (style.stroke) { g.strokeStyle = style.stroke; g.lineWidth = 2; g.stroke(); }
        g.fillStyle = style.ink; g.fillText(t, px + style.pad, py + h / 2 + style.base);
      }
      px += w + 12;
    });
    return py + h;
  }
  function footer(g, W, H, ink, say) {
    g.fillStyle = ink; g.fillRect(0, H - 14, W, 14);
    g.fillStyle = 'rgba(255,255,255,.72)'; g.font = '600 26px Poppins, sans-serif'; g.fillText(say.toUpperCase(), 72, H - 62);
    g.fillStyle = '#FFFFFF'; g.font = '700 34px Poppins, sans-serif';
    var w = g.measureText(QUIZ_URL).width; g.fillText(QUIZ_URL, W - 72 - w, H - 60);
  }
  function drawCard(kind) {
    var W = 1080, H = 1350, c = document.createElement('canvas'); c.width = W; c.height = H;
    var g = c.getContext('2d'), C = CARD, T = C.T;
    return Promise.all([fonts(), logoParts(true), loadImg(IMG[kind === 'type' ? T.art : 'l-' + C.LN.img])]).then(function (got) {
      var logo = got[1], pic = got[2];
      g.fillStyle = '#16161B'; g.fillRect(0, 0, W, H);
      if (kind === 'type') {
        cover(g, pic, 0, 0, W, H, .4);
        var v = g.createLinearGradient(0, 0, 0, H);
        v.addColorStop(0, 'rgba(12,12,16,.55)'); v.addColorStop(.16, 'rgba(12,12,16,.08)'); v.addColorStop(.4, 'rgba(12,12,16,.3)'); v.addColorStop(.62, 'rgba(12,12,16,.8)'); v.addColorStop(1, 'rgba(12,12,16,.96)');
        g.fillStyle = v; g.fillRect(0, 0, W, H);
      } else {
        cover(g, pic, 0, 0, W, H * .66, .12);
        var v2 = g.createLinearGradient(0, 0, 0, H);
        v2.addColorStop(0, 'rgba(12,12,16,.5)'); v2.addColorStop(.14, 'rgba(12,12,16,.05)'); v2.addColorStop(.42, 'rgba(12,12,16,.35)'); v2.addColorStop(.62, 'rgba(14,14,18,.97)'); v2.addColorStop(1, 'rgb(14,14,18)');
        g.fillStyle = v2; g.fillRect(0, 0, W, H);
        var tint = g.createLinearGradient(0, H * .5, 0, H); tint.addColorStop(0, 'rgba(0,0,0,0)'); tint.addColorStop(1, T.ink + '33');
        g.fillStyle = tint; g.fillRect(0, 0, W, H);
      }
      drawLogo(g, logo, 72, 64, 56);
      g.fillStyle = 'rgba(255,255,255,.85)'; g.font = '700 24px Poppins, sans-serif'; g.textBaseline = 'alphabetic';
      var tag = 'PERSONALITY QUIZ'; g.fillText(tag, W - 72 - g.measureText(tag).width, 102);
      g.shadowColor = 'rgba(0,0,0,.35)'; g.shadowBlur = 18;
      // Both cards are laid out from the bottom up: measure every block first, then start high enough that the last
      // one ends above the footer, whatever the name, tagline or reasons are.
      var X = 72, MW = W - 144, FLOOR = H - 128;
      var BADGE = { font: '700 26px Poppins, sans-serif', h: 56, pad: 26, base: 9, fill: T.ink, ink: '#15161A' };
      var CHIP = { font: '600 27px Poppins, sans-serif', h: 56, pad: 24, base: 10, fill: 'rgba(20,20,26,.45)', stroke: 'rgba(255,255,255,.3)', ink: '#FFFFFF' };
      if (kind === 'type') {
        g.font = '700 132px Philosopher, serif'; var nl = wrap(g, T.name, MW);
        g.font = 'italic 400 44px Philosopher, serif'; var tl = wrap(g, T.tagline, MW);
        var poles = C.r.strongest.map(function (s) { return s.pole; });
        var badges = [C.D.word.toUpperCase(), (C.M.word + ' mind').toUpperCase()];
        var chipsH = poles.length ? pills(g, poles, X, 0, MW, CHIP, true) + 16 : 0;
        var y = FLOOR - chipsH - 56 - 40 - tl.length * 58 - nl.length * 132;
        g.fillStyle = 'rgba(255,255,255,.9)'; g.font = '700 28px Poppins, sans-serif'; g.fillText('MY TYPE', X, y);
        g.fillStyle = '#FFFFFF'; g.font = '700 132px Philosopher, serif';
        nl.forEach(function (l) { y += 132; g.fillText(l, X, y); });
        g.font = 'italic 400 44px Philosopher, serif'; g.fillStyle = 'rgba(255,255,255,.94)';
        tl.forEach(function (l) { y += 58; g.fillText(l, X, y); });
        g.shadowBlur = 0;
        y = pills(g, badges, X, y + 40, MW, BADGE);
        if (poles.length) pills(g, poles, X, y + 16, MW, CHIP);
        footer(g, W, H, T.ink, 'What’s your type?');
      } else {
        var LN = C.LN, WHY = { font: '600 25px Poppins, sans-serif', h: 52, pad: 22, base: 9, fill: 'rgba(255,255,255,.1)', stroke: 'rgba(255,255,255,.26)', ink: '#FFFFFF' };
        g.font = '500 32px Inter, sans-serif'; var wl = wrap(g, LN.what, MW).slice(0, 3);
        var whyH = pills(g, C.why, X, 0, MW, WHY, true);
        var y2 = FLOOR - 50 - whyH - 20 - 58 - wl.length * 46 - 64 - 118;
        g.fillStyle = 'rgba(255,255,255,.9)'; g.font = '700 28px Poppins, sans-serif'; g.fillText('MY LINE IN THE BODY', X, y2);
        g.fillStyle = '#FFFFFF'; g.font = '700 118px Philosopher, serif'; y2 += 118; g.fillText(LN.name, X, y2);
        g.shadowBlur = 0;
        g.font = 'italic 400 44px Philosopher, serif'; g.fillStyle = 'rgba(255,255,255,.94)'; y2 += 64; g.fillText('Spiritual gift: ' + LN.gift, X, y2);
        g.font = '500 32px Inter, sans-serif'; g.fillStyle = 'rgba(255,255,255,.88)';
        wl.forEach(function (l) { y2 += 46; g.fillText(l, X, y2); });
        g.fillStyle = 'rgba(255,255,255,.62)'; g.font = '700 22px Poppins, sans-serif'; y2 += 58; g.fillText('HOW I GOT HERE', X, y2);
        y2 = pills(g, C.why, X, y2 + 20, MW, WHY);
        g.fillStyle = 'rgba(255,255,255,.75)'; g.font = '500 28px Inter, sans-serif'; g.fillText('My type: ' + T.name, X, y2 + 50);
        footer(g, W, H, T.ink, 'Find yours');
      }
      return c;
    });
  }
  var DOWNLOADS = window.claude && window.claude.use ? window.claude.use('downloads').catch(function () { return null; }) : Promise.resolve(null);
  function shareSheet(kind) {
    var el = document.createElement('div');
    el.className = 'sheet-wrap';
    el.innerHTML = '<div class="csheet" role="dialog" aria-modal="true" aria-label="Your card"><p class="cs-k">' + (kind === 'type' ? 'Your type card' : 'Your role card') + '</p>' +
      '<div class="cs-img"><span class="cs-wait">Drawing your card…</span></div>' +
      '<div class="row"><button class="btn" data-role="save" type="button" disabled>Save image</button><button class="btn ghost" data-role="share" hidden>Share</button><button class="btn ghost" data-act="closesheet">Close</button></div>' +
      '<p class="cs-note">On a phone you can also press and hold the picture to save it. The link printed on it brings people to the quiz.</p></div>';
    document.body.appendChild(el);
    drawCard(kind).then(function (c) {
      var url = c.toDataURL('image/png');
      el.querySelector('.cs-img').innerHTML = '<img src="' + url + '" alt="Your ' + kind + ' card">';
      var save = el.querySelector('[data-role="save"]'), name = 'wiser-walk-' + kind + '.png';
      save.disabled = false;
      save.onclick = function () {
        // Hosted as an Artifact, the viewer grants saves through the downloads capability (it asks the viewer first);
        // opened as a plain file, an ordinary download link does it.
        DOWNLOADS.then(function (dl) {
          if (!dl) { var a = document.createElement('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove(); return; }
          c.toBlob(function (b) {
            dl.save({ filename: name, data: b }).then(function () { save.textContent = 'Saved'; }, function (err) {
              if (err && err.code === 'declined') return;
              save.textContent = 'Press and hold the picture'; save.disabled = true;
            });
          }, 'image/png');
        });
      };
      var sh = el.querySelector('[data-role="share"]');
      try {
        var probe = new File([new Blob([''], { type: 'image/png' })], 'x.png', { type: 'image/png' });
        if (matchMedia('(hover: none) and (pointer: coarse)').matches && navigator.canShare && navigator.canShare({ files: [probe] })) {
          sh.hidden = false;
          sh.onclick = function () { c.toBlob(function (b) { navigator.share({ files: [new File([b], 'wiser-walk-' + kind + '.png', { type: 'image/png' })], title: 'Personality Quiz' }).catch(function () {}); }); };
        }
      } catch (x) {}
    });
  }

  // ------------------------------------------------------------------------------------------------ type sheet
  function typeSheet(k) {
    var t = R.TYPES[k], d = R.DISPOSITIONS[t.disposition];
    var el = document.createElement('div');
    el.className = 'sheet-wrap';
    el.innerHTML = '<div class="tsheet" role="dialog" aria-modal="true" aria-label="' + esc(t.name) + '" style="--t:' + t.ink + '">' + img(t.art, 'ts-img', '') +
      '<div class="ts-in"><h3>' + esc(t.name) + '</h3><p class="muted">' + esc(t.tagline) + '</p><p>' + esc(t.portrait) + '</p>' +
      '<p><b>Trap:</b> ' + esc(d.trap.name) + '.</p>' + (t.kindred.length ? '<p><b>Kindred:</b> ' + t.kindred.map(function (x) { return esc(x.who); }).join(', ') + '.</p>' : '') +
      '<button class="btn" data-act="closesheet">Close</button></div></div>';
    document.body.appendChild(el);
  }

  // ------------------------------------------------------------------------------------------------ events
  app.addEventListener('click', function (e) {
    var go = e.target.closest('[data-go]');
    if (go) { e.preventDefault(); var m0 = document.querySelector('.pg-menu'); m0.hidden = true; document.querySelector('.pg-cur').setAttribute('aria-expanded', 'false'); goPage(go.getAttribute('data-go')); return; }
    var b = e.target.closest('button, a[href="#"]');
    if (!b) return;
    if (b.matches('a[href="#"]')) { e.preventDefault(); return; }
    var act = b.getAttribute('data-act');
    if (act === 'begin') { state.i = 0; question(); top(); return; }
    if (act === 'example') { result(EXAMPLE); return; }
    if (act === 'back') { if (state.i > 0) { state.i--; question(); } else start(); return; }
    if (act === 'private') { state.seenPrivate = true; question(); return; }
    if (act === 'next') { next(); return; }
    if (act === 'card') { shareSheet(b.getAttribute('data-card')); return; }
    if (act === 'copylink') { try { navigator.clipboard.writeText('https://' + QUIZ_URL).then(function () { b.textContent = 'Copied'; }, function () { b.textContent = QUIZ_URL; }); } catch (x) { b.textContent = QUIZ_URL; } return; }
    if (act === 'pg') { var n = curPage + parseInt(b.getAttribute('data-dir'), 10); if (n >= 0 && n < PAGES.length) goPage(PAGES[n][0]); return; }
    if (act === 'pgmenu') { var m = document.querySelector('.pg-menu'); m.hidden = !m.hidden; b.setAttribute('aria-expanded', String(!m.hidden)); return; }
    if (act === 'showfight') { var f = document.getElementById('fight'), open = f.hidden; f.hidden = !open; b.textContent = open ? 'Hide it' : 'Show it'; b.setAttribute('aria-expanded', String(open)); pagerUpdate(); return; }
    if (act === 'copyhelp') { var t = Array.prototype.map.call(document.querySelectorAll('.note li'), function (li, i) { return (i + 1) + '. ' + li.firstChild.textContent; }).join('\n'); try { navigator.clipboard.writeText('How to help me\n' + t).then(function () { b.textContent = 'Copied'; }, function () { b.textContent = 'Select and copy'; }); } catch (x) { b.textContent = 'Select and copy'; } return; }
    if (b.hasAttribute('data-type')) { typeSheet(b.getAttribute('data-type')); return; }
    if (b.hasAttribute('data-line')) {
      var it = ITEMS[state.i], cur = (state.answers[it.id] || []).slice(), l = b.getAttribute('data-line'), at = cur.indexOf(l);
      if (at > -1) cur.splice(at, 1); else { if (cur.length >= it.max) cur.shift(); cur.push(l); }
      state.answers[it.id] = cur; question(); return;
    }
    if (b.hasAttribute('data-v')) { answer(parseInt(b.getAttribute('data-v'), 10)); return; }
  });
  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-act="closesheet"]') || e.target.classList.contains('sheet-wrap')) {
      var w = document.querySelector('.sheet-wrap'); if (w) w.remove();
    }
    var menu = document.querySelector('.pg-menu');
    if (menu && !menu.hidden && !e.target.closest('.pager')) { menu.hidden = true; document.querySelector('.pg-cur').setAttribute('aria-expanded', 'false'); }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    var w = document.querySelector('.sheet-wrap'); if (w) w.remove();
    var menu = document.querySelector('.pg-menu'); if (menu) menu.hidden = true;
  });

  // Light by default, as on the site; ?dark (or the button in the top note) switches.
  var setTheme = function (t) {
    document.documentElement.setAttribute('data-theme', t);
    var tb = document.getElementById('themebtn'); if (tb) tb.textContent = t === 'dark' ? 'Light theme' : 'Dark theme';
  };
  setTheme(/[?&]dark\b/.test(location.search) ? 'dark' : 'light');
  document.addEventListener('click', function (e) {
    if (e.target.id === 'themebtn') setTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
  });
  window.PQ_show = result; // for review scripts: render any set of answers
  // #example opens the example report; #q12 opens question 12; #card-type / #card-line open a share card (review captures).
  var m = /^#q(\d+)$/.exec(location.hash);
  if (location.hash === '#example' || location.hash === '#example-open' || /^#card-/.test(location.hash)) {
    result(EXAMPLE);
    if (/^#card-/.test(location.hash)) shareSheet(location.hash.slice(6));
    if (location.hash === '#example-open') document.getElementById('fight').hidden = false;
  }
  else if (m) { state.i = Math.min(ITEMS.length, +m[1]) - 1; state.seenPrivate = ITEMS[state.i].block === 'private'; question(); }
  else start();
})();
