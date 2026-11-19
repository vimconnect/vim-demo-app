import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Lock } from 'lucide-react';
import { cva } from 'class-variance-authority';
import { Badge } from './Badge.js';
import { cn } from './cn.js';
import { Tooltip } from './Tooltip.js';
const REASON = {
    installed: 'it appears here only because it is installed on your account.',
    'vim-account': 'it appears here only because you are on the Vim account.',
    distributable: 'it appears here only because your account can pre-install it.',
};
export const privateAppTooltip = (reason) => `Private app. Other accounts cannot request it — ${REASON[reason]}`;
const bannerVariants = cva([
    'private-app-pill private-app-pill--banner',
    'inline-flex items-center gap-[3px] flex-shrink-0 whitespace-nowrap cursor-default',
    'rounded-[var(--radius-full)] [font-family:var(--font-sans)] [font-weight:var(--font-semibold)]',
    'absolute top-[var(--space-sm)] right-[var(--space-sm)] z-[1]',
    'px-[var(--space-sm)] py-[2px] text-[length:var(--text-xs)] leading-[1.4]',
    // Theme-invariant: sits on developer-supplied media, not the page ground.
    '[background:rgba(255,255,255,0.94)] [color:#92400e]',
    'border-[0.8px] border-solid [border-color:color-mix(in_srgb,currentColor_28%,transparent)]',
    '[backdrop-filter:blur(8px)_saturate(1.1)] [-webkit-backdrop-filter:blur(8px)_saturate(1.1)]',
    '[box-shadow:0_0_0_1px_rgba(255,255,255,0.55),0_1px_3px_rgba(3,8,18,0.28)]',
    '[&_svg]:pointer-events-none [&_svg]:shrink-0',
].join(' '));
const privateAppPillSize = cva('private-app-pill', {
    variants: {
        size: {
            sm: 'private-app-pill--sm gap-[3px] px-[7px] py-[1px] text-[length:var(--text-2xs)] leading-[1.4] tracking-[0.02em] [&_svg]:w-[9px] [&_svg]:h-[9px]',
            card: 'private-app-pill--card px-[var(--space-sm)] py-[2px] text-[length:var(--text-xs)] leading-[1.4] [&_svg]:w-[10px] [&_svg]:h-[10px]',
        },
    },
    defaultVariants: { size: 'sm' },
});
/**
 * Marks an app its developer made private — Domain Pills (vim-ai Design System).
 * Amber so it survives a glance across a grid of otherwise identical cards.
 * `sm`/`card` paint through Badge `warning`; `banner` is pinned over card artwork
 * and stays theme-invariant (literal colours) because it sits on developer media.
 * Legacy `private-app-pill*` classes stay so Console selectors (e.g. AppCard banner
 * z-index) keep matching.
 */
export const PrivateAppPill = ({ reason, size = 'sm', className, }) => {
    const icon = _jsx(Lock, { "aria-hidden": "true" });
    const common = {
        'data-testid': 'private-app-pill',
        'data-ui': 'private-app-pill',
        'data-size': size,
    };
    const pill = size === 'banner' ? (_jsxs("span", { className: cn(bannerVariants(), className), ...common, children: [icon, "Private"] })) : (_jsxs(Badge, { variant: "warning", ...common, className: cn('cursor-default [border-width:0.8px]', '[--badge-bg:var(--color-warning-pill-bg,color-mix(in_srgb,var(--color-warning)_14%,transparent))]', '[--badge-fg:var(--color-warning-pill-fg,var(--color-warning-text-strong))]', '[border-color:var(--color-warning-pill-border,var(--color-warning-30))]', privateAppPillSize({ size }), className), children: [icon, "Private"] }));
    return (_jsx(Tooltip, { wrap: true, label: privateAppTooltip(reason), children: pill }));
};
PrivateAppPill.displayName = 'PrivateAppPill';
