import { jsx as _jsx } from "react/jsx-runtime";
import { useMemo } from 'react';
import createDOMPurify from 'dompurify';
import { cva } from 'class-variance-authority';
import { ALLOWED_APP_DESCRIPTION_LINK_SCHEMES, ALLOWED_APP_DESCRIPTION_TAGS, APP_DESCRIPTION_LINK_ATTRS, looksLikeAppDescriptionHtml, } from '@vim-connect/runtime-types/app-description';
import { cn } from './cn.js';
// The link schemes the editor and backend allow; anything else is dropped from href.
const ALLOWED_URI_REGEXP = new RegExp(`^(${ALLOWED_APP_DESCRIPTION_LINK_SCHEMES.join('|')}):\\/\\/`, 'i');
// Own instance, built on first use: its link hook must not reach other DOMPurify callers, and
// there is no `window` at import on a server.
let purifier = null;
function getPurifier() {
    if (!purifier) {
        purifier = createDOMPurify(window);
        purifier.addHook('afterSanitizeAttributes', (node) => {
            if (node.tagName === 'A') {
                for (const [attr, value] of Object.entries(APP_DESCRIPTION_LINK_ATTRS))
                    node.setAttribute(attr, value);
            }
        });
    }
    return purifier;
}
/**
 * Stored app-description rich text (the editor's output), cut to its allowlist: the editor's tags,
 * `href` only, https links opening in a new tab. Runs on display as well as on save. For that
 * format only, an editor's initial content included (TipTap parses it through `innerHTML`); other
 * HTML needs its own policy.
 */
export function sanitizeRichTextHtml(html) {
    return getPurifier().sanitize(html, {
        ALLOWED_TAGS: ALLOWED_APP_DESCRIPTION_TAGS,
        ALLOWED_ATTR: ['href'],
        ALLOWED_URI_REGEXP,
        // DOMPurify keeps data-* and aria-* whatever ALLOWED_ATTR says; turn both off.
        ALLOW_DATA_ATTR: false,
        ALLOW_ARIA_ATTR: false,
    });
}
/** Numbered-list markers by depth (decimal, lower-alpha, lower-roman, repeating), spelled out:
 *  Tailwind only generates classes written in full. */
const NESTED_LIST_MARKERS = [
    '[&_ol_ol]:list-[lower-alpha]',
    '[&_ol_ol_ol]:list-[lower-roman]',
    '[&_ol_ol_ol_ol]:list-[decimal]',
    '[&_ol_ol_ol_ol_ol]:list-[lower-alpha]',
    '[&_ol_ol_ol_ol_ol_ol]:list-[lower-roman]',
    '[&_ol_ol_ol_ol_ol_ol_ol]:list-[decimal]',
    '[&_ol_ol_ol_ol_ol_ol_ol_ol]:list-[lower-alpha]',
    '[&_ol_ol_ol_ol_ol_ol_ol_ol_ol]:list-[lower-roman]',
];
/**
 * The rich-text prose recipe (vim-ai DS → Rich Text): headings, lists, links, quotes and rules on
 * the DS tokens. `RichText` wears it, and so does an editor's content area, so a text reads the same
 * while it's written and once it's shown. Every product's Tailwind scans this package, so these are
 * written the same for Tailwind v3 and v4.
 */
export const richTextVariants = cva([
    'min-w-0 [overflow-wrap:anywhere] [font-family:var(--font-sans)] [color:var(--color-text-primary)]',
    '[&_p]:mx-0 [&_p]:mt-0',
    '[&_h2]:[font-weight:var(--font-semibold)] [&_h3]:[font-weight:var(--font-semibold)] [&_h2]:mx-0 [&_h3]:mx-0',
    '[&_ul]:list-disc [&_ol]:list-decimal [&_li]:list-item [&_ul]:mx-0 [&_ol]:mx-0 [&_ul]:pl-[var(--space-xl)] [&_ol]:pl-[var(--space-xl)]',
    ...NESTED_LIST_MARKERS,
    '[&_a]:[color:var(--color-cyan-text)] [&_a]:underline [&_a]:underline-offset-[2px]',
    '[&_blockquote]:mx-0 [&_blockquote]:my-[var(--space-sm)] [&_blockquote]:pl-[var(--space-md)] [&_blockquote]:border-0 [&_blockquote]:border-l-[3px] [&_blockquote]:border-solid [&_blockquote]:[border-color:var(--color-cyan)] [&_blockquote]:italic [&_blockquote]:[color:var(--color-text-secondary)]',
    '[&_hr]:mx-0 [&_hr]:my-[var(--space-md)] [&_hr]:border-0 [&_hr]:border-t [&_hr]:border-solid [&_hr]:[border-color:var(--color-border-medium)]',
], {
    variants: {
        size: {
            /** A page's own long text (an app's listing): the surrounding size, headings a step up. */
            default: [
                '[&_p]:mb-[var(--space-xs)]',
                '[&_h2]:text-[length:var(--text-lg)] [&_h3]:text-[length:var(--text-base)] [&_h2]:mt-[var(--space-md)] [&_h3]:mt-[var(--space-md)] [&_h2]:mb-[var(--space-xs)] [&_h3]:mb-[var(--space-xs)]',
                '[&_ul]:my-[var(--space-xs)] [&_ol]:my-[var(--space-xs)]',
            ],
            /** Text inside a card, a field or a thread (review notes, a read-only answer, the editor). */
            compact: [
                'text-[length:var(--text-base)] leading-[1.5]',
                '[&_p]:mb-[var(--space-sm)] [&_p:last-child]:mb-0',
                '[&_h2]:text-[length:var(--text-lg)] [&_h3]:text-[length:var(--text-base)] [&_h2]:mt-[var(--space-sm)] [&_h3]:mt-[var(--space-sm)] [&_h2]:mb-[var(--space-xs)] [&_h3]:mb-[var(--space-xs)]',
                '[&_ul]:my-[var(--space-xs)] [&_ol]:my-[var(--space-xs)]',
            ],
        },
    },
    defaultVariants: { size: 'default' },
});
/**
 * Read-only rich text: an app's description, its "What's new", review notes and feedback. The one
 * place a product puts stored rich text into the DOM, so there is one sanitizer to audit.
 * Renders nothing for an empty value; the caller says what an empty one means.
 */
export function RichText({ value, size, className, 'data-testid': testId }) {
    const text = value ?? '';
    const html = looksLikeAppDescriptionHtml(text);
    const safeHtml = useMemo(() => (html ? sanitizeRichTextHtml(text) : ''), [html, text]);
    if (text.trim() === '')
        return null;
    const classes = cn(richTextVariants({ size }), className);
    return html ? (_jsx("div", { "data-ui": "rich-text", "data-testid": testId, className: classes, dangerouslySetInnerHTML: { __html: safeHtml } })) : (_jsx("div", { "data-ui": "rich-text", "data-testid": testId, className: cn(classes, 'whitespace-pre-wrap'), children: text }));
}
