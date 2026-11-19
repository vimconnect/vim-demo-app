import React from 'react';
import { type VariantProps } from 'class-variance-authority';
import { type CardProps } from './Card.js';
/**
 * Design-system list row — vim-ai `Design System.html` → List Row.
 *
 * The one recipe for "a list of records, each with an icon, a name, some
 * metadata, and an action" (invitations, roles, pending requests): one static
 * card (`List`) holding hairline-separated rows, never one bordered, gapped
 * card per record.
 *
 * Row grid: 40px icon column · body · actions. Icon tile 36px / 10px radius
 * in a cyan, purple or amber tint. Body: name (base, medium) + an inline
 * badge, then one muted metadata line that truncates.
 *
 * Classes mean the same in Tailwind v3 and v4: arbitrary values on DS tokens
 * only and no `!` important marker.
 */
declare const iconVariants: (props?: ({
    tone?: "cyan" | "purple" | "amber" | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
export type ListRowTone = NonNullable<VariantProps<typeof iconVariants>['tone']>;
export interface ListRowProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
    /** Icon, passed bare: sized 18px inside the 36px tile. Or pass `avatar` instead. */
    icon?: React.ReactNode;
    /** Tile tint. Default cyan. */
    tone?: ListRowTone;
    /** A 36px avatar (e.g. initials) in place of the icon tile. */
    avatar?: React.ReactNode;
    /** The record's name. */
    title: React.ReactNode;
    /** Inline after the name, e.g. a `Badge`. */
    badge?: React.ReactNode;
    /** One muted line under the name; truncates. */
    meta?: React.ReactNode;
    /** Right side: a chevron, text link or icon buttons. */
    actions?: React.ReactNode;
    /** Content under the row (a field list, an expanded sub-list), in the title column, inside the row's hairline and hover. */
    body?: React.ReactNode;
    /** Element to render. Default `div`. */
    as?: 'div' | 'li';
}
export declare const ListRow: React.ForwardRefExoticComponent<ListRowProps & React.RefAttributes<HTMLElement>>;
export type ListProps = Omit<CardProps, 'variant' | 'as'> & {
    /** `ul` for a list of `ListRow as="li"` rows. Default `div`. */
    as?: 'div' | 'ul';
};
/**
 * The card that holds list rows: static, shadow-only hover (not one clickable
 * thing, but not inert), no padding — the rows carry it. For list semantics
 * use `as="ul"` here and `as="li"` on each row.
 */
export declare const List: React.ForwardRefExoticComponent<Omit<CardProps, "variant" | "as"> & {
    /** `ul` for a list of `ListRow as="li"` rows. Default `div`. */
    as?: "div" | "ul";
} & React.RefAttributes<HTMLElement>>;
export { iconVariants as listRowIconVariants };
