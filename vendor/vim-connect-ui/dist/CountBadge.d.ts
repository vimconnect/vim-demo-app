import React from 'react';
import { type VariantProps } from 'class-variance-authority';
declare const countBadgeVariants: (props?: ({
    tone?: "neutral" | "accent" | "alert" | null | undefined;
    size?: "sm" | "md" | null | undefined;
    dot?: boolean | null | undefined;
    anchored?: boolean | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
export type CountBadgeTone = NonNullable<VariantProps<typeof countBadgeVariants>['tone']>;
export type CountBadgeSize = NonNullable<VariantProps<typeof countBadgeVariants>['size']>;
export interface CountBadgeProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'> {
    /** The number to show. Ignored with `dot`. */
    count?: number;
    /** Above this, show `{max}+`. Default 99. */
    max?: number;
    /** Show a bare dot instead of a number. */
    dot?: boolean;
    tone?: CountBadgeTone;
    /** `sm` 18px (icon corners), `md` 20px (tabs, nav). Default `md`. */
    size?: CountBadgeSize;
    /** Overhang the top-right corner of a `relative` parent. */
    anchored?: boolean;
    /** Show a zero (default true, a tab's count). `false` renders nothing at 0. */
    showZero?: boolean;
    /** What it counts, for screen readers ("3 unread notifications"). */
    label?: string;
}
/** `count`, or `{max}+` above `max`. */
export declare function formatCount(count: number, max?: number): string;
/**
 * A small number, or a bare dot, on a tab, nav item or icon: how many are
 * waiting. `alert` is for something that wants attention now; use it sparingly.
 */
export declare const CountBadge: React.ForwardRefExoticComponent<CountBadgeProps & React.RefAttributes<HTMLSpanElement>>;
export { countBadgeVariants };
