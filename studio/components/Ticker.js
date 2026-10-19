import H from './H';

/** Decorative ticker (aria-hidden, as in the original). Items repeat the original's own sequence. */
export default function Ticker({ marquee, big = false, reverse = false }) {
  const loop = Array.from({ length: Math.max(2, marquee.repeat) }, () => marquee.items).flat();
  return (
    <div className={`ticker${big ? ' ticker--big' : ''}${reverse ? ' ticker--rev' : ''}`} aria-hidden="true">
      <div className="ticker__track">
        {[...loop, ...loop].map((t, i) => <H key={i} as="span" className="ticker__item" html={t} />)}
      </div>
    </div>
  );
}
