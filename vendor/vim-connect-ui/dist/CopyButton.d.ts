export interface CopyButtonProps {
    /** What lands on the clipboard. */
    value: string;
    /** What the user thinks they're copying ("App ID", "invite link"): the tooltip and accessible name read "Copy {label}". */
    label: string;
    /** Called once the copy settles: `true` when it landed, `false` when the browser refused (no clipboard, denied permission). */
    onCopy?: (copied: boolean) => void;
    /** Show the word "Copy" beside the icon (a secondary button) instead of the icon-only ghost button. */
    showLabel?: boolean;
    /** `sm` (default) for a value inline in text or a table; `default` beside a field. */
    size?: 'sm' | 'default';
    disabled?: boolean;
    className?: string;
    'data-testid'?: string;
}
/**
 * Copy Button (DS → Copy Button): copies `value`, then shows a check and
 * "Copied" for a moment. Icon-only ghost by default, always with a tooltip and
 * an accessible name; `showLabel` for the text button. When `navigator.clipboard`
 * is refused it falls back to `execCommand('copy')`. It never throws: when both
 * fail it reports `false` to `onCopy`, where a product can tell the user (the
 * Console toasts).
 */
export declare function CopyButton({ value, label, onCopy, showLabel, size, disabled, className, 'data-testid': testId, }: CopyButtonProps): import("react/jsx-runtime").JSX.Element;
