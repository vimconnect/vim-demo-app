/** Sets a ref of either kind (callback or object) to `value`. */
export function assignRef(ref, value) {
    if (typeof ref === 'function')
        ref(value);
    else if (ref)
        ref.current = value;
}
