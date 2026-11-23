import React from 'react';
export interface IconTileProps extends React.HTMLAttributes<HTMLSpanElement> {
    /** Pick the size that matches the icon (roughly half the tile): `xs` 24px in a table cell, `sm` 36px (default) in a stat or list row, `md` 56px in an empty tab, `lg` 88px in an empty state. */
    size?: 'xs' | 'sm' | 'md' | 'lg';
    /**
     * The colour, only when the colour is the information (an EHR cell's read / write
     * / operation): a semantic token such as `var(--color-success)`. Fill 14%,
     * border 30%, icon at full. Default is the cyan tile.
     */
    tint?: string;
    /** Something not set up or active yet: the quiet glass tile with a muted icon. */
    muted?: boolean;
    /** The one Lucide icon. */
    children: React.ReactNode;
    /**
     * A status the tile's subject has reached (added, dismissed, deferred), shown as a solid
     * circle on the bottom-right corner with a white glyph (card-coloured on neutral), ringed in the card colour so it reads
     * as pinned on. The glyph is sized for the tile. Give `label` when nothing beside the tile
     * already says the status.
     */
    status?: IconTileStatus;
}
export interface IconTileStatus {
    tone: 'success' | 'error' | 'warning' | 'neutral';
    /** One Lucide icon (a check, an x, a clock). */
    icon: React.ReactNode;
    /** Names the status for screen readers; without it the overlay is decorative. */
    label?: string;
}
/**
 * Icon Tile (DS → Icon Tile): a rounded square holding one Lucide icon, a flat
 * single-hue tint with a matching hairline border. Never a gradient fill. The
 * icon keeps the size the caller gives it. `status` pins a status circle on its corner.
 */
export declare const IconTile: React.ForwardRefExoticComponent<IconTileProps & React.RefAttributes<HTMLSpanElement>>;
