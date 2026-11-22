import { cva } from 'class-variance-authority';
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
export const firstLetter = (s) => Array.from(s)[0] ?? '';
export const avatarVariants = cva([
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
