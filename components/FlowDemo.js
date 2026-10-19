'use client';
import { useEffect, useRef, useState } from 'react';
import H from './H';

/**
 * "See it run" — ported from the original site (main branch): five node boxes on a wavy wire,
 * a dot travelling the wire, nodes lighting in sequence, and a log line that prints each step.
 * Fix vs. original: the dot's offset-path is rescaled to the wire's real width (the original
 * hard-coded a 1200px path, so the dot drifted off the wire at other widths).
 */
const WIRE = [[110, 20], [230, 20, 230, 10, 350, 10], [470, 10, 470, 30, 590, 30], [710, 30, 710, 14, 830, 14], [950, 14, 950, 24, 1070, 24], [1110, 24, 1110, 20, 1140, 20]];
const D = 'M110,20 C230,20 230,10 350,10 C470,10 470,30 590,30 C710,30 710,14 830,14 C950,14 950,24 1070,24 C1110,24 1110,20 1140,20';

function scaledPath(k) {
  const [m, ...cs] = WIRE;
  const x = (v) => Math.round(v * k * 10) / 10, y = (v) => v + 13; // wire svg sits 13px down
  return `M${x(m[0])},${y(m[1])} ` + cs.map((c) => `C${x(c[0])},${y(c[1])} ${x(c[2])},${y(c[3])} ${x(c[4])},${y(c[5])}`).join(' ');
}

export default function FlowDemo({ flow }) {
  const ref = useRef(null), dot = useRef(null);
  const [idx, setIdx] = useState(-1);

  useEffect(() => {
    const el = ref.current;
    const size = () => { if (dot.current) dot.current.style.offsetPath = `path("${scaledPath(el.clientWidth / 1200)}")`; };
    size();
    const ro = new ResizeObserver(size); ro.observe(el);

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let timer = null, n = 0;
    const tick = () => { setIdx(n % flow.steps.length); n++; };
    const start = () => { if (timer) return; tick(); if (!reduce) timer = setInterval(tick, 1100); };
    const stop = () => { clearInterval(timer); timer = null; };
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()), { threshold: 0.35 });
    io.observe(el);
    return () => { io.disconnect(); ro.disconnect(); stop(); };
  }, [flow.steps.length]);

  return (
    <>
      <div className="flow" ref={ref} data-reveal>
        <svg className="flow__wires" viewBox="0 0 1200 40" preserveAspectRatio="none" aria-hidden="true">
          <path className="flow__wire" d={D} />
        </svg>
        <div className="flow__dot" ref={dot} aria-hidden="true" />
        <ol className="flow__nodes">
          {flow.nodes.map((n, i) => (
            <li key={i} className="flow__node" style={{ '--i': i }}>
              <span className="flow__ico" dangerouslySetInnerHTML={{ __html: n.icon }} />
              <H className="flow__label" html={n.label} />
            </li>
          ))}
        </ol>
      </div>
      <div className="flow__log" data-reveal>
        <span className="flow__live" aria-hidden="true" />
        <span className="flow__log-line" aria-live="polite">{idx < 0 ? <H html={flow.log} /> : flow.steps[idx]}</span>
        <span className="flow__caret" aria-hidden="true" />
      </div>
    </>
  );
}
