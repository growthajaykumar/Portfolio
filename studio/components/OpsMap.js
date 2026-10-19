'use client';
import { useEffect, useRef } from 'react';

/**
 * Hero visual: a live "operations map" of the practice, drawn on <canvas>.
 * A lime core (n8n Automation) feeds five hubs; each hub owns a cluster of
 * animated glyphs (spheres, radars, rosettes, circuit mazes, signal waves).
 * Light pulses run every connection and a spotlight sweeps one branch at a time.
 * All labels are existing site copy, passed in as plain text. Decorative: aria-hidden.
 */
const W = 1600, H = 920;
const C = {
  core: '#D7FF3B', web3: '#5FF2D6', estate: '#FFC94A', fashion: '#FF6FB5', services: '#8C9BFF', flow: '#FFB04A', white: '#F4F1E8',
};

/* deterministic PRNG so the drawing is identical on every load */
function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

function buildGraph(d) {
  const core = { id: 'core', x: 800, y: 450, kind: 'core', label: d.core, color: C.core };
  const agents = { id: 'agents', x: 960, y: 372, kind: 'terminal', label: d.agents, color: C.white };
  const hubs = [
    { id: 'services', x: 610, y: 262, label: d.servicesLabel, color: C.services, glyph: 'maze', leaves: d.services, pos: [[372, 104], [505, 74], [642, 66], [780, 76], [912, 104]] },
    { id: 'web3', x: 1085, y: 268, label: d.web3.title, color: C.web3, glyph: 'rosette', leaves: d.web3.leaves, pos: [[1215, 112], [1368, 150], [1478, 270], [1478, 408], [1372, 512]] },
    { id: 'estate', x: 420, y: 486, label: d.estate.title, color: C.estate, glyph: 'sphere', leaves: d.estate.leaves, pos: [[190, 336], [140, 500], [196, 660]] },
    { id: 'fashion', x: 700, y: 676, label: d.fashion.title, color: C.fashion, glyph: 'radar', leaves: d.fashion.leaves, pos: [[338, 770], [492, 800], [652, 812], [818, 802]] },
    { id: 'flow', x: 1085, y: 640, label: d.flowLabel, color: C.flow, glyph: 'wave', leaves: d.flow, pos: [[1212, 600], [1338, 650], [1440, 736], [1344, 832], [1196, 864]], chain: true },
  ];
  const nodes = [core, agents], edges = [];
  const edge = (a, b, bend, hub) => edges.push({ a, b, bend, hub, color: b.color });
  edge(core, agents, -0.25, 'core');
  hubs.forEach((h, hi) => {
    const hub = { id: h.id, x: h.x, y: h.y, kind: 'hub', label: h.label, color: h.color };
    nodes.push(hub);
    edge(core, hub, hi % 2 ? 0.18 : -0.18, h.id);
    let prev = hub;
    h.leaves.forEach((label, i) => {
      if (!h.pos[i]) return;
      const leaf = { id: `${h.id}-${i}`, x: h.pos[i][0], y: h.pos[i][1], kind: 'leaf', glyph: h.glyph, label, color: h.color, seed: hi * 31 + i * 7 + 3, big: h.id === 'fashion' && i === 0 };
      nodes.push(leaf);
      edge(h.chain ? prev : hub, leaf, (i % 2 ? 0.22 : -0.22), h.id);
      if (h.chain) prev = leaf;
    });
  });
  edges.forEach((e) => {
    const mx = (e.a.x + e.b.x) / 2, my = (e.a.y + e.b.y) / 2, dx = e.b.x - e.a.x, dy = e.b.y - e.a.y;
    e.cx = mx - dy * e.bend; e.cy = my + dx * e.bend;
    e.len = Math.hypot(dx, dy);
    e.pt = (t) => { const m = 1 - t; return [m * m * e.a.x + 2 * m * t * e.cx + t * t * e.b.x, m * m * e.a.y + 2 * m * t * e.cy + t * t * e.b.y]; };
  });
  // per-leaf precomputed geometry
  nodes.forEach((n) => {
    if (n.kind !== 'leaf') return;
    const r = rng(n.seed);
    if (n.glyph === 'sphere') {
      const N = 64; n.pts = [];
      for (let i = 0; i < N; i++) { const y = 1 - (2 * (i + 0.5)) / N, rad = Math.sqrt(1 - y * y), th = i * 2.399963; n.pts.push([Math.cos(th) * rad, y, Math.sin(th) * rad]); }
      n.links = Array.from({ length: 5 }, () => [Math.floor(r() * N), Math.floor(r() * N)]);
      n.sats = [Math.floor(r() * N), Math.floor(r() * N), Math.floor(r() * N)];
    }
    if (n.glyph === 'maze') n.maze = maze(6, r);
    n.phase = r() * Math.PI * 2;
  });
  return { nodes, edges, hubs: hubs.map((h) => h.id) };
}

