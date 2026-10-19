import Link from 'next/link';
import H from './H';
import Arrow from './Arrow';

/** A button-styled link. Internal hrefs use client navigation; external ones keep target/rel. */
export default function Btn({ link, variant = 'solid', arrow, className = '' }) {
  const cls = `btn btn--${variant} ${className}`.trim();
  const inner = (
    <>
      <H className="btn__label" html={link.label} />
      {arrow !== false && <Arrow className="btn__arrow" />}
    </>
  );
  const external = /^(https?:|mailto:|tel:)/.test(link.href);
  if (external) {
    return <a className={cls} href={link.href} target={link.target} rel={link.rel}>{inner}</a>;
  }
  return <Link className={cls} href={link.href}>{inner}</Link>;
}
