'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Button } from './Button.js';
import { Modal } from './Modal.js';
import { Spinner } from './Spinner.js';
import { QuestionIcon } from './icons/QuestionIcon.js';
import { WarningIcon } from './icons/WarningIcon.js';
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
export function ConfirmDialog({ open, title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', variant = 'default', loading = false, onConfirm, onCancel, }) {
    const cancelRef = useRef(null);
    if (!open)
        return null;
    return (_jsx(Modal, { onClose: onCancel, title: title, icon: variant === 'default' ? _jsx(QuestionIcon, {}) : _jsx(WarningIcon, {}), iconTone: variant === 'danger' ? 'danger' : variant === 'warning' ? 'warning' : 'info', maxWidth: 448, closeOnBackdrop: true, busy: loading, initialFocusRef: cancelRef, testId: "confirm-dialog", footer: _jsxs(_Fragment, { children: [_jsx(Button, { ref: cancelRef, variant: "secondary", onClick: onCancel, disabled: loading, children: cancelLabel }), _jsxs(Button, { variant: variant === 'danger' ? 'danger' : 'accent', onClick: onConfirm, disabled: loading, "aria-busy": loading || undefined, children: [loading && _jsx(Spinner, { size: "xs" }), confirmLabel] })] }), children: _jsx("div", { className: "text-[length:var(--text-base)] leading-[1.5] [color:var(--color-text-secondary)]", children: message }) }));
}
const ConfirmContext = createContext(null);
/** Hosts one confirm dialog for the tree below; `useConfirmDialog()` opens it. */
export function ConfirmDialogProvider({ children, resetKey }) {
    const [pending, setPending] = useState(null);
    const pendingRef = useRef(pending);
    pendingRef.current = pending;
    const close = useCallback((ok) => {
        setPending((current) => {
            current?.resolve(ok);
            return null;
        });
    }, []);
    const confirm = useCallback((options) => new Promise((resolve) => {
        // A second request cancels the first. Functional form: two calls in one
        // tick don't see each other through state, and the first would leak.
        setPending((prev) => {
            prev?.resolve(false);
            return { ...options, resolve };
        });
    }), []);
    const firstReset = useRef(true);
    useEffect(() => {
        if (firstReset.current) {
            firstReset.current = false;
            return;
        }
        if (pendingRef.current)
            close(false);
    }, [resetKey, close]);
    // Unmounting resolves a pending dialog as cancelled so its caller never hangs.
    useEffect(() => () => pendingRef.current?.resolve(false), []);
    return (_jsxs(ConfirmContext.Provider, { value: confirm, children: [children, _jsx(ConfirmDialog, { open: pending !== null, title: pending?.title ?? '', message: pending?.message ?? '', confirmLabel: pending?.confirmLabel, cancelLabel: pending?.cancelLabel, variant: pending?.variant, onConfirm: () => close(true), onCancel: () => close(false) })] }));
}
/** `await confirm({ title, message, variant })` resolves true on confirm, false otherwise. */
export function useConfirmDialog() {
    const ctx = useContext(ConfirmContext);
    if (!ctx)
        throw new Error('useConfirmDialog must be used inside <ConfirmDialogProvider>');
    return ctx;
}
/** Null outside a provider, for hooks that also render without one. */
export function useOptionalConfirmDialog() {
    return useContext(ConfirmContext);
}
