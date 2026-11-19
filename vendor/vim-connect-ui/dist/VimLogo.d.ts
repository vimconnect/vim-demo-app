import React from 'react';
export type VimLogoVariant = 'wordmark' | 'heart' | 'connect' | 'console' | 'console-icon' | 'hub' | 'practice-os' | 'control-tower' | 'brain' | 'sandbox-ehr' | 'care-collaboration' | 'care-insights' | 'cde' | 'vim-direct' | 'marketplace' | 'scribe';
export type VimLogoMotion = 'breathe' | 'pulse' | 'radar' | 'reveal' | 'transmit' | 'think';
export interface VimLogoProps extends Omit<React.SVGProps<SVGSVGElement>, 'children'> {
    /**
     * `wordmark` the Vim logo (min 90px wide); `heart` the mark alone (app icon, avatar, under 90px);
     * `connect` the Vim Connect product lockup; `console` the Console lockup (icon + "Console") and
     * `console-icon` its icon;
     * `hub` the extension's outlined mark (hub launcher); `practice-os`, `control-tower`, `brain`,
     * `sandbox-ehr` the product marks; `care-collaboration`, `care-insights`, `cde`, `vim-direct`,
     * `marketplace`, `scribe` the 32px solution icons (line art in `currentColor`).
     */
    variant?: VimLogoVariant;
    /**
     * `wordmark`: `color` (2-tone cyan, light backgrounds) or `white` (dark backgrounds).
     * `heart`: `cyan` (default) or `navy` (emphasis on light).
     * `hub`: `color` (default, the cyan-to-lavender gradient), `navy` (light) or `white` (dark).
     * Ignored by the rest: product words, the Practice OS ring, Control Tower and the solution icons
     * take `currentColor`
     * (the text colour by default; set `color` to change it).
     */
    tone?: 'color' | 'white' | 'cyan' | 'navy';
    /**
     * The motion each product already uses; every one stops under reduced motion.
     * - `breathe` slow 8% swell, 3.2s loop (a calm "watching" state; any mark).
     * - `pulse` dims and shrinks, 1.4s loop (loading; the hub launcher's state).
     * - `radar` `breathe` plus three cyan rings rippling out (waiting to link; the side panel's state).
     * - `reveal` Console only: icon plus "Console" at rest; on hover the icon turns and "Vim" slides in
     *   (the Console sidebar).
     * - `transmit` Control Tower only: on hover the signal arcs pulse out from the antenna.
     * - `think` Brain only: a signal sweeps the network left to right while the mark floats (hero).
     *
     * Hover motions also run when the logo's parent is hovered, so a whole brand row can trigger them.
     */
    motion?: VimLogoMotion;
    /**
     * Product marks only (`practice-os`, `control-tower`, `brain`, `sandbox-ehr`, `hub`): set the
     * product's name beside the mark, as its own header does. The text scales with `width`.
     */
    label?: boolean;
    /** Rendered width in px; the height follows the artwork. With `label`, the mark's width. */
    width?: number;
    /** Accessible name. Default: the product name. Pass `""` when a visible label already names it. */
    title?: string;
}
/**
 * The Vim logo, the product lockups and marks, and the solution icons, drawn from the design
 * system's and each product's own SVG artwork ("always use the SVG asset"). Brand colours are
 * fixed; product words, Control Tower and the solution icons follow `currentColor`.
 */
export declare const VimLogo: React.ForwardRefExoticComponent<Omit<VimLogoProps, "ref"> & React.RefAttributes<SVGSVGElement>>;
