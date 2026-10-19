import Link from 'next/link';
import H from './H';
import Arrow from './Arrow';

/** Services as a table of contents: oversized serif titles; the hovered row inverts to ink. */
export default function ServiceIndex({ rows }) {
  return (
    <ol className="sindex">
      {rows.map((r) => (
        <li key={r.href} data-reveal>
          <Link className="sindex__row" href={r.href}>
            <span className="sindex__n">{r.num}</span>
            <H as="h3" className="sindex__t" html={r.title} />
            <span className="sindex__d">
              <H as="span" className="sindex__p" html={r.desc} />
              <span className="tags">{r.tags.map((t) => <H key={t} html={t} />)}</span>
            </span>
            <span className="sindex__more"><H html={r.more} /><Arrow /></span>
          </Link>
        </li>
      ))}
    </ol>
  );
}
