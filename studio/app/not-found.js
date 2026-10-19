import site, { decode } from '../lib/site';
import PageHero from '../components/PageHero';

const page = site.notFound;
// The original 404's head tags, emitted verbatim (React hoists <title>/<meta> into <head>).
const tags = page.meta.meta.filter((m) => !(m.name === 'theme-color'));

export default function NotFound() {
  return (
    <>
      <title>{decode(page.meta.title)}</title>
      {tags.map((m, i) =>
        m.name
          ? <meta key={i} name={m.name} content={decode(m.content)} />
          : <meta key={i} property={m.property} content={decode(m.content)} />
      )}
      <PageHero hero={page.hero} variant="phero--404" />
    </>
  );
}
