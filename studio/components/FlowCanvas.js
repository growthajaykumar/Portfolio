'use client';
import { useEffect, useRef } from 'react';
import { text } from '../lib/site';

/**
 * Hero visual: an automation canvas in the style of a workflow editor.
 * Form submit → AI qualifies lead → (one of three markets) → CRM updated → Slack alert → Follow-up sent,
 * with an "AI Agents" model node wired in by dashed sub-connections.
 * Labels come from existing site copy (flow nodes, markets, ticker). Decorative: aria-hidden.
 *
 * Leads run continuously: a lime packet travels each connector, the connector lights behind it,
 * nodes flash while executing and keep a check mark. Runs overlap and pick different branches.
 */
const W = 1600, H = 500;
const SQ = 104;                    // square node size
const CARD = { w: 330, h: 104 };   // market card size

function icon(svg, x, y, size) {
  if (!svg) return '';
  return svg.replace(/viewbox=/i, 'viewBox=').replace(/^<svg\b/, `<svg x="${x}" y="${y}" width="${size}" height="${size}"`);
}
const curve = (a, b) => {
  const dx = Math.max(60, (b[0] - a[0]) * 0.5);
  return `M${a[0]} ${a[1]} C${a[0] + dx} ${a[1]} ${b[0] - dx} ${b[1]} ${b[0]} ${b[1]}`;
};

