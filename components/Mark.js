/** Section mark in the margin rail: "§ 03 / Selected work". Purely decorative numbering. */
import H from './H';

export default function Mark({ n, label, as = 'p', className = '' }) {
  const Tag = as;
  return (
    <Tag className={`mark ${className}`.trim()}>
      {n != null && <span className="mark__n" aria-hidden="true">({String(n).padStart(2, "0")})</span>}
      <H className="mark__l" html={label} />
    </Tag>
  );
}
