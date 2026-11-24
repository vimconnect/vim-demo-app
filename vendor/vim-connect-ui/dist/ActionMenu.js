'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useRef } from 'react';
import { Check, ExternalLink, MoreVertical } from 'lucide-react';
import { Button } from './Button.js';
import { Divider } from './Divider.js';
import { Popover } from './Popover.js';
import { Tooltip } from './Tooltip.js';
import { cn } from './cn.js';
import { assignRef } from './assignRef.js';
import { ACTION_MENU_DIVIDER } from './actionMenuShared.js';
const ITEM = [
    'flex w-full items-center gap-[var(--space-sm)] h-[36px] px-[var(--space-md)] rounded-[var(--radius-md)]',
    'border-0 bg-transparent text-left cursor-pointer [font-family:var(--font-sans)]',
    'text-[length:var(--text-base)] [font-weight:var(--font-medium)]',
    // The focused item is the highlighted one (arrow keys move focus); no ring inside the menu.
    'outline-none',
    '[&_svg]:size-[16px] [&_svg]:shrink-0',
].join(' ');
// The check outranks the item's muted icon colour.
const CHECK = '[&_[data-ui=action-menu-check]]:[color:var(--color-cyan-text)]';
const ITEM_TONE = {
    normal: '[color:var(--color-text-primary)] [&_svg]:[color:var(--color-text-muted)] hover:[background:var(--color-cyan-10)] focus:[background:var(--color-cyan-10)] [&:hover_svg]:[color:var(--color-cyan-text)] [&:focus_svg]:[color:var(--color-cyan-text)]',
    danger: '[color:var(--color-error-text)] [&_svg]:[color:var(--color-error-text)] hover:[background:color-mix(in_srgb,var(--color-error)_10%,transparent)] focus:[background:color-mix(in_srgb,var(--color-error)_10%,transparent)]',
    disabled: '[color:var(--color-text-muted)] cursor-not-allowed opacity-[0.55] focus:[background:var(--color-cyan-05)]',
};
/**
 * Action Menu (DS → Action Menu): a ⋮ (or your own) button that opens a short list
 * of actions on `Popover` with `panelRole="menu"` (its menu keyboard model). Choosing
 * an item closes it and returns focus to the trigger, then runs the item.
 */
export function ActionMenu({ items, label, trigger, size = 'default', align = 'end', width = 200, disabled, }) {
    const triggerRef = useRef(null);
    const content = (close) => (_jsx("div", { className: "p-[var(--space-xs)]", children: items.map((entry, i) => {
            if (entry === ACTION_MENU_DIVIDER) {
                return (_jsx(Divider, { decorative: false, className: "my-[var(--space-xs)] mx-[var(--space-sm)]" }, `divider-${i}`));
            }
            const { label: itemLabel, onSelect, icon: Icon, danger, disabled: itemDisabled, disabledReason, external, checked, testId } = entry;
            const button = (_jsxs("button", { "data-ui": "action-menu-button", type: "button", role: checked === undefined ? 'menuitem' : 'menuitemradio', "aria-checked": checked, tabIndex: -1, "aria-disabled": itemDisabled || undefined, "data-tone": itemDisabled ? 'disabled' : danger ? 'danger' : 'default', "data-testid": testId, className: cn(ITEM, itemDisabled ? ITEM_TONE.disabled : danger ? ITEM_TONE.danger : ITEM_TONE.normal, CHECK), onClick: (e) => {
                    e.stopPropagation();
                    if (itemDisabled)
                        return;
                    close();
                    triggerRef.current?.focus();
                    onSelect();
                }, children: [Icon && _jsx(Icon, { "aria-hidden": "true" }), _jsx("span", { className: "min-w-0 flex-1 truncate", children: itemLabel }), external && _jsx(ExternalLink, { "aria-hidden": "true", className: "ml-auto" }), checked && _jsx(Check, { "aria-hidden": "true", "data-ui": "action-menu-check", className: "ml-auto" })] }));
            return (_jsx(React.Fragment, { children: itemDisabled && disabledReason ? _jsx(Tooltip, { label: disabledReason, children: button }) : button }, `${i}-${itemLabel}`));
        }) }));
    const setTrigger = (el) => {
        triggerRef.current = el;
        assignRef(trigger?.props?.ref, el);
    };
    const ownTrigger = trigger ? (React.cloneElement(trigger, {
        disabled: disabled ?? trigger.props.disabled,
        ref: setTrigger,
    })) : (_jsx(Button, { ref: setTrigger, variant: "ghost", iconOnly: true, size: size, "aria-label": label, disabled: disabled ?? false, children: _jsx(MoreVertical, { "aria-hidden": "true" }) }));
    const menu = (_jsx(Popover, { label: label, panelRole: "menu", flush: true, align: align, width: width, content: content, 
        // Clicks on the trigger shouldn't reach a clickable row or card behind it.
        onClick: (e) => e.stopPropagation(), children: ownTrigger }));
    return trigger ? menu : _jsx(Tooltip, { label: label, children: menu });
}
