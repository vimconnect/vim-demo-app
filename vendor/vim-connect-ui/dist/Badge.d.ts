import React from 'react';
import { type VariantProps } from 'class-variance-authority';
/**
 * Status / category pill — the design system's Badges section (vim-ai
 * `Design System.html` → Badges). Shape is shared; each variant only sets its
 * own tint (`--badge-bg`) and label colour (`--badge-fg`). The border is always
 * the label's own colour at 24%, so it follows `--badge-fg` for free.
 *
 * Tailwind + `cva` on the shared tokens, the `write-ui-component` recipe
 * (`Button.tsx` in this package). Every product's Tailwind scans this package, so the
 * classes below are written to mean the same in Tailwind v3 and v4: arbitrary
 * values on DS tokens only (no theme names such as `font-sans`, which each app
 * can redefine) and no `!` important marker.
 *
 * Keep the label to one word when possible. Icons go in as children (sized
 * 10px, 9px at `sm`), e.g. the "Vim staff" Vim icon.
 */
declare const badgeVariants: (props?: ({
    variant?: "neutral" | "error" | "purple" | "success" | "warning" | "info" | null | undefined;
    size?: "sm" | "default" | null | undefined;
    dot?: boolean | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
export type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>['variant']>;
export type BadgeSize = NonNullable<VariantProps<typeof badgeVariants>['size']>;
export interface BadgeProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'color'> {
    variant?: BadgeVariant;
    size?: BadgeSize;
    /** Leading status dot — when the colour alone isn't the whole signal ("Live", "Needs review"). */
    dot?: boolean;
}
export declare const Badge: React.ForwardRefExoticComponent<BadgeProps & React.RefAttributes<HTMLSpanElement>>;
export { badgeVariants };
