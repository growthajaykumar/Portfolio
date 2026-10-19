import Link from 'next/link';
import H from './H';
import Btn from './Btn';

/** Inner-page opener: breadcrumb, mark, a three-line serif headline, lede on the right. */
export default function PageHero({ hero, aside = null, variant = '' }) {
  return (
    <section className={`phero ${variant}`.trim()}>
      <div className="phero__grid shell" aria-hidden="true">{Array.from({ length: 12 }, (_, i) => <i key={i} />)}</div>
      <div className="shell phero__in">
        {hero.crumbs?.length > 0 && (
          <nav className="crumbs" aria-label="Breadcrumb">
            <ol>
              {hero.crumbs.map((c, i) => (
                <li key={i}>{c.href ? <Link href={c.href}><H html={c.label} /></Link> : <H aria-current="page" html={c.label} />}</li>
              ))}
            </ol>
          </nav>
        )}
        <H as="p" className="phero__label" html={hero.label} />
        <h1 className="phero__h1">
          {hero.h1.map((l, i) => (
            <span key={i} className={`line${l.accent ? ' line--accent' : ''}`}><span className="line__in"><H html={l.html} /></span></span>
          ))}
        </h1>
        <div className="phero__foot">
          {hero.lede && <H as="p" className="phero__lede" html={hero.lede} />}
          {hero.buttons?.length > 0 && (
            <div className="btns">{hero.buttons.map((b, i) => <Btn key={i} link={b} variant={i === 0 ? 'solid' : 'line'} arrow={i === 0} />)}</div>
          )}
          {aside}
        </div>
      </div>
    </section>
  );
}
