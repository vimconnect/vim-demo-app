import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Clock } from 'lucide-react';
import { TextLink } from './TextLink.js';
import { cn } from './cn.js';
import { fieldVariants } from './Input.js';
import { useFloatingLayer, zFloatingPanel } from './floatingLayers.js';
import { markLabellable } from './labellable.js';
import { DEFAULT_HOUR, DIVIDED, POPOVER, TIME_OPTION_HEIGHT, TRIGGER_OPEN, TimeColumns, pad2, } from './timePickerShared.js';
/**
 * Design-system time-of-day picker — vim-ai `Design System.html` → Date/Time
 * Picker (time-only). Drop-in for `<input type="time">`: `value` / `onChange`
 * are `HH:mm` (or `''`). The native time popup is browser chrome no CSS can
 * reach, so this draws the same hour/minute columns as `DateTimePicker`, on
 * their own, with a clock glyph on the field trigger.
 *
 * Trigger: the DS input box (`fieldVariants`). Popover: Select's floating-panel
 * recipe, portaled to `document.body`, flipping above when there is more room
 * there. Selected hour/minute = `--color-cyan-text` on `--color-cyan-15`.
 * Clear empties; Done closes. Escape / outside click / page scroll close the
 * popover without closing a Modal around it.
 */
const POPOVER_WIDTH = 180;
const POPOVER_HEIGHT_ESTIMATE = 190;
const GAP = 4;
const VIEWPORT_MARGIN = 8;
function parse(value) {
    const match = /^(\d{2}):(\d{2})$/.exec(value);
    if (!match)
        return null;
    const h = Number(match[1]);
    const m = Number(match[2]);
    return h < 24 && m < 60 ? { h, m } : null;
}
/** 9:05 AM */
function formatDisplay(value) {
    const t = parse(value);
    if (!t)
        return null;
    return `${t.h % 12 || 12}:${pad2(t.m)} ${t.h < 12 ? 'AM' : 'PM'}`;
}
const TRIGGER = [
    'flex items-center justify-between gap-[var(--space-sm)] text-left cursor-pointer',
    'group/tf',
].join(' ');
export function TimeField({ value, onChange, placeholder = 'Select time', id, className, 'aria-label': ariaLabel, 'aria-describedby': ariaDescribedBy, }) {
    const selected = parse(value);
    const formattedValue = formatDisplay(value);
    const [open, setOpen] = useState(false);
    const [rect, setRect] = useState(null);
    const triggerRef = useRef(null);
    const popoverRef = useRef(null);
    const hourListRef = useRef(null);
    const minuteListRef = useRef(null);
    const computeRect = useCallback(() => {
        const el = triggerRef.current;
        if (!el)
            return null;
        const r = el.getBoundingClientRect();
        const spaceBelow = window.innerHeight - r.bottom - GAP - VIEWPORT_MARGIN;
        const spaceAbove = r.top - GAP - VIEWPORT_MARGIN;
        const flip = POPOVER_HEIGHT_ESTIMATE > spaceBelow && spaceAbove > spaceBelow;
        const left = Math.min(Math.max(r.left, VIEWPORT_MARGIN), Math.max(VIEWPORT_MARGIN, window.innerWidth - VIEWPORT_MARGIN - POPOVER_WIDTH));
        return flip
            ? { bottom: window.innerHeight - r.top + GAP, left }
            : { top: r.bottom + GAP, left };
    }, []);
    function openPopover() {
        setRect(computeRect());
        setOpen(true);
    }
    function closePopover() {
        setOpen(false);
        requestAnimationFrame(() => triggerRef.current?.focus());
    }
    const layer = useFloatingLayer(open, (node) => !!popoverRef.current?.contains(node));
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
            if (e.key === 'Escape' && layer.isTop()) {
                e.preventDefault();
                closePopover();
            }
        }
        function handleScroll(e) {
            if (e.target instanceof Node && popoverRef.current?.contains(e.target))
                return;
            closePopover();
        }
        document.addEventListener('mousedown', handlePointerDown);
        document.addEventListener('keydown', handleKeyDown, true);
        window.addEventListener('scroll', handleScroll, true);
        return () => {
            document.removeEventListener('mousedown', handlePointerDown);
            document.removeEventListener('keydown', handleKeyDown, true);
            window.removeEventListener('scroll', handleScroll, true);
        };
    }, [open, layer]);
    useEffect(() => {
        if (!open)
            return;
        if (hourListRef.current)
            hourListRef.current.scrollTop = (selected?.h ?? DEFAULT_HOUR) * TIME_OPTION_HEIGHT;
        if (minuteListRef.current)
            minuteListRef.current.scrollTop = (selected?.m ?? 0) * TIME_OPTION_HEIGHT;
        // Only on open — re-running on each pick would yank the list under the pointer.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);
    useEffect(() => {
        if (!open)
            return;
        const frame = requestAnimationFrame(() => popoverRef.current?.focus());
        return () => cancelAnimationFrame(frame);
    }, [open]);
    function pickHour(hour) {
        onChange(`${pad2(hour)}:${pad2(selected?.m ?? 0)}`);
    }
    function pickMinute(minute) {
        onChange(`${pad2(selected?.h ?? DEFAULT_HOUR)}:${pad2(minute)}`);
    }
    function handleClear() {
        onChange('');
        closePopover();
    }
    const triggerAriaLabel = ariaLabel ? (formattedValue ? `${ariaLabel}, ${formattedValue}` : ariaLabel) : undefined;
    const popover = open && rect
        ? createPortal(_jsxs("div", { ref: popoverRef, "data-ui": "time-field-panel", role: "dialog", tabIndex: -1, "aria-label": "Choose time", className: POPOVER, style: {
                position: 'fixed',
                top: rect.top,
                bottom: rect.bottom,
                left: rect.left,
                width: POPOVER_WIDTH,
                zIndex: zFloatingPanel(),
            }, children: [_jsx(TimeColumns, { hour: selected?.h, minute: selected?.m, onPickHour: pickHour, onPickMinute: pickMinute, buttonDataUi: "time-field-button", hourListRef: hourListRef, minuteListRef: minuteListRef }), _jsxs("div", { className: cn('flex justify-between pt-[8px]', DIVIDED), children: [_jsx(TextLink, { onClick: handleClear, children: "Clear" }), _jsx(TextLink, { onClick: closePopover, children: "Done" })] })] }), document.body)
        : null;
    return (_jsxs("div", { className: cn('relative block', className), "data-ui": "time-field", "data-open": open || undefined, children: [_jsxs("button", { "data-ui": "time-field-button", ref: triggerRef, type: "button", id: id, className: cn(fieldVariants(), TRIGGER, open && TRIGGER_OPEN), "aria-label": triggerAriaLabel, "aria-describedby": ariaDescribedBy, "aria-haspopup": "dialog", "aria-expanded": open, onClick: () => (open ? closePopover() : openPopover()), children: [_jsx("span", { className: cn('flex-1 min-w-0 whitespace-nowrap overflow-hidden text-ellipsis', !selected && '[color:var(--color-text-muted)]'), children: formattedValue ?? placeholder }), _jsx(Clock, { "aria-hidden": true, className: "size-4 shrink-0 [color:var(--color-text-muted)] [transition:color_var(--transition-base)] group-hover/tf:[color:var(--color-text-primary)]" })] }), popover] }));
}
markLabellable(TimeField);
