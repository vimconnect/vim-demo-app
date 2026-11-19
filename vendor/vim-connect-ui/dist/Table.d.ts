import React from 'react';
import { type UsePaginationResult } from './usePagination.js';
/**
 * Design-system table — vim-ai `Design System.html` → Table.
 *
 * The Console's `.stacked-rows` recipe as a component: one card holding a
 * column-title row over hairline-separated flex rows (not a literal `<table>`,
 * so every column keeps exact fixed / flexible sizing). Header cells are
 * `--text-xs` semibold uppercase muted; body cells `--text-base` secondary.
 * Row hover is the console's one row tint, `--color-cyan-15`. Row actions go
 * in the LAST column, right-aligned, header included (DS plugin 1.0.16).
 *
 * `TablePagination` is the footer every paginated table renders (DS: not
 * optional): "Showing X–Y of Z items", a Rows picker, and Previous /
 * "Page X of Y" / Next once there is more than one page.
 *
 * Classes mean the same in Tailwind v3 and v4: arbitrary values on DS tokens
 * only and no `!` important marker.
 */
/** Row/cell extras — HTML attributes plus arbitrary `data-*` collection hooks. */
export type TableElementProps = React.HTMLAttributes<HTMLElement> & Record<string, unknown>;
export interface TableColumn<T> {
    /** Stable id for the column. */
    key: string;
    /** Column title. */
    header: React.ReactNode;
    /** Renders this column's cell for one row. */
    cell: (row: T, index: number) => React.ReactNode;
    /** Fixed width (px or any CSS length). Fixed columns never shrink. */
    width?: number | string;
    /** Flex share instead of a width, e.g. `'1 1 200px'`. Default `'1 1 0'` when no width. */
    flex?: string;
    /**
     * `right` ONLY for the actions column (last, DS). Every data column, numbers and
     * status badges included, aligns left (Ben, 2026-11-10).
     */
    align?: 'left' | 'right';
    /** Keep the header for screen readers only (e.g. an untitled actions column). */
    hideHeader?: boolean;
    /** Extra classes on this column's cells (header and body). */
    className?: string;
    /** Extra attributes on this column's body cells (e.g. collection `data-vim-*` hooks). */
    cellProps?: (row: T, index: number) => TableElementProps;
    /** Pin to the right edge while the table scrolls sideways (e.g. the actions column). */
    sticky?: 'right';
    /** Sortable column: sets `aria-sort` on its header. Omit for columns that can't sort. */
    sort?: 'ascending' | 'descending' | 'none';
}
export interface TableProps<T> {
    columns: TableColumn<T>[];
    rows: T[];
    getRowKey: (row: T, index: number) => React.Key;
    /** Makes rows clickable (pointer + keyboard Enter). */
    onRowClick?: (row: T) => void;
    /** Per-row extra classes, e.g. a persistent "this is you" tint. */
    rowClassName?: (row: T) => string | undefined;
    /** Shown inside the card when there are no rows. */
    empty?: React.ReactNode;
    /** Rendered last inside the card, usually `<TablePagination>`. */
    footer?: React.ReactNode;
    /** Accessible name for the table. */
    ariaLabel?: string;
    /** `id` on the `role="table"` element (collection hooks such as `#vc-problems-table`). */
    id?: string;
    /** Extra attributes per body row (collection `data-vim-*` hooks). `className` merges with the row. */
    rowProps?: (row: T) => TableElementProps;
    /** Classes on the card. */
    className?: string;
    /**
     * The table's own header row, inside the card above the column headings
     * (DS: title, count, search / filter / "Show all" on the right). Padded
     * `--space-xl` / `--space-2xl` / `--space-md` to line up with the cells.
     */
    header?: React.ReactNode;
    /** No card of its own, for a table inside a card the caller already built. */
    bare?: boolean;
    /** `data-testid` per body row. */
    rowTestId?: (row: T) => string | undefined;
    /** Accessible name per body row (e.g. when the row is a click target). */
    rowAriaLabel?: (row: T) => string | undefined;
    /** Classes on the scroll container (e.g. a max height for a long, scrolling list). */
    scrollClassName?: string;
    /**
     * Selection: the row that is currently picked (e.g. a master list driving a
     * detail pane). Gets `aria-current="true"`, a cyan tint and a left accent bar.
     * Not `aria-selected`: it is only valid in `role="grid"`, and screen readers
     * ignore it inside `role="table"` (DS plugin 1.0.35).
     */
    isRowSelected?: (row: T) => boolean;
    /** Expansion: content shown full width under the row while `isRowExpanded` is true. The table adds a chevron column at the far right. */
    renderExpanded?: (row: T) => React.ReactNode;
    isRowExpanded?: (row: T) => boolean;
    /** Rows with nothing to open: no chevron, no `aria-expanded`. Default: every row. */
    isRowExpandable?: (row: T) => boolean;
    /** Rows that react to `onRowClick` (pointer, focus, Enter / Space). Default: every row. */
    isRowClickable?: (row: T) => boolean;
    /** Ref to the scroll container (e.g. to measure or drive it). */
    scrollRef?: React.Ref<HTMLDivElement>;
    /**
     * A row drawn full width instead of as cells (a group heading, an interleaved
     * notice). Return null to draw the row normally.
     */
    fullWidthRow?: (row: T) => React.ReactNode | null;
    /** Keep the column headings visible while the body scrolls (pair with a max height in `scrollClassName`). */
    stickyHeader?: boolean;
    /**
     * Only draw the rows on screen, for lists of thousands to hundreds of thousands
     * (a log bundle). Rows may differ in height; each is measured as it renders.
     * Needs a scroll box: pair with a max height in `scrollClassName` and
     * `stickyHeader`. Browser find (Ctrl+F) reaches only the drawn rows, so give
     * the page its own search.
     */
    virtualize?: {
        /** A typical single-line row's height in px (what unseen rows count as). */
        estimateRowHeight: number;
        /** Change it when the reader starts a new list (new filter or source): scrolls back to the top. Rows arriving must not change it. */
        resetKey?: unknown;
        /** The table is mounted but hidden; nothing is measured, and the scroll position comes back. */
        paused?: boolean;
        /** Extra rows drawn above and below the screen. */
        overscan?: number;
    };
    /** Tighter rows and smaller text, for dense data such as log records. */
    dense?: boolean;
}
export declare function Table<T>({ columns, rows, getRowKey, onRowClick, rowClassName, empty, footer, ariaLabel, id, rowProps, className, header, bare, rowTestId, rowAriaLabel, scrollClassName, isRowSelected, renderExpanded, isRowExpanded, fullWidthRow, stickyHeader, isRowExpandable, isRowClickable, scrollRef, virtualize, dense, }: TableProps<T>): import("react/jsx-runtime").JSX.Element;
export interface TablePaginationProps {
    /** What `usePagination` returned, or a server-paged object of the same shape. */
    pagination: Pick<UsePaginationResult<unknown>, 'page' | 'setPage' | 'pageSize' | 'setPageSize' | 'totalPages' | 'start' | 'total'>;
    /** Plural noun for the count, e.g. "platform users". */
    itemLabel: string;
    /** Distinguishes the Rows pickers when two tables render at once. Default: a generated id. */
    idPrefix?: string;
    /** Overrides the size list (8 / 15 / 25 / 50 / 100). */
    pageSizeOptions?: readonly number[];
}
export declare function TablePagination({ pagination, itemLabel, idPrefix, pageSizeOptions }: TablePaginationProps): import("react/jsx-runtime").JSX.Element;
