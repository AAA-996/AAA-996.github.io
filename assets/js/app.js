/* ═══════════════════════════════════════════════════════════════════════════
   app.js — behaviour, no dependencies, no build step.
     1  language              7  scroll progress + nav
     2  content rendering     8  reveal on scroll
     3  project overlay       9  custom reticle
     4  hero typing          10  theme
     5  ASCII black hole     11  copy / toast / clock
     6  boot sequence        12  command palette
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var doc = document;
  var root = doc.documentElement;
  var CFG = window.CONFIG || {};
  var ID = CFG.identity || {};
  var WORK = CFG.work || [];
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var skipBoot = reduceMotion || /[?&]noboot\b/.test(location.search);

  var $ = function (sel, scope) { return (scope || doc).querySelector(sel); };
  var $$ = function (sel, scope) {
    return Array.prototype.slice.call((scope || doc).querySelectorAll(sel));
  };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var rand = function (a, b) { return a + Math.random() * (b - a); };
  var pad = function (n) { return String(n).padStart(2, '0'); };
  var TAU = Math.PI * 2;

  function esc(str) {
    return String(str).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  root.classList.remove('no-js');

  /* ─────────────────────────────────────────────────────────────────────
     1. language
     ───────────────────────────────────────────────────────────────────── */
  function lang() {
    return root.getAttribute('data-lang') === 'en' ? 'en' : 'zh';
  }

  function pick(v) {
    if (v == null) return '';
    if (typeof v === 'string') return v;
    return v[lang()] || v.zh || v.en || '';
  }

  function L(v) {
    if (v == null) return '';
    if (typeof v === 'string') return '<span>' + esc(v) + '</span>';
    return (
      '<span lang="zh">' + esc(v.zh || v.en || '') + '</span>' +
      '<span lang="en">' + esc(v.en || v.zh || '') + '</span>'
    );
  }

  var typingReset = null;

  function updateMeta() {
    var m = CFG.meta || {};
    if (m.title) {
      doc.title = pick(m.title);
      var og = $('meta[property="og:title"]');
      if (og) og.setAttribute('content', pick(m.title));
    }
    if (m.description) {
      var d = $('meta[name="description"]');
      if (d) d.setAttribute('content', pick(m.description));
      var ogd = $('meta[property="og:description"]');
      if (ogd) ogd.setAttribute('content', pick(m.description));
    }
  }

  function setLang(next) {
    next = next === 'en' ? 'en' : 'zh';
    var changed = lang() !== next;
    root.setAttribute('data-lang', next);
    root.setAttribute('lang', next === 'en' ? 'en' : 'zh-CN');
    try { localStorage.setItem('lang', next); } catch (e) {}
    updateMeta();
    if (changed && typingReset) typingReset();
    if (changed && projectView.isOpen()) projectView.refresh();
  }

  function toggleLang() {
    setLang(lang() === 'zh' ? 'en' : 'zh');
  }

  (function initLang() {
    var stored = null;
    try { stored = localStorage.getItem('lang'); } catch (e) {}
    var initial = stored === 'en' || stored === 'zh' ? stored : 'zh';
    root.setAttribute('data-lang', initial);
    root.setAttribute('lang', initial === 'en' ? 'en' : 'zh-CN');
  })();

  /* ─────────────────────────────────────────────────────────────────────
     2. content rendering
     ───────────────────────────────────────────────────────────────────── */
  function bindText() {
    $$('[data-bind]').forEach(function (el) {
      var key = el.getAttribute('data-bind');
      if (ID[key]) el.textContent = ID[key];
    });
    var mail = $('[data-bind-href="mailto"]');
    if (mail && ID.email) mail.setAttribute('href', 'mailto:' + ID.email);
  }

  function renderTicker() {
    var track = $('#ticker-track');
    if (!track) return;
    var words = (CFG.ticker || []).join(' · ') + ' · ';
    var chunk = '<span>' + esc(words + words + words) + '</span>';
    track.innerHTML = chunk + chunk;
  }

  function renderStack() {
    var grid = $('#stack-grid');
    if (!grid || !CFG.stack) return;
    grid.innerHTML = CFG.stack
      .map(function (group) {
        return (
          '<section class="stack-group reveal">' +
          '<h3>' + L(group.group) + '</h3>' +
          '<ul>' +
          (group.items || [])
            .map(function (item) { return '<li>' + L(item) + '</li>'; })
            .join('') +
          '</ul></section>'
        );
      })
      .join('');
  }

  function renderSocials() {
    var box = $('#socials');
    if (!box || !CFG.socials) return;
    box.innerHTML = CFG.socials
      .map(function (s) {
        return (
          '<li><a href="' + esc(s.href) + '" target="_blank" rel="noreferrer noopener">' +
          '<span class="label">' + L(s.label) + '</span>' +
          '<span class="handle">' + esc(s.handle) + '</span>' +
          '</a></li>'
        );
      })
      .join('');
  }

  /* ─────────────────────────────────────────────────────────────────────
     orbit: projects arranged around the black hole
     ───────────────────────────────────────────────────────────────────── */
  var orbitState = { slots: [], cx: 0, cy: 0, rx: 0, ry: 0, active: false };

  function renderOrbit() {
    var orbit = $('#orbit');
    if (!orbit) return;
    orbit.innerHTML = WORK.map(function (w, i) {
      return (
        '<div class="orbit-slot" data-slot="' + i + '">' +
        '<button class="node" type="button" data-project="' + i + '" ' +
        'aria-label="' + esc(pick(w.title)) + '">' +
        '<span class="node-idx">' + pad(i + 1) + '</span>' +
        '<span class="node-arrow" aria-hidden="true">↗</span>' +
        '<span class="node-title">' + L(w.short || w.title) + '</span>' +
        '<span class="node-kind">' + L(w.kind || '') + '</span>' +
        '</button></div>'
      );
    }).join('');

    orbitState.slots = $$('.orbit-slot', orbit);

    orbit.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-project]');
      if (btn) projectView.open(Number(btn.getAttribute('data-project')));
    });
  }

  function layoutOrbit() {
    var w = window.innerWidth;
    var h = window.innerHeight;
    var isPhone = w <= 780;

    orbitState.active = !isPhone;
    if (isPhone) return;

    var R, cy;
    if (w < 1100) {
      R = Math.min(w * 0.155, h * 0.2);
      cy = h * 0.56;
    } else {
      R = Math.min(w * 0.155, h * 0.235);
      cy = h * 0.57;
    }

    var rx = Math.max(R * 2.55, w * 0.4);
    var ry = Math.min(h * 0.29, 310);

    orbitState.cx = w / 2;
    orbitState.cy = cy;
    orbitState.ox = 0;
    // slots sit at the centre of the stage; this shifts the ring down to the hole
    orbitState.oy = cy - h / 2;
    orbitState.rx = rx;
    orbitState.ry = ry;
    orbitState.R = R;
  }

  var TILT = { x: 0, y: 0 };

  function paintOrbit(t) {
    if (!orbitState.active) return;
    var base = [-Math.PI, 0, Math.PI / 2]; // left, right, bottom
    for (var i = 0; i < orbitState.slots.length; i++) {
      var a = base[i % base.length];
      if (i >= base.length) a = base[i % base.length] + (i * TAU) / orbitState.slots.length;
      // slow breathing drift so the ring never looks frozen
      var drift = Math.sin(t * 0.00022 + i * 2.1) * 0.05;
      var ang = a + drift;
      // slots live at 50%/50% of the stage, so offsets are relative to it
      var x = orbitState.ox + Math.cos(ang) * orbitState.rx;
      var y = orbitState.oy + Math.sin(ang) * orbitState.ry;
      // parallax
      x += TILT.x * 14 * (i % 2 ? 1 : -1);
      y += TILT.y * 10;
      orbitState.slots[i].style.transform =
        'translate(-50%, -50%) translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)';
    }
  }

  /* ─────────────────────────────────────────────────────────────────────
     faint glyph drift behind the project overlay (keeps the page alive
     without fighting the text)
     ───────────────────────────────────────────────────────────────────── */
  /* the same hole, smaller, on the right of a project page */
  var pvField = (function () {
    var hole = null;
    return {
      init: function () {
        hole = createHole($('#pv-field'), {
          count: window.innerWidth <= 780 ? 420 : 900,
          stars: 0,
          place: function (w, h) {
            if (w <= 780) return { cx: w * 0.5, cy: h * 0.19, R: Math.min(w * 0.3, h * 0.11) };
            return { cx: w * 0.75, cy: h * 0.5, R: Math.min(w * 0.155, h * 0.235) };
          },
        });
      },
      start: function () {
        if (!hole) return;
        hole.resize();
        hole.growIn();
        hole.start();
      },
      stop: function () {
        if (hole) hole.stop();
      },
      setPointer: function (x, y) {
        if (hole) hole.setPointer(x, y);
      },
    };
  })();

  function syncModal() {
    var pv = $('#project-view');
    var pal = $('#palette');
    var any = (pv && pv.open) || (pal && pal.open);
    root.classList.toggle('has-modal', !!any);
  }

  /* ─────────────────────────────────────────────────────────────────────
     3. project overlay
     ───────────────────────────────────────────────────────────────────── */
  var projectView = (function () {
    var dlg = null;
    var current = -1;
    var lastFocus = null;

    function isOpen() {
      return !!(dlg && dlg.open);
    }

    function mediaMarkup(w) {
      var imgs = (w.images || []).filter(Boolean);
      if (!imgs.length) return ''; // nothing at all — no placeholder, no margin
      return imgs.map(function (src, i) {
        return (
          '<figure><img src="' + esc(src) + '" alt="' + esc(pick(w.title) + ' — ' + (i + 1)) +
          '" loading="lazy" decoding="async"></figure>'
        );
      }).join('');
    }

    function fill(i) {
      if (!dlg) return;
      var w = WORK[i];
      if (!w) return;
      current = i;

      $('#pv-idx').textContent = pad(i + 1);
      $('#pv-slug').textContent = pick(w.title);
      $('#pv-meta').innerHTML =
        (w.year ? '<span>' + esc(w.year) + '</span>' : '') +
        (w.kind ? '<span class="kind">' + L(w.kind) + '</span>' : '') +
        (w.private
          ? '<span><span lang="zh">私有仓库</span><span lang="en">PRIVATE REPO</span></span>'
          : '');
      $('#pv-title').innerHTML = L(w.title);
      $('#pv-blurb').innerHTML = L(w.blurb || '');

      var media = $('#pv-media');
      media.innerHTML = mediaMarkup(w);
      // a wrong path must not leave a broken frame behind
      $$('img', media).forEach(function (img) {
        img.addEventListener('error', function () {
          var fig = img.closest('figure');
          if (fig) fig.remove();
          if (!media.querySelector('img')) media.innerHTML = '';
        });
      });

      var tags = $('#pv-tags');
      tags.innerHTML = (w.tags || []).map(function (t) {
        return '<li>' + esc(t) + '</li>';
      }).join('');
      tags.hidden = !(w.tags || []).length;

      var actions = $('#pv-actions');
      var links = w.links || (w.link ? [w.link] : []);
      if (links.length) {
        actions.innerHTML = links.map(function (l) {
          return (
            '<a class="pv-link" href="' + esc(l.href) + '" target="_blank" rel="noreferrer noopener">' +
            L(l.label) + ' <span aria-hidden="true">↗</span></a>'
          );
        }).join('');
      } else if (w.status) {
        actions.innerHTML = '<span class="pv-status">' + L(w.status) + '</span>';
      } else {
        actions.innerHTML = '';
      }

      var note = $('#pv-note');
      note.innerHTML = w.private
        ? '<span lang="zh">这个仓库目前是私有的，点进去会看到 404；需要的话可以直接邮件问我要。</span>' +
          '<span lang="en">This repository is private right now — the link will 404. Ask me by email if you need access.</span>'
        : '';

      $('#pv-counter').textContent = pad(i + 1) + ' / ' + pad(WORK.length);

      // replay the staged entrance on every switch
      var body = $('.pv-body');
      if (body) {
        body.classList.remove('enter');
        void body.offsetWidth;
        body.classList.add('enter');
      }

      var scroll = $('#pv-scroll');
      if (scroll) scroll.scrollTop = 0;
    }

    function open(i) {
      if (!dlg || !WORK.length) return;
      lastFocus = doc.activeElement;
      fill(clamp(i, 0, WORK.length - 1));
      if (!dlg.open) dlg.showModal();
      doc.body.classList.add('is-locked');
      root.classList.add('has-modal');
      pvField.start();
      var closeBtn = $('#pv-close');
      if (closeBtn) closeBtn.focus({ preventScroll: true });
    }

    function close() {
      if (!dlg || !dlg.open) return;
      dlg.close();
    }

    function step(dir) {
      if (!WORK.length) return;
      var next = (current + dir + WORK.length) % WORK.length;
      fill(next);
    }

    function refresh() {
      if (dlg && dlg.open && current >= 0) fill(current);
    }

    function init() {
      dlg = $('#project-view');
      if (!dlg) return;

      var closeBtn = $('#pv-close');
      if (closeBtn) closeBtn.addEventListener('click', close);

      var prev = $('#pv-prev');
      var next = $('#pv-next');
      if (prev) prev.addEventListener('click', function () { step(-1); });
      if (next) next.addEventListener('click', function () { step(1); });

      // click on the empty area around the shell closes it
      dlg.addEventListener('click', function (e) {
        if (e.target === dlg) close();
      });

      dlg.addEventListener('close', function () {
        doc.body.classList.remove('is-locked');
        root.classList.remove('has-modal');
        pvField.stop();
        // back to the front page: everything falls in again
        if (heroHole) heroHole.replay();
        if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
      });

      // the hole on the right leans with the pointer
      dlg.addEventListener('pointermove', function (e) {
        pvField.setPointer(e.clientX / window.innerWidth, e.clientY / window.innerHeight);
      }, { passive: true });

      doc.addEventListener('keydown', function (e) {
        if (!dlg.open) return;
        if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
        if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
      });
    }

    return {
      init: init,
      open: open,
      close: close,
      refresh: refresh,
      isOpen: isOpen,
      current: function () { return current; },
    };
  })();

  /* ─────────────────────────────────────────────────────────────────────
     6. boot sequence
     ───────────────────────────────────────────────────────────────────── */
  var bootDone = false;
  var bootSkip = null;

  function finishBoot() {
    if (bootDone) return;
    bootDone = true;
    if (bootSkip) {
      window.removeEventListener('keydown', bootSkip);
      window.removeEventListener('pointerdown', bootSkip);
      bootSkip = null;
    }
    var boot = $('#boot');
    root.classList.add('ready');
    if (!boot) return;
    boot.classList.add('done');
    startTyping();
    window.setTimeout(function () {
      if (boot.parentNode) boot.parentNode.removeChild(boot);
    }, 900);
  }

  function runBoot() {
    var log = $('#boot-log');
    var boot = $('#boot');
    if (!boot || !log) return finishBoot();
    if (skipBoot) return finishBoot();

    var lines = [
      '> establishing uplink ',
      '> loading glyph atlas ',
      '> collapsing mass ',
      '> bending light ',
    ];
    var out = '';
    var i = 0;

    function nextLine() {
      if (bootDone) return;
      if (i >= lines.length) {
        window.setTimeout(finishBoot, 260);
        return;
      }
      var text = lines[i];
      var dots = '';
      var dotCount = 0;
      function typeDots() {
        if (bootDone) return;
        if (dotCount < 10) {
          dots += '.';
          dotCount++;
          log.innerHTML = out + '<span>' + esc(text + dots) + '</span>';
          window.setTimeout(typeDots, 26);
        } else {
          out += esc(text + dots) + ' <span class="ok">[ OK ]</span>\n';
          log.innerHTML = out;
          i++;
          window.setTimeout(nextLine, 90);
        }
      }
      typeDots();
    }
    nextLine();

    function skip() {
      if (bootDone) return;
      log.innerHTML =
        lines.map(function (l) {
          return esc(l + '..........') + ' <span class="ok">[ OK ]</span>\n';
        }).join('') + '<span class="dim">> welcome.</span>';
      finishBoot();
    }
    bootSkip = skip;
    window.addEventListener('keydown', skip);
    window.addEventListener('pointerdown', skip);
    window.setTimeout(finishBoot, 3400);
  }

  /* ─────────────────────────────────────────────────────────────────────
     4. hero typing
     ───────────────────────────────────────────────────────────────────── */
  var typingStarted = false;

  function startTyping() {
    if (typingStarted) return;
    typingStarted = true;
    var el = $('#typed');
    if (!el) return;

    var pi = 0;
    var ci = 0;
    var deleting = false;
    var timer = 0;
    var paused = false;

    function phrases() {
      var p = (CFG.hero && CFG.hero.phrases) || {};
      var list = p[lang()] || p.zh || [];
      return list.filter(Boolean);
    }

    function showStatic() {
      el.textContent = phrases()[0] || '';
    }

    function tick() {
      if (paused) return;
      var list = phrases();
      if (!list.length) return;
      pi = pi % list.length;
      var phrase = list[pi];

      if (!deleting) {
        ci++;
        if (ci >= phrase.length) {
          ci = phrase.length;
          deleting = true;
          el.textContent = phrase;
          timer = window.setTimeout(tick, 2100);
          return;
        }
      } else {
        ci--;
        if (ci <= 0) {
          ci = 0;
          deleting = false;
          pi = (pi + 1) % list.length;
          el.textContent = '';
          timer = window.setTimeout(tick, 320);
          return;
        }
      }
      el.textContent = phrase.slice(0, ci);
      timer = window.setTimeout(tick, deleting ? 26 : 44);
    }

    typingReset = function () {
      window.clearTimeout(timer);
      pi = 0;
      ci = 0;
      deleting = false;
      el.textContent = '';
      if (reduceMotion) {
        showStatic();
        return;
      }
      timer = window.setTimeout(tick, 160);
    };

    if (reduceMotion) {
      showStatic();
      return;
    }

    timer = window.setTimeout(tick, 900);

    doc.addEventListener('visibilitychange', function () {
      paused = doc.hidden;
      window.clearTimeout(timer);
      if (!paused) timer = window.setTimeout(tick, 600);
    });
  }

  /* ─────────────────────────────────────────────────────────────────────
     5. the hole — built from the Zarathustra text, always collapsing inward
     ───────────────────────────────────────────────────────────────────── */
  var HOLE_TEXT = (window.HOLE_TEXT && window.HOLE_TEXT.body) ||
    'MAN IS A ROPE STRETCHED BETWEEN THE ANIMAL AND THE SUPERMAN.';
  var GLYPHS = [];
  var GIDX = {};
  (function () {
    for (var i = 0; i < HOLE_TEXT.length; i++) {
      var c = HOLE_TEXT.charAt(i);
      if (c === ' ' || GIDX[c] != null) continue;
      GIDX[c] = GLYPHS.length;
      GLYPHS.push(c);
    }
  })();

  var heroHole = null;

  function heroPlace(w, h) {
    if (w <= 780) return { cx: w / 2, cy: h * 0.42, R: Math.min(w * 0.3, h * 0.15) };
    if (w < 1100) return { cx: w / 2, cy: h * 0.56, R: Math.min(w * 0.155, h * 0.2) };
    return { cx: w / 2, cy: h * 0.57, R: Math.min(w * 0.155, h * 0.235) };
  }

  function createHole(canvas, opts) {
    if (!canvas) return null;
    var ctx = canvas.getContext('2d');
    if (!ctx) return null;

    var o = opts || {};
    var count = o.count || 1600;
    var starsN = o.stars || 0;
    var place = o.place || function (w, h) {
      return { cx: w / 2, cy: h / 2, R: Math.min(w, h) * 0.2 };
    };
    var dimBase = o.dim || 1;
    var fall = o.fall == null ? 1 : o.fall;
    var FONT = '"JetBrains Mono", ui-monospace, Menlo, Consolas, monospace';
    var SIZES = [9, 12, 15];
    var FLAT = 0.34;

    var w = 1;
    var h = 1;
    var dpr = 1;
    var cell = 0;
    var atlas = null;
    var tints = ['#333333', '#666666', '#999999', '#cccccc', '#ffffff'];
    var parts = [];
    var stars = [];
    var bursts = [];
    var time = 0;
    var raf = 0;
    var running = false;
    var last = 0;
    var intro = 1;
    var grow = 1;
    var cursor = 0;
    var pointer = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
    var tiltX = 0;
    var tiltY = 0;

    function hexA(hex, a) {
      var s = String(hex).replace('#', '').trim();
      if (s.length === 3) s = s[0] + s[0] + s[1] + s[1] + s[2] + s[2];
      var n = parseInt(s, 16);
      if (isNaN(n)) return 'rgba(200,200,200,' + a + ')';
      return 'rgba(' + ((n >> 16) & 255) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')';
    }

    function readTints() {
      var cs = getComputedStyle(root);
      tints = [1, 2, 3, 4, 5].map(function (k) {
        return (cs.getPropertyValue('--t' + k) || '#888888').trim();
      });
    }

    function buildAtlas() {
      readTints();
      cell = Math.ceil(17 * dpr);
      var cols = GLYPHS.length;
      var rows = SIZES.length * tints.length;
      atlas = doc.createElement('canvas');
      atlas.width = cell * cols;
      atlas.height = cell * rows;
      var a = atlas.getContext('2d');
      a.textAlign = 'center';
      a.textBaseline = 'middle';
      for (var ti = 0; ti < tints.length; ti++) {
        for (var si = 0; si < SIZES.length; si++) {
          a.font = '500 ' + SIZES[si] * dpr + 'px ' + FONT;
          a.fillStyle = tints[ti];
          for (var gi = 0; gi < cols; gi++) {
            a.fillText(GLYPHS[gi], gi * cell + cell / 2, (ti * SIZES.length + si) * cell + cell / 2);
          }
        }
      }
    }

    // each particle carries one character of the book; the cursor walks forward,
    // so the field is always spelling a window of the text
    function takeChar() {
      var c = HOLE_TEXT.charAt(cursor % HOLE_TEXT.length);
      cursor++;
      return c;
    }

    function assign(p) {
      p.ch = takeChar();
      p.gi = GIDX[p.ch] != null ? GIDX[p.ch] : -1;
    }

    function makeParts(n) {
      parts = [];
      for (var i = 0; i < n; i++) {
        var p = {
          r: 1.02 + Math.pow(Math.random(), 1.75),
          a: Math.random() * TAU,
          thick: 0,
          phase: Math.random() * TAU,
          spread: 0.8 + Math.random() * 1.8,
        };
        p.thick = (Math.random() - 0.5) * (0.06 + 0.16 * Math.min(1, p.r - 1));
        assign(p);
        parts.push(p);
      }
    }

    function makeStars(n) {
      stars = [];
      for (var i = 0; i < n; i++) {
        stars.push({
          x: Math.random(),
          y: Math.random(),
          z: rand(0.25, 1),
          gi: (Math.random() * GLYPHS.length) | 0,
          alpha: rand(0.05, 0.3),
          phase: Math.random() * TAU,
        });
      }
    }

    function resize() {
      var rect = canvas.getBoundingClientRect();
      w = Math.max(1, Math.round(rect.width));
      h = Math.max(1, Math.round(rect.height));
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildAtlas();
      if (!parts.length) makeParts(count);
      if (starsN && !stars.length) makeStars(starsN);
      var badge = $('#sb-glyphs');
      if (badge && o.badge !== false) {
        badge.textContent = 'GLYPHS ' + (parts.length + stars.length).toLocaleString('en-US');
      }
      if (!running) draw();
    }

    function sprite(gi, ti) {
      return { sx: gi * cell, sy: ti * SIZES.length * cell + cell, size: cell / dpr };
    }

    function plot(gi, ti, x, y, alpha, scale) {
      if (gi < 0 || alpha <= 0.004) return;
      var sp = sprite(gi, ti);
      var size = sp.size * scale;
      ctx.globalAlpha = alpha;
      ctx.drawImage(atlas, sp.sx, sp.sy, cell, cell, x - size / 2, y - size / 2, size, size);
    }

    // glyphs that follow the circle, so the ring reads like an inscription
    function plotRot(gi, ti, x, y, alpha, scale, rot) {
      if (gi < 0 || alpha <= 0.004) return;
      var sp = sprite(gi, ti);
      var size = sp.size * scale;
      ctx.globalAlpha = alpha;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.drawImage(atlas, sp.sx, sp.sy, cell, cell, -size / 2, -size / 2, size, size);
      ctx.restore();
    }

    function draw() {
      if (!atlas) return;
      ctx.clearRect(0, 0, w, h);

      var g = place(w, h);
      var R = g.R * grow;
      var cx = g.cx;
      var cy = g.cy;

      var glow = ctx.createRadialGradient(cx, cy, R * 0.2, cx, cy, R * 2.5);
      glow.addColorStop(0, hexA(tints[3], 0.1 * grow));
      glow.addColorStop(0.4, hexA(tints[3], 0.045 * grow));
      glow.addColorStop(1, hexA(tints[3], 0));
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w, h);

      var i, p;

      for (i = 0; i < stars.length; i++) {
        var st = stars[i];
        var sx = st.x * w + (pointer.x - 0.5) * 26 * st.z;
        var sy = st.y * h + (pointer.y - 0.5) * 20 * st.z;
        var tw = 0.55 + 0.45 * Math.sin(time * 1.1 + st.phase);
        plot(st.gi, st.z > 0.75 ? 2 : st.z > 0.45 ? 1 : 0, sx, sy, st.alpha * tw * 0.8 * dimBase, 0.85);
      }

      var ie = intro < 1 ? 1 - Math.pow(1 - intro, 2.2) : 1;

      // positions, computed once and shared by the three passes
      for (i = 0; i < parts.length; i++) {
        p = parts[i];
        p.rr = p.r + (1 - ie) * p.spread;
        p.ca = Math.cos(p.a);
        p.sa = Math.sin(p.a);
        // cheap perspective: the near half of the disk is a touch larger
        p.persp = 1 + 0.16 * p.sa + tiltY * 0.05;
      }

      /* lensed halo: the far side of the disk bent over the top */
      for (i = 0; i < parts.length; i++) {
        p = parts[i];
        if (p.sa >= 0) continue;
        var hb = clamp((2.05 - p.rr) / 1.05, 0, 1);
        var hAlpha = (0.1 + 0.75 * Math.pow(hb, 1.5)) * 0.62 * ie * grow;
        if (hAlpha < 0.03) continue;
        plot(p.gi, hAlpha > 0.55 ? 3 : hAlpha > 0.32 ? 2 : 1,
          cx + p.ca * p.rr * R * 0.99,
          cy - Math.abs(p.sa) * p.rr * R * 0.76 + p.thick * R * 0.6,
          hAlpha * dimBase, 0.9);
      }

      /* disk, back half */
      for (i = 0; i < parts.length; i++) {
        p = parts[i];
        if (p.sa >= 0) continue;
        var db = clamp((2.05 - p.rr) / 1.05, 0, 1);
        var dA = (0.2 + 0.9 * Math.pow(db, 1.4)) * (0.78 + 0.22 * (0.5 - 0.5 * p.ca));
        dA *= 0.84 + 0.16 * Math.sin(time * 2.4 + p.phase + p.rr * 6);
        dA *= ie * grow * dimBase;
        if (dA < 0.04) continue;
        var dti = dA < 0.25 ? 0 : dA < 0.5 ? 1 : dA < 0.75 ? 2 : dA < 0.92 ? 3 : 4;
        plot(p.gi, dti, cx + p.ca * p.rr * R * p.persp, cy + p.sa * p.rr * R * FLAT * p.persp + p.thick * R,
          Math.min(1, dA), 0.82 + dA * 0.6);
      }

      /* event horizon */
      ctx.save();
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'destination-out';
      var hole = ctx.createRadialGradient(cx, cy, R * 0.82, cx, cy, R);
      hole.addColorStop(0, 'rgba(0,0,0,1)');
      hole.addColorStop(0.78, 'rgba(0,0,0,0.98)');
      hole.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = hole;
      ctx.beginPath();
      ctx.arc(cx, cy, R * 1.01, 0, TAU);
      ctx.fill();
      ctx.restore();
      ctx.globalAlpha = 1;

      /* bloom + photon ring — the ring spells consecutive lines of the text */
      var bloom = ctx.createRadialGradient(cx, cy, R * 0.94, cx, cy, R * 1.5);
      bloom.addColorStop(0, hexA(tints[4], 0.16 * grow));
      bloom.addColorStop(0.4, hexA(tints[4], 0.055 * grow));
      bloom.addColorStop(1, hexA(tints[4], 0));
      ctx.fillStyle = bloom;
      ctx.beginPath();
      ctx.arc(cx, cy, R * 1.5, 0, TAU);
      ctx.fill();

      var ringCount = w <= 780 ? 70 : 104;
      var ringBase = Math.floor(time * 1.6) % HOLE_TEXT.length;
      for (i = 0; i < ringCount; i++) {
        var ra = (i / ringCount) * TAU + time * 0.05;
        // the bottom half mirrors the top half, so it reads left-to-right too
        var flip = Math.sin(ra) > 0 ? ringCount - i : i;
        var ch = HOLE_TEXT.charAt((ringBase + flip) % HOLE_TEXT.length);
        var gi = GIDX[ch];
        if (gi == null) continue;
        var wob = 0.8 + 0.2 * Math.sin(ra * 3 + time * 1.2);
        var rr = R * (1.0 + 0.014 * Math.sin(ra * 5 + time));
        plot(gi, wob > 0.88 ? 4 : 3,
          cx + Math.cos(ra) * rr,
          cy + Math.sin(ra) * rr,
          (0.35 + 0.65 * wob) * ie * grow * dimBase,
          0.8 + wob * 0.35);
      }

      /* disk, front half */
      for (i = 0; i < parts.length; i++) {
        p = parts[i];
        if (p.sa < 0) continue;
        var fb = clamp((2.05 - p.rr) / 1.05, 0, 1);
        var fA = (0.22 + 0.92 * Math.pow(fb, 1.4)) * (0.8 + 0.2 * (0.5 - 0.5 * p.ca));
        fA *= 0.84 + 0.16 * Math.sin(time * 2.4 + p.phase + p.rr * 6);
        fA *= ie * grow * dimBase;
        if (fA < 0.04) continue;
        var fti = fA < 0.25 ? 0 : fA < 0.5 ? 1 : fA < 0.75 ? 2 : fA < 0.92 ? 3 : 4;
        plot(p.gi, fti, cx + p.ca * p.rr * R * p.persp, cy + p.sa * p.rr * R * FLAT * p.persp + p.thick * R,
          Math.min(1, fA), 0.84 + fA * 0.65);
      }

      for (var bi = bursts.length - 1; bi >= 0; bi--) {
        var burst = bursts[bi];
        var alive = false;
        for (var k = 0; k < burst.parts.length; k++) {
          var q = burst.parts[k];
          q.x += q.vx;
          q.y += q.vy;
          q.vx *= 0.955;
          q.vy = q.vy * 0.955 + 0.03;
          q.life -= 0.016;
          if (q.life <= 0) continue;
          alive = true;
          plot(q.gi, q.tint, q.x, q.y, q.life * 0.9 * dimBase, 0.7 + q.life * 0.7);
        }
        if (!alive) bursts.splice(bi, 1);
      }

      ctx.globalAlpha = 1;
    }

    function step(dt) {
      var s = dt / 1000;
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i];
        p.a += (0.34 / (p.r * p.r) + 0.015) * s;
        // everything falls inward; the closer it gets, the slower it creeps
        p.r -= (0.012 + 0.05 * Math.max(0, p.r - 1)) * s * fall;
        if (p.r < 1.015) {
          p.r = 2.02 + Math.random() * 0.07;
          p.a = Math.random() * TAU;
          p.thick = (Math.random() - 0.5) * (0.06 + 0.16 * Math.min(1, p.r - 1));
          assign(p);
        }
      }
      if (intro < 1) intro = Math.min(1, intro + s / 1.4);
      if (grow < 1) grow = Math.min(1, grow + s * 0.75);
    }

    function loop(now) {
      if (!running) return;
      var dt = Math.min(64, now - last);
      last = now;
      time += dt / 1000;
      pointer.x += (pointer.tx - pointer.x) * 0.05;
      pointer.y += (pointer.ty - pointer.y) * 0.05;
      tiltX = pointer.x - 0.5;
      tiltY = pointer.y - 0.5;
      step(dt);
      draw();
      raf = requestAnimationFrame(loop);
    }

    return {
      resize: resize,
      drawOnce: draw,
      start: function (replay) {
        if (replay) intro = 0;
        if (running) return;
        if (reduceMotion) {
          intro = 1;
          draw();
          return;
        }
        running = true;
        last = performance.now();
        raf = requestAnimationFrame(loop);
      },
      stop: function () {
        running = false;
        cancelAnimationFrame(raf);
      },
      replay: function () {
        intro = 0;
        if (!running) {
          intro = 1;
          draw();
        }
      },
      growIn: function () {
        grow = 0.18;
        intro = 0;
        if (reduceMotion) {
          grow = 1;
          intro = 1;
          draw();
        }
      },
      setPointer: function (x, y) {
        pointer.tx = clamp(x, 0, 1);
        pointer.ty = clamp(y, 0, 1);
      },
      burst: function (x, y) {
        var list = [];
        for (var i = 0; i < 40; i++) {
          var ang = Math.random() * TAU;
          var sp = rand(1.2, 4.6);
          var ch = takeChar();
          list.push({
            x: x, y: y,
            vx: Math.cos(ang) * sp,
            vy: Math.sin(ang) * sp - 0.5,
            life: rand(0.5, 1),
            gi: GIDX[ch] != null ? GIDX[ch] : -1,
            tint: Math.random() < 0.6 ? 3 : 2,
          });
        }
        bursts.push({ parts: list });
        if (bursts.length > 4) bursts.shift();
        if (!running) draw();
      },
      themeChanged: function () {
        buildAtlas();
        if (!running) draw();
      },
      fontsReady: function () {
        buildAtlas();
        if (!running) draw();
      },
      isRunning: function () { return running; },
    };
  }

  function initField() {
    var canvas = $('#field');
    if (!canvas) return;
    var phone = window.innerWidth <= 780;
    heroHole = createHole(canvas, {
      count: phone ? 820 : window.innerWidth < 1100 ? 1700 : 2600,
      stars: phone ? 60 : 130,
      place: heroPlace,
    });
    if (!heroHole) return;

    heroHole.resize();
    heroHole.drawOnce();

    window.addEventListener('pointermove', function (e) {
      heroHole.setPointer(e.clientX / window.innerWidth, e.clientY / window.innerHeight);
    }, { passive: true });

    var hero = $('#top');
    if (hero) {
      hero.addEventListener('pointerdown', function (e) {
        if (e.button !== 0 || (e.target.closest && e.target.closest('a, button'))) return;
        var rect = canvas.getBoundingClientRect();
        heroHole.burst(e.clientX - rect.left, e.clientY - rect.top);
      });
    }

    if (hero && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) heroHole.start();
          else heroHole.stop();
        });
      }, { threshold: 0.02 }).observe(hero);
    } else {
      heroHole.start();
    }

    doc.addEventListener('visibilitychange', function () {
      if (doc.hidden) heroHole.stop();
      else if (!reduceMotion) heroHole.start();
    });

    window.addEventListener('themechange', function () { heroHole.themeChanged(); });

    var resizeTimer;
    window.addEventListener('resize', function () {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(function () {
        heroHole.resize();
        layoutOrbit();
        paintOrbit(performance.now());
      }, 150);
    });

    if (doc.fonts && doc.fonts.ready) {
      doc.fonts.ready.then(function () { heroHole.fontsReady(); });
    }
  }


  /* ─────────────────────────────────────────────────────────────────────
     7. scroll progress + nav state + topbar
     ───────────────────────────────────────────────────────────────────── */
  function initScroll() {
    var bar = $('#progress-bar');
    var pct = $('#sb-scroll');
    var topbar = $('#topbar');
    var queued = false;

    function update() {
      queued = false;
      var max = doc.documentElement.scrollHeight - window.innerHeight;
      var p = max > 0 ? clamp(window.scrollY / max, 0, 1) : 0;
      if (bar) bar.style.width = (p * 100).toFixed(2) + '%';
      if (pct) pct.textContent = Math.round(p * 100) + '%';
      if (topbar) topbar.classList.toggle('scrolled', window.scrollY > 24);
    }

    window.addEventListener('scroll', function () {
      if (queued) return;
      queued = true;
      requestAnimationFrame(update);
    }, { passive: true });

    window.addEventListener('resize', update);
    update();

    var links = $$('[data-nav]');
    if ('IntersectionObserver' in window) {
      var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          links.forEach(function (a) {
            a.classList.toggle('active', a.getAttribute('data-nav') === entry.target.id);
          });
        });
      }, { rootMargin: '-45% 0px -50% 0px' });
      ['about', 'stack', 'contact'].forEach(function (id) {
        var el = doc.getElementById(id);
        if (el) obs.observe(el);
      });
    }
  }

  /* ─────────────────────────────────────────────────────────────────────
     8. reveal on scroll
     ───────────────────────────────────────────────────────────────────── */
  function initReveal() {
    var items = $$('.reveal');
    if (!items.length) return;
    if (reduceMotion || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('in-view'); });
      return;
    }
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          obs.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach(function (el, i) {
      el.style.transitionDelay = (i % 4) * 45 + 'ms';
      obs.observe(el);
    });
  }

  /* ─────────────────────────────────────────────────────────────────────
     9. reticle
     ───────────────────────────────────────────────────────────────────── */
  function initReticle() {
    var dot = $('#reticle');
    var label = $('#reticle-label');
    if (!dot || !window.matchMedia('(pointer: fine)').matches || reduceMotion) return;

    root.classList.add('has-reticle');
    var x = window.innerWidth / 2;
    var y = window.innerHeight / 2;
    var tx = x, ty = y;
    var raf2 = 0;

    function render() {
      x += (tx - x) * 0.35;
      y += (ty - y) * 0.35;
      dot.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0)';
      if (label) {
        label.textContent =
          String(Math.round(x)).padStart(3, '0') + ',' + String(Math.round(y)).padStart(3, '0');
      }
      if (Math.abs(tx - x) > 0.2 || Math.abs(ty - y) > 0.2) raf2 = requestAnimationFrame(render);
      else raf2 = 0;
    }

    window.addEventListener('pointermove', function (e) {
      tx = e.clientX;
      ty = e.clientY;
      dot.classList.add('on');
      if (!raf2) raf2 = requestAnimationFrame(render);
    }, { passive: true });

    doc.addEventListener('pointerover', function (e) {
      var t = e.target;
      var hot = t.closest && t.closest('a, button, .node');
      dot.classList.toggle('hot', !!hot);
    });

    window.addEventListener('pointerleave', function () { dot.classList.remove('on'); });
    window.addEventListener('blur', function () { dot.classList.remove('on'); });
  }

  /* ─────────────────────────────────────────────────────────────────────
     10. theme
     ───────────────────────────────────────────────────────────────────── */
  function currentTheme() {
    return root.getAttribute('data-theme') === 'paper' ? 'void' : 'paper';
  }

  function toggleTheme(force) {
    var next = force || currentTheme();
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
    var meta = $('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', next === 'paper' ? '#f2f2f0' : '#0a0a0a');
    window.dispatchEvent(new Event('themechange'));
    return next;
  }

  function initTheme() {
    var stored = null;
    try { stored = localStorage.getItem('theme'); } catch (e) {}
    var initial = stored || (window.matchMedia('(prefers-color-scheme: light)').matches ? 'paper' : 'void');
    root.setAttribute('data-theme', initial);
    var meta = $('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', initial === 'paper' ? '#f2f2f0' : '#0a0a0a');

    var btn = $('#theme-toggle');
    if (btn) btn.addEventListener('click', function () { toggleTheme(); });
  }

  /* ─────────────────────────────────────────────────────────────────────
     11. copy / toast / clock
     ───────────────────────────────────────────────────────────────────── */
  var toastTimer;
  function toast(msg) {
    var el = $('#toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('show');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () { el.classList.remove('show'); }, 2200);
  }

  function copyEmail() {
    var email = ID.email || '';
    if (!email) return;
    var done = function () { toast(pick({ zh: '已复制', en: 'COPIED' }) + ' · ' + email); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(email).then(done, fallback);
    } else {
      fallback();
    }
    function fallback() {
      try {
        var ta = doc.createElement('textarea');
        ta.value = email;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        doc.body.appendChild(ta);
        ta.select();
        doc.execCommand('copy');
        doc.body.removeChild(ta);
        done();
      } catch (e) {
        toast(email);
      }
    }
  }

  function initClock() {
    var clock = $('#clock');
    var year = $('#year');
    if (year) year.textContent = new Date().getFullYear();
    var coords = $('#sb-coords');
    if (coords && ID.coordinates) coords.textContent = ID.coordinates;
    if (!clock) return;
    function tick() {
      var d = new Date();
      var p = function (n) { return String(n).padStart(2, '0'); };
      clock.textContent = p(d.getHours()) + ':' + p(d.getMinutes()) + ':' + p(d.getSeconds());
    }
    tick();
    window.setInterval(tick, 1000);
  }

  /* ─────────────────────────────────────────────────────────────────────
     12. command palette
     ───────────────────────────────────────────────────────────────────── */
  function initPalette() {
    var dlg = $('#palette');
    var input = $('#palette-input');
    var list = $('#palette-list');
    if (!dlg || !input || !list || typeof dlg.showModal !== 'function') return;

    function go(hash) {
      var el = doc.querySelector(hash);
      if (el) {
        el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
        if (history.replaceState) history.replaceState(null, '', hash);
      }
    }

    var commands = [
      { label: { zh: '跳到 关于', en: 'Go to About' }, hint: '01', run: function () { go('#about'); } },
      { label: { zh: '跳到 技术栈', en: 'Go to Stack' }, hint: '02', run: function () { go('#stack'); } },
      { label: { zh: '跳到 联系', en: 'Go to Contact' }, hint: '03', run: function () { go('#contact'); } },
      { label: { zh: '复制主邮箱', en: 'Copy email' }, hint: 'clip', run: copyEmail },
      { label: { zh: '切换主题', en: 'Toggle theme' }, hint: 'T', run: function () { toggleTheme(); } },
      { label: { zh: '切换语言', en: 'Switch language' }, hint: 'L', run: toggleLang },
    ];

    WORK.forEach(function (w, i) {
      commands.push({
        label: {
          zh: '打开项目 ' + pad(i + 1) + ' · ' + pick(w.short || w.title),
          en: 'Open project ' + pad(i + 1) + ' · ' + (w.short ? w.short.en : pick(w.title)),
        },
        hint: 'open',
        run: function () { projectView.open(i); },
      });
    });

    commands.push({
      label: { zh: '打开 GitHub', en: 'Open GitHub' }, hint: 'ext',
      run: function () { window.open('https://github.com/AAA-996', '_blank', 'noopener'); },
    });

    var filtered = commands.slice();
    var active = 0;

    function render() {
      if (!filtered.length) {
        list.innerHTML = '<li class="palette-empty">' + esc(pick({ zh: '没有匹配的命令', en: 'no matching command' })) + '</li>';
        return;
      }
      list.innerHTML = filtered
        .map(function (cmd, i) {
          return (
            '<li class="palette-item" role="option" aria-selected="' + (i === active) + '" data-i="' + i + '">' +
            '<span class="idx">' + pad(i + 1) + '</span>' +
            '<span class="cmd">' + esc(pick(cmd.label)) + '</span>' +
            '<span class="hint">' + esc(cmd.hint) + '</span>' +
            '</li>'
          );
        })
        .join('');
      var sel = list.querySelector('[aria-selected="true"]');
      if (sel && sel.scrollIntoView) sel.scrollIntoView({ block: 'nearest' });
    }

    function filter() {
      var q = input.value.trim().toLowerCase();
      filtered = commands.filter(function (c) {
        var text = ((c.label.zh || '') + ' ' + (c.label.en || '')).toLowerCase();
        return text.indexOf(q) > -1 || c.hint.toLowerCase().indexOf(q) > -1;
      });
      active = 0;
      render();
    }

    function open() {
      if (dlg.open) return;
      dlg.showModal();
      syncModal();
      input.value = '';
      filter();
      window.setTimeout(function () { input.focus(); }, 20);
    }

    function close() {
      if (dlg.open) dlg.close();
      syncModal();
    }

    dlg.addEventListener('close', syncModal);

    function run(i) {
      var cmd = filtered[i];
      if (!cmd) return;
      close();
      window.setTimeout(cmd.run, 80);
    }

    input.addEventListener('input', filter);
    input.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        active = Math.min(active + 1, filtered.length - 1);
        render();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        active = Math.max(active - 1, 0);
        render();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        run(active);
      }
    });

    list.addEventListener('click', function (e) {
      var item = e.target.closest('.palette-item');
      if (item) run(Number(item.getAttribute('data-i')));
    });

    dlg.addEventListener('click', function (e) {
      if (e.target === dlg) close();
    });

    $$('[data-palette-open]').forEach(function (btn) {
      btn.addEventListener('click', open);
    });

    doc.addEventListener('keydown', function (e) {
      var mod = e.metaKey || e.ctrlKey;
      var tag = doc.activeElement.tagName;
      var typing = /^(INPUT|TEXTAREA|SELECT)$/.test(tag);
      var key = e.key.toLowerCase();
      if (mod && key === 'k') {
        e.preventDefault();
        if (dlg.open) close();
        else open();
      } else if (e.key === '/' && !typing && !dlg.open) {
        e.preventDefault();
        open();
      } else if (key === 't' && !typing && !dlg.open && !mod) {
        toggleTheme();
      } else if (key === 'l' && !typing && !dlg.open && !mod) {
        toggleLang();
      }
    });
  }

  /* ─────────────────────────────────────────────────────────────────────
     wiring
     ───────────────────────────────────────────────────────────────────── */
  function initLangSwitch() {
    var btn = $('#lang-switch');
    if (btn) btn.addEventListener('click', toggleLang);
  }

  function init() {
    bindText();
    updateMeta();
    renderTicker();
    renderStack();
    renderSocials();
    renderOrbit();
    projectView.init();
    pvField.init();
    initTheme();
    initLangSwitch();
    initClock();
    initField();
    layoutOrbit();
    paintOrbit(performance.now());
    initScroll();
    initReveal();
    initReticle();
    initPalette();
    runBoot();
    window.setTimeout(finishBoot, 3600);
  }

  function revealAll() {
    root.classList.add('ready');
    $$('.reveal').forEach(function (el) { el.classList.add('in-view'); });
  }

  function boot() {
    try {
      init();
    } catch (err) {
      console.error('[site] init failed:', err);
      revealAll();
      finishBoot();
    }
  }

  if (doc.readyState === 'loading') {
    doc.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
