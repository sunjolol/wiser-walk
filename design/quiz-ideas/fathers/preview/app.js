// Quiz #4 preview page (draft 4). Expects the scorer (compare, result) and D = { statements, centre, people, pairs,
// topics, example, wordmark } before it. Three ways to see a result, as on the site: your own (after taking it), someone
// else's (their link, #r-<code>), and the example. Person pages show the answers of whichever result you came from.
var quiz = D;
var SITE = 'wiserwalk.com', SLUG = 'which-early-christian';
var SCALE = [[2, 'Strongly agree'], [1, 'Agree'], [0, 'Not sure'], [-1, 'Disagree'], [-2, 'Strongly disagree']];
var WORD = { '2': 'Strongly agree', '1': 'Agree', '0': 'Not sure', '-1': 'Disagree', '-2': 'Strongly disagree' };
var IDS = D.statements.map(function (s) { return s.id; });
var app = document.getElementById('app');
var answers = {}, at = 0;
var mine = null; // your own answers, once you finish the quiz

function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
function P(k) { return D.people[k]; }
function he(k) { return P(k).she ? 'she' : 'he'; }
function stmt(id) { return D.statements.find(function (s) { return s.id === id; }); }
function go(html) { app.innerHTML = html; window.scrollTo(0, 0); }
function shown(k) { return function (x) { var c = P(k).cells[x.id]; return c && !c.hide; }; }
function pairLine(a, b) { return D.pairs[a + '|' + b] || D.pairs[b + '|' + a] || null; }

// The result code: one base-5 digit per statement (Strongly disagree .. Strongly agree), written in base 36.
// It stores the answers, so the link rebuilds the whole result and nothing is kept on a server.
function encode(a) {
  var n = BigInt(0);
  IDS.forEach(function (id) { n = n * BigInt(5) + BigInt((a[id] || 0) + 2); });
  return n.toString(36);
}
function decode(code) {
  if (!/^[0-9a-z]{1,16}$/.test(code)) return null;
  var n = BigInt(0);
  for (var i = 0; i < code.length; i++) n = n * BigInt(36) + BigInt(parseInt(code[i], 36));
  var a = {};
  for (var j = IDS.length - 1; j >= 0; j--) { var d = Number(n % BigInt(5)); n = n / BigInt(5); if (d !== 2) a[IDS[j]] = d - 2; }
  return n === BigInt(0) ? a : null;
}
function resultUrl(a) { return 'https://' + SITE + '/r/' + SLUG + '/' + encode(a) + '/'; }

// ---------- start and questions ----------
function start() {
  var keys = ['augustine', 'macrina', 'chrysostom', 'antony', 'jerome', 'basil', 'origen', 'martin', 'isaac', 'benedict'];
  var n = Object.keys(D.people).length;
  go('<div class="brand"><b>Wiser Walk</b><span>Quiz</span></div>' +
    '<h1>Which early Christian thinks like you?</h1>' +
    '<p class="sub">And which would argue with you?</p>' +
    '<p class="lede">' + D.statements.length + ' opinions about money, anger, grief, God and more. Agree or disagree with each one. At the end you meet two people from the early Church: the one who thinks most like you, and the one who would argue.</p>' +
    '<div class="strip" aria-hidden="true">' + keys.map(function (k) { return '<img alt="" src="' + P(k).img + '">'; }).join('') + '</div>' +
    '<p class="caption">' + n + ' early Christians, East and West, from the 2nd century to the 7th. Every line they say is their own.</p>' +
    '<div class="row"><button class="btn" id="go">' + (mine ? 'Take it again' : 'Start') + '</button>' +
    (mine ? '<button class="btn ghost" id="back-to">Back to my result</button>' : '<button class="btn ghost" id="ex">See an example result</button>') + '</div>' +
    '<div class="row quiet"><button class="back" id="all">Meet all ' + n + '</button></div>');
  document.getElementById('go').onclick = function () { answers = {}; at = 0; ask(); };
  if (mine) document.getElementById('back-to').onclick = function () { show({ a: mine, whose: 'mine' }); };
  else document.getElementById('ex').onclick = function () { show({ a: D.example, whose: 'example' }); };
  document.getElementById('all').onclick = function () { browse(start, mine ? { a: mine, whose: 'mine' } : null); };
}

