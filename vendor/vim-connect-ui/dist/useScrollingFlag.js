'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
/**
 * True while an element scrolls, and for `ms` after its last scroll event. Pass `onScroll` to the
 * scroll container; drive a show-while-scrolling style (a scrollbar thumb) from `scrolling`.
 */
export function useScrollingFlag(ms) {
    const [scrolling, setScrolling] = useState(false);
    const timer = useRef(null);
    const onScroll = useCallback(() => {
        setScrolling(true);
        if (timer.current)
            clearTimeout(timer.current);
        timer.current = setTimeout(() => setScrolling(false), ms);
    }, [ms]);
    useEffect(() => () => {
        if (timer.current)
            clearTimeout(timer.current);
    }, []);
    return { scrolling, onScroll };
}
