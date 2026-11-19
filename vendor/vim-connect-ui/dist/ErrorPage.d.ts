import React from 'react';
export type ErrorPageKind = 'not-found' | 'error' | 'access-denied' | 'offline';
export interface ErrorPageProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
    /** Picks the illustration and the default copy. */
    kind: ErrorPageKind;
    /** Overrides the default title ("Page not found", "Something went wrong"…). */
    title?: React.ReactNode;
    /** Overrides the default sentence: what happened, and what to do next. */
    description?: React.ReactNode;
    /** The way out: one primary `Button`, optionally a secondary one beside it. */
    actions?: React.ReactNode;
    /**
     * Technical detail, behind a closed "Error details" disclosure. Pass it only
     * where nothing sensitive can be in it (a dev build): error messages can carry
     * record values.
     */
    details?: string;
    /** Fill the viewport as the page's <main> (a route or an app-level crash; default), or sit in the space it's given as a <section> inside the layout's <main>. */
    fullScreen?: boolean;
    className?: string;
}
/**
 * A whole page that couldn't be shown: a missing route, a crash, no access, or
 * no connection. The Empty State look with the page's own heading, a plain
 * sentence on what to do, and the action that gets the user out.
 */
export declare function ErrorPage({ kind, title, description, actions, details, fullScreen, className, ...rest }: ErrorPageProps): import("react/jsx-runtime").JSX.Element;
