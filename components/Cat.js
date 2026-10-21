'use client';
import { useEffect, useRef, useState } from 'react';

/**
 * A small sleeping cat that lives on the bottom edge of the screen.
 * When the pointer comes near (or the visitor taps near it), it startles,
 * runs to the other side of the screen and curls up asleep again.
 * Purely decorative: aria-hidden, never intercepts clicks.
 */
const WAKE_RADIUS = 130;   // px from the cat's centre
const SPEED = 520;         // px per second while running
const ALERT_MS = 320;      // time it spends startled before running

export default function Cat() {
  const ref = useRef(null);
  const st = useRef({ mode: 'sleep', x: 0, timer: 0 });
  const [view, setView] = useState({ mode: 'sleep', x: null, dir: 1, dur: 0 });

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const width = () => (ref.current ? ref.current.offsetWidth : 96);
    const clamp = (x) => Math.max(8, Math.min(window.innerWidth - width() - 8, x));
    const s = st.current;
    s.x = clamp(window.innerWidth * 0.06);
    setView({ mode: 'sleep', x: s.x, dir: 1, dur: 0 });

    const sleep = () => { s.mode = 'sleep'; setView((v) => ({ ...v, mode: 'sleep', dur: 0 })); };

    const flee = (px) => {
      if (s.mode !== 'sleep') return;
      s.mode = 'alert';
      setView((v) => ({ ...v, mode: 'alert' }));
      s.timer = window.setTimeout(() => {
        const W = window.innerWidth, w = width();
        // run to the far side of the screen, away from the pointer
        const goRight = px < s.x + w / 2;
        const target = clamp(goRight ? W * (0.62 + Math.random() * 0.3) : W * (0.04 + Math.random() * 0.28));
        const dur = Math.max(450, (Math.abs(target - s.x) / SPEED) * 1000);
        if (reduce) {
          s.x = target; s.mode = 'fade';
          setView({ mode: 'fade', x: target, dir: goRight ? 1 : -1, dur: 0 });
          s.timer = window.setTimeout(sleep, 600);
          return;
        }
        s.mode = 'run';
        setView({ mode: 'run', x: target, dir: goRight ? 1 : -1, dur });
        s.x = target;
        s.timer = window.setTimeout(sleep, dur + 60);
      }, reduce ? 0 : ALERT_MS);
    };

    const near = (e) => {
      if (!ref.current || s.mode !== 'sleep') return;
      const r = ref.current.getBoundingClientRect();
      const d = Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2));
      if (d < WAKE_RADIUS) flee(e.clientX);
    };
    const onResize = () => { s.x = clamp(s.x); setView((v) => ({ ...v, x: s.x, dur: 0 })); };

    window.addEventListener('pointermove', near, { passive: true });
    window.addEventListener('pointerdown', near, { passive: true });
    window.addEventListener('resize', onResize);
    return () => {
      window.clearTimeout(s.timer);
      window.removeEventListener('pointermove', near);
      window.removeEventListener('pointerdown', near);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  if (view.x == null) return null;
  return (
    <div
      ref={ref}
      className={`cat cat--${view.mode}`}
      aria-hidden="true"
      style={{ transform: `translateX(${view.x}px)`, transitionDuration: `${view.dur}ms` }}
    >
      <div className="cat__flip" style={{ transform: `scaleX(${view.dir})` }}>
        {/* curled up, asleep (eyes switch open when startled) */}
        <svg className="cat__pose cat__pose--sleep" viewBox="0 0 120 80">
          <ellipse className="cat__shadow" cx="62" cy="77" rx="44" ry="3" />
          <g className="cat__breathe">
            <path className="cat__tail-o" d="M100 64c14 1 15 12 2 13H54" />
            <path className="cat__tail" d="M100 64c14 1 15 12 2 13H54" />
            <ellipse className="cat__fur" cx="64" cy="58" rx="38" ry="18" />
            <path className="cat__stripe" d="M66 41q5 7 0 15M78 43q5 7 0 14M54 42q5 7 0 15" />
          </g>
          <g className="cat__head">
            <path className="cat__fur" d="M17 47 19 33l9 9M33 41l7-11 4 13" />
            <circle className="cat__fur" cx="30" cy="57" r="16" />
            <path className="cat__eye-closed" d="M22 57q3.5 3.5 7 0M33 57q3.5 3.5 7 0" />
            <g className="cat__eye-open"><circle cx="25.5" cy="56" r="2.6" /><circle cx="36.5" cy="56" r="2.6" /></g>
            <path className="cat__nose" d="M29.5 61.5h3l-1.5 1.8z" />
            <path className="cat__whisker" d="M14 61h-8M14 64l-7 2M46 61h8M46 64l7 2" />
          </g>
        </svg>

        {/* running, side view facing right */}
        <svg className="cat__pose cat__pose--run" viewBox="0 0 120 80">
          <ellipse className="cat__shadow" cx="62" cy="77" rx="40" ry="3" />
          <g className="cat__bob">
            <path className="cat__tail-o" d="M34 46C20 42 13 31 18 19" />
            <path className="cat__tail" d="M34 46C20 42 13 31 18 19" />
            {/* each leg swings from its own hip */}
            <path className="cat__leg cat__leg--a" d="M42 52v22" />
            <path className="cat__leg cat__leg--b" d="M50 52v22" />
            <path className="cat__leg cat__leg--b" d="M74 52v22" />
            <path className="cat__leg cat__leg--a" d="M82 52v22" />
            <ellipse className="cat__fur" cx="62" cy="48" rx="31" ry="13" />
            <path className="cat__stripe" d="M54 36q4 6 0 12M66 36q4 6 0 12" />
            <path className="cat__fur" d="M91 24l1-13 8 9M101 21l6-11 2 13" />
            <circle className="cat__fur" cx="100" cy="33" r="12" />
            <circle className="cat__eye-run" cx="104" cy="31" r="2.3" />
            <path className="cat__nose" d="M110.2 36h2.6l-1.3 1.6z" />
            <path className="cat__whisker" d="M112 37h7M112 40l6 2" />
          </g>
        </svg>
      </div>
      <span className="cat__z" />
      <span className="cat__z cat__z--2" />
      <span className="cat__z cat__z--3" />
    </div>
  );
}
