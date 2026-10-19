import Link from 'next/link';

export default function SmartLink({ href, children, ...props }) {
  if (/^(https?:|mailto:|tel:)/.test(href)) return <a href={href} {...props}>{children}</a>;
  return <Link href={href} {...props}>{children}</Link>;
}
