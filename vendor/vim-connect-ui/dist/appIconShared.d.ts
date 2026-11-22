/**
 * Each step's box: size and radius. The one source for the icon's own size
 * variants and for anything that must sit level with an icon of that step (a
 * "+N" badge beside a strip), via `appIconBox`.
 */
declare const BOX: {
    readonly xs: "size-[16px] rounded-[var(--radius-sm)]";
    readonly sm: "size-[24px] rounded-[var(--radius-base)]";
    readonly md: "size-[32px] rounded-[var(--radius-md)]";
    readonly lg: "size-[44px] rounded-[var(--radius-lg)]";
    readonly xl: "size-[64px] rounded-[var(--radius-2xl)]";
    readonly '2xl': "size-[88px] rounded-[var(--radius-2xl)]";
};
/** The size and radius classes of an App Icon step, for an element that must match it. */
export declare function appIconBox(size: keyof typeof BOX): string;
export declare const appIconVariants: (props?: ({
    size?: "sm" | "md" | "xs" | "lg" | "xl" | "2xl" | null | undefined;
    ring?: boolean | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
export {};
