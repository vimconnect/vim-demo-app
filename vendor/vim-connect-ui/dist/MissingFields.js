'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef } from 'react';
import { AnchoredPanel } from './AnchoredPanel.js';
import { useHoverPanel } from './useHoverPanel.js';
import { cn } from './cn.js';
/**
 * Design-system missing-fields panel — vim-ai `Design System.html` → Missing
 * Fields Panel.
 *
 * What one tab (or a whole form) is still missing, as a hover / click panel
 * rather than a tooltip: a tooltip's fixed-width wrapped box turned a dozen
 * whole-sentence questions into an unscrollable wall. Built on
 * `AnchoredPanel` (flip above/below, cap to the viewport, scroll), 320px wide.
 *
 * The panel is a plain card (`--color-bg-card`, hairline border,
 * `--shadow-card-hover`, `--radius-md`, 10px / 12px padding); only the heading
 * and the 5px bullets carry the `accent` (default `--color-warning-text-strong`),
 * so a caller whose subject has its own severity passes that colour. The list
 * caps at 12 with "…and N more"; `onSeeAll` adds an escape hatch.
 *
 * `MissingFieldsHover` is the usual entry point: it wraps a trigger (a count
 * pill, a disabled submit button) and owns the hover lifecycle.
 *
 * Classes mean the same in Tailwind v3 and v4: arbitrary values on DS tokens
 * only and no `!` important marker.
 */
const PANEL_LIMIT = 12;
const DEFAULT_ACCENT = 'var(--color-warning-text-strong)';
const PANEL = [
    'p-[10px_12px] rounded-[var(--radius-md)] [background:var(--color-bg-card)]',
    '[border-color:var(--color-border-light)] [box-shadow:var(--shadow-card-hover)] [backdrop-filter:none]',
].join(' ');
export function MissingFieldsPanel({ labels, anchorRef, onDismiss, heading, onKeepOpen, onSeeAll, seeAllLabel = 'See everything outstanding', accent = DEFAULT_ACCENT, }) {
    const shown = labels.slice(0, PANEL_LIMIT);
    const rest = labels.length - shown.length;
    const title = heading ?? `${labels.length} missing on this tab`;
    return (_jsxs(AnchoredPanel, { anchorRef: anchorRef, onDismiss: onDismiss, width: 320, ariaLabel: title, onMouseEnter: onKeepOpen, onMouseLeave: onKeepOpen ? onDismiss : undefined, className: PANEL, children: [_jsx("div", { className: "mb-[6px] text-[10px] [font-weight:var(--font-bold)] uppercase tracking-[0.06em]", style: { color: accent }, children: title }), _jsx("div", { className: "flex flex-col gap-[2px]", children: shown.map((label) => (_jsxs("div", { className: "flex min-w-0 items-start gap-[var(--space-sm)] px-[4px] py-[3px]", children: [_jsx("span", { className: "mt-[6px] size-[5px] shrink-0 rounded-[var(--radius-full)]", style: { background: accent }, "aria-hidden": "true" }), _jsx("span", { className: "text-[11.5px] leading-[1.35] [color:var(--color-text-primary)]", children: label })] }, label))) }), rest > 0 && _jsxs("div", { className: "mt-[6px] pl-[4px] text-[10.5px] [color:var(--color-text-subtle)]", children: ["\u2026and ", rest, " more"] }), onSeeAll && (_jsx("button", { "data-ui": "missing-fields-button", type: "button", onClick: onSeeAll, className: cn('mt-[6px] flex w-full items-center justify-between rounded-[var(--radius-sm)] border-0 bg-transparent px-[4px] py-[3px] cursor-pointer [font-family:inherit]', 'text-[10.5px] [font-weight:var(--font-semibold)] [color:var(--color-cyan-text)] hover:[background:var(--color-cyan-15)]', 'focus-visible:outline-none focus-visible:[box-shadow:var(--shadow-focus)]'), children: seeAllLabel }))] }));
}
/** Wraps a trigger so hovering it opens its missing-fields panel. */
export function MissingFieldsHover({ labels, heading, onSeeAll, seeAllLabel, accent, cursor, children }) {
    const anchorRef = useRef(null);
    const panel = useHoverPanel();
    return (_jsxs("span", { ref: anchorRef, className: "inline-flex", style: cursor ? { cursor } : undefined, onMouseEnter: panel.show, onMouseLeave: panel.scheduleClose, children: [children, panel.open && (_jsx(MissingFieldsPanel, { labels: labels, heading: heading, anchorRef: anchorRef, onDismiss: panel.close, onKeepOpen: panel.show, seeAllLabel: seeAllLabel, accent: accent, onSeeAll: onSeeAll
                    ? () => {
                        panel.close();
                        onSeeAll();
                    }
                    : undefined }))] }));
}
