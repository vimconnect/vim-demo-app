import React from 'react';
export type CountryFlagResolver = (name: string) => string | undefined;
/** Exposed for the picker, which renders ~200 rows and wants one resolver for
 *  all of them rather than one lazy load per row. */
export declare function useCountryFlagResolver(): CountryFlagResolver | null;
export interface CountryFlagProps {
    /** Country name as stored — e.g. "Ireland", "Cabo Verde". */
    name: string;
    /**
     * A resolver from {@link useCountryFlagResolver}.
     *
     * REQUIRED, and that is the point: this component mounts no effect and holds no
     * state, so a list of 200 rows costs 200 renders and not 200 effects. It was
     * optional before, with the hook called anyway as a fallback — which meant the
     * prop documented an optimisation it did not deliver, since the effect ran per
     * row regardless. A future caller with a single flag and nowhere natural to hold
     * the hook should wrap this rather than reintroduce the fallback.
     */
    resolver: CountryFlagResolver | null;
    /** Matches the type it sits beside. */
    size?: number;
    className?: string;
}
/**
 * Renders the flag, or nothing at all.
 *
 * A country the resolver cannot place — and there will be one eventually, since
 * the compliance list and the ISO register move independently — renders no flag
 * rather than a placeholder or a broken image. The country's NAME is always
 * beside it and is the actual content; the flag is recognition, not information,
 * so its absence must cost nothing. The same is true before the lazy chunk lands,
 * which is why a null resolver is an ordinary state rather than a loading case.
 */
export declare const CountryFlag: React.FC<CountryFlagProps>;
