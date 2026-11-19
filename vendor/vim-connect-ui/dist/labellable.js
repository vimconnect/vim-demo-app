/**
 * Marks a control component as "label-able": it puts an `id` and
 * `aria-describedby` passed to it on its own input. `FormRow` ties its label to
 * a single child only when that child is label-able, so a label never points at
 * an element that drops the id. Native `input`, `select` and `textarea` count.
 *
 * The mark lives on the component, where its props are defined, not in a list
 * a layout keeps. A `React.memo` wrapper of a marked component counts.
 */
const MARK = Symbol.for('vim-connect/ui.labellable');
const NATIVE = new Set(['input', 'select', 'textarea']);
/** Only compiles for a component whose props take `id` and `aria-describedby`. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- any component; the check is on its props below
export function markLabellable(component) {
    component[MARK] = true;
    return component;
}
/** Whether an element type is label-able: a native control, a marked component, or a memo of one. */
export function isLabellable(type) {
    if (typeof type === 'string')
        return NATIVE.has(type);
    if (type == null || (typeof type !== 'object' && typeof type !== 'function'))
        return false;
    if (type[MARK])
        return true;
    const inner = type.type;
    return inner != null && inner !== type && isLabellable(inner);
}
