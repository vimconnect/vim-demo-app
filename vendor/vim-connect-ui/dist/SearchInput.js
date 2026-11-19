import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useRef } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from './cn.js';
import { Kbd } from './Kbd.js';
import { Tooltip } from './Tooltip.js';
import { markLabellable } from './labellable.js';
export const SearchInput = React.forwardRef(function SearchInput({ value, onChange, shortcut, keyshortcuts, width = 210, onClear, clearLabel = 'Clear search', className, placeholder, disabled, onKeyDown, invalid = false, 'aria-invalid': ariaInvalid, 'aria-label': ariaLabel, ...rest }, forwardedRef) {
    const innerRef = useRef(null);
    const setRef = (el) => {
        innerRef.current = el;
        if (typeof forwardedRef === 'function')
            forwardedRef(el);
        else if (forwardedRef)
            forwardedRef.current = el;
    };
    const isInvalid = invalid || ariaInvalid === true || ariaInvalid === 'true';
    const clear = () => {
        onChange('');
        onClear?.();
        innerRef.current?.focus();
    };
    return (_jsxs("label", { "data-ui": "search-input", className: cn('inline-flex h-[32px] max-w-full items-center gap-[var(--space-sm)] px-[var(--space-md)] [box-sizing:border-box] cursor-text', 'rounded-[var(--radius-full)] border border-solid [border-color:var(--color-border-field)] [background:var(--color-bg-field)]', '[color:var(--color-text-muted)] [font-family:var(--font-sans)]', '[transition:border-color_var(--transition-base),box-shadow_var(--transition-base)]', 'focus-within:[border-color:var(--color-cyan-40)] focus-within:[box-shadow:var(--shadow-focus)]', 'has-[input:disabled]:cursor-not-allowed has-[input:disabled]:opacity-[0.55]', isInvalid &&
            '[border-color:var(--color-error)] focus-within:[border-color:var(--color-error)] focus-within:[box-shadow:0_0_0_3px_color-mix(in_srgb,var(--color-error)_25%,transparent)]', className), style: { width: typeof width === 'number' ? `${width}px` : width }, children: [_jsx(Search, { "aria-hidden": "true", className: "size-[14px] shrink-0" }), _jsx("input", { "data-ui": "search-input-input", ...rest, ref: setRef, type: "search", value: value, onChange: (e) => onChange(e.target.value), onKeyDown: (e) => {
                    onKeyDown?.(e);
                    if (e.defaultPrevented)
                        return;
                    if (e.key === 'Escape' && value !== '') {
                        e.preventDefault();
                        e.stopPropagation();
                        onChange('');
                        onClear?.();
                    }
                }, placeholder: placeholder, disabled: disabled, "aria-label": ariaLabel ?? (rest['aria-labelledby'] || rest.id ? undefined : placeholder), "aria-keyshortcuts": keyshortcuts, "aria-invalid": isInvalid || undefined, spellCheck: false, autoComplete: "off", className: cn('m-0 h-full min-w-0 flex-1 border-0 bg-transparent p-0 outline-none shadow-none appearance-none', 'text-[length:var(--text-base)] [color:var(--color-text-primary)] [font-family:var(--font-sans)]', 'placeholder:[color:var(--color-text-muted)] placeholder:opacity-100', 
                // The browser's own clear (×) and decorations: this field draws its own.
                '[&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none') }), value !== '' && !disabled && (_jsx(Tooltip, { label: clearLabel, children: _jsx("button", { "data-ui": "search-input-button", type: "button", "aria-label": clearLabel, onClick: clear, className: cn('inline-flex size-[18px] shrink-0 items-center justify-center rounded-full border-0 p-0 cursor-pointer', 'bg-transparent [color:var(--color-text-muted)] hover:[color:var(--color-text-primary)] hover:[background:var(--color-cyan-10)]', 'focus-visible:outline-none focus-visible:[box-shadow:var(--shadow-focus)]'), children: _jsx(X, { "aria-hidden": "true", className: "size-[12px]" }) }) })), shortcut && value === '' && (_jsx(Kbd, { "aria-hidden": "true", className: "shrink-0", children: shortcut }))] }));
});
// Keep: lets Field / FormRow tie their label to this control (it forwards id and aria-describedby).
markLabellable(SearchInput);