export default function FlowCanvas({ flow, markets, modelLabel }) {
  const ref = useRef(null);
  const cy = 250;
  // ---- layout (design units) ----
  const N = {
    trigger: { x: 70, y: cy - SQ / 2, w: SQ, h: SQ, label: flow.nodes[0].label, icon: flow.nodes[0].icon, trigger: true },
    qualify: { x: 280, y: cy - SQ / 2, w: SQ, h: SQ, label: flow.nodes[1].label, icon: flow.nodes[1].icon },
    crm: { x: 1010, y: cy - SQ / 2, w: SQ, h: SQ, label: flow.nodes[2].label, icon: flow.nodes[2].icon },
    slack: { x: 1210, y: cy - SQ / 2, w: SQ, h: SQ, label: flow.nodes[3].label, icon: flow.nodes[3].icon },
    follow: { x: 1410, y: cy - SQ / 2, w: SQ, h: SQ, label: flow.nodes[4].label, icon: flow.nodes[4].icon },
  };
  const mY = [cy - 160, cy, cy + 160];
  markets.forEach((m, i) => { N['m' + i] = { x: 560, y: mY[i] - CARD.h / 2, w: CARD.w, h: CARD.h, label: m.title, sub: m.tags.slice(0, 2).map(text).join(' · '), icon: m.icon, card: true }; });
  const model = { cx: 332, cy: 448, r: 34 };
  const out = (n) => [n.x + n.w, n.y + n.h / 2];
  const inp = (n) => [n.x, n.y + n.h / 2];
  const bottom = (n) => [n.x + (n.card ? 46 : n.w / 2), n.y + n.h];

  const E = {
    tq: curve(out(N.trigger), inp(N.qualify)),
    ...Object.fromEntries(markets.map((_, i) => ['q' + i, curve(out(N.qualify), inp(N['m' + i]))])),
    ...Object.fromEntries(markets.map((_, i) => ['c' + i, curve(out(N['m' + i]), inp(N.crm))])),
    cs: curve(out(N.crm), inp(N.slack)),
    sf: curve(out(N.slack), inp(N.follow)),
  };
  const dashed = {
    qualify: `M${model.cx} ${model.cy - model.r} L${bottom(N.qualify)[0]} ${bottom(N.qualify)[1] + 12}`,
    ...Object.fromEntries(markets.map((_, i) => {
      const b = bottom(N['m' + i]);
      return ['m' + i, `M${model.cx + model.r * 0.8} ${model.cy - model.r * 0.6} C${model.cx + 160} ${model.cy - 40} ${b[0] - 60} ${b[1] + 60} ${b[0]} ${b[1] + 12}`];
    })),
  };

  useEffect(() => {
    const root = ref.current;
    const svg = root.querySelector('svg');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const edges = {}, nodes = {}, models = {};
    root.querySelectorAll('[data-edge]').forEach((p) => {
      const lit = root.querySelector(`[data-lit="${p.dataset.edge}"]`);
      const len = p.getTotalLength();
      lit.style.strokeDasharray = `${len} ${len}`; lit.style.strokeDashoffset = len;
      edges[p.dataset.edge] = { p, lit, len };
    });
    root.querySelectorAll('[data-node]').forEach((g) => { nodes[g.dataset.node] = g; });
    root.querySelectorAll('[data-model]').forEach((g) => { models[g.dataset.model] = g; });
    const packets = [...root.querySelectorAll('.fc__packet')];
    if (reduce) {
      // a single, finished run drawn statically
      ['tq', 'q0', 'c0', 'cs', 'sf'].forEach((k) => { edges[k].lit.style.strokeDashoffset = 0; edges[k].lit.style.opacity = 1; });
      ['trigger', 'qualify', 'm0', 'crm', 'slack', 'follow'].forEach((k) => nodes[k].classList.add('is-done'));
      return;
    }

    // a run = list of steps; each step is a node pulse or an edge traversal (ms)
    const plan = (k) => [
      ['node', 'trigger', 380], ['edge', 'tq', 560],
      ['node', 'qualify', 820, 'qualify'], ['edge', 'q' + k, 700],
      ['node', 'm' + k, 640, 'm' + k], ['edge', 'c' + k, 700],
      ['node', 'crm', 420], ['edge', 'cs', 480],
      ['node', 'slack', 420], ['edge', 'sf', 480],
      ['node', 'follow', 560],
    ];
    const GAP = 2600, HOLD = 900;
    let runs = [], n = 0, raf = 0, last = 0, visible = true, clock = 0;
    const order = [0, 1, 2, 1, 0, 2];

    function frame(now) {
      raf = requestAnimationFrame(frame);
      if (!visible) { last = now; return; }
      clock += Math.min(64, now - (last || now)); last = now;
      if (!runs.length || clock - runs[runs.length - 1].t0 >= GAP) runs.push({ t0: clock, steps: plan(order[n++ % order.length]), slot: n % packets.length });
      const active = new Set(), done = new Set(), think = new Set(), litNow = {};
      runs = runs.filter((r) => {
        let t = clock - r.t0, finished = true, pkt = null;
        for (const [kind, id, dur, model] of r.steps) {
          if (t < 0) { finished = false; break; }
          if (t < dur) {
            finished = false;
            if (kind === 'node') { active.add(id); if (model) think.add(model); }
            else { const e = edges[id]; const f = t / dur; litNow[id] = Math.max(litNow[id] ?? 0, f); pkt = e.p.getPointAtLength(f * e.len); }
            t -= dur; break;
          }
          if (kind === 'node') done.add(id); else litNow[id] = Math.max(litNow[id] ?? 0, 1);
          t -= dur;
        }
        const el = packets[r.slot];
        if (pkt) { el.setAttribute('transform', `translate(${pkt.x} ${pkt.y})`); el.style.opacity = 1; } else el.style.opacity = 0;
        if (finished && t > HOLD) { el.style.opacity = 0; return false; }
        return true;
      });
      for (const [k, e] of Object.entries(edges)) {
        const f = litNow[k];
        e.lit.style.strokeDashoffset = f == null ? e.len : e.len * (1 - f);
        e.lit.style.opacity = f == null ? 0 : 1;
      }
      for (const [k, g] of Object.entries(nodes)) {
        g.classList.toggle('is-run', active.has(k));
        g.classList.toggle('is-done', done.has(k) && !active.has(k));
      }
      for (const [k, g] of Object.entries(models)) g.classList.toggle('is-think', think.has(k));
      root.classList.toggle('is-thinking', think.size > 0);
    }
    raf = requestAnimationFrame(frame);
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0.05 });
    io.observe(root);
    return () => { cancelAnimationFrame(raf); io.disconnect(); };
  }, []);

  const Node = ({ id }) => {
    const n = N[id];
    if (n.card) {
      return (
        <g className="fc__node fc__node--card" data-node={id}>
          <rect className="fc__box" x={n.x} y={n.y} width={n.w} height={n.h} rx="10" />
          <g className="fc__ico" dangerouslySetInnerHTML={{ __html: icon(n.icon, n.x + 22, n.y + 30, 44) }} />
          <text className="fc__title" x={n.x + 86} y={n.y + 46}>{text(n.label)}</text>
          <text className="fc__sub" x={n.x + 86} y={n.y + 74}>{n.sub}</text>
          <circle className="fc__port" cx={n.x} cy={n.y + n.h / 2} r="7" />
          <circle className="fc__port" cx={n.x + n.w} cy={n.y + n.h / 2} r="7" />
          <rect className="fc__diamond" x={bottom(n)[0] - 7} y={bottom(n)[1] - 7} width="14" height="14" transform={`rotate(45 ${bottom(n)[0]} ${bottom(n)[1]})`} />
          <g className="fc__check" transform={`translate(${n.x + n.w - 26} ${n.y + 22})`}><circle r="12" fill="#D7FF3B" /><path d="M-5 0l3.5 3.5L5-4" /></g>
        </g>
      );
    }
    return (
      <g className={`fc__node${n.trigger ? ' fc__node--trigger' : ''}`} data-node={id}>
        <rect className="fc__box" x={n.x} y={n.y} width={n.w} height={n.h} rx={n.trigger ? 26 : 12} />
        <g className="fc__ico" dangerouslySetInnerHTML={{ __html: icon(n.icon, n.x + n.w / 2 - 22, n.y + n.h / 2 - 22, 44) }} />
        {!n.trigger && <circle className="fc__port" cx={n.x} cy={n.y + n.h / 2} r="7" />}
        <circle className="fc__port" cx={n.x + n.w} cy={n.y + n.h / 2} r="7" />
        {id === 'qualify' && <rect className="fc__diamond" x={bottom(n)[0] - 7} y={bottom(n)[1] - 7} width="14" height="14" transform={`rotate(45 ${bottom(n)[0]} ${bottom(n)[1]})`} />}
        <text className="fc__label" x={n.x + n.w / 2} y={n.y + n.h + (id === 'qualify' ? 44 : 34)} textAnchor="middle">{text(n.label)}</text>
        <g className="fc__check" transform={`translate(${n.x + n.w - 14} ${n.y + 14})`}><circle r="12" fill="#D7FF3B" /><path d="M-5 0l3.5 3.5L5-4" /></g>
      </g>
    );
  };

  const end = out(N.follow);
  return (
    <div className="fc" ref={ref} aria-hidden="true">
      <div className="fc__stage">
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" focusable="false">
          <defs>
            <pattern id="fc-dots" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.3" /></pattern>
            <radialGradient id="fc-glow"><stop offset="0" stopColor="#D7FF3B" stopOpacity=".95" /><stop offset="1" stopColor="#D7FF3B" stopOpacity="0" /></radialGradient>
          </defs>
          <rect className="fc__grid" x="-900" y="-500" width={W + 1800} height={H + 1000} fill="url(#fc-dots)" />

          {/* dashed sub-connections to the model */}
          {Object.entries(dashed).map(([k, d]) => <path key={k} className="fc__dash" data-model={k} d={d} />)}

          {/* connectors */}
          {Object.entries(E).map(([k, d]) => <path key={k} className="fc__edge" data-edge={k} d={d} />)}
          {Object.entries(E).map(([k, d]) => <path key={'l' + k} className="fc__lit" data-lit={k} d={d} />)}
          <path className="fc__edge" d={`M${end[0]} ${end[1]} L${end[0] + 70} ${end[1]}`} />
          <g className="fc__plus" transform={`translate(${end[0] + 92} ${end[1]})`}><rect x="-20" y="-20" width="40" height="40" rx="8" /><path d="M-8 0h16M0 -8v16" /></g>

          {/* model node */}
          <g className="fc__model">
            <circle className="fc__modelring" cx={model.cx} cy={model.cy} r={model.r + 12} />
            <circle className="fc__modelcore" cx={model.cx} cy={model.cy} r={model.r} />
            <g className="fc__modelglyph" transform={`translate(${model.cx} ${model.cy})`}>
              <circle r="15" /><path d="M-6 -2a6 6 0 1 1 6 8v6" /><circle cy="15" r="1.6" />
            </g>
            <text className="fc__modellabel" x={model.cx + model.r + 26} y={model.cy + 8}>{text(modelLabel)}</text>
          </g>

          {Object.keys(N).map((id) => <Node key={id} id={id} />)}

          {[0, 1, 2, 3].map((i) => (
            <g key={i} className="fc__packet" style={{ opacity: 0 }}>
              <circle r="22" fill="url(#fc-glow)" /><circle r="7" className="fc__pkt" />
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