function ask() {
  var s = D.statements[at], n = D.statements.length;
  go('<div class="progress"><i style="width:' + (100 * at / n) + '%"></i></div>' +
    '<p class="step">' + (at + 1) + ' of ' + n + '</p>' +
    '<p class="stmt">' + esc(s.text) + '</p>' +
    '<div class="opts">' + SCALE.map(function (o) {
      return '<button class="opt center' + (answers[s.id] === o[0] ? ' pick' : '') + '" data-v="' + o[0] + '">' + o[1] + '</button>';
    }).join('') + '</div>' +
    '<div class="row quiet"><button class="back" id="back">' + (at ? 'Back' : 'Leave the quiz') + '</button></div>');
  app.querySelectorAll('.opt').forEach(function (b) {
    b.onclick = function () {
      answers[s.id] = Number(b.dataset.v);
      b.classList.add('pick');
      setTimeout(function () {
        if (++at < n) ask();
        else { mine = Object.assign({}, answers); show({ a: mine, whose: 'mine' }); }
      }, 160);
    };
  });
  document.getElementById('back').onclick = function () { if (at) { at--; ask(); } else start(); };
}

// ---------- lines ----------
// view = { a: answers, whose: 'mine' | 'theirs' | 'example' }. Only your own result says "You".
function subject(view) { return view.whose === 'mine' ? 'You' : 'They'; }
function lineCard(k, id, view) {
  var c = P(k).cells[id], s = stmt(id), p = P(k), a = view ? view.a[id] || 0 : null;
  var src = esc(c.work || '') + (c.by ? ', ' + esc(c.by) : '') + (c.own ? '. Our translation' : '');
  var side = (c.v > 0 ? 'agrees' : 'disagrees');
  return '<div class="line"><p class="on">On ' + esc(D.topics[id]) + '</p>' +
    '<p class="you">“' + esc(s.text) + '”' + (view ? ' ' + subject(view) + ': <b>' + WORD[a] + '</b>' : '') + '</p>' +
    '<p class="says">' + esc(p.short) + ' ' + (Math.abs(c.v) === 2 && !view ? 'strongly ' : '') + side + (c.hide ? '.' : ':') + '</p>' +
    (c.hide
      ? '<p class="src">On record in ' + esc(c.work || 'the sources') + (c.by ? ', ' + esc(c.by) : '') + '.</p>'
      : '<blockquote>“' + esc(c.line) + '”</blockquote><p class="src">' + src + '</p>' + (c.note ? '<p class="note">' + esc(c.note) + '</p>' : '')) +
    '</div>';
}
function hero(k, label) {
  var p = P(k);
  return '<div class="hero"><img src="' + p.img + '" alt="' + esc(p.name) + '"><div>' +
    '<p class="kicker">' + label + '</p><h2>' + esc(p.name) + '</h2>' +
    '<p class="meta">' + esc(p.dates) + ' · ' + esc(p.where) + '</p>' +
    '<p class="who">' + esc(p.who) + '</p><p class="hook">' + esc(p.hook) + '</p>' +
    (p.status ? '<p class="status">' + esc(p.status) + '</p>' : '') + '</div></div>';
}

