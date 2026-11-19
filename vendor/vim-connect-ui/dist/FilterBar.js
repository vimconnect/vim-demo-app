import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
import { cva } from 'class-variance-authority';
import { FilterChip } from './FilterChip.js';
import { HorizontalScroller } from './HorizontalScroller.js';
import { cn } from './cn.js';
const filterBarVariants = cva([
    'flex items-center gap-[var(--space-md)] flex-nowrap',
    'mb-[var(--space-2xl)] p-[var(--space-md)]',
    '[background:var(--fb-bg)] rounded-[var(--fb-radius)]',
    'sticky z-[40] [top:var(--fb-top)]',
    '[transition:border-radius_var(--transition-slow)]',
].join(' '), {
    variants: {
        // --fb-* live on the class so theme / call-site CSS can override them.
        flushTop: {
            false: '[--fb-radius:var(--radius-xl)]',
            true: '[--fb-radius:0_0_var(--radius-xl)_var(--radius-xl)]',
        },
        stackedBelowTabs: {
            false: '[--fb-top:0]',
            true: '[--fb-top:var(--tab-nav-height,0px)]',
        },
    },
    defaultVariants: { flushTop: false, stackedBelowTabs: false },
});
/**
 * Sticky horizontal row of category FilterChips — vim-ai Filter Bar.
 * Presentational: "All" + one chip per option; parent owns selection.
 * Owns layout, stuck state, scroller, and optional trailing slot.
 */
export function FilterBar({ options, totalCount, allLabel = 'All', selectedValue, onSelect, ariaLabel = 'Filter', trailing, stackedBelowTabs = false, className, }) {
    const sentinelRef = useRef(null);
    const [isStuck, setIsStuck] = useState(false);
    const hasOptions = options.length > 0;
    useEffect(() => {
        if (!hasOptions) {
            setIsStuck(false);
            return;
        }
        const sentinel = sentinelRef.current;
        if (!sentinel)
            return;
        const observer = new IntersectionObserver(([entry]) => setIsStuck(!entry.isIntersecting), { threshold: 0 });
        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [hasOptions]);
    if (!hasOptions)
        return null;
    return (_jsxs(_Fragment, { children: [_jsx("div", { ref: sentinelRef, className: "h-px -mb-px w-full overflow-hidden pointer-events-none", "aria-hidden": "true", "data-ui": "filter-bar-sentinel" }), _jsxs("div", { role: "group", "aria-label": ariaLabel, "data-ui": "filter-bar", "data-stuck": isStuck ? '' : undefined, "data-stacked-below-tabs": stackedBelowTabs ? '' : undefined, className: cn('[--fb-bg:var(--color-bg-primary)]', filterBarVariants({
                    flushTop: isStuck || stackedBelowTabs,
                    stackedBelowTabs,
                }), className), children: [_jsx(HorizontalScroller, { className: "flex-1 min-w-0", gradientColor: "var(--color-bg-primary)", children: _jsxs("div", { className: "flex items-center gap-[var(--space-xs)] flex-nowrap w-max", children: [_jsx(FilterChip, { label: allLabel, count: totalCount, active: selectedValue === null, onClick: () => onSelect(null) }), options.map(({ value, label, count }) => (_jsx(FilterChip, { label: label, count: count, active: selectedValue === value, onClick: () => onSelect(value) }, value)))] }) }), trailing != null ? (_jsxs("div", { className: "flex items-center gap-[var(--space-md)] shrink-0", "data-ui": "filter-bar-trailing", children: [_jsx("span", { className: "w-px h-5 [background:var(--color-border-medium)] shrink-0", "aria-hidden": "true" }), trailing] })) : null] })] }));
}
export { filterBarVariants };
