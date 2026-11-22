'use client';
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
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
/**
 * Rows kept in the DOM beyond each viewport edge, so a small scroll reveals a row
 * that is already laid out and measured rather than one appearing mid-frame.
 */
const DEFAULT_OVERSCAN = 8;
/**
 * Viewport to assume while the container has no laid-out height: a box that is
 * detached or `display: none`, and every box under jsdom. Without it a
 * zero-height viewport windows down to a single row, and a table that is never
 * scrolled — a test's, or a freshly mounted one's — reads as empty.
 */
const UNLAID_OUT_VIEWPORT_PX = 640;
/**
 * Below this a measurement is noise, not a height: rows of identical content
 * measure up to half a pixel apart under fractional device pixels, and treating
 * that as a change would give every one of them a tree delta and a map entry. What
 * it costs in offsets is random rather than systematic, so it does not accumulate
 * in one direction as the list is scrolled.
 */
const MEASURE_EPSILON_PX = 1;
/** Shared stand-in for a tree holding no deltas, so the empty case allocates none. */
const NO_DELTAS = new Float64Array(0);
/**
 * Prefix sums over per-row height deltas (measured − estimate), so a row's offset
 * is `index * estimate + prefix(index)`. A Fenwick tree because all three
 * operations the window needs — record one row's delta, sum the deltas before an
 * index, re-derive every delta after a renumber — have to stay cheap with 400,000
 * rows.
 */
class HeightDeltaTree {
    /** 1-based; slot 0 is unused. Zero-length while no row differs from the estimate. */
    tree = NO_DELTAS;
    count = 0;
    /**
     * Sized with room to grow: a live list gains rows a few at a time, and an exact
     * fit would reallocate the whole buffer on each arrival.
     */
    allocate(count) {
        this.tree = new Float64Array(count * 2 + 64);
    }
    /**
     * Every row at its estimate. The buffer is DROPPED rather than sized for rows
     * that all measure alike — `prefix` answers zero without one, and `add`
     * allocates the first time a row actually differs.
     */
    clear(count) {
        this.count = count;
        this.tree = NO_DELTAS;
    }
    /**
     * Re-derive every delta, in O(n): `deltaFor` is called once per row, then the
     * in-place Fenwick build folds the slots together. Used after a renumber, where
     * every index addresses a different row.
     */
    rebuild(count, deltaFor) {
        const needed = count + 1;
        // Reused when it still fits, replaced when the list outgrows it or shrinks far
        // below it. No clearing either way: the loop below writes every slot from 1 to
        // `count`, and nothing ever reads past `count` — `prefix` clamps to it and
        // `add` stops at it — so a slot left over from a longer list cannot be read.
        if (this.tree.length < needed || this.tree.length > needed * 4 + 64)
            this.allocate(count);
        for (let i = 0; i < count; i += 1)
            this.tree[i + 1] = deltaFor(i);
        this.count = count;
        for (let i = 1; i <= count; i += 1) {
            const parent = i + (i & -i);
            if (parent <= count)
                this.tree[parent] += this.tree[i];
        }
    }
    add(index, delta) {
        if (this.tree.length < this.count + 1)
            this.allocate(this.count);
        for (let i = index + 1; i <= this.count; i += i & -i)
            this.tree[i] += delta;
    }
    /** Sum of the deltas of rows [0, end). */
    prefix(end) {
        if (this.tree.length === 0)
            return 0;
        let sum = 0;
        for (let i = Math.min(end, this.count); i > 0; i -= i & -i)
            sum += this.tree[i];
        return sum;
    }
}
const EMPTY_WINDOW = {
    start: 0,
    end: 0,
    anchor: 0,
    padTop: 0,
    padBottom: 0,
};
/** Sentinel for "nothing derived yet", distinct from any value a caller can pass. */
const NOTHING_DERIVED = Symbol('nothing-derived');
/**
 * The row index a measured element belongs to, or -1 if it carries none.
 *
 * The index travels on the element rather than in a per-index ref callback so a
 * row that survives a renumber is measured against its new position without being
 * re-attached — which is also what keeps the caller's row memo effective. The
 * cost is that a caller can attach the ref and forget the attribute, and every
 * row would then silently contribute the estimate. That is loud in development
 * rather than silent everywhere.
 */
