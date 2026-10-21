'use client';
import { useEffect, useRef, useState } from 'react';

/**
 * A little rabbit that naps anywhere on the visible screen. When the pointer
 * comes near (or the visitor taps near it) it sits up, then hops away in bouncy
 * arcs to a spot far from the pointer, and falls asleep again.
 * Decorative only: aria-hidden and pointer-events: none.
 */
const WAKE_RADIUS = 140;   // px from the rabbit's centre
const HOP_LEN = 105;       // px covered per hop
const HOP_MS = 270;        // duration of one hop
const HOP_HEIGHT = 34;     // px height of a hop arc
const ALERT_MS = 360;      // time spent sitting up before hopping

export default function Rabbit() {
  const ref = useRef(null);
  const [mode, setMode] = useState('sleep');
  const [dir, setDir] = useState(1);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = ref.current;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const s = { mode: 'sleep', x: 0, y: 0, raf: 0, timer: 0 };
    const size = () => ({ w: el.offsetWidth || 84, h: el.offsetHeight || 76 });
    const bounds = () => {
      const { w, h } = size();
      const top = 96; // stay clear of the header
      return { x0: 10, x1: window.innerWidth - w - 10, y0: top, y1: Math.max(top, window.innerHeight - h - 10) };
    };
    const place = (x, y, lift = 0, squash = 1) => {
      el.style.transform = `translate3d(${x}px, ${y - lift}px, 0)`;
      el.style.setProperty('--squash', squash);
    };
    const set = (m) => { s.mode = m; setMode(m); };

    // start asleep in the lower-left area of the screen
    const b0 = bounds();
    s.x = b0.x0 + (b0.x1 - b0.x0) * 0.06; s.y = b0.y0 + (b0.y1 - b0.y0) * 0.86;
    place(s.x, s.y); setReady(true);

    function pickSpot(px, py) {
      // best of a dozen random spots: farthest from the pointer, not too close to where it is now
      const b = bounds(); let best = null, bestScore = -1;
      for (let i = 0; i < 12; i++) {
        const x = b.x0 + Math.random() * (b.x1 - b.x0), y = b.y0 + Math.random() * (b.y1 - b.y0);
        const away = Math.hypot(x - px, y - py), move = Math.hypot(x - s.x, y - s.y);
        const score = away + Math.min(move, 300) * 0.3;
        if (move > 160 && score > bestScore) { best = [x, y]; bestScore = score; }
      }
      return best || [b.x0 + (b.x1 - b.x0) * Math.random(), b.y0 + (b.y1 - b.y0) * Math.random()];
    }

    function hopTo(tx, ty) {
      const sx = s.x, sy = s.y, dist = Math.hypot(tx - sx, ty - sy);
      const hops = Math.max(2, Math.round(dist / HOP_LEN)), total = hops * HOP_MS;
      setDir(tx >= sx ? 1 : -1);
      if (reduce) {
        set('fade'); s.x = tx; s.y = ty; place(tx, ty);
        s.timer = window.setTimeout(() => set('sleep'), 650);
        return;
      }
      set('hop');
      const t0 = performance.now();
      const step = (now) => {
        const t = Math.min(1, (now - t0) / total);
        const hopIdx = Math.min(hops - 1, Math.floor(t * hops)), p = t * hops - hopIdx; // progress within this hop
        const x = sx + (tx - sx) * t, y = sy + (ty - sy) * t;
        const lift = Math.sin(Math.PI * p) * HOP_HEIGHT;
        const squash = p < 0.12 ? 0.86 + p : p > 0.88 ? 0.86 + (1 - p) : 1.04;
        s.x = x; s.y = y; place(x, y, lift, squash);
        if (t < 1) s.raf = requestAnimationFrame(step);
        else { place(tx, ty); set('settle'); s.timer = window.setTimeout(() => set('sleep'), 420); }
      };
      s.raf = requestAnimationFrame(step);
    }

    function flee(px, py) {
      if (s.mode !== 'sleep') return;
      set('alert');
      setDir(px > s.x + size().w / 2 ? -1 : 1); // look toward where it's about to go
      s.timer = window.setTimeout(() => { const [tx, ty] = pickSpot(px, py); hopTo(tx, ty); }, reduce ? 0 : ALERT_MS);
    }

    const near = (e) => {
      if (s.mode !== 'sleep') return;
      const { w, h } = size();
      const d = Math.hypot(e.clientX - (s.x + w / 2), e.clientY - (s.y + h / 2));
      if (d < WAKE_RADIUS) flee(e.clientX, e.clientY);
    };
    const onResize = () => {
      const b = bounds();
      s.x = Math.max(b.x0, Math.min(b.x1, s.x)); s.y = Math.max(b.y0, Math.min(b.y1, s.y));
      if (s.mode === 'sleep') place(s.x, s.y);
    };

    window.addEventListener('pointermove', near, { passive: true });
    window.addEventListener('pointerdown', near, { passive: true });
    window.addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(s.raf); window.clearTimeout(s.timer);
      window.removeEventListener('pointermove', near);
      window.removeEventListener('pointerdown', near);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <div ref={ref} className={`bun bun--${mode}${ready ? '' : ' bun--hidden'}`} aria-hidden="true">
      <div className="bun__flip" style={{ transform: `scaleX(${dir})` }}>
        <div className="bun__squash">
          {/* asleep: a round loaf, ears laid back */}
          <svg className="bun__pose bun__pose--sleep" viewBox="0 0 100 90">
            <ellipse className="bun__shadow" cx="50" cy="87" rx="36" ry="3" />
            <g className="bun__breathe">
              <circle className="bun__fur" cx="17" cy="67" r="8" />
              <ellipse className="bun__fur" cx="48" cy="66" rx="32" ry="21" />
              <ellipse className="bun__fur" cx="45" cy="44" rx="22" ry="6.5" transform="rotate(-8 45 44)" />
              <ellipse className="bun__inner" cx="47" cy="44.4" rx="15" ry="2.6" transform="rotate(-8 47 44.4)" />
            </g>
            <ellipse className="bun__fur" cx="72" cy="84" rx="8" ry="3.6" />
            <circle className="bun__fur" cx="74" cy="60" r="16" />
            <ellipse className="bun__fur" cx="56" cy="49" rx="20" ry="6" transform="rotate(-16 56 49)" />
            <ellipse className="bun__inner" cx="58" cy="49" rx="13" ry="2.4" transform="rotate(-16 58 49)" />
            <path className="bun__eye-closed" d="M73 59q3.5 3 7 0" />
            <circle className="bun__blush" cx="80" cy="66" r="3.4" />
            <path className="bun__nose" d="M87.5 61.5l3.2.2-1.7 2.2z" />
          </svg>

          {/* awake: sitting up, ears straight */}
          <svg className="bun__pose bun__pose--alert" viewBox="0 0 100 90">
            <ellipse className="bun__shadow" cx="46" cy="87" rx="30" ry="3" />
            <ellipse className="bun__fur" cx="49" cy="15" rx="5.5" ry="17" transform="rotate(-10 49 15)" />
            <ellipse className="bun__inner" cx="49" cy="17" rx="2.4" ry="11" transform="rotate(-10 49 17)" />
            <ellipse className="bun__fur" cx="64" cy="15" rx="5.5" ry="17" transform="rotate(10 64 15)" />
            <ellipse className="bun__inner" cx="64" cy="17" rx="2.4" ry="11" transform="rotate(10 64 17)" />
            <circle className="bun__fur" cx="24" cy="72" r="8" />
            <ellipse className="bun__fur" cx="44" cy="66" rx="24" ry="21" />
            <ellipse className="bun__fur" cx="56" cy="84" rx="8" ry="3.6" />
            <circle className="bun__fur" cx="58" cy="40" r="16" />
            <circle className="bun__eye" cx="64" cy="38" r="2.8" />
            <circle className="bun__shine" cx="65" cy="37" r=".9" />
            <circle className="bun__blush" cx="67" cy="46" r="3.4" />
            <path className="bun__nose" d="M72.6 42l3 .2-1.6 2.1z" />
          </svg>

          {/* mid-hop: stretched out, ears streaming back */}
          <svg className="bun__pose bun__pose--hop" viewBox="0 0 100 90">
            <ellipse className="bun__fur" cx="58" cy="22" rx="5" ry="16" transform="rotate(-58 58 22)" />
            <ellipse className="bun__fur" cx="62" cy="27" rx="5" ry="15" transform="rotate(-66 62 27)" />
            <ellipse className="bun__inner" cx="62" cy="27" rx="2.2" ry="9.5" transform="rotate(-66 62 27)" />
            <ellipse className="bun__fur" cx="22" cy="66" rx="14" ry="5" transform="rotate(24 22 66)" />
            <circle className="bun__fur" cx="17" cy="48" r="7.5" />
            <ellipse className="bun__fur" cx="46" cy="52" rx="30" ry="15" transform="rotate(-10 46 52)" />
            <ellipse className="bun__fur" cx="76" cy="64" rx="7" ry="4" transform="rotate(30 76 64)" />
            <circle className="bun__fur" cx="78" cy="40" r="14" />
            <circle className="bun__eye" cx="83" cy="38" r="2.6" />
            <circle className="bun__shine" cx="84" cy="37" r=".8" />
            <circle className="bun__blush" cx="85" cy="45" r="3" />
            <path className="bun__nose" d="M91 41l2.8.2-1.5 2z" />
          </svg>
        </div>
      </div>
      <span className="bun__z" />
      <span className="bun__z bun__z--2" />
      <span className="bun__z bun__z--3" />
    </div>
  );
}
