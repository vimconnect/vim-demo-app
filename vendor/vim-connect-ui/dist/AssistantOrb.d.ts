export type AssistantOrbSize = 'hero' | 'avatar';
export interface AssistantOrbProps {
    /** `hero` 132px, floating over its shadow (the greeting); `avatar` 18px, beside each answer. */
    size?: AssistantOrbSize;
    /** The answer is being written: the swirl speeds up and the glass breathes. */
    thinking?: boolean;
    className?: string;
}
/**
 * Assistant Orb (DS → Assistant Orb): the AI Assistant's mark, a morphing glass ball with two
 * counter-rotating swirls, a rim light and a glint. Decorative, so always `aria-hidden`.
 * Clicking the hero orb turns it liquid: it wobbles through blob shapes, its colours flow and
 * shift, the glass goes see-through while the inner currents swell, and the glint slides round;
 * then it springs back. Still under `prefers-reduced-motion`. Colours come from the `--orb-*`
 * tokens, which follow the theme.
 */
export declare function AssistantOrb({ size, thinking, className }: AssistantOrbProps): import("react/jsx-runtime").JSX.Element;
