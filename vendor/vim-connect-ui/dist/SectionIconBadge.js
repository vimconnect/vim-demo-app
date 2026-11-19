import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from './cn.js';
const badgeVariants = cva('inline-flex items-center justify-center shrink-0 border border-solid [background:color-mix(in_srgb,var(--color-cyan)_15%,transparent)] [border-color:var(--color-cyan-30)] [color:var(--color-cyan)]', {
    variants: {
        size: {
            section: 'size-[20px] rounded-[6px] [&_svg]:size-[12px]',
            card: 'size-[28px] rounded-[var(--radius-md)] [&_svg]:size-[16px]',
        },
    },
});
function isComponent(icon) {
    return typeof icon === 'function' || (typeof icon === 'object' && icon !== null && !Array.isArray(icon) && !React.isValidElement(icon));
}
/**
 * The icon in front of a heading's text. Decorative: the heading says what the
 * section is. An icon that stands on its own (a stat, an empty state) is an `IconTile`.
 */
export function SectionIconBadge({ icon, size = 'section', className }) {
    const Icon = isComponent(icon) ? icon : null;
    return (_jsx("span", { "aria-hidden": "true", "data-ui": "section-icon-badge", "data-size": size, className: cn(badgeVariants({ size }), className), children: Icon ? _jsx(Icon, { "aria-hidden": "true" }) : icon }));
}
