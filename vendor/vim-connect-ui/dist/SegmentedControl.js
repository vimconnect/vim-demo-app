'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { Tooltip } from './Tooltip.js';
import { cn } from './cn.js';
const TRACK = [
    'segmented-control inline-flex gap-[2px] p-[2px]',
    '[background:var(--color-bg-subtle)] border border-solid [border-color:var(--color-border-medium)] rounded-[var(--radius-md)]',
].join(' ');
const OPTION = [
    'segmented-control__option inline-flex items-center gap-[var(--space-xs)] m-0 border-0 cursor-pointer whitespace-nowrap',
    'rounded-[var(--radius-sm)] [font-family:var(--font-sans)] text-[length:var(--text-xs)] [font-weight:var(--font-semibold)]',
    'bg-transparent [color:var(--color-text-secondary)] hover:[color:var(--color-text-primary)]',
    '[transition:background-color_var(--transition-fast),color_var(--transition-fast)]',
    'focus-visible:outline-none focus-visible:[box-shadow:var(--shadow-focus)]',
].join(' ');
// Order matters: DISABLED before SELECTED in `cn`.
const DISABLED = 'segmented-control__option--disabled opacity-40 cursor-not-allowed hover:[color:var(--color-text-secondary)]';
const SELECTED = 'segmented-control__option--selected [background:var(--color-cyan-15)] [color:var(--color-cyan-text)] hover:[color:var(--color-cyan-text)]';
// `motion-safe:` keeps the animation out of the CSS entirely under
// prefers-reduced-motion. A separate `animation: none` override lost to these
// utilities on source order (same specificity), so the pick still played.
const MOTION = {
    pop: 'motion-safe:[&_svg]:[animation:vc-segmented-pop_300ms_var(--easing-spring)]',
    spin: 'motion-safe:[&_svg]:[animation:vc-segmented-spin_300ms_var(--easing-spring)]',
    swing: 'motion-safe:[&_svg]:[animation:vc-segmented-swing_300ms_var(--easing-spring)]',
};
// The pick animations. React 19 hoists and de-dupes this by `href`, so it lands
// once per page however many controls render; no product stylesheet needed.
const KEYFRAMES = `
@keyframes vc-segmented-pop { from { transform: scale(0.6); opacity: 0.4; } to { transform: none; opacity: 1; } }
@keyframes vc-segmented-spin { from { transform: rotate(-90deg) scale(0.6); } to { transform: none; } }
@keyframes vc-segmented-swing { from { transform: rotate(-30deg); } to { transform: none; } }
`;
export function SegmentedControl(props) {
    const { value, onChange, ariaLabel, className } = props;
    const [picked, setPicked] = useState(null);
    if (props.variant === 'icon') {
        const options = props.options;
        const current = options.findIndex((o) => o.value === value);
        // A radio group is one tab stop; the arrows move and pick (WAI-ARIA radio group).
        const onKeyDown = (e) => {
            const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
            if (!step || options.length === 0)
                return;
            e.preventDefault();
            const index = (Math.max(current, 0) + step + options.length) % options.length;
            const next = options[index];
            onChange(next.value);
            setPicked(next.value);
            e.currentTarget.querySelectorAll('[data-value]')[index]?.focus();
        };
        return (_jsxs("div", { className: cn(TRACK, className), role: "radiogroup", "aria-label": ariaLabel, onKeyDown: onKeyDown, children: [_jsx("style", { href: "vc-segmented-keyframes", precedence: "default", children: KEYFRAMES }), options.map((option, i) => {
                    const selected = option.value === value;
                    const isPicked = picked === option.value;
                    const motion = option.iconMotion ?? 'pop';
                    const Icon = option.icon;
                    return (_jsx(Tooltip, { label: option.label, children: _jsx("button", { "data-ui": "segmented-control-button", type: "button", role: "radio", "aria-checked": selected, "aria-label": option.ariaLabel ?? option.label, "data-value": option.value, tabIndex: selected || (current === -1 && i === 0) ? 0 : -1, onClick: () => {
                                onChange(option.value);
                                setPicked(option.value);
                            }, onAnimationEnd: () => setPicked(null), className: cn(OPTION, 'segmented-control__option--icon px-[var(--space-sm)] py-[4px] [&_svg]:block [&_svg]:size-[14px]', `segmented-control__option--motion-${motion}`, selected && SELECTED, isPicked && cn('segmented-control__option--picked', MOTION[motion])), children: _jsx(Icon, { "aria-hidden": "true" }) }) }, option.value));
                })] }));
    }
    return (_jsx("div", { className: cn(TRACK, className), role: "group", "aria-label": ariaLabel, children: props.options.map((option) => {
            const selected = option.value === value;
            const disabled = option.disabled || Boolean(option.disabledReason);
            const button = (_jsxs("button", { "data-ui": "segmented-control-button", type: "button", "aria-pressed": selected, "aria-disabled": disabled || undefined, onClick: () => {
                    if (!disabled)
                        onChange(option.value);
                }, className: cn(OPTION, 'px-[var(--space-md)] py-[2px]', disabled && DISABLED, selected && SELECTED), children: [option.label, option.count !== undefined && (_jsxs(_Fragment, { children: [' ', _jsx("span", { className: "segmented-control__count [font-weight:var(--font-medium)] [color:var(--color-text-muted)]", children: option.count })] }))] }, option.value));
            return option.disabledReason ? (_jsx(Tooltip, { label: option.disabledReason, children: button }, option.value)) : (button);
        }) }));
}
