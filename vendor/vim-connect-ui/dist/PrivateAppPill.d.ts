import React from 'react';
import { type VariantProps } from 'class-variance-authority';
/**
 * Why this private app is on screen at all. The shared half of the tooltip is
 * the same everywhere — it is not listed, nobody can browse or request it —
 * but "then why am I looking at it" differs per surface.
 */
export type PrivateAppReason = 
/** On the account's own Marketplace/Applications grid because it is installed. */
'installed'
/** On the Vim account, whose catalog is the whole platform. */
 | 'vim-account'
/** Offered in an invite picker / listed on an invitation. */
 | 'distributable';
export declare const privateAppTooltip: (reason: PrivateAppReason) => string;
declare const privateAppPillSize: (props?: ({
    size?: "sm" | "card" | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
export type PrivateAppPillSize = NonNullable<VariantProps<typeof privateAppPillSize>['size']> | 'banner';
export interface PrivateAppPillProps {
    reason: PrivateAppReason;
    size?: PrivateAppPillSize;
    className?: string;
}
/**
 * Marks an app its developer made private — Domain Pills (vim-ai Design System).
 * Amber so it survives a glance across a grid of otherwise identical cards.
 * `sm`/`card` paint through Badge `warning`; `banner` is pinned over card artwork
 * and stays theme-invariant (literal colours) because it sits on developer media.
 * Legacy `private-app-pill*` classes stay so Console selectors (e.g. AppCard banner
 * z-index) keep matching.
 */
export declare const PrivateAppPill: React.FC<PrivateAppPillProps>;
export {};
