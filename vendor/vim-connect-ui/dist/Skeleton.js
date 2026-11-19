import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from './cn.js';
import { Card } from './Card.js';
const SHIMMER_KEYFRAMES = '@keyframes vc-skeleton-shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}';
const skeletonVariants = cva([
    'block shrink-0',
    '[background:linear-gradient(90deg,color-mix(in_srgb,var(--color-text-primary)_5%,transparent)_25%,color-mix(in_srgb,var(--color-text-primary)_10%,transparent)_50%,color-mix(in_srgb,var(--color-text-primary)_5%,transparent)_75%)_0_0/200%_100%]',
    'motion-safe:[animation:vc-skeleton-shimmer_1.6s_ease-in-out_infinite]',
].join(' '), {
    variants: {
        radius: {
            sm: 'rounded-[var(--radius-sm)]',
            base: 'rounded-[var(--radius-base)]',
            lg: 'rounded-[var(--radius-lg)]',
            full: 'rounded-full',
        },
    },
});
const px = (v) => (typeof v === 'number' ? `${v}px` : v);
/**
 * One shimmering placeholder block, standing in for a line of text, a field, an
 * image or an avatar while it loads. Hidden from assistive tech: the page-level
 * template, or whatever holds the blocks, carries the loading status. Still under
 * reduced motion.
 */
export const Skeleton = React.forwardRef(function Skeleton({ width, height, radius = 'base', className, style, ...rest }, ref) {
    return (_jsxs(_Fragment, { children: [_jsx("div", { ref: ref, "aria-hidden": "true", ...rest, "data-ui": "skeleton", className: cn(skeletonVariants({ radius }), className), style: { width: px(width), height: px(height), ...style } }), _jsx("style", { href: "vc-skeleton-keyframes", precedence: "default", children: SHIMMER_KEYFRAMES })] }));
});
function LoadingRegion({ children }) {
    return (_jsx("div", { role: "status", "aria-label": "Loading", "aria-busy": "true", "data-ui": "skeleton-page", children: children }));
}
function PageHeader() {
    return (_jsxs("div", { className: "flex items-start justify-between mb-[var(--space-3xl)]", children: [_jsxs("div", { children: [_jsx(Skeleton, { height: 32, width: 224 }), _jsx(Skeleton, { height: 16, width: "60%", className: "mt-[var(--space-sm)]" })] }), _jsx(Skeleton, { height: 38, width: 144 })] }));
}
/** A list page's first load: the page header, then card rows (icon, two lines, two pills). */
export function SkeletonListPage({ rows = 5 }) {
    return (_jsxs(LoadingRegion, { children: [_jsx(PageHeader, {}), _jsx("div", { className: "flex flex-col gap-[var(--space-sm)]", children: Array.from({ length: rows }).map((_, i) => (_jsxs(Card, { className: "flex items-center gap-[var(--space-lg)] px-[var(--space-2xl)] py-[var(--space-lg)]", children: [_jsx(Skeleton, { width: 40, height: 40 }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx(Skeleton, { height: 16, width: "50%" }), _jsx(Skeleton, { height: 12, width: "30%", className: "mt-[var(--space-xs)]" })] }), _jsx(Skeleton, { height: 16, width: 112, radius: "full" }), _jsx(Skeleton, { height: 16, width: 80, radius: "full" })] }, i))) })] }));
}
/** A grid page's first load (app cards): optional header and filter bar, then 1/2/3-column cards. */
export function SkeletonGridPage({ cards = 6, showHeader = true, showFilter = true }) {
    return (_jsxs(LoadingRegion, { children: [showHeader && _jsx(PageHeader, {}), showFilter && (_jsx("div", { className: "mb-[var(--space-lg)] p-[var(--space-md)] rounded-[var(--radius-md)] [background:var(--glass-bg-subtle)]", children: _jsx(Skeleton, { height: 25, radius: "lg" }) })), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[var(--space-lg)]", children: Array.from({ length: cards }).map((_, i) => (_jsxs(Card, { className: "p-[var(--space-lg)] min-h-[186px]", children: [_jsx(Skeleton, { height: 64, radius: "lg" }), _jsx(Skeleton, { height: 24, width: "60%", className: "mt-[var(--space-md)]" }), _jsx(Skeleton, { height: 16, className: "mt-[var(--space-sm)]" }), _jsx(Skeleton, { height: 16, width: "70%", className: "mt-[var(--space-xs)]" })] }, i))) })] }));
}
/** A detail page's first load: back link, icon and title, a status pill, three section cards. */
export function SkeletonDetailPage() {
    return (_jsxs(LoadingRegion, { children: [_jsx(Skeleton, { height: 16, width: 112 }), _jsxs("div", { className: "flex items-center justify-between mt-[var(--space-2xl)] mb-[var(--space-3xl)]", children: [_jsxs("div", { className: "flex items-center gap-[var(--space-lg)]", children: [_jsx(Skeleton, { width: 64, height: 64 }), _jsxs("div", { children: [_jsx(Skeleton, { height: 32, width: 224 }), _jsx(Skeleton, { height: 16, width: "40%", className: "mt-[var(--space-sm)]" })] })] }), _jsx(Skeleton, { height: 24, width: 80, radius: "full" })] }), _jsx("div", { className: "flex flex-col gap-[var(--space-lg)]", children: ['35%', '55%', '45%'].map((w) => (_jsxs(Card, { className: "p-[var(--space-2xl)]", children: [_jsx(Skeleton, { height: 24, width: w, className: "mb-[var(--space-lg)]" }), _jsx(Skeleton, { height: 16, width: "80%" }), _jsx(Skeleton, { height: 16, width: "60%", className: "mt-[var(--space-sm)]" })] }, w))) })] }));
}
/** A table page's first load: the page header, then a card with a filter bar, column headings and rows. */
export function SkeletonTablePage({ cols = 5, rows = 8 }) {
    const columns = Array.from({ length: cols });
    return (_jsxs(LoadingRegion, { children: [_jsx(PageHeader, {}), _jsxs(Card, { className: "p-0 overflow-hidden", children: [_jsxs("div", { className: "flex gap-[var(--space-md)] px-[var(--space-2xl)] py-[var(--space-lg)] border-0 border-b border-solid [border-color:var(--glass-border-subtle)]", children: [_jsx(Skeleton, { height: 38, className: "flex-1" }), _jsx(Skeleton, { height: 38, width: 160 })] }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "min-w-full border-collapse", children: [_jsx("thead", { children: _jsx("tr", { className: "border-0 border-b border-solid [border-color:var(--glass-border-subtle)]", children: columns.map((_, i) => (_jsx("th", { className: "px-[var(--space-2xl)] py-[var(--space-md)] text-left", children: _jsx(Skeleton, { height: 12, width: "60%" }) }, i))) }) }), _jsx("tbody", { children: Array.from({ length: rows }).map((_, r) => (_jsx("tr", { children: columns.map((_, i) => (_jsx("td", { className: "px-[var(--space-2xl)] py-[var(--space-lg)]", children: _jsx(Skeleton, { height: 16, width: i === 0 ? '70%' : '50%' }) }, i))) }, r))) })] }) })] })] }));
}
