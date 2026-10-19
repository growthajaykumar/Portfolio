/**
 * Hero signal: the brand mark's wave drawn as a live pipeline.
 *  - the main strand draws itself in on load
 *  - two ghost strands slowly morph (the signal "breathes")
 *  - three lime leads travel the strand as comets (streak + head)
 *  - five pipeline nodes sit on the strand and flash + ripple as a lead passes
 * Everything runs on one SMIL timeline, so node flashes stay in sync with the comets.
 * Geometry is computed here (pure), so the server renders the full SVG.
 */
const W = 1600, H = 190;
const X = [0, 200, 400, 600, 800, 1000, 1200, 1400, 1600];
const MAIN = [122, 74, 42, 96, 150, 112, 66, 84, 104];
const GHOSTS = [
  [[110, 90, 60, 80, 132, 128, 84, 72, 96], [130, 64, 58, 112, 138, 96, 58, 96, 112], [116, 84, 36, 88, 158, 120, 78, 70, 100]],
  [[136, 60, 52, 108, 160, 100, 56, 98, 116], [104, 92, 70, 76, 126, 138, 92, 64, 90], [128, 70, 46, 102, 146, 104, 70, 90, 108]],
];
const DUR = 7.2;            // seconds for one lead to cross
const LEADS = 3;            // leads per crossing, evenly spaced
const NODES = [0.1, 0.3, 0.5, 0.7, 0.9];

function segments(ys) {
  const p = X.map((x, i) => [x, ys[i]]);
  const at = (i) => p[Math.max(0, Math.min(p.length - 1, i))];
  const segs = [];
  for (let i = 0; i < p.length - 1; i++) {
    const [p0, p1, p2, p3] = [at(i - 1), at(i), at(i + 1), at(i + 2)];
    segs.push([p1, [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6], [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6], p2]);
  }
  return segs;
}
const r = (n) => Math.round(n * 10) / 10;
function toD(segs) {
  return `M${r(segs[0][0][0])} ${r(segs[0][0][1])}` + segs.map(([, c1, c2, e]) => ` C${r(c1[0])} ${r(c1[1])} ${r(c2[0])} ${r(c2[1])} ${r(e[0])} ${r(e[1])}`).join('');
}
function bez([a, b, c, d], t) {
  const m = 1 - t;
  return [0, 1].map((k) => m * m * m * a[k] + 3 * m * m * t * b[k] + 3 * m * t * t * c[k] + t * t * t * d[k]);
}
/** Points at given fractions of the curve's arc length. */
function pointsAt(segs, fracs) {
  const pts = [];
  segs.forEach((s) => { for (let i = 0; i <= 60; i++) pts.push(bez(s, i / 60)); });
  const acc = [0];
  for (let i = 1; i < pts.length; i++) acc.push(acc[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const total = acc[acc.length - 1];
  return fracs.map((f) => { const target = f * total; const i = acc.findIndex((a) => a >= target); return pts[Math.max(0, i)]; });
}

const mainSegs = segments(MAIN);
const MAIN_D = toD(mainSegs);
const NODE_PTS = pointsAt(mainSegs, NODES);
const GAP = DUR / LEADS;

export default function SignalWave({ className = '' }) {
  return (
    <div className={`sig ${className}`.trim()} aria-hidden="true">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" focusable="false">
        <defs>
          <path id="sig-main" d={MAIN_D} />
          <radialGradient id="sig-glow"><stop offset="0" stopColor="#D7FF3B" stopOpacity=".9" /><stop offset="1" stopColor="#D7FF3B" stopOpacity="0" /></radialGradient>
        </defs>

        {/* ghost strands: morph between three shapes */}
        {GHOSTS.map((shapes, g) => {
          const ds = shapes.map((ys) => toD(segments(ys)));
          return (
            <path key={g} className={`sig__ghost sig__ghost--${g + 1}`} d={ds[0]}>
              <animate attributeName="d" dur={g ? '15s' : '11s'} repeatCount="indefinite" calcMode="spline"
                values={[...ds, ds[0]].join(';')} keyTimes="0;.33;.66;1" keySplines=".45 0 .55 1;.45 0 .55 1;.45 0 .55 1" />
            </path>
          );
        })}

        {/* main strand: draws in once */}
        <path d={MAIN_D} className="sig__main" pathLength="1" />

        {/* leads: comet streak + glowing head, evenly spaced on one timeline */}
        {Array.from({ length: LEADS }, (_, i) => (
          <g key={i} className="sig__lead">
            <path d={MAIN_D} className="sig__trail" pathLength="1000" strokeDasharray="90 3000" strokeDashoffset="90">
              <animate attributeName="stroke-dashoffset" from="90" to="-910" dur={`${DUR}s`} begin={`${r(1.2 + i * GAP)}s`} repeatCount="indefinite" />
            </path>
            <g opacity="0">
              <set attributeName="opacity" to="1" begin={`${r(1.2 + i * GAP)}s`} />
              <circle className="sig__glow" r="16" fill="url(#sig-glow)" />
              <circle r="5" className="sig__head" />
              <animateMotion dur={`${DUR}s`} begin={`${r(1.2 + i * GAP)}s`} repeatCount="indefinite"><mpath href="#sig-main" /></animateMotion>
            </g>
          </g>
        ))}

        {/* pipeline nodes: flash and ripple whenever a lead passes (period = GAP) */}
        {NODE_PTS.map(([x, y], i) => {
          const begin = `${r(1.2 + NODES[i] * DUR)}s`;
          return (
            <g key={i} className="sig__node" transform={`translate(${r(x)} ${r(y)})`}>
              <circle className="sig__ring" r="7">
                <animate attributeName="r" values="7;7;30;30" keyTimes="0;.02;.45;1" dur={`${r(GAP)}s`} begin={begin} repeatCount="indefinite" />
                <animate attributeName="opacity" values="0;.7;0;0" keyTimes="0;.02;.45;1" dur={`${r(GAP)}s`} begin={begin} repeatCount="indefinite" />
              </circle>
              <rect className="sig__box" x="-7" y="-7" width="14" height="14">
                <animate attributeName="fill" values="#EEEAE1;#D7FF3B;#D7FF3B;#EEEAE1;#EEEAE1" keyTimes="0;.02;.22;.4;1" dur={`${r(GAP)}s`} begin={begin} repeatCount="indefinite" />
              </rect>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
