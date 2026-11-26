/**
 * True while an element scrolls, and for `ms` after its last scroll event. Pass `onScroll` to the
 * scroll container; drive a show-while-scrolling style (a scrollbar thumb) from `scrolling`.
 */
export declare function useScrollingFlag(ms: number): {
    scrolling: boolean;
    onScroll: () => void;
};
