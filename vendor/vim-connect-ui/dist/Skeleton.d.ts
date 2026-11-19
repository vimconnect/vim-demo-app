import React from 'react';
export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
    /** A number is px; a string is any CSS length ("40%"). Default: the container's width. */
    width?: number | string;
    /** A number is px. Match the line it stands in for: 12 a caption, 16 body text, 24 a heading, 32 a page title, 38 a field or button. */
    height?: number | string;
    /** Corner: `base` (default) for text and fields, `lg` for an image or card-sized block, `full` for a pill or avatar, `sm` for a hairline. */
    radius?: 'sm' | 'base' | 'lg' | 'full';
}
/**
 * One shimmering placeholder block, standing in for a line of text, a field, an
 * image or an avatar while it loads. Hidden from assistive tech: the page-level
 * template, or whatever holds the blocks, carries the loading status. Still under
 * reduced motion.
 */
export declare const Skeleton: React.ForwardRefExoticComponent<SkeletonProps & React.RefAttributes<HTMLDivElement>>;
export interface SkeletonListPageProps {
    /** How many card rows; default 5. */
    rows?: number;
}
/** A list page's first load: the page header, then card rows (icon, two lines, two pills). */
export declare function SkeletonListPage({ rows }: SkeletonListPageProps): import("react/jsx-runtime").JSX.Element;
export interface SkeletonGridPageProps {
    /** How many cards; default 6. */
    cards?: number;
    /** The page header row; default `true`. */
    showHeader?: boolean;
    /** The filter bar above the grid; default `true`. */
    showFilter?: boolean;
}
/** A grid page's first load (app cards): optional header and filter bar, then 1/2/3-column cards. */
export declare function SkeletonGridPage({ cards, showHeader, showFilter }: SkeletonGridPageProps): import("react/jsx-runtime").JSX.Element;
/** A detail page's first load: back link, icon and title, a status pill, three section cards. */
export declare function SkeletonDetailPage(): import("react/jsx-runtime").JSX.Element;
export interface SkeletonTablePageProps {
    /** Columns; default 5. */
    cols?: number;
    /** Body rows; default 8. */
    rows?: number;
}
/** A table page's first load: the page header, then a card with a filter bar, column headings and rows. */
export declare function SkeletonTablePage({ cols, rows }: SkeletonTablePageProps): import("react/jsx-runtime").JSX.Element;
