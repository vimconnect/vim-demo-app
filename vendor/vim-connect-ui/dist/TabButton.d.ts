import React from 'react';
import { type VariantProps } from 'class-variance-authority';
/**
 * One underline tab — vim-ai `Design System.html` → Tab Bar.
 * Optional leading icon, label, `CountBadge` (`accent` when active), and an
 * adornment after the count. `tab-item` / `active` stay as unstyled hooks for
 * product CSS (e.g. `.tab-nav--compact .tab-item`); the look is Tailwind on
 * DS tokens.
 *
 * Classes mean the same in Tailwind v3 and v4: arbitrary values on DS tokens
 * only and no `!` important marker.
 */
declare const tabButtonVariants: (props?: ({
    active?: boolean | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
export type TabButtonActive = NonNullable<VariantProps<typeof tabButtonVariants>['active']>;
export interface TabButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'type' | 'role' | 'aria-selected' | 'onClick' | 'color'> {
    label: string;
    count: number;
    active: boolean;
    onClick: () => void;
    icon?: React.ComponentType<{
        className?: string;
        'aria-hidden'?: boolean | 'true';
    }>;
    /** Render the pill even at zero (default). `false` hides an empty count. */
    showZero?: boolean;
    /** Right of the count — e.g. a warning dot flagging that this tab needs attention. */
    adornment?: React.ReactNode;
    /** Prefer over a label-derived id when a stable test hook is required. */
    'data-testid'?: string;
}
export declare const TabButton: React.ForwardRefExoticComponent<TabButtonProps & React.RefAttributes<HTMLButtonElement>>;
export { tabButtonVariants };
