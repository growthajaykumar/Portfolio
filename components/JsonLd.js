export default function JsonLd({ items = [] }) {
  return items.map((json, i) => (
    <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />
  ));
}
