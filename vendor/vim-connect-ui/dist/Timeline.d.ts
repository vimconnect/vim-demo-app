import React from 'react';
export type TimelineTone = 'accent' | 'success' | 'warning' | 'error' | 'neutral';
export interface TimelineItem {
    /** Stable key. */
    id: string;
    /** What happened: "Sign-in succeeded", "Delivered". */
    title: React.ReactNode;
    /** One muted line under it: who, why, a reason. */
    meta?: React.ReactNode;
    /** When, already formatted ("Nov 17, 09:41"), shown on the right. */
    time?: React.ReactNode;
    /** The dot's colour, and the title's for `error`. Default `accent`. */
    tone?: TimelineTone;
    /** Still running: a spinner instead of the dot. */
    inFlight?: boolean;
}
export interface TimelineProps {
    items: readonly TimelineItem[];
    /** The list's accessible name ("Sign-in activity"). */
    'aria-label': string;
    /** Show this many, with a "Show all N" toggle for the rest. */
    limit?: number;
    className?: string;
}
/**
 * Timeline (DS → Timeline): what happened to one thing, in order — a request's status journal, a
 * bot's sign-ins. An ordered list on a `--color-border-medium` rail, one dot per event in its tone
 * (a spinner while it's still running), the title, a muted line, and the time on the right.
 * Give it the order you want read (newest first for activity, oldest first for a journal).
 *
 * Hooks: `data-ui="timeline"`, `timeline-item` (+ `data-tone`, `data-in-flight`).
 */
export declare function Timeline({ items, 'aria-label': ariaLabel, limit, className }: TimelineProps): import("react/jsx-runtime").JSX.Element;
