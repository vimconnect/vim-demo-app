/**
 * Fixed-position panel anchored to a trigger element, or to a point, rect or
 * virtual element (`anchor`) — moved from the Console
 * (`components/ui/AnchoredPanel.tsx`, now a re-export) so every product's hover
 * cards and popovers position the same way.
 *
 * Domain-free: portal, measure, flip above/below on available space, cap its
 * height to that space and scroll, clamp horizontally into the viewport. Follows
 * its anchor on scroll, resize, and its own size changes (async content that grows
 * after open), and dismisses on outside click, Escape, or once the anchor is no
 * longer visible — off the viewport or scrolled out of a clipping container
 * (never on its own inner scroll). Wears the DS floating surface on tokens.
 */
import React from 'react';
/** The DS floating surface: the solid page colour in both themes, no blur. */
export declare const FLOATING_SURFACE: string;
type Placement = 'above' | 'below';
/** Why the panel asked to close. */
export type AnchoredPanelDismissReason = 'outside' | 'escape' | 'scroll' | 'resize';
/** A viewport rectangle; a point is `{ left: x, top: y }` (no size). A `DOMRect` is one. */
export interface AnchoredPanelRect {
    top: number;
    left: number;
    width?: number;
    height?: number;
}
/** Something to anchor to that isn't an element: a rect or point, or an object read again on every scroll and resize (a text selection's range). */
export type AnchoredPanelAnchor = AnchoredPanelRect | {
    getBoundingClientRect: () => AnchoredPanelRect;
};
export interface AnchoredPanelProps {
    /** The element the panel hangs off. Pass this or `anchor`. */
    anchorRef?: React.RefObject<HTMLElement | null>;
    /** A point, rect or virtual element to hang off instead of an element. The panel follows it on scroll and resize, and closes (`scroll` / `resize`) once it leaves the viewport. */
    anchor?: AnchoredPanelAnchor;
    onDismiss?: (reason: AnchoredPanelDismissReason) => void;
    /** Width in px. Leave it out to size the panel to its content. */
    width?: number;
    children: React.ReactNode;
    /** The panel's name. Leave it out only for a `tooltip`, whose content is the description. */
    ariaLabel?: string;
    /** Hover-opened panels pass these so the pointer can cross into the panel
     *  without it closing underneath them. Click-opened panels omit both. */
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
    /** A solid background, for a panel laid over controls it could be mistaken for. */
    opaque?: boolean;
    /** Extra classes on the panel (e.g. a different surface for one caller). */
    className?: string;
    /** Horizontal alignment to the anchor. Default `center`. */
    align?: 'start' | 'center' | 'end';
    /** The side to try first. Default `below`. */
    prefer?: Placement;
    /** No inner padding, for a panel with its own sections. */
    flush?: boolean;
    /** The panel's id, for the trigger's `aria-controls`. */
    id?: string;
    /** Keyboard focus target when it holds no focusable element. */
    tabIndex?: number;
    onBlur?: React.FocusEventHandler<HTMLDivElement>;
    onKeyDown?: React.KeyboardEventHandler<HTMLDivElement>;
    /** `menu` for a list of actions (Action Menu), `group` for a strip of controls, `tooltip` for a card that describes its trigger. Default `dialog`. */
    role?: 'dialog' | 'menu' | 'group' | 'tooltip';
    /** `false` leaves Escape to the caller (a panel with its own steps); the panel then never closes on it, and a layer below it (a Modal, a Side Panel) still does. Default `true`. */
    closeOnEscape?: boolean;
    /** `false` leaves a press outside the panel to the caller; a press on it then counts as outside the layers below it, except the one it was opened from. Default `true`. */
    closeOnOutsideClick?: boolean;
    /** E.g. `preventDefault()` so a press on the panel keeps the page's text selection. */
    onMouseDown?: React.MouseEventHandler<HTMLDivElement>;
}
export declare const AnchoredPanel: React.FC<AnchoredPanelProps>;
export {};
