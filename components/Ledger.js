import H from './H';

/** Stats as a ledger line: big serif figures over mono captions, ruled columns. */
export default function Ledger({ stats, className = '' }) {
  return (
    <dl className={`ledger ${className}`.trim()}>
      {stats.map((s, i) => (
        <div className="ledger__cell" key={i} data-reveal style={{ '--d': `${i * 80}ms` }}>
          <dt className="ledger__l"><H html={s.label} /></dt>
          <dd className="ledger__v">
            <H html={s.value} {...(s.count ? { 'data-count': s.count, 'data-suf': s.suffix, 'data-pre': s.prefix } : {})} />
          </dd>
        </div>
      ))}
    </dl>
  );
}
