import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from './cn.js';
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
 * icon keeps the size the caller gives it.
 */
export const IconTile = React.forwardRef(function IconTile({ size = 'sm', tint, muted = false, className, style, children, ...rest }, ref) {
    const tone = muted ? 'muted' : tint ? 'tint' : 'cyan';
    return (_jsx("span", { ref: ref, ...rest, "data-ui": "icon-tile", "data-size": size, "data-tone": tone, className: cn(iconTileVariants({ size, tone }), className), style: tint && !muted ? { '--tile-color': tint, ...style } : style, children: children }));
});
