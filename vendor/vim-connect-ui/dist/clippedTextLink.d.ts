import type React from 'react';
/**
 * The link half of {@link TruncatedText} and {@link ClampedText}.
 *
 * Both components exist to reveal text that is cut off, and both do it by
 * listening for hover on the text element itself. That is what forces the link
 * onto the element rather than around it: inside a card, a full-card overlay
 * link lies between the pointer and the text, so the text must sit ABOVE the
 * overlay to be hoverable at all — and anything above the overlay has taken the
 * card's click away from it. Raised text therefore has to carry the destination
 * itself. Wrapping it in an anchor is not an option either: clipped text is
 * focusable, so a wrapping anchor would nest two focusable elements and give
 * one string two tab stops (docs/adr/0026).
 */
export interface ClippedTextLinkProps {
    /** Renders an `<a>` instead of a `<div>`. */
    href?: string;
    /** Only reaches the DOM alongside `href`; there is no handler on the `<div>`. */
    onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
    /** Marks an `href` that repeats a link already announced next to it — a card's
     *  publisher line and description both go where its title link goes. It keeps
     *  the destination under the pointer without adding a tab stop for a place
     *  that already has one.
     *
     *  It has no effect while the text is clipped: focus is then the only way a
     *  keyboard user can reveal the full string, so the element stays focusable
     *  exactly when it has something extra to show. */
    secondaryLink?: boolean;
}
/**
 * `tabIndex` for the `<a>` branch. `undefined` leaves an anchor natively
 * focusable — the right answer for a primary link, and for any clipped text.
 */
export declare function linkTabIndex({ secondaryLink, isClipped, }: {
    secondaryLink?: boolean;
    isClipped: boolean;
}): -1 | undefined;
/**
 * Dev-only: `onClick` is rendered on the `<a>` branch only, so passing it
 * without an `href` drops it silently — a control that looks wired and is not.
 * Warns once per mounted component.
 */
export declare function useWarnOnHandlerWithoutHref(component: string, { href, onClick }: ClippedTextLinkProps): void;
