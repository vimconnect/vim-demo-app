import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cva } from 'class-variance-authority';
import { Badge } from './Badge.js';
import { cn } from './cn.js';
import { VIM_HEART_PATH } from './vimHeart.js';
const cyanPillVariants = cva([
    'vim-app-pill inline-flex items-center gap-[4px] flex-shrink-0 whitespace-nowrap',
    'rounded-[20px] [font-family:var(--font-sans)] [font-weight:var(--font-medium)] leading-[1.4]',
    '[background:var(--vim-app-pill-bg,rgba(108,205,239,0.14))]',
    '[color:var(--vim-app-pill-fg,var(--color-blue))]',
    'border border-solid [border-color:var(--vim-app-pill-border,rgba(108,205,239,0.28))]',
    '[&_svg]:pointer-events-none [&_svg]:shrink-0',
].join(' '), {
    variants: {
        size: {
            md: 'vim-app-pill--md px-[10px] py-[2px] text-[length:12px] [&_svg]:w-[10px] [&_svg]:h-[10px]',
            sm: 'vim-app-pill--sm px-[8px] py-[2px] text-[length:var(--text-2xs)] tracking-[0.02em] [&_svg]:w-[9px] [&_svg]:h-[9px]',
        },
    },
    defaultVariants: { size: 'md' },
});
function Heart({ size }) {
    return (_jsx("svg", { width: size, height: size, viewBox: "0 0 850 850", fill: "currentColor", "aria-hidden": "true", children: _jsx("path", { d: VIM_HEART_PATH }) }));
}
/**
 * The "Vim App" pill — Domain Pills (vim-ai Design System). Sole place the
 * product asserts "Vim published this." `sm`/`md` read `--vim-app-pill-bg` /
 * `-border` / `-fg` with cyan fallbacks (set on an ancestor for brand heroes);
 * `card` is Badge `neutral` so it reads as one row with a category chip.
 * Legacy `vim-app-pill*` classes stay so Console hero selectors keep matching.
 */
export function VimAppPill({ size = 'md', className }) {
    if (size === 'card') {
        return (_jsxs(Badge, { variant: "neutral", "data-testid": "vim-app-pill", "data-ui": "vim-app-pill", "data-size": "card", className: cn('vim-app-pill vim-app-pill--card', 'gap-[4px] px-[var(--space-sm)] py-[2px] [border-width:0.8px] [border-color:var(--color-border-light)]', '[background:var(--color-bg-elevated)] [color:var(--color-text-muted)]', '[&_svg]:w-[9px] [&_svg]:h-[9px]', className), children: [_jsx(Heart, { size: 9 }), "Vim App"] }));
    }
    return (_jsxs("span", { className: cn(cyanPillVariants({ size }), className), "data-testid": "vim-app-pill", "data-ui": "vim-app-pill", "data-size": size, children: [_jsx(Heart, { size: size === 'md' ? 10 : 9 }), "Vim App"] }));
}
VimAppPill.displayName = 'VimAppPill';
