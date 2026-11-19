import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useState } from 'react';
import { cva } from 'class-variance-authority';
import { User } from 'lucide-react';
import { cn } from './cn.js';
/**
 * A person's initials: two words → their first letters ("Dana Levi" → "DL"); one
 * word → up to two letters ("Alice" → "AL", "A" → "A"); no name, or a name equal
 * to the email → the email's local-part letters ("asaf+m9@…" → "AS"); else "?".
 */
export function avatarInitials(name, email) {
    const cleaned = (name ?? '').trim();
    if (cleaned && cleaned !== email) {
        const parts = cleaned.split(/[\s,]+/).filter(Boolean);
        if (parts.length >= 2)
            return (firstLetter(parts[0]) + firstLetter(parts[1])).toUpperCase();
        if (parts.length === 1)
            return Array.from(parts[0]).slice(0, 2).join('').toUpperCase();
    }
    if (email) {
        const local = email.split('@')[0].replace(/[^\p{L}]/gu, '');
        if (local)
            return Array.from(local).slice(0, 2).join('').toUpperCase();
    }
    return '?';
}
const firstLetter = (s) => Array.from(s)[0] ?? '';
const avatarVariants = cva([
    'relative inline-flex shrink-0 items-center justify-center overflow-hidden align-middle select-none',
    'rounded-[var(--radius-full)] [background:var(--gradient-primary)]',
    '[font-family:var(--font-title)] [font-weight:var(--font-bold)] tracking-[0.02em] [color:var(--color-text-on-gradient)]',
], {
    variants: {
        size: {
            xs: 'size-[16px] text-[length:var(--text-2xs)] leading-none',
            sm: 'size-[24px] text-[length:var(--text-2xs)] leading-none',
            md: 'size-[32px] text-[length:var(--text-sm)] leading-none',
            lg: 'size-[44px] text-[length:var(--text-lg)] leading-none',
            xl: 'size-[64px] text-[length:var(--text-2xl)] leading-none',
        },
        ring: {
            true: '[box-shadow:0_0_0_2px_var(--color-bg-card)]',
            false: '',
        },
    },
    defaultVariants: { size: 'md', ring: false },
});
const isPhotoUrl = (src) => !!src && /^(https?:\/\/|data:image\/)/i.test(src.trim());
/** Avatar (DS → Avatar): a person's photo, or their initials on `--gradient-primary`. Apps use `AppIcon`. */
export function Avatar({ name, email, src, size = 'md', ring = false, label, loading = 'lazy', className, ...rest }) {
    const [failedSrc, setFailedSrc] = useState(null);
    const [loadedSrc, setLoadedSrc] = useState(null);
    const tryPhoto = isPhotoUrl(src) && failedSrc !== src;
    const photoShown = tryPhoto && loadedSrc === src;
    const a11y = label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true };
    const initials = avatarInitials(name, email);
    // Read on mount too: a server-rendered photo can settle before hydration.
    const checkSettled = useCallback((img) => {
        if (!img?.complete || !src)
            return;
        if (img.naturalWidth === 0)
            setFailedSrc(src);
        else
            setLoadedSrc(src);
    }, [src]);
    const fallback = initials === '?' ? (_jsx(User, { "aria-hidden": "true", className: "size-[58%]", strokeWidth: 2.25 })) : size === 'xs' ? (firstLetter(initials)) : (initials);
    return (_jsxs("span", { "data-ui": "avatar", "data-fallback": photoShown ? undefined : '', className: cn(avatarVariants({ size, ring }), className), ...a11y, ...rest, children: [!photoShown && fallback, tryPhoto && (_jsx("img", { src: src, alt: "", className: cn('absolute inset-0 block size-full object-cover', !photoShown && 'opacity-0'), referrerPolicy: "no-referrer", loading: loading, ref: checkSettled, onLoad: () => setLoadedSrc(src), onError: () => setFailedSrc(src) }))] }));
}
export { avatarVariants };
