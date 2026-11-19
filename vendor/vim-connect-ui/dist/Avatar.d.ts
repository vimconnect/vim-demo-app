import React from 'react';
import { type VariantProps } from 'class-variance-authority';
/**
 * A person's initials: two words → their first letters ("Dana Levi" → "DL"); one
 * word → up to two letters ("Alice" → "AL", "A" → "A"); no name, or a name equal
 * to the email → the email's local-part letters ("asaf+m9@…" → "AS"); else "?".
 */
export declare function avatarInitials(name?: string | null, email?: string | null): string;
declare const avatarVariants: (props?: ({
    size?: "sm" | "md" | "xs" | "lg" | "xl" | null | undefined;
    ring?: boolean | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
export type AvatarSize = NonNullable<VariantProps<typeof avatarVariants>['size']>;
export interface AvatarProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'> {
    /** The person's display name: their initials. */
    name?: string | null;
    /** Their email: the initials when there is no real name. */
    email?: string | null;
    /** A photo URL (http(s) or `data:image/`). Anything else, or a photo that fails to load, shows the initials. */
    src?: string | null;
    size?: AvatarSize;
    /** A 2px ring in the card colour, for avatars that overlap in a stack. */
    ring?: boolean;
    /** Announce the avatar (e.g. "Dana Levi"). Without it the avatar is decorative. */
    label?: string;
    loading?: 'lazy' | 'eager';
}
/** Avatar (DS → Avatar): a person's photo, or their initials on `--gradient-primary`. Apps use `AppIcon`. */
export declare function Avatar({ name, email, src, size, ring, label, loading, className, ...rest }: AvatarProps): import("react/jsx-runtime").JSX.Element;
export { avatarVariants };
