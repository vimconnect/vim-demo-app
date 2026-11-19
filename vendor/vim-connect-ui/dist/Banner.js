import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cva } from 'class-variance-authority';
import { Button } from './Button.js';
import { Tooltip } from './Tooltip.js';
import { CloseGlyph } from './CloseGlyph.js';
import { cn } from './cn.js';
const bannerVariants = cva([
    'flex w-full shrink-0 items-center gap-[var(--space-md)] px-[var(--space-xl)] py-[var(--space-sm)] box-border',
    '[font-family:var(--font-sans)] text-[length:var(--text-sm)] leading-[1.5] [color:var(--color-text-primary)]',
    '[background:var(--banner-bg)] border-0 border-b border-solid [border-color:var(--banner-line)]',
    '[&_strong]:[font-weight:var(--font-semibold)]',
].join(' '), {
    variants: {
        tone: {
            info: '[--banner-bg:var(--color-cyan-15)] [--banner-line:var(--color-cyan-30)] [--banner-icon:var(--color-cyan-text)]',
            purple: '[--banner-bg:var(--color-purple-15)] [--banner-line:var(--color-purple-30)] [--banner-icon:var(--color-purple-text)]',
            warning: '[--banner-bg:var(--color-warning-15)] [--banner-line:var(--color-warning-30)] [--banner-icon:var(--color-warning-text)]',
            error: '[--banner-bg:var(--color-error-15)] [--banner-line:var(--color-error-30)] [--banner-icon:var(--color-error-text)]',
        },
    },
    defaultVariants: { tone: 'info' },
});
const INFO_MARK = _jsx("path", { d: "M12 8h.01M11 12h1v4h1", stroke: "currentColor", strokeWidth: "1.6", strokeLinecap: "round" });
const ALERT_MARK = _jsx("path", { d: "M12 8v5M12 16h.01", stroke: "currentColor", strokeWidth: "1.6", strokeLinecap: "round" });
const ICON_PATHS = {
    info: INFO_MARK,
    purple: INFO_MARK,
    warning: ALERT_MARK,
    error: ALERT_MARK,
};
/**
 * Banner (DS → Banner): a full-width strip across the top of the app frame that says what state the
 * product is in (news, a preview, mock data, a problem), as opposed to a `Notice`, which sits inside
 * the page. Goes in `AppShell`'s `banner` slot. Pair `role="status"` with news, `role="alert"` with a
 * problem.
 *
 * Hooks: `data-ui="banner"` (+ `data-tone`).
 */
export function Banner({ tone = 'info', icon, title, action, onDismiss, dismissLabel = 'Dismiss', className, children, ...rest }) {
    return (_jsxs("div", { ...rest, "data-ui": "banner", "data-tone": tone, className: cn(bannerVariants({ tone }), className), children: [icon !== null && (_jsx("span", { "aria-hidden": "true", className: "inline-flex shrink-0 [color:var(--banner-icon)] [&_svg]:h-[16px] [&_svg]:w-[16px]", children: icon ?? (_jsxs("svg", { viewBox: "0 0 24 24", fill: "none", width: "16", height: "16", children: [_jsx("circle", { cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "1.6" }), ICON_PATHS[tone]] })) })), _jsxs("p", { className: "m-0 min-w-0 flex-1", children: [title != null && _jsxs("strong", { children: [title, " "] }), children] }), action != null && _jsx("div", { className: "flex shrink-0 items-center gap-[var(--space-sm)]", children: action }), onDismiss && (_jsx(Tooltip, { label: dismissLabel, children: _jsx(Button, { variant: "ghost", size: "sm", iconOnly: true, "aria-label": dismissLabel, onClick: onDismiss, className: "-my-[4px] -mr-[6px] shrink-0 [color:var(--color-text-secondary)]", children: _jsx(CloseGlyph, {}) }) }))] }));
}
