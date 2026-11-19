import { jsx as _jsx } from "react/jsx-runtime";
import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { Monitor, Moon, Sun } from 'lucide-react';
import { SegmentedControl } from './SegmentedControl.js';
/**
 * The OS query System follows (it matches → light), and the theme when it can't
 * be asked (no `matchMedia`, or it throws): dark. A browser with no preference
 * reads as dark too. A product's pre-paint script runs before any bundle, so it
 * inlines these as literals: test it against these exports so it can't drift.
 */
export const THEME_SYSTEM_LIGHT_QUERY = '(prefers-color-scheme: light)';
export const THEME_SYSTEM_FALLBACK = 'dark';
/** A layout effect in the browser (runs before paint), a no-op effect on the server. */
const useClientLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;
export function ThemeSwitcher({ value, onChange, systemTheme, ariaLabel = 'Theme', className }) {
    return (_jsx(SegmentedControl, { variant: "icon", ariaLabel: ariaLabel, value: value, onChange: onChange, className: className, options: [
            {
                value: 'system',
                label: `System (${systemTheme})`,
                ariaLabel: `Follow system theme, currently ${systemTheme}`,
                icon: Monitor,
                iconMotion: 'pop',
            },
            { value: 'light', label: 'Light', ariaLabel: 'Light mode', icon: Sun, iconMotion: 'spin' },
            { value: 'dark', label: 'Dark', ariaLabel: 'Dark mode', icon: Moon, iconMotion: 'swing' },
        ] }));
}
/** The DS convention: light is `<body class="light-mode">`, dark is its absence. */
export function applyBodyLightMode(theme) {
    document.body.classList.toggle('light-mode', theme === 'light');
}
function systemMedia() {
    try {
        return typeof window.matchMedia === 'function' ? window.matchMedia(THEME_SYSTEM_LIGHT_QUERY) : null;
    }
    catch {
        return null;
    }
}
/**
 * What the OS is set to now, asked the way `useThemePreference` asks it. For code
 * outside React that needs the System theme (a sign-in redirect, say).
 */
export function getSystemTheme() {
    if (typeof window === 'undefined')
        return THEME_SYSTEM_FALLBACK;
    const media = systemMedia();
    if (!media)
        return THEME_SYSTEM_FALLBACK;
    return media.matches ? 'light' : 'dark';
}
function readStored(key) {
    try {
        const v = window.localStorage.getItem(key);
        return v === 'light' || v === 'dark' || v === 'system' ? v : 'system';
    }
    catch {
        return 'system';
    }
}
function readCustom(read) {
    try {
        const v = read();
        return v === 'light' || v === 'dark' || v === 'system' ? v : 'system';
    }
    catch {
        return 'system';
    }
}
/**
 * The theme choice for a product. Mount it once, somewhere always on screen (the
 * app shell, not a menu that unmounts), so the page keeps following the OS while
 * the switcher is closed. A product's pre-paint script should read the same key,
 * so the first paint is already right.
 */
export function useThemePreference({ storageKey, apply = applyBodyLightMode, readPreference, forcedTheme = null, }) {
    // The server and the client's first render both start here, so hydration matches.
    const [preference, setPreferenceState] = useState('system');
    const [systemTheme, setSystemTheme] = useState(THEME_SYSTEM_FALLBACK);
    // Nothing is applied until storage and the OS have been read: until then the
    // pre-paint script's theme (or the page's default) stays on screen.
    const [ready, setReady] = useState(false);
    useClientLayoutEffect(() => {
        // Browser-only state, read once after mount; the re-render lands before paint.
        setPreferenceState(readPreference ? readCustom(readPreference) : readStored(storageKey));
        setSystemTheme(getSystemTheme());
        setReady(true);
    }, [storageKey, readPreference]);
    useEffect(() => {
        const media = systemMedia();
        if (!media)
            return;
        // Ask again rather than read `media.matches`: not every MediaQueryList is live.
        const onChange = () => setSystemTheme(getSystemTheme());
        media.addEventListener?.('change', onChange);
        return () => media.removeEventListener?.('change', onChange);
    }, []);
    const theme = forcedTheme ?? (preference === 'system' ? systemTheme : preference);
    useClientLayoutEffect(() => {
        if (ready)
            apply?.(theme);
    }, [apply, ready, theme]);
    const setPreference = useCallback((next) => {
        setPreferenceState(next);
        try {
            window.localStorage.setItem(storageKey, next);
        }
        catch {
            // Storage blocked (private mode, sandboxed frame): the choice holds for this page.
        }
    }, [storageKey]);
    return { preference, theme, systemTheme, setPreference };
}
