import React from 'react';
import { type VariantProps } from 'class-variance-authority';
import { appIconVariants } from './appIconShared.js';
export type AppIconSize = NonNullable<VariantProps<typeof appIconVariants>['size']>;
export interface AppIconProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'> {
    /** The app's display name: its initials when there is no icon. */
    name: string;
    /** The APP id — seeds the fallback colour. Never an installation or version id. */
    appId: string;
    /** The icon URL (http(s) or `data:image/`). Anything else, or an image that
     *  fails to load, shows the initials. Resolve the listing → manifest order
     *  before passing it. */
    src?: string | null;
    size?: AppIconSize;
    /** A 2px ring in the card colour, for icons that overlap in a stack. */
    ring?: boolean;
    /** Announce the icon (e.g. "Scribe AI"). Without it the icon is decorative. */
    label?: string;
    loading?: 'lazy' | 'eager';
}
/**
 * App icon — a marketplace app's own icon on its white plate, or, when it has
 * none (or the image fails), its initials on a flat colour picked from the APP id.
 *
 * The one rule for every surface that lists apps (cards, tables, headers, modals,
 * the dashboard strip). The fallback comes from `appIconFallback` in
 * `@vim-connect/runtime-types/app-icon` (its `solid` colour: the same hue the
 * extension Hub's gradient uses), so one app is one colour everywhere — as long as every caller seeds it
 * with the APP id, never an installation or version id.
 *
 * The image sits on a fixed white plate (`--app-icon-plate`) in both themes:
 * most app icons are flat art drawn on a transparent canvas for a light
 * backdrop, and the DS rule is to show them as-is — never inverted or recoloured.
 *
 * Six sizes, each with its own radius so the shape stays an app tile, not a
 * circle, when small. `ring` adds a 2px ring in the card colour, for icons that
 * overlap in a stack.
 *
 * Decorative by default (`aria-hidden`), since the app's name almost always sits
 * beside it. Pass `label` when it stands alone and should be announced.
 *
 * Classes mean the same in Tailwind v3 and v4: arbitrary values on DS tokens only
 * and no `!` important marker.
 */
export declare function AppIcon({ name, appId, src, size, ring, label, loading, className, style, ...rest }: AppIconProps): import("react/jsx-runtime").JSX.Element;
