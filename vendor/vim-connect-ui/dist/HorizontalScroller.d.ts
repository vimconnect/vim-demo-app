import React from 'react';
export interface HorizontalScrollerProps extends React.HTMLAttributes<HTMLDivElement> {
    /** Fade color on scrollable edges — any valid CSS color. */
    gradientColor?: string;
    /** Pixels scrolled per chevron click. */
    scrollAmount?: number;
    children: React.ReactNode;
}
/**
 * Horizontally scrollable region with edge fades and chevron controls.
 * Chevrons mount only when content overflows in that direction.
 */
export declare const HorizontalScroller: React.ForwardRefExoticComponent<HorizontalScrollerProps & React.RefAttributes<HTMLDivElement>>;
