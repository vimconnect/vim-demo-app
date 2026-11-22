export interface HoverPanelState {
    open: boolean;
    /** `onMouseEnter` on the trigger AND on the panel — the panel's copy is what
     *  lets the pointer cross the gap between the two without it closing. */
    show: () => void;
    /** `onMouseLeave` on either: closes once the grace period elapses. */
    scheduleClose: () => void;
    /** Closes NOW — an outside click, Escape, or following a link out. */
    close: () => void;
    /** `onClick`, for touch and keyboard. Immediate in both directions: routing a
     *  click's dismiss through the grace makes the trigger look dead, because the
     *  pointer resting on it cancels the timer the click just started. */
    toggle: () => void;
}
export declare const useHoverPanel: (graceMs?: number) => HoverPanelState;
/**
 * The same gesture, for a strip where each trigger opens its OWN panel.
 *
 * `useHoverPanel` owns a boolean, which is right when one trigger has one panel.
 * The users table's pending-approval icons are a row of triggers sharing a single
 * panel slot, so what has to be tracked is WHICH one is open — and the pending
 * icons were click-only for exactly that reason, while the activated icons beside
 * them opened on hover. Two neighbouring icons in one strip behaving differently
 * reads as one of them being broken.
 *
 * A keyed variant rather than a second timer at the call site: the boolean hook's
 * own docblock records that hand-copying this gesture is how the earlier copies
 * drifted, and that applies to a keyed copy just as much.
 */
export interface KeyedHoverPanelState {
    /** The open trigger's key, or null. */
    openKey: string | null;
    /** `onMouseEnter`/`onFocus` on a trigger, and `onMouseEnter` on the panel —
     *  passing the key it belongs to, so crossing the gap keeps it open. */
    show: (key: string) => void;
    /** `onMouseLeave`/`onBlur` on either. */
    scheduleClose: () => void;
    close: () => void;
    /** `onClick`, for touch and keyboard: same key closes, a different key swaps. */
    toggle: (key: string) => void;
}
export declare const useKeyedHoverPanel: (graceMs?: number) => KeyedHoverPanelState;
