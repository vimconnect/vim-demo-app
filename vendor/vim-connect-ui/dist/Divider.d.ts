import React from 'react';
export interface DividerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'role'> {
    /** `horizontal` (default): a rule across its container. `vertical`: a 16px rule between inline items. */
    orientation?: 'horizontal' | 'vertical';
    /** `light` (default) is `--color-border-light`; `medium` is `--color-border-medium`, for a rule on a tinted or busy surface. */
    strength?: 'light' | 'medium';
    /**
     * Decorative (default): hidden from assistive tech, for a visual break between
     * items that already read as separate. `false` makes it a `role="separator"`,
     * e.g. between groups in a menu.
     */
    decorative?: boolean;
}
/**
 * Divider (DS → Divider): a 1px hairline between items. Spacing around it is the
 * caller's (a margin on `className`).
 */
export declare const Divider: React.ForwardRefExoticComponent<DividerProps & React.RefAttributes<HTMLDivElement>>;
