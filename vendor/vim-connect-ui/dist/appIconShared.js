import { cva } from 'class-variance-authority';
/**
 * Each step's box: size and radius. The one source for the icon's own size
 * variants and for anything that must sit level with an icon of that step (a
 * "+N" badge beside a strip), via `appIconBox`.
 */
const BOX = {
    xs: 'size-[16px] rounded-[var(--radius-sm)]',
    sm: 'size-[24px] rounded-[var(--radius-base)]',
    md: 'size-[32px] rounded-[var(--radius-md)]',
    lg: 'size-[44px] rounded-[var(--radius-lg)]',
    xl: 'size-[64px] rounded-[var(--radius-2xl)]',
    '2xl': 'size-[88px] rounded-[var(--radius-2xl)]',
};
/** The size and radius classes of an App Icon step, for an element that must match it. */
export function appIconBox(size) {
    return BOX[size];
}
export const appIconVariants = cva([
    'relative inline-flex shrink-0 items-center justify-center overflow-hidden align-middle select-none',
    '[font-weight:var(--font-bold)] leading-none tracking-[0.02em] [color:var(--color-text-on-gradient)]',
], {
    variants: {
        size: {
            xs: [BOX.xs, 'text-[length:var(--text-2xs)]'],
            sm: [BOX.sm, 'text-[length:var(--text-2xs)]'],
            md: [BOX.md, 'text-[length:var(--text-sm)]'],
            lg: [BOX.lg, 'text-[length:var(--text-xl)]'],
            xl: [BOX.xl, 'text-[length:var(--text-2xl)]'],
            '2xl': [BOX['2xl'], 'text-[length:var(--text-3xl)]'],
        },
        ring: {
            true: '[box-shadow:0_0_0_2px_var(--color-bg-card)]',
            false: '',
        },
    },
    defaultVariants: { size: 'md', ring: false },
});
