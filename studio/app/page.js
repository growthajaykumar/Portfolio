import site, { toMetadata, text } from '../lib/site';
import H from '../components/H';
import Btn from '../components/Btn';
import Mark from '../components/Mark';
import JsonLd from '../components/JsonLd';
import Ledger from '../components/Ledger';
import Ticker from '../components/Ticker';
import Markets from '../components/Markets';
import ServiceIndex from '../components/ServiceIndex';
import FlowDemo from '../components/FlowDemo';
import Dossiers from '../components/Dossiers';
import Staircase from '../components/Staircase';
import SectionHead from '../components/SectionHead';
import Faq from '../components/Faq';
import Cta from '../components/Cta';
import Wave from '../components/Wave';
import OpsMap from '../components/OpsMap';

const home = site.home;
export const metadata = toMetadata(home.meta);

// Operations map data: plain-text labels taken from existing site copy.
const [web3, estate, fashion] = home.industries.items;
const opsData = {
  core: text(home.marquee.items.find((m) => m === 'n8n Automation')),
  agents: text(home.marquee.items.find((m) => m === 'AI Agents')),
  servicesLabel: text(home.services.label),
  services: site.footer.columns[0].links.map((l) => text(l.label)),
  web3: { title: text(web3.title), leaves: web3.brands.map(text) },
  estate: { title: text(estate.title), leaves: estate.brands.map(text) },
  fashion: { title: text(fashion.title), leaves: [...fashion.brands, ...fashion.tags.filter((t) => ['D2C', 'Retail', 'Lifecycle'].includes(t))].map(text) },
  flowLabel: text(home.flow.label),
  flow: home.flow.nodes.map((n) => text(n.label)),
};

export default function Home() {
  const { hero, thesis, industries, services, flow, work, process } = home;
  return (
    <>
      <JsonLd items={home.meta.jsonld} />

      {/* 01 — Hero: the claim, set like a masthead */}
      <section className="hero">
        <div className="shell hero__in">
          <p className="status"><span className="status__dot" aria-hidden="true" /><H html={hero.pill} /></p>
          <h1 className="hero__h1">
            {hero.h1.map((l, i) => (
              <span key={i} className={`line line--${i + 1}${l.accent ? ' line--accent' : ''}`}><span className="line__in"><H html={l.html} /></span></span>
            ))}
          </h1>
          <div className="hero__foot">
            <H as="p" className="hero__lede" html={hero.lede} />
            <div className="btns">
              {hero.buttons.map((b, i) => <Btn key={i} link={b} variant={i === 0 ? 'solid' : 'line'} arrow={i === 0} />)}
            </div>
          </div>
        </div>
        <OpsMap data={opsData} />
        <div className="shell"><Ledger stats={hero.stats} className="ledger--hero" /></div>
      </section>

      <Ticker marquee={home.marquee} />

      {/* 02 — Thesis: one sentence, given the whole page */}
      <section className="thesis shell">
        <Mark n={1} label={thesis.label} />
        <H as="p" className="thesis__q" html={thesis.quote} data-reveal />
        <ol className="thesis__notes">
          {thesis.notes.map((n, i) => (
            <li key={i} data-reveal style={{ '--d': `${i * 90}ms` }}>
              <span className="thesis__i" aria-hidden="true">{['i', 'ii', 'iii'][i] || i + 1}.</span>
              <H as="p" html={n} />
            </li>
          ))}
        </ol>
      </section>

      {/* 03 — Markets */}
      <section className="sec shell" id="industries">
        <SectionHead n={2} label={industries.label} title={industries.title} lede={industries.lede} />
        <Markets items={industries.items} />
      </section>

      {/* 04 — Services as a contents page */}
      <section className="sec shell">
        <SectionHead n={3} label={services.label} title={services.title} />
        <ServiceIndex rows={services.rows} />
      </section>

      {/* 05 — See it run (ink) */}
      <section className="run">
        <div className="shell run__in">
          <SectionHead n={4} label={flow.label} title={flow.title} lede={flow.lede} className="shead--ink" />
          <FlowDemo flow={flow} />
        </div>
      </section>

      {/* 06 — Selected work: a sideways rail of dossiers */}
      <section className="sec shell">
        <SectionHead n={5} label={work.label} title={work.title} lede={work.lede} id="work-title" />
        <Dossiers cases={work.cases} layout="rail" labelledBy="work-title" />
        <div className="btns btns--end"><Btn link={work.button} variant="line" /></div>
      </section>

      {/* 07 — Process as a rising staircase */}
      <section className="sec shell">
        <SectionHead n={6} label={process.label} title={process.title} />
        <Staircase steps={process.steps} />
      </section>

      <Ticker marquee={home.marquee2} big reverse />

      <Faq faq={home.faq} n={7} />
      <Cta cta={site.cta} />
    </>
  );
}
