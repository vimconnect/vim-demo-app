import React from 'react';
import { type VariantProps } from 'class-variance-authority';
/**
 * Status dot — a small round light for the state of a connection, channel or
 * step (Studio's connection dot, Console channel health, the invitation
 * timeline, the demo app's status rows).
 *
 * Five tones on the semantic tokens: `success` (live, active), `warning`
 * (degraded), `error` (down), `info` (in progress, current step), `neutral`
 * (off, planned, not started). Three sizes. Optional `halo` (a 4px ring in the
 * tone at 15%, for a timeline marker) and `motion`: `pulse` (a soft glow that
 * breathes, for a live connection) or `blink` (checking). Motion stops under
 * `prefers-reduced-motion`.
 *
 * Colour is never the only signal: pass `label` and the dot is announced
 * ("Connected"); without one it's decorative (`aria-hidden`), so put the state
 * in text beside it.
 *
 * Classes mean the same in Tailwind v3 and v4: arbitrary values on DS tokens
 * only and no `!` important marker.
 */
declare const statusDotVariants: (props?: ({
    tone?: "neutral" | "error" | "success" | "warning" | "info" | null | undefined;
    size?: "sm" | "md" | "lg" | null | undefined;
    halo?: boolean | null | undefined;
    motion?: "blink" | "none" | "pulse" | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
export type StatusDotTone = NonNullable<VariantProps<typeof statusDotVariants>['tone']>;
export type StatusDotSize = NonNullable<VariantProps<typeof statusDotVariants>['size']>;
export type StatusDotMotion = NonNullable<VariantProps<typeof statusDotVariants>['motion']>;
export interface StatusDotProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'> {
    tone?: StatusDotTone;
    size?: StatusDotSize;
    /** 4px ring in the tone at 15% (timeline markers). */
    halo?: boolean;
    /** `pulse` for a live connection, `blink` while checking. Off under reduced motion. */
    motion?: StatusDotMotion;
    /** What the dot means, read by screen readers ("Connected"). Omit when the state is written beside it. */
    label?: string;
}
export declare const StatusDot: React.ForwardRefExoticComponent<StatusDotProps & React.RefAttributes<HTMLSpanElement>>;
export { statusDotVariants };
