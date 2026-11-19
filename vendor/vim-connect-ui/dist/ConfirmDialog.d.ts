import React from 'react';
export type ConfirmDialogVariant = 'default' | 'warning' | 'danger';
export interface ConfirmDialogProps {
    open: boolean;
    title: React.ReactNode;
    /** The consequence, in one or two plain sentences. */
    message: React.ReactNode;
    /** Name the action ("Delete secret"), not "OK". Default "Confirm". */
    confirmLabel?: string;
    /** Default "Cancel". */
    cancelLabel?: string;
    /** `danger` for destructive confirms (red action, red icon); `warning` for risky but reversible. */
    variant?: ConfirmDialogVariant;
    /** The action is running: spinner on the confirm button, no way out until it ends. */
    loading?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}
/**
 * Confirm dialog — the design system's confirm step, built on `Modal`
 * (vim-ai `Design System.html` → Modal, "Buttons in modals").
 *
 * One question, one way out. Cancel is `secondary` and takes focus on open (the
 * safe button). The confirm action is `accent`, or `danger` for a destructive
 * confirm (delete, revoke, remove: "Every delete is red"). Escape, the close X
 * and a backdrop click all cancel; `loading` blocks every way out until the
 * action finishes.
 *
 * Use `ConfirmDialog` when the page owns the open state, or wrap the app in
 * `ConfirmDialogProvider` and `await confirm({...})` from `useConfirmDialog()`,
 * a drop-in for `window.confirm()` that resolves to a boolean.
 */
export declare function ConfirmDialog({ open, title, message, confirmLabel, cancelLabel, variant, loading, onConfirm, onCancel, }: ConfirmDialogProps): import("react/jsx-runtime").JSX.Element | null;
export type ConfirmOptions = Omit<ConfirmDialogProps, 'open' | 'loading' | 'onConfirm' | 'onCancel'>;
type Confirm = (options: ConfirmOptions) => Promise<boolean>;
export interface ConfirmDialogProviderProps {
    children: React.ReactNode;
    /**
     * A dialog left open when this changes resolves as cancelled. Pass the route
     * path so a confirm never survives navigation (the provider knows no router).
     */
    resetKey?: unknown;
}
/** Hosts one confirm dialog for the tree below; `useConfirmDialog()` opens it. */
export declare function ConfirmDialogProvider({ children, resetKey }: ConfirmDialogProviderProps): import("react/jsx-runtime").JSX.Element;
/** `await confirm({ title, message, variant })` resolves true on confirm, false otherwise. */
export declare function useConfirmDialog(): Confirm;
/** Null outside a provider, for hooks that also render without one. */
export declare function useOptionalConfirmDialog(): Confirm | null;
export {};
