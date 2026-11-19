import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
import { cn } from './cn.js';
/**
 * A keyboard key or shortcut shown in text ("⌘K", "esc"): a small bordered cap in
 * the sans font (the DS has no monospace face). Write a combination as one Kbd
 * ("⌘K"); write separate steps as separate Kbds ("↑↓ move ⏎ run").
 */
export const Kbd = React.forwardRef(function Kbd({ className, children, ...rest }, ref) {
    return (_jsx("kbd", { ref: ref, "data-ui": "kbd", className: cn('inline-flex items-center justify-center min-w-[18px] px-[6px] py-[1px] align-[0.1em]', 'rounded-[var(--radius-sm)] border border-solid [border-color:var(--color-border-medium)] [background:var(--color-bg-primary)]', '[font-family:var(--font-sans)] text-[11px] leading-[1.4] [font-weight:var(--font-medium)] [color:var(--color-text-muted)]', 'whitespace-nowrap [font-variant-numeric:tabular-nums]', className), ...rest, children: children }));
});
