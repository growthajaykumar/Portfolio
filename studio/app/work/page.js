import site, { toMetadata } from '../../lib/site';
import JsonLd from '../../components/JsonLd';
import PageHero from '../../components/PageHero';
import Ledger from '../../components/Ledger';
import Dossiers from '../../components/Dossiers';
import Faq from '../../components/Faq';
import Cta from '../../components/Cta';

const page = site.work;
export const metadata = toMetadata(page.meta);

export default function Work() {
  return (
    <>
      <JsonLd items={page.meta.jsonld} />
      <PageHero hero={page.hero} />
      <section className="shell sec sec--tight"><Ledger stats={page.stats} /></section>
      <section className="shell sec sec--tight"><Dossiers cases={page.cases} layout="stack" /></section>
      <Faq faq={page.faq} n={1} />
      <Cta cta={site.cta} />
    </>
  );
}
