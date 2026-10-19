import H from './H';
import Btn from './Btn';
import Wave from './Wave';

export default function Cta({ cta }) {
  return (
    <section className="cta" aria-labelledby="cta-title">
      <Wave id="wave-cta" className="cta__wave" />
      <div className="shell cta__in">
        <H as="p" className="cta__label" html={cta.label} />
        <H as="h2" id="cta-title" className="cta__title" html={cta.title} data-reveal />
        <div className="cta__foot" data-reveal>
          <H as="p" className="cta__lede" html={cta.lede} />
          <div className="btns">
            {cta.buttons.map((b, i) => <Btn key={i} link={b} variant={i === 0 ? 'signal' : 'ghost'} arrow={i === 0} />)}
          </div>
        </div>
      </div>
    </section>
  );
}
