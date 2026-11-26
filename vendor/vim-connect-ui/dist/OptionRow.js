import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { cn } from './cn.js';
/**
 * Option row (DS → Select): one row of a dropdown list, the recipe `Select` draws its options with,
 * as a component so another listbox (the account switcher) draws the same row instead of copying it.
 *
 * Row states, flat tints and no ring: rest = transparent, hover / keyboard focus = `--color-cyan-05`,
 * selected = `--color-cyan-08` with cyan text and a medium weight (`--color-cyan-10` while also hovered or
 * focused). A selected row ends with the 14px check, then whatever `trailing` holds (badges, a row
 * action). `muted` greys a row that is pickable but secondary (an account reached through another
 * account); `disabled` also blocks it.
 *
 * It renders an `li role="option"`: the listbox, the keyboard handling and the focused index are the
 * caller's, as they are in `Select`. Hooks: `data-ui="option-row"`, `data-selected`, `data-focused`.
 *
 * Classes mean the same in Tailwind v3 and v4: arbitrary values on DS tokens only and no `!` marker.
 */
const ROW = [
    'select-option flex items-center justify-between gap-[var(--space-sm)]',
    'px-[var(--space-md)] py-[var(--space-sm)] rounded-[var(--radius-base)]',
    '[font-family:var(--font-sans)] text-[length:var(--text-base)] [color:var(--color-text-primary)]',
    'cursor-pointer select-none [transition:background_var(--transition-fast)]',
].join(' ');
const Check = () => (_jsx("svg", { className: "select-check shrink-0 [color:var(--color-cyan-text)]", width: "14", height: "14", viewBox: "0 0 14 14", fill: "none", "aria-hidden": true, children: _jsx("path", { d: "M2.5 7l3 3 6-6", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" }) }));
export const OptionRow = React.forwardRef(function OptionRow({ selected = false, focused = false, disabled = false, muted = false, children, trailing, className, onMouseDown, onClick, ...rest }, ref) {
    const tone = disabled
        ? '[color:var(--color-text-muted)] cursor-not-allowed hover:[background:transparent]'
        : selected
            ? cn('[background:var(--color-cyan-08)] [color:var(--color-cyan-text)] [font-weight:var(--font-medium)] hover:[background:var(--color-cyan-10)]', focused && '[background:var(--color-cyan-10)]')
            : cn(muted && '[color:var(--color-text-muted)]', 'hover:[background:var(--color-cyan-05)]', focused && '[background:var(--color-cyan-05)]');
    return (_jsxs("li", { ref: ref, role: "option", "aria-selected": selected, "aria-disabled": disabled || undefined, "data-ui": "option-row", "data-selected": selected ? '' : undefined, "data-focused": focused ? '' : undefined, className: cn(ROW, tone, className), 
        // A disabled row takes no pick: the click is dropped and the press only keeps focus where it was.
        onMouseDown: disabled ? (e) => e.preventDefault() : onMouseDown, onClick: disabled ? undefined : onClick, ...rest, children: [children, selected && _jsx(Check, {}), trailing] }));
});
