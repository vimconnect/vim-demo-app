import type React from 'react';
/** The bubble's look, for a tooltip a product positions itself (the side panel's icon-button and
 *  `title` tooltips). Add `whitespace-nowrap` for one line, or the `wrap` style for several.
 *  Tailwind classes on DS tokens: the product's Tailwind must scan this file (an `@source` line for
 *  `packages/ui/src/tooltipShared.tsx`), or the bubble renders unstyled. */
export declare const TOOLTIP_BUBBLE_CLASS: string;
export declare const VIEWPORT_MARGIN = 4;
/** Several lines, up to 380px, never wider than the viewport (a narrow side panel). */
export declare const TOOLTIP_WRAP_STYLE: React.CSSProperties;
