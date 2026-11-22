'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { Monitor, Moon, Sun } from 'lucide-react';
import { SegmentedControl } from './SegmentedControl.js';
import { THEME_SYSTEM_FALLBACK, applyBodyLightMode, getSystemTheme, systemMedia, } from './themeShared.js';
/**
 * Theme switcher — vim-ai `Design System.html` → Segmented Control → "Theme
 * switcher" (plugin 1.0.19): the one control for choosing a theme in every
 * product. The icon variant of `SegmentedControl`, three options in this order:
 * System (monitor, the default), Light (sun), Dark (moon). System follows the
 * OS, live; its tooltip and screen-reader name say what it's following
 * ("System (dark)", "Follow system theme, currently dark"). The glyph of the
 * option just picked animates once (pop / spin / swing), never under reduced
 * motion.
 *
 * `useThemePreference` is the state behind it: the stored choice, the OS
 * theme followed live, and the theme applied to the page. It replaces each
 * product's own copy of that logic. The storage key and how a theme is applied
 * are the product's: by default it toggles `light-mode` on `<body>`, the DS
 * convention.
 *
 * It is safe to server-render (Next.js): the first render never touches
 * `localStorage` or `matchMedia`, so the server and the client's first render
 * agree. Both are read right after mount, before paint.
 */
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
