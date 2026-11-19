import React from 'react';
import { type ButtonProps } from './Button.js';
export interface IconButtonProps extends Omit<ButtonProps, 'iconOnly' | 'children' | 'aria-label'> {
    /** The tooltip, and the accessible name unless `ariaLabel` is given. Short: "Remove". */
    label: string;
    /** A fuller accessible name when the tooltip is short: "Remove dana@acme.org". */
    ariaLabel?: string;
    /** The 16px glyph (14px at `sm`). */
    icon: React.ReactNode;
    /** While disabled, the tooltip says why instead ("Only admins can remove members"). */
    disabledReason?: string;
}
/**
 * Icon Button (DS → Icon Button): an icon-only `Button` that always has its tooltip and its
 * accessible name, from one `label`. Ghost by default; `ghost-danger` for a destructive row
 * action. A disabled one keeps its tooltip (on a wrapper, since a disabled button gets no
 * pointer events), saying `disabledReason` when there is one.
 *
 * Hooks: it keeps Button's `data-ui="button"` (and `data-icon-only`) and adds `data-icon-button`.
 */
export declare const IconButton: React.ForwardRefExoticComponent<IconButtonProps & React.RefAttributes<HTMLButtonElement>>;
