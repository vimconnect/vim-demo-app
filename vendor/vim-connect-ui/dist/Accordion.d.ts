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
interface AccordionItemBaseProps {
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
     * Controls of their own (a switch, a docs link, a "Clear" button), shown on the header row
     * just before the chevron. They sit outside the header button, so clicking one doesn't toggle
     * the item and each stays its own tab stop. Shown open or closed.
     */
    actions?: React.ReactNode;
    /**
     * Controls this item from outside: it is open exactly when `open` is true, and the header
     * asks `onOpenChange` instead of toggling itself. Use it when something else opens the item
     * (a count that grows). `single` and `defaultOpen` only govern the items left uncontrolled.
     */
    open?: boolean;
    /** Called with the state the header asks for, controlled or not. */
    onOpenChange?: (open: boolean) => void;
    className?: string;
    'data-testid'?: string;
}
export type AccordionItemProps = AccordionItemBaseProps & ({
    expandable?: true;
    children: React.ReactNode;
} | {
    /**
     * The same title row as a plain heading, with no button, chevron or body, for a section
     * with nothing to open yet (an empty history).
     */
    expandable: false;
    children?: React.ReactNode;
});
export declare function AccordionItem({ id, title, count, hint, aside, actions, open: openProp, onOpenChange, expandable, children, className, 'data-testid': testId, }: AccordionItemProps): import("react/jsx-runtime").JSX.Element;
export {};
