import React from 'react';
/** What closed the panel: Escape, a click on the backdrop, or the header's close button. */
export type SidePanelCloseReason = 'escape' | 'backdrop' | 'close-button';
export interface SidePanelProps {
    isOpen: boolean;
    /** Called with what closed it; callers that do not care can ignore the argument. */
    onClose: (reason: SidePanelCloseReason) => void;
    children: React.ReactNode;
    /** CSS width value. Default `min(460px, 100vw)`. */
    width?: string;
    /** Dimmed click-to-close backdrop. Default true. */
    showBackdrop?: boolean;
    /** Close on Escape. Default true; `false` also passes Escape to a layer below (a Modal). */
    closeOnEscape?: boolean;
    /** Pixels to clear at the viewport top (e.g. below a top bar). Default 0. */
    topOffset?: number;
    /** Default 'dialog'. Pass 'complementary' for a non-modal panel. */
    role?: string;
    /** Accessible name. Without it, the panel is named by its `SidePanelHeader` title. */
    ariaLabel?: string;
    /** Adjusts the panel surface (the DS card ground and left border by default). */
    panelClassName?: string;
    panelStyle?: React.CSSProperties;
    /**
     * Renders in place inside the nearest positioned ancestor instead of portalling to the
     * viewport: for a panel that lives inside another surface (an app panel in an iframe or a
     * resizable frame). The backdrop covers that ancestor only.
     */
    contained?: boolean;
}
/**
 * Side Panel (DS → Side Panel): a right-edge slide-in drawer on the DS card surface.
 * It owns the portal, position, width, surface, slide, backdrop and Escape; the
 * header, body and footer are the caller's `children`, normally `SidePanelHeader`,
 * `SidePanelBody` and `SidePanelFooter`.
 *
 * Portals to `document.body` so a page's stacking context can't trap it; `contained`
 * renders it in place instead, inside the nearest positioned ancestor. It joins
 * the floating-layer stack, so Escape closes the top-most surface first (a Select
 * open inside the panel closes before the panel does).
 *
 * The exit slide only runs while the caller keeps rendering `<SidePanel isOpen={false} />`;
 * mounting it only while open still slides in.
 */
export declare function SidePanel({ isOpen, onClose, children, width, showBackdrop, closeOnEscape, topOffset, role, ariaLabel, panelClassName, panelStyle, contained, }: SidePanelProps): import("react/jsx-runtime").JSX.Element;
export interface SidePanelHeaderProps {
    title: React.ReactNode;
    /** One line under the title. */
    subtitle?: React.ReactNode;
    /** Rendered beside the title, e.g. a status badge. */
    titleAddon?: React.ReactNode;
    /** Before the close button, e.g. an "Open full page" icon button (with its own tooltip). */
    actions?: React.ReactNode;
    /**
     * Defaults to the panel's own `onClose`, so the ×, Escape and the backdrop close the same way.
     * Outside a `SidePanel` with no `onClose`, there's nothing to close and no × is drawn.
     */
    onClose?: () => void;
    /** The close button's tooltip and accessible name. Default "Close". */
    closeLabel?: string;
    className?: string;
}
/**
 * The Side Panel header: title (+ subtitle and an addon beside it), optional actions, and the
 * ghost close button with its tooltip. The title names the panel unless the panel has `ariaLabel`.
 */
export declare function SidePanelHeader({ title, subtitle, titleAddon, actions, onClose, closeLabel, className, }: SidePanelHeaderProps): import("react/jsx-runtime").JSX.Element;
/** The Side Panel's scrolling body, between the header and an optional footer. */
export declare function SidePanelBody({ className, ...rest }: React.HTMLAttributes<HTMLDivElement>): import("react/jsx-runtime").JSX.Element;
/** The Side Panel footer, pinned under the body: actions right-aligned, main action last. */
export declare function SidePanelFooter({ className, ...rest }: React.HTMLAttributes<HTMLDivElement>): import("react/jsx-runtime").JSX.Element;
