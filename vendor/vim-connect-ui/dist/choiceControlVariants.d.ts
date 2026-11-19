import { type VariantProps } from 'class-variance-authority';
/**
 * Shared paint for Checkbox and Radio (vim-ai Inputs → Checkbox / Radio).
 * `.tsx` so product Tailwind content globs that scan this package's tsx pick it up.
 */
export declare const choiceControlVariants: (props?: ({
    kind?: "checkbox" | "radio" | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
export type ChoiceControlKind = NonNullable<VariantProps<typeof choiceControlVariants>['kind']>;
export declare const choiceControlLabelClasses = "inline-flex items-center gap-[8px] [font-family:var(--font-sans)] text-[length:var(--text-sm)] [color:var(--color-text-primary)] cursor-pointer has-[:disabled]:cursor-not-allowed";
