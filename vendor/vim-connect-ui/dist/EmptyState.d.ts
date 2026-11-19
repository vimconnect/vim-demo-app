import React from 'react';
import { BLUEPRINTS, type EmptyStateBlueprintName } from './emptyStateBlueprints.js';
/**
 * Design-system empty state — vim-ai `Design System.html` → Empty State
 * Blueprints, plus the Console's compact icon-tile variant.
 *
 * Two looks, same copy rules (DS): a title that names what's missing, then one
 * plain sentence saying what will appear or what to do. No apologies,
 * exclamation marks or jokes.
 * - `blueprint`: one of the 15 DS illustrations (320×240, on theme tokens,
 *   one motion cue, still under prefers-reduced-motion).
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
export interface EmptyStateBlueprintProps {
    name: EmptyStateBlueprintName;
    className?: string;
}
/** One DS blueprint illustration on its own (decorative). */
export declare function EmptyStateBlueprint({ name, className }: EmptyStateBlueprintProps): import("react/jsx-runtime").JSX.Element;
export interface EmptyStateProps {
    /** One of the 15 DS blueprint illustrations. */
    blueprint?: EmptyStateBlueprintName;
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
export declare function EmptyState({ blueprint, icon, illustration, title, description, action, bare, className }: EmptyStateProps): import("react/jsx-runtime").JSX.Element;
export { BLUEPRINTS as EMPTY_STATE_BLUEPRINTS };
export type { EmptyStateBlueprintName };
