/**
 * A person's initials: two words → their first letters ("Dana Levi" → "DL"); one
 * word → up to two letters ("Alice" → "AL", "A" → "A"); no name, or a name equal
 * to the email → the email's local-part letters ("asaf+m9@…" → "AS"); else "?".
 */
export declare function avatarInitials(name?: string | null, email?: string | null): string;
export declare const firstLetter: (s: string) => string;
export declare const avatarVariants: (props?: ({
    size?: "sm" | "md" | "xs" | "lg" | "xl" | null | undefined;
    ring?: boolean | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
