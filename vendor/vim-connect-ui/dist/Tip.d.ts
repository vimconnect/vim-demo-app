import React from 'react';
export interface TipProps {
    /** The element the tip points at. It gets the ring and, with `spotlight`, the cut-out. */
    anchorRef: React.RefObject<HTMLElement | null>;
    /** Whether the tip is showing. The caller owns "show it once" (storage, a flag in the user's profile). */
    open: boolean;
    /** Got it, Escape, or a press on the veil. The caller closes the tip and remembers it. */
    onDismiss: () => void;
    /** One short line: what changed. */
    title: string;
    /** One or two sentences: what to do about it. */
    children: React.ReactNode;
    /** The mark beside the text. Default `TipMark`; pass `null` for none. */
    mark?: React.ReactNode;
    /** The button label. Default "Got it". */
    actionLabel?: string;
    /** A white blurred veil over the page except a cut-out around the target, plus the ring on the target. Default `true`. */
    spotlight?: boolean;
    /** Card width in px, capped to the viewport. Default 300. */
    width?: number;
    /** The target's corner radius in px, for the ring and the cut-out (capped to half its height). Default: a full pill. */
    radius?: number;
}
/**
 * A pointer to something that moved or is new (DS → Tip): a card under the target with an animated
 * `TipMark`, a title, a sentence and a pill accent button; with `spotlight` the rest of the page sits under a
 * white veil (page colour at ~48%, 1.5px blur) with a pill-shaped cut-out around the target, which keeps
 * a pulsing cyan ring and stays clickable. Escape, the button or a press on the veil dismisses. Controlled:
 * it shows while `open`, and the caller decides when it has been seen. One per screen, first visit only.
 */
export declare function Tip({ anchorRef, open, onDismiss, title, children, mark, actionLabel, spotlight, width, radius, }: TipProps): import("react/jsx-runtime").JSX.Element | null;
