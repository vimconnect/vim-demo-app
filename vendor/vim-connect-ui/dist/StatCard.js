import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from './cn.js';
const CARD = [
    // Small screens: icon tile on top of the label/value; side by side from `sm` up.
    'flex flex-1 min-w-[180px] flex-col items-start sm:flex-row sm:items-center gap-[var(--space-md)] p-[var(--space-lg)]',
    'rounded-[var(--radius-xl)] [background:var(--glass-bg-base)] [backdrop-filter:var(--glass-blur-md)]',
    '[font-family:var(--font-sans)]',
    '[transition:box-shadow_var(--transition-base)] hover:[box-shadow:var(--shadow-card-hover)]',
].join(' ');
const ICON_TILE = [
    'flex shrink-0 items-center justify-center size-[36px] rounded-[10px]',
    '[background:color-mix(in_srgb,var(--color-cyan)_15%,transparent)]',
    'border border-solid [border-color:var(--color-cyan-30)] [color:var(--color-cyan)]',
].join(' ');
const LABEL = [
    'm-0 mb-[var(--space-xs)] uppercase tracking-[0.04em]',
    'text-[length:var(--text-link)] [font-weight:var(--font-semibold)] [color:var(--color-text-muted)]',
].join(' ');
const VALUE = 'm-0 text-[length:var(--text-3xl)] [font-weight:var(--font-bold)] [color:var(--color-text-primary)]';
export function StatCard({ icon: Icon, label, value, className }) {
    return (_jsxs("div", { className: cn(CARD, className), "data-stat-card": "", children: [_jsx("div", { className: ICON_TILE, "aria-hidden": "true", children: _jsx(Icon, { className: "size-[16px]" }) }), _jsxs("div", { className: "min-w-0", children: [_jsx("p", { className: LABEL, children: label }), _jsx("p", { className: VALUE, children: value })] })] }));
}
