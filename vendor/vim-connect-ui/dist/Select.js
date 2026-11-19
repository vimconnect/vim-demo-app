import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef, useEffect, useLayoutEffect, useId, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { cn } from './cn.js';
import { markLabellable } from './labellable.js';
import { computeDropdownRect } from './dropdownRect.js';
import { useFloatingLayer, zFloatingPanel } from './floatingLayers.js';
import { Tooltip } from './Tooltip.js';
import { Spinner } from './Spinner.js';
/**
 * Single-choice dropdown — the design system's Select section (vim-ai
 * `Design System.html` → Select / Dropdown): one trigger, one panel.
 *
 * Trigger: 32px full pill (a dropdown, unlike a typed-into field), the field
 * fill and stroke (`--color-bg-field` / `--color-border-field`, the same as
 * `Input`, so a filter row reads as one set), 13px text, and the same cyan focus
 * ring as `Input` while focused or open. Panel: a floating surface (solid 92%
 * `--color-bg-primary`, `--glass-border-raised`, `--radius-md`, raised shadow)
 * portalled to `<body>` and flipped above the trigger when there's no room below.
 * Rows: transparent at rest, `--color-cyan-05` on hover or keyboard focus;
 * selected = `--color-cyan-text` on `--color-cyan-08` with a checkmark.
 *
 * Accessibility: the trigger is a `combobox` button (`aria-expanded`,
 * `aria-haspopup="listbox"`), the panel a `listbox` of `option`s. Keyboard:
 * Enter/Space/ArrowDown open, arrows move, Enter picks, Escape/Tab close, and
 * typing a letter jumps to the next option starting with it.
 *
 * Tailwind on the shared tokens (the `write-ui-component` recipe), v3/v4-safe.
 * Searching a long or remote list (the combobox case): `searchable`, `onSearchChange` for a
 * server-side search, `loading`, `emptyMessage`, a muted `description` line per option (matched
 * by the search too) and `clearable` for a filter whose empty value means "all".
 *
 * Each part also keeps a plain hook class (`select-root`, `select-trigger`,
 * `select-value`, `select-placeholder`, `select-chevron`, `select-dropdown`,
 * `select-option`, `select-check`) with no styles of its own, so a product can
 * restyle one context (e.g. a compact table pager) without a new variant.
 */
