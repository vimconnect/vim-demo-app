import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React from 'react';
import { Avatar } from './Avatar.js';
import { Divider } from './Divider.js';
import { Popover } from './Popover.js';
import { ThemeSwitcher } from './ThemeSwitcher.js';
import { cn } from './cn.js';
const CHIP = [
    'group flex min-w-0 items-center gap-[var(--space-sm)] py-[6px] pl-[6px] pr-[10px]',
    'rounded-[var(--radius-full)] border-0 bg-transparent cursor-pointer [font-family:var(--font-sans)]',
    'transition-[background] duration-[var(--transition-base)] hover:[background:var(--color-bg-subtle)]',
    'focus-visible:outline-none focus-visible:[box-shadow:var(--shadow-focus)]',
].join(' ');
const CHIP_NAME = [
    'm-0 shrink-0 max-w-[180px] overflow-hidden text-ellipsis whitespace-nowrap',
    'text-[length:var(--text-lg)] [font-weight:var(--font-semibold)] [color:var(--color-text-primary)]',
].join(' ');
const CHIP_DETAIL = [
    'm-0 min-w-[48px] max-w-[140px] flex-[0_1_auto] overflow-hidden text-ellipsis whitespace-nowrap',
    'text-[length:var(--text-sm)] [color:var(--color-text-muted)]',
].join(' ');
const CHEVRON = [
    'size-[14px] shrink-0 opacity-60 transition-transform duration-200 motion-reduce:transition-none',
    'group-aria-expanded:rotate-180',
].join(' ');
const HEADER = [
    'flex items-center gap-[var(--space-md)] p-[var(--space-lg)]',
    'border-0 border-b border-solid [border-color:var(--color-border-light)] [background:var(--gradient-subtle)]',
].join(' ');
const SECTION = 'p-[var(--space-sm)] border-0 border-solid [border-color:var(--color-border-light)] [&+&]:border-t';
const ITEM = [
    'flex w-full items-center gap-[var(--space-md)] min-h-[36px] px-[var(--space-md)] py-[var(--space-sm)] rounded-[var(--radius-md)]',
    'border-0 bg-transparent text-left no-underline cursor-pointer [font-family:var(--font-sans)]',
    'text-[length:var(--text-base)] [font-weight:var(--font-medium)]',
    // A focused row shows the hover tint, not a ring.
    'outline-none',
    '[&_svg]:size-[16px] [&_svg]:shrink-0',
].join(' ');
const ITEM_TONE = {
    normal: '[color:var(--color-text-primary)] [&_svg]:[color:var(--color-text-muted)] hover:[background:var(--color-cyan-10)] focus:[background:var(--color-cyan-10)] [&:hover_svg]:[color:var(--color-cyan-text)] [&:focus_svg]:[color:var(--color-cyan-text)]',
    danger: '[color:var(--color-error-text)] [&_svg]:[color:var(--color-error-text)] hover:[background:color-mix(in_srgb,var(--color-error)_10%,transparent)] focus:[background:color-mix(in_srgb,var(--color-error)_10%,transparent)]',
};
const ChevronDown = () => (_jsx("svg", { className: CHEVRON, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: _jsx("path", { d: "m6 9 6 6 6-6" }) }));
/**
 * Account Menu (DS → Account Menu): the signed-in person's chip and the panel it opens. The chip
 * is the avatar, the name and an optional muted detail; the panel is a flush `Popover` (a
 * `dialog`, since the theme switch isn't a menu item: Tab walks every control) with a header
 * (avatar, name, full email) and the caller's `AccountMenuSection`s, divided by hairlines.
 *
 * Hooks: `data-ui="account-menu"` on the chip, `account-menu-info` on its text and
 * `account-menu-detail` on the hairline + detail, so a product can drop them at narrow widths.
 */
