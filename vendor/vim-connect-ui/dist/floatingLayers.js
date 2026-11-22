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
 * Popover, a Modal opened from one) own their own dismissal: only the top layer
 * answers Escape, and a click inside a layer above counts as inside for the ones below.
 */
export function useFloatingLayer(open, contains) {
    const parent = useContext(FloatingLayerContext);
    const containsRef = useRef(contains);
    containsRef.current = contains;
    const layer = useRef({ contains: (node) => containsRef.current(node), parent }).current;
    layer.parent = parent;
    const api = useRef({
        layer,
        /** True while no layer above this one is open. */
        isTop: () => stack[stack.length - 1] === layer,
        /** True when `node` is inside a layer above this one. */
        insideLayerAbove: (node) => {
            const i = stack.indexOf(layer);
            return i >= 0 && stack.slice(i + 1).some((l) => l.contains(node));
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
