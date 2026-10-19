import H from './H';

/**
 * The three markets as expanding columns: the one you point at (or tab into) takes the room
 * and turns to ink. Everything stays in the DOM and in reading order.
 */
export default function Markets({ items }) {
  return (
    <div className="markets">
      {items.map((m, i) => (
        <article key={i} className="market" tabIndex={0} data-reveal style={{ '--d': `${i * 90}ms` }}>
          <div className="market__top">
            <span className="market__n">{m.num}</span>
            {m.icon && <span className="market__ico" dangerouslySetInnerHTML={{ __html: m.icon }} />}
          </div>
          <H as="h3" className="market__t" html={m.title} />
          <div className="market__body">
            <H as="p" className="market__d" html={m.desc} />
            {m.brands?.length > 0 && (
              <div className="market__brands">
                <H as="p" className="market__bl" html={m.brandsLabel} />
                <ul>{m.brands.map((b) => <H as="li" key={b} html={b} />)}</ul>
              </div>
            )}
            <ul className="tags">{m.tags.map((t) => <H as="li" key={t} html={t} />)}</ul>
          </div>
        </article>
      ))}
    </div>
  );
}
