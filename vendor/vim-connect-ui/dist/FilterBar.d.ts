import React from 'react';
import { type VariantProps } from 'class-variance-authority';
import { filterBarVariants } from './filterBarShared.js';
export type FilterBarFlushTop = NonNullable<VariantProps<typeof filterBarVariants>['flushTop']>;
export type FilterBarStackedBelowTabs = NonNullable<VariantProps<typeof filterBarVariants>['stackedBelowTabs']>;
export interface FilterBarOption<T extends string = string> {
    value: T;
    label: string;
    count: number;
}
export interface FilterBarProps<T extends string = string> {
    /** Filter options (excludes the unfiltered "All" chip). */
    options: FilterBarOption<T>[];
    /** Total item count shown on the "All" chip. */
    totalCount: number;
    /** Label for the "All" chip. */
    allLabel?: string;
    /**
     * Selected option, or `null` for unfiltered (All).
     * Must be a value present in `options`, or null. When the catalog can drop
     * the current value, resolve it in the parent before passing — FilterBar
     * does not clear a stale selection.
     */
    selectedValue: T | null;
    /**
     * User chip clicks only. FilterBar never calls this to recover from a stale
     * selection; that belongs to the selection owner.
     */
    onSelect: (value: T | null) => void;
    /** Accessible name for the chip group. */
    ariaLabel?: string;
    /**
     * Optional right-side content. Prefer composing TextLink (or similar)
     * so markup and styles stay co-owned; FilterBar only provides layout + divider.
     */
    trailing?: React.ReactNode;
    /**
     * Stick flush under a tab strip. Requires `--tab-nav-height` on the product
     * (falls back to `0` if unset).
     */
    stackedBelowTabs?: boolean;
    className?: string;
}
/**
 * Sticky horizontal row of category FilterChips — vim-ai Filter Bar.
 * Presentational: "All" + one chip per option; parent owns selection.
 * Owns layout, stuck state, scroller, and optional trailing slot.
 */
export declare function FilterBar<T extends string>({ options, totalCount, allLabel, selectedValue, onSelect, ariaLabel, trailing, stackedBelowTabs, className, }: FilterBarProps<T>): import("react/jsx-runtime").JSX.Element | null;
