import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { cn } from './cn.js';
/**
 * A form field's label — the design system's Inputs section ("Label above"):
 * an uppercase eyebrow, 11px semibold at 0.06em, `--color-text-secondary`.
 * `Field` renders it for you. Use `Label` on its own where a form keeps its
 * own layout (e.g. the label and the control sit in separate grid cells).
 *
 * Tailwind on the shared tokens (the `write-ui-component` recipe), v3/v4-safe.
 */
export const LABEL_CLASSES = 'block mb-[6px] [font-family:var(--font-sans)] text-[length:var(--text-xs)] [font-weight:var(--font-semibold)] [color:var(--color-text-secondary)] uppercase tracking-[0.06em]';
const OPTIONAL = '[font-weight:var(--font-normal)] normal-case tracking-normal [color:var(--color-text-muted)]';
export const Label = React.forwardRef(({ optional, required, className, children, ...props }, ref) => (_jsxs("label", { ref: ref, className: cn(LABEL_CLASSES, className), "data-ui": "label", ...props, children: [children, required && (_jsx("span", { "aria-hidden": "true", className: "[color:var(--color-error)]", children: ' *' })), optional && _jsx("span", { className: OPTIONAL, children: " (optional)" })] })));
Label.displayName = 'Label';
