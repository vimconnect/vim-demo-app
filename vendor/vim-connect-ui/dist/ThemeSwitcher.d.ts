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
export type Theme = 'light' | 'dark';
/** `system` follows the OS. */
export type ThemePreference = 'system' | Theme;
/**
 * The OS query System follows (it matches → light), and the theme when it can't
 * be asked (no `matchMedia`, or it throws): dark. A browser with no preference
 * reads as dark too. A product's pre-paint script runs before any bundle, so it
 * inlines these as literals: test it against these exports so it can't drift.
 */
export declare const THEME_SYSTEM_LIGHT_QUERY = "(prefers-color-scheme: light)";
export declare const THEME_SYSTEM_FALLBACK: Theme;
export interface ThemeSwitcherProps {
    value: ThemePreference;
    onChange: (preference: ThemePreference) => void;
    /** What the OS is set to, so System can say what it's following. */
    systemTheme: Theme;
    /** The group's accessible name. Default "Theme". */
    ariaLabel?: string;
    className?: string;
}
export declare function ThemeSwitcher({ value, onChange, systemTheme, ariaLabel, className }: ThemeSwitcherProps): import("react/jsx-runtime").JSX.Element;
/** The DS convention: light is `<body class="light-mode">`, dark is its absence. */
export declare function applyBodyLightMode(theme: Theme): void;
/**
 * What the OS is set to now, asked the way `useThemePreference` asks it. For code
 * outside React that needs the System theme (a sign-in redirect, say).
 */
export declare function getSystemTheme(): Theme;
export interface UseThemePreferenceOptions {
    /** localStorage key for the choice. Written only when the user picks. */
    storageKey: string;
    /** Put a theme on the page. Default `applyBodyLightMode`. Pass `null` to apply it yourself from `theme`. */
    apply?: ((theme: Theme) => void) | null;
    /**
     * Read the stored choice yourself, e.g. to migrate an older key. Called once,
     * after mount; return `'system'` when there's nothing. Default: `storageKey`.
     * Pass a stable (module-level) function: a new one reads storage again.
     */
    readPreference?: () => ThemePreference;
    /**
     * A theme that wins over the preference while set (a page pinned to light,
     * say): it's the `theme` returned and applied. The stored choice is untouched.
     */
    forcedTheme?: Theme | null;
}
export interface ThemePreferenceState {
    /** The stored choice: system, light or dark. */
    preference: ThemePreference;
    /** The theme on screen: `forcedTheme` if set, else the preference resolved against the OS. */
    theme: Theme;
    /** What the OS is set to, whatever the preference. */
    systemTheme: Theme;
    setPreference: (preference: ThemePreference) => void;
}
/**
 * The theme choice for a product. Mount it once, somewhere always on screen (the
 * app shell, not a menu that unmounts), so the page keeps following the OS while
 * the switcher is closed. A product's pre-paint script should read the same key,
 * so the first paint is already right.
 */
export declare function useThemePreference({ storageKey, apply, readPreference, forcedTheme, }: UseThemePreferenceOptions): ThemePreferenceState;
