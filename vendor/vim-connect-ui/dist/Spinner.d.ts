import React from 'react';
export type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg';
export interface SpinnerProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'color'> {
    /** `xs` 14px inside a button or a line of text; `sm` 24px in a panel or table; `md` 48px (default) for a section; `lg` 64px for a page. */
    size?: SpinnerSize;
    /** `accent` is the cyan ring; `current` takes the text colour, for a spinner inside a button. Default: `current` at `xs`, else `accent`. */
    color?: 'accent' | 'current';
    /**
     * What is loading, read to screen readers ("Loading accounts"). Leave it out
     * when something nearby already says so (a busy button, a visible message):
     * the ring is then hidden from assistive tech.
     */
    label?: string;
}
/**
 * Loading Spinner ring (DS → Skeleton / Loading Spinner): a spinning ring with
 * a transparent top. It stands still when the user asks for reduced motion.
 */
export declare const Spinner: React.ForwardRefExoticComponent<SpinnerProps & React.RefAttributes<HTMLSpanElement>>;
export interface LoadingSpinnerProps {
    /** Shown under the ring and read to screen readers ("Loading accounts…"). */
    message?: string;
    /** Ring size; default `md`. */
    size?: Exclude<SpinnerSize, 'xs'>;
    /** Centre it in the whole viewport (a route's first load). Default `true`; `false` sits it in its container. */
    fullScreen?: boolean;
    className?: string;
}
/**
 * Loading Spinner (DS → Skeleton / Loading Spinner): the cyan ring, centred,
 * with an optional message. Prefer a skeleton when the page's shape is known.
 */
export declare function LoadingSpinner({ message, size, fullScreen, className }: LoadingSpinnerProps): import("react/jsx-runtime").JSX.Element;
