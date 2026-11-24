import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { cn } from './cn.js';
const PAGE_TITLE_CLASSES = 'm-0 min-w-0 [font-family:var(--font-title)] [font-weight:var(--font-bold)] [color:var(--color-text-primary)] [text-wrap:balance]';
const PAGE_SUBTITLE_CLASSES = 'm-0 mt-[var(--space-xs)] max-w-[70ch] [color:var(--color-text-secondary)] [text-wrap:pretty]';
const SIZE = {
    default: {
        root: 'mb-[var(--space-2xl)]',
        title: 'text-[length:var(--text-4xl)] leading-[1.2] tracking-[-0.02em]',
        subtitle: 'text-[length:var(--text-xl)] leading-[1.5]',
        row: 'gap-x-[var(--space-2xl)]',
        titleCol: 'flex-[1_1_320px]',
        actions: 'min-h-[calc(var(--text-4xl)*1.2)]',
    },
    compact: {
        root: 'mb-[var(--space-lg)]',
        title: 'text-[length:var(--text-2xl)] leading-[1.3] [overflow-wrap:anywhere]',
        subtitle: 'text-[length:var(--text-sm)] leading-[1.5]',
        row: 'gap-x-[var(--space-md)]',
        titleCol: 'flex-[1_1_0%]',
        actions: 'min-h-[calc(var(--text-2xl)*1.3)]',
    },
};
export const PageHeader = React.forwardRef(function PageHeader({ title, subtitle, actions, titleAddon, breadcrumbs, titleClassName, titleProps, renderTitle, subtitleProps, size = 'default', headingLevel = 1, className, ...rest }, ref) {
    const s = SIZE[size];
    const Heading = headingLevel === 2 ? 'h2' : 'h1';
    const heading = (_jsx(Heading, { ...titleProps, className: cn(PAGE_TITLE_CLASSES, s.title, titleClassName), children: title }));
    return (_jsxs("header", { ref: ref, "data-ui": "page-header", "data-size": size, className: cn(s.root, 'min-w-0', className), ...rest, children: [breadcrumbs && _jsx("div", { className: "mb-[var(--space-lg)] [&>*]:mb-0", children: breadcrumbs }), _jsxs("div", { className: cn('flex flex-wrap items-start justify-between gap-y-[var(--space-md)]', s.row), children: [_jsxs("div", { className: cn('min-w-0', s.titleCol), children: [_jsxs("div", { className: "flex flex-wrap items-center gap-x-[var(--space-md)] gap-y-[var(--space-sm)]", children: [renderTitle ? renderTitle(heading) : heading, titleAddon] }), subtitle && (_jsx("p", { ...subtitleProps, className: cn(PAGE_SUBTITLE_CLASSES, s.subtitle), children: subtitle }))] }), actions && (
                    // As tall as one title line, so the buttons sit centred on the title,
                    // not on the title + subtitle block.
                    _jsx("div", { "data-ui": "page-header-actions", className: cn('flex shrink-0 flex-wrap items-center gap-[var(--space-sm)]', s.actions), children: actions }))] })] }));
});
