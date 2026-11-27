import React from 'react';
import { type ButtonProps } from './Button.js';
export interface ExpandingIconButtonProps extends Omit<ButtonProps, 'iconOnly' | 'children' | 'aria-label' | 'color'> {
    /** Accessible name, and the text revealed when expanded. Short: "Apps". */
    label: string;
    /** A fuller accessible name when the visible label is short: "Open apps hub". */
    ariaLabel?: string;
    /** The 16px glyph (14px at `sm`). */
    icon: React.ReactNode;
    /**
     * Icon colour. Default inherits the variant foreground (`--color-cyan-text` on
     * ghost). Pass a CSS colour or `var(--token)`.
     */
    iconColor?: string;
    /** Force the label open (layout grows and pushes siblings). */
    expanded?: boolean;
    /** Optional selected / pressed — stays expanded and tinted. Sets `aria-pressed`. Not required. */
    selected?: boolean;
}
/**
 * Expanding Icon Button (DS → Expanding Icon Button): icon-only at rest; the
 * label opens left-to-right (`scaleX` from the left) on hover, keyboard focus,
 * press, or when `expanded` / `selected` is set. A measured-width slot pushes
 * siblings while the label itself scales (not a clip wipe). No tooltip — the
 * accessible name is always `aria-label` from `label` / `ariaLabel`. Nothing is
 * selected by default — `selected` is opt-in, not a radio/tabs group.
 *
 * Hooks: Button's `data-ui="button"`, plus `data-expanding-icon-button`, optional
 * `data-expanded` / `data-selected`, and `data-open` while the label is showing.
 * Does not set `data-icon-only` — square icon padding is applied on the control
 * so product skins that size `[data-icon-only]` as a square leave it alone.
 */
export declare const ExpandingIconButton: React.ForwardRefExoticComponent<ExpandingIconButtonProps & React.RefAttributes<HTMLButtonElement>>;
