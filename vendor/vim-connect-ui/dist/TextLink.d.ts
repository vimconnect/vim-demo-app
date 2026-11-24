import React from 'react';
import { type VariantProps } from 'class-variance-authority';
/**
 * Design-system text link (vim-ai Text Link). With `href` renders an `<a>`;
 * without one, a `<button type="button">`. Negative margin offsets the
 * hover-pill padding so the label does not shift in flow. Export
 * `textLinkVariants` for a product router link that needs the same paint.
 *
 * `prose` (DS 1.0.122): a link inside running text — a paragraph, a list
 * item, rendered markdown. It stays `inline` so a long link wraps with the
 * line, takes the surrounding size and line-height, and is underlined (a
 * 1px line at 45% of the link colour, full colour on hover) instead of
 * showing the hover pill. Keyboard focus draws the focus ring.
 */
declare const textLinkVariants: (props?: ({
    variant?: "danger" | "default" | null | undefined;
    prose?: boolean | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
export type TextLinkVariant = NonNullable<VariantProps<typeof textLinkVariants>['variant']>;
type TextLinkSharedProps = {
    variant?: TextLinkVariant;
    /** A link inside running text: inline, underlined, wraps with the line, takes the text's size. */
    prose?: boolean;
    className?: string;
    children?: React.ReactNode;
};
export type TextLinkProps = TextLinkSharedProps & (({
    href: string;
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'color' | 'href'>) | ({
    href?: undefined;
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'color'>));
export declare const TextLink: React.ForwardRefExoticComponent<TextLinkProps & React.RefAttributes<HTMLButtonElement | HTMLAnchorElement>>;
export { textLinkVariants };
