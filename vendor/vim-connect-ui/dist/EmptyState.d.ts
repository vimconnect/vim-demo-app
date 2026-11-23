import React from 'react';
import { type VariantProps } from 'class-variance-authority';
import { BLUEPRINTS, type EmptyStateBlueprintName } from './emptyStateBlueprints.js';
/**
 * Design-system empty state — vim-ai `Design System.html` → Empty State
 * Blueprints, plus the Console's compact icon-tile variant.
 *
 * Two looks, same copy rules (DS): a title that names what's missing, then one
 * plain sentence saying what will appear or what to do. No apologies,
 * exclamation marks or jokes.
 * - `blueprint`: one of the 15 DS illustrations (320×240 viewBox, on theme
 *   tokens, one motion cue, still under prefers-reduced-motion).
 * - `blueprintSize`: `md` (default, 320px wide) or `sm` (168px — narrow panels).
 * - `blueprintTransparent`: no ground fill or frame border, for a panel with its own background.
 * - `icon`: an 88px cyan icon tile (the Console's long-standing look) for
 *   compact places.
 *
 * Rendered inside a static card (shadow-only hover: the CTA is the clickable
 * thing, not the card); `bare` drops the card for a state that sits inside a
 * card the caller already built (e.g. under a table header).
 *
 * Classes mean the same in Tailwind v3 and v4: arbitrary values on DS tokens
 * only and no `!` important marker.
 */
declare const emptyStateBlueprintVariants: (props?: ({
    size?: "sm" | "md" | null | undefined;
    transparent?: boolean | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
export type EmptyStateBlueprintSize = NonNullable<VariantProps<typeof emptyStateBlueprintVariants>['size']>;
export interface EmptyStateBlueprintProps {
    name: EmptyStateBlueprintName;
    /** `md` (default, 320px) or `sm` (168px) display width. */
    size?: EmptyStateBlueprintSize;
    /** No ground fill and no frame border: the drawing sits on the surface behind it (a gradient panel). */
    transparent?: boolean;
    className?: string;
}
/** One DS blueprint illustration on its own (decorative). */
export declare function EmptyStateBlueprint({ name, size, transparent, className }: EmptyStateBlueprintProps): import("react/jsx-runtime").JSX.Element;
export interface EmptyStateProps {
    /** One of the 15 DS blueprint illustrations. */
    blueprint?: EmptyStateBlueprintName;
    /** Blueprint display width: `md` (default, 320px) or `sm` (168px). */
    blueprintSize?: EmptyStateBlueprintSize;
    /** The blueprint without its ground fill and frame border, for a panel with its own background. */
    blueprintTransparent?: boolean;
    /** Compact alternative: an icon in the 88px cyan tile, passed bare. */
    icon?: React.ReactNode;
    /** A self-contained graphic of the caller's own, shown as is (no tile). */
    illustration?: React.ReactNode;
    /** Names what's missing. Defaults to the blueprint's own DS title. */
    title?: React.ReactNode;
    /** One plain sentence: what will appear, or what to do. Defaults to the blueprint's DS line. */
    description?: React.ReactNode;
    /** The action, e.g. a primary `Button`. */
    action?: React.ReactNode;
    /** No card around it, for a state inside a card the caller already built. */
    bare?: boolean;
    className?: string;
}
/** Accent one word or phrase of a title in brand cyan, e.g. `No invitations <EmptyStateAccent>yet</EmptyStateAccent>`. */
export declare function EmptyStateAccent({ children }: {
    children: React.ReactNode;
}): import("react/jsx-runtime").JSX.Element;
export declare function EmptyState({ blueprint, blueprintSize, blueprintTransparent, icon, illustration, title, description, action, bare, className, }: EmptyStateProps): import("react/jsx-runtime").JSX.Element;
export { BLUEPRINTS as EMPTY_STATE_BLUEPRINTS };
export type { EmptyStateBlueprintName };
