import React from 'react';
/**
 * Design-system toast theme — vim-ai `Design System.html` → Toasts.
 *
 * Toasts are react-hot-toast (call `toast.success / error / loading` from the
 * library itself). This package does NOT depend on react-hot-toast: `toast()`
 * and `<Toaster>` must come from the same copy of the library or toasts never
 * appear. It exports the theme instead; each product passes it to its own
 * Toaster:
 *
 *   <Toaster position="top-right" toastOptions={toastOptions} />
 *
 * Look: glass float surface (`--glass-bg-float`, blur, raised border, float
 * shadow), `--radius-md`, `--text-base`, `--space-md` / `--space-lg` padding,
 * max 380px. success / error / loading add a 3px left accent (green / red /
 * cyan) and a 20px tinted icon circle; `toastStyle('warning')` is the amber one,
 * for a product that draws its own warning toast (the DS page's .toast-warning). Success stays 5s (react-hot-toast's 2s
 * is too short for a sentence). The library positions toasts with inline
 * styles, so its theme (`toastOptions`, `toastStyle`) is inline styles on DS tokens.
 * `toastClassName` is the same look as classes, for a toast a product draws itself.
 */
export type ToastAccent = 'success' | 'error' | 'info' | 'warning';
/** The DS toast style; with an accent, adds the 3px left rule in that colour. */
export declare function toastStyle(accent?: ToastAccent): React.CSSProperties;
/**
 * The same DS toast as classes, for a toast a product draws itself rather than through
 * react-hot-toast (an inline undo toast inside a panel), where inline styles are not wanted.
 * A flex row: icon, text, action. With an accent, the 3px left rule in that colour.
 */
export declare function toastClassName(accent?: ToastAccent): string;
export interface ToastIconProps {
    /** Tint of the circle and glyph. Default info (cyan). */
    accent?: ToastAccent;
    children: React.ReactNode;
}
/** 20px tinted circle with a glyph, the DS toast icon. */
export declare function ToastIcon({ accent, children }: ToastIconProps): import("react/jsx-runtime").JSX.Element;
/** Structurally matches react-hot-toast's `DefaultToastOptions` without importing it. */
export interface ToastThemeOptions {
    style: React.CSSProperties;
    success: {
        style: React.CSSProperties;
        icon: React.ReactElement;
        duration: number;
    };
    error: {
        style: React.CSSProperties;
        icon: React.ReactElement;
    };
    loading: {
        style: React.CSSProperties;
    };
}
/** Pass as `<Toaster toastOptions={toastOptions} />`. */
export declare const toastOptions: ToastThemeOptions;
