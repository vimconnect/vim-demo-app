import React from 'react';
export interface AccordionProps {
    children: React.ReactNode;
    /** Only one item open at a time. Default false (each opens on its own). */
    single?: boolean;
    /** Items open on mount (their `id`s). */
    defaultOpen?: string[];
    className?: string;
}
/**
 * A stack of collapsible sections separated by hairlines. Each `AccordionItem`
 * is a full-width header button (title, optional count and hint, chevron on the
 * right) over its content. `single` keeps at most one open. An item given `open` is
 * controlled from outside (see `AccordionItemProps.open`).
 */
export declare function Accordion({ children, single, defaultOpen, className }: AccordionProps): import("react/jsx-runtime").JSX.Element;
export interface AccordionItemProps {
    /** Stable id within the accordion (also used by `defaultOpen`). */
    id: string;
    title: React.ReactNode;
    /** A count shown beside the title (e.g. how many items are inside). */
    count?: number;
    /** One muted line under the title. */
    hint?: React.ReactNode;
    /** Beside the title and count (a badge, a status); wraps under the title when narrow. Not a button: the whole header toggles. */
    aside?: React.ReactNode;
    /**
     * Controls this item from outside: it is open exactly when `open` is true, and the header
     * asks `onOpenChange` instead of toggling itself. Use it when something else opens the item
     * (a count that grows). `single` and `defaultOpen` only govern the items left uncontrolled.
     */
    open?: boolean;
    /** Called with the state the header asks for, controlled or not. */
    onOpenChange?: (open: boolean) => void;
    children: React.ReactNode;
    className?: string;
    'data-testid'?: string;
}
export declare function AccordionItem({ id, title, count, hint, aside, open: openProp, onOpenChange, children, className, 'data-testid': testId, }: AccordionItemProps): import("react/jsx-runtime").JSX.Element;
