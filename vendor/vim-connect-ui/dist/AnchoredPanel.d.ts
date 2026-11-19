/**
 * Fixed-position panel anchored to a trigger element — moved from the Console
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
export interface AnchoredPanelProps {
    anchorRef: React.RefObject<HTMLElement | null>;
    onDismiss: (reason: AnchoredPanelDismissReason) => void;
    width: number;
    children: React.ReactNode;
    ariaLabel: string;
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
    /** `menu` for a list of actions (Action Menu). Default `dialog`. */
    role?: 'dialog' | 'menu';
}
export declare const AnchoredPanel: React.FC<AnchoredPanelProps>;
export {};
