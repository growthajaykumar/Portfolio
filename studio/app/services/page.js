import site, { toMetadata } from '../../lib/site';
import H from '../../components/H';
import JsonLd from '../../components/JsonLd';
import PageHero from '../../components/PageHero';
import ServiceIndex from '../../components/ServiceIndex';
import SectionHead from '../../components/SectionHead';
import Markets from '../../components/Markets';
import Faq from '../../components/Faq';
import Cta from '../../components/Cta';

const page = site.servicesIndex;
export const metadata = toMetadata(page.meta);

export default function Services() {
  const { industries, engagements } = page;
  return (
    <>
      <JsonLd items={page.meta.jsonld} />
      <PageHero hero={page.hero} />
      <section className="sec sec--tight shell"><ServiceIndex rows={page.rows} /></section>
      <section className="sec shell" id="industries">
        <SectionHead n={1} label={industries.label} title={industries.title} />
        <Markets items={industries.items} />
      </section>
      <section className="sec shell">
        <SectionHead n={2} label={engagements.label} title={engagements.title} lede={engagements.lede} />
        <ol className="shapes">
          {engagements.items.map((e, i) => (
            <li key={i} className="shape" style={{ '--i': i }} data-reveal>
              <span className="shape__ico" dangerouslySetInnerHTML={{ __html: e.icon }} />
              <H className="shape__tag" html={e.tag} />
              <H as="h3" className="shape__t" html={e.title} />
              <H as="p" className="shape__d" html={e.desc} />
            </li>
          ))}
        </ol>
      </section>
      <Faq faq={page.faq} n={3} />
      <Cta cta={site.cta} />
    </>
  );
}
