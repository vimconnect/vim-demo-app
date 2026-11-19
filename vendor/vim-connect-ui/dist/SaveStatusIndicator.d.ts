/**
 * Autosave states, in the order they occur. `pending` is "typed, not saved yet"
 * (the debounce hasn't fired, or the form is dirty): it reads "Unsaved".
 */
export type SaveStatus = 'idle' | 'pending' | 'saving' | 'saved' | 'error';
export interface SaveStatusIndicatorProps {
    status: SaveStatus;
    /** Retry the failed write: an inline "Retry" link on `error`. Omit where a failed save can't be retried. */
    onRetry?: () => void;
    className?: string;
}
/**
 * Save Status Indicator (DS → Save Status Indicator): the autosave status line beside
 * what it reports on (a form title, a modal header). Renders nothing for `idle`, so a
 * caller can mount it unconditionally. A polite live region, so a screen reader hears
 * "Saved" or "Failed" without moving focus.
 */
export declare function SaveStatusIndicator({ status, onRetry, className }: SaveStatusIndicatorProps): import("react/jsx-runtime").JSX.Element | null;
