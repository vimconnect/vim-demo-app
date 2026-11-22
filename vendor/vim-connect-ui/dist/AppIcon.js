'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { useState } from 'react';
import { appIconFallback, isRenderableIconUrl } from '@vim-connect/runtime-types/app-icon';
import { cn } from './cn.js';
import { appIconVariants } from './appIconShared.js';
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
