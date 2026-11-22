import { type Theme, type ThemePreference } from './themeShared.js';
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
