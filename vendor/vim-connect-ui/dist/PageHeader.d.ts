import React from 'react';
/**
 * The top of a page: optional breadcrumbs, the page's title heading with an optional
 * addon and the page's actions on the same line, then one subtitle line. Owns
 * the gap to the content; actions wrap under the title when narrow.
 */
/** Attributes for an element PageHeader draws, `data-*` included. */
type ElementProps<E extends HTMLElement> = React.HTMLAttributes<E> & {
    [key: `data-${string}`]: string | number | boolean | undefined;
};
export interface PageHeaderProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
    /** The page's name: the page's one `h1` by default, an `h2` with `headingLevel={2}`. */
    title: React.ReactNode;
    /** One sentence under the title saying what the page is for. */
    subtitle?: React.ReactNode;
    /** Right side of the title row: the page's main action (accent) and any secondary ones. */
    actions?: React.ReactNode;
    /** Beside the title, e.g. a staff-only note or a status badge. */
    titleAddon?: React.ReactNode;
    /** A `Breadcrumbs` trail, drawn first, above the title. */
    breadcrumbs?: React.ReactNode;
    /** Classes on the title heading (e.g. `break-all` for a long id). */
    titleClassName?: string;
    /** Attributes on the title heading (`data-*`, `id`, `tabIndex`, handlers). Its classes go in `titleClassName`. */
    titleProps?: Omit<ElementProps<HTMLHeadingElement>, 'className' | 'children'>;
    /** Wraps the title heading, e.g. `(heading) => <Tooltip label="…">{heading}</Tooltip>`; return the heading itself (or a clone of it) inside. */
    renderTitle?: (heading: React.ReactElement) => React.ReactNode;
    /** Attributes on the subtitle paragraph (`data-*`, `id`). */
    subtitleProps?: Omit<ElementProps<HTMLParagraphElement>, 'className' | 'children'>;
    /** `compact` for a narrow side panel: a smaller title and subtitle, tighter gaps. Default `default`. */
    size?: 'default' | 'compact';
    /** The title's heading level. Default 1 (the page's one `h1`); a view inside a larger page can use 2. */
    headingLevel?: 1 | 2;
}
export declare const PageHeader: React.ForwardRefExoticComponent<PageHeaderProps & React.RefAttributes<HTMLElement>>;
export {};
