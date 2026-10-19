import H from './H';

/** Process steps rise left to right — each one sits higher than the last, like the curve it builds. */
export default function Staircase({ steps, numKey = 'num', titleKey = 'title' }) {
  return (
    <ol className="stairs" style={{ '--count': steps.length }}>
      {steps.map((s, i) => (
        <li key={i} className="stairs__step" style={{ '--i': i }} data-reveal>
          <H className="stairs__n" html={s[numKey]} />
          {s[titleKey] && <H as="h3" className="stairs__t" html={s[titleKey]} />}
          <H as="p" className="stairs__d" html={s.desc} />
        </li>
      ))}
    </ol>
  );
}
