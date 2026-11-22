import React from 'react';
import type { BadgeVariant } from './Badge.js';
/**
 * Design-system stat card — vim-ai `Design System.html` → Stat Card.
 * One stat, its own card: an icon tile beside an uppercase label and its
 * value. Lay several out in a row with `gap` (never one shared card with
 * hairline dividers). Static info tile: shadow-only hover, never the lift.
 * Pick a distinct icon per stat — it is a second cue for which number is which.
 *
 * Filter tile (1.0.120): give it `onClick` and it renders a `<button>` with
 * `aria-pressed={pressed}`; the pressed tile gets the DS selected ring (cyan
 * border + `--color-cyan-15` halo), keyboard focus the `--shadow-focus` ring.
 * Use it when a row of counts also filters the list under it (Control Tower's
 * Flow Health / Flow Coverage status tiles). `tone` tints the icon tile and
 * `valueTone` colours the number (e.g. only when the count is above zero).
 *
 * Classes mean the same in Tailwind v3 and v4: arbitrary values on DS tokens
 * only and no `!` important marker.
 */
/** The shared Badge's variants except `purple` (no status meaning), so a Badge variant maps straight across. */
export type StatCardTone = Exclude<BadgeVariant, 'purple'>;
export interface StatCardProps {
    /** Optional: a filter row whose labels say it all may leave it out. */
    icon?: React.ComponentType<{
        className?: string;
    }>;
    label: React.ReactNode;
    /** Pre-formatted display value (e.g. `14`, `242.5 KB`). */
    value: React.ReactNode;
    /** Tint of the icon tile. Default `info` (the cyan tile). */
    tone?: StatCardTone;
    /** Colour of the value, in that tone's text colour. Default: primary text. */
    valueTone?: StatCardTone;
    /** Makes it a filter tile: a `<button>` with `aria-pressed`. */
    onClick?: () => void;
    /** Filter tile only: the selected state (cyan ring). No effect without `onClick`. */
    pressed?: boolean;
    className?: string;
}
export declare function StatCard({ icon: Icon, label, value, tone, valueTone, onClick, pressed, className, }: StatCardProps): import("react/jsx-runtime").JSX.Element;
