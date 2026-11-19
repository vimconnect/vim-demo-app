export type HubNotificationType = 'info' | 'success' | 'warning' | 'critical';
export interface HubNotificationButton {
    text: string;
    /** `primary`: the filled action (red "acknowledge" on a critical card); `link`: the quiet one. */
    style?: 'primary' | 'link';
    onClick?: () => void;
}
export interface HubNotificationProps {
    /** The app that sent it: shown small and uppercase in the header. */
    appName: string;
    /** The app's hub icon (a colourless SVG/PNG URL): drawn in the text colour, as on the hub. */
    appIcon?: string | null;
    /** A thumbnail that replaces the icon. */
    imageUrl?: string | null;
    title?: string;
    text: string;
    /** Accent of the top bar and the header dot. Default `info`. */
    type?: HubNotificationType;
    /** Up to two footer actions, left then right. */
    buttons?: [HubNotificationButton] | [HubNotificationButton, HubNotificationButton];
    /** Called from the × button. */
    onDismiss?: () => void;
    /** Called when the card's message is clicked (opens the app). */
    onOpen?: () => void;
    /** Auto-dismiss: calls `onDismiss` after this many ms; the top bar drains over it. Paused while the
     *  card is hovered or holds focus (with reduced motion too, where the bar doesn't move). Ignored on `critical`. */
    timeoutMs?: number;
    className?: string;
}
/**
 * Hub Notification (DS → Hub Notification): the push card an app shows next to the
 * Vim Hub — app name and type dot, its icon or a thumbnail, a title and message,
 * up to two footer actions, and a top bar that drains while it waits.
 * For Console previews of the card; the extension draws its own on the EHR page.
 */
export declare function HubNotification({ appName, appIcon, imageUrl, title, text, type, buttons, onDismiss, onOpen, timeoutMs, className, }: HubNotificationProps): import("react/jsx-runtime").JSX.Element;
