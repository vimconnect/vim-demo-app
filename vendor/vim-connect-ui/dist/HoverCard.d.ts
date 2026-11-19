import React from 'react';
export interface HoverCardProps {
    /** What the trigger is, for screen readers ("Care Insights — app details"). */
    label: string;
    /**
     * The card's contents: a title, badges, links. Plain text belongs in a `Tooltip`.
     * Pass a function to get `close`, for an action inside the card that should shut it
     * (e.g. a button that opens a modal).
     */
    content: React.ReactNode | ((close: () => void) => React.ReactNode);
    /** The thing you hover. Wrapped in a focusable span. */
    children: React.ReactNode;
    /** Card width in px. Default 268. */
    width?: number;
    /** Keep it closed (e.g. while another panel is open). */
    disabled?: boolean;
    /** Classes on the trigger wrapper. */
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
 */
export declare function HoverCard({ label, content, children, width, disabled, className, panelClassName, onOpenChange, panelLabel, opaque }: HoverCardProps): import("react/jsx-runtime").JSX.Element;
