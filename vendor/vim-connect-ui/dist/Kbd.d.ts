import React from 'react';
export interface KbdProps extends React.HTMLAttributes<HTMLElement> {
    /** The key or shortcut as the user sees it: "⌘K", "esc", "⇧⏎". */
    children: React.ReactNode;
}
/**
 * A keyboard key or shortcut shown in text ("⌘K", "esc"): a small bordered cap in
 * the sans font (the DS has no monospace face). Write a combination as one Kbd
 * ("⌘K"); write separate steps as separate Kbds ("↑↓ move ⏎ run").
 */
export declare const Kbd: React.ForwardRefExoticComponent<KbdProps & React.RefAttributes<HTMLElement>>;
