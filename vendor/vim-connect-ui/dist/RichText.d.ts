import { type VariantProps } from 'class-variance-authority';
import { richTextVariants } from './richTextShared.js';
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