// ---------- the result ----------
function show(view) {
  var a = view.a, r = result(quiz, a), you = view.whose === 'mine';
  var Your = you ? 'Your' : 'Their', you_ = you ? 'you' : 'they', yourS = you ? 'you' : 'them';
  if (!r.kindred) {
    go('<h2>Not enough to go on</h2><p class="lede">Nearly every answer was Not sure, so no one can be matched. Try again and lean one way where you can.</p><div class="row"><button class="btn" id="again">Try again</button></div>');
    document.getElementById('again').onclick = function () { answers = {}; at = 0; ask(); };
    return;
  }
  var K = r.kindred.key, S = r.sparring && r.sparring.key, face = null;
  if (S) {
    var both = D.statements.filter(function (s) {
      var x = a[s.id], ck = P(K).cells[s.id], cs = P(S).cells[s.id];
      return x && Math.abs(x) === 2 && ck && cs && !ck.hide && !cs.hide && ck.v * cs.v < 0;
    });
    face = both.length ? both[0].id : null;
  }
  var kLines = r.kindred.agree.filter(shown(K)).filter(function (x) { return x.id !== face; }).slice(0, 3);
  var kPush = r.kindred.clash.filter(shown(K)).filter(function (x) { return x.raw <= -2 && x.id !== face; })[0];
  var html = '<div class="brand"><b>Wiser Walk</b><span>' + ({ mine: 'Your result', theirs: 'A shared result', example: 'Example result' })[view.whose] + '</span></div>';
  if (view.whose === 'example') html += '<p class="caption" style="margin:-.6rem 0 1.4rem">The answers of a retired Methodist teacher, 71, from our test.</p>';
  if (view.whose === 'theirs') html += '<p class="theirs">Someone shared their result with you. <button class="back" id="take" style="padding:0;color:var(--accent)">Take the quiz yourself</button></p>';
  html += hero(K, Your + ' kindred spirit');
  html += '<div class="block"><h3>Where ' + you_ + ' think alike</h3><div class="lines">' + kLines.map(function (x) { return lineCard(K, x.id, view); }).join('') + '</div></div>';
  if (kPush) html += '<div class="block"><h3>Where ' + he(K) + ' would push back</h3><div class="lines">' + lineCard(K, kPush.id, view) + '</div></div>';
  if (S) {
    var link = pairLine(K, S);
    if (link) html += '<p class="pair">' + esc(link) + '</p>';
    html += '<div class="divider"></div>' + hero(S, Your + ' sparring partner');
    if (face) {
      html += '<div class="block"><h3>Face to face on ' + esc(D.topics[face]) + '</h3><p class="you" style="margin:0 0 .8rem">“' + esc(stmt(face).text) + '” ' + subject(view) + ': <b>' + WORD[a[face]] + '</b></p><div class="face">' +
        [K, S].map(function (k) { var c = P(k).cells[face]; return '<div class="line"><p class="says">' + esc(P(k).short) + (c.v > 0 ? ' agrees:' : ' disagrees:') + '</p><blockquote>“' + esc(c.line) + '”</blockquote><p class="src">' + esc(c.work) + (c.by ? ', ' + esc(c.by) : '') + '</p></div>'; }).join('') + '</div></div>';
    }
    var sLines = r.sparring.clash.filter(shown(S)).filter(function (x) { return x.id !== face; }).slice(0, 3);
    var sAgree = r.sparring.agree.filter(shown(S))[0];
    html += '<div class="block"><h3>Where ' + he(S) + ' would argue with ' + yourS + '</h3><div class="lines">' + sLines.map(function (x) { return lineCard(S, x.id, view); }).join('') + '</div></div>';
    if (sAgree) html += '<div class="block"><h3>Where ' + you_ + ' would agree</h3><div class="lines">' + lineCard(S, sAgree.id, view) + '</div></div>';
  }
  var also = r.ranked.filter(function (x) { return x.key !== K && x.key !== S && x.agree.length; }).slice(0, 2);
  html += '<div class="divider"></div><div class="block" style="margin-top:0"><h3>Also close</h3><div class="names">' + also.map(function (x) {
    var top = x.agree.filter(shown(x.key))[0];
    return '<button class="name" data-k="' + x.key + '"><img alt="" src="' + P(x.key).img + '"><span>' + esc(P(x.key).short) + (top ? ' <small>on ' + esc(D.topics[top.id]) + '</small>' : '') + '</span></button>';
  }).join('') + '</div></div>';
  html += '<div class="block"><h3>Everyone, from nearest to farthest</h3><div class="names">' + r.ranked.map(function (x) {
    return '<button class="name" data-k="' + x.key + '"><img alt="" src="' + P(x.key).img + '">' + esc(P(x.key).short) + '</button>';
  }).join('') + '</div></div>';
  html += view.whose === 'theirs' ? '<div class="row"><button class="btn" id="take2">Take it yourself</button></div>' : shareBlock(view);
  go(html);
  app.querySelectorAll('.name').forEach(function (b) { b.onclick = function () { person(b.dataset.k, function () { show(view); }, view); }; });
  if (view.whose === 'theirs') {
    document.getElementById('take').onclick = document.getElementById('take2').onclick = function () { answers = {}; at = 0; ask(); };
  } else wireShare(view, r);
}

