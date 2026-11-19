import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
import { cn } from './cn.js';
/**
 * Three sizes on one rule: a 2px border, the thumb fills the inner height and
 * slides exactly its own width (inner width = 2 × thumb). md is the DS switch.
 */
const SIZES = {
    sm: { track: 'h-[1.125rem] w-[2rem]', thumb: 'size-[0.875rem]', on: '[transform:translateX(0.875rem)]' },
    md: { track: 'h-[1.5rem] w-[2.75rem]', thumb: 'size-[1.25rem]', on: '[transform:translateX(1.25rem)]' },
    lg: { track: 'h-[1.75rem] w-[3.25rem]', thumb: 'size-[1.5rem]', on: '[transform:translateX(1.5rem)]' },
};
const TRACK = [
    'relative inline-flex shrink-0 p-0 m-0 cursor-pointer rounded-[var(--radius-full)]',
    'border-2 border-solid [transition:background-color_200ms_ease-in-out]',
    'focus-visible:outline-none focus-visible:[box-shadow:0_0_0_2px_var(--color-bg-primary),0_0_0_4px_color-mix(in_srgb,var(--color-blue)_50%,transparent)]',
    'disabled:opacity-50 disabled:cursor-not-allowed',
].join(' ');
const OFF = '[background-color:color-mix(in_srgb,var(--color-text-primary)_20%,transparent)] [border-color:var(--color-border-strong)]';
const ON = '[background-color:var(--color-blue)] [border-color:transparent]';
const SIDES_OFF = '[background-color:var(--color-blue)] [border-color:transparent]';
const SIDES_ON = '[background-color:var(--color-warning)] [border-color:transparent]';
const THUMB = [
    'pointer-events-none inline-block rounded-[var(--radius-full)]',
    '[background-color:var(--color-text-on-gradient)] [box-shadow:0_1px_2px_0_rgb(0_0_0/0.1),0_1px_3px_0_rgb(0_0_0/0.1)]',
    '[transition:transform_200ms_ease-in-out]',
].join(' ');
export const Toggle = React.forwardRef(function Toggle({ checked, onChange, label, disabled, variant = 'default', size = 'md', id, className, 'aria-labelledby': labelledBy }, ref) {
    const track = variant === 'sides' ? (checked ? SIDES_ON : SIDES_OFF) : checked ? ON : OFF;
    return (_jsx("button", { ref: ref, id: id, "data-ui": "toggle", type: "button", role: "switch", "aria-checked": checked, "aria-label": label, "aria-labelledby": labelledBy, disabled: disabled, "data-state": checked ? 'on' : 'off', onClick: () => !disabled && onChange(!checked), "data-size": size, className: cn(TRACK, SIZES[size].track, track, className), children: _jsx("span", { className: cn(THUMB, SIZES[size].thumb, checked ? SIZES[size].on : '[transform:translateX(0)]') }) }));
});
