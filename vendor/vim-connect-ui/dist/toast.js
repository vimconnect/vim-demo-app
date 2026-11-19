import { jsx as _jsx } from "react/jsx-runtime";
const ACCENT = {
    success: 'var(--color-success)',
    error: 'var(--color-error)',
    info: 'var(--color-cyan)',
    warning: 'var(--color-warning)',
};
const BASE = {
    background: 'var(--glass-bg-float)',
    backdropFilter: 'var(--glass-blur-md)',
    WebkitBackdropFilter: 'var(--glass-blur-md)',
    border: '1px solid var(--glass-border-raised)',
    borderRadius: 'var(--radius-md)',
    boxShadow: 'var(--glass-shadow-float)',
    color: 'var(--color-text-primary)',
    fontFamily: 'var(--font-sans)',
    fontSize: 'var(--text-base)',
    padding: 'var(--space-md) var(--space-lg)',
    maxWidth: '380px',
    gap: 'var(--space-md)',
    alignItems: 'flex-start',
};
/** The DS toast style; with an accent, adds the 3px left rule in that colour. */
export function toastStyle(accent) {
    return accent ? { ...BASE, borderLeft: `3px solid ${ACCENT[accent]}` } : BASE;
}
/** 20px tinted circle with a glyph, the DS toast icon. */
export function ToastIcon({ accent = 'info', children }) {
    const color = ACCENT[accent];
    return (_jsx("span", { "aria-hidden": "true", style: {
            flexShrink: 0,
            width: 20,
            height: 20,
            borderRadius: '50%',
            display: 'grid',
            placeItems: 'center',
            fontSize: 12,
            lineHeight: 1,
            background: `color-mix(in srgb, ${color} 18%, transparent)`,
            color,
        }, children: children }));
}
/** Pass as `<Toaster toastOptions={toastOptions} />`. */
export const toastOptions = {
    style: toastStyle(),
    success: { style: toastStyle('success'), icon: _jsx(ToastIcon, { accent: "success", children: "\u2713" }), duration: 5000 },
    error: { style: toastStyle('error'), icon: _jsx(ToastIcon, { accent: "error", children: "\u2715" }) },
    loading: { style: { ...toastStyle(), borderLeft: '3px solid var(--color-cyan)' } },
};