// ---------- sharing: the site's standard (a picture card, your own link, Save / Share / Copy link) ----------
function shareBlock(view) {
  var url = resultUrl(view.a);
  return '<div class="divider"></div><div class="block" style="margin-top:0"><h3>' + (view.whose === 'mine' ? 'Share your result' : 'Sharing, as it works for a real result') + '</h3>' +
    '<figure class="stage"><img id="card" alt="Result card"><figcaption>This is the picture people see when you share it.</figcaption></figure>' +
    '<div class="row"><button class="btn" id="save">Save the card</button><button class="btn dark" id="share" hidden>Share</button>' +
    (view.whose === 'mine' ? '<button class="btn ghost" id="again">Take it again</button>' : '') + '</div>' +
    '<div class="linkrow"><input id="url" type="text" readonly spellcheck="false" aria-label="Result link" value="' + esc(url) + '"><button class="btn ghost" id="copy">Copy link</button></div>' +
    '<p class="hint" id="hint">' + (view.whose === 'mine' ? 'Your link opens this result for anyone you send it to. Keep it to come back to your result.' : 'Every result has its own link that opens it for anyone.') + '</p>' +
    '<div class="block"><h3>When the link is pasted in a message</h3><figure class="stage og"><img id="og" alt="Link preview picture"><figcaption>The preview that shows up in a text, WhatsApp or a post. One picture per kindred spirit, so the preview shows who you got.</figcaption></figure></div>' +
    '<p class="credit" style="margin-top:1rem"><a href="#" id="try" style="color:var(--accent)">Open this link as a friend would see it</a></p></div>';
}
function wireShare(view, r) {
  var hint = document.getElementById('hint');
  document.getElementById('copy').onclick = function () {
    var input = document.getElementById('url');
    try { navigator.clipboard.writeText(input.value).then(function () { hint.textContent = 'Link copied.'; }, function () { input.select(); hint.textContent = 'Press Ctrl+C or hold to copy.'; }); }
    catch (e) { input.select(); }
  };
  document.getElementById('url').onclick = function () { this.select(); };
  document.getElementById('save').onclick = function () { hint.textContent = 'On the site this saves the picture to your phone or computer. This preview cannot save files, so press and hold the picture instead.'; };
  var again = document.getElementById('again'); if (again) again.onclick = function () { answers = {}; at = 0; ask(); };
  document.getElementById('try').onclick = function (e) { e.preventDefault(); show({ a: view.a, whose: 'theirs' }); };
  var shareBtn = document.getElementById('share');
  try { if (navigator.canShare && navigator.canShare({ files: [new File([''], 'x.png', { type: 'image/png' })] })) shareBtn.hidden = false; } catch (e) {}
  drawCard(r).then(function (c) {
    document.getElementById('card').src = c.toDataURL('image/png');
    shareBtn.onclick = function () {
      c.toBlob(function (b) {
        navigator.share({ files: [new File([b], 'wiser-walk-' + encode(view.a) + '.png', { type: 'image/png' })], title: 'Which early Christian thinks like you?', text: resultUrl(view.a) })
          .catch(function (err) { if (err && err.name !== 'AbortError') hint.textContent = 'Sharing is not available here. Save the picture instead.'; });
      });
    };
  });
  drawOg(r.kindred.key).then(function (c) { document.getElementById('og').src = c.toDataURL('image/png'); });
}