/* recursive-backtracker maze; returns wall segments and the carve order (for the running current) */
function maze(n, r) {
  const seen = new Set(), path = [], open = new Set();
  const key = (x, y) => `${x},${y}`;
  const stack = [[0, 0]]; seen.add(key(0, 0)); path.push([0, 0]);
  while (stack.length) {
    const [x, y] = stack[stack.length - 1];
    const nb = [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([dx, dy]) => [x + dx, y + dy]).filter(([a, b]) => a >= 0 && b >= 0 && a < n && b < n && !seen.has(key(a, b)));
    if (!nb.length) { stack.pop(); continue; }
    const [nx, ny] = nb[Math.floor(r() * nb.length)];
    seen.add(key(nx, ny)); open.add([key(x, y), key(nx, ny)].sort().join('|')); stack.push([nx, ny]); path.push([nx, ny]);
  }
  const walls = [];
  for (let x = 0; x < n; x++) for (let y = 0; y < n; y++) {
    if (x < n - 1 && !open.has([key(x, y), key(x + 1, y)].sort().join('|'))) walls.push([x + 1, y, x + 1, y + 1]);
    if (y < n - 1 && !open.has([key(x, y), key(x, y + 1)].sort().join('|'))) walls.push([x, y + 1, x + 1, y + 1]);
  }
  return { n, walls, path };
}