export function AccountMenu({ name, email, chipName = name, chipDetail, tooltip, label = 'User menu', side = 'below', align = 'end', width = 280, children, className, }) {
    const title = tooltip ?? [name, email].filter(Boolean).join(' · ');
    return (_jsx(Popover, { label: label, flush: true, side: side, align: align, width: width, content: (close) => (_jsxs("div", { "data-ui": "account-menu-panel", children: [_jsxs("div", { className: HEADER, children: [_jsx(Avatar, { name: name, email: email, size: "lg" }), _jsxs("div", { className: "min-w-0 flex-1", children: [_jsx("div", { className: "overflow-hidden text-ellipsis whitespace-nowrap text-[length:var(--text-lg)] [font-weight:var(--font-semibold)] leading-[1.2] [color:var(--color-text-primary)]", children: name }), email && (
                                // The only place the full address is shown: wrap, never clip.
                                _jsx("div", { className: "mt-[2px] text-[length:var(--text-sm)] leading-[1.3] [overflow-wrap:anywhere] [color:var(--color-text-muted)]", children: email }))] })] }), typeof children === 'function' ? children(close) : children] })), children: _jsxs("button", { type: "button", "data-ui": "account-menu", "aria-label": `${label} — ${title}`, title: title, className: cn(CHIP, className), children: [_jsx(Avatar, { name: name, email: email }), _jsxs("span", { "data-ui": "account-menu-info", className: "flex min-w-0 flex-1 items-center gap-[var(--space-sm)]", children: [_jsx("span", { className: CHIP_NAME, children: chipName }), chipDetail && (_jsxs("span", { "data-ui": "account-menu-detail", className: "flex min-w-0 items-center gap-[var(--space-sm)]", children: [_jsx(Divider, { orientation: "vertical", strength: "medium" }), _jsx("span", { className: CHIP_DETAIL, children: chipDetail })] }))] }), _jsx(ChevronDown, {})] }) }));
}
/** One group of rows in the Account Menu panel; a hairline separates it from the one before. */
export function AccountMenuSection({ className, ...rest }) {
    return _jsx("div", { ...rest, "data-ui": "account-menu-section", className: cn(SECTION, className) });
}
/**
 * A row in the Account Menu panel: a button, a plain link (`href`), or the caller's own link
 * element (`render`, e.g. a router `Link`), with an optional icon. `danger` for Sign out.
 */
export function AccountMenuItem(props) {
    const { icon, danger = false, children, className } = props;
    const cls = cn(ITEM, ITEM_TONE[danger ? 'danger' : 'normal'], className);
    const content = (_jsxs(_Fragment, { children: [icon, _jsx("span", { className: "min-w-0 flex-1", children: children })] }));
    if ('render' in props && props.render) {
        return React.cloneElement(props.render, {
            className: cn(cls, props.render.props.className),
            children: content,
            'data-ui': 'account-menu-item',
        });
    }
    if ('href' in props && props.href !== undefined) {
        const { icon: _i, danger: _d, children: _c, className: _cn, ...anchor } = props;
        return (_jsx("a", { ...anchor, "data-ui": "account-menu-item", className: cls, children: content }));
    }
    const { icon: _i, danger: _d, children: _c, className: _cn, render: _r, href: _h, ...button } = props;
    return (_jsx("button", { type: "button", ...button, "data-ui": "account-menu-item", className: cls, children: content }));
}
/** The Appearance row: a sun or moon, the label and the DS `ThemeSwitcher`. */
export function AccountMenuTheme({ value, onChange, systemTheme, theme, label = 'Appearance' }) {
    return (_jsxs("div", { "data-ui": "account-menu-theme", className: "flex items-center gap-[var(--space-md)] min-h-[36px] px-[var(--space-md)] py-[var(--space-xs)] text-[length:var(--text-base)] [font-weight:var(--font-medium)] [color:var(--color-text-primary)]", children: [_jsxs("span", { className: "flex flex-1 items-center gap-[var(--space-md)] [&_svg]:size-[16px] [&_svg]:shrink-0 [&_svg]:[color:var(--color-text-muted)]", children: [theme === 'dark' ? (_jsx("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: _jsx("path", { d: "M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" }) })) : (_jsxs("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: [_jsx("circle", { cx: "12", cy: "12", r: "4" }), _jsx("path", { d: "M12 2v2M12 20v2m-7.07-14.93 1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" })] })), label] }), _jsx(ThemeSwitcher, { value: value, systemTheme: systemTheme, onChange: onChange })] }));
}
