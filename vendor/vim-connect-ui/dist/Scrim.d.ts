import React from 'react';
export interface ScrimProps extends React.HTMLAttributes<HTMLDivElement> {
    /**
     * Called when the scrim itself is pressed (not what sits on it), for a surface that closes on a
     * click outside. On mousedown, so a drag that starts on the sheet and ends here doesn't close it.
     */
    onDismiss?: () => void;
    /** The 4px blur behind the tint. Default true. */
    blur?: boolean;
    /** `fixed` covers the viewport (default); `absolute` covers the nearest positioned ancestor. */
    position?: 'fixed' | 'absolute';
}
/**
 * Scrim (DS → Overlay): the dimmed layer behind a modal surface. `--vc-scrim` (a slate wash that
 * reads in both themes) with a 4px blur, full-bleed. The caller sets the layer (`z-*`) and any
 * layout for what sits on it (`className`), and an offset (`style`, e.g. `top` under a top bar).
 *
 * Hooks: `data-scrim` always; `data-ui="scrim"` unless the caller passes its own `data-ui`.
 */
export declare const Scrim: React.ForwardRefExoticComponent<ScrimProps & React.RefAttributes<HTMLDivElement>>;