export default function OpsMap({ data }) {
  const wrap = useRef(null), cvs = useRef(null);

  useEffect(() => {
    const el = wrap.current, canvas = cvs.current, ctx = canvas.getContext('2d');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const G = buildGraph(data);
    const font = getComputedStyle(document.body).getPropertyValue('--sans') || 'sans-serif';
    let cw = 0, ch = 0, dpr = 1, s = 1, ox = 0, oy = 0, raf = 0, visible = true, t0 = performance.now(), last = 0;
    const pulses = [];

    function fit() {
      const r = el.getBoundingClientRect();
      cw = r.width; ch = r.height; dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(cw * dpr); canvas.height = Math.round(ch * dpr);
      if (cw < 760) { s = (ch / H) * 1.12; ox = cw / 2 - 800 * s; }
      else { s = Math.min(cw / W, ch / H) * 0.9; ox = (cw - W * s) / 2; }
      oy = (ch - H * s) / 2;
    }

    const lw = (px) => px / s;
    const glowDot = (x, y, r, color, a = 1) => {
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, color); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.globalAlpha = a; ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); ctx.globalAlpha = 1;
    };
    const label = (txt, x, y, color, size = 17, weight = 600, align = 'center') => {
      ctx.font = `${weight} ${size}px ${font}`; ctx.textAlign = align; ctx.textBaseline = 'top';
      ctx.shadowColor = color; ctx.shadowBlur = 10 * s; ctx.fillStyle = color; ctx.fillText(txt, x, y); ctx.shadowBlur = 0;
    };

    /* ---------- glyphs ---------- */
    function drawCore(n, t) {
      const R = 74, rot = t * 0.12;
      ctx.strokeStyle = n.color; ctx.lineWidth = lw(1);
      for (let ring = 1; ring <= 4; ring++) {
        const rr = (R * ring) / 4; ctx.globalAlpha = 0.25 + ring * 0.12; ctx.beginPath();
        for (let k = 0; k <= 6; k++) { const a = rot + (k * Math.PI) / 3; const px = n.x + Math.cos(a) * rr, py = n.y + Math.sin(a) * rr * 0.86; k ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
        ctx.stroke();
      }
      ctx.globalAlpha = 0.55;
      for (let k = 0; k < 6; k++) { const a = rot + (k * Math.PI) / 3; ctx.beginPath(); ctx.moveTo(n.x, n.y); ctx.lineTo(n.x + Math.cos(a) * R * 1.12, n.y + Math.sin(a) * R * 0.96); ctx.stroke(); }
      ctx.globalAlpha = 1;
      for (let k = 0; k < 6; k++) { const a = rot + (k * Math.PI) / 3 + 0.5; glowDot(n.x + Math.cos(a) * R * 0.5, n.y + Math.sin(a) * R * 0.43, 7, n.color, 0.9); }
      const p = 0.75 + Math.sin(t * 2.2) * 0.25;
      glowDot(n.x, n.y, 46 * p, n.color, 0.55); glowDot(n.x, n.y, 12, '#ffffff', 0.95);
      label(n.label, n.x, n.y + R + 10, n.color, 21, 700);
    }
    function drawHub(n, t, hot) {
      glowDot(n.x, n.y, hot ? 54 : 40, n.color, hot ? 0.45 : 0.22);
      ctx.fillStyle = '#121318'; ctx.beginPath(); ctx.arc(n.x, n.y, 22, 0, 7); ctx.fill();
      ctx.strokeStyle = n.color; ctx.lineWidth = lw(hot ? 2.4 : 1.6); ctx.beginPath(); ctx.arc(n.x, n.y, 22, 0, 7); ctx.stroke();
      ctx.globalAlpha = 0.5; ctx.setLineDash([lw(3), lw(5)]); ctx.beginPath(); ctx.arc(n.x, n.y, 30, t * 0.5, t * 0.5 + 6.28); ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha = 1;
      ctx.fillStyle = C.white; ctx.beginPath(); ctx.moveTo(n.x - 9, n.y - 6); ctx.lineTo(n.x - 3, n.y - 6); ctx.lineTo(n.x - 1, n.y - 3); ctx.lineTo(n.x + 9, n.y - 3); ctx.lineTo(n.x + 9, n.y + 8); ctx.lineTo(n.x - 9, n.y + 8); ctx.closePath(); ctx.fill();
      label(n.label, n.x, n.y + 34, n.color, 15, 600);
    }
    function drawTerminal(n, t) {
      const p = 0.8 + Math.sin(t * 3) * 0.2;
      glowDot(n.x, n.y, 30 * p, '#ffffff', 0.35); ctx.fillStyle = '#FFF9E6'; ctx.beginPath(); ctx.arc(n.x, n.y, 11, 0, 7); ctx.fill();
      label(n.label, n.x + 22, n.y - 9, C.white, 15, 600, 'left');
    }
    function drawLeaf(n, t, hot) {
      const k = hot ? 1 : 0.82, R = n.big ? 50 : 40;
      ctx.save(); ctx.globalAlpha = k;
      if (n.glyph === 'rosette') {
        const rot = t * 0.25 + n.phase;
        ctx.strokeStyle = n.color; ctx.lineWidth = lw(1.2);
        for (let i = 0; i < 8; i++) {
          const a = rot + (i * Math.PI) / 4, x = n.x + Math.cos(a) * R * 0.78, y = n.y + Math.sin(a) * R * 0.78;
          ctx.beginPath(); ctx.moveTo(n.x, n.y); ctx.lineTo(x, y); ctx.stroke();
          ctx.strokeRect(x - 4, y - 4, 8, 8);
          const b = -rot * 1.6 + (i * Math.PI) / 4, x2 = n.x + Math.cos(b) * R * 1.08, y2 = n.y + Math.sin(b) * R * 1.08;
          ctx.beginPath(); ctx.moveTo(x2, y2 - 4); ctx.lineTo(x2 + 4, y2); ctx.lineTo(x2, y2 + 4); ctx.lineTo(x2 - 4, y2); ctx.closePath(); ctx.stroke();
        }
        ctx.beginPath(); ctx.arc(n.x, n.y, R * 0.78, 0, 7); ctx.globalAlpha = k * 0.35; ctx.stroke(); ctx.globalAlpha = k;
        glowDot(n.x, n.y, 24, n.color, 0.6); ctx.fillStyle = n.color; ctx.beginPath(); ctx.arc(n.x, n.y, 9 + Math.sin(t * 2 + n.phase) * 1.5, 0, 7); ctx.fill();
      } else if (n.glyph === 'sphere') {
        const a = t * 0.45 + n.phase, ca = Math.cos(a), sa = Math.sin(a), tilt = 0.35, ct = Math.cos(tilt), st = Math.sin(tilt);
        const proj = n.pts.map(([x, y, z]) => { const x1 = x * ca + z * sa, z1 = -x * sa + z * ca; const y1 = y * ct - z1 * st, z2 = y * st + z1 * ct; return [n.x + x1 * R, n.y + y1 * R, z2]; });
        ctx.strokeStyle = n.color; ctx.lineWidth = lw(1);
        n.links.forEach(([i, j]) => { ctx.globalAlpha = k * 0.45; ctx.beginPath(); ctx.moveTo(proj[i][0], proj[i][1]); ctx.lineTo(proj[j][0], proj[j][1]); ctx.stroke(); });
        proj.forEach(([x, y, z]) => { ctx.globalAlpha = k * (0.35 + (z + 1) * 0.32); ctx.fillStyle = n.color; ctx.beginPath(); ctx.arc(x, y, 1.6 + (z + 1) * 1.1, 0, 7); ctx.fill(); });
        ctx.globalAlpha = k; n.sats.forEach((i) => glowDot(proj[i][0], proj[i][1], 12, n.color, 0.8));
      } else if (n.glyph === 'radar') {
        ctx.fillStyle = n.color;
        for (let ring = 1; ring <= 4; ring++) {
          const rr = (R * ring) / 4, cnt = 8 + ring * 6;
          for (let i = 0; i < cnt; i++) { const a = (i / cnt) * 6.283 + ring; ctx.globalAlpha = k * 0.55; ctx.beginPath(); ctx.arc(n.x + Math.cos(a) * rr, n.y + Math.sin(a) * rr, 1.5, 0, 7); ctx.fill(); }
        }
        const sw = t * 1.7 + n.phase;
        const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, R * 1.05);
        g.addColorStop(0, n.color); g.addColorStop(1, 'rgba(255,111,181,0)');
        ctx.globalAlpha = k * 0.55; ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(n.x, n.y); ctx.arc(n.x, n.y, R * 1.05, sw - 0.6, sw); ctx.closePath(); ctx.fill();
        ctx.globalAlpha = k; ctx.strokeStyle = n.color; ctx.lineWidth = lw(2);
        ctx.beginPath(); ctx.moveTo(n.x, n.y); ctx.lineTo(n.x + Math.cos(sw) * R * 1.25, n.y + Math.sin(sw) * R * 1.25); ctx.stroke();
        const beam = ctx.createLinearGradient(n.x, n.y, n.x, n.y + R * 1.6);
        beam.addColorStop(0, n.color); beam.addColorStop(1, 'rgba(255,111,181,0)');
        ctx.globalAlpha = k * (0.5 + Math.sin(t * 3 + n.phase) * 0.2); ctx.fillStyle = beam; ctx.fillRect(n.x - 2.5, n.y, 5, R * 1.6);
        glowDot(n.x, n.y, 14, n.color, 0.9);
      } else if (n.glyph === 'maze') {
        const m = n.maze, cell = (R * 1.7) / m.n, x0 = n.x - (cell * m.n) / 2, y0 = n.y - (cell * m.n) / 2;
        ctx.strokeStyle = n.color; ctx.lineWidth = lw(1.3); ctx.globalAlpha = k * 0.5;
        ctx.strokeRect(x0, y0, cell * m.n, cell * m.n);
        ctx.beginPath(); m.walls.forEach(([a, b, c, d]) => { ctx.moveTo(x0 + a * cell, y0 + b * cell); ctx.lineTo(x0 + c * cell, y0 + d * cell); }); ctx.stroke();
        const L = m.path.length, head = Math.floor((t * 9 + n.phase * 10) % L);
        ctx.globalAlpha = k; ctx.lineWidth = lw(2.2); ctx.beginPath();
        for (let i = Math.max(0, head - 7); i <= head; i++) { const [cx, cy] = m.path[i]; const px = x0 + (cx + 0.5) * cell, py = y0 + (cy + 0.5) * cell; i === Math.max(0, head - 7) ? ctx.moveTo(px, py) : ctx.lineTo(px, py); }
        ctx.stroke();
        const [hx, hy] = m.path[head]; glowDot(x0 + (hx + 0.5) * cell, y0 + (hy + 0.5) * cell, 12, n.color, 0.95);
      } else if (n.glyph === 'wave') {
        const ph = t * 3.2 + n.phase;
        ctx.strokeStyle = n.color; ctx.lineWidth = lw(2.4); ctx.shadowColor = n.color; ctx.shadowBlur = 8 * s;
        ctx.beginPath();
        for (let x = -38; x <= 38; x += 2) { const env = Math.cos((x / 38) * 1.57); const y = Math.sin(x * 0.16 + ph) * 15 * env; x === -38 ? ctx.moveTo(n.x + x, n.y + y) : ctx.lineTo(n.x + x, n.y + y); }
        ctx.stroke(); ctx.shadowBlur = 0;
        glowDot(n.x - 38, n.y, 8, n.color, 0.9); glowDot(n.x + 38, n.y, 8, n.color, 0.9);
      }
      ctx.restore();
      const off = n.glyph === 'wave' ? 24 : (n.glyph === 'radar' ? R + 26 : R + 12);
      label(n.label, n.x, n.y + off, n.color, n.big ? 17 : 15, 600);
    }

    /* ---------- edges + pulses ---------- */
    function spawn(e, now, speed) { pulses.push({ e, t0: now, dur: (e.len / (speed || 260)) * 1000 }); }
    G.edges.forEach((e) => { e.next = Math.random() * 3000; });

    let spotIdx = 0, spotT = 0;
    function frame(now) {
      raf = requestAnimationFrame(frame);
      if (!visible) { last = now; return; }
      render(now);
    }
    function render(now) {
      const t = (now - t0) / 1000;
      // spotlight cycles through the hubs
      if (!reduce && now - spotT > 4200) { spotT = now; spotIdx = (spotIdx + 1) % G.hubs.length; G.edges.filter((e) => e.hub === G.hubs[spotIdx] || (e.a.id === 'core' && e.b.id === G.hubs[spotIdx])).forEach((e, i) => setTimeout(() => spawn(e, performance.now(), 420), i * 90)); }
      const spot = reduce ? null : G.hubs[spotIdx];
      if (!reduce) G.edges.forEach((e) => { if (now > e.next) { spawn(e, now); e.next = now + 1800 + Math.random() * 4200; } });

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = '#07080A'; ctx.fillRect(0, 0, cw, ch);
      ctx.setTransform(dpr * s, 0, 0, dpr * s, dpr * ox, dpr * oy);

      // big grid
      ctx.strokeStyle = 'rgba(160,170,190,.07)'; ctx.lineWidth = lw(1);
      ctx.beginPath(); for (let x = -480; x <= W + 480; x += 160) { ctx.moveTo(x, -300); ctx.lineTo(x, H + 300); } for (let y = -320; y <= H + 320; y += 160) { ctx.moveTo(-480, y); ctx.lineTo(W + 480, y); } ctx.stroke();

      // edges
      G.edges.forEach((e) => {
        const hot = spot && e.hub === spot;
        ctx.strokeStyle = hot ? e.color : 'rgba(230,230,240,.32)'; ctx.globalAlpha = hot ? 0.85 : 1; ctx.lineWidth = lw(hot ? 1.8 : 1.2);
        ctx.beginPath(); ctx.moveTo(e.a.x, e.a.y); ctx.quadraticCurveTo(e.cx, e.cy, e.b.x, e.b.y); ctx.stroke(); ctx.globalAlpha = 1;
        // little relay dots along the wire
        [0.33, 0.66].forEach((f) => { const [px, py] = e.pt(f); ctx.fillStyle = hot ? e.color : 'rgba(240,235,220,.55)'; ctx.beginPath(); ctx.arc(px, py, 2.4, 0, 7); ctx.fill(); });
      });

      // pulses
      ctx.globalCompositeOperation = 'lighter';
      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i], f = (now - p.t0) / p.dur;
        if (f >= 1) { pulses.splice(i, 1); continue; }
        for (let k = 7; k >= 0; k--) { const ff = f - k * 0.018; if (ff < 0) continue; const [x, y] = p.e.pt(ff); glowDot(x, y, k ? 9 - k : 16, k ? p.e.color : '#ffffff', k ? 0.5 - k * 0.05 : 0.95); }
      }
      ctx.globalCompositeOperation = 'source-over';

      // nodes
      ctx.globalCompositeOperation = 'lighter';
      G.nodes.forEach((n) => {
        const hot = spot && (n.id === spot || n.id.startsWith(spot + '-'));
        if (n.kind === 'leaf') drawLeaf(n, t, hot);
      });
      ctx.globalCompositeOperation = 'source-over';
      G.nodes.forEach((n) => {
        if (n.kind === 'hub') drawHub(n, t, spot === n.id);
        else if (n.kind === 'core') drawCore(n, t);
        else if (n.kind === 'terminal') drawTerminal(n, t);
      });
    }

    fit();
    const ro = new ResizeObserver(() => { fit(); if (reduce) render(t0 + 6000); });
    ro.observe(el);
    if (reduce) { render(t0 + 6000); }
    else {
      raf = requestAnimationFrame(frame);
      const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0.02 });
      io.observe(el);
      // gentle parallax toward the pointer
      const hero = el.closest('section') || el;
      const onMove = (e) => {
        const r = el.getBoundingClientRect();
        const nx = (e.clientX - (r.left + r.width / 2)) / r.width, ny = (e.clientY - (r.top + r.height / 2)) / r.height;
        el.style.setProperty('--ry', `${(-7 + nx * 6).toFixed(2)}deg`);
        el.style.setProperty('--rx', `${(13 - ny * 5).toFixed(2)}deg`);
      };
      hero.addEventListener('pointermove', onMove, { passive: true });
      return () => { cancelAnimationFrame(raf); io.disconnect(); ro.disconnect(); hero.removeEventListener('pointermove', onMove); };
    }
    return () => ro.disconnect();
  }, [data]);

  return (
    <div className="ops" aria-hidden="true">
      <div className="ops__screen" ref={wrap}><canvas ref={cvs} /></div>
    </div>
  );
}
