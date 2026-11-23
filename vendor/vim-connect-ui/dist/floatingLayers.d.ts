/** An open floating surface (panel, list, picker, modal). */
export interface FloatingLayer {
    contains: (node: Node) => boolean;
    parent: FloatingLayer | null;
    /** Answers Escape; `false` passes it to the next layer down. */
    escape: boolean;
    /** Dismisses on an outside click; `false` and not opened from a layer, a click in it is outside that layer. */
    outsideClick: boolean;
}
/** What a layer dismisses on. Both default to `true`. */
export interface FloatingLayerOptions {
    escape?: boolean;
    outsideClick?: boolean;
}
/** The surface a component renders inside; a surface provides itself to its contents. */
export declare const FloatingLayerContext: import("react").Context<FloatingLayer | null>;
/**
 * Registers a floating surface while `open`, so nested ones (a Select's list in a
 * Popover, a Modal opened from one) own their own dismissal: only the top layer that
 * answers Escape gets it, and a click inside a layer above counts as inside for the
 * ones below. A layer registered with `escape: false` is skipped for Escape; one with
 * `outsideClick: false` counts as inside only for the layers it was opened from.
 */
export declare function useFloatingLayer(open: boolean, contains: (node: Node) => boolean, { escape, outsideClick }?: FloatingLayerOptions): {
    layer: FloatingLayer;
    /** True while open and no layer above this one answers Escape. */
    isTop: () => boolean;
    /** True when `node` is inside a layer above this one. */
    insideLayerAbove: (node: Node) => boolean;
};
