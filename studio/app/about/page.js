import site, { toMetadata } from '../../lib/site';
import H from '../../components/H';
import Btn from '../../components/Btn';
import Mark from '../../components/Mark';
import JsonLd from '../../components/JsonLd';
import PageHero from '../../components/PageHero';
import SectionHead from '../../components/SectionHead';
import Ticker from '../../components/Ticker';
import Faq from '../../components/Faq';
import Cta from '../../components/Cta';

const page = site.about;
export const metadata = toMetadata(page.meta);

export default function About() {
  const { profile, path, principles } = page;
  return (
    <>
      <JsonLd items={page.meta.jsonld} />
      <PageHero hero={page.hero} variant="phero--about" />

      <section className="sec shell profile">
        <Mark n={1} label={profile.label} />
        <div className="profile__prose" data-reveal>{profile.paras.map((p, i) => <H as="p" key={i} html={p} />)}</div>
        <aside className="facts" aria-label={profile.factsLabel}>
          <H as="p" className="facts__h" html={profile.factsLabel} />
          <dl>
            {profile.facts.map((f) => (
              <div key={f.term}><H as="dt" html={f.term} /><H as="dd" html={f.value} /></div>
            ))}
          </dl>
          <Btn link={profile.button} variant="solid" className="btn--sm" />
        </aside>
      </section>

      {page.marquee && <Ticker marquee={page.marquee} big />}

      <section className="sec shell">
        <SectionHead n={2} label={path.label} title={path.title} />
        <ol className="timeline">
          {path.steps.map((s, i) => (
            <li key={i} data-reveal style={{ '--d': `${i * 90}ms` }}>
              <H className="timeline__y" html={s.year} />
              <H as="p" className="timeline__d" html={s.desc} />
            </li>
          ))}
        </ol>
      </section>

      <section className="sec shell">
        <SectionHead n={3} label={principles.label} title={principles.title} />
        <ol className="tenets">
          {principles.items.map((p, i) => (
            <li key={i} className="tenet" data-reveal>
              <span className="tenet__n" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
              <H as="h3" className="tenet__t" html={p.title} />
              <H as="p" className="tenet__d" html={p.desc} />
            </li>
          ))}
        </ol>
      </section>

      <Faq faq={page.faq} n={4} />
      <Cta cta={site.cta} />
    </>
  );
}
