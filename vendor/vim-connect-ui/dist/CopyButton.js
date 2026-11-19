import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { Button } from './Button.js';
import { Tooltip } from './Tooltip.js';
import { copyText } from './copyText.js';
/** How long the button shows the check and "Copied" after a copy lands. */
export const COPIED_MS = 1500;
/**
 * Copy Button (DS → Copy Button): copies `value`, then shows a check and
 * "Copied" for a moment. Icon-only ghost by default, always with a tooltip and
 * an accessible name; `showLabel` for the text button. When `navigator.clipboard`
 * is refused it falls back to `execCommand('copy')`. It never throws: when both
 * fail it reports `false` to `onCopy`, where a product can tell the user (the
 * Console toasts).
 */
export function CopyButton({ value, label, onCopy, showLabel = false, size = 'sm', disabled, className, 'data-testid': testId, }) {
    const [copied, setCopied] = useState(false);
    const timer = useRef(null);
    useEffect(() => () => {
        if (timer.current)
            clearTimeout(timer.current);
    }, []);
    const copy = async () => {
        const ok = await copyText(value);
        if (ok) {
            setCopied(true);
            if (timer.current)
                clearTimeout(timer.current);
            timer.current = setTimeout(() => setCopied(false), COPIED_MS);
        }
        onCopy?.(ok);
    };
    const name = `Copy ${label}`;
    const button = (_jsxs(Button, { type: "button", variant: showLabel ? 'secondary' : 'ghost', iconOnly: !showLabel, size: size, disabled: disabled, className: className, "data-copy-button": "", "data-copied": copied || undefined, "data-testid": testId, "aria-label": copied ? `${label} copied` : name, onClick: () => void copy(), children: [copied ? _jsx(Check, { "aria-hidden": "true" }) : _jsx(Copy, { "aria-hidden": "true" }), showLabel && (copied ? 'Copied' : 'Copy')] }));
    return _jsx(Tooltip, { label: copied ? 'Copied' : name, children: button });
}
