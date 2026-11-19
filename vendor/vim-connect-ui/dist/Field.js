import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { cn } from './cn.js';
import { CharacterCount, characterCountShows } from './CharacterCount.js';
import { Label } from './Label.js';
import { isLabellable } from './labellable.js';
const NOTE = 'mt-[6px] mb-0 [font-family:var(--font-sans)] text-[length:var(--text-xs)] leading-[1.5]';
export function Field({ label, children, help, error, optional, id, maxLength, countFrom, className }) {
    const generated = React.useId();
    const child = children;
    const controlId = id ?? child.props.id ?? `ui-field-${generated}`;
    const helpId = `${controlId}-help`;
    const errorId = `${controlId}-error`;
    const countId = `${controlId}-count`;
    const countValue = typeof child.props.value === 'string' ? child.props.value : '';
    const showCount = maxLength != null && characterCountShows(countValue, maxLength, countFrom);
    const showHelp = help != null && error == null;
    const describedBy = [child.props['aria-describedby'], showCount ? countId : null, showHelp ? helpId : null, error != null ? errorId : null]
        .filter(Boolean)
        .join(' ') || undefined;
    // Only a label-able child (`markLabellable`, or a native control) takes the
    // label's id; anything else keeps the label as text, as FormRow does.
    const wire = isLabellable(child.type);
    const control = wire
        ? React.cloneElement(child, {
            id: controlId,
            'aria-describedby': describedBy,
            ...(error != null ? { invalid: true, 'aria-invalid': true } : {}),
        })
        : child;
    return (_jsxs("div", { className: cn('flex flex-col min-w-0', className), "data-ui": "field", children: [_jsx(Label, { htmlFor: wire ? controlId : undefined, optional: optional, children: label }), control, maxLength != null && showCount && _jsx(CharacterCount, { value: countValue, max: maxLength, showFrom: 0, id: countId }), showHelp && (_jsx("p", { id: helpId, className: cn(NOTE, '[color:var(--color-text-muted)]'), children: help })), error != null && (_jsx("p", { id: errorId, className: cn(NOTE, '[color:var(--color-error-text)]'), children: error }))] }));
}
