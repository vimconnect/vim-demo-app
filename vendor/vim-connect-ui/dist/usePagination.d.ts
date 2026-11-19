/**
 * Client-side pagination for any table — page state, a per-table page-size
 * preference (localStorage, keyed by table id), and the slice to render.
 * Feeds `TablePagination`. Moved from the Console (`hooks/usePagination.ts`,
 * which now re-exports this) so every product pages the same way.
 *
 * Shared rather than per-tab: the Users tab paginated at a hard-coded 5 while
 * the two Pending tabs did not paginate at all, so "how much of my team can I
 * see at once" had three different answers on one page
 * (bookmd/vim-connect#3738).
 */
export declare const PAGE_SIZE_OPTIONS: readonly [8, 15, 25, 50, 100];
/**
 * 8, not the old 5: enough that a normal team fits on one page, while the
 * first page plus the filter row above it still fits a laptop viewport — which
 * is what keeps the filters reachable without pinning them. Anyone who wants
 * more takes it from the rows picker.
 */
export declare const DEFAULT_PAGE_SIZE = 8;
/**
 * Just the per-table page-size preference, for tables that page on the server
 * and so cannot use `usePagination`'s client-side slicing. Sharing this keeps
 * one storage key and one default across both kinds of table.
 */
export declare function usePageSizePreference(id: string, fallback?: number): [number, (next: number) => void];
export interface UsePaginationResult<T> {
    /** Already clamped — a filter that shrinks the list can't strand the pager. */
    page: number;
    setPage: (next: number | ((prev: number) => number)) => void;
    pageSize: number;
    setPageSize: (next: number) => void;
    totalPages: number;
    /** Zero-based index of the first visible row, for the "Showing X–Y" label. */
    start: number;
    visible: T[];
    total: number;
}
export declare function usePagination<T>(items: T[], 
/** Stable id for the page-size preference, e.g. 'users' — one per table. */
id: string, 
/** Initial page size when nothing is stored (defaults to `DEFAULT_PAGE_SIZE`). */
defaultPageSize?: number): UsePaginationResult<T>;
