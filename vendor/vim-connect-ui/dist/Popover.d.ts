import React from 'react';
export interface PopoverProps extends Omit<React.HTMLAttributes<HTMLElement>, 'content' | 'children'> {
    /** The trigger: one element that takes a ref and `onClick` (a `Button`, a `<button>`). */
    children: React.ReactElement;
    /** The panel's contents. A function gets `close`, for an action inside that should shut it. */
    content: React.ReactNode | ((close: () => void) => React.ReactNode);
    /** The panel's accessible name ("Notification settings"). */
    label: string;
    /** Panel width in px. Default 280. */
    width?: number;
    /** Horizontal alignment to the trigger. Default `start`. */
    align?: 'start' | 'center' | 'end';
    /** The side to try first; it flips when there's no room. Default `below`. */
    side?: 'below' | 'above';
    /** No inner padding, for a panel with its own header and sections. */
    flush?: boolean;
    /** Controlled open state; pair with `onOpenChange`. */
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    /** Classes on the panel. */
    panelClassName?: string;
    /** `menu`: a list of actions (`ActionMenu`) — the menu keyboard model too: ↑ ↓ (wrapping), Home, End
     *  move between `[role="menuitem"]` elements, and Tab closes and continues from the trigger. Default `dialog`. */
    panelRole?: 'dialog' | 'menu';
    /** A wrapper's ref (e.g. `Tooltip`'s): passed to the trigger, as are its other props. Handlers chain,
     *  `className` and `aria-describedby` join; for any other prop both set, the trigger's wins. */
    ref?: React.Ref<HTMLElement>;
}
/**
 * Popover (DS → Popover): a click-opened floating panel on the DS floating surface,
 * for settings, a short form or a few actions. Hover detail is a `HoverCard`; a
 * blocking task is a `Modal`.
 */
export declare function Popover({ children, content, label, width, align, side, flush, open: openProp, defaultOpen, onOpenChange, panelClassName, panelRole, ref: outerRef, ...passThrough }: PopoverProps): import("react/jsx-runtime").JSX.Element;
