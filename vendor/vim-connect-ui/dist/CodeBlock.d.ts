import React from 'react';
export interface CodeBlockProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children' | 'onCopy'> {
    /** The text shown, as is: a script, a payload, `JSON.stringify(value, null, 2)`. Also what Copy copies. */
    code: string;
    /**
     * Shown in place of `code` when the text needs markup inside it (e.g. JSON lines with an inline
     * note). Keep it the same text as `code`, which stays what Copy copies.
     */
    children?: React.ReactNode;
    /** A short name for what this is ("JSON", "PowerShell"), shown small and uppercase in a header row. */
    label?: string;
    /**
     * What the user would copy ("script", "payload"). When set, the block gets a
     * Copy Button reading "Copy {copyLabel}": in the header row when there's a
     * `label`, otherwise in the body's top-right corner.
     */
    copyLabel?: string;
    /** Called once a copy settles, as the Copy Button's `onCopy` (the Console toasts). */
    onCopy?: (copied: boolean) => void;
    /** Caps the body's height (any CSS length, e.g. `'18rem'`); the body scrolls past it. */
    maxHeight?: string;
    /** Wrap long lines instead of scrolling sideways. For prose-like payloads in a narrow space. */
    wrap?: boolean;
    'data-testid'?: string;
}
/**
 * Code Block (DS → Code Block): a payload, script or JSON shown as text, on the
 * elevated surface with a light hairline. Plus Jakarta like the rest of the
 * product (no monospace face). One look in both themes: never a dark terminal
 * box on a light page. A `label` adds a header row (with the copy control, if
 * any); without one, the copy control sits in the body's top-right corner.
 * Spacing around the block is the caller's (a margin on `className`).
 */
export declare const CodeBlock: React.ForwardRefExoticComponent<CodeBlockProps & React.RefAttributes<HTMLDivElement>>;
