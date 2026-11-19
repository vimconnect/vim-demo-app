import { useCallback, useEffect, useMemo, useState } from 'react';
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
export const PAGE_SIZE_OPTIONS = [8, 15, 25, 50, 100];
/**
 * 8, not the old 5: enough that a normal team fits on one page, while the
 * first page plus the filter row above it still fits a laptop viewport — which
 * is what keeps the filters reachable without pinning them. Anyone who wants
 * more takes it from the rows picker.
 */
export const DEFAULT_PAGE_SIZE = 8;
// v2: the default moved from 10 to 8, and a stored 10 from before that change
// is indistinguishable from a deliberate choice. Bumping the key retires those
// silently rather than leaving the old default stuck for anyone who had
// already loaded the page.
const storageKey = (id) => `vc.pageSize.v2.${id}`;
/** localStorage is unavailable in private-mode Safari and in some embedded
 *  webviews; a page-size preference is never worth throwing over. */
const readStoredPageSize = (id, fallback) => {
    try {
        const raw = window.localStorage.getItem(storageKey(id));
        const parsed = raw === null ? NaN : Number(raw);
        return PAGE_SIZE_OPTIONS.includes(parsed) ? parsed : fallback;
    }
    catch {
        return fallback;
    }
};
/**
 * Just the per-table page-size preference, for tables that page on the server
 * and so cannot use `usePagination`'s client-side slicing. Sharing this keeps
 * one storage key and one default across both kinds of table.
 */
export function usePageSizePreference(id, fallback = DEFAULT_PAGE_SIZE) {
    const [pageSize, setPageSizeState] = useState(() => readStoredPageSize(id, fallback));
    useEffect(() => {
        setPageSizeState(readStoredPageSize(id, fallback));
    }, [id, fallback]);
    const setPageSize = useCallback((next) => {
        setPageSizeState(next);
        try {
            window.localStorage.setItem(storageKey(id), String(next));
        }
        catch {
            // Preference is best-effort; the size still applies for this session.
        }
    }, [id]);
    return [pageSize, setPageSize];
}
export function usePagination(items, 
/** Stable id for the page-size preference, e.g. 'users' — one per table. */
id, 
/** Initial page size when nothing is stored (defaults to `DEFAULT_PAGE_SIZE`). */
defaultPageSize = DEFAULT_PAGE_SIZE) {
    const [page, setRawPage] = useState(1);
    const [pageSize, setPageSizeState] = useState(() => readStoredPageSize(id, defaultPageSize));
    // Re-read when the table id changes, so two tables sharing this hook don't
    // inherit each other's preference.
    useEffect(() => {
        setPageSizeState(readStoredPageSize(id, defaultPageSize));
    }, [id, defaultPageSize]);
    const setPageSize = useCallback((next) => {
        setPageSizeState(next);
        // Row 41 of 41 at 50/page is page 1; at 10/page it is page 5. Rather
        // than guess which the reader meant, go back to the top.
        setRawPage(1);
        try {
            window.localStorage.setItem(storageKey(id), String(next));
        }
        catch {
            // Preference is best-effort; the size still applies for this session.
        }
    }, [id]);
    const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
    const pageClamped = Math.min(page, totalPages);
    const start = (pageClamped - 1) * pageSize;
    const visible = useMemo(() => items.slice(start, start + pageSize), [items, start, pageSize]);
    // Clamped on the way in as well as out. Callers only ever see `pageClamped`,
    // so a setter that mutated the raw value would decrement a number the reader
    // never saw — after a reload shrinks the list, Previous would then appear to
    // do nothing, once per step the clamp had been absorbing.
    const setPage = useCallback((next) => setRawPage((prev) => {
        const from = Math.min(prev, totalPages);
        const raw = typeof next === 'function' ? next(from) : next;
        return Math.min(Math.max(1, raw), totalPages);
    }), [totalPages]);
    return {
        page: pageClamped,
        setPage,
        pageSize,
        setPageSize,
        totalPages,
        start,
        visible,
        total: items.length,
    };
}
