/**
 * Row windowing for a table whose row count is set by its data, not by a page
 * size — built for the client-logs bundle viewer, and not specific to it.
 *
 * WHY IT EXISTS: the desktop store's retention caps were sized from ~275 framed
 * bytes per record and ~30,000 records/day per service
 * (`desktop/common/include/local_log_store.h`), which puts an age-bound
 * `all`-tier bundle at ~87,000 records typically and 400,000 at the cap. One
 * `<tr>` per record is two orders of magnitude past what a DOM table survives, so
 * only the rows the viewport can show are built; the rest are two spacer cells.
 *
 * ROWS ARE NOT UNIFORM, so the window cannot be arithmetic on one row height. A
 * desktop record's message round-trips a stack trace verbatim, so one row is a
 * line and the next is forty. Heights are therefore MEASURED as rows render.
 * Offsets come from a Fenwick tree over the (measured − estimate) deltas, so
 * mapping a scroll position to an index costs O(log² n) and never walks the rows
 * that are off screen.
 *
 * ONLY THE EXCEPTIONS ARE STORED. A row that measures its estimate has a delta of
 * zero and is recorded nowhere — no tree, no map entry — so a table of uniform
 * rows carries no per-row bookkeeping at all. That property is only as good as
 * `estimateRowHeight`: if it does not match what the platform actually lays a
 * plain row out at, every row becomes an exception and the maps grow with the
 * list. The cost is memory of the same order as the rows themselves, and a slower
 * rebuild — never a wrong render, since every built row is measured.
 *
 * HEIGHTS ARE KEYED BY ROW KEY, NOT BY INDEX. A list that takes inserts at the
 * head — the client-logs live view sorts newest-first and flushes buffered stream
 * entries every few hundred ms — renumbers every row beneath the insert. Under
 * index keys the only safe response is to forget everything, and then the same
 * tall row is re-measured as a fresh discovery on each flush, its correction
 * applied to `scrollTop` again and again, walking the view down the list. Keyed by
 * the row's own key, a renumber costs a rebuild of the index-addressed tree and
 * nothing else.
 *
 * THE SCROLL RANGE IS BOUNDED BY THE STORE'S BYTE CAP, not by its row cap. It is
 * `count * estimate` plus the deltas measured so far, so it grows toward the true
 * total as the operator scrolls, and one spacer cell has to express the tail of it
 * — which browsers cap (Blink at ~33.5M px). The bound is the 60MB bundle: a
 * record's rendered height per stored byte peaks at ~0.3 for a multi-line trace
 * (measured: 124.5px for ~430 framed bytes), so the whole cap comes to ~18M px,
 * and that shape reaches the byte cap at ~146,000 records — far short of the
 * 400,000-record cap, which only records short enough to average ~150 bytes and
 * one line can reach. Both extremes were driven in Chromium and the oldest record
 * stayed reachable. Re-check this if the store's caps move.
 *
 * MEASURING A ROW ABOVE THE VIEWPORT MOVES WHAT IS INSIDE IT. Learning that row 12
 * is taller than estimated pushes every row below it down — the one being read
 * included. That delta is added back to `scrollTop` in the same layout pass, so the
 * record under the cursor stays where the operator left it.
 *
 * THE TREE IS REBUILT DURING RENDER, with the numbering it was built for recorded
 * alongside it. It has to be: the spacer heights go into the DOM in that same
 * render, and publishing a range derived from estimates alone would let the
 * browser clamp `scrollTop` against a too-short document before the layout effect
 * could correct it — losing the read position on an ordinary insert. A render React
 * discards therefore leaves the tree pointing at a list that was never committed,
 * which the layout effect detects (the tag will not match the committed rows) and
 * repairs before it reads any layout.
 */
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
