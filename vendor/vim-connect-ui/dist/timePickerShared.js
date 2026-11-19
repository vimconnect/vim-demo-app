import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from './cn.js';
/** Shared hour/minute columns + floating-panel chrome for DateTimePicker and TimeField. */
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);
export const DEFAULT_HOUR = 9;
/** Must match the time option's `h-[28px]`. */
export const TIME_OPTION_HEIGHT = 28;
export const pad2 = (n) => String(n).padStart(2, '0');
/** Same open ring as Select — border + focus shadow only; keep `--color-bg-field`. */
export const TRIGGER_OPEN = '[border-color:var(--color-cyan-40)] [box-shadow:var(--shadow-focus)]';
export const POPOVER = [
    'flex flex-col gap-[10px] p-[12px] outline-none',
    '[font-family:var(--font-sans)] [color:var(--color-text-primary)]',
    'rounded-[var(--radius-xl)] border border-solid [border-color:var(--glass-border-raised)]',
    '[background:var(--color-bg-primary)]',
    '[box-shadow:var(--glass-shadow-raised)]',
].join(' ');
export const DIVIDED = 'border-0 border-t border-solid [border-color:var(--color-border-light)]';
export const SELECTED = '[background:var(--color-cyan-15)] [color:var(--color-cyan-text)] [font-weight:var(--font-semibold)] hover:[background:var(--color-cyan-20)]';
export const CELL_BASE = [
    'border-0 m-0 p-0 cursor-pointer [font-family:inherit] text-[length:var(--text-sm)]',
    '[transition:background_var(--transition-fast),color_var(--transition-fast)]',
    'focus-visible:outline-none focus-visible:[box-shadow:var(--shadow-focus)]',
].join(' ');
function timeClasses(selected) {
    return cn(CELL_BASE, 'h-[28px] shrink-0 rounded-[var(--radius-sm)]', 'bg-transparent [color:var(--color-text-primary)] hover:[background:var(--color-cyan-05)]', selected && SELECTED);
}
const TIME_COL = [
    'flex flex-1 flex-col gap-[2px] max-h-[112px] overflow-y-auto',
    '[&::-webkit-scrollbar]:w-[4px] [&::-webkit-scrollbar-track]:[background:transparent]',
    '[&::-webkit-scrollbar-thumb]:[background:var(--glass-border-base)] [&::-webkit-scrollbar-thumb]:rounded-[var(--radius-full)]',
].join(' ');
export function TimeColumns({ hour, minute, onPickHour, onPickMinute, buttonDataUi, className, hourListRef, minuteListRef, }) {
    return (_jsxs("div", { className: cn('flex gap-[8px]', className), children: [_jsx("div", { className: TIME_COL, ref: hourListRef, role: "listbox", "aria-label": "Hour", children: HOURS.map((h) => (_jsx("button", { "data-ui": buttonDataUi, type: "button", role: "option", "aria-selected": hour === h, className: timeClasses(hour === h), onClick: () => onPickHour(h), children: pad2(h) }, h))) }), _jsx("div", { className: TIME_COL, ref: minuteListRef, role: "listbox", "aria-label": "Minute", children: MINUTES.map((m) => (_jsx("button", { "data-ui": buttonDataUi, type: "button", role: "option", "aria-selected": minute === m, className: timeClasses(minute === m), onClick: () => onPickMinute(m), children: pad2(m) }, m))) })] }));
}
