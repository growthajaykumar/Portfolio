'use client';
import { useEffect, useRef, useState } from 'react';
import H from './H';

/** "See it run": a lead travels the pipeline; the console prints each step (copy from the original script). */
export default function FlowDemo({ flow }) {
  const ref = useRef(null);
  const [idx, setIdx] = useState(-1);
  useEffect(() => {
    const el = ref.current;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let timer = null, n = 0;
    const tick = () => { setIdx(n % flow.steps.length); n++; };
    const start = () => { if (timer) return; tick(); if (!reduce) timer = setInterval(tick, 1100); };
    const stop = () => { clearInterval(timer); timer = null; };
    if (!('IntersectionObserver' in window)) { start(); return stop; }
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()), { threshold: 0.35 });
    io.observe(el);
    return () => { io.disconnect(); stop(); };
  }, [flow.steps.length]);

  const line = idx < 0 ? null : flow.steps[idx];
  return (
    <div className="flow" ref={ref} data-reveal>
      <ol className="flow__track" style={{ '--p': idx < 0 ? 0 : idx / (flow.nodes.length - 1) }}>
        {flow.nodes.map((n, i) => (
          <li key={i} className={`flow__node${i === idx ? ' is-on' : ''}${i < idx ? ' is-done' : ''}`}>
            <span className="flow__ico" dangerouslySetInnerHTML={{ __html: n.icon }} />
            <span className="flow__n" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
            <H className="flow__label" html={n.label} />
          </li>
        ))}
      </ol>
      <p className="flow__log" aria-live="polite">
        <span className="flow__prompt" aria-hidden="true">&gt;</span>
        {line == null ? <H html={flow.log} /> : <span>{line}</span>}
        <span className="flow__caret" aria-hidden="true" />
      </p>
    </div>
  );
}
