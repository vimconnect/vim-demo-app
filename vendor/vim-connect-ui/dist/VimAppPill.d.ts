import { type VariantProps } from 'class-variance-authority';
declare const cyanPillVariants: (props?: ({
    size?: "sm" | "md" | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
export type VimAppPillSize = NonNullable<VariantProps<typeof cyanPillVariants>['size']> | 'card';
export interface VimAppPillProps {
    size?: VimAppPillSize;
    className?: string;
}
/**
 * The "Vim App" pill — Domain Pills (vim-ai Design System). Sole place the
 * product asserts "Vim published this." `sm`/`md` read `--vim-app-pill-bg` /
 * `-border` / `-fg` with cyan fallbacks (set on an ancestor for brand heroes);
 * `card` is Badge `neutral` so it reads as one row with a category chip.
 * Legacy `vim-app-pill*` classes stay so Console hero selectors keep matching.
 */
export declare function VimAppPill({ size, className }: VimAppPillProps): import("react/jsx-runtime").JSX.Element;
export declare namespace VimAppPill {
    var displayName: string;
}
export {};
