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
/** The DS convention: light is `<body class="light-mode">`, dark is its absence. */
export declare function applyBodyLightMode(theme: Theme): void;
export declare function systemMedia(): MediaQueryList | null;
/**
 * What the OS is set to now, asked the way `useThemePreference` asks it. For code
 * outside React that needs the System theme (a sign-in redirect, say).
 */
export declare function getSystemTheme(): Theme;
