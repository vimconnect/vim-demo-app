import { jsx as _jsx } from "react/jsx-runtime";
import { useState } from 'react';
import { cva } from 'class-variance-authority';
import { appIconFallback, isRenderableIconUrl } from '@vim-connect/runtime-types/app-icon';
import { cn } from './cn.js';
/**
 * Each step's box: size and radius. The one source for the icon's own size
 * variants and for anything that must sit level with an icon of that step (a
 * "+N" badge beside a strip), via `appIconBox`.
 */
const BOX = {
    xs: 'size-[16px] rounded-[var(--radius-sm)]',
    sm: 'size-[24px] rounded-[var(--radius-base)]',
    md: 'size-[32px] rounded-[var(--radius-md)]',
    lg: 'size-[44px] rounded-[var(--radius-lg)]',
    xl: 'size-[64px] rounded-[var(--radius-2xl)]',
    '2xl': 'size-[88px] rounded-[var(--radius-2xl)]',
};
/** The size and radius classes of an App Icon step, for an element that must match it. */
export function appIconBox(size) {
    return BOX[size];
}
const appIconVariants = cva([
    'relative inline-flex shrink-0 items-center justify-center overflow-hidden align-middle select-none',
    '[font-weight:var(--font-bold)] leading-none tracking-[0.02em] [color:var(--color-text-on-gradient)]',
], {
    variants: {
        size: {
            xs: [BOX.xs, 'text-[length:var(--text-2xs)]'],
            sm: [BOX.sm, 'text-[length:var(--text-2xs)]'],
            md: [BOX.md, 'text-[length:var(--text-sm)]'],
            lg: [BOX.lg, 'text-[length:var(--text-xl)]'],
            xl: [BOX.xl, 'text-[length:var(--text-2xl)]'],
            '2xl': [BOX['2xl'], 'text-[length:var(--text-3xl)]'],
        },
        ring: {
            true: '[box-shadow:0_0_0_2px_var(--color-bg-card)]',
            false: '',
        },
    },
    defaultVariants: { size: 'md', ring: false },
});
/**
 * App icon — a marketplace app's own icon on its white plate, or, when it has
 * none (or the image fails), its initials on a flat colour picked from the APP id.
 *
 * The one rule for every surface that lists apps (cards, tables, headers, modals,
 * the dashboard strip). The fallback comes from `appIconFallback` in
 * `@vim-connect/runtime-types/app-icon` (its `solid` colour: the same hue the
 * extension Hub's gradient uses), so one app is one colour everywhere — as long as every caller seeds it
 * with the APP id, never an installation or version id.
 *
 * The image sits on a fixed white plate (`--app-icon-plate`) in both themes:
 * most app icons are flat art drawn on a transparent canvas for a light
 * backdrop, and the DS rule is to show them as-is — never inverted or recoloured.
 *
 * Six sizes, each with its own radius so the shape stays an app tile, not a
 * circle, when small. `ring` adds a 2px ring in the card colour, for icons that
 * overlap in a stack.
 *
 * Decorative by default (`aria-hidden`), since the app's name almost always sits
 * beside it. Pass `label` when it stands alone and should be announced.
 *
 * Classes mean the same in Tailwind v3 and v4: arbitrary values on DS tokens only
 * and no `!` important marker.
 */
export function AppIcon({ name, appId, src, size = 'md', ring = false, label, loading = 'lazy', className, style, ...rest }) {
    // Remember WHICH src failed, so a new src gets its own try.
    const [failedSrc, setFailedSrc] = useState(null);
    const showImage = isRenderableIconUrl(src) && failedSrc !== src;
    const a11y = label
        ? { role: 'img', 'aria-label': label }
        : { 'aria-hidden': true };
    if (showImage) {
        return (_jsx("span", { "data-ui": "app-icon", className: cn(appIconVariants({ size, ring }), '[background:var(--app-icon-plate,#ffffff)]', 
            // Hairline edge so a white icon still reads as a tile on a white card.
            "after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:content-[''] after:[box-shadow:inset_0_0_0_1px_var(--color-border-medium)]", className), style: style, ...a11y, ...rest, children: _jsx("img", { src: src, alt: "", className: "block size-full object-cover", referrerPolicy: "no-referrer", loading: loading, onError: () => setFailedSrc(src) }) }));
    }
    const { initials, solid } = appIconFallback(appId, name);
    return (_jsx("span", { "data-ui": "app-icon", "data-fallback": "", className: cn(appIconVariants({ size, ring }), className), style: { background: solid, ...style }, ...a11y, ...rest, children: size === 'xs' ? initials.slice(0, 1) : initials }));
}
export { appIconVariants };
