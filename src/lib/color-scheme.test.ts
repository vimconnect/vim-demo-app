import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  COLOR_SCHEME_PARAM,
  applyColorScheme,
  firstPaintScript,
  followColorScheme,
  parseColorScheme,
  resolveAppTheme,
} from './color-scheme';

function runFirstPaint(search: string) {
  window.history.replaceState(null, '', `/launch${search}`);
  new Function(firstPaintScript())();
}

beforeEach(() => {
  document.body.className = 'light-mode';
  sessionStorage.clear();
});

afterEach(() => {
  window.history.replaceState(null, '', '/');
});

describe('parseColorScheme', () => {
  it('accepts light and dark only', () => {
    expect(parseColorScheme('light')).toBe('light');
    expect(parseColorScheme('dark')).toBe('dark');
    expect(parseColorScheme('contrast')).toBeNull();
    expect(parseColorScheme(null)).toBeNull();
  });
});

describe('applyColorScheme', () => {
  it('drops light-mode for dark and restores it for light', () => {
    applyColorScheme('dark');
    expect(document.body.classList.contains('light-mode')).toBe(false);
    applyColorScheme('light');
    expect(document.body.classList.contains('light-mode')).toBe(true);
  });
});

describe('followColorScheme', () => {
  it('applies the scheme and remembers it for the next page', () => {
    followColorScheme('dark');
    expect(document.body.classList.contains('light-mode')).toBe(false);
    expect(sessionStorage.getItem(COLOR_SCHEME_PARAM)).toBe('dark');
  });
});

describe('firstPaintScript', () => {
  it('paints dark from the launch URL and carries it past the redirect', () => {
    runFirstPaint('?launch_id=abc&vim_color_scheme=dark');
    expect(document.body.classList.contains('light-mode')).toBe(false);

    document.body.className = 'light-mode';
    runFirstPaint('?code=x&state=y');
    expect(document.body.classList.contains('light-mode')).toBe(false);
  });

  it('lets a newer launch URL replace the remembered scheme', () => {
    sessionStorage.setItem(COLOR_SCHEME_PARAM, 'dark');
    runFirstPaint('?vim_color_scheme=light');
    expect(document.body.classList.contains('light-mode')).toBe(true);
    expect(sessionStorage.getItem(COLOR_SCHEME_PARAM)).toBe('light');
  });

  it('keeps the light default with no hint and ignores unknown values', () => {
    runFirstPaint('?vim_color_scheme=contrast');
    expect(document.body.classList.contains('light-mode')).toBe(true);
    expect(sessionStorage.getItem(COLOR_SCHEME_PARAM)).toBeNull();
  });
});

describe('resolveAppTheme', () => {
  it('follows the Hub when the choice is hub', () => {
    expect(resolveAppTheme('hub', 'dark')).toBe('dark');
    expect(resolveAppTheme('hub', 'light')).toBe('light');
  });

  it('leaves the page alone when following an extension that reports no scheme', () => {
    expect(resolveAppTheme('hub', undefined)).toBeNull();
  });

  it('uses the override whatever the Hub reports', () => {
    expect(resolveAppTheme('light', 'dark')).toBe('light');
    expect(resolveAppTheme('dark', 'light')).toBe('dark');
    expect(resolveAppTheme('dark', undefined)).toBe('dark');
  });
});
