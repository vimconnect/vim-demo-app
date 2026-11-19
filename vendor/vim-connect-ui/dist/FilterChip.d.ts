import React from 'react';
import { type VariantProps } from 'class-variance-authority';
/**
 * Selectable category filter chip — vim-ai Filter Chip. Rest is muted on a
 * card fill; `active` flips to cyan tint + strong cyan text. Optional count
 * badge uses the same currentColor 24% hairline as Badge. Parent owns which
 * chip is selected and what click does.
 */
declare const filterChipVariants: (props?: ({
    active?: boolean | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
declare const filterChipCountClasses: string;
export type FilterChipActive = NonNullable<VariantProps<typeof filterChipVariants>['active']>;
export interface FilterChipProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'color' | 'children'> {
    label: string;
    /** Nested count pill after the label; omit for label-only. */
    count?: number;
    active?: boolean;
}
export declare const FilterChip: React.ForwardRefExoticComponent<FilterChipProps & React.RefAttributes<HTMLButtonElement>>;
export { filterChipVariants, filterChipCountClasses };
