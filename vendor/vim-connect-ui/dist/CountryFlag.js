import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { cn } from './cn.js';
/**
 * Country flag (DS → Country flag): a country's flag, resolved from the country NAME we already store.
 *
 * Why name-based rather than storing ISO codes: `offshorePHICountries` holds
 * names, the backend validates submitted values against `OFFSHORE_COUNTRIES` by
 * name, and the app page publishes them by name. Switching the stored shape to
 * codes would mean a data migration, a backend change and a schema change to put
 * a 16px image next to a label — so the mapping happens here, at the one place
 * that needs it.
 *
 * `i18n-iso-countries` does the mapping and owns the part that actually changes
 * (countries are renamed, added and split). It resolves 187 of our 194 names on
 * its own; the seven below are short forms it does not carry, listed here rather
 * than "fixed" in the country list, because that list is the compliance-facing
 * wording and is not ours to reword for a lookup's convenience.
 *
 * Both the library and `flag-icons` load LAZILY, on first render of a flag. They
 * are ~600KB and ~90KB of CSS respectively, and only two surfaces in the console
 * show countries — the submission form's offshore picker and the app page's
 * compliance panel. Every other page must not pay for them.
 */
/** Short forms `getAlpha2Code` does not resolve. Verified by countryFlag.test.ts,
 *  which asserts each one maps to a flag `flag-icons` actually ships. */
const NAME_OVERRIDES = {
    Brunei: 'BN',
    'Cabo Verde': 'CV',
    Laos: 'LA',
    Micronesia: 'FM',
    Moldova: 'MD',
    Syria: 'SY',
    'Vatican City': 'VA',
};
/** Module-level so the lazy import happens once per session, not per component. */
let resolverPromise = null;
function loadResolver() {
    if (resolverPromise)
        return resolverPromise;
    resolverPromise = (async () => {
        const [{ default: countries }, en] = await Promise.all([
            import('i18n-iso-countries'),
            import('i18n-iso-countries/langs/en.json'),
            // Side-effect import: registers `.fi`/`.fi-xx` and the flag assets. Awaited
            // alongside the data so a flag never paints as an unstyled empty box.
            import('flag-icons/css/flag-icons.min.css'),
        ]);
        const locale = (en.default ?? en);
        countries.registerLocale(locale);
        return (name) => {
            const code = NAME_OVERRIDES[name] ?? countries.getAlpha2Code(name, 'en');
            return code ? code.toLowerCase() : undefined;
        };
    })().catch((err) => {
        // Clear the cache on failure, so a transient chunk-fetch error (an offline
        // blip, a deploy swapping the asset out from under an open tab) is retried by
        // the next mount instead of being remembered for the rest of the session.
        resolverPromise = null;
        throw err;
    });
    return resolverPromise;
}
/** Exposed for the picker, which renders ~200 rows and wants one resolver for
 *  all of them rather than one lazy load per row. */
export function useCountryFlagResolver() {
    const [resolver, setResolver] = useState(null);
    useEffect(() => {
        let mounted = true;
        loadResolver()
            .then((r) => {
            if (mounted)
                setResolver(() => r);
        })
            // Swallowed deliberately: a country with no flag renders no flag, and the
            // name beside it carries the meaning. Rethrowing would surface an unhandled
            // rejection on every mount for something with no user-visible consequence.
            .catch(() => { });
        return () => {
            mounted = false;
        };
    }, []);
    return resolver;
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
export const CountryFlag = ({ name, resolver, size = 14, className }) => {
    const code = resolver?.(name);
    if (!code)
        return null;
    return (_jsx("span", { className: cn(`fi fi-${code}`, 'shrink-0 rounded-[2px]', 
        // Keeps mostly-white flags visible on a white row.
        '[box-shadow:inset_0_0_0_0.5px_var(--color-border-medium)]', className), "data-ui": "country-flag", "data-testid": `country-flag-${code}`, "aria-hidden": "true", 
        // Inline so flag-icons' own (unlayered) `.fi` background rules can't override them.
        style: { width: size * 1.33, height: size, backgroundSize: 'cover', backgroundPosition: 'center' } }));
};
