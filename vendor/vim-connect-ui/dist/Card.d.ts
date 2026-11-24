import React from 'react';
import { type VariantProps } from 'class-variance-authority';
/**
 * Design-system card — vim-ai `Design System.html` → Cards.
 *
 * Three flavours: `default` (solid card surface + hairline border), `gradient`
 * (highlights) and `extractor` (cyan left rule, inline data callouts).
 * Hover: `lift` (DS default: cyan border, card glow, 2px lift) for a card that
 * is one clickable thing; `shadow` (glow only) for a static container the
 * pointer moves over; `none` for plain containers.
 *
 * `CardHeader` is the one header recipe (DS plugin 1.0.16 / 1.0.21): an
 * optional 28px icon badge + `h3` title 8px apart, an optional 11px muted
 * hint, and actions on the right — always inside the card, never floating
 * above it.
 *
 * Classes mean the same in Tailwind v3 and v4: arbitrary values on DS tokens
 * only and no `!` important marker.
 */
declare const cardVariants: (props?: ({
    variant?: "default" | "gradient" | "extractor" | null | undefined;
    hover?: "none" | "lift" | "shadow" | null | undefined;
    size?: "default" | "compact" | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
export type CardVariant = NonNullable<VariantProps<typeof cardVariants>['variant']>;
export type CardHover = NonNullable<VariantProps<typeof cardVariants>['hover']>;
export type CardSize = NonNullable<VariantProps<typeof cardVariants>['size']>;
export interface CardProps extends React.HTMLAttributes<HTMLElement> {
    variant?: CardVariant;
    /** Default `none`; use `lift` only when the whole card is one click target. */
    hover?: CardHover;
    /** `compact` (`--space-md` padding, `--radius-lg`) for small tiles; default is the full card. */
    size?: CardSize;
    /** Element to render. Default `div`. */
    as?: 'div' | 'section' | 'article' | 'li' | 'ul';
}
/**
 * The card's look and hooks for an element `Card` can't render (a link, a form, a `pre`, a
 * menu): spread it on that element. `data-card` is what tests and page CSS select a card by,
 * so never write the attribute or `cardVariants()` by hand.
 */
export declare function cardProps({ variant, hover, size, className, }?: {
    variant?: CardVariant;
    hover?: CardHover;
    size?: CardSize;
    className?: string;
}): {
    'data-variant': CardVariant;
    'data-size': CardSize;
    'data-card': string;
    className: string;
};
export declare const Card: React.ForwardRefExoticComponent<CardProps & React.RefAttributes<HTMLElement>>;
export interface CardHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
    title: React.ReactNode;
    /** Optional icon, passed bare: shown in the 28px cyan badge at 16px. */
    icon?: React.ReactNode;
    /** One 11px muted line under the title. */
    hint?: React.ReactNode;
    /** Right side of the row: a count, a search, a "Show all" link, buttons. */
    actions?: React.ReactNode;
}
export declare const CARD_TITLE_CLASSES = "m-0 [font-family:var(--font-sans)] text-[length:var(--text-xl)] [font-weight:var(--font-semibold)] leading-[1.3] [color:var(--color-text-primary)]";
export declare function CardHeader({ title, icon, hint, actions, className, ...rest }: CardHeaderProps): import("react/jsx-runtime").JSX.Element;
export { cardVariants };