// ---------- the card, always in the light palette (a stranger's timeline, not this page) ----------
var C = { page: '#E3E3E3', panel: '#EEEEEE', raise: '#F6F6F6', ink: '#444444', soft: '#5A6066', mute: '#7C8288', accent: '#3E86C4', blue: '#7EBAEE', orange: '#F0A06F', rule: 'rgba(68,68,68,.14)' };
var imgCache = {};
function loadImg(src) {
  if (!imgCache[src]) imgCache[src] = new Promise(function (res) { var i = new Image(); i.onload = function () { res(i); }; i.onerror = function () { res(null); }; i.src = src; });
  return imgCache[src];
}
function fonts() {
  var want = ['700 64px Philosopher', 'italic 40px Philosopher', '600 24px Poppins', '700 24px Poppins', '500 26px Poppins', '28px Inter'];
  return Promise.all(want.map(function (f) { try { return document.fonts.load(f); } catch (e) { return null; } })).catch(function () {});
}
function rr(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
function ground(g, W, H, pad, radius) {
  g.fillStyle = C.page; g.fillRect(0, 0, W, H);
  g.save(); g.strokeStyle = 'rgba(68,68,68,.045)'; g.lineWidth = 1.5;
  for (var d = -H; d < W; d += 11) { g.beginPath(); g.moveTo(d, H); g.lineTo(d + H, 0); g.stroke(); }
  g.restore();
  g.save(); g.shadowColor = 'rgba(68,68,68,.10)'; g.shadowBlur = 18; g.shadowOffsetX = 5; g.shadowOffsetY = 6;
  g.fillStyle = C.panel; rr(g, pad, pad, W - pad * 2, H - pad * 2, radius); g.fill(); g.restore();
}
function cover(g, img, x, y, w, h, r) {
  g.save(); rr(g, x, y, w, h, r); g.clip();
  if (img) { var s = Math.max(w / img.width, h / img.height), iw = img.width * s, ih = img.height * s; g.drawImage(img, x + (w - iw) / 2, y, iw, ih); }
  else { g.fillStyle = C.raise; g.fillRect(x, y, w, h); }
  g.restore();
}
function wrap(g, text, max) {
  var words = text.split(' '), lines = [], line = '';
  words.forEach(function (w) { var t = line ? line + ' ' + w : w; if (g.measureText(t).width > max && line) { lines.push(line); line = w; } else line = t; });
  if (line) lines.push(line);
  return lines;
}
function fit(g, text, max, font, size, minSize, maxLines) {
  var lines;
  do { g.font = font.replace('{s}', size); lines = wrap(g, text, max); if (lines.length <= maxLines) break; size -= 2; } while (size > minSize);
  return { lines: lines.slice(0, maxLines), size: size };
}
function pill(g, text, x, y) {
  g.font = '600 25px Poppins, sans-serif';
  var w = g.measureText(text).width + 40;
  g.fillStyle = C.raise; rr(g, x, y, w, 50, 25); g.fill();
  g.fillStyle = C.ink; g.fillText(text, x + 20, y + 34);
  return w;
}
function cardLine(r) {
  var K = r.kindred.key, lines = r.kindred.agree.filter(shown(K)).slice(0, 4).map(function (x) { return P(K).cells[x.id]; });
  var short = lines.filter(function (c) { return c.line.length <= 170; });
  return (short[0] || lines.sort(function (a, b) { return a.line.length - b.line.length; })[0]) || null;
}
function drawCard(r) {
  var W = 1080, H = 1350, pad = 52, x = 112, w = W - 2 * x;
  var K = r.kindred.key, S = r.sparring && r.sparring.key;
  return Promise.all([fonts(), loadImg(P(K).img), S ? loadImg(P(S).img) : null, loadImg(D.wordmark)]).then(function (got) {
    var c = document.createElement('canvas'); c.width = W; c.height = H; var g = c.getContext('2d');
    ground(g, W, H, pad, 44);
    var y = 150;
    g.fillStyle = C.accent; g.font = '700 24px Poppins, sans-serif'; g.fillText('MY KINDRED SPIRIT IN THE EARLY CHURCH', x, y);
    // portrait and name
    var ph = 380, pw = 304; y += 36;
    g.save(); g.shadowColor = 'rgba(68,68,68,.16)'; g.shadowBlur = 16; g.shadowOffsetX = 4; g.shadowOffsetY = 5; g.fillStyle = C.raise; rr(g, x, y, pw, ph, 26); g.fill(); g.restore();
    cover(g, got[1], x, y, pw, ph, 26);
    var cx = x + pw + 40, cw = x + w - cx;
    var nm = fit(g, P(K).name, cw, '700 {s}px Philosopher, serif', 72, 50, 3);
    g.fillStyle = C.ink; var ny = y + nm.size * .95;
    nm.lines.forEach(function (l) { g.font = '700 ' + nm.size + 'px Philosopher, serif'; g.fillText(l, cx, ny); ny += nm.size * 1.08; });
    g.fillStyle = C.mute; g.font = '500 26px Poppins, sans-serif'; g.fillText(P(K).dates, cx, ny + 8);
    g.fillStyle = C.soft; g.font = '28px Inter, sans-serif';
    var wy = ny + 62; wrap(g, P(K).who, cw).slice(0, 4).forEach(function (l) { g.fillText(l, cx, wy); wy += 40; });
    // the line that proves it
    y += ph + 70;
    var line = cardLine(r);
    if (line) {
      var q = fit(g, '“' + line.line + '”', w, 'italic {s}px Philosopher, serif', 40, 28, 4);
      g.fillStyle = C.ink;
      q.lines.forEach(function (l) { g.font = 'italic ' + q.size + 'px Philosopher, serif'; g.fillText(l, x, y); y += q.size * 1.3; });
      g.fillStyle = C.mute; g.font = '600 22px Poppins, sans-serif'; g.fillText(P(K).short.toUpperCase() + ', ' + (line.work || '').toUpperCase(), x, y + 6);
      y += 58;
    }
    // what we agree on
    g.fillStyle = C.mute; g.font = '700 21px Poppins, sans-serif'; g.fillText('WE AGREE ON', x, y + 10);
    var px = x, py = y + 30;
    r.kindred.agree.filter(shown(K)).slice(0, 3).forEach(function (a) { var t = D.topics[a.id]; g.font = '600 25px Poppins, sans-serif'; var tw = g.measureText(t).width + 40; if (px + tw > x + w) { px = x; py += 62; } px += pill(g, t, px, py) + 14; });
    y = py + 100;
    // the sparring partner
    if (S) {
      g.strokeStyle = C.rule; g.lineWidth = 2; g.beginPath(); g.moveTo(x, y - 20); g.lineTo(x + w, y - 20); g.stroke();
      var sh = 170, sw = 136;
      cover(g, got[2], x, y + 8, sw, sh, 18);
      var sx = x + sw + 32, swd = x + w - sx;
      g.fillStyle = C.accent; g.font = '700 21px Poppins, sans-serif'; g.fillText('WOULD ARGUE WITH ME', sx, y + 40);
      var sn = fit(g, P(S).name, swd, '700 {s}px Philosopher, serif', 52, 38, 1);
      g.fillStyle = C.ink; g.font = '700 ' + sn.size + 'px Philosopher, serif'; g.fillText(sn.lines[0], sx, y + 40 + sn.size + 8);
      var on = 'on ' + r.sparring.clash.filter(shown(S)).slice(0, 3).map(function (x) { return D.topics[x.id]; }).join(', ');
      g.fillStyle = C.soft; g.font = '500 26px Poppins, sans-serif';
      var oy = y + 40 + sn.size + 56; wrap(g, on, swd).slice(0, 2).forEach(function (l) { g.fillText(l, sx, oy); oy += 36; });
    }
    // brand and the way in
    var by = H - pad - 64;
    if (got[3]) { var mh = 38, mw = got[3].width / got[3].height * mh; g.drawImage(got[3], x, by - mh + 6, mw, mh); }
    g.fillStyle = C.mute; g.font = '600 22px Poppins, sans-serif'; g.textAlign = 'right';
    g.fillText((SITE + '/q/' + SLUG).toUpperCase(), x + w, by); g.textAlign = 'left';
    return c;
  });
}
// the link preview (Open Graph) picture: 1200 x 630, one per kindred spirit on the site
function drawOg(K) {
  var W = 1200, H = 630, pad = 36;
  return Promise.all([fonts(), loadImg(P(K).img), loadImg(D.wordmark)]).then(function (got) {
    var c = document.createElement('canvas'); c.width = W; c.height = H; var g = c.getContext('2d');
    ground(g, W, H, pad, 34);
    var ph = H - 2 * pad - 60, pw = Math.round(ph * .8), px = pad + 30, py = pad + 30;
    cover(g, got[1], px, py, pw, ph, 24);
    var x = px + pw + 52, w = W - pad - 44 - x, y = py + 40;
    g.fillStyle = C.accent; g.font = '700 22px Poppins, sans-serif'; g.fillText('WHICH EARLY CHRISTIAN THINKS LIKE YOU?', x, y);
    g.fillStyle = C.soft; g.font = '30px Inter, sans-serif'; g.fillText('My kindred spirit in the early Church:', x, y + 70);
    var nm = fit(g, P(K).name, w, '700 {s}px Philosopher, serif', 76, 52, 2);
    g.fillStyle = C.ink; var ny = y + 70 + nm.size * 1.15;
    nm.lines.forEach(function (l) { g.font = '700 ' + nm.size + 'px Philosopher, serif'; g.fillText(l, x, ny); ny += nm.size * 1.05; });
    g.fillStyle = C.mute; g.font = '500 26px Poppins, sans-serif'; g.fillText(P(K).dates + ' · ' + P(K).where, x, ny + 10);
    if (got[2]) { var mh = 34, mw = got[2].width / got[2].height * mh; g.drawImage(got[2], x, H - pad - 34 - mh + 8, mw, mh); }
    g.fillStyle = C.accent; g.font = '600 22px Poppins, sans-serif'; g.textAlign = 'right'; g.fillText(SITE.toUpperCase(), W - pad - 44, H - pad - 34); g.textAlign = 'left';
    return c;
  });
}

// ---------- browsing ----------
function browse(back, view) {
  var yr = function (k) { var d = P(k).dates; return /century/.test(d) ? 650 : parseInt(d.replace(/^\D+/, ''), 10); };
  var keys = Object.keys(D.people).sort(function (a, b) { return yr(a) - yr(b); });
  go('<div class="brand"><b>Wiser Walk</b><span>The early Christians</span></div><h2>Meet all ' + keys.length + '</h2>' +
    '<p class="lede">Everyone this quiz can match you with, oldest first. Tap anyone to see where they stood' + (view ? ', next to your answers.' : '.') + '</p>' +
    '<div class="grid">' + keys.map(function (k) { var p = P(k); return '<button class="card" data-k="' + k + '"><img alt="" src="' + p.img + '"><b>' + esc(p.name) + '</b><span>' + esc(p.dates) + '</span></button>'; }).join('') + '</div>' +
    '<div class="row quiet"><button class="back" id="back">Back</button></div>');
  app.querySelectorAll('.card').forEach(function (b) { b.onclick = function () { person(b.dataset.k, function () { browse(back, view); }, view); }; });
  document.getElementById('back').onclick = back;
}

// A person's page. With a result in hand it reads like the result: their words next to your answers, grouped.
function person(k, back, view) {
  var p = P(k), ids = D.statements.filter(function (s) { return p.cells[s.id]; }).map(function (s) { return s.id; });
  var body;
  if (view) {
    var you = view.whose === 'mine', a = view.a;
    var groups = [
      ['Where ' + (you ? 'you' : 'they') + ' agree', ids.filter(function (id) { return a[id] && a[id] * p.cells[id].v > 0; })],
      ['Where ' + (you ? 'you' : 'they') + ' differ', ids.filter(function (id) { return a[id] && a[id] * p.cells[id].v < 0; })],
      ['Where ' + (you ? 'you were' : 'they were') + ' not sure', ids.filter(function (id) { return !a[id]; })]
    ];
    body = groups.filter(function (gr) { return gr[1].length; }).map(function (gr) {
      return '<div class="block"><h3>' + gr[0] + '</h3><div class="lines">' + gr[1].map(function (id) { return lineCard(k, id, view); }).join('') + '</div></div>';
    }).join('');
  } else {
    body = '<div class="block"><h3>Where ' + he(k) + ' stood</h3><div class="lines">' + ids.map(function (id) { return lineCard(k, id, null); }).join('') + '</div></div>';
  }
  go('<div class="row quiet" style="margin:0 0 1rem"><button class="back" id="back">Back</button></div>' + hero(k, 'Early Christian') +
    '<p class="credit">Picture: ' + esc(p.credit) + '</p>' + body +
    '<div class="row quiet"><button class="back" id="back2">Back</button></div>');
  document.getElementById('back').onclick = back; document.getElementById('back2').onclick = back;
}

var h = (location.hash || '').slice(1), shared = h.indexOf('r-') === 0 ? decode(h.slice(2)) : null;
if (shared) show({ a: shared, whose: 'theirs' });
else if (h === 'example') show({ a: D.example, whose: 'example' });
else if (h === 'all') browse(start, null);
else start();
