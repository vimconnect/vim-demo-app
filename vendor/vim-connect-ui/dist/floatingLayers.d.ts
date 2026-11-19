/**
 * z-index for a floating panel portaled to the body (menu, popover, hover card, picker): the
 * `--z-popover` layer (design-tokens.css), above `--z-modal` so a panel opened from inside a Modal is
 * never behind it, and below `--z-tooltip`. floatingLayers.test.ts checks all three.
 */
export declare const zFloatingPanel: (offset?: number) => number;
/** An open floating surface (panel, list, picker, modal). */
export interface FloatingLayer {
    contains: (node: Node) => boolean;
    parent: FloatingLayer | null;
}
/** The surface a component renders inside; a surface provides itself to its contents. */
export declare const FloatingLayerContext: import("react").Context<FloatingLayer | null>;
/**
 * Registers a floating surface while `open`, so nested ones (a Select's list in a
 * Popover, a Modal opened from one) own their own dismissal: only the top layer
 * answers Escape, and a click inside a layer above counts as inside for the ones below.
 */
export declare function useFloatingLayer(open: boolean, contains: (node: Node) => boolean): {
    layer: FloatingLayer;
    /** True while no layer above this one is open. */
    isTop: () => boolean;
    /** True when `node` is inside a layer above this one. */
    insideLayerAbove: (node: Node) => boolean;
};
