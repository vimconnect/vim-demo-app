'use client';
import { createContext, useContext, useEffect, useRef } from 'react';
/** Bottom first. A layer sits above its parent and above anything opened before it. */
const stack = [];
/** The surface a component renders inside; a surface provides itself to its contents. */
export const FloatingLayerContext = createContext(null);
const isInside = (layer, ancestor) => {
    for (let p = layer.parent; p; p = p.parent)
        if (p === ancestor)
            return true;
    return false;
};
/**
 * Registers a floating surface while `open`, so nested ones (a Select's list in a
 * Popover, a Modal opened from one) own their own dismissal: only the top layer that
 * answers Escape gets it, and a click inside a layer above counts as inside for the
 * ones below. A layer registered with `escape: false` is skipped for Escape; one with
 * `outsideClick: false` counts as inside only for the layers it was opened from.
 */
export function useFloatingLayer(open, contains, { escape = true, outsideClick = true } = {}) {
    const parent = useContext(FloatingLayerContext);
    const containsRef = useRef(contains);
    containsRef.current = contains;
    const layer = useRef({
        contains: (node) => containsRef.current(node),
        parent,
        escape,
        outsideClick,
    }).current;
    layer.parent = parent;
    layer.escape = escape;
    layer.outsideClick = outsideClick;
    const api = useRef({
        layer,
        /** True while open and no layer above this one answers Escape. */
        isTop: () => {
            const i = stack.indexOf(layer);
            return i >= 0 && stack.slice(i + 1).every((l) => !l.escape);
        },
        /** True when `node` is inside a layer above this one. */
        insideLayerAbove: (node) => {
            const i = stack.indexOf(layer);
            return (i >= 0 &&
                stack.slice(i + 1).some((l) => (l.outsideClick || isInside(l, layer)) && l.contains(node)));
        },
    });
    useEffect(() => {
        if (!open)
            return;
        // A child's effect runs before its parent's: slot the parent under any of its open children.
        const firstChild = stack.findIndex((l) => isInside(l, layer));
        if (firstChild >= 0)
            stack.splice(firstChild, 0, layer);
        else
            stack.push(layer);
        return () => {
            const i = stack.indexOf(layer);
            if (i >= 0)
                stack.splice(i, 1);
        };
    }, [open, layer]);
    return api.current;
}
