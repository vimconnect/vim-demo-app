import React from 'react';
import { type VariantProps } from 'class-variance-authority';
/**
 * Design-system text link (vim-ai Text Link). With `href` renders an `<a>`;
 * without one, a `<button type="button">`. Negative margin offsets the
 * hover-pill padding so the label does not shift in flow. Export
 * `textLinkVariants` for a product router link that needs the same paint.
 */
declare const textLinkVariants: (props?: ({
    variant?: "default" | "danger" | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
export type TextLinkVariant = NonNullable<VariantProps<typeof textLinkVariants>['variant']>;
type TextLinkSharedProps = {
    variant?: TextLinkVariant;
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
