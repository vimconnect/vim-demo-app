import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { cn } from './cn.js';
const CARD = [
    // Small screens: icon tile on top of the label/value; side by side from `sm` up.
    'flex flex-1 min-w-[180px] flex-col items-start sm:flex-row sm:items-center gap-[var(--space-md)] p-[var(--space-lg)]',
    'rounded-[var(--radius-xl)] [background:var(--glass-bg-base)] [backdrop-filter:var(--glass-blur-md)]',
    '[font-family:var(--font-sans)]',
    '[transition:box-shadow_var(--transition-base)] hover:[box-shadow:var(--shadow-card-hover)]',
].join(' ');
/** The `<button>` form: no native chrome, left-aligned, a border slot for the selected ring. */
const BUTTON = [
    'm-0 text-left cursor-pointer border border-solid [border-color:transparent]',
    'focus-visible:outline-none focus-visible:[box-shadow:var(--shadow-focus)]',
    '[transition:box-shadow_var(--transition-base),border-color_var(--transition-base)]',
].join(' ');
const PRESSED = '[border-color:var(--color-cyan)] [box-shadow:0_0_0_3px_var(--color-cyan-15)] hover:[box-shadow:0_0_0_3px_var(--color-cyan-15)]';
const ICON_TILE = 'flex shrink-0 items-center justify-center size-[36px] rounded-[10px] border border-solid';
/** Tile fill (15%), border (30%) and glyph per tone; `info` keeps the original cyan tile. */
const TILE_TONE = {
    info: '[background:color-mix(in_srgb,var(--color-cyan)_15%,transparent)] [border-color:var(--color-cyan-30)] [color:var(--color-cyan)]',
    success: '[background:color-mix(in_srgb,var(--color-success)_15%,transparent)] [border-color:color-mix(in_srgb,var(--color-success)_30%,transparent)] [color:var(--color-success-text,var(--color-success-dark))]',
    warning: '[background:color-mix(in_srgb,var(--color-warning)_15%,transparent)] [border-color:color-mix(in_srgb,var(--color-warning)_30%,transparent)] [color:var(--color-warning-text,var(--color-warning-text-strong))]',
    error: '[background:color-mix(in_srgb,var(--color-error)_15%,transparent)] [border-color:color-mix(in_srgb,var(--color-error)_30%,transparent)] [color:var(--color-error-text,var(--color-error))]',
    neutral: '[background:var(--glass-bg-subtle)] [border-color:var(--color-border-light)] [color:var(--color-text-muted)]',
};
/** Value text per tone: the same label tokens the shared Badge reads (neutral = secondary text, like the neutral Badge). */
const VALUE_TONE = {
    info: '[color:var(--color-cyan-text)]',
    success: '[color:var(--color-success-text,var(--color-success-dark))]',
    warning: '[color:var(--color-warning-text,var(--color-warning-text-strong))]',
    error: '[color:var(--color-error-text,var(--color-error))]',
    neutral: '[color:var(--color-text-secondary)]',
};
const LABEL = [
    'm-0 mb-[var(--space-xs)] uppercase tracking-[0.04em]',
    'text-[length:var(--text-link)] [font-weight:var(--font-semibold)] [color:var(--color-text-muted)]',
].join(' ');
const VALUE = 'm-0 text-[length:var(--text-3xl)] [font-weight:var(--font-bold)]';
export function StatCard({ icon: Icon, label, value, tone = 'info', valueTone, onClick, pressed = false, className, }) {
    const body = (_jsxs(_Fragment, { children: [Icon ? (_jsx("span", { className: cn(ICON_TILE, TILE_TONE[tone]), "aria-hidden": "true", children: _jsx(Icon, { className: "size-[16px]" }) })) : null, _jsxs("span", { className: "min-w-0 block", children: [_jsx("span", { className: cn(LABEL, 'block'), children: label }), _jsx("span", { className: cn(VALUE, 'block', valueTone ? VALUE_TONE[valueTone] : '[color:var(--color-text-primary)]'), children: value })] })] }));
    if (onClick) {
        return (_jsx("button", { type: "button", "data-ui": "stat-card", onClick: onClick, "aria-pressed": pressed, className: cn(CARD, BUTTON, pressed && PRESSED, className), "data-stat-card": "", "data-pressed": pressed || undefined, children: body }));
    }
    return (_jsx("div", { className: cn(CARD, className), "data-ui": "stat-card", "data-stat-card": "", children: body }));
}
