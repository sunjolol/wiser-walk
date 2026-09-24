(function () {
  var root = document.documentElement, body = document.body;

  /* Local testing only: ?theme=dark or ?theme=light. An artifact never sees a query string. */
  try {
    var qt = new URLSearchParams(location.search).get('theme');
    if (qt === 'dark' || qt === 'light') root.setAttribute('data-theme', qt);
  } catch (e) {}

  /* ---- the bulb */
  var bulb = document.getElementById('theme-toggle');
  var mq = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
  function isDark() {
    var a = root.getAttribute('data-theme');
    if (a === 'dark' || a === 'light') return a === 'dark';
    return !!(mq && mq.matches);
  }
  function paintBulb() { bulb.classList.toggle('lit', !isDark()); }
  bulb.addEventListener('click', function () { root.setAttribute('data-theme', isDark() ? 'light' : 'dark'); paintBulb(); });
  if (mq && mq.addEventListener) mq.addEventListener('change', paintBulb);
  try { new MutationObserver(paintBulb).observe(root, { attributes: true, attributeFilter: ['data-theme'] }); } catch (e) {}
  paintBulb();

  /* ---- the header menus: one open at a time, closed by a tap elsewhere or Escape */
  var menus = [].slice.call(document.querySelectorAll('.site-head .navmenu'));
  menus.forEach(function (m) {
    m.addEventListener('toggle', function () {
      if (m.open) menus.forEach(function (o) { if (o !== m) o.open = false; });
    });
  });
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.site-head .navmenu')) menus.forEach(function (m) { m.open = false; });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') menus.forEach(function (m) { m.open = false; });
  });

  /* ---- the toast, for links that go nowhere in a mock-up */
  var toastEl = document.getElementById('toast'), toastT;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('on');
    clearTimeout(toastT);
    toastT = setTimeout(function () { toastEl.classList.remove('on'); }, 2200);
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a');
    if (!a) return;
    if (a.hasAttribute('data-dead')) {
      e.preventDefault();
      toast("That link is not live in the mock-up. Only St Martin's page is built.");
      return;
    }
  });

  /* ---- the pager: previous, the section you are in (tap for them all), next */
  var nav = document.querySelector('[data-pager]');
  var menu = document.getElementById('pg-menu');
  var menuBtn = document.querySelector('[data-pg-menu]');
  var links = [].slice.call(document.querySelectorAll('[data-pg-go]'));
  var secs = links.map(function (a) { return { id: a.getAttribute('data-pg-go'), name: a.textContent }; });
  var arrows = [].slice.call(document.querySelectorAll('[data-pg-dir]'));
  var cur = -1;
  function closeMenu() { if (!menu.hidden) { menu.hidden = true; menuBtn.setAttribute('aria-expanded', 'false'); } }
  function update() {
    if (!nav.offsetParent) return;
    var y = nav.getBoundingClientRect().bottom + 24, at = 0;
    secs.forEach(function (s, i) {
      var el = document.getElementById(s.id);
      if (el && el.getBoundingClientRect().top <= y) at = i;
    });
    // At the very bottom the last sections may never reach the top; the last one is where you are.
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) at = secs.length - 1;
    if (at === cur) return;
    cur = at;
    nav.querySelector('.pg-t').textContent = secs[at].name;
    arrows[0].disabled = at === 0;
    arrows[1].disabled = at === secs.length - 1;
    links.forEach(function (a, i) {
      a.classList.toggle('is-here', i === at);
      if (i === at) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
    });
  }
  function goSec(id) {
    var el = document.getElementById(id);
    if (!el) return;
    var off = nav.getBoundingClientRect().height + 18;
    var smooth = !(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - off, behavior: smooth ? 'smooth' : 'auto' });
  }
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { ticking = false; update(); });
  }
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  arrows.forEach(function (b) {
    b.addEventListener('click', function () {
      var n = cur + Number(b.getAttribute('data-pg-dir'));
      if (n >= 0 && n < secs.length) goSec(secs[n].id);
    });
  });
  menuBtn.addEventListener('click', function () {
    menu.hidden = !menu.hidden;
    menuBtn.setAttribute('aria-expanded', String(!menu.hidden));
  });
  links.forEach(function (a) {
    a.addEventListener('click', function (e) { e.preventDefault(); closeMenu(); goSec(a.getAttribute('data-pg-go')); });
  });
  document.addEventListener('click', function (e) { if (!e.target.closest('[data-pager]')) closeMenu(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });

  /* ---- the three views */
  var VIEWS = ['menu', 'hub', 'martin'];
  var SERP = {
    menu: ['wiserwalk.com › saints', 'Saints and Church Fathers: lives, quotes, feast days', 'Browse saints and early Christians: their lives, their own words with the book and chapter, and their feast days East and West.'],
    hub: ['wiserwalk.com › saints', 'Saints and Church Fathers: lives, quotes, feast days', 'Browse saints and early Christians: their lives, their own words with the book and chapter, and their feast days East and West.'],
    martin: ['wiserwalk.com › saints › martin-of-tours', 'St Martin of Tours: the cloak, his miracles and his feast days', 'Who Martin of Tours was, in plain words: the cloak, his miracles, his feast days East and West, and his words with the book and chapter.']
  };
  var learn = document.getElementById('learn-menu');
  var tabs = [].slice.call(document.querySelectorAll('.mock-tabs a'));
  var current = null;
  function route() {
    var h = (location.hash || '').slice(1);
    if (VIEWS.indexOf(h) < 0) h = 'martin';
    body.setAttribute('data-show', h === 'martin' ? 'martin' : 'hub');
    tabs.forEach(function (a) { a.setAttribute('aria-current', a.getAttribute('href') === '#' + h ? 'page' : 'false'); });
    learn.open = (h === 'menu');
    var s = SERP[h];
    document.getElementById('serp-url').textContent = s[0];
    document.getElementById('serp-t').textContent = s[1];
    document.getElementById('serp-d').textContent = s[2];
    if (current !== null && current !== h) window.scrollTo(0, 0);
    current = h;
    cur = -1; update();
  }
  window.addEventListener('hashchange', route);
  tabs.forEach(function (a) {
    a.addEventListener('click', function () {
      if (a.getAttribute('href') === location.hash) setTimeout(route, 0);
    });
  });
  route();

  /* ---- the hub's filters. Picks within one kind widen the list (Martyrs or Women); picks in
     different kinds narrow it (Martyrs who lived in the 300s). Each option shows how many people
     it would leave, so a reader never lands on an empty page by surprise. */
  var cards = [].slice.call(document.querySelectorAll('.pcard'));
  var total = cards.length;
  var KEYS = ['group', 'cent', 'side', 'type'];
  var picks = { group: [], cent: [], side: [], type: [] }, q = '';
  var LABEL = {};
  [].slice.call(document.querySelectorAll('.fpop .fopt')).forEach(function (b) {
    LABEL[b.getAttribute('data-key') + ':' + b.getAttribute('data-val')] = b.querySelector('span').textContent;
  });
  var opts = [].slice.call(document.querySelectorAll('.fopt'));
  var pills = [].slice.call(document.querySelectorAll('.fpill'));
  var countEl = document.getElementById('people-count');
  var emptyEl = document.getElementById('people-empty');
  var activeEl = document.getElementById('f-active');
  var badge = document.getElementById('f-badge');
  var sheet = document.getElementById('f-sheet');
  var showBtn = document.getElementById('f-show');
  var qEl = document.getElementById('saint-q');
  var CROSS = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  function norm(s) { return (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }
  function escH(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function has(list, v) { return (' ' + list + ' ').indexOf(' ' + v + ' ') >= 0; }
  function fits(c, key, v) {
    if (key === 'group') return has(c.getAttribute('data-groups'), v);
    if (key === 'side') return has(c.getAttribute('data-side'), v);
    return c.getAttribute('data-' + key) === v;
  }
  function matches(c, skip) {
    for (var i = 0; i < KEYS.length; i++) {
      var k = KEYS[i];
      if (k === skip || !picks[k].length) continue;
      if (!picks[k].some(function (v) { return fits(c, k, v); })) return false;
    }
    var nq = norm(q).trim();
    return !nq || norm(c.getAttribute('data-search')).indexOf(nq) >= 0;
  }
  function people(n) { return n + (n === 1 ? ' person' : ' people'); }
  function chip(label, attrs) {
    return '<button class="fchip-x" type="button" ' + attrs + ' aria-label="Remove ' + escH(label) + '"><span>' + escH(label) + '</span>' + CROSS + '</button>';
  }
  function apply() {
    var shown = 0;
    cards.forEach(function (c) { var ok = matches(c); c.hidden = !ok; if (ok) shown++; });
    var n = KEYS.reduce(function (a, k) { return a + picks[k].length; }, 0);
    var searching = !!norm(q).trim();
    countEl.textContent = n || searching ? shown + ' of ' + total : people(total);
    emptyEl.hidden = shown > 0;
    badge.hidden = !n;
    badge.textContent = n;
    showBtn.textContent = shown ? 'Show ' + people(shown) : 'No one matches';
    showBtn.disabled = !shown;
    opts.forEach(function (b) {
      var k = b.getAttribute('data-key'), v = b.getAttribute('data-val'), on = picks[k].indexOf(v) >= 0, m = 0;
      cards.forEach(function (c) { if (matches(c, k) && fits(c, k, v)) m++; });
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
      b.querySelector('.fopt-n').textContent = m;
      b.disabled = !m && !on;
    });
    pills.forEach(function (p) {
      var len = picks[p.getAttribute('data-pop')].length, pn = p.querySelector('.fpill-n');
      pn.hidden = !len;
      pn.textContent = len;
      p.classList.toggle('is-on', len > 0);
    });
    var html = '';
    KEYS.forEach(function (k) { picks[k].forEach(function (v) { html += chip(LABEL[k + ':' + v], 'data-key="' + k + '" data-val="' + v + '"'); }); });
    if (searching) html += chip('“' + q.trim() + '”', 'data-q');
    if (html) html += '<button class="fclear" type="button" data-clear-all>Clear all</button>';
    activeEl.innerHTML = html;
    activeEl.hidden = !html;
  }
  function clearAll() {
    KEYS.forEach(function (k) { picks[k] = []; });
    q = ''; qEl.value = '';
    apply();
  }
  function closePops(except) {
    pills.forEach(function (p) {
      if (p === except) return;
      p.setAttribute('aria-expanded', 'false');
      document.getElementById('pop-' + p.getAttribute('data-pop')).hidden = true;
    });
  }
  pills.forEach(function (p) {
    p.addEventListener('click', function () {
      var pop = document.getElementById('pop-' + p.getAttribute('data-pop'));
      closePops(p);
      pop.hidden = !pop.hidden;
      p.setAttribute('aria-expanded', String(!pop.hidden));
    });
  });
  document.addEventListener('click', function (e) {
    var t = e.target;
    var o = t.closest('.fopt');
    if (o) {
      var k = o.getAttribute('data-key'), v = o.getAttribute('data-val'), i = picks[k].indexOf(v);
      if (i >= 0) picks[k].splice(i, 1); else picks[k].push(v);
      apply();
      return;
    }
    var x = t.closest('.fchip-x');
    if (x) {
      if (x.hasAttribute('data-q')) { q = ''; qEl.value = ''; }
      else picks[x.getAttribute('data-key')].splice(picks[x.getAttribute('data-key')].indexOf(x.getAttribute('data-val')), 1);
      apply();
      return;
    }
    if (t.closest('[data-clear-all]')) { clearAll(); return; }
    var one = t.closest('[data-clear]');
    if (one) { picks[one.getAttribute('data-clear')] = []; apply(); return; }
    if (t.closest('.fdone')) { closePops(); return; }
    if (!t.closest('.fpill-w')) closePops();
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closePops(); });

  /* the phone sheet: it rises from the bottom, and "Show N people" closes it on the results */
  function lock(on) { root.classList.toggle('is-locked', on); }
  document.getElementById('f-open').addEventListener('click', function () {
    if (typeof sheet.showModal === 'function') sheet.showModal(); else sheet.setAttribute('open', '');
    lock(true);
  });
  function closeSheet() { if (sheet.open) sheet.close(); lock(false); }
  sheet.addEventListener('close', function () { lock(false); });
  sheet.addEventListener('click', function (e) { if (e.target === sheet) closeSheet(); });
  sheet.querySelector('.fsheet-x').addEventListener('click', closeSheet);
  showBtn.addEventListener('click', function () {
    closeSheet();
    document.getElementById('people').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  qEl.addEventListener('input', function () { q = qEl.value; apply(); });
  document.getElementById('saint-search').addEventListener('submit', function (e) {
    e.preventDefault();
    document.getElementById('people').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  /* a collection card is a way in: it starts the list afresh on that group */
  [].slice.call(document.querySelectorAll('.coll')).forEach(function (c) {
    c.addEventListener('click', function () {
      KEYS.forEach(function (k) { picks[k] = []; });
      picks.group = [c.getAttribute('data-group')];
      q = ''; qEl.value = '';
      apply();
      document.getElementById('people').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
  apply();
})();
