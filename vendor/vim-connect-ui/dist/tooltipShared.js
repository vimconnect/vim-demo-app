// Fixed, on the tooltip layer: above modals (--z-modal) and popovers (--z-popover), so above
// every overlay, the account switcher's dropdown included.
/** The bubble's look, for a tooltip a product positions itself (the side panel's icon-button and
 *  `title` tooltips). Add `whitespace-nowrap` for one line, or the `wrap` style for several.
 *  Tailwind classes on DS tokens: the product's Tailwind must scan this file (an `@source` line for
 *  `packages/ui/src/tooltipShared.tsx`), or the bubble renders unstyled. */
export const TOOLTIP_BUBBLE_CLASS = [
    'fixed z-[var(--z-tooltip,3000)] pointer-events-none',
    'px-[var(--space-lg)] py-[var(--space-md)] rounded-[var(--radius-md)]',
    '[background:var(--color-bg-primary)] [color:var(--color-text-primary)]',
    'border border-solid [border-color:var(--color-border-medium)] [box-shadow:var(--shadow-card-hover-tight)]',
    '[font-family:var(--font-sans)] text-[length:var(--text-sm)] leading-[1.4]',
].join(' ');
export const VIEWPORT_MARGIN = 4;
/** Several lines, up to 380px, never wider than the viewport (a narrow side panel). */
export const TOOLTIP_WRAP_STYLE = {
    whiteSpace: 'normal',
    // max-content before the cap, or the box shrink-fits to the space left of the viewport edge.
    width: 'max-content',
    maxWidth: `min(380px, calc(100vw - ${2 * VIEWPORT_MARGIN}px))`,
    lineHeight: 1.5,
};
