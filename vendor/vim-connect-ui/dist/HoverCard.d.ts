import React from 'react';
export interface HoverCardProps {
    /** What the trigger is, for screen readers ("Care Insights — app details"). With `asChild` the child keeps its own name, and this names the card. */
    label: string;
    /**
     * The card's contents: a title, badges, links. Plain text belongs in a `Tooltip`.
     * Pass a function to get `close`, for an action inside the card that should shut it
     * (e.g. a button that opens a modal).
     */
    content: React.ReactNode | ((close: () => void) => React.ReactNode);
    /** The thing you hover. Wrapped in a focusable span, unless `asChild`. */
    children: React.ReactNode;
    /**
     * The child is the trigger: one focusable element (a link, a button) that keeps its
     * own role, name, click and keys. The card's handlers, ref and aria are added to it,
     * with no wrapper and no second tab stop. Default `false`.
     */
    asChild?: boolean;
    /** Open while the trigger has focus, as on hover. Default `true` with `asChild`, else `false` (Enter / Space opens the wrapper). */
    openOnFocus?: boolean;
    /**
     * `dialog` (default): a named card the trigger opens (`aria-haspopup`, `aria-expanded`).
     * `tooltip`: the card is the trigger's description, e.g. a definition: `role="tooltip"`,
     * and the trigger's `aria-describedby` points at it while it is open. Text only.
     */
    panelRole?: 'dialog' | 'tooltip';
    /** Card width in px. Default 268. */
    width?: number;
    /** Keep it closed (e.g. while another panel is open). */
    disabled?: boolean;
    /** Classes on the trigger wrapper (not used with `asChild`: style the child). */
    className?: string;
    /** Classes on the card. */
    panelClassName?: string;
    /**
     * Told whenever the card is asked to open or close (hover, click, keys, dismiss),
     * even while `disabled`, so a parent with several cards can let the newest one win
     * and disable the rest.
     */
    onOpenChange?: (open: boolean) => void;
    /** The card's own accessible name, when it should differ from the trigger's `label`. */
    panelLabel?: string;
    /** A solid card surface instead of the floating glass, for a card over dense controls (AnchoredPanel's `opaque`). */
    opaque?: boolean;
}
/**
 * A small floating card of detail you can act on (a title, a badge, a link)
 * about the thing under the pointer. Plain text, even a few lines, is a
 * `Tooltip` with `wrap`.
 *
 * Pointer: opens on hover, with a grace period to cross into the card; a click
 * or tap opens it too (touch has no hover).
 * Keyboard: Enter / Space on the trigger opens it and moves focus into the
 * card, so Tab reaches its links; focus leaving the card closes it, and Escape
 * closes it and returns focus to the trigger. Focus alone doesn't open it.
 *
 * `asChild` makes the child (a link, a button) the trigger instead of the
 * wrapper: it keeps its own click and keys, the card opens on its focus as
 * well as hover, and Tab from it enters an open card. `panelRole="tooltip"`
 * turns the card into the trigger's description (a definition).
 */
export declare function HoverCard({ label, content, children, width, disabled, className, panelClassName, onOpenChange, panelLabel, opaque, asChild, openOnFocus, panelRole, }: HoverCardProps): import("react/jsx-runtime").JSX.Element;
