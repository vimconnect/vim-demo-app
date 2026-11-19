import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { Card } from './Card.js';
import { IconTile } from './IconTile.js';
import { cn } from './cn.js';
const TITLE = 'm-0 mb-[var(--space-xs)] [font-family:var(--font-sans)] text-[length:var(--text-2xl)] [font-weight:var(--font-semibold)] leading-[1.4] [color:var(--color-text-primary)]';
const BODY = 'mx-auto my-0 max-w-[28rem] [font-family:var(--font-sans)] text-[length:var(--text-lg)] leading-[1.5] [color:var(--color-text-muted)]';
export function EmptyTab({ icon: Icon, illustration, title, body, bare, className, 'data-testid': testId }) {
    const content = (_jsxs(_Fragment, { children: [illustration ? (_jsx("div", { className: "mx-auto mb-[var(--space-lg)] inline-block", children: illustration })) : Icon ? (_jsx(IconTile, { size: "md", className: "mx-auto mb-[var(--space-lg)]", "aria-hidden": "true", children: _jsx(Icon, { style: { width: 24, height: 24 } }) })) : null, _jsx("h3", { className: TITLE, children: title }), body != null && body !== '' && _jsx("p", { className: BODY, children: body })] }));
    if (bare) {
        return (_jsx("div", { "data-ui": "empty-tab", "data-testid": testId, className: cn('px-[var(--space-lg)] py-[var(--space-2xl)] text-center', className), children: content }));
    }
    return (_jsx(Card, { "data-ui": "empty-tab", "data-testid": testId, className: cn('py-[calc(var(--space-2xl)*2)] text-center', className), children: content }));
}