function indexOfRow(el) {
    const raw = el.dataset.vrow;
    const index = raw === undefined ? Number.NaN : Number(raw);
    if (!Number.isInteger(index)) {
        // Missing and malformed are the same failure — the row is skipped, contributes
        // the estimate, and the scroll range drifts with nothing to trace it by.
        // Always logged: it's a wiring bug (the shared Table sets the attribute itself).
        console.error('useVirtualRows: a row carries `measureRow` but no usable `data-vrow` ' +
            `(got ${JSON.stringify(raw)}), so its height is never measured and the ` +
            'scroll range will drift. Set `data-vrow={index}` on every row the ref ' +
            'is attached to.');
        return -1;
    }
    return index;
}
export function useVirtualRows({ count, estimateRowHeight, rowsIdentity, keyForIndex, scrollResetKey, paused = false, overscan = DEFAULT_OVERSCAN, }) {
    const scrollRef = useRef(null);
    /** The rows in the DOM. Self-clearing: each row's ref cleanup removes it. */
    const rowElsRef = useRef(new Set());
    const treeRef = useRef(new HeightDeltaTree());
    /**
     * Measured height per ROW KEY, for the rows that differ from the estimate.
     * Absence means "the estimate", which is why a uniform table stores nothing.
     */
    const heightsRef = useRef(new Map());
    /**
     * The height each index currently contributes to the tree, for the indices with
     * a non-zero delta. Kept in step with the tree and the height map — all three
     * move together or not at all — so a new measurement is compared against what
     * the offsets actually hold rather than against the measurement history.
     */
    const placedRef = useRef(new Map());
    /** The numbering the tree was last built for. */
    const treeIdentityRef = useRef(NOTHING_DERIVED);
    /**
     * The view the last COMMITTED render was for. Written only from the layout
     * effect: latching a reset during render would let a render React discards
     * carry a scroll-to-top onto the next commit of a view that never changed.
     */
    const committedViewRef = useRef(NOTHING_DERIVED);
    const windowIdentityRef = useRef(NOTHING_DERIVED);
    /** The numbering the last COMMITTED render was for. */
    const committedRowsRef = useRef(NOTHING_DERIVED);
    /**
     * The row at the top of the viewport as the last commit left it, by KEY, with
     * how far it had already scrolled past. A renumber moves it to a new index, and
     * these are what put it back under the cursor.
     */
    const readingRef = useRef({ key: '', index: -1, within: 0 });
    /** The scroll offset held for the duration of a pause, or null when running. */
    const pausedAtRef = useRef(null);
    /**
     * The last offset read while the box still had layout. A pause cannot read it
     * from the DOM: layout effects run after the box is already hidden, and a box
     * with no layout answers 0.
     */
    const lastScrollTopRef = useRef(0);
    const windowRef = useRef(EMPTY_WINDOW);
    const [, bumpRender] = useState(0);
    const offsetOf = useCallback((index) => index * estimateRowHeight + treeRef.current.prefix(index), [estimateRowHeight]);
    /**
     * The row occupying pixel `y`. Clamped at both ends: above the list gives row 0,
     * past its end gives the last row.
     */
    const indexAtOffset = useCallback((y) => {
        let lo = 0;
        let hi = count - 1;
        while (lo < hi) {
            const mid = (lo + hi) >> 1;
            if (offsetOf(mid + 1) > y)
                hi = mid;
            else
                lo = mid + 1;
        }
        return lo;
    }, [count, offsetOf]);
    const computeWindow = useCallback((scrollTopOverride) => {
        if (count === 0)
            return EMPTY_WINDOW;
        const el = scrollRef.current;
        const viewport = el && el.clientHeight > 0 ? el.clientHeight : UNLAID_OUT_VIEWPORT_PX;
        const scrollTop = scrollTopOverride ?? (el ? el.scrollTop : 0);
        const anchor = indexAtOffset(scrollTop);
        const lastVisible = indexAtOffset(scrollTop + viewport);
        const start = Math.max(0, anchor - overscan);
        const end = Math.min(count, lastVisible + 1 + overscan);
        const total = count * estimateRowHeight + treeRef.current.prefix(count);
        return {
            start,
            end,
            anchor,
            padTop: offsetOf(start),
            padBottom: Math.max(0, total - offsetOf(end)),
        };
    }, [count, estimateRowHeight, indexAtOffset, offsetOf, overscan]);
    /**
     * Where `key` sits in the current numbering, searched OUTWARD from where it was.
     * An insert usually moves a row by a handful of places, so the row is found in a
     * few steps; the walk still covers the whole list before giving up.
     */
    const indexOfKey = useCallback((key, from) => {
        // Clamped INTO the list: the index came from the previous numbering, which a
        // shorter list may not have, and an out-of-range start would walk `count`
        // steps without reaching a valid index at the far end.
        const near = Math.min(Math.max(from, 0), Math.max(count - 1, 0));
        for (let step = 0; step < count; step += 1) {
            const after = near + step;
            if (after < count && keyForIndex(after) === key)
                return after;
            const before = near - step;
            if (step > 0 && before >= 0 && keyForIndex(before) === key)
                return before;
        }
        return -1;
    }, [count, keyForIndex]);
    /** Every row back to its estimate, tree and placements together. */
    const resetTreeToEstimates = useCallback(() => {
        placedRef.current.clear();
        treeRef.current.clear(count);
    }, [count]);
    /** Point the index-addressed tree at the numbering `rowsIdentity` describes. */
    const rebuildTree = useCallback(() => {
        const heights = heightsRef.current;
        const placed = placedRef.current;
        placed.clear();
        // The documented common case: nothing measured differs from the estimate, so
        // every delta is provably zero and there is no list to walk.
        if (heights.size === 0) {
            treeRef.current.clear(count);
            return;
        }
        treeRef.current.rebuild(count, (index) => {
            const height = heights.get(keyForIndex(index));
            if (height === undefined)
                return 0;
            placed.set(index, height);
            return height - estimateRowHeight;
        });
    }, [count, estimateRowHeight, keyForIndex]);
    /**
     * Re-derive the window, re-rendering only if it actually moved — or if the one
     * held was derived for another list, which a render React discarded can leave
     * behind.
     */
    const syncWindow = useCallback(() => {
        const next = computeWindow();
        const prev = windowRef.current;
        if (windowIdentityRef.current === rowsIdentity &&
            prev.start === next.start &&
            prev.end === next.end &&
            prev.anchor === next.anchor &&
            Math.abs(prev.padTop - next.padTop) < MEASURE_EPSILON_PX &&
            Math.abs(prev.padBottom - next.padBottom) < MEASURE_EPSILON_PX) {
            return;
        }
        windowIdentityRef.current = rowsIdentity;
        windowRef.current = next;
        bumpRender((v) => v + 1);
    }, [computeWindow, rowsIdentity]);
    // A view change is decided against the last COMMITTED view, so this is a pure
    // read: nothing is latched that a discarded render could leave behind.
    const resettingView = committedViewRef.current !== scrollResetKey && committedViewRef.current !== NOTHING_DERIVED;
    // Both the tree and the window are derived during render, because the spacer
    // heights they produce go into the DOM in this same render. Each is tagged with
    // the numbering it was derived for, so the layout effect can tell whether the
    // render that produced it is the one that committed.
    //
    // Neither is derived while PAUSED — the box has no layout to derive from, and
    // the offset it is holding is restored when the pause lifts — and neither is
    // derived for a view the layout effect is about to reset, which wipes the
    // heights and rebuilds from an empty map anyway.
    if (treeIdentityRef.current !== rowsIdentity) {
        treeIdentityRef.current = rowsIdentity;
        // A view reset wipes the heights and rebuilds from an empty map in the layout
        // effect, so deriving deltas for the outgoing ones here is a full-list walk
        // with a known-discarded result.
        if (resettingView)
            resetTreeToEstimates();
        else
            rebuildTree();
        windowIdentityRef.current = NOTHING_DERIVED;
    }
    // ALWAYS derived when the numbering moves, paused or not: the window is what
    // bounds the rows the caller builds, so one left over from a longer list would
    // address rows that are no longer there. While paused the box answers 0 for its
    // scroll offset, so the one remembered from when it had layout stands in.
    if (windowIdentityRef.current !== rowsIdentity || resettingView) {
        windowIdentityRef.current = rowsIdentity;
        windowRef.current = computeWindow(resettingView ? 0 : paused ? lastScrollTopRef.current : undefined);
    }
    const measureRow = useCallback((el) => {
        if (!el)
            return undefined;
        const rows = rowElsRef.current;
        rows.add(el);
        return () => {
            rows.delete(el);
        };
    }, []);
    // Runs after every render, deliberately without a dependency list: the rows in
    // the DOM change with the window, and each set of them has to be measured once.
    // Converges — a pass that changes nothing does not re-render.
    useLayoutEffect(() => {
        if (paused) {
            if (pausedAtRef.current === null)
                pausedAtRef.current = lastScrollTopRef.current;
            return;
        }
        if (pausedAtRef.current !== null) {
            if (scrollRef.current)
                scrollRef.current.scrollTop = pausedAtRef.current;
            pausedAtRef.current = null;
        }
        if (committedViewRef.current !== scrollResetKey) {
            const firstView = committedViewRef.current === NOTHING_DERIVED;
            committedViewRef.current = scrollResetKey;
            // A different source or a different filter: every key in the map belongs to
            // a list no longer on screen, and nothing above the top — where this is
            // about to land — needs an offset.
            if (!firstView) {
                heightsRef.current.clear();
                treeIdentityRef.current = rowsIdentity;
                rebuildTree();
                if (scrollRef.current)
                    scrollRef.current.scrollTop = 0;
                lastScrollTopRef.current = 0;
                windowIdentityRef.current = NOTHING_DERIVED;
                syncWindow();
            }
        }
        // The tree the DOM was rendered against belongs to a render React discarded,
        // not to this commit. Repair it before anything below reads layout.
        if (treeIdentityRef.current !== rowsIdentity) {
            treeIdentityRef.current = rowsIdentity;
            rebuildTree();
            syncWindow();
        }
        if (committedRowsRef.current !== rowsIdentity) {
            const previous = committedRowsRef.current;
            committedRowsRef.current = rowsIdentity;
            const el = scrollRef.current;
            const reading = readingRef.current;
            // ROWS ARRIVING ABOVE THE ONE BEING READ MOVE IT. Every index below an
            // insert shifts, so a scroll offset left alone addresses a different
            // record — and on a list that takes an insert every few hundred ms, the
            // reader walks steadily down it. Only measurement deltas reach the
            // compensation below, so the renumber is answered here instead.
            if (previous !== NOTHING_DERIVED && el && el.scrollTop > 0 && reading.index >= 0) {
                const moved = indexOfKey(reading.key, reading.index);
                if (moved >= 0 && moved !== reading.index) {
                    el.scrollTop = offsetOf(moved) + reading.within;
                    syncWindow();
                }
            }
        }
        const tree = treeRef.current;
        const heights = heightsRef.current;
        const placed = placedRef.current;
        const { anchor } = windowRef.current;
        let compensation = 0;
        for (const el of rowElsRef.current) {
            const index = indexOfRow(el);
            if (index < 0 || index >= count)
                continue;
            const key = keyForIndex(index);
            const laidOut = el.getBoundingClientRect().height;
            // A zero height is a row that is not laid out — detached, `display: none`,
            // or under jsdom — not a row zero pixels tall. Fall back to what this row
            // measured the last time it was on screen, and to the estimate before that.
            const height = laidOut > 0 ? laidOut : (heights.get(key) ?? estimateRowHeight);
            const isException = Math.abs(height - estimateRowHeight) >= MEASURE_EPSILON_PX;
            // What this row is about to contribute, which is the estimate exactly unless
            // it is an exception. The tree, `placed` and `heights` all move to this one
            // value together, so no two of them can end up describing the row
            // differently — a row that falls back under the epsilon must not leave a
            // delta behind for a later rebuild to drop.
            const contribution = isException ? height : estimateRowHeight;
            const inTree = placed.get(index) ?? estimateRowHeight;
            const delta = contribution - inTree;
            if (Math.abs(delta) < MEASURE_EPSILON_PX)
                continue;
            if (isException) {
                heights.set(key, contribution);
                placed.set(index, contribution);
            }
            else {
                heights.delete(key);
                placed.delete(index);
            }
            tree.add(index, delta);
            if (index < anchor)
                compensation += delta;
        }
        // At the very end of the list the browser clamps this and the correction lands
        // short, so the window moves. That is the honest answer there: the content
        // genuinely cannot scroll further to hold the row still.
        if (compensation !== 0 && scrollRef.current)
            scrollRef.current.scrollTop += compensation;
        // Unconditional. The first render sizes the window against
        // UNLAID_OUT_VIEWPORT_PX because the container is not mounted yet; this is
        // where a viewport taller than that gets the rows to fill it.
        syncWindow();
        // Recorded after the window has settled, so the next renumber has the row
        // actually on screen to put back rather than the one before the correction.
        const settled = windowRef.current;
        readingRef.current =
            count > 0
                ? {
                    key: keyForIndex(settled.anchor),
                    index: settled.anchor,
                    within: (scrollRef.current?.scrollTop ?? 0) - offsetOf(settled.anchor),
                }
                : { key: '', index: -1, within: 0 };
        lastScrollTopRef.current = scrollRef.current?.scrollTop ?? 0;
    });
    // Everything the observer needs, re-pointed each render, so the subscription
    // itself can be permanent. Re-subscribing per render would disconnect on every
    // insert — dropping any resize observed but not yet delivered, and re-seeding
    // the remembered width to the new one, so the re-wrap it should have reacted to
    // would go unnoticed.
    const observedRef = useRef({ rebuildTree, offsetOf, syncWindow, lastWidth: -1 });
    observedRef.current.rebuildTree = rebuildTree;
    observedRef.current.offsetOf = offsetOf;
    observedRef.current.syncWindow = syncWindow;
    useEffect(() => {
        const el = scrollRef.current;
        if (!el || typeof ResizeObserver === 'undefined')
            return;
        // Seeded before observing, because the observer fires once on subscription: an
        // unseeded width would read as a change and throw away the heights the mount's
        // measuring pass just took.
        observedRef.current.lastWidth = el.clientWidth;
        const observer = new ResizeObserver(() => {
            const observed = observedRef.current;
            // A box with no layout has no width to compare. Hiding the table behind
            // another view collapses it to zero and shows it again at the width it
            // always had — answering that as a re-wrap would throw away every measured
            // height for a detour that changed nothing.
            if (el.clientWidth === 0)
                return;
            // A WIDTH change re-wraps every row, so the remembered heights were measured
            // against a layout that no longer exists. A height-only change — the browser
            // window growing — leaves them valid and only moves the window.
            if (Math.abs(el.clientWidth - observed.lastWidth) >= 1) {
                observed.lastWidth = el.clientWidth;
                // The row being read, so the collapse back to estimates can be undone for
                // the position: dropping the deltas above the viewport shortens everything
                // before it, and leaving `scrollTop` alone would throw the reader that far
                // down the list.
                const { anchor } = windowRef.current;
                heightsRef.current.clear();
                observed.rebuildTree();
                el.scrollTop = observed.offsetOf(anchor);
                // Republished, not merely re-rendered: the spacer heights on screen were
                // derived from the tree that was just emptied, and a render that reused
                // them would put the viewport inside the leading spacer. Dropping the tag
                // makes `syncWindow` re-derive rather than compare against them.
                windowIdentityRef.current = NOTHING_DERIVED;
                observed.syncWindow();
                return;
            }
            observed.syncWindow();
        });
        observer.observe(el);
        return () => observer.disconnect();
    }, []);
    // Records the offset before deriving from it, so a pause has a value taken
    // while the box still had layout to fall back on.
    const handleScroll = useCallback(() => {
        lastScrollTopRef.current = scrollRef.current?.scrollTop ?? 0;
        syncWindow();
    }, [syncWindow]);
    return { scrollRef, onScroll: handleScroll, measureRow, window: windowRef.current };
}
