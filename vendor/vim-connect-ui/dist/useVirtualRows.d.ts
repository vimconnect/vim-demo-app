import type { RefObject } from 'react';
export interface VirtualRowWindow {
    /** First index to render, overscan included. */
    start: number;
    /** One past the last index to render, overscan included. */
    end: number;
    /**
     * First index inside the viewport proper, overscan excluded. This is the row
     * scroll compensation holds still: a height correction at a lower index moves
     * it, one at a higher index does not.
     */
    anchor: number;
    /** Height of rows [0, start) — the leading spacer. */
    padTop: number;
    /** Height of rows [end, count) — the trailing spacer. */
    padBottom: number;
}
export interface VirtualRows {
    /** Attach to the scrolling container. */
    scrollRef: RefObject<HTMLDivElement | null>;
    /** Attach as the scrolling container's `onScroll`. */
    onScroll: () => void;
    /**
     * Attach to every rendered row, which must also carry its list index as
     * `data-vrow`. One stable callback, so a row already on screen is not
     * re-attached by a scroll; the index is read from the attribute at measuring
     * time, so a renumbered row is still measured against its new position.
     */
    measureRow: (el: HTMLElement | null) => (() => void) | undefined;
    /** The rows to render, and the spacer heights that stand for the rest. */
    window: VirtualRowWindow;
}
export declare function useVirtualRows({ count, estimateRowHeight, rowsIdentity, keyForIndex, scrollResetKey, paused, overscan, }: {
    count: number;
    estimateRowHeight: number;
    /**
     * Identity of the row list. A change renumbers the rows, so the index-addressed
     * tree is rebuilt from the height map — pass the array itself.
     */
    rowsIdentity: unknown;
    /** The key of the row at `index`, stable for that row's whole lifetime. */
    keyForIndex: (index: number) => string;
    /**
     * What the reader is looking at, as opposed to how much of it has arrived. A
     * change scrolls back to the top and drops the remembered heights: a new filter
     * or a new source is a new list to read from the start, and keeping the old
     * offset would land the reader at the far end of it. Rows merely ARRIVING must
     * not change this, or a live list would snap to the top on every insert.
     */
    scrollResetKey: unknown;
    /**
     * The table is on screen but not laid out — hidden behind another view rather
     * than unmounted. Nothing is measured or re-windowed while this holds, and the
     * scroll offset is put back when it lifts: a box with no layout answers 0 for
     * its height and its scroll position, and windowing on that would return from
     * the detour somewhere other than where it started.
     */
    paused?: boolean;
    overscan?: number;
}): VirtualRows;
