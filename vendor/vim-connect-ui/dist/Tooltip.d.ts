import React from 'react';
/**
 * Hover/focus label — the design system's Tooltip section (vim-ai `Design System.html`
 * → Tooltip): for a label that needs more than a native `title` (which can't be
 * styled and shows on a delay). Wraps one child element and opens a `role="tooltip"`
 * popover above it (below when there's no room), clamped inside the viewport.
 *
 * Look: `--color-bg-primary`, `--color-border-medium` hairline, `--radius-md`,
 * `--space-md` `--space-lg` padding, 12px text, and the `--shadow-card-hover-tight` glow.
 * `wrap` lets long content run onto several lines, up to 380px wide.
 *
 * Tailwind on the shared tokens (the `write-ui-component` recipe), v3/v4-safe.
 */
export interface TooltipProps {
    label: string;
    children: React.ReactElement;
    /** Wraps the label onto multiple lines within a max width instead of the
     *  default single nowrap line — for longer content (e.g. a full request
     *  message) where forcing one line would overflow the viewport. */
    wrap?: boolean;
    /** Keeps the tooltip closed, and closes it if open, e.g. while the trigger's own popover is showing. */
    disabled?: boolean;
}
export declare const Tooltip: React.FC<TooltipProps>;
export default Tooltip;
