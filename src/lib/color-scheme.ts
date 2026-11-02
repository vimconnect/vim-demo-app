import type { VimSDK } from '@vimconnect/app-sdk';

export type ColorScheme = NonNullable<VimSDK['hub']['colorScheme']>['current'];

/** The launch URL parameter the Vim Hub sets, also the sessionStorage key that carries it past the OAuth redirect. */
export const COLOR_SCHEME_PARAM = 'vim_color_scheme';

export function parseColorScheme(value: string | null | undefined): ColorScheme | null {
  return value === 'light' || value === 'dark' ? value : null;
}

/** The design tokens are dark by default; `body.light-mode` switches them to light. */
export function applyColorScheme(scheme: ColorScheme, body: HTMLElement = document.body): void {
  body.classList.toggle('light-mode', scheme === 'light');
}

export function rememberColorScheme(scheme: ColorScheme): void {
  try {
    sessionStorage.setItem(COLOR_SCHEME_PARAM, scheme);
  } catch {
    // Storage blocked: the next page paints light until the SDK reports the scheme.
  }
}

/** `'hub'` follows the Vim Hub; `'light'` or `'dark'` is the app's own override. */
export type AppThemeChoice = 'hub' | ColorScheme;

/** The scheme to paint, or null to leave the page as it is (following an extension that reports none). */
export function resolveAppTheme(choice: AppThemeChoice, hubScheme: ColorScheme | undefined): ColorScheme | null {
  return choice === 'hub' ? (hubScheme ?? null) : choice;
}

export function followColorScheme(scheme: ColorScheme): void {
  applyColorScheme(scheme);
  rememberColorScheme(scheme);
}

/**
 * Runs inline as the body's first child, before React hydrates, so a dark Hub never
 * shows a light first frame. It must stay self-contained: it is serialised, not imported.
 */
export function firstPaintScript(param: string = COLOR_SCHEME_PARAM): string {
  return `(function(){try{var k=${JSON.stringify(param)};var p=new URLSearchParams(location.search).get(k);var ok=function(v){return v==="light"||v==="dark"};if(ok(p))sessionStorage.setItem(k,p);var s=ok(p)?p:sessionStorage.getItem(k);if(ok(s))document.body.classList.toggle("light-mode",s==="light");}catch(e){}})();`;
}
