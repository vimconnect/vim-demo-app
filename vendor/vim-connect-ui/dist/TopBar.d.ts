import React from 'react';
export interface TopBarProps extends React.HTMLAttributes<HTMLElement> {
    /** Right-aligned controls: the account menu, a few icon buttons. */
    actions?: React.ReactNode;
}
/**
 * Top bar (DS → App shell): the bar above the content column. `--color-bg-primary` with a
 * `--color-border-light` hairline below, `--space-xl` side padding, children from the left (search,
 * a title) and `actions` at the right. It fills its slot's height (`AppShell` gives it 64px) and is a
 * size container named `topbar`, so what's in it can drop detail as the bar narrows.
 *
 * Hooks: `data-ui="top-bar"`, `top-bar-actions`.
 */
export declare function TopBar({ actions, className, children, ...rest }: TopBarProps): import("react/jsx-runtime").JSX.Element;
