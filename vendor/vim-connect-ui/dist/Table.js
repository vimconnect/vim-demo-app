'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useId, useMemo } from 'react';
import { Card } from './Card.js';
import { Select } from './Select.js';
import { cn } from './cn.js';
import { assignRef } from './assignRef.js';
import { PAGE_SIZE_OPTIONS } from './paginationShared.js';
import { useVirtualRows } from './useVirtualRows.js';
/** Elements that handle their own click, so a click on one never also opens its row. */
const INTERACTIVE = 'a[href], button, input, select, textarea, label, summary, [role="button"], [role="link"], [role="checkbox"], [role="switch"], [role="menuitem"], [role="tab"], [contenteditable="true"]';
const ROW_BASE = 'flex items-center gap-[16px] px-[20px]'; // keep in step with GAP / PAD_X
const HEADER_ROW = `${ROW_BASE} py-[10px]`;
const BODY_ROW = [
    ROW_BASE,
    'py-[14px] border-0 border-t border-solid [border-color:var(--color-border-light)]',
    '[transition:background_120ms] hover:[background:var(--color-cyan-15)]',
].join(' ');
const TH = 'uppercase tracking-[0.05em] text-[length:var(--text-xs)] [font-weight:var(--font-semibold)] [color:var(--color-text-muted)]';
const TD = 'min-w-0 text-[length:var(--text-base)] [color:var(--color-text-secondary)]';
const DENSE_ROW = 'py-[6px]';
const DENSE_TD = 'text-[length:var(--text-sm)]';
const SR_ONLY = 'absolute w-px h-px p-0 -m-px overflow-hidden [clip:rect(0,0,0,0)] whitespace-nowrap border-0';
/** A flex column never shrinks below its flex-basis (px), or this when it has none. */
const MIN_FLEX_COLUMN = 120;
const GAP = 16;
const PAD_X = 20;
function flexMin(flex) {
    const px = flex?.match(/(\d+(?:\.\d+)?)px\s*$/);
    return px ? Number(px[1]) : MIN_FLEX_COLUMN;
}
function columnStyle(col, stickyRight) {
    const pin = col.sticky && stickyRight !== undefined ? { right: stickyRight } : undefined;
    if (col.width !== undefined)
        return { width: col.width, flexShrink: 0, ...pin };
    return { flex: col.flex ?? '1 1 0', minWidth: flexMin(col.flex), ...pin };
}
/** Narrowest the table may get before it scrolls sideways inside its card. */
function tableMinWidth(columns, extra = 0) {
    let sum = 0;
    for (const col of columns) {
        if (col.width === undefined)
            sum += flexMin(col.flex);
        else if (typeof col.width === 'number')
            sum += col.width;
        else
            return undefined; // a CSS-length width can't be summed; let the browser size it
    }
    return sum + GAP * Math.max(0, columns.length - 1) + PAD_X * 2 + extra;
}
function alignClass(col) {
    return col.align === 'right' ? 'flex justify-end text-right' : '';
}
// A pinned cell needs its own opaque fill (it slides over the cells beneath it);
// it follows the row's hover / selection tint by layering that tint over the card colour.
const STICKY_CELL = [
    'sticky right-0 z-[1] self-stretch flex items-center',
    '[background:var(--color-bg-primary)]',
    'group-aria-[current=true]:[background:linear-gradient(var(--color-cyan-08),var(--color-cyan-08)),var(--color-bg-primary)]',
    'group-hover:[background:linear-gradient(var(--color-cyan-15),var(--color-cyan-15)),var(--color-bg-primary)]',
].join(' ');
const SELECTED_ROW = '[background:var(--color-cyan-08)] [box-shadow:inset_3px_0_0_0_var(--color-cyan)]';
const FULL_WIDTH_ROW = 'px-[20px] py-[10px] border-0 border-t border-solid [border-color:var(--color-border-light)]';
const EXPANDED = 'px-[20px] pb-[14px] pt-0';
/** Expandable tables get this chevron column at the far right (Ben: arrows on the right). */
const EXPAND_COL_WIDTH = 24;
const Chevron = ({ open }) => (_jsx("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", className: cn('[color:var(--color-text-muted)] [transition:transform_var(--transition-fast)]', open && 'rotate-90'), children: _jsx("path", { d: "m9 18 6-6-6-6" }) }));
export function Table({ columns, rows, getRowKey, onRowClick, rowClassName, empty, footer, ariaLabel, id, rowProps, className, header, bare, rowTestId, rowAriaLabel, scrollClassName, isRowSelected, renderExpanded, isRowExpanded, fullWidthRow, stickyHeader, isRowExpandable, isRowClickable, scrollRef, virtualize, dense, }) {
    // With the chevron pinned at the right edge, a pinned column sits just inside it.
    const pinOffset = renderExpanded ? EXPAND_COL_WIDTH + GAP : undefined;
    // Windowing. The hook always runs (hooks can't be conditional); without
    // `virtualize` it gets no rows and its scroll box is never attached.
    const getRowKeyRef = React.useRef(getRowKey);
    getRowKeyRef.current = getRowKey;
    const keyForIndex = React.useCallback((i) => String(getRowKeyRef.current(rows[i], i)), [rows]);
    const virtual = useVirtualRows({
        count: virtualize ? rows.length : 0,
        estimateRowHeight: virtualize?.estimateRowHeight ?? 48,
        rowsIdentity: rows,
        keyForIndex,
        scrollResetKey: virtualize?.resetKey,
        paused: !virtualize || virtualize.paused,
        overscan: virtualize?.overscan,
    });
    const isVirtual = !!virtualize;
    const setScrollBox = React.useCallback((el) => {
        if (isVirtual)
            virtual.scrollRef.current = el;
        assignRef(scrollRef, el);
    }, [isVirtual, scrollRef, virtual.scrollRef]);
    const first = virtualize ? virtual.window.start : 0;
    const last = virtualize ? Math.min(virtual.window.end, rows.length) : rows.length;
    const visible = virtualize ? rows.slice(first, last) : rows;
    /**
     * A click on a control inside a clickable row (a button, link, field, checkbox) is that
     * control's, not the row's. So is a click in portaled content opened from the row (a menu,
     * a popover): React bubbles it through the row, but it isn't inside the row in the DOM.
     */
    const isRowOwnClick = (e) => {
        const target = e.target;
        if (!e.currentTarget.contains(target))
            return false;
        const control = target.closest(INTERACTIVE);
        return !control || control === e.currentTarget || !e.currentTarget.contains(control);
    };
    const renderRow = (row, i) => {
        const key = getRowKey(row, i);
        const full = fullWidthRow?.(row);
        if (full != null) {
            return (_jsx("div", { role: "row", "data-testid": rowTestId?.(row), className: cn(FULL_WIDTH_ROW, rowClassName?.(row)), children: _jsx("div", { role: "cell", className: "w-full", children: full }) }, key));
        }
        const selected = isRowSelected?.(row);
        const expandable = !!renderExpanded && (isRowExpandable?.(row) ?? true);
        const expanded = expandable && !!isRowExpanded?.(row);
        const clickable = !!onRowClick && (isRowClickable?.(row) ?? true);
        const { className: rowPropsClass, ...restRowProps } = rowProps?.(row) ?? {};
        return (_jsxs(React.Fragment, { children: [_jsxs("div", { ...restRowProps, role: "row", "data-testid": rowTestId?.(row), "aria-label": rowAriaLabel?.(row), "aria-current": selected ? 'true' : undefined, "aria-expanded": expandable ? expanded : undefined, "aria-rowindex": virtualize ? i + 2 : undefined, tabIndex: clickable ? 0 : undefined, onClick: clickable ? (e) => isRowOwnClick(e) && onRowClick(row) : undefined, onKeyDown: clickable ? (e) => (e.key === 'Enter' || e.key === ' ') && e.currentTarget === e.target && (e.preventDefault(), onRowClick(row)) : undefined, className: cn(BODY_ROW, dense && `${DENSE_ROW} items-start`, 'group', clickable && 'cursor-pointer focus-visible:outline-none focus-visible:[background:var(--color-cyan-15)]', selected && SELECTED_ROW, rowClassName?.(row), rowPropsClass), children: [columns.map((col) => {
                            const { className: cellPropsClass, ...restCellProps } = col.cellProps?.(row, i) ?? {};
                            return (_jsx("div", { ...restCellProps, role: "cell", className: cn(TD, dense && DENSE_TD, alignClass(col), col.className, col.sticky && STICKY_CELL, cellPropsClass), style: columnStyle(col, pinOffset), children: col.cell(row, i) }, col.key));
                        }), renderExpanded && (_jsx("div", { role: "cell", className: cn('flex items-center justify-end', STICKY_CELL), style: { width: EXPAND_COL_WIDTH, flexShrink: 0 }, children: expandable && _jsx(Chevron, { open: expanded }) }))] }), expanded && (_jsx("div", { role: "row", className: EXPANDED, "data-expanded-for": String(key), children: _jsx("div", { role: "cell", className: "w-full", children: renderExpanded(row) }) }))] }, key));
    };
    const body = (_jsxs(_Fragment, { children: [header && _jsx("div", { className: "px-[var(--space-2xl)] pt-[var(--space-xl)] pb-[var(--space-md)]", children: header }), _jsx("div", { ref: setScrollBox, onScroll: virtualize ? virtual.onScroll : undefined, 
                // A windowed list scrolls in its own box and its rows may not be focusable,
                // so the box itself takes focus (keyboard scrolling). The gutter is fixed so
                // a measured tall row bringing the scrollbar in doesn't re-wrap every row.
                tabIndex: virtualize ? 0 : undefined, role: virtualize ? 'region' : undefined, "aria-label": virtualize ? ariaLabel : undefined, className: cn('overflow-x-auto', virtualize && 'overflow-y-auto [scrollbar-gutter:stable] focus-visible:outline-none focus-visible:[box-shadow:var(--shadow-focus)]', scrollClassName), children: _jsxs("div", { role: "table", "data-ui": "table", id: id, "aria-label": ariaLabel, "aria-rowcount": virtualize ? rows.length + 1 : undefined, style: { minWidth: tableMinWidth(columns, renderExpanded ? EXPAND_COL_WIDTH + GAP : 0) }, children: [_jsx("div", { role: "rowgroup", className: cn(stickyHeader && 'sticky top-0 z-[2] [background:var(--color-bg-primary)]'), children: _jsxs("div", { className: HEADER_ROW, role: "row", "aria-rowindex": virtualize ? 1 : undefined, children: [columns.map((col) => (_jsx("div", { role: "columnheader", "aria-sort": col.sort, className: cn(TH, alignClass(col), col.className, col.sticky && 'sticky right-0 z-[1] [background:var(--color-bg-primary)]'), style: columnStyle(col, pinOffset), children: col.hideHeader ? _jsx("span", { className: SR_ONLY, children: col.header }) : col.header }, col.key))), renderExpanded && (_jsx("div", { role: "columnheader", className: cn(TH, 'sticky right-0 z-[1] [background:var(--color-bg-primary)]'), style: { width: EXPAND_COL_WIDTH, flexShrink: 0 }, children: _jsx("span", { className: SR_ONLY, children: "Details" }) }))] }) }), _jsxs("div", { role: "rowgroup", children: [virtualize && virtual.window.padTop > 0 && _jsx("div", { "aria-hidden": "true", style: { height: virtual.window.padTop } }), visible.map((row, offset) => {
                                    const i = first + offset;
                                    const rowEl = renderRow(row, i);
                                    // Each record is measured as one block (row + its expanded detail).
                                    return virtualize ? (_jsx("div", { ref: virtual.measureRow, "data-vrow": i, children: rowEl }, getRowKey(row, i))) : (rowEl);
                                }), virtualize && virtual.window.padBottom > 0 && _jsx("div", { "aria-hidden": "true", style: { height: virtual.window.padBottom } })] })] }) }), rows.length === 0 && empty && (_jsx("div", { className: "px-[20px] py-[var(--space-2xl)] border-0 border-t border-solid [border-color:var(--color-border-light)]", children: empty })), footer] }));
    if (bare)
        return _jsx("div", { className: cn('overflow-hidden', className), children: body });
    return (_jsx(Card, { hover: "shadow", className: cn('p-0 overflow-hidden', className), children: body }));
}
const PAGER_BTN = [
    'inline-flex items-center h-[28px] px-[12px] m-0 cursor-pointer',
    'rounded-[var(--radius-md)] border border-solid [border-color:var(--color-border-medium)] [background:var(--color-bg-primary)]',
    '[font-family:var(--font-sans)] text-[length:var(--text-xs)] [font-weight:var(--font-semibold)] [color:var(--color-text-secondary)]',
    '[transition:border-color_var(--transition-base),color_var(--transition-base)]',
    'hover:[border-color:var(--color-cyan-40)] hover:[color:var(--color-text-primary)]',
    'focus-visible:outline-none focus-visible:[box-shadow:var(--shadow-focus)]',
    'disabled:opacity-[0.45] disabled:cursor-not-allowed disabled:hover:[border-color:var(--color-border-medium)] disabled:hover:[color:var(--color-text-secondary)]',
].join(' ');
export function TablePagination({ pagination, itemLabel, idPrefix, pageSizeOptions = PAGE_SIZE_OPTIONS }) {
    const { page, setPage, pageSize, setPageSize, totalPages, start, total } = pagination;
    const autoId = useId();
    const selectId = `${idPrefix ?? autoId}-page-size`;
    const sizeOptions = useMemo(() => pageSizeOptions.map((n) => ({ value: String(n), label: String(n) })), [pageSizeOptions]);
    return (_jsxs("div", { className: cn('flex flex-wrap items-center justify-between gap-[12px] px-[20px] py-[12px]', 'border-0 border-t border-solid [border-color:var(--color-border-light)]', '[font-family:var(--font-sans)] text-[length:var(--text-xs)] [color:var(--color-text-muted)]'), children: [_jsxs("div", { className: "flex items-center gap-[12px]", children: [_jsxs("span", { children: ["Showing ", total === 0 ? 0 : start + 1, "\u2013", Math.min(start + pageSize, total), " of ", total, " ", itemLabel] }), _jsxs("div", { className: "flex items-center gap-[6px]", children: [_jsx("label", { htmlFor: selectId, children: "Rows" }), _jsx(Select, { id: selectId, size: "sm", options: sizeOptions, value: String(pageSize), onChange: (v) => setPageSize(Number(v)), className: "w-auto min-w-[62px]" })] })] }), totalPages > 1 && (_jsxs("div", { className: "flex items-center gap-[12px]", children: [_jsx("button", { "data-ui": "table-button", type: "button", className: PAGER_BTN, disabled: page === 1, onClick: () => setPage((p) => Math.max(1, p - 1)), children: "Previous" }), _jsxs("span", { children: ["Page ", page, " of ", totalPages] }), _jsx("button", { "data-ui": "table-button", type: "button", className: PAGER_BTN, disabled: page === totalPages, onClick: () => setPage((p) => Math.min(totalPages, p + 1)), children: "Next" })] }))] }));
}
