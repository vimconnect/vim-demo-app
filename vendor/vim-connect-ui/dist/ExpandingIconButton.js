'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { BUTTON_ICON_ONLY_PADDING, Button } from './Button.js';
import { cn } from './cn.js';
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
export const ExpandingIconButton = React.forwardRef(function ExpandingIconButton({ label, ariaLabel, icon, iconColor, expanded = false, selected = false, variant = 'ghost', size = 'default', className, style, type = 'button', onMouseEnter, onMouseLeave, onFocus, onBlur, ...rest }, ref) {
    const [hovered, setHovered] = React.useState(false);
    const [focused, setFocused] = React.useState(false);
    const labelTextRef = React.useRef(null);
    const [labelWidth, setLabelWidth] = React.useState(0);
    const open = expanded || selected || hovered || focused;
    React.useLayoutEffect(() => {
        const node = labelTextRef.current;
        if (!node)
            return;
        const measure = () => setLabelWidth(node.scrollWidth);
        measure();
        if (typeof ResizeObserver === 'undefined')
            return;
        const ro = new ResizeObserver(measure);
        ro.observe(node);
        return () => ro.disconnect();
    }, [label]);
    return (_jsxs(Button, { ref: ref, type: type, variant: variant, size: size, "aria-label": ariaLabel ?? label, "aria-pressed": selected || undefined, "data-expanding-icon-button": "", "data-expanded": expanded || undefined, "data-selected": selected || undefined, "data-open": open || undefined, style: {
            ...style,
            ...(iconColor ? { ['--eib-icon-color']: iconColor } : undefined),
        }, className: cn(BUTTON_ICON_ONLY_PADDING[size], 
        // Spacing comes from the label slot's width when it opens.
        'gap-0', selected && '[--btn-bg:var(--color-cyan-10)]', className), onMouseEnter: (e) => {
            setHovered(true);
            onMouseEnter?.(e);
        }, onMouseLeave: (e) => {
            setHovered(false);
            onMouseLeave?.(e);
        }, onFocus: (e) => {
            setFocused(true);
            onFocus?.(e);
        }, onBlur: (e) => {
            setFocused(false);
            onBlur?.(e);
        }, ...rest, children: [_jsx("span", { "data-ui": "eib-icon", className: "inline-flex shrink-0 [color:var(--eib-icon-color,currentColor)]", "aria-hidden": "true", children: icon }), _jsx("span", { "data-ui": "eib-label", className: "relative inline-block h-[1em] shrink-0 origin-left motion-safe:[transition:width_var(--transition-base)]", style: { width: open ? labelWidth : 0 }, "aria-hidden": "true", children: _jsx("span", { ref: labelTextRef, "data-ui": "eib-label-text", className: "inline-block whitespace-nowrap pl-[var(--space-sm)] origin-left motion-safe:[transition:transform_var(--transition-base)]", style: {
                        transform: open ? 'scaleX(1)' : 'scaleX(0)',
                        transformOrigin: 'left center',
                    }, children: label }) })] }));
});
ExpandingIconButton.displayName = 'ExpandingIconButton';
