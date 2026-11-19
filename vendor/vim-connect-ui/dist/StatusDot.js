import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from './cn.js';
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
const statusDotVariants = cva('inline-block shrink-0 rounded-full [background:var(--dot)] align-middle', {
    variants: {
        tone: {
            success: '[--dot:var(--color-success)]',
            warning: '[--dot:var(--color-warning)]',
            error: '[--dot:var(--color-error)]',
            info: '[--dot:var(--color-cyan)]',
            neutral: '[--dot:var(--color-text-subtle)]',
        },
        size: {
            sm: 'size-[6px]',
            md: 'size-[8px]',
            lg: 'size-[10px]',
        },
        halo: {
            true: '[box-shadow:0_0_0_4px_color-mix(in_srgb,var(--dot)_15%,transparent)]',
            false: '',
        },
        motion: {
            none: '',
            pulse: '[box-shadow:0_0_8px_var(--dot)] motion-safe:animate-pulse',
            blink: 'motion-safe:animate-pulse',
        },
    },
    compoundVariants: [
        // Both set box-shadow; together they need one value carrying the ring and the glow.
        { halo: true, motion: 'pulse', class: '[box-shadow:0_0_0_4px_color-mix(in_srgb,var(--dot)_15%,transparent),0_0_8px_var(--dot)]' },
    ],
    defaultVariants: { tone: 'neutral', size: 'md', halo: false, motion: 'none' },
});
export const StatusDot = React.forwardRef(function StatusDot({ tone = 'neutral', size = 'md', halo = false, motion = 'none', label, className, ...rest }, ref) {
    return (_jsx("span", { ref: ref, "data-ui": "status-dot", "data-tone": tone, role: label ? 'img' : undefined, "aria-label": label, "aria-hidden": label ? undefined : true, className: cn(statusDotVariants({ tone, size, halo, motion }), className), ...rest }));
});
export { statusDotVariants };
