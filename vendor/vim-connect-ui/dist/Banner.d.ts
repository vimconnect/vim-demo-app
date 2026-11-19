import React from 'react';
import { type VariantProps } from 'class-variance-authority';
declare const bannerVariants: (props?: ({
    tone?: "error" | "purple" | "warning" | "info" | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
export type BannerTone = NonNullable<VariantProps<typeof bannerVariants>['tone']>;
export interface BannerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
    tone?: BannerTone;
    /** Replaces the built-in icon (16px, in the tone's text colour). `null` for none. */
    icon?: React.ReactNode | null;
    /** A semibold lead-in before the text ("What's New", "Mock data."). */
    title?: React.ReactNode;
    /** One action at the right, usually a `TextLink` ("See all changes", "Back to app"). */
    action?: React.ReactNode;
    /** Shows an × at the right that calls this; the caller removes the banner (and remembers it). */
    onDismiss?: () => void;
    /** Tooltip and accessible name of the ×. Default "Dismiss". */
    dismissLabel?: string;
}
/**
 * Banner (DS → Banner): a full-width strip across the top of the app frame that says what state the
 * product is in (news, a preview, mock data, a problem), as opposed to a `Notice`, which sits inside
 * the page. Goes in `AppShell`'s `banner` slot. Pair `role="status"` with news, `role="alert"` with a
 * problem.
 *
 * Hooks: `data-ui="banner"` (+ `data-tone`).
 */
export declare function Banner({ tone, icon, title, action, onDismiss, dismissLabel, className, children, ...rest }: BannerProps): import("react/jsx-runtime").JSX.Element;
export {};
