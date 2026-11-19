export interface CharacterCountProps {
    /** The field's current value; counted trimmed, as the limit is checked. */
    value: string;
    /** The limit. Past it the count turns red and bold. */
    max: number;
    /** Show the count from this many characters. Default: 80% of `max`, rounded up. */
    showFrom?: number;
    /** Lets a field point `aria-describedby` at the count. */
    id?: string;
    className?: string;
    'data-testid'?: string;
}
/** Default `showFrom`: the count appears once the value reaches 80% of the limit. */
export declare const characterCountShowFrom: (max: number) => number;
/**
 * Whether `CharacterCount` renders for this value: the trimmed length has reached `showFrom` (80% of
 * `max` by default). One rule for the count and anything that points `aria-describedby` at it.
 */
export declare const characterCountShows: (value: string, max: number, showFrom?: number) => boolean;
/**
 * "n/max" under a text field (vim-ai DS → Input → Character count): hidden until the value
 * nears the limit, muted while under it, readable red past it. Polite live region, so a screen
 * reader hears the count once it matters, not on every keystroke from the first one.
 */
export declare function CharacterCount({ value, max, showFrom, id, className, 'data-testid': testId }: CharacterCountProps): import("react/jsx-runtime").JSX.Element | null;
