export declare const paletteFor: (id: string) => string;
export declare const initialsFromName: (name: string) => string;
/** `appId` is the APP id — an installation or version id gives the same app another colour. */
export declare function appIconFallback(appId: string, appName: string): {
    initials: string;
    background: string;
    solid: string;
};
/** An icon value safe to use as an `<img src>`: http(s) or a `data:image/` URI. */
export declare function isRenderableIconUrl(url: string | null | undefined): boolean;
//# sourceMappingURL=app-icon.d.ts.map