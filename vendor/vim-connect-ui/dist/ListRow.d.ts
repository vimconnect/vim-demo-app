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
 * badge, then one muted metadata line that truncates. `iconColumn={false}`
 * drops the icon column; `selected` keeps the hover tint on (a listbox's
 * active option); `accent` draws a leading bar in a caller colour.
 *
 * Classes mean the same in Tailwind v3 and v4: arbitrary values on DS tokens
 * only and no `!` important marker.
 */
declare const iconVariants: (props?: ({
    tone?: "cyan" | "purple" | "amber" | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
export type ListRowTone = NonNullable<VariantProps<typeof iconVariants>['tone']>;
interface ListRowBaseProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
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
    /** The row is the active / selected one (a keyboard-highlighted option): the hover tint stays on, and the row gets `aria-selected`. Leave it out for a row that is never selected. */
    selected?: boolean;
    /** `false` drops the 40px icon column, for rows that never have an icon or avatar. Default `true`. */
    iconColumn?: boolean;
    /** A 3px bar down the row's leading edge in this colour (a DS token, e.g. `var(--color-purple)`). It sets `--list-row-accent` on the row, so a stylesheet can set the colour per row instead. */
    accent?: string;
}
/** A row that holds its own controls. */
export interface ListRowContainerProps extends ListRowBaseProps {
    /** Element to render. Default `div`. */
    as?: 'div' | 'li';
    /** Right side: a chevron, text link or icon buttons. */
    actions?: React.ReactNode;
    /** Content under the row (a field list, an expanded sub-list), in the title column, inside the row's hairline and hover. A clickable row ignores clicks in it. */
    body?: React.ReactNode;
}
/** A row that is one action, e.g. a `role="option"` in a listbox (it adds no key handling of its own). */
export interface ListRowButtonProps extends ListRowBaseProps {
    as: 'button';
    /** A button can't hold controls. */
    actions?: never;
    /** Content under the row, part of the action. Phrasing content only (text, `span`, a `Badge`): no links, buttons or fields. */
    body?: React.ReactNode;
}
export type ListRowProps = ListRowContainerProps | ListRowButtonProps;
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