// How long to wait after the last keypress before resetting the type-ahead buffer.
const TYPEAHEAD_RESET_MS = 600;
/** The panel's max height. */
const DROPDOWN_MAX_HEIGHT = 220;
/** A searchable panel: the 32px search field and its 4px gap below (`SEARCH_FIELD`), then rows up to 260px (DS). */
const SEARCH_FIELD_BLOCK = 32 + 4;
const SEARCHABLE_MAX_HEIGHT = 260 + SEARCH_FIELD_BLOCK;
/** Enough for ~3 rows — below this, flipping is better than shrinking. */
const DROPDOWN_MIN_HEIGHT = 120;
/** One option's height, for estimating the list before it exists. */
const OPTION_HEIGHT = 34;
/** The clear button's size, and the slot the trigger keeps for it, by trigger size. */
const CLEAR_SIZE = { default: 20, sm: 16 };
/** The panel's own padding (`--space-xs`, 4px), top and bottom. */
const DROPDOWN_PADDING_Y = 4;
/** Past this many options a Select is searchable unless `searchable={false}` (DS: past ~8). */
export const SEARCHABLE_FROM = 9;
const TRIGGER = [
    'select-trigger flex items-center justify-between gap-[var(--space-sm)] w-full h-[32px] px-[13px] m-0',
    'cursor-pointer text-left outline-none rounded-[var(--radius-full)]',
    '[background:var(--color-bg-field)] border border-solid [border-color:var(--color-border-field)]',
    '[color:var(--color-text-primary)] [font-family:var(--font-sans)] text-[length:var(--text-base)]',
    '[transition:box-shadow_var(--transition-base),border-color_var(--transition-base)]',
    'focus:[border-color:var(--color-cyan-40)] focus:[box-shadow:var(--shadow-focus)]',
    'disabled:opacity-[0.55] disabled:cursor-not-allowed',
].join(' ');
const TRIGGER_SM = 'h-[24px] px-[10px] gap-[6px] text-[length:var(--text-xs)] [background:var(--color-bg-primary)] [border-color:var(--color-border-medium)]';
const TRIGGER_OPEN = '[border-color:var(--color-cyan-40)] [box-shadow:var(--shadow-focus)]';
// A selected option with a `labelNode` (text + pills) grows up to two lines instead of clipping.
const TRIGGER_RICH = 'h-auto min-h-[32px] py-[4px]';
const PANEL = [
    'select-dropdown m-0 list-none p-[var(--space-xs)] min-w-[96px] overflow-y-auto',
    'rounded-[var(--radius-md)] border border-solid [border-color:var(--glass-border-raised)]',
    '[background:color-mix(in_srgb,var(--color-bg-primary)_92%,transparent)]',
    '[backdrop-filter:var(--glass-blur-md)] [box-shadow:var(--glass-shadow-raised)]',
    '[&::-webkit-scrollbar]:w-[4px] [&::-webkit-scrollbar-track]:[background:transparent]',
    '[&::-webkit-scrollbar-thumb]:[background:var(--glass-border-base)] [&::-webkit-scrollbar-thumb]:rounded-[var(--radius-full)]',
].join(' ');
// The DS searchable panel's field: the bordered `.search-field` pill, never a flat row with a rule.
const SEARCH_FIELD = [
    'search-field flex shrink-0 items-center gap-[var(--space-sm)] h-[32px] px-[10px] mb-[var(--space-xs)]',
    'rounded-[var(--radius-full)] border border-solid [border-color:var(--color-border-medium)] [background:var(--color-bg-field)]',
    'focus-within:[border-color:var(--color-cyan-40)] focus-within:[box-shadow:var(--shadow-focus)]',
].join(' ');
const SEARCH_INPUT = [
    'min-w-0 flex-1 border-0 p-0 outline-none [background:none] shadow-none',
    '[font-family:var(--font-sans)] text-[length:var(--text-base)] [color:var(--color-text-primary)]',
    'placeholder:[color:var(--color-text-muted)] placeholder:opacity-100',
].join(' ');
// The searchable panel's keyboard highlight, drawn over the selected tint too (DS).
const SEARCH_HIGHLIGHT = '[background:var(--color-bg-secondary)] [box-shadow:inset_0_0_0_1px_var(--color-cyan-30)]';
const NO_MATCH = 'm-0 px-[var(--space-md)] py-[var(--space-sm)] text-[length:var(--text-base)] [color:var(--color-text-muted)]';
const OPTION = [
    'select-option flex items-center justify-between gap-[var(--space-sm)]',
    'px-[var(--space-md)] py-[var(--space-sm)] rounded-[var(--radius-base)]',
    '[font-family:var(--font-sans)] text-[length:var(--text-base)] [color:var(--color-text-primary)]',
    'cursor-pointer select-none [transition:background_var(--transition-fast)]',
].join(' ');
function optionClasses({ selected, focused, disabled }) {
    if (disabled) {
        return cn(OPTION, '[color:var(--color-text-muted)] cursor-not-allowed hover:[background:transparent]');
    }
    if (selected) {
        return cn(OPTION, '[background:var(--color-cyan-08)] [color:var(--color-cyan-text)] [font-weight:var(--font-medium)] hover:[background:var(--color-cyan-10)]', focused && '[background:var(--color-cyan-10)]');
    }
    return cn(OPTION, 'hover:[background:var(--color-cyan-05)]', focused && '[background:var(--color-cyan-05)]');
}
export function Select({ options, value, onChange, placeholder, required, disabled, className, id, ariaLabel, 'aria-describedby': describedBy, 'aria-labelledby': labelledBy, 'data-testid': testId, size = 'default', searchable: searchableProp, searchPlaceholder = 'Type to filter…', onSearchChange, loading = false, emptyMessage = 'No match.', clearable = false, clearLabel = 'Clear', disabledReason, }) {
    const searchable = searchableProp ?? (onSearchChange !== undefined || options.length >= SEARCHABLE_FROM);
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const panelRef = useRef(null);
    const [focusedIdx, setFocusedIdx] = useState(-1);
    const [dropdownRect, setDropdownRect] = useState(null);
    const triggerRef = useRef(null);
    // Where the trigger sat when the list opened: a scroll that didn't move it (one already
    // in flight when the user clicked, or in an unrelated container) leaves the list open.
    const openedAtRef = useRef(null);
    const listRef = useRef(null);
    const generatedId = useId();
    const selectId = id ?? generatedId;
    // Type-ahead: tracks the last typed char and cycles through matches.
    const typeaheadRef = useRef({ char: '', timer: null });
    // Joins the floating-layer stack while open, so a Popover around it closes only the list.
    useFloatingLayer(open, (node) => !!panelRef.current?.contains(node));
    const term = searchable ? query.trim().toLowerCase() : '';
    // A server-side search has already narrowed `options` to the text, by fields the panel may not
    // see (an account's owner), so the panel lists them as they come.
    const remote = onSearchChange !== undefined;
    const visible = term && !remote
        ? options.filter((o) => o.label.toLowerCase().includes(term) || !!o.description?.toLowerCase().includes(term))
        : options;
    // What the user typed: reported for a server-side search. Opening and closing reset the field
    // without reporting it, so the options (and the picked one) stay as the last search left them.
    const typeQuery = (next) => {
        setQuery(next);
        onSearchChange?.(next);
    };
    // A server-side search can drop the picked option from `options` on its next page; keep the
    // last one seen for the value, so the trigger still names it.
    const found = options.find((o) => o.value === value);
    const lastSelectedRef = useRef(undefined);
    if (found)
        lastSelectedRef.current = found;
    const selectedOption = found ?? (lastSelectedRef.current?.value === value && value !== '' ? lastSelectedRef.current : undefined);
    const displayLabel = selectedOption?.label ?? placeholder ?? '';
    const computeRect = useCallback(() => {
        if (!triggerRef.current)
            return null;
        const at = triggerRef.current.getBoundingClientRect();
        openedAtRef.current = { top: at.top, left: at.left };
        // The list hasn't rendered yet, so estimate it from the option count; the cap applies.
        const cap = searchable ? SEARCHABLE_MAX_HEIGHT : DROPDOWN_MAX_HEIGHT;
        const field = searchable ? SEARCH_FIELD_BLOCK : 0;
        const wanted = Math.min(cap, field + options.length * OPTION_HEIGHT + 2 * DROPDOWN_PADDING_Y);
        return computeDropdownRect(triggerRef.current.getBoundingClientRect(), wanted, {
            maxHeight: cap,
            minHeight: DROPDOWN_MIN_HEIGHT,
        });
    }, [options.length, searchable]);
    function openSelect() {
        if (disabled)
            return;
        setDropdownRect(computeRect());
        setQuery('');
        setFocusedIdx(options.findIndex((o) => o.value === value));
        setOpen(true);
    }
    function closeSelect({ refocus = false } = {}) {
        setOpen(false);
        setDropdownRect(null);
        setQuery('');
        if (refocus)
            triggerRef.current?.focus();
    }
    function pick(index) {
        // While a server search is answering, the rows are the previous search's: nothing to pick yet.
        if (loading)
            return;
        const opt = visible[index];
        if (!opt || opt.disabled)
            return;
        onChange(opt.value);
        closeSelect({ refocus: searchable });
    }
    // Close on outside click or page scroll.
    useEffect(() => {
        if (!open)
            return;
        function handlePointerDown(e) {
            if (!panelRef.current?.contains(e.target) && !triggerRef.current?.contains(e.target)) {
                closeSelect();
            }
        }
        function handleScroll(e) {
            // Ignore scrolls inside the panel itself (e.g. keeping the focused row in view).
            if (panelRef.current?.contains(e.target))
                return;
            // Close only when the scroll carried the trigger away from the open list.
            const at = triggerRef.current?.getBoundingClientRect();
            const was = openedAtRef.current;
            if (at && was && Math.abs(at.top - was.top) < 1 && Math.abs(at.left - was.left) < 1)
                return;
            closeSelect();
        }
        document.addEventListener('mousedown', handlePointerDown);
        window.addEventListener('scroll', handleScroll, true);
        return () => {
            document.removeEventListener('mousedown', handlePointerDown);
            window.removeEventListener('scroll', handleScroll, true);
        };
    }, [open]);
    // Keep the focused row in view, scrolling the panel only (a page scroll would close it).
    useEffect(() => {
        if (!open || focusedIdx < 0)
            return;
        const list = listRef.current;
        const li = list?.children[focusedIdx];
        if (!list || !li)
            return;
        if (li.offsetTop < list.scrollTop)
            list.scrollTop = li.offsetTop;
        else if (li.offsetTop + li.clientHeight > list.scrollTop + list.clientHeight) {
            list.scrollTop = li.offsetTop + li.clientHeight - list.clientHeight;
        }
    }, [focusedIdx, open]);
    function handleTypeahead(char) {
        const lower = char.toLowerCase();
        const ta = typeaheadRef.current;
        if (ta.timer)
            clearTimeout(ta.timer);
        ta.timer = setTimeout(() => {
            ta.char = '';
        }, TYPEAHEAD_RESET_MS);
        const isSameChar = ta.char === lower;
        ta.char = lower;
        const matches = options.reduce((acc, opt, i) => {
            if (opt.label.toLowerCase().startsWith(lower))
                acc.push(i);
            return acc;
        }, []);
        if (matches.length === 0)
            return;
        const next = isSameChar ? (matches.find((i) => i > focusedIdx) ?? matches[0]) : matches[0];
        // Open inline rather than openSelect(), which would reset focus to the selected value.
        if (!open) {
            setDropdownRect(computeRect());
            setOpen(true);
        }
        setFocusedIdx(next);
    }
    function handleKeyDown(e) {
        if (disabled)
            return;
        switch (e.key) {
            case 'Enter':
            case ' ':
                e.preventDefault();
                if (!open)
                    openSelect();
                else
                    pick(focusedIdx);
                break;
            case 'Escape':
                // Mark it handled while open, so a modal around this select closes only
                // the list, not itself.
                if (open) {
                    e.preventDefault();
                    closeSelect();
                }
                break;
            case 'ArrowDown':
                e.preventDefault();
                if (!open)
                    openSelect();
                else
                    setFocusedIdx((i) => Math.min(i + 1, visible.length - 1));
                break;
            case 'ArrowUp':
                e.preventDefault();
                setFocusedIdx((i) => Math.max(i - 1, 0));
                break;
            case 'Tab':
                closeSelect();
                break;
            default:
                if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
                    e.preventDefault();
                    if (searchable) {
                        // A letter on the closed trigger opens the list with it already typed.
                        if (!open)
                            openSelect();
                        typeQuery(e.key);
                        setFocusedIdx(0);
                    }
                    else {
                        handleTypeahead(e.key);
                    }
                }
        }
    }
    const position = dropdownRect
        ? {
            position: 'fixed',
            // Exactly one of top/bottom is set — see DropdownRect.
            top: dropdownRect.top,
            bottom: dropdownRect.bottom,
            left: dropdownRect.left,
            width: dropdownRect.width,
            maxHeight: dropdownRect.maxHeight,
            zIndex: zFloatingPanel(),
        }
        : undefined;
    const rows = visible.map((opt, i) => {
        const selected = opt.value === value;
        return (_jsxs("li", { id: `${selectId}-option-${i}`, role: "option", "aria-selected": selected, "aria-disabled": opt.disabled || undefined, className: cn(optionClasses({ selected, focused: i === focusedIdx && !searchable, disabled: !!opt.disabled }), searchable && i === focusedIdx && SEARCH_HIGHLIGHT), onMouseDown: (e) => {
                e.preventDefault();
                pick(i);
            }, onMouseEnter: () => setFocusedIdx(i), children: [opt.description ? (_jsxs("span", { className: "min-w-0", children: [_jsx("span", { className: "block", children: opt.labelNode ?? opt.label }), _jsx("span", { className: "block text-[length:var(--text-sm)] [font-weight:var(--font-normal)] [color:var(--color-text-muted)]", children: opt.description })] })) : (_jsx("span", { children: opt.labelNode ?? opt.label })), selected && (_jsx("svg", { className: "select-check shrink-0 [color:var(--color-cyan-text)]", width: "14", height: "14", viewBox: "0 0 14 14", fill: "none", "aria-hidden": true, children: _jsx("path", { d: "M2.5 7l3 3 6-6", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" }) }))] }, opt.value));
    });
    const empty = loading ? (_jsxs("p", { className: cn(NO_MATCH, 'flex items-center gap-[var(--space-sm)]'), role: "status", children: [_jsx(Spinner, { size: "xs", color: "current" }), "Loading\u2026"] })) : visible.length === 0 ? (_jsx("p", { className: NO_MATCH, children: emptyMessage })) : null;
    const onSearchKeyDown = (e) => {
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setFocusedIdx((i) => Math.min(i + 1, visible.length - 1));
                break;
            case 'ArrowUp':
                e.preventDefault();
                setFocusedIdx((i) => Math.max(i - 1, 0));
                break;
            case 'Enter':
                // The list can sit inside a form: Enter picks a row, never submits it.
                e.preventDefault();
                pick(focusedIdx);
                break;
            case 'Escape':
                // Handled here, so a modal around this select closes only the list.
                e.preventDefault();
                e.stopPropagation();
                closeSelect({ refocus: true });
                break;
            case 'Tab':
                // Refocus the trigger before the default Tab runs; the search field is portalled.
                closeSelect({ refocus: true });
                break;
        }
    };
    const dropdown = open && dropdownRect
        ? createPortal(searchable ? (_jsxs("div", { ref: (node) => {
                panelRef.current = node;
            }, "data-ui": "select-panel", className: cn(PANEL, 'flex flex-col overflow-hidden'), style: position, children: [_jsxs("div", { className: SEARCH_FIELD, children: [_jsxs("svg", { width: "13", height: "13", viewBox: "0 0 24 24", fill: "none", "aria-hidden": true, className: "shrink-0 [color:var(--color-text-muted)]", children: [_jsx("circle", { cx: "11", cy: "11", r: "7", stroke: "currentColor", strokeWidth: "2" }), _jsx("path", { d: "M21 21l-4-4", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round" })] }), _jsx("input", { "data-ui": "select-input", type: "text", autoFocus: true, value: query, onChange: (e) => {
                                typeQuery(e.target.value);
                                // Typing points Enter at the first match.
                                setFocusedIdx(0);
                            }, onKeyDown: onSearchKeyDown, placeholder: searchPlaceholder, "aria-label": searchPlaceholder, "aria-controls": `${selectId}-listbox`, "aria-activedescendant": focusedIdx >= 0 && visible.length > 0 ? `${selectId}-option-${focusedIdx}` : undefined, className: SEARCH_INPUT })] }), _jsx("ul", { ref: listRef, id: `${selectId}-listbox`, role: "listbox", className: "m-0 min-h-0 flex-1 list-none overflow-y-auto p-0", children: rows }), empty] })) : (_jsxs("ul", { ref: (node) => {
                listRef.current = node;
                panelRef.current = node;
            }, id: `${selectId}-listbox`, role: "listbox", "data-ui": "select-panel", className: PANEL, style: position, children: [rows, empty && _jsx("li", { role: "presentation", children: empty })] })), document.body)
        : null;
    const rich = !!selectedOption?.labelNode;
    const showClear = clearable && !disabled && value !== '' && !!selectedOption;
    const clearSize = CLEAR_SIZE[size];
    // The clear button can't nest in the trigger button, so it sits over a slot the trigger keeps
    // for it; it takes the slot's measured place, whatever the padding, gap or a product's CSS.
    const rootRef = useRef(null);
    const clearSlotRef = useRef(null);
    const [clearLeft, setClearLeft] = useState(null);
    useLayoutEffect(() => {
        if (!showClear)
            return undefined;
        const measure = () => {
            const root = rootRef.current?.getBoundingClientRect();
            const slot = clearSlotRef.current?.getBoundingClientRect();
            if (root && slot)
                setClearLeft(slot.left - root.left);
        };
        measure();
        const ro = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure);
        if (ro && rootRef.current)
            ro.observe(rootRef.current);
        return () => ro?.disconnect();
    }, [showClear, size, value]);
    const trigger = (_jsxs("button", { "data-ui": "select-button", ref: triggerRef, type: "button", id: selectId, role: "combobox", "aria-haspopup": "listbox", "aria-expanded": open, "aria-controls": open ? `${selectId}-listbox` : undefined, "aria-activedescendant": open && focusedIdx >= 0 ? `${selectId}-option-${focusedIdx}` : undefined, "aria-required": required, "aria-label": ariaLabel, "aria-describedby": describedBy, "aria-labelledby": labelledBy ? `${labelledBy} ${selectId}-value` : undefined, "data-testid": testId, disabled: disabled, className: cn(TRIGGER, size === 'sm' && TRIGGER_SM, open && TRIGGER_OPEN, rich && TRIGGER_RICH), onClick: () => (open ? closeSelect() : openSelect()), onKeyDown: handleKeyDown, children: [_jsx("span", { id: `${selectId}-value`, className: cn('select-value flex-1 min-w-0', rich ? 'whitespace-normal' : 'whitespace-nowrap overflow-hidden text-ellipsis', !selectedOption && placeholder && 'select-placeholder [color:var(--color-text-muted)]'), children: selectedOption?.labelNode ?? displayLabel }), showClear && _jsx("span", { ref: clearSlotRef, "aria-hidden": true, className: "shrink-0", style: { width: clearSize } }), _jsx("svg", { className: cn('select-chevron shrink-0 [color:var(--color-text-muted)] [transition:transform_var(--transition-fast)]', open && 'rotate-180'), width: "14", height: "14", viewBox: "0 0 16 16", fill: "none", "aria-hidden": true, children: _jsx("path", { d: "M4 6l4 4 4-4", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" }) })] }));
    return (_jsxs("div", { ref: rootRef, className: cn('select-root relative block', className), "data-ui": "select", "data-open": open || undefined, "data-disabled": disabled || undefined, children: [disabled && disabledReason ? (
            // A disabled button fires no pointer events, so the tooltip sits on a full-width wrapper.
            _jsx(Tooltip, { label: disabledReason, children: _jsx("span", { className: "block", children: trigger }) })) : (trigger), showClear && (_jsx(Tooltip, { label: clearLabel, children: _jsx("button", { type: "button", "data-ui": "select-clear", "aria-label": clearLabel, className: cn('absolute top-1/2 -translate-y-1/2 flex items-center justify-center rounded-[var(--radius-full)] border-0 p-0 cursor-pointer', '[background:transparent] [color:var(--color-text-muted)] hover:[color:var(--color-text-primary)] hover:[background:var(--color-bg-subtle)]', 'focus-visible:outline-none focus-visible:[box-shadow:var(--shadow-focus)]'), style: { left: clearLeft ?? undefined, right: clearLeft == null ? 0 : undefined, width: clearSize, height: clearSize }, onClick: () => {
                        onChange('');
                        triggerRef.current?.focus();
                    }, children: _jsx("svg", { width: "12", height: "12", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.5", strokeLinecap: "round", "aria-hidden": "true", children: _jsx("path", { d: "M18 6 6 18M6 6l12 12" }) }) }) })), dropdown] }));
}
// Keep: lets Field / FormRow tie their label to this control (it forwards id and aria-describedby).
markLabellable(Select);
