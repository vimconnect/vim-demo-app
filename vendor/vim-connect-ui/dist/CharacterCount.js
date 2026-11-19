import { jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from './cn.js';
/** Default `showFrom`: the count appears once the value reaches 80% of the limit. */
export const characterCountShowFrom = (max) => Math.ceil(max * 0.8);
/**
 * Whether `CharacterCount` renders for this value: the trimmed length has reached `showFrom` (80% of
 * `max` by default). One rule for the count and anything that points `aria-describedby` at it.
 */
export const characterCountShows = (value, max, showFrom) => value.trim().length >= (showFrom ?? characterCountShowFrom(max));
/**
 * "n/max" under a text field (vim-ai DS → Input → Character count): hidden until the value
 * nears the limit, muted while under it, readable red past it. Polite live region, so a screen
 * reader hears the count once it matters, not on every keystroke from the first one.
 */
export function CharacterCount({ value, max, showFrom, id, className, 'data-testid': testId }) {
    if (!characterCountShows(value, max, showFrom))
        return null;
    const length = value.trim().length;
    const over = length > max;
    return (_jsxs("span", { id: id, "data-ui": "character-count", "data-over": over ? '' : undefined, "aria-live": "polite", "data-testid": testId, className: cn('mt-[4px] block text-right [font-family:var(--font-sans)] text-[length:var(--text-xs)] leading-[1.5] tabular-nums', over ? '[color:var(--color-error-text)] [font-weight:var(--font-semibold)]' : '[color:var(--color-text-muted)]', className), children: [length, "/", max] }));
}
