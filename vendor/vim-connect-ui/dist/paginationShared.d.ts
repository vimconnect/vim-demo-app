export declare const PAGE_SIZE_OPTIONS: readonly [8, 15, 25, 50, 100];
/**
 * 8, not the old 5: enough that a normal team fits on one page, while the
 * first page plus the filter row above it still fits a laptop viewport — which
 * is what keeps the filters reachable without pinning them. Anyone who wants
 * more takes it from the rows picker.
 */
export declare const DEFAULT_PAGE_SIZE = 8;
