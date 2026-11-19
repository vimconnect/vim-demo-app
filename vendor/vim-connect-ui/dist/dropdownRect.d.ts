/**
 * Placement for a fixed-position dropdown portaled to <body> and anchored to its trigger.
 *
 * Either `top` (opening downward) or `bottom` (flipped above the trigger) is set, never
 * both — anchoring by the bottom edge lets the list grow upward without knowing its height.
 */
export interface DropdownRect {
    top?: number;
    bottom?: number;
    left: number;
    width: number;
    maxHeight: number;
}
export declare function computeDropdownRect(trigger: DOMRect, wantedHeight: number, { maxHeight, minHeight }: {
    maxHeight: number;
    minHeight: number;
}): DropdownRect;
