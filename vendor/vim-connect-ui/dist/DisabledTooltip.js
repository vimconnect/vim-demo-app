import { jsx as _jsx } from "react/jsx-runtime";
import { Tooltip } from './Tooltip.js';
/** Tooltip on a disabled control.
 *
 * Disabled native buttons don't reliably fire mouse/focus events across
 * browsers, so Tooltip (which clones its child to attach handlers) needs a
 * wrapping element it CAN attach to. */
export function DisabledTooltip({ label, children, wrap }) {
    return (_jsx(Tooltip, { label: label, wrap: wrap, children: _jsx("span", { className: "inline-block", children: children }) }));
}
