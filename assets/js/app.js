/* ═══════════════════════════════════════════════════════════════════════════
   app.js — behaviour, no dependencies, no build step.
     1  language (zh / en)    7  scroll progress + nav
     2  content rendering     8  reveal on scroll
     3  hero typing           9  custom reticle
     4  ASCII field canvas   10  theme
     5  boot sequence        11  copy / toast / clock
     6  command palette
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var doc = document;
  var root = doc.documentElement;
  var CFG = window.CONFIG || {};
  var ID = CFG.identity || {};
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var skipBoot = reduceMotion || /[?&]noboot\b/.test(location.search);

  var $ = function (sel, scope) { return (scope || doc).querySelector(sel); };
  var $$ = function (sel, scope) {
    return Array.prototype.slice.call((scope || doc).querySelectorAll(sel));
  };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var rand = function (a, b) { return a + Math.random() * (b - a); };
  var pad = function (n) { return String(n).padStart(2, '0'); };

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

  // pick a string in the current language: 'text' | {zh, en}
  function pick(v) {
    if (v == null) return '';
    if (typeof v === 'string') return v;
    return v[lang()] || v.zh || v.en || '';
  }

  // render both languages at once, CSS hides the inactive one
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

  function setLang(next, silent) {
    next = next === 'en' ? 'en' : 'zh';
    var changed = lang() !== next;
    root.setAttribute('data-lang', next);
    root.setAttribute('lang', next === 'en' ? 'en' : 'zh-CN');
    try { localStorage.setItem('lang', next); } catch (e) {}
    updateMeta();
    if (changed && typingReset) typingReset();
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

  function renderWork() {
    var list = $('#work-list');
    if (!list || !CFG.work) return;

    var counter = $('[data-work-count]');
    if (counter) {
      counter.innerHTML =
        pad(CFG.work.length) +
        '&nbsp;<span lang="zh">个项目</span><span lang="en">entries</span>';
    }

    list.innerHTML = CFG.work
      .map(function (w, i) {
        var meta = [];
        if (w.year) meta.push('<span>' + esc(w.year) + '</span>');
        if (w.kind) meta.push('<span class="kind">' + L(w.kind) + '</span>');

        var links = w.links || (w.link ? [w.link] : []);
        var side = '';

        if (links.length) {
          side += links
            .map(function (l, idx) {
              return (
                '<a class="work-link' + (idx === 0 ? ' is-main' : '') + '" href="' +
                esc(l.href) + '" target="_blank" rel="noreferrer noopener">' +
                L(l.label) + ' <span aria-hidden="true">↗</span></a>'
              );
            })
            .join('');
          if (w.private) {
            side +=
              '<span class="work-private"><span lang="zh">私有仓库</span>' +
              '<span lang="en">PRIVATE</span></span>';
          }
        } else if (w.status) {
          side = '<span class="work-status">' + L(w.status) + '</span>';
        }

        var tags = (w.tags || []).length
          ? '<ul class="tags">' +
            w.tags.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') +
            '</ul>'
          : '';

        var single = links.length === 1;

        return (
          '<article class="work-row reveal' + (single ? ' has-link' : '') + '">' +
          '<div class="work-idx">' + pad(i + 1) + '</div>' +
          '<div class="work-main">' +
          '<p class="work-meta">' + meta.join('') + '</p>' +
          '<h3 class="work-title">' + L(w.title) + '</h3>' +
          (w.blurb ? '<p class="work-blurb">' + L(w.blurb) + '</p>' : '') +
          tags +
          '</div>' +
          '<div class="work-side">' + side + '</div>' +
          '</article>'
        );
      })
      .join('');
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
     5. boot sequence
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
      '> calibrating gravity ',
      '> rendering universe ',
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
    // hard cap so nobody ever stares at a frozen boot screen
    window.setTimeout(finishBoot, 3400);
  }

  /* ─────────────────────────────────────────────────────────────────────
     3. hero typing
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
      var list = phrases();
      el.textContent = list[0] || '';
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
     4. ASCII field: a torus of monospace glyphs
     ───────────────────────────────────────────────────────────────────── */
  function initField() {
    var canvas = $('#field');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    if (!ctx) return;

    var FONT = '"JetBrains Mono", ui-monospace, Menlo, Consolas, monospace';
    var GLYPHS = ['.', ',', ':', '-', '=', '+', '*', '#', '%', '@'];
    var SIZES = [10, 13, 16];
    var dpr = 1;
    var w = 0;
    var h = 0;
    var cell = 0;
    var atlas = null;
    var raf = 0;
    var running = false;
    var last = 0;
    var time = 0;
    var points = [];
    var dust = [];
    var bursts = [];
    var pointer = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5, inside: false };
    var tilt = { x: 0, y: 0 };

    function readTints() {
      var cs = getComputedStyle(root);
      return [1, 2, 3, 4, 5].map(function (i) {
        return cs.getPropertyValue('--t' + i).trim() || '#8a8a7a';
      });
    }

    function buildAtlas() {
      var tints = readTints();
      cell = Math.ceil(18 * dpr);
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

    function makePoints(n) {
      var arr = [];
      for (var i = 0; i < n; i++) {
        arr.push({
          u: Math.random() * Math.PI * 2,
          v: Math.random() * Math.PI * 2,
          accent: Math.random() < 0.055,
          phase: Math.random() * Math.PI * 2,
          speed: rand(0.75, 1.25),
        });
      }
      return arr;
    }

    function makeDust(n) {
      var arr = [];
      for (var i = 0; i < n; i++) {
        arr.push({
          x: Math.random(),
          y: Math.random(),
          z: rand(0.3, 1),
          glyph: Math.floor(Math.random() * GLYPHS.length),
          alpha: rand(0.1, 0.42),
          drift: rand(0.000006, 0.000025),
          phase: Math.random() * Math.PI * 2,
        });
      }
      return arr;
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
      var isMobile = w < 680;
      var n = isMobile ? 720 : w < 1100 ? 860 : 1150;
      points = makePoints(n);
      dust = makeDust(isMobile ? 70 : 150);
      var badge = $('#sb-glyphs');
      if (badge) badge.textContent = 'GLYPHS ' + (n + dust.length).toLocaleString('en-US');
      if (!running) draw(performance.now());
    }

    function sprite(gi, si, ti) {
      return {
        sx: gi * cell,
        sy: (ti * SIZES.length + si) * cell,
        size: cell / dpr,
      };
    }

    function draw(t) {
      ctx.clearRect(0, 0, w, h);
      if (!atlas) return;

      var narrow = w < 1100;
      var cx, cy, span, brightness;
      if (narrow) {
        cx = w * 0.5 + (pointer.x - 0.5) * 14;
        cy = h * 0.96 + (pointer.y - 0.5) * 8;
        span = Math.min(w * 0.44, h * 0.42);
        brightness = 1.15;
      } else {
        var textEdge = Math.min(480, w * 0.42);
        var room = w - textEdge;
        cx = textEdge + room * 0.52 + (pointer.x - 0.5) * 46;
        cy = h * 0.455 + (pointer.y - 0.5) * 30;
        span = room * 0.3;
        brightness = 1;
      }

      var ay = time * 0.22 + tilt.x * 0.55;
      var ax = -0.92 + tilt.y * 0.36;
      var cAy = Math.cos(ay), sAy = Math.sin(ay);
      var cAx = Math.cos(ax), sAx = Math.sin(ax);
      var R = 1.02, r = 0.34, cam = 3.25, focal = 2.15;

      for (var d = 0; d < dust.length; d++) {
        var p = dust[d];
        p.x += p.drift;
        if (p.x > 1.05) p.x = -0.05;
        var dx = p.x * w + Math.sin(time * 0.5 + p.phase) * 6;
        var dy = p.y * h + Math.cos(time * 0.34 + p.phase) * 5;
        var sx0 = dx + (pointer.x - 0.5) * 14 * p.z;
        var sy0 = dy + (pointer.y - 0.5) * 14 * p.z;
        var sp0 = sprite(p.glyph, 0, 1);
        ctx.globalAlpha = p.alpha * (0.6 + 0.4 * Math.sin(time * 0.9 + p.phase));
        ctx.drawImage(atlas, sp0.sx, sp0.sy, cell, cell, sx0, sy0, sp0.size, sp0.size);
      }

      for (var i = 0; i < points.length; i++) {
        var pt = points[i];
        var u = pt.u + time * 0.06 * pt.speed;
        var v = pt.v;
        var cu = Math.cos(u), su = Math.sin(u);
        var cv = Math.cos(v), sv = Math.sin(v);
        var rad = R + r * cv;
        var x0 = rad * cu;
        var y0 = r * sv;
        var z0 = rad * su;

        var x1 = x0 * cAy + z0 * sAy;
        var z1 = -x0 * sAy + z0 * cAy;
        var y1 = y0 * cAx - z1 * sAx;
        var z2 = y0 * sAx + z1 * cAx;

        var persp = focal / (cam + z2);
        var px = cx + x1 * persp * span;
        var py = cy + y1 * persp * span;

        var nx = cv * cu, ny = sv, nz = cv * su;
        var nx1 = nx * cAy + nz * sAy;
        var nz1 = -nx * sAy + nz * cAy;
        var ny1 = ny * cAx - nz1 * sAx;
        var lambert = clamp(0.5 - 0.5 * (nx1 * 0.42 + ny1 * -0.78 + nz1 * -0.46), 0, 1);
        var depth = clamp((1 - z2 / 1.5) * 0.5, 0, 1);
        var b = clamp(0.1 + 0.72 * Math.pow(depth, 1.5) + 0.4 * lambert, 0, 1);

        var gi = Math.round(b * (GLYPHS.length - 1));
        var si = persp > 0.9 ? 2 : persp > 0.72 ? 1 : 0;
        var ti = pt.accent ? 4 : b < 0.32 ? 0 : b < 0.55 ? 1 : b < 0.78 ? 2 : 3;

        var spr = sprite(gi, si, ti);
        var size = spr.size * (0.82 + b * 0.42);
        ctx.globalAlpha = Math.min(1, (0.12 + 0.82 * Math.pow(b, 1.5)) * brightness);
        ctx.drawImage(
          atlas, spr.sx, spr.sy, cell, cell,
          px - size / 2, py - size / 2, size, size
        );
      }

      for (var bi = bursts.length - 1; bi >= 0; bi--) {
        var burst = bursts[bi];
        var alive = false;
        for (var k = 0; k < burst.parts.length; k++) {
          var q = burst.parts[k];
          q.x += q.vx;
          q.y += q.vy;
          q.vx *= 0.955;
          q.vy = q.vy * 0.955 + 0.035;
          q.life -= 0.016;
          if (q.life <= 0) continue;
          alive = true;
          var sp1 = sprite(q.g, q.size, q.tint);
          var sz = sp1.size * (0.7 + q.life * 0.8);
          ctx.globalAlpha = q.life * 0.85;
          ctx.drawImage(atlas, sp1.sx, sp1.sy, cell, cell, q.x - sz / 2, q.y - sz / 2, sz, sz);
        }
        if (!alive) bursts.splice(bi, 1);
      }

      ctx.globalAlpha = 1;
    }

    function loop(now) {
      if (!running) return;
      var dt = Math.min(64, now - last);
      last = now;
      time += dt / 1000;
      pointer.x += (pointer.tx - pointer.x) * 0.06;
      pointer.y += (pointer.ty - pointer.y) * 0.06;
      tilt.x += ((pointer.x - 0.5) - tilt.x) * 0.05;
      tilt.y += ((pointer.y - 0.5) - tilt.y) * 0.05;
      draw(now);
      raf = requestAnimationFrame(loop);
    }

    function start() {
      if (running || reduceMotion) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(loop);
    }

    function stop() {
      running = false;
      cancelAnimationFrame(raf);
    }

    canvas.addEventListener('pointermove', function (e) {
      var rect = canvas.getBoundingClientRect();
      pointer.tx = clamp((e.clientX - rect.left) / rect.width, 0, 1);
      pointer.ty = clamp((e.clientY - rect.top) / rect.height, 0, 1);
      pointer.inside = true;
    });

    canvas.addEventListener('pointerleave', function () {
      pointer.tx = 0.5;
      pointer.ty = 0.5;
      pointer.inside = false;
    });

    canvas.addEventListener('pointerdown', function (e) {
      if (e.button !== 0) return;
      var rect = canvas.getBoundingClientRect();
      var x = e.clientX - rect.left;
      var y = e.clientY - rect.top;
      var parts = [];
      for (var i = 0; i < 44; i++) {
        var a = Math.random() * Math.PI * 2;
        var sp = rand(1.4, 5.2);
        parts.push({
          x: x, y: y,
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp - 0.6,
          life: rand(0.55, 1),
          g: Math.floor(Math.random() * GLYPHS.length),
          size: Math.random() < 0.4 ? 2 : 1,
          tint: Math.random() < 0.6 ? 4 : 3,
        });
      }
      bursts.push({ parts: parts });
      if (bursts.length > 4) bursts.shift();
      if (!running) draw(performance.now());
    });

    var resizeTimer;
    window.addEventListener('resize', function () {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(resize, 160);
    });

    var hero = $('#top');
    if (hero && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) start();
          else stop();
        });
      }, { threshold: 0.02 }).observe(hero);
    } else {
      start();
    }

    doc.addEventListener('visibilitychange', function () {
      if (doc.hidden) stop();
      else if (!reduceMotion) start();
    });

    // the glyph atlas bakes in the theme tints — rebuild it when the theme flips
    window.addEventListener('themechange', function () {
      buildAtlas();
      if (!running) draw(performance.now());
    });

    resize();

    if (doc.fonts && doc.fonts.ready) {
      doc.fonts.ready.then(function () {
        buildAtlas();
        if (!running) draw(performance.now());
      });
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
      ['about', 'work', 'stack', 'contact'].forEach(function (id) {
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
      var hot = t.closest && t.closest('a, button, .work-row.has-link, .mailto, .socials a');
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
    if (meta) meta.setAttribute('content', next === 'paper' ? '#f2efe5' : '#0a0b08');
    window.dispatchEvent(new Event('themechange'));
    return next;
  }

  function initTheme() {
    var stored = null;
    try { stored = localStorage.getItem('theme'); } catch (e) {}
    var initial = stored || (window.matchMedia('(prefers-color-scheme: light)').matches ? 'paper' : 'void');
    root.setAttribute('data-theme', initial);
    var meta = $('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', initial === 'paper' ? '#f2efe5' : '#0a0b08');

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
     6. command palette
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
      { label: { zh: '跳到 项目', en: 'Go to Work' }, hint: '02', run: function () { go('#work'); } },
      { label: { zh: '跳到 技术栈', en: 'Go to Stack' }, hint: '03', run: function () { go('#stack'); } },
      { label: { zh: '跳到 联系', en: 'Go to Contact' }, hint: '04', run: function () { go('#contact'); } },
      { label: { zh: '复制主邮箱', en: 'Copy email' }, hint: 'clip', run: copyEmail },
      { label: { zh: '切换主题', en: 'Toggle theme' }, hint: 'T', run: function () { toggleTheme(); } },
      { label: { zh: '切换语言', en: 'Switch language' }, hint: 'L', run: toggleLang },
      {
        label: { zh: '打开 GitHub', en: 'Open GitHub' }, hint: 'ext',
        run: function () {
          var s = (CFG.socials || []).filter(function (x) {
            return /github/i.test(x.label && (x.label.en || x.label.zh || ''));
          })[0];
          window.open(s ? s.href : 'https://github.com/AAA-996', '_blank', 'noopener');
        },
      },
      { label: { zh: '回到顶部', en: 'Back to top' }, hint: 'top', run: function () { go('#top'); } },
    ];

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
        var text = (c.label.zh + ' ' + c.label.en).toLowerCase();
        return text.indexOf(q) > -1 || c.hint.toLowerCase().indexOf(q) > -1;
      });
      active = 0;
      render();
    }

    function open() {
      if (dlg.open) return;
      dlg.showModal();
      input.value = '';
      filter();
      window.setTimeout(function () { input.focus(); }, 20);
    }

    function close() {
      if (dlg.open) dlg.close();
    }

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
      var typing = /^(INPUT|TEXTAREA|SELECT)$/.test(doc.activeElement.tagName);
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
  function initCopyButtons() {
    $$('[data-copy="email"]').forEach(function (btn) {
      btn.addEventListener('click', copyEmail);
    });
  }

  function initLangSwitch() {
    var btn = $('#lang-switch');
    if (btn) btn.addEventListener('click', toggleLang);
  }

  function init() {
    bindText();
    updateMeta();
    renderTicker();
    renderWork();
    renderStack();
    renderSocials();
    initTheme();
    initLangSwitch();
    initCopyButtons();
    initClock();
    initField();
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

  if (doc.readyState === 'loading') {
    doc.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  function boot() {
    try {
      init();
    } catch (err) {
      // a broken config should degrade to a readable page, never a blank one
      console.error('[site] init failed:', err);
      revealAll();
      finishBoot();
    }
  }
})();
