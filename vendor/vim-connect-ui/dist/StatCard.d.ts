import React from 'react';
/**
 * Design-system stat card — vim-ai `Design System.html` → Stat Card.
 * One stat, its own card: a cyan icon tile beside an uppercase label and its
 * value. Lay several out in a row with `gap` (never one shared card with
 * hairline dividers). Static info tile: shadow-only hover, never the lift.
 * Pick a distinct icon per stat — it is a second cue for which number is which.
 *
 * Classes mean the same in Tailwind v3 and v4: arbitrary values on DS tokens
 * only and no `!` important marker.
 */
export interface StatCardProps {
    icon: React.ComponentType<{
        className?: string;
    }>;
    label: React.ReactNode;
    /** Pre-formatted display value (e.g. `14`, `242.5 KB`). */
    value: React.ReactNode;
    className?: string;
}
export declare function StatCard({ icon: Icon, label, value, className }: StatCardProps): import("react/jsx-runtime").JSX.Element;
