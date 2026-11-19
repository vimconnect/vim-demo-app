import React from 'react';
/**
 * Design-system modal — vim-ai `Design System.html` → Modal, with the
 * Console's `.modal-*` anatomy (header icon tile + title + subtitle + close,
 * pinned footer).
 *
 * DS rules it enforces:
 * - The scrim covers the ENTIRE screen (`fixed inset-0`, sidebar and header
 *   included) at `--z-modal`, never a region beside the sidebar.
 * - The sheet keeps a clear margin from every edge: the overlay's
 *   `--space-lg` padding plus the sheet's `max-height: 100%`.
 * - Header = icon + title (+ subtitle) + close, nothing else. Record actions
 *   go in the footer, right-aligned at their natural width; a destructive one
 *   on the left. The footer wraps rather than clips, so every action stays
 *   reachable on a narrow sheet.
 *
 * Backdrop clicks do NOT close by default: modals hold in-progress input, and
 * an accidental outside click used to discard it (#6561). Close via the X,
 * a footer Cancel, or Escape.
 *
 * Classes mean the same in Tailwind v3 and v4: arbitrary values on DS tokens
 * only (plus the DS sheet shadow, copied verbatim) and no `!` marker.
 */
export interface ModalProps {
    /** Called from the close button, Escape, and (if enabled) a backdrop click. */
    onClose: () => void;
    title: React.ReactNode;
    /** One line under the title. */
    subtitle?: React.ReactNode;
    /** Header icon, passed bare (the tile sizes it 20px and colours it). */
    icon?: React.ReactNode;
    /** Rendered beside the title, e.g. a staff-only chip. */
    titleAddon?: React.ReactNode;
    /** Button row, pinned below the body with a divider. Omit for a pure viewer. */
    footer?: React.ReactNode;
    children?: React.ReactNode;
    /** Sheet max width in px. Default 560. */
    maxWidth?: number;
    /**
     * Scroll the body inside a viewport-capped sheet (header and footer stay put).
     * Off by default so in-place popovers can extend past the sheet edge;
     * portalled ones (Select, DateTimePicker) work either way.
     */
    scroll?: boolean;
    /** Close on a backdrop click. Default false (see above). */
    closeOnBackdrop?: boolean;
    /** Accessible name when the title isn't plain text. Defaults to the title. */
    ariaLabel?: string;
    /** Extra classes on the sheet. */
    className?: string;
    /** Extra classes on the body (e.g. its own padding or gap). */
    bodyClassName?: string;
    /** Header tile tint. Default info (cyan tile, blue glyph). */
    iconTone?: ModalIconTone;
    /** While true, the close button, Escape and backdrop can't close it (e.g. mid-submit). */
    busy?: boolean;
    /** Element to focus on open (e.g. the Cancel of a confirm). Default: the dialog itself. */
    initialFocusRef?: React.RefObject<HTMLElement | null>;
    /**
     * Status beside the close button (e.g. a save indicator), outside the title
     * heading. Keep it to status: record actions belong in the footer (DS).
     */
    headerAside?: React.ReactNode;
    /** `data-testid` on the dialog element. */
    testId?: string;
}
export type ModalIconTone = 'info' | 'warning' | 'danger' | 'success' | 'purple';
export declare function Modal({ onClose, title, subtitle, icon, titleAddon, footer, children, maxWidth, scroll, closeOnBackdrop, ariaLabel, className, bodyClassName, iconTone, busy, initialFocusRef, headerAside, testId, }: ModalProps): React.ReactPortal;
