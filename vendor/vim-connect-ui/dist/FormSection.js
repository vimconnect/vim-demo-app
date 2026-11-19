import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useId } from 'react';
import { cn } from './cn.js';
import { isLabellable } from './labellable.js';
/**
 * Form section — the long-form editor layout: a section headed by an icon tile,
 * a sentence-case title and one line of explanation over a divider, with
 * label / control rows beneath it.
 *
 * Three parts:
 * - `FormSection` — the `<section>` (named by its title) with its header and rows.
 * - `FormSectionHeader` — the header alone, for sections that are siblings in one
 *   flow rather than wrappers.
 * - `FormRow` — one row: label (+ required / optional marker, description) in a
 *   fixed 320px column, the control beside it, so every control starts at the
 *   same x. Below 720px the row stacks.
 *
 * `FormRow` wires its label like `Field`: pass ONE control element and it gets
 * the `id` the label points at, `aria-describedby` (description and error) and,
 * with an `error`, `invalid` + `aria-invalid`. Several controls (a person's name
 * and email): pass `htmlFor` for the one the label names, or none.
 *
 * Generalised from the Console's `components/ui/formLayout.tsx` (manifest editor,
 * submission form) onto DS tokens. Classes mean the same in Tailwind v3 and v4:
 * arbitrary values on DS tokens only and no `!` important marker.
 */
const HELP = 'm-0 text-[length:var(--text-sm)] leading-[1.5] [color:var(--color-text-muted)] [font-family:var(--font-sans)]';
const Required = () => (_jsx("span", { "aria-hidden": "true", className: "[color:var(--color-error-text)]", children: "*" }));
export function FormSectionHeader({ icon, title, description, required, titleId, level = 3, className, }) {
    const H = `h${level}`;
    return (_jsxs("div", { "data-ui": "form-section-header", className: cn('flex items-center gap-[var(--space-md)] pb-[var(--space-md)] mb-[var(--space-md)]', 'border-0 border-b-[1.5px] border-solid [border-color:var(--glass-border-base)]', className), children: [icon != null && (_jsx("span", { "aria-hidden": "true", className: cn('inline-flex size-[36px] shrink-0 items-center justify-center rounded-[var(--radius-lg)]', '[background:color-mix(in_srgb,var(--color-cyan)_15%,transparent)] border border-solid [border-color:var(--color-cyan-30)]', '[color:var(--color-cyan)] [&_svg]:size-[16px]'), children: icon })), _jsxs("div", { className: "min-w-0", children: [_jsxs(H, { id: titleId, className: "m-0 [font-family:var(--font-sans)] text-[length:var(--text-lg)] [font-weight:var(--font-semibold)] leading-[1.2] [color:var(--color-text-primary)]", children: [title, required && (_jsxs(_Fragment, { children: [' ', _jsx(Required, {}), _jsx("span", { className: "sr-only", children: "(required)" })] }))] }), description != null && _jsx("p", { className: cn(HELP, 'mt-[2px]'), children: description })] })] }));
}
/** A section of a long form: header, then its `FormRow`s. Consecutive sections space themselves. */
export function FormSection({ children, className, ...header }) {
    const titleId = `ui-form-section-${useId()}`;
    return (_jsxs("section", { "data-ui": "form-section", "aria-labelledby": titleId, className: cn('mt-[var(--space-xl)] first:mt-0', className), children: [_jsx(FormSectionHeader, { ...header, titleId: titleId }), children] }));
}
export function FormRow({ label, children, description, error, required, optional, adornment, htmlFor, wire: autoWire = true, className, }) {
    const generated = `ui-form-row-${useId()}`;
    // `null` / `false` children (a control shown only on some rows) don't count.
    const present = React.Children.toArray(children);
    const only = present.length === 1 ? present[0] : null;
    const single = React.isValidElement(only) && typeof only.type !== 'symbol' ? only : null;
    // Only a label-able child (`markLabellable`, or a native control) takes the label's id.
    const wire = autoWire && single != null && htmlFor == null && isLabellable(single.type);
    const controlId = htmlFor ?? (wire ? (single.props.id ?? generated) : undefined);
    const descId = description != null ? `${controlId ?? generated}-desc` : undefined;
    const errorId = error != null ? `${controlId ?? generated}-error` : undefined;
    const control = wire
        ? React.cloneElement(single, {
            id: controlId,
            'aria-describedby': [single.props['aria-describedby'], descId, errorId].filter(Boolean).join(' ') || undefined,
            ...(error != null ? { invalid: true, 'aria-invalid': true } : {}),
        })
        : children;
    const labelClass = 'inline-flex flex-wrap items-center gap-[6px] [font-family:var(--font-sans)] text-[length:var(--text-base)] [font-weight:var(--font-semibold)] leading-[1.3] [color:var(--color-text-primary)]';
    const labelBody = (_jsxs(_Fragment, { children: [label, required && (_jsxs(_Fragment, { children: [_jsx(Required, {}), _jsx("span", { className: "sr-only", children: "(required)" })] })), optional && _jsx("span", { className: cn(HELP, '[font-weight:var(--font-normal)]'), children: "(optional)" }), adornment] }));
    return (_jsxs("div", { "data-ui": "form-row", className: cn('grid grid-cols-[320px_minmax(0,1fr)] items-start gap-[var(--space-lg)] py-[var(--space-md)]', 'max-[720px]:grid-cols-1 max-[720px]:gap-[var(--space-sm)]', 'border-0 border-b border-solid [border-color:var(--glass-border-base)] last:border-b-0', className), children: [_jsxs("div", { className: "min-w-0", children: [controlId ? (_jsx("label", { htmlFor: controlId, className: labelClass, children: labelBody })) : (_jsx("span", { className: labelClass, children: labelBody })), description != null && (_jsx("p", { id: descId, className: cn(HELP, 'mt-[var(--space-xs)]'), children: description }))] }), _jsxs("div", { className: "min-w-0", children: [control, error != null && (_jsx("p", { id: errorId, className: "mt-[6px] mb-0 [font-family:var(--font-sans)] text-[length:var(--text-xs)] leading-[1.5] [color:var(--color-error-text)]", children: error }))] })] }));
}
