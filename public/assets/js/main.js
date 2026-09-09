/* ==========================================================================
   Growth with Ajay — motion system. No dependencies.
   ========================================================================== */
(function () {
  'use strict';

  var root = document.documentElement;
  root.classList.remove('no-js');

  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var COARSE  = window.matchMedia('(hover: none), (pointer: coarse)').matches;
  var raf = window.requestAnimationFrame.bind(window);

  /* ------------------------------------------------ 1. Load curtain */
  var curtain = document.querySelector('.curtain');
  function lift() {
    document.body.classList.add('is-lit');
    if (!curtain) return;
    curtain.classList.add('is-up');
    setTimeout(function () { curtain.remove(); }, 1100);
  }
  if (REDUCED) {
    if (curtain) curtain.remove();
    document.body.classList.add('is-lit');
  } else {
    window.addEventListener('load', function () { setTimeout(lift, 480); });
    // safety net if load never fires (cached fonts, slow asset)
    setTimeout(function () { if (curtain && curtain.isConnected) lift(); }, 2600);
  }

  /* ------------------------------------------------ 2. Custom cursor */
  if (!COARSE && !REDUCED) {
    var dot = document.createElement('div'); dot.className = 'cursor';
    var ring = document.createElement('div'); ring.className = 'cursor-ring';
    document.body.append(dot, ring);

    var mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my, on = false;
    window.addEventListener('mousemove', function (e) {
      mx = e.clientX; my = e.clientY;
      if (!on) { on = true; document.body.classList.add('cursor-on'); rx = mx; ry = my; }
      dot.style.transform = 'translate(' + mx + 'px,' + my + 'px)';
    }, { passive: true });
    document.addEventListener('mouseleave', function () { document.body.classList.remove('cursor-on'); on = false; });

    (function loop() {
      rx += (mx - rx) * 0.16; ry += (my - ry) * 0.16;
      ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px)';
      raf(loop);
    })();

    var HOT = 'a,button,summary,input,select,textarea,.ind,.card,.srow,.case';
    document.addEventListener('mouseover', function (e) {
      if (e.target.closest(HOT)) ring.classList.add('is-hot');
    });
    document.addEventListener('mouseout', function (e) {
      if (e.target.closest(HOT) && !(e.relatedTarget && e.relatedTarget.closest && e.relatedTarget.closest(HOT))) {
        ring.classList.remove('is-hot');
      }
    });
  }

  /* ------------------------------------------------ 3. Film grain */
  if (!REDUCED) {
    var g = document.createElement('canvas');
    g.id = 'grain';
    document.body.appendChild(g);
    var gc = g.getContext('2d'), TILE = 190, frames = [], fi = 0, tick = 0;
    function makeFrames() {
      g.width = TILE; g.height = TILE;
      frames = [];
      for (var f = 0; f < 3; f++) {
        var img = gc.createImageData(TILE, TILE);
        for (var i = 0; i < img.data.length; i += 4) {
          var v = (Math.random() * 255) | 0;
          img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
          img.data[i + 3] = 255;
        }
        frames.push(img);
      }
      g.style.width = '100%'; g.style.height = '100%';
    }
    makeFrames();
    (function grainLoop() {
      if (++tick % 4 === 0) { gc.putImageData(frames[fi], 0, 0); fi = (fi + 1) % frames.length; }
      raf(grainLoop);
    })();
  }

  /* ------------------------------------------------ 4. Scroll progress rail */
  var rail = document.querySelector('.rail');
  var header = document.querySelector('.header');
  function onScroll() {
    var y = window.scrollY;
    if (header) header.classList.toggle('is-stuck', y > 10);
    if (rail) {
      var h = document.documentElement.scrollHeight - innerHeight;
      rail.style.transform = 'scaleX(' + (h > 0 ? Math.min(y / h, 1) : 0) + ')';
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ------------------------------------------------ 5. Reveal on scroll */
  var revealables = document.querySelectorAll('.rv,.rv-l,.rv-rule,.case');
  if ('IntersectionObserver' in window && !REDUCED) {
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('in');
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });

    revealables.forEach(function (el) {
      var group = el.parentElement;
      var idx = group ? Array.prototype.indexOf.call(group.children, el) : 0;
      el.style.transitionDelay = Math.min(idx, 5) * 80 + 'ms';
      io.observe(el);
    });
  } else {
    revealables.forEach(function (el) { el.classList.add('in'); });
  }

  /* ------------------------------------------------ 6. Parallax */
  var par = [].slice.call(document.querySelectorAll('[data-par]'));
  if (par.length && !REDUCED) {
    var pending = false;
    function paint() {
      var vh = innerHeight;
      par.forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return;
        var mid = r.top + r.height / 2;
        var off = (mid - vh / 2) / vh;              // -1 .. 1
        el.style.transform = 'translate3d(0,' + (off * parseFloat(el.dataset.par)).toFixed(2) + 'px,0)';
      });
      pending = false;
    }
    window.addEventListener('scroll', function () {
      if (!pending) { pending = true; raf(paint); }
    }, { passive: true });
    window.addEventListener('resize', paint);
    paint();
  }

  /* ------------------------------------------------ 7. Magnetic buttons */
  if (!COARSE && !REDUCED) {
    document.querySelectorAll('.btn').forEach(function (b) {
      b.addEventListener('pointermove', function (e) {
        var r = b.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) * 0.22;
        var y = (e.clientY - r.top - r.height / 2) * 0.3;
        b.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)';
      });
      b.addEventListener('pointerleave', function () { b.style.transform = ''; });
    });
  }

  /* ------------------------------------------------ 8. Pointer glow + tilt */
  document.querySelectorAll('.card,.ind').forEach(function (el) {
    el.addEventListener('pointermove', function (e) {
      var r = el.getBoundingClientRect();
      var px = e.clientX - r.left, py = e.clientY - r.top;
      el.style.setProperty('--mx', px + 'px');
      el.style.setProperty('--my', py + 'px');
      if (el.classList.contains('ind') && !COARSE && !REDUCED) {
        var rxd = ((py / r.height) - 0.5) * -6;
        var ryd = ((px / r.width) - 0.5) * 6;
        el.style.transform = 'rotateX(' + rxd.toFixed(2) + 'deg) rotateY(' + ryd.toFixed(2) + 'deg) translateZ(0)';
      }
    });
    el.addEventListener('pointerleave', function () { el.style.transform = ''; });
  });

  /* ------------------------------------------------ 9. Counters */
  var nums = document.querySelectorAll('[data-count]');
  if ('IntersectionObserver' in window && nums.length) {
    var nio = new IntersectionObserver(function (en) {
      en.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target; nio.unobserve(el);
        var to = parseFloat(el.dataset.count);
        var pre = el.dataset.pre || '', suf = el.dataset.suf || '';
        var dec = (String(to).split('.')[1] || '').length;
        if (REDUCED) { el.textContent = pre + to.toFixed(dec) + suf; return; }
        var t0 = performance.now(), dur = 1500;
        (function step(now) {
          var p = Math.min((now - t0) / dur, 1);
          var k = 1 - Math.pow(1 - p, 3);
          el.textContent = pre + (to * k).toFixed(dec) + suf;
          if (p < 1) raf(step);
        })(t0);
      });
    }, { threshold: 0.5 });
    nums.forEach(function (n) { nio.observe(n); });
  }

  /* ------------------------------------------------ 10. Signal wave canvas */
  var sig = document.querySelector('.signal');
  if (sig && !REDUCED) {
    var sc = sig.getContext('2d'), W = 0, H = 0, dpr = Math.min(devicePixelRatio || 1, 2), t = 0, alive = true;
    function size() {
      W = sig.clientWidth; H = sig.clientHeight;
      sig.width = W * dpr; sig.height = H * dpr;
      sc.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    size();
    addEventListener('resize', size);
    new IntersectionObserver(function (e) { alive = e[0].isIntersecting; }).observe(sig);

    (function draw() {
      raf(draw);
      if (!alive || W === 0) return;
      sc.clearRect(0, 0, W, H);
      t += 0.006;
      for (var l = 0; l < 3; l++) {
        sc.beginPath();
        for (var x = 0; x <= W; x += 4) {
          var n = x / W;
          var amp = (H / 2 - 6) * Math.pow(Math.sin(Math.PI * n), 1.4);
          var y = H / 2
            + Math.sin(n * 8 + t * (1 + l * 0.35)) * amp * (0.42 - l * 0.1)
            + Math.sin(n * 19 - t * 1.6 + l) * amp * 0.16;
          x === 0 ? sc.moveTo(x, y) : sc.lineTo(x, y);
        }
        var grad = sc.createLinearGradient(0, 0, W, 0);
        grad.addColorStop(0, 'rgba(196,118,63,0)');
        grad.addColorStop(0.28, l === 0 ? 'rgba(240,192,140,.85)' : 'rgba(196,118,63,.35)');
        grad.addColorStop(0.72, l === 0 ? 'rgba(196,118,63,.7)' : 'rgba(126,70,34,.35)');
        grad.addColorStop(1, 'rgba(196,118,63,0)');
        sc.strokeStyle = grad;
        sc.lineWidth = l === 0 ? 1.5 : 1;
        sc.stroke();
      }
    })();
  }

  /* ------------------------------------------------ 10b. Automation flow log */
  var flow = document.querySelector('[data-flow]');
  if (flow) {
    var flowLog = document.querySelector('.flow__log-line');
    var flowSteps = [
      'Form submitted…',
      'AI agent scoring intent…',
      'CRM record updated…',
      'Slack alert sent to sales…',
      'Follow-up scheduled — done.'
    ];
    var flowIdx = 0, flowTimer = null;
    var flowStep = function () {
      if (flowLog) flowLog.textContent = flowSteps[flowIdx % flowSteps.length];
      flowIdx++;
    };
    var flowStart = function () {
      if (flowTimer) return;
      flowStep();
      if (REDUCED) return;
      flowTimer = setInterval(flowStep, 1100);
    };
    var flowStop = function () { clearInterval(flowTimer); flowTimer = null; };
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) {
        en.forEach(function (e) { e.isIntersecting ? flowStart() : flowStop(); });
      }, { threshold: 0.35 }).observe(flow);
    } else {
      flowStart();
    }
  }

  /* ------------------------------------------------ 11. Mobile menu */
  var burger = document.querySelector('.burger');
  var mobile = document.querySelector('.mobile');
  if (burger && mobile) {
    var setOpen = function (v) {
      burger.setAttribute('aria-expanded', String(v));
      mobile.classList.toggle('is-open', v);
      document.body.style.overflow = v ? 'hidden' : '';
    };
    burger.addEventListener('click', function () {
      setOpen(burger.getAttribute('aria-expanded') !== 'true');
    });
    mobile.addEventListener('click', function (e) { if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setOpen(false); });
  }

    /* ------------------------------------------------ 12. Contact form
      The Next.js API handles delivery when SMTP is configured. */
    var USE_NODE = true;
    var NODE_ENDPOINT = '/api/contact';

  var form = document.querySelector('#contact-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var d = new FormData(form);
      var get = function (k) { return (d.get(k) || '').toString().trim(); };
      var status = document.querySelector('#form-status');
      if (get('company_website')) return; // honeypot

      var body = 'Name: ' + get('name') + '\n'
               + 'Email: ' + get('email') + '\n'
               + 'Company: ' + (get('company') || '—') + '\n'
               + 'Industry: ' + get('industry') + '\n'
               + 'Service: ' + get('service') + '\n'
               + 'Budget: ' + get('budget') + '\n\n'
               + get('message');

      function openMail() {
        var to = form.dataset.to || '';
        window.location.href = 'mailto:' + to
          + '?subject=' + encodeURIComponent('New enquiry — ' + (get('service') || 'Marketing') + ' — ' + get('name'))
          + '&body=' + encodeURIComponent(body);
        if (status) {
          status.textContent = 'Opening your email app… if nothing happens, write to ' + to + ' directly.';
          status.classList.add('is-on');
        }
      }

      if (USE_NODE) {
        fetch(NODE_ENDPOINT, { method: 'POST', body: d })
          .then(function (r) { return r.ok ? r.text() : Promise.reject(); })
          .then(function () {
            form.reset();
            if (status) { status.textContent = 'Thanks — your message is in. I reply within one business day.'; status.classList.add('is-on'); }
          })
          .catch(openMail);
      } else {
        openMail();
      }
    });
  }

  /* ------------------------------------------------ 13. Year stamp */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
