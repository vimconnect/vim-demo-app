/** Counted on visible text (innerText), not raw markup — the number a developer sees in the editor's live counter. */
export declare const MAX_APP_DESCRIPTION_LENGTH = 4000;
/**
 * The developer name shown on the public app page — "by <name>" under the app's
 * title, and the publisher line on every card.
 *
 * Capped because it is unbounded developer-controlled text rendered into fixed
 * layouts: the card's publisher line is a single ellipsizing row and the hero's
 * meta row sits beside pills, so a name of several hundred characters pushed the
 * card's own chips out of place. 80 matches `shortDescription`, the other
 * single-line listing field, so the two behave the same way.
 */
export declare const MAX_DEVELOPER_NAME_LENGTH = 80;
/**
 * Guards the raw HTML payload size, not the visible-text length above — kept
 * generous relative to it since semantic markup (headings/lists/links) adds
 * overhead on top of the visible characters it wraps. Purely a bloat/DoS
 * backstop; the real 4000-character rule is enforced server-side on
 * sanitized plain text (see AppDescriptionSanitizerUtils).
 */
export declare const MAX_APP_DESCRIPTION_HTML_LENGTH = 20000;
/**
 * Tags the Store Page rich-text editor's toolbar can produce. Enforced twice —
 * server-side with `sanitize-html` on every save (AppDescriptionSanitizerUtils,
 * the real security boundary, since the save endpoint accepts raw JSON from
 * any authenticated caller) and client-side with DOMPurify on every render
 * (defense in depth for stale/legacy data). Both import this one list instead
 * of keeping their own copy, so the two enforcement points can't drift apart.
 */
export declare const ALLOWED_APP_DESCRIPTION_TAGS: string[];
/**
 * True only when `value` starts with one of this field's own block tags —
 * i.e. it's plausibly real output from `AppDescriptionSanitizerUtils.sanitize`
 * or the editor's own `getHTML()`, both of which always wrap content in at
 * least one block element. False for legacy plain text saved before this
 * field held HTML: a plain `<textarea>` value might *contain* a `<` (e.g.
 * "A<B ranges"), but organic text starting with a byte-for-byte match of
 * `<p>`/`<h2>`/etc. is vanishingly unlikely. This exists because the field
 * carries both formats with no schema-level marker distinguishing them —
 * treating old plain text as HTML feeds it to an HTML-rendering sink
 * (`RichTextContent`'s DOMPurify pass), which silently drops anything from
 * the first `<letter` it finds onward.
 */
export declare function looksLikeAppDescriptionHtml(value: string): boolean;
/**
 * Whether rich-text HTML has any VISIBLE content.
 *
 * A cleared TipTap editor serialises as `<p></p>` — truthy, and indistinguishable
 * from real content to any `if (value)` check. `<p><br></p>` and `<p>&nbsp;</p>`
 * behave the same way.
 *
 * Shared because two surfaces need the identical answer for opposite reasons and
 * had a copy each: the submission form deciding whether a required rich-text field
 * is answered, and the public app page deciding whether a Pricing section exists
 * at all. Two copies of "what counts as empty" drifting apart means a developer
 * clears a field, the form agrees it is blank, and the listing still renders an
 * empty section — or the reverse.
 */
export declare function hasVisibleRichText(value: string | null | undefined): boolean;
/**
 * https only — no http, javascript:/data:/vbscript:, or protocol-relative.
 * This is a public marketplace listing clinic staff click through from; an
 * unencrypted http:// link is a real risk on that surface (not just a
 * generic scheme allowlist), not merely "less strict than it could be" —
 * so it's excluded here even though the also-shared safeUrlSchema.ts
 * (privacy policy, ToS, video links, ...) still permits http for those
 * lower-stakes, non-listing fields.
 */
export declare const ALLOWED_APP_DESCRIPTION_LINK_SCHEMES: string[];
/**
 * True only for an absolute URL starting with one of the allowed schemes
 * (`https://...`) — never for a bare relative path (`/accounts/settings`),
 * a protocol-relative URL (`//evil.com`), or an explicit disallowed scheme
 * (`http://`, `mailto:`). A scheme-less href isn't "safe by omission": every
 * enforcement point (editor autolink, save-time sanitizer, render-time
 * sanitizer) shares this one check so none of them can drift into being
 * more permissive than the others — a relative href that the backend once
 * kept while the render pass silently dropped was exactly this kind of gap.
 */
export declare function isAllowedAppDescriptionLinkHref(href: string, allowedSchemes?: readonly string[]): boolean;
/**
 * Forced on every surviving `<a>` at all three enforcement points — the
 * backend sanitizer's `transformTags`, the frontend render-time DOMPurify
 * hook, and the editor's own Link extension config — regardless of what a
 * caller or the author's pasted markup specified. Shared so dropping
 * `noreferrer` or `target` at one site can't silently diverge from the
 * other two, the same drift class as scheme/tag allowlist drift.
 */
export declare const APP_DESCRIPTION_LINK_ATTRS: {
    readonly target: "_blank";
    readonly rel: "noopener noreferrer";
};
/**
 * Decodes the fixed entity set above. Safe ONLY for a value already destined
 * for a plain text sink (a React text node, auto-escaped) — decoding un-does
 * the HTML-escaping that made a string safe to parse as HTML in the first
 * place, so never feed this into `dangerouslySetInnerHTML` or an equivalent
 * HTML-rendering sink.
 */
export declare function decodeAppDescriptionEntities(text: string): string;
//# sourceMappingURL=app-description.d.ts.map