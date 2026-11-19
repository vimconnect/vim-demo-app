import React from 'react';
import type { LucideIcon } from 'lucide-react';
export interface SectionIconBadgeProps {
    /** The one Lucide icon: the component (`icon={Users}`) or an element (`icon={<Users />}`), sized by the badge. */
    icon: LucideIcon | React.ReactNode;
    /** `section` (default) is the 20px badge before a sub-heading; `card` is the 28px badge before a card's own title. Every card on a screen uses the same one. */
    size?: 'section' | 'card';
    className?: string;
}
/**
 * The icon in front of a heading's text. Decorative: the heading says what the
 * section is. An icon that stands on its own (a stat, an empty state) is an `IconTile`.
 */
export declare function SectionIconBadge({ icon, size, className }: SectionIconBadgeProps): import("react/jsx-runtime").JSX.Element;
