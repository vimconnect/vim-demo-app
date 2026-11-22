import { cva } from 'class-variance-authority';
export const filterBarVariants = cva([
    'flex items-center gap-[var(--space-md)] flex-nowrap',
    'mb-[var(--space-2xl)] p-[var(--space-md)]',
    '[background:var(--fb-bg)] rounded-[var(--fb-radius)]',
    'sticky z-[40] [top:var(--fb-top)]',
    '[transition:border-radius_var(--transition-slow)]',
].join(' '), {
    variants: {
        // --fb-* live on the class so theme / call-site CSS can override them.
        flushTop: {
            false: '[--fb-radius:var(--radius-xl)]',
            true: '[--fb-radius:0_0_var(--radius-xl)_var(--radius-xl)]',
        },
        stackedBelowTabs: {
            false: '[--fb-top:0]',
            true: '[--fb-top:var(--tab-nav-height,0px)]',
        },
    },
    defaultVariants: { flushTop: false, stackedBelowTabs: false },
});
