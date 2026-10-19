import site, { toMetadata } from '../../lib/site';
import H from '../../components/H';
import Mark from '../../components/Mark';
import SmartLink from '../../components/SmartLink';
import JsonLd from '../../components/JsonLd';
import PageHero from '../../components/PageHero';
import ContactForm from '../../components/ContactForm';
import Faq from '../../components/Faq';

const page = site.contact;
export const metadata = toMetadata(page.meta);

export default function Contact() {
  const { direct, fit, form } = page;
  return (
    <>
      <JsonLd items={page.meta.jsonld} />
      <PageHero hero={page.hero} variant="phero--contact" />
      <section className="sec sec--tight shell contact">
        <div className="contact__direct">
          <Mark label={direct.label} />
          <H as="h2" className="contact__t" html={direct.title} />
          <H as="p" className="contact__lede" html={direct.lede} />
          <ul className="channels">
            {direct.items.map((c, i) => {
              const inner = (
                <>
                  <span className="channels__ico" dangerouslySetInnerHTML={{ __html: c.icon }} />
                  <H as="b" html={c.title} />
                  {c.note && <H as="small" html={c.note} />}
                </>
              );
              return <li key={i}>{c.href ? <SmartLink href={c.href} target={c.target} rel={c.rel} className="channels__a">{inner}</SmartLink> : <div className="channels__a channels__a--static">{inner}</div>}</li>;
            })}
          </ul>
          <div className="fit">
            <H as="p" className="fit__h" html={fit.label} />
            <H as="p" html={fit.text} />
          </div>
        </div>
        <div className="contact__form"><ContactForm form={form} /></div>
      </section>
      <Faq faq={page.faq} n={1} />
    </>
  );
}
