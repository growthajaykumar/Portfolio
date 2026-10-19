import H from './H';
import Mark from './Mark';

/** Questions as an index: sticky label on the left, native <details> on the right. */
export default function Faq({ faq, n }) {
  return (
    <section className="faq shell" aria-label={faq.label}>
      <div className="faq__rail"><Mark n={n} label={faq.label} /></div>
      <div className="faq__list">
        {faq.items.map((it, i) => (
          <details key={i} className="faq__item" data-reveal>
            <summary>
              <span className="faq__i" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
              <H className="faq__q" html={it.q} />
              <span className="faq__x" aria-hidden="true" />
            </summary>
            <H as="p" className="faq__a" html={it.a} />
          </details>
        ))}
      </div>
    </section>
  );
}
