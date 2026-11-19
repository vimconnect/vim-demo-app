import React from 'react';
/**
 * Design-system segmented control — vim-ai `Design System.html` → Segmented
 * Control.
 *
 * A single-select row of 2–5 options on one pill track, for mutually
 * exclusive views where every option stays visible (unlike Select).
 * - Text variant: a `role="group"` of `aria-pressed` buttons, each with an
 *   optional trailing count.
 * - Icon variant: a `role="radiogroup"` of square icon-only radios, each with
 *   a themed Tooltip; the glyph of the option just picked animates once
 *   (pop, spin or swing; never on mount; still under reduced motion: the animation is `motion-safe:` only).
 *
 * The `segmented-control*` class names stay on the elements as unstyled hooks
 * (tests and product CSS can target them); the look is Tailwind on DS tokens.
 * Classes mean the same in Tailwind v3 and v4: arbitrary values on DS tokens
 * only and no `!` important marker.
 */
export type SegmentedIconMotion = 'pop' | 'spin' | 'swing';
export interface SegmentedOption<T extends string> {
    value: T;
    label: string;
    count?: number;
    /** Shown but not pickable: muted, `aria-disabled`, and clicks do nothing. It stays focusable, so its tooltip can say why. */
    disabled?: boolean;
    /** Why it can't be picked, in the option's tooltip. A non-empty reason also disables the option. */
    disabledReason?: string;
}
export interface SegmentedIconOption<T extends string> {
    value: T;
    /** The option's tooltip. */
    label: string;
    icon: React.ComponentType<{
        'aria-hidden'?: boolean | 'true';
    }>;
    /** Screen-reader name; defaults to `label`. */
    ariaLabel?: string;
    iconMotion?: SegmentedIconMotion;
}
interface SegmentedControlBaseProps<T extends string> {
    /** `null` selects no option, e.g. while a choice is still open or the items disagree. */
    value: T | null;
    onChange: (value: T) => void;
    ariaLabel: string;
    className?: string;
}
export type SegmentedControlProps<T extends string> = SegmentedControlBaseProps<T> & ({
    variant?: 'text';
    options: readonly SegmentedOption<T>[];
} | {
    variant: 'icon';
    options: readonly SegmentedIconOption<T>[];
});
export declare function SegmentedControl<T extends string>(props: SegmentedControlProps<T>): React.ReactElement;
export {};
