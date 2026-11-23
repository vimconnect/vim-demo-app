'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { Button } from './Button.js';
import { Kbd } from './Kbd.js';
import { Tooltip } from './Tooltip.js';
import { copyText } from './copyText.js';
import { COPIED_MS } from './copyButtonShared.js';
/**
 * Copy Button (DS → Copy Button): copies `value`, then shows a check and
 * "Copied" for a moment. Icon-only ghost by default, always with a tooltip and
 * an accessible name; `showLabel` for the text button (its `text`, `variant` and
 * `shortcut` set the words, emphasis and key hint; `copied` shows "Copied" for a
 * copy a shortcut made). When `navigator.clipboard`
 * is refused it falls back to `execCommand('copy')`. It never throws: when both
 * fail it reports `false` to `onCopy`, where a product can tell the user (the
 * Console toasts).
 */
export function CopyButton({ value, label, onCopy, showLabel = false, text = 'Copy', variant = 'secondary', shortcut, copied: copiedElsewhere = false, size = 'sm', disabled, className, 'data-testid': testId, }) {
    const [copiedHere, setCopied] = useState(false);
    const copied = copiedHere || copiedElsewhere;
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
    const button = (_jsxs(Button, { type: "button", variant: showLabel ? variant : 'ghost', iconOnly: !showLabel, size: size, disabled: disabled, className: className, "data-copy-button": "", "data-copied": copied || undefined, "data-testid": testId, "aria-label": copied ? `${label} copied` : name, onClick: () => void copy(), children: [copied ? _jsx(Check, { "aria-hidden": "true" }) : _jsx(Copy, { "aria-hidden": "true" }), showLabel && (copied ? 'Copied' : text), showLabel && shortcut && _jsx(Kbd, { children: shortcut })] }));
    return _jsx(Tooltip, { label: copied ? 'Copied' : name, children: button });
}
