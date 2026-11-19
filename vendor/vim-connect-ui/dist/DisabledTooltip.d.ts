import type { ReactElement } from 'react';
export interface DisabledTooltipProps {
    label: string;
    children: ReactElement;
    /** Let a long label run onto several lines (Tooltip's `wrap`). */
    wrap?: boolean;
}
/** Tooltip on a disabled control.
 *
 * Disabled native buttons don't reliably fire mouse/focus events across
 * browsers, so Tooltip (which clones its child to attach handlers) needs a
 * wrapping element it CAN attach to. */
export declare function DisabledTooltip({ label, children, wrap }: DisabledTooltipProps): import("react/jsx-runtime").JSX.Element;
