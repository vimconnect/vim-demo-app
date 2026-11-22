import React from 'react';
import { type LucideIcon } from 'lucide-react';
import { ACTION_MENU_DIVIDER } from './actionMenuShared.js';
export interface ActionMenuItem {
    label: string;
    onSelect: () => void;
    /** A Lucide icon component. */
    icon?: LucideIcon;
    /** Destructive (delete, remove, revoke): red text and icon. */
    danger?: boolean;
    disabled?: boolean;
    /** Why it's disabled: a tooltip on the item. */
    disabledReason?: string;
    /** Opens a new tab: a trailing external-link icon. */
    external?: boolean;
    testId?: string;
}
export type ActionMenuEntry = ActionMenuItem | typeof ACTION_MENU_DIVIDER;
export interface ActionMenuProps {
    items: ActionMenuEntry[];
    /** The menu's name, and the default trigger's tooltip and accessible name ("Actions for Dana Levi"). */
    label: string;
    /** Your own trigger (e.g. a secondary "Actions ▾" Button); default is a ⋮ icon button with a tooltip. */
    trigger?: React.ReactElement;
    /** Size of the default ⋮ trigger: `sm` for dense table rows. */
    size?: 'default' | 'sm';
    /** Horizontal alignment to the trigger. Default `end`. */
    align?: 'start' | 'center' | 'end';
    /** Menu width in px. Default 200. */
    width?: number;
    /** Disables the trigger. Unset, a custom `trigger` keeps its own `disabled`. */
    disabled?: boolean;
}
/**
 * Action Menu (DS → Action Menu): a ⋮ (or your own) button that opens a short list
 * of actions on `Popover` with `panelRole="menu"` (its menu keyboard model). Choosing
 * an item closes it and returns focus to the trigger, then runs the item.
 */
export declare function ActionMenu({ items, label, trigger, size, align, width, disabled, }: ActionMenuProps): import("react/jsx-runtime").JSX.Element;
