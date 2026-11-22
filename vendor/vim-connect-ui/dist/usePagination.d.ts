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
