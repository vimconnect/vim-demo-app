import React from 'react';
import { type VariantProps } from 'class-variance-authority';
/**
 * Inline notice / banner — the design system's Notice section (vim-ai
 * `Design System.html` → Notice): a page- or card-level message that needs
 * more presence than a line of text but isn't a modal.
 *
 * One shape, five tones: `info` (blue, the common case), `purple`
 * (network / identity content, e.g. invitations), `warning` (orange),
 * `success` (done, saved) and `error` (a hard blocker). An optional `title` adds a
 * bold first line, for a docs-style callout. A flat 30% fill of the family's own token, no
 * border, one shade deeper on hover with a matching glow.
 *
 * The text is always `--color-text-primary`: a same-hue colour on its own tinted
 * fill fails 4.5:1 in at least one theme (DS callout). Only the icon carries
 * the hue, through a theme-aware token, because at icon size the bar is 3:1.
 *
 * Tailwind + `cva` on the shared tokens (the `write-ui-component` recipe),
 * written to mean the same in Tailwind v3 and v4.
 */
declare const noticeVariants: (props?: ({
    variant?: "error" | "purple" | "success" | "warning" | "info" | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
export type NoticeVariant = NonNullable<VariantProps<typeof noticeVariants>['variant']>;
export interface NoticeProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'color' | 'title'> {
    variant?: NoticeVariant;
    /**
     * Replaces the built-in icon (rendered 16px in the tone's colour). Pass `null`
     * for a notice with no icon.
     */
    icon?: React.ReactNode | null;
    /** A bold first line (the docs-callout heading: "Required capability"). The children follow under it. */
    title?: React.ReactNode;
    /** A call to action on the right (a small `Button` or a `TextLink`): "Review", "Turn on". Before the X when both are set. */
    action?: React.ReactNode;
    /** Shows an X on the right that calls this. The caller removes the notice. */
    onDismiss?: () => void;
    /** Tooltip and accessible name of the X. Default "Dismiss". */
    dismissLabel?: string;
}
export declare const Notice: React.ForwardRefExoticComponent<NoticeProps & React.RefAttributes<HTMLDivElement>>;
export { noticeVariants };
