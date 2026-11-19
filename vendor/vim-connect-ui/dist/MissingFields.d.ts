import React from 'react';
export interface MissingFieldsPanelProps {
    labels: string[];
    anchorRef: React.RefObject<HTMLElement | null>;
    onDismiss: () => void;
    /** Overrides the default "N missing on this tab" (e.g. a whole-form pill). */
    heading?: string;
    /** Keeps the panel open while the pointer is inside it. */
    onKeepOpen?: () => void;
    /** Opens the whole-form list, for a panel whose own list is capped. */
    onSeeAll?: () => void;
    /** Label for that escape hatch. */
    seeAllLabel?: string;
    /** Heading and bullet colour, a CSS colour (usually a DS token var). */
    accent?: string;
}
export declare function MissingFieldsPanel({ labels, anchorRef, onDismiss, heading, onKeepOpen, onSeeAll, seeAllLabel, accent, }: MissingFieldsPanelProps): import("react/jsx-runtime").JSX.Element;
export interface MissingFieldsHoverProps {
    labels: string[];
    heading?: string;
    onSeeAll?: () => void;
    seeAllLabel?: string;
    accent?: string;
    /** Set when the trigger is a DISABLED button: Chrome sends no pointer events
     *  to one, so the caller gives it `pointer-events: none` and passes its
     *  cursor here, and this wrapper receives the hover instead. */
    cursor?: React.CSSProperties['cursor'];
    children: React.ReactNode;
}
/** Wraps a trigger so hovering it opens its missing-fields panel. */
export declare function MissingFieldsHover({ labels, heading, onSeeAll, seeAllLabel, accent, cursor, children }: MissingFieldsHoverProps): import("react/jsx-runtime").JSX.Element;
