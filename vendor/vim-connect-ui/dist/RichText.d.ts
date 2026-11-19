import { type VariantProps } from 'class-variance-authority';
/**
 * Stored app-description rich text (the editor's output), cut to its allowlist: the editor's tags,
 * `href` only, https links opening in a new tab. Runs on display as well as on save. For that
 * format only, an editor's initial content included (TipTap parses it through `innerHTML`); other
 * HTML needs its own policy.
 */
export declare function sanitizeRichTextHtml(html: string): string;
/**
 * The rich-text prose recipe (vim-ai DS → Rich Text): headings, lists, links, quotes and rules on
 * the DS tokens. `RichText` wears it, and so does an editor's content area, so a text reads the same
 * while it's written and once it's shown. Every product's Tailwind scans this package, so these are
 * written the same for Tailwind v3 and v4.
 */
export declare const richTextVariants: (props?: ({
    size?: "default" | "compact" | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
export interface RichTextProps extends VariantProps<typeof richTextVariants> {
    /**
     * The stored value. Editor HTML is sanitized and rendered; anything that doesn't look like the
     * editor's HTML is legacy plain text and renders as text (line breaks kept), never parsed as
     * markup, so "reads <DOB> on load" keeps its `<DOB>`.
     */
    value: string | null | undefined;
    className?: string;
    'data-testid'?: string;
}
/**
 * Read-only rich text: an app's description, its "What's new", review notes and feedback. The one
 * place a product puts stored rich text into the DOM, so there is one sanitizer to audit.
 * Renders nothing for an empty value; the caller says what an empty one means.
 */
export declare function RichText({ value, size, className, 'data-testid': testId }: RichTextProps): import("react/jsx-runtime").JSX.Element | null;
