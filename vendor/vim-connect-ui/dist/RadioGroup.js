import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useId } from 'react';
import { Radio } from './Radio.js';
import { LABEL_CLASSES } from './Label.js';
import { cn } from './cn.js';
const NOTE = 'mt-[6px] mb-0 [font-family:var(--font-sans)] text-[length:var(--text-xs)] leading-[1.5]';
const OPTIONAL = '[font-weight:var(--font-normal)] normal-case tracking-normal [color:var(--color-text-muted)]';
const ROW_BASE = 'flex items-start gap-[var(--space-sm)] [font-family:var(--font-sans)]';
const ROW_VARIANT = {
    list: '',
    card: 'gap-[var(--space-md)] p-[var(--space-md)_var(--space-lg)]',
};
const CONTENT_VARIANT = {
    // Under the text: past the 16px ring and its 8px gap.
    list: 'mt-[var(--space-sm)] pl-[24px]',
    card: 'px-[var(--space-lg)] pb-[var(--space-md)]',
};
const OPTION_VARIANT = {
    list: '',
    // A 1px border in both states, colour-only once picked, so picking never shifts the tiles.
    card: [
        'h-full box-border rounded-[var(--radius-xl)]',
        'border border-solid [border-color:var(--color-border-light)] transition-[border-color,background] duration-[var(--transition-base)]',
        'data-[checked]:[border-color:var(--color-cyan)] data-[checked]:[background:var(--color-cyan-08)]',
        'hover:not-data-[disabled]:[border-color:var(--color-border-medium)] data-[checked]:hover:[border-color:var(--color-cyan)]',
    ].join(' '),
};
const TITLE = {
    list: 'text-[length:var(--text-base)] [font-weight:var(--font-medium)]',
    card: 'text-[length:var(--text-base)] [font-weight:var(--font-semibold)]',
};
/**
 * Radio Group (DS → Checkbox / Radio → Radio group): one choice from a short list, as native
 * radios under one name, so the arrow keys move and pick and the group is one Tab stop. `list`
 * rows or `card` tiles; each option has a label, an optional description, addon and icon, and
 * `content` that opens under it once it's picked.
 *
 * Hooks: `data-ui="radio-group"` (+ `data-variant`), `radio-option` (+ `data-checked`,
 * `data-disabled`) on each option, `radio-option-content` for what opens under the picked one.
 */
export function RadioGroup({ options, value, onChange, name, variant = 'list', orientation = 'vertical', columns = 'repeat(auto-fit, minmax(240px, 1fr))', help, error, optional, required, disabled, className, style, ...labelling }) {
    const id = useId();
    const groupName = name ?? `radio-group-${id}`;
    const labelId = `${id}-label`;
    const noteId = `${id}-note`;
    const label = 'label' in labelling ? labelling.label : undefined;
    const ariaLabel = 'aria-label' in labelling ? labelling['aria-label'] : undefined;
    const hasError = error != null && error !== false;
    const showHelp = help != null && !hasError;
    const layout = variant === 'card'
        ? 'grid gap-[10px]'
        : orientation === 'horizontal'
            ? 'flex flex-wrap items-center gap-x-[var(--space-lg)] gap-y-[var(--space-sm)]'
            : 'flex flex-col gap-[var(--space-sm)]';
    return (_jsxs("div", { "data-ui": "radio-group", "data-variant": variant, className: className, style: style, children: [label != null && (_jsxs("div", { id: labelId, className: LABEL_CLASSES, children: [label, required && (_jsx("span", { "aria-hidden": "true", className: "[color:var(--color-error)]", children: ' *' })), optional && _jsx("span", { className: OPTIONAL, children: " (optional)" })] })), _jsx("div", { role: "radiogroup", "aria-labelledby": label != null ? labelId : undefined, "aria-label": ariaLabel, "aria-describedby": showHelp || hasError ? noteId : undefined, "aria-invalid": hasError || undefined, "aria-required": required || undefined, className: layout, style: variant === 'card' ? { gridTemplateColumns: columns } : undefined, children: options.map((o) => {
                    const checked = value === o.value;
                    const off = disabled || o.disabled;
                    return (_jsxs("div", { "data-ui": "radio-option", "data-checked": checked || undefined, "data-disabled": off || undefined, className: OPTION_VARIANT[variant], children: [_jsxs("label", { className: cn(ROW_BASE, ROW_VARIANT[variant], off ? 'cursor-not-allowed' : 'cursor-pointer'), children: [_jsx(Radio, { name: groupName, value: o.value, checked: checked, disabled: off, onChange: () => onChange(o.value), "data-testid": o.testId, className: "mt-[2px]" }), o.icon != null && _jsx("span", { className: "flex shrink-0 items-center", children: o.icon }), _jsxs("span", { className: "min-w-0 flex-1", children: [_jsxs("span", { className: "flex flex-wrap items-center gap-[var(--space-sm)]", children: [_jsx("span", { className: cn(TITLE[variant], off ? '[color:var(--color-text-secondary)]' : '[color:var(--color-text-primary)]'), children: o.label }), o.addon] }), o.description != null && (_jsx("span", { className: "mt-[2px] block text-[length:var(--text-sm)] leading-[1.5] [color:var(--color-text-muted)]", children: o.description }))] })] }), checked && o.content != null && (_jsx("div", { "data-ui": "radio-option-content", className: CONTENT_VARIANT[variant], children: o.content }))] }, o.value));
                }) }), showHelp && (_jsx("p", { id: noteId, className: cn(NOTE, '[color:var(--color-text-muted)]'), children: help })), hasError && (_jsx("p", { id: noteId, className: cn(NOTE, '[color:var(--color-error-text)]'), children: error }))] }));
}
