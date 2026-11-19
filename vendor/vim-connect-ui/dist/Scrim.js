import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
import { cn } from './cn.js';
/**
 * Scrim (DS → Overlay): the dimmed layer behind a modal surface. `--vc-scrim` (a slate wash that
 * reads in both themes) with a 4px blur, full-bleed. The caller sets the layer (`z-*`) and any
 * layout for what sits on it (`className`), and an offset (`style`, e.g. `top` under a top bar).
 *
 * Hooks: `data-scrim` always; `data-ui="scrim"` unless the caller passes its own `data-ui`.
 */
export const Scrim = React.forwardRef(function Scrim({ onDismiss, blur = true, position = 'fixed', className, onMouseDown, ...rest }, ref) {
    return (_jsx("div", { ref: ref, "data-ui": "scrim", ...rest, "data-scrim": "", className: cn(position, 'inset-0 [background:var(--vc-scrim)]', blur && '[backdrop-filter:blur(4px)]', className), onMouseDown: (e) => {
            onMouseDown?.(e);
            if (onDismiss && e.target === e.currentTarget)
                onDismiss();
        } }));
});
