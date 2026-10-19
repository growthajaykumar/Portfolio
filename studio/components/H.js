/**
 * Renders a fragment of original copy. Content arrives as HTML (entities and inline
 * <em>/<strong>/<br> intact) straight from content/site.json, so it is never retyped.
 */
export default function H({ as: Tag = 'span', html, ...props }) {
  if (html == null) return null;
  return <Tag {...props} dangerouslySetInnerHTML={{ __html: html }} />;
}
