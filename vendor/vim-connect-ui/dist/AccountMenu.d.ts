import React from 'react';
import type { Theme, ThemePreference } from './themeShared.js';
export interface AccountMenuProps {
    /** The person's display name: the chip's text, the panel header and the avatar's initials. */
    name: string;
    /** Shown in full in the panel header, and used for the initials when there's no name. */
    email?: string | null;
    /** A photo URL for the chip's and the panel's avatars (http(s) or `data:image/`); the initials show until it loads, and if it fails. */
    avatarSrc?: string | null;
    /** The chip's text when it differs from `name` (e.g. a shortened label). Default `name`. */
    chipName?: string;
    /** A second, muted line on the chip after a hairline (the account, a shortened address). */
    chipDetail?: string;
    /** The chip's tooltip and the end of its accessible name ("User menu — …"). Default `name · email`. */
    tooltip?: string;
    /** The panel's accessible name. Default "User menu". */
    label?: string;
    /** The side to open on; `above` for a chip at the bottom of a sidebar. Default `below`. */
    side?: 'below' | 'above';
    /** Alignment to the chip. Default `end` (a chip at the top bar's right edge). */
    align?: 'start' | 'end';
    /** Panel width in px. Default 280. */
    width?: number;
    /** The panel's sections under the header: `AccountMenuSection`s. A function gets `close`. */
    children: React.ReactNode | ((close: () => void) => React.ReactNode);
    /** Classes on the chip. */
    className?: string;
}
/**
 * Account Menu (DS → Account Menu): the signed-in person's chip and the panel it opens. The chip
 * is the avatar, the name and an optional muted detail; the panel is a flush `Popover` (a
 * `dialog`, since the theme switch isn't a menu item: Tab walks every control) with a header
 * (avatar, name, full email) and the caller's `AccountMenuSection`s, divided by hairlines.
 *
 * Hooks: `data-ui="account-menu"` on the chip, `account-menu-info` on its text and
 * `account-menu-detail` on the hairline + detail, so a product can drop them at narrow widths.
 */
export declare function AccountMenu({ name, email, avatarSrc, chipName, chipDetail, tooltip, label, side, align, width, children, className, }: AccountMenuProps): import("react/jsx-runtime").JSX.Element;
/** One group of rows in the Account Menu panel; a hairline separates it from the one before. */
export declare function AccountMenuSection({ className, ...rest }: React.HTMLAttributes<HTMLDivElement>): import("react/jsx-runtime").JSX.Element;
type ItemBase = {
    /** A 16px glyph before the label. */
    icon?: React.ReactNode;
    /** Ends or destroys something (Sign out): red text and a red tint on hover / focus. */
    danger?: boolean;
    children: React.ReactNode;
    className?: string;
};
export type AccountMenuItemProps = ItemBase & (({
    href: string;
    render?: never;
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'children' | 'className'>) | {
    /** A router link or other element to render as the row; it receives the row's className and children. */
    render: React.ReactElement<{
        className?: string;
        children?: React.ReactNode;
    }>;
    href?: never;
} | ({
    href?: never;
    render?: never;
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'className'>));
/**
 * A row in the Account Menu panel: a button, a plain link (`href`), or the caller's own link
 * element (`render`, e.g. a router `Link`), with an optional icon. `danger` for Sign out.
 */
export declare function AccountMenuItem(props: AccountMenuItemProps): import("react/jsx-runtime").JSX.Element;
export interface AccountMenuThemeProps {
    value: ThemePreference;
    onChange: (preference: ThemePreference) => void;
    /** What the OS is set to, so System can say what it's following. */
    systemTheme: Theme;
    /** The theme the page shows now, for the row's sun or moon. */
    theme: Theme;
    /** The row's label. Default "Appearance". */
    label?: string;
}
/** The Appearance row: a sun or moon, the label and the DS `ThemeSwitcher`. */
export declare function AccountMenuTheme({ value, onChange, systemTheme, theme, label }: AccountMenuThemeProps): import("react/jsx-runtime").JSX.Element;
export {};
