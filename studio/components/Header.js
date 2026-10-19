'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import H from './H';
import Arrow from './Arrow';

function isCurrent(path, href) {
  if (href.includes('#')) return false;
  if (href === '/') return path === '/';
  return path === href || path.startsWith(href);
}

export default function Header({ nav }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [stuck, setStuck] = useState(false);

  useEffect(() => { setOpen(false); }, [path]);
  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle('is-menu', open);
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      <a className="skip" href="#main">{nav.skip}</a>
      <header className={`hdr${stuck ? ' is-stuck' : ''}${open ? ' is-open' : ''}`}>
        <div className="shell hdr__in">
          <Link className="brand" href="/" aria-label={nav.brandAria}>
            <span className="brand__mark" dangerouslySetInnerHTML={{ __html: nav.brandMark }} />
            <H className="brand__name" html={nav.brand} />
          </Link>

          <nav className="nav" aria-label="Primary">
            <ul>
              {nav.primary.map((item) => (
                <li key={item.href} className={item.panel ? 'nav__has' : undefined}>
                  <Link href={item.href} aria-current={isCurrent(path, item.href) ? 'page' : undefined}>
                    <H html={item.label} />
                  </Link>
                  {item.panel && (
                    <div className="mega">
                      <ul className="shell mega__in">
                        {item.panel.map((p) => (
                          <li key={p.href}>
                            <Link href={p.href}>
                              <span className="mega__n">{p.num}</span>
                              <H className="mega__t" html={p.title} />
                              <H className="mega__s" html={p.note} />
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          <Link className="btn btn--solid btn--sm hdr__cta" href={nav.cta.href}>
            <H className="btn__label" html={nav.cta.label} /><Arrow className="btn__arrow" />
          </Link>

          <button className="burger" type="button" aria-label={nav.menuLabel} aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpen((o) => !o)}>
            <span /><span />
          </button>
        </div>
      </header>

      <div className={`menu${open ? ' is-open' : ''}`} id="mobile-menu" hidden={!open}>
        <nav className="shell menu__in" aria-label="Mobile">
          {nav.mobile.map((m) => (
            <Link key={m.href + m.label} href={m.href} className={m.sub ? 'menu__sub' : 'menu__main'} aria-current={isCurrent(path, m.href) ? 'page' : undefined}>
              <i aria-hidden="true">{m.num}</i><H html={m.label} />
            </Link>
          ))}
          <Link className="btn btn--signal menu__cta" href={nav.mobileCta.href}>
            <H className="btn__label" html={nav.mobileCta.label} /><Arrow className="btn__arrow" />
          </Link>
        </nav>
      </div>
    </>
  );
}
