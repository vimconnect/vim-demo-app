'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { cn } from './cn.js';
/**
 * Wrapping chip row that shows the first `limit` and hides the rest behind
 * "+N more ▾" / "Show less ▴". Cap is on item count, not measured height.
 */
export function CollapsibleChipList({ items, limit, children, className, }) {
    const [expanded, setExpanded] = useState(false);
    const overflowing = items.length > limit;
    const shown = expanded || !overflowing ? items : items.slice(0, limit);
    const hidden = items.length - limit;
    return (_jsxs("div", { "data-ui": "collapsible-chip-list", "data-expanded": overflowing && expanded ? '' : undefined, className: cn('flex flex-wrap items-center gap-[6px]', className), children: [children(shown), overflowing ? (_jsx("button", { "data-ui": "collapsible-chip-list-button", type: "button", onClick: () => setExpanded((e) => !e), className: [
                    'cursor-pointer border-0 bg-transparent p-0',
                    '[font-family:var(--font-sans)] text-[length:var(--text-sm)]',
                    '[color:var(--color-blue)]',
                    'hover:underline',
                    'focus-visible:outline-none focus-visible:[box-shadow:var(--shadow-focus)]',
                ].join(' '), "aria-expanded": expanded, "data-testid": "chip-list-toggle", children: expanded ? 'Show less ▴' : `+${hidden} more ▾` })) : null] }));
}
