export default function Arrow({ className = 'arrow-ico' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" aria-hidden="true">
      <path d="M4 12h15" /><path d="m13 6 6 6-6 6" />
    </svg>
  );
}
