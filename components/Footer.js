import Link from 'next/link';
import H from './H';
import SmartLink from './SmartLink';

export default function Footer({ nav, footer }) {
  return (
    <footer className="ftr">
      <div className="shell ftr__in">
        <div className="ftr__about">
          <Link className="brand brand--light" href="/">
            <span className="brand__mark" dangerouslySetInnerHTML={{ __html: nav.brandMark }} />
            <H className="brand__name" html={nav.brand} />
          </Link>
          <H as="p" html={footer.about} />
          <div className="socials">
            {footer.socials.map((s) => (
              <a key={s.href} href={s.href} rel={s.rel} target={s.target} aria-label={s['aria-label']} dangerouslySetInnerHTML={{ __html: s.icon }} />
            ))}
          </div>
        </div>
        {footer.columns.map((c) => (
          <div className="ftr__col" key={c.title}>
            <H as="h2" className="ftr__h" html={c.title} />
            <ul>
              {c.links.map((l) => (
                <li key={l.href + l.label}><SmartLink href={l.href} target={l.target} rel={l.rel}><H html={l.label} /></SmartLink></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="shell ftr__word" aria-hidden="true"><H html={footer.word} /></div>
      <div className="shell ftr__bottom">
        <H html={footer.copyright} />
        <H html={footer.tagline} />
      </div>
    </footer>
  );
}
