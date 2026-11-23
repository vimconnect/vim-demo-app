import { jsx as _jsx } from "react/jsx-runtime";
import { cn } from './cn.js';
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
// The class form of BASE and ACCENT above: change them together (toast.test.tsx checks).
const TOAST_CLASSES = [
    'flex items-start gap-[var(--space-md)] max-w-[380px] px-[var(--space-lg)] py-[var(--space-md)]',
    'rounded-[var(--radius-md)] border border-solid [border-color:var(--glass-border-raised)]',
    '[background:var(--glass-bg-float)] [backdrop-filter:var(--glass-blur-md)] [-webkit-backdrop-filter:var(--glass-blur-md)]',
    '[box-shadow:var(--glass-shadow-float)]',
    '[color:var(--color-text-primary)] [font-family:var(--font-sans)] text-[length:var(--text-base)]',
].join(' ');
const ACCENT_CLASSES = {
    success: 'border-l-[3px] [border-left-color:var(--color-success)]',
    error: 'border-l-[3px] [border-left-color:var(--color-error)]',
    info: 'border-l-[3px] [border-left-color:var(--color-cyan)]',
    warning: 'border-l-[3px] [border-left-color:var(--color-warning)]',
};
/**
 * The same DS toast as classes, for a toast a product draws itself rather than through
 * react-hot-toast (an inline undo toast inside a panel), where inline styles are not wanted.
 * A flex row: icon, text, action. With an accent, the 3px left rule in that colour.
 */
export function toastClassName(accent) {
    return cn(TOAST_CLASSES, accent && ACCENT_CLASSES[accent]);
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
