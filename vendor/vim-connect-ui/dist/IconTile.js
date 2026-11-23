import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from './cn.js';
const statusVariants = cva([
    'absolute right-[-2px] bottom-[-2px] flex items-center justify-center rounded-[var(--radius-full)]',
    '[box-shadow:0_0_0_2px_var(--color-bg-card)]',
    '[&_svg]:pointer-events-none [&_svg]:shrink-0',
], {
    variants: {
        size: {
            xs: 'size-[14px] [&_svg]:size-[9px]',
            sm: 'size-[16px] [&_svg]:size-[10px]',
            md: 'size-[20px] [&_svg]:size-[12px]',
            lg: 'size-[24px] [&_svg]:size-[14px]',
        },
        tone: {
            success: '[background:var(--color-success)] [color:var(--color-text-on-gradient)]',
            error: '[background:var(--color-error)] [color:var(--color-text-on-gradient)]',
            warning: '[background:var(--color-warning)] [color:var(--color-text-on-gradient)]',
            // Opaque in both themes (muted grey over the card colour); the glyph is card-coloured.
            neutral: '[background:linear-gradient(var(--color-text-muted),var(--color-text-muted)),var(--color-bg-card)] [color:var(--color-bg-card)]',
        },
    },
});
const iconTileVariants = cva('flex items-center justify-center shrink-0 border border-solid', {
    variants: {
        size: {
            xs: 'size-[24px] rounded-[8px]',
            sm: 'size-[36px] rounded-[10px]',
            md: 'size-[56px] rounded-[16px]',
            lg: 'size-[88px] rounded-[24px]',
        },
        tone: {
            cyan: '[background:color-mix(in_srgb,var(--color-cyan)_15%,transparent)] [border-color:var(--color-cyan-30)] [color:var(--color-cyan)]',
            tint: '[background:color-mix(in_srgb,var(--tile-color)_14%,transparent)] [border-color:color-mix(in_srgb,var(--tile-color)_30%,transparent)] [color:var(--tile-color)]',
            muted: '[background:var(--glass-bg-base)] [border-color:var(--glass-border-base)] [color:var(--color-text-muted)]',
        },
    },
    defaultVariants: { size: 'sm', tone: 'cyan' },
});
/**
 * Icon Tile (DS → Icon Tile): a rounded square holding one Lucide icon, a flat
 * single-hue tint with a matching hairline border. Never a gradient fill. The
 * icon keeps the size the caller gives it. `status` pins a status circle on its corner.
 */
export const IconTile = React.forwardRef(function IconTile({ size = 'sm', tint, muted = false, status, className, style, children, ...rest }, ref) {
    const tone = muted ? 'muted' : tint ? 'tint' : 'cyan';
    return (_jsxs("span", { ref: ref, ...rest, "data-ui": "icon-tile", "data-size": size, "data-tone": tone, "data-status": status?.tone, className: cn(iconTileVariants({ size, tone }), status && 'relative', className), style: tint && !muted ? { '--tile-color': tint, ...style } : style, children: [children, status && (_jsx("span", { "data-ui": "icon-tile-status", className: statusVariants({ size, tone: status.tone }), ...(status.label ? { role: 'img', 'aria-label': status.label } : { 'aria-hidden': true }), children: status.icon }))] }));
});
