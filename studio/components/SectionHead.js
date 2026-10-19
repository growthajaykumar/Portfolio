import H from './H';
import Mark from './Mark';

/** Margin-rail section head: mark on the left rail, headline across the content columns. */
export default function SectionHead({ n, label, title, lede, id, className = '' }) {
  return (
    <header className={`shead ${className}`.trim()}>
      <Mark n={n} label={label} />
      <div className="shead__main" data-reveal>
        {title && <H as="h2" id={id} className="shead__t" html={title} />}
        {lede && <H as="p" className="shead__lede" html={lede} />}
      </div>
    </header>
  );
}
