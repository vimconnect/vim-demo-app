import React from 'react';
/**
 * The compact empty state for a tab, panel or list body (vim-ai DS → Empty State → EmptyTab): an
 * optional icon or illustration, a title and one line, smaller than `EmptyState` and never with an
 * action button (a state that needs one is `EmptyState`). `bare` drops the card for a state inside
 * a card the caller already drew.
 */
export interface EmptyTabProps {
    /** An icon component, shown in the cyan tile. Pass `icon` or `illustration`, not both. */
    icon?: React.ComponentType<{
        className?: string;
        style?: React.CSSProperties;
    }>;
    /** A self-contained graphic (a blueprint illustration), shown as is. */
    illustration?: React.ReactNode;
    /** Names what's missing. */
    title: React.ReactNode;
    /** One plain sentence: what will appear here, or what to do (a sentence, never a button). */
    body?: React.ReactNode;
    /** No card around it, for a state inside a card the caller already built. */
    bare?: boolean;
    className?: string;
    'data-testid'?: string;
}
export declare function EmptyTab({ icon: Icon, illustration, title, body, bare, className, 'data-testid': testId }: EmptyTabProps): import("react/jsx-runtime").JSX.Element;
