export interface TipMarkProps {
    className?: string;
}
/**
 * Tip Mark (DS → Tip): a stack of nine thin square slabs in CSS 3D. It cycles grey → swings one
 * way then the other while turning cyan / blue / purple (front slab cyan, back slab purple) → holds →
 * runs back to grey with the opposite swing, forever. Under `prefers-reduced-motion` it shows the
 * settled gradient and never moves. Decorative, so `aria-hidden`; 80px square.
 */
export declare function TipMark({ className }: TipMarkProps): import("react/jsx-runtime").JSX.Element;
