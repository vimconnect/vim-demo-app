'use client';

const DOCS_ORIGIN = 'https://developer-docs.getvim.ai';

/** Matches `anchorId()` in the docs site, whose ids are a published contract. */
const slug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/** The SDK methods that read one entity. An entity with no API namespace lands on the page itself. */
export const readDocsHref = (entityType: string) =>
  `/docs/app-sdk/api-reference/entity-api#namespace-${slug(entityType)}`;

/** The fields an entity carries — what a writeback may set. */
export const writeDocsHref = (entityType: string) =>
  `/docs/app-sdk/api-reference/entity-types#type-${slug(entityType)}`;

/**
 * A new-tab link to the developer docs.
 *
 * `stopPropagation` keeps the click off an enclosing collapsible header: the SDK's
 * link gate cancels the event before that header would see it, but only while the
 * app's manifest grants `openLinksInNewTab`.
 */
export function DocsLink({ path, label = 'Learn' }: { path: string; label?: string }) {
  return (
    <a
      className="docs-link"
      href={`${DOCS_ORIGIN}${path}`}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
    >
      {label} ↗
    </a>
  );
}
