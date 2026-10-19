/**
 * The brand mark's wave, drawn long: the signal line that runs from plan to result.
 * A lime packet rides the line (SVG animateMotion, so it scales with the drawing).
 * Under prefers-reduced-motion the packet is hidden by CSS.
 */
const D = 'M0 120 C 180 120 240 40 420 40 S 660 150 840 150 S 1080 70 1260 70 S 1440 110 1600 104';
export default function Wave({ id, className = '' }) {
  return (
    <div className={`wave ${className}`.trim()} aria-hidden="true">
      <svg viewBox="0 0 1600 190" preserveAspectRatio="xMidYMid meet" focusable="false">
        <path id={id} d={D} />
        <circle className="wave__packet" r="7">
          <animateMotion dur="8s" repeatCount="indefinite" rotate="auto"><mpath href={`#${id}`} /></animateMotion>
        </circle>
      </svg>
    </div>
  );
}
