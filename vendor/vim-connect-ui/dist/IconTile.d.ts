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
}
/**
 * Icon Tile (DS → Icon Tile): a rounded square holding one Lucide icon, a flat
 * single-hue tint with a matching hairline border. Never a gradient fill. The
 * icon keeps the size the caller gives it.
 */
export declare const IconTile: React.ForwardRefExoticComponent<IconTileProps & React.RefAttributes<HTMLSpanElement>>;
