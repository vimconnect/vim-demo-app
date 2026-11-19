import { cva } from 'class-variance-authority';
/**
 * Shared paint for Checkbox and Radio (vim-ai Inputs → Checkbox / Radio).
 * `.tsx` so product Tailwind content globs that scan this package's tsx pick it up.
 */
export const choiceControlVariants = cva([
    'appearance-none shrink-0 size-[16px] relative m-0 p-0 cursor-pointer align-middle',
    '[background:var(--color-bg-primary)] border border-solid [border-color:var(--color-text-primary)]',
    '[box-shadow:var(--cbr-shadow,none)]',
    '[transition:box-shadow_var(--transition-base),border-color_var(--transition-base),background_var(--transition-base),opacity_var(--transition-base)]',
    'hover:enabled:[--cbr-shadow:0_0_0_3px_color-mix(in_srgb,var(--color-cyan)_12%,transparent)]',
    'focus-visible:outline-none focus-visible:[--cbr-shadow:var(--shadow-focus)]',
    'disabled:opacity-50 disabled:cursor-not-allowed',
].join(' '), {
    variants: {
        kind: {
            checkbox: [
                'rounded-[var(--radius-sm)]',
                // Checkmark geometry must match vim-ai DS (5/2/4/8, 2px legs).
                "checked:after:content-[''] checked:after:absolute checked:after:left-[5px] checked:after:top-[2px]",
                'checked:after:w-[4px] checked:after:h-[8px] checked:after:border-solid',
                'checked:after:[border-color:var(--color-text-primary)]',
                'checked:after:border-t-0 checked:after:border-l-0 checked:after:border-r-[2px] checked:after:border-b-[2px]',
                'checked:after:rotate-45',
            ].join(' '),
            radio: [
                'rounded-full',
                "checked:after:content-[''] checked:after:absolute checked:after:left-1/2 checked:after:top-1/2",
                'checked:after:size-[8px] checked:after:rounded-full',
                'checked:after:[background:var(--color-text-primary)]',
                'checked:after:-translate-x-1/2 checked:after:-translate-y-1/2',
            ].join(' '),
        },
    },
    defaultVariants: { kind: 'checkbox' },
});
export const choiceControlLabelClasses = 'inline-flex items-center gap-[8px] [font-family:var(--font-sans)] text-[length:var(--text-sm)] [color:var(--color-text-primary)] cursor-pointer has-[:disabled]:cursor-not-allowed';
