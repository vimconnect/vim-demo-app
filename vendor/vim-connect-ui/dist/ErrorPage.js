import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from './cn.js';
import { EmptyStateBlueprint } from './EmptyState.js';
import { CodeBlock } from './CodeBlock.js';
import { BLUEPRINTS } from './emptyStateBlueprints.js';
const KINDS = {
    'not-found': {
        blueprint: 'nothing',
        title: 'Page not found',
        description: 'The page you\u2019re looking for doesn\u2019t exist or has moved.',
    },
    error: { blueprint: 'error', title: BLUEPRINTS.error.title, description: BLUEPRINTS.error.description },
    'access-denied': {
        blueprint: 'access-denied',
        title: BLUEPRINTS['access-denied'].title,
        description: BLUEPRINTS['access-denied'].description,
    },
    offline: {
        blueprint: 'connection-lost',
        title: BLUEPRINTS['connection-lost'].title,
        description: 'We can\u2019t reach the server. Check your connection, then reload.',
    },
};
/**
 * A whole page that couldn't be shown: a missing route, a crash, no access, or
 * no connection. The Empty State look with the page's own heading, a plain
 * sentence on what to do, and the action that gets the user out.
 */
export function ErrorPage({ kind, title, description, actions, details, fullScreen = true, blueprintTransparent = false, className, ...rest }) {
    const k = KINDS[kind];
    // In content, the layout already has the page's <main>; a second one would nest landmarks.
    const Root = fullScreen ? 'main' : 'section';
    return (_jsx(Root, { ...rest, "data-ui": "error-page", "data-kind": kind, className: cn('flex items-center justify-center px-[var(--space-2xl)] py-[48px] [font-family:var(--font-sans)]', fullScreen && 'min-h-screen', className), children: _jsxs("div", { className: "flex flex-col items-center text-center max-w-[480px]", children: [_jsx(EmptyStateBlueprint, { name: k.blueprint, transparent: blueprintTransparent, className: "mb-[24px]" }), _jsx("h1", { className: "m-0 mb-[8px] [font-family:var(--font-title)] text-[length:var(--text-2xl)] [font-weight:var(--font-bold)] [color:var(--color-text-primary)]", children: title ?? k.title }), _jsx("p", { className: "m-0 max-w-[440px] text-[length:var(--text-lg)] leading-[1.55] [color:var(--color-text-muted)]", children: description ?? k.description }), actions && _jsx("div", { className: "mt-[28px] flex flex-wrap justify-center gap-[var(--space-md)]", children: actions }), details && (_jsxs("details", { className: "mt-[var(--space-2xl)] w-full text-left", children: [_jsx("summary", { className: "cursor-pointer text-[length:var(--text-sm)] [color:var(--color-text-muted)] hover:[color:var(--color-text-secondary)]", children: "Error details" }), _jsx(CodeBlock, { code: details, wrap: true, maxHeight: "160px", className: "mt-[var(--space-sm)]" })] }))] }) }));
}
