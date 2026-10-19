import H from './H';
import { text } from '../lib/site';

function numParts(v) {
  // Split a figure like "−62%" or "0 hrs/wk" into a countable number and its fixed parts.
  const t = text(v);
  const m = t.match(/^([^\d]*)(\d+(?:\.\d+)?)(.*)$/);
  if (!m || m[2].includes('.')) return null;
  return { pre: m[1], n: m[2], suf: m[3] };
}

function Figure({ value }) {
  const p = numParts(value);
  return <H as="b" className="dossier__fig" html={value} {...(p ? { 'data-count': p.n, 'data-pre': p.pre, 'data-suf': p.suf } : {})} />;
}

/** Case studies as dossiers. layout="rail" scrolls sideways (home); "stack" lists them (work). */
export default function Dossiers({ cases, layout = 'stack', labelledBy }) {
  return (
    <div className={`dossiers dossiers--${layout}`} {...(layout === 'rail' ? { tabIndex: 0, role: 'region', 'aria-labelledby': labelledBy } : {})}>
      {cases.map((c, i) => (
        <article key={i} className="dossier" data-reveal>
          <header className="dossier__head">
            <span className="dossier__i" aria-hidden="true">{String(i + 1).padStart(2, '0')}<small>/{String(cases.length).padStart(2, '0')}</small></span>
            <ul className="tags">{c.chips.map((t) => <H as="li" key={t} html={t} />)}</ul>
          </header>
          <H as="h3" className="dossier__t" html={c.title} />
          <H as="p" className="dossier__d" html={c.desc} />
          <dl className="dossier__nums">
            {c.nums.map((n, j) => (
              <div key={j}>
                <dt><H html={n.label} /></dt>
                <dd><Figure value={n.value} /></dd>
              </div>
            ))}
          </dl>
        </article>
      ))}
    </div>
  );
}
