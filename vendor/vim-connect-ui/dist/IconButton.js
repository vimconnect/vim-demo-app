import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
import { Button } from './Button.js';
import { Tooltip } from './Tooltip.js';
/**
 * Icon Button (DS → Icon Button): an icon-only `Button` that always has its tooltip and its
 * accessible name, from one `label`. Ghost by default; `ghost-danger` for a destructive row
 * action. A disabled one keeps its tooltip (on a wrapper, since a disabled button gets no
 * pointer events), saying `disabledReason` when there is one.
 *
 * Hooks: it keeps Button's `data-ui="button"` (and `data-icon-only`) and adds `data-icon-button`.
 */
export const IconButton = React.forwardRef(function IconButton({ label, ariaLabel, icon, disabledReason, variant = 'ghost', disabled, ...rest }, ref) {
    const button = (_jsx(Button, { ref: ref, ...rest, variant: variant, iconOnly: true, disabled: disabled, "aria-label": ariaLabel ?? label, "data-icon-button": "", children: icon }));
    if (disabled) {
        return (_jsx(Tooltip, { label: disabledReason ?? label, children: _jsx("span", { className: "inline-flex", children: button }) }));
    }
    return _jsx(Tooltip, { label: label, children: button });
});
