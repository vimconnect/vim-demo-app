import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from './Button.js';
import { TextLink } from './TextLink.js';
import { Tooltip } from './Tooltip.js';
import { cn } from './cn.js';
import { fieldVariants } from './Input.js';
import { useFloatingLayer, zFloatingPanel } from './floatingLayers.js';
import { markLabellable } from './labellable.js';
import { CELL_BASE, DEFAULT_HOUR, DIVIDED, POPOVER, SELECTED, TIME_OPTION_HEIGHT, TRIGGER_OPEN, TimeColumns, pad2, } from './timePickerShared.js';
/**
 * Design-system date / date-time picker — vim-ai `Design System.html` →
 * Date/Time Picker. A drop-in for `<input type="datetime-local">` (value
 * `YYYY-MM-DDTHH:mm`) or, with `showTime={false}`, `<input type="date">`
 * (value `YYYY-MM-DD`). The native popup is browser chrome no CSS can reach,
 * so this draws the same month grid + hour/minute columns itself.
 *
 * Trigger: the DS input box (`fieldVariants`). Popover: the DS floating-panel
 * recipe Select's dropdown uses, portaled to `document.body`, flipping above
 * the trigger when there is more room there. Selected = tinted cyan fill +
 * `--color-cyan-text`; today (when not selected) = a thin inset ring only.
 * Month and year in the header are dropdowns.
 *
 * Classes mean the same in Tailwind v3 and v4: arbitrary values on DS tokens
 * only and no `!` important marker. No date library: the few helpers below
 * cover the two fixed value formats.
 */
