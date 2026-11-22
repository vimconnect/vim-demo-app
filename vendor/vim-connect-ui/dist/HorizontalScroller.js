'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Tooltip } from './Tooltip.js';
import { cn } from './cn.js';
const chevronSvgProps = {
    xmlns: 'http://www.w3.org/2000/svg',
    width: 16,
    height: 16,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
    className: 'size-[var(--space-lg)] shrink-0',
};
const ChevronLeftGlyph = () => (_jsx("svg", { ...chevronSvgProps, children: _jsx("path", { d: "m15 18-6-6 6-6" }) }));
const ChevronRightGlyph = () => (_jsx("svg", { ...chevronSvgProps, children: _jsx("path", { d: "m9 18 6-6-6-6" }) }));
const scrollerButtonClasses = [
    'shrink-0 flex items-center justify-center p-0 border-0 bg-transparent',
    'cursor-pointer opacity-50 z-[20] [font-family:inherit]',
    '[color:var(--color-text-muted)]',
    '[transition:opacity_var(--transition-base),color_var(--transition-base)]',
    'hover:opacity-100 hover:[color:var(--color-text-secondary)]',
    'focus-visible:outline-none focus-visible:[box-shadow:var(--shadow-focus)]',
].join(' ');
/**
 * Horizontally scrollable region with edge fades and chevron controls.
 * Chevrons mount only when content overflows in that direction.
 */
export const HorizontalScroller = React.forwardRef(function HorizontalScroller({ className, gradientColor = 'var(--color-bg-card)', scrollAmount = 200, children, ...props }, ref) {
    const scrollContainerRef = useRef(null);
    const contentRef = useRef(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);
    useEffect(() => {
        const container = scrollContainerRef.current;
        const content = contentRef.current;
        if (!container || !content)
            return;
        const checkScroll = () => {
            setCanScrollLeft(container.scrollLeft > 0);
            setCanScrollRight(container.scrollLeft < container.scrollWidth - container.clientWidth - 1);
        };
        const handleWheel = (e) => {
            if (Math.abs(e.deltaY) <= Math.abs(e.deltaX))
                return;
            const maxScrollLeft = container.scrollWidth - container.clientWidth;
            if (maxScrollLeft <= 1)
                return;
            const scrollingTowardStart = e.deltaY < 0;
            const canMove = scrollingTowardStart
                ? container.scrollLeft > 0
                : container.scrollLeft < maxScrollLeft - 1;
            if (!canMove)
                return;
            e.preventDefault();
            container.scrollBy({ left: e.deltaY, behavior: 'auto' });
        };
        checkScroll();
        container.addEventListener('scroll', checkScroll);
        window.addEventListener('resize', checkScroll);
        container.addEventListener('wheel', handleWheel, { passive: false });
        const resizeObserver = new ResizeObserver(checkScroll);
        resizeObserver.observe(container);
        resizeObserver.observe(content);
        return () => {
            container.removeEventListener('scroll', checkScroll);
            window.removeEventListener('resize', checkScroll);
            container.removeEventListener('wheel', handleWheel);
            resizeObserver.disconnect();
        };
    }, []);
    const scroll = useCallback((direction) => {
        const container = scrollContainerRef.current;
        if (!container)
            return;
        container.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: 'smooth',
        });
    }, [scrollAmount]);
    const gradientStyle = (direction) => ({
        background: `linear-gradient(to ${direction === 'left' ? 'right' : 'left'}, ${gradientColor} 0%, ${gradientColor} 20%, transparent 100%)`,
    });
    return (_jsxs("div", { ref: ref, "data-ui": "horizontal-scroller", className: cn('relative flex items-center', className), ...props, children: [canScrollLeft ? (_jsx(Tooltip, { label: "Scroll left", children: _jsx("button", { "data-ui": "horizontal-scroller-button", type: "button", onClick: () => scroll('left'), className: scrollerButtonClasses, "aria-label": "Scroll left", children: _jsx(ChevronLeftGlyph, {}) }) })) : null, _jsxs("div", { className: "relative flex-1 min-w-0", children: [canScrollLeft ? (_jsx("div", { className: "absolute top-0 left-0 z-[10] h-full w-[calc(var(--space-3xl)*2)] pointer-events-none", style: gradientStyle('left'), "aria-hidden": "true" })) : null, canScrollRight ? (_jsx("div", { className: "absolute top-0 right-0 z-[10] h-full w-[calc(var(--space-3xl)*2)] pointer-events-none", style: gradientStyle('right'), "aria-hidden": "true" })) : null, _jsx("div", { ref: scrollContainerRef, "data-ui": "horizontal-scroller-scroll", className: [
                            'overflow-x-auto w-full',
                            '[scrollbar-width:none] [-ms-overflow-style:none]',
                            '[&::-webkit-scrollbar]:hidden',
                        ].join(' '), children: _jsx("div", { ref: contentRef, className: "w-max", children: children }) })] }), canScrollRight ? (_jsx(Tooltip, { label: "Scroll right", children: _jsx("button", { "data-ui": "horizontal-scroller-button", type: "button", onClick: () => scroll('right'), className: scrollerButtonClasses, "aria-label": "Scroll right", children: _jsx(ChevronRightGlyph, {}) }) })) : null] }));
});
HorizontalScroller.displayName = 'HorizontalScroller';
