import React from 'react';
export type ProgressBarTone = 'accent' | 'success' | 'warning' | 'error' | 'neutral';
export interface ProgressBarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'role'> {
    /** How far along, from 0 to `max`. Clamped. */
    value: number;
    /** Default 100. */
    max?: number;
    /**
     * `accent` (default) for progress through a task; `success` / `warning` /
     * `error` when the fill says how something is doing (on track, close,
     * over); `neutral` for paused. Say the state in words beside it too.
     */
    tone?: ProgressBarTone;
    /** `sm` 4px (default) beside a figure or in a table cell; `md` 8px on its own. */
    size?: 'sm' | 'md';
    /** A measurement (a rate, days held) rather than progress toward done: read as a meter. */
    meter?: boolean;
    /** Names the bar for screen readers ("Apps reviewed"), unless `aria-labelledby` points at a visible label. */
    'aria-label'?: string;
    /** What a screen reader says for the value ("3 of 7 apps"), when a bare percentage isn't clear. */
    valueText?: string;
}
/**
 * Progress Bar: a thin track filled from the left to show how far along
 * something is, or, as a meter, how much of a limit is used. It fills its
 * container's width; constrain it with `className`.
 */
export declare const ProgressBar: React.ForwardRefExoticComponent<ProgressBarProps & React.RefAttributes<HTMLDivElement>>;
