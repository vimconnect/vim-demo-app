/**
 * The OS query System follows (it matches → light), and the theme when it can't
 * be asked (no `matchMedia`, or it throws): dark. A browser with no preference
 * reads as dark too. A product's pre-paint script runs before any bundle, so it
 * inlines these as literals: test it against these exports so it can't drift.
 */
export const THEME_SYSTEM_LIGHT_QUERY = '(prefers-color-scheme: light)';
export const THEME_SYSTEM_FALLBACK = 'dark';
/** The DS convention: light is `<body class="light-mode">`, dark is its absence. */
export function applyBodyLightMode(theme) {
    document.body.classList.toggle('light-mode', theme === 'light');
}
export function systemMedia() {
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