const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const POPOVER_WIDTH = 264;
/** Flip-decision estimates only — when flipped, the panel anchors via `bottom` so the real height does not leave a gap. */
const POPOVER_HEIGHT_WITH_TIME = 460;
const POPOVER_HEIGHT_DATE_ONLY = 340;
const GAP = 4;
const VIEWPORT_MARGIN = 8;
const YEAR_RANGE_PAST = 100;
const YEAR_RANGE_FUTURE = 50;
// ── Date helpers ─────────────────────────────────────────────────────────────
function toValue(d, showTime) {
    const date = `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
    return showTime ? `${date}T${pad2(d.getHours())}:${pad2(d.getMinutes())}` : date;
}
function parseValue(value, showTime) {
    const m = (showTime ? /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/ : /^(\d{4})-(\d{2})-(\d{2})$/).exec(value);
    if (!m)
        return null;
    const [y, mo, d, h = 0, mi = 0] = m.slice(1).map(Number);
    const out = new Date(y, mo - 1, d, h, mi);
    const valid = out.getFullYear() === y && out.getMonth() === mo - 1 && out.getDate() === d && h < 24 && mi < 60;
    return valid ? out : null;
}
function formatDisplay(d, showTime) {
    const date = `${MONTHS[d.getMonth()].slice(0, 3)} ${d.getDate()}, ${d.getFullYear()}`;
    if (!showTime)
        return date;
    const h = d.getHours();
    return `${date} ${h % 12 || 12}:${pad2(d.getMinutes())} ${h < 12 ? 'AM' : 'PM'}`;
}
const sameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const addMonths = (d, n) => new Date(d.getFullYear(), d.getMonth() + n, 1);
function monthGrid(view) {
    const first = new Date(view.getFullYear(), view.getMonth(), 1);
    const last = new Date(view.getFullYear(), view.getMonth() + 1, 0);
    const start = new Date(first.getFullYear(), first.getMonth(), 1 - first.getDay());
    const count = first.getDay() + last.getDate() + (6 - last.getDay());
    return Array.from({ length: count }, (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
}
/** Newest-first year list for the header dropdown; capped by `max` when set, always includes `viewYear`. */
function yearOptions(max, nowYear, viewYear) {
    const parsedMax = max ? Number(max.slice(0, 4)) : NaN;
    let end = Number.isFinite(parsedMax) ? parsedMax : nowYear + YEAR_RANGE_FUTURE;
    let start = Math.min(nowYear, end) - YEAR_RANGE_PAST;
    // Keep the year the grid is showing pickable after arrowing past `max`.
    end = Math.max(end, viewYear);
    start = Math.min(start, viewYear);
    return Array.from({ length: Math.max(0, end - start + 1) }, (_, i) => end - i);
}
// ── Classes ──────────────────────────────────────────────────────────────────
const TRIGGER = [
    'flex items-center justify-between gap-[var(--space-sm)] text-left cursor-pointer',
    'group/dtp',
].join(' ');
function dayIso(d) {
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}
function dayClasses({ outside, selected, today, disabled, }) {
    return cn(CELL_BASE, 'flex items-center justify-center h-[30px] rounded-[var(--radius-full)]', 'bg-transparent [color:var(--color-text-primary)] hover:[background:var(--color-cyan-05)]', outside && '[color:var(--color-text-subtle)]', today && !selected && '[box-shadow:inset_0_0_0_1px_var(--color-cyan-40)]', selected && SELECTED, disabled && 'opacity-40 pointer-events-none hover:[background:transparent]');
}
const svgProps = { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true };
const CalendarGlyph = ({ className }) => (_jsxs("svg", { ...svgProps, className: className, children: [_jsx("rect", { x: "3", y: "4", width: "18", height: "18", rx: "2" }), _jsx("path", { d: "M8 2v4M16 2v4M3 10h18" })] }));
const ChevronLeftGlyph = () => (_jsx("svg", { ...svgProps, children: _jsx("path", { d: "M15 18l-6-6 6-6" }) }));
const ChevronRightGlyph = () => (_jsx("svg", { ...svgProps, children: _jsx("path", { d: "M9 18l6-6-6-6" }) }));
const ChevronDownGlyph = ({ open }) => (_jsx("svg", { width: 10, height: 10, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2.2, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true, className: cn('[transition:transform_var(--transition-fast)]', open && 'rotate-180'), children: _jsx("path", { d: "M6 9l6 6 6-6" }) }));
/** Caption chip — matches header type; open state mirrors Select's trigger. */
const CAPTION_CHIP = [
    'inline-flex items-center gap-[4px] h-[26px] cursor-pointer',
    'rounded-[var(--radius-sm)] border border-solid [border-color:transparent]',
    'px-[6px] [background:transparent]',
    'text-[length:var(--text-base)] [font-weight:var(--font-semibold)] [color:var(--color-text-primary)]',
    '[font-family:inherit] [transition:background_var(--transition-fast),border-color_var(--transition-fast)]',
    'hover:[background:var(--color-cyan-05)]',
    'focus-visible:outline-none focus-visible:[box-shadow:var(--shadow-focus)]',
].join(' ');
const CAPTION_CHIP_OPEN = '[border-color:var(--color-cyan-40)] [background:var(--color-cyan-05)]';
/** Same floating-panel recipe Select's dropdown uses. */
const CAPTION_MENU = [
    'absolute top-[calc(100%+4px)] left-0 z-[2]',
    'max-h-[196px] overflow-y-auto p-[var(--space-xs)]',
    'rounded-[var(--radius-md)] border border-solid [border-color:var(--glass-border-raised)]',
    '[background:color-mix(in_srgb,var(--color-bg-primary)_92%,transparent)]',
    '[backdrop-filter:var(--glass-blur-md)] [box-shadow:var(--glass-shadow-raised)]',
    '[&::-webkit-scrollbar]:w-[4px] [&::-webkit-scrollbar-track]:[background:transparent]',
    '[&::-webkit-scrollbar-thumb]:[background:var(--glass-border-base)] [&::-webkit-scrollbar-thumb]:rounded-[var(--radius-full)]',
].join(' ');
const CAPTION_OPTION = [
    'flex w-full items-center justify-center cursor-pointer select-none',
    'rounded-[var(--radius-base)] border-0 px-[var(--space-md)] py-[var(--space-sm)]',
    'text-[length:var(--text-sm)] [font-family:inherit] [color:var(--color-text-primary)] [background:transparent]',
    '[transition:background_var(--transition-fast),color_var(--transition-fast)]',
    'hover:[background:var(--color-cyan-05)]',
    'focus-visible:outline-none focus-visible:[box-shadow:var(--shadow-focus)]',
].join(' ');
const CAPTION_OPTION_SELECTED = '[background:var(--color-cyan-08)] [color:var(--color-cyan-text)] [font-weight:var(--font-medium)] hover:[background:var(--color-cyan-10)]';
export function DateTimePicker({ value, onChange, placeholder, id, className, 'aria-label': ariaLabel, 'aria-describedby': ariaDescribedBy, showTime = true, max, }) {
    const resolvedPlaceholder = placeholder ?? (showTime ? 'Select date & time' : 'Select date');
    const selected = parseValue(value, showTime);
    const [open, setOpen] = useState(false);
    // The month the grid shows — independent of `selected` so paging works with nothing picked.
    const [viewMonth, setViewMonth] = useState(selected ?? new Date());
    const [captionMenu, setCaptionMenu] = useState(null);
    const [rect, setRect] = useState(null);
    const triggerRef = useRef(null);
    const popoverRef = useRef(null);
    const hourListRef = useRef(null);
    const minuteListRef = useRef(null);
    const captionMenuRef = useRef(null);
    const currentCaptionOptionRef = useRef(null);
    const today = new Date();
    const nowYear = today.getFullYear();
    const viewYear = viewMonth.getFullYear();
    const years = useMemo(() => yearOptions(max, nowYear, viewYear), [max, nowYear, viewYear]);
    // Follow an externally changed value (a page's own Clear, a restored filter).
    useEffect(() => {
        const parsed = parseValue(value, showTime);
        if (parsed)
            setViewMonth(parsed);
    }, [value, showTime]);
    const computeRect = useCallback(() => {
        const el = triggerRef.current;
        if (!el)
            return null;
        const r = el.getBoundingClientRect();
        const heightEstimate = showTime ? POPOVER_HEIGHT_WITH_TIME : POPOVER_HEIGHT_DATE_ONLY;
        const spaceBelow = window.innerHeight - r.bottom - GAP - VIEWPORT_MARGIN;
        const spaceAbove = r.top - GAP - VIEWPORT_MARGIN;
        const flip = heightEstimate > spaceBelow && spaceAbove > spaceBelow;
        const left = Math.min(Math.max(r.left, VIEWPORT_MARGIN), Math.max(VIEWPORT_MARGIN, window.innerWidth - VIEWPORT_MARGIN - POPOVER_WIDTH));
        // Flipped: pin the panel's bottom edge just above the trigger (no height-estimate gap).
        return flip
            ? { bottom: window.innerHeight - r.top + GAP, left }
            : { top: r.bottom + GAP, left };
    }, [showTime]);
    function openPopover() {
        setRect(computeRect());
        setCaptionMenu(null);
        setOpen(true);
    }
    function closePopover() {
        setCaptionMenu(null);
        setOpen(false);
        requestAnimationFrame(() => triggerRef.current?.focus());
    }
    function pickMonth(month) {
        setViewMonth((m) => new Date(m.getFullYear(), month, 1));
        setCaptionMenu(null);
    }
    function pickYear(year) {
        setViewMonth((m) => new Date(year, m.getMonth(), 1));
        setCaptionMenu(null);
    }
    function toggleCaptionMenu(kind) {
        setCaptionMenu((current) => (current === kind ? null : kind));
    }
    // Centre the open caption list on the current value without scrolling ancestors.
    useLayoutEffect(() => {
        if (!captionMenu)
            return;
        const list = captionMenuRef.current;
        const option = currentCaptionOptionRef.current;
        if (!list || !option)
            return;
        list.scrollTop = option.offsetTop - list.clientHeight / 2 + option.clientHeight / 2;
    }, [captionMenu]);
    // Joins the floating-layer stack while open, so a Popover around it closes only the picker.
    const layer = useFloatingLayer(open, (node) => !!popoverRef.current?.contains(node));
    // Close on outside click, Escape, or a page scroll (not one inside the popover).
    useEffect(() => {
        if (!open)
            return;
        function handlePointerDown(e) {
            const t = e.target;
            if (!triggerRef.current?.contains(t) && !popoverRef.current?.contains(t) && !layer.insideLayerAbove(t)) {
                closePopover();
            }
        }
        function handleKeyDown(e) {
            // Handled here, so a modal around the picker closes only the popover.
            if (e.key === 'Escape' && layer.isTop()) {
                e.preventDefault();
                if (captionMenu) {
                    setCaptionMenu(null);
                    return;
                }
                closePopover();
            }
        }
        function handleScroll(e) {
            if (e.target instanceof Node && popoverRef.current?.contains(e.target))
                return;
            closePopover();
        }
        document.addEventListener('mousedown', handlePointerDown);
        // Capture phase: handled before a surrounding Modal's own Escape listener.
        document.addEventListener('keydown', handleKeyDown, true);
        window.addEventListener('scroll', handleScroll, true);
        return () => {
            document.removeEventListener('mousedown', handlePointerDown);
            document.removeEventListener('keydown', handleKeyDown, true);
            window.removeEventListener('scroll', handleScroll, true);
        };
    }, [open, layer, captionMenu]);
    useEffect(() => {
        if (!open || !showTime)
            return;
        if (hourListRef.current)
            hourListRef.current.scrollTop = (selected?.getHours() ?? DEFAULT_HOUR) * TIME_OPTION_HEIGHT;
        if (minuteListRef.current)
            minuteListRef.current.scrollTop = (selected?.getMinutes() ?? 0) * TIME_OPTION_HEIGHT;
        // Only on open — re-running on each pick would yank the list under the pointer.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, showTime]);
    // Focus the dialog on open so Escape and the keyboard keep working.
    useEffect(() => {
        if (!open)
            return;
        const frame = requestAnimationFrame(() => popoverRef.current?.focus());
        return () => cancelAnimationFrame(frame);
    }, [open]);
    const commit = (next) => onChange(toValue(next, showTime));
    function pickDay(day) {
        if (max && dayIso(day) > max)
            return;
        const next = new Date(day.getFullYear(), day.getMonth(), day.getDate(), showTime ? (selected?.getHours() ?? DEFAULT_HOUR) : 0, showTime ? (selected?.getMinutes() ?? 0) : 0);
        setCaptionMenu(null);
        setViewMonth(day);
        commit(next);
    }
    function pickHour(hour) {
        const base = selected ?? new Date();
        commit(new Date(base.getFullYear(), base.getMonth(), base.getDate(), hour, selected?.getMinutes() ?? 0));
    }
    function pickMinute(minute) {
        const base = selected ?? new Date();
        commit(new Date(base.getFullYear(), base.getMonth(), base.getDate(), selected?.getHours() ?? DEFAULT_HOUR, minute));
    }
    function handleClear() {
        onChange('');
        closePopover();
    }
    function handleToday() {
        const now = new Date();
        if (max && dayIso(now) > max)
            return;
        setViewMonth(now);
        commit(now);
    }
    const todayBlocked = !!(max && dayIso(today) > max);
    const days = monthGrid(viewMonth);
    const formattedValue = selected ? formatDisplay(selected, showTime) : null;
    // An explicit name keeps From/To distinct after a pick; include the value so it is still announced.
    const triggerAriaLabel = ariaLabel ? (formattedValue ? `${ariaLabel}, ${formattedValue}` : ariaLabel) : undefined;
    const popover = open && rect
        ? createPortal(_jsxs("div", { ref: popoverRef, "data-ui": "date-time-picker-panel", role: "dialog", tabIndex: -1, "aria-label": showTime ? 'Choose date and time' : 'Choose date', className: POPOVER, style: {
                position: 'fixed',
                top: rect.top,
                bottom: rect.bottom,
                left: rect.left,
                width: POPOVER_WIDTH,
                zIndex: zFloatingPanel(),
            }, children: [_jsxs("div", { className: "flex items-center justify-between gap-[var(--space-xs)]", children: [_jsxs("div", { className: "flex min-w-0 items-center gap-[2px]", children: [_jsxs("span", { className: "relative", children: [_jsxs("button", { type: "button", "data-ui": "date-time-picker-button", className: cn(CAPTION_CHIP, captionMenu === 'month' && CAPTION_CHIP_OPEN), "aria-label": "Month", "aria-haspopup": "listbox", "aria-expanded": captionMenu === 'month', onClick: () => toggleCaptionMenu('month'), children: [_jsx("span", { className: "truncate", children: MONTHS[viewMonth.getMonth()] }), _jsx("span", { className: "[color:var(--color-text-muted)]", children: _jsx(ChevronDownGlyph, { open: captionMenu === 'month' }) })] }), captionMenu === 'month' && (_jsx("div", { ref: captionMenuRef, role: "listbox", "aria-label": "Month", className: cn(CAPTION_MENU, 'min-w-[132px]'), children: MONTHS.map((label, month) => {
                                                const isCurrent = month === viewMonth.getMonth();
                                                return (_jsx("button", { type: "button", "data-ui": "date-time-picker-button", role: "option", "aria-selected": isCurrent, ref: isCurrent ? currentCaptionOptionRef : undefined, className: cn(CAPTION_OPTION, 'justify-start', isCurrent && CAPTION_OPTION_SELECTED), onClick: () => pickMonth(month), children: label }, label));
                                            }) }))] }), _jsxs("span", { className: "relative", children: [_jsxs("button", { type: "button", "data-ui": "date-time-picker-button", className: cn(CAPTION_CHIP, captionMenu === 'year' && CAPTION_CHIP_OPEN), "aria-label": "Year", "aria-haspopup": "listbox", "aria-expanded": captionMenu === 'year', onClick: () => toggleCaptionMenu('year'), children: [viewYear, _jsx("span", { className: "[color:var(--color-text-muted)]", children: _jsx(ChevronDownGlyph, { open: captionMenu === 'year' }) })] }), captionMenu === 'year' && (_jsx("div", { ref: captionMenuRef, role: "listbox", "aria-label": "Year", className: cn(CAPTION_MENU, 'min-w-[84px]'), children: years.map((year) => {
                                                const isCurrent = year === viewYear;
                                                return (_jsx("button", { type: "button", "data-ui": "date-time-picker-button", role: "option", "aria-selected": isCurrent, ref: isCurrent ? currentCaptionOptionRef : undefined, className: cn(CAPTION_OPTION, 'tabular-nums', isCurrent && CAPTION_OPTION_SELECTED), onClick: () => pickYear(year), children: year }, year));
                                            }) }))] })] }), _jsxs("div", { className: "flex shrink-0 items-center", children: [_jsx(Tooltip, { label: "Previous month", children: _jsx(Button, { variant: "ghost", iconOnly: true, size: "sm", "aria-label": "Previous month", onClick: () => {
                                            setCaptionMenu(null);
                                            setViewMonth((m) => addMonths(m, -1));
                                        }, children: _jsx(ChevronLeftGlyph, {}) }) }), _jsx(Tooltip, { label: "Next month", children: _jsx(Button, { variant: "ghost", iconOnly: true, size: "sm", "aria-label": "Next month", onClick: () => {
                                            setCaptionMenu(null);
                                            setViewMonth((m) => addMonths(m, 1));
                                        }, children: _jsx(ChevronRightGlyph, {}) }) })] })] }), _jsx("div", { className: "grid grid-cols-7 text-center text-[length:var(--text-xs)] [font-weight:var(--font-medium)] [color:var(--color-text-muted)]", "aria-hidden": "true", children: WEEKDAY_LABELS.map((label, i) => (_jsx("span", { children: label }, i))) }), _jsx("div", { className: "grid grid-cols-7 gap-[2px]", "aria-label": "Day", children: days.map((day) => {
                        const isSelected = !!selected && sameDay(day, selected);
                        const isToday = sameDay(day, today);
                        const disabled = !!(max && dayIso(day) > max);
                        return (_jsx("button", { "data-ui": "date-time-picker-button", type: "button", disabled: disabled, "aria-pressed": isSelected, "aria-current": isToday ? 'date' : undefined, className: dayClasses({
                                outside: day.getMonth() !== viewMonth.getMonth(),
                                selected: isSelected,
                                today: isToday,
                                disabled,
                            }), onClick: () => pickDay(day), children: day.getDate() }, day.toISOString()));
                    }) }), showTime && (_jsx(TimeColumns, { className: cn('pt-[10px]', DIVIDED), hour: selected?.getHours(), minute: selected?.getMinutes(), onPickHour: pickHour, onPickMinute: pickMinute, buttonDataUi: "date-time-picker-button", hourListRef: hourListRef, minuteListRef: minuteListRef })), _jsxs("div", { className: cn('flex justify-between pt-[8px]', DIVIDED), children: [_jsx(TextLink, { onClick: handleClear, children: "Clear" }), _jsx(TextLink, { onClick: handleToday, disabled: todayBlocked, children: "Today" })] })] }), document.body)
        : null;
    return (_jsxs("div", { className: cn('relative block', className), "data-ui": "date-time-picker", "data-open": open || undefined, children: [_jsxs("button", { "data-ui": "date-time-picker-button", ref: triggerRef, type: "button", id: id, className: cn(fieldVariants(), TRIGGER, open && TRIGGER_OPEN), "aria-label": triggerAriaLabel, "aria-describedby": ariaDescribedBy, "aria-haspopup": "dialog", "aria-expanded": open, onClick: () => (open ? closePopover() : openPopover()), children: [_jsx("span", { className: cn('flex-1 min-w-0 whitespace-nowrap overflow-hidden text-ellipsis', !selected && '[color:var(--color-text-muted)]'), children: formattedValue ?? resolvedPlaceholder }), _jsx(CalendarGlyph, { className: "shrink-0 [color:var(--color-text-muted)] [transition:color_var(--transition-base)] group-hover/dtp:[color:var(--color-text-primary)]" })] }), popover] }));
}
markLabellable(DateTimePicker);
