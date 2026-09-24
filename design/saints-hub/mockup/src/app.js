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

  /* ---- the hub's filters */
  var cards = [].slice.call(document.querySelectorAll('.pcard'));
  var total = cards.length;
  var state = { group: 'all', cent: 'all', side: 'all', type: 'all', q: '' };
  var countEl = document.getElementById('people-count');
  var clearEl = document.getElementById('people-clear');
  var emptyEl = document.getElementById('people-empty');
  var qEl = document.getElementById('saint-q');
  function norm(s) { return (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }
  function has(list, v) { return (' ' + list + ' ').indexOf(' ' + v + ' ') >= 0; }
  function apply() {
    var shown = 0, q = norm(state.q).trim();
    cards.forEach(function (c) {
      var ok = (state.group === 'all' || has(c.dataset.groups, state.group))
        && (state.cent === 'all' || c.dataset.cent === state.cent)
        && (state.side === 'all' || has(c.dataset.side, state.side))
        && (state.type === 'all' || c.dataset.type === state.type)
        && (!q || norm(c.dataset.search).indexOf(q) >= 0);
      c.hidden = !ok;
      if (ok) shown++;
    });
    var filtered = state.group !== 'all' || state.cent !== 'all' || state.side !== 'all' || state.type !== 'all' || q;
    countEl.textContent = filtered ? shown + ' of ' + total + ' people' : total + ' people';
    clearEl.hidden = !filtered;
    emptyEl.hidden = shown > 0;
  }
  function setRow(key, val) {
    state[key] = val;
    [].slice.call(document.querySelectorAll('.fchip[data-key="' + key + '"]')).forEach(function (b) {
      b.setAttribute('aria-pressed', b.dataset.val === val ? 'true' : 'false');
    });
  }
  document.getElementById('filters').addEventListener('click', function (e) {
    var b = e.target.closest('.fchip');
    if (!b) return;
    setRow(b.dataset.key, b.dataset.val);
    apply();
  });
  clearEl.addEventListener('click', function () {
    ['group', 'cent', 'side', 'type'].forEach(function (k) { setRow(k, 'all'); });
    state.q = ''; qEl.value = '';
    apply();
  });
  qEl.addEventListener('input', function () { state.q = qEl.value; apply(); });
  document.getElementById('saint-search').addEventListener('submit', function (e) {
    e.preventDefault();
    document.getElementById('people').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  [].slice.call(document.querySelectorAll('.coll')).forEach(function (c) {
    c.addEventListener('click', function () {
      setRow('group', c.dataset.group);
      apply();
      document.getElementById('people').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
  apply();
})();
