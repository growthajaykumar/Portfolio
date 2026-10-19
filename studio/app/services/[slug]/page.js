import Link from 'next/link';
import { notFound } from 'next/navigation';
import site, { toMetadata } from '../../../lib/site';
import H from '../../../components/H';
import Arrow from '../../../components/Arrow';
import JsonLd from '../../../components/JsonLd';
import PageHero from '../../../components/PageHero';
import SectionHead from '../../../components/SectionHead';
import Mark from '../../../components/Mark';
import Faq from '../../../components/Faq';
import Cta from '../../../components/Cta';

export const dynamicParams = false;
export function generateStaticParams() {
  return Object.keys(site.services).map((slug) => ({ slug }));
}
export async function generateMetadata({ params }) {
  const { slug } = await params;
  return site.services[slug] ? toMetadata(site.services[slug].meta) : {};
}

export default async function Service({ params }) {
  const { slug } = await params;
  const page = site.services[slug];
  if (!page) notFound();
  const { overview, deliverables, approach, related } = page;

  const spec = (
    <aside className="spec" aria-label={overview.scopeLabel}>
      <H as="p" className="spec__h" html={overview.scopeLabel} />
      <ul className="spec__list">
        {overview.scope.map((s, i) => <li key={i}><H className="spec__m" html={s.mark} /><H html={s.text} /></li>)}
      </ul>
      <ul className="spec__terms">{overview.terms.map((t) => <H as="li" key={t} html={t} />)}</ul>
    </aside>
  );

  return (
    <>
      <JsonLd items={page.meta.jsonld} />
      <PageHero hero={page.hero} variant="phero--service" />

      <section className="sec shell overview">
        <Mark n={1} label={overview.label} />
        <div className="overview__prose" data-reveal>{overview.paras.map((p, i) => <H as="p" key={i} html={p} />)}</div>
        {spec}
      </section>

      <section className="sec shell">
        <SectionHead n={2} label={deliverables.label} title={deliverables.title} />
        <ol className="deliver">
          {deliverables.items.map((d, i) => (
            <li key={i} className="deliver__item" data-reveal style={{ '--d': `${(i % 2) * 80}ms` }}>
              <span className="deliver__n" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
              <span className="deliver__ico" dangerouslySetInnerHTML={{ __html: d.icon }} />
              <H as="h3" className="deliver__t" html={d.title} />
              <H as="p" className="deliver__d" html={d.desc} />
            </li>
          ))}
        </ol>
      </section>

      <section className="approach">
        <div className="shell approach__in">
          <Mark n={3} label={approach.label} />
          <div className="approach__main">
            <H as="h2" className="approach__t" html={approach.title} data-reveal />
            <div className="approach__prose" data-reveal>{approach.paras.map((p, i) => <H as="p" key={i} html={p} />)}</div>
          </div>
        </div>
      </section>

      <Faq faq={page.faq} n={4} />

      <section className="sec shell related">
        <SectionHead n={5} label={related.label} title={related.title} lede={related.lede} />
        <ul className="related__list">
          {related.items.map((r) => (
            <li key={r.href} data-reveal>
              <Link href={r.href} className="related__a">
                <H as="h3" className="related__t" html={r.title} />
                <H as="p" className="related__d" html={r.desc} />
                <span className="related__more"><H html={r.more} /><Arrow /></span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <Cta cta={site.cta} />
    </>
  );
}
