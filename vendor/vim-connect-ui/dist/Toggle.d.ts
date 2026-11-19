import React from 'react';
/**
 * Design-system toggle switch — vim-ai `Design System.html` → Toggle Switch.
 *
 * The one on/off control: a `role="switch"` button (not a styled checkbox) so
 * `aria-checked` carries the state. Track 1.5rem × 2.75rem (md), full pill; a
 * white thumb that slides its own width. Sizes sm / md / lg (Ben, 2026-11-10). ON is `--color-blue` (cyan washes out as the
 * whole fill of a control this size). OFF is a flat "nothing set" grey.
 *
 * `variant="sides"`: for the one case where OFF is a state in its own right,
 * not an absence (SignoffCard's "Waiting on: Vim / Partner") — both tracks
 * carry a colour, blue for OFF and `--color-warning` for ON.
 *
 * Theme by tokens only: the OFF grey is `--color-text-primary` at 20% with a
 * `--color-border-strong` edge (the DS's #e5e7eb in light, a white wash with a
 * border in dark); the thumb is the white `--color-text-on-gradient`.
 *
 * Classes mean the same in Tailwind v3 and v4: arbitrary values on DS tokens
 * only and no `!` important marker.
 */
export type ToggleSize = 'sm' | 'md' | 'lg';
export interface ToggleProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    /** Accessible name, e.g. "Require 2FA for all admins". Omit only when `aria-labelledby` names it. */
    label?: string;
    'aria-labelledby'?: string;
    disabled?: boolean;
    /** `sides`: OFF is the other side, not an absence. */
    variant?: 'default' | 'sides';
    /** `md` (default) is the DS switch; `sm` for dense rows, `lg` for a prominent setting. */
    size?: ToggleSize;
    id?: string;
    className?: string;
}
export declare const Toggle: React.ForwardRefExoticComponent<ToggleProps & React.RefAttributes<HTMLButtonElement>>;
