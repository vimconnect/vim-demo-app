import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { cn } from './cn.js';
import { choiceControlLabelClasses, choiceControlVariants } from './choiceControlVariants.js';
export const Checkbox = React.forwardRef(({ className, children, ...props }, ref) => {
    const input = (_jsx("input", { ref: ref, type: "checkbox", "data-ui": "checkbox", className: cn(choiceControlVariants({ kind: 'checkbox' }), className), ...props }));
    if (children == null || children === false)
        return input;
    return (_jsxs("label", { className: choiceControlLabelClasses, children: [input, children] }));
});
Checkbox.displayName = 'Checkbox';
