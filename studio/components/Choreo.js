'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Page choreography with no dependencies:
 *  - [data-reveal]  fades/rises in once when it enters the viewport
 *  - [data-count]   counts up to its own final value (the server-rendered text)
 * Everything is visible without JS, and nothing moves under prefers-reduced-motion.
 */
export default function Choreo() {
  const path = usePathname();
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const reveal = [...document.querySelectorAll('[data-reveal]:not(.is-in)')];
    const counts = [...document.querySelectorAll('[data-count]:not(.is-counted)')];
    if (reduce || !('IntersectionObserver' in window)) {
      reveal.forEach((el) => el.classList.add('is-in'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    reveal.forEach((el) => io.observe(el));

    const co = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const el = e.target; co.unobserve(el); el.classList.add('is-counted');
        const final = el.textContent;
        const to = parseFloat(el.dataset.count);
        const pre = el.dataset.pre || '', suf = el.dataset.suf || '';
        const t0 = performance.now(), dur = 1400;
        const step = (now) => {
          const p = Math.min((now - t0) / dur, 1), k = 1 - Math.pow(1 - p, 3);
          el.textContent = p < 1 ? pre + Math.round(to * k) + suf : final;
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
    }, { threshold: 0.6 });
    counts.forEach((el) => co.observe(el));
    return () => { io.disconnect(); co.disconnect(); };
  }, [path]);
  return null;
}
