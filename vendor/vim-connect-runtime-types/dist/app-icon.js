// Leaf module — zero imports, so the Console and the extension can both draw an
// app's icon fallback without pulling in the zod-based schema graph.
/**
 * The fallback for an app with no renderable icon: its initials on a colour
 * picked deterministically from the APP id. Every surface that lists apps (the
 * Console's cards and tables, the Hub's app menu) must seed it with the same id,
 * or one app shows a different colour on each.
 */
const hashString = (s) => {
    let h = 0;
    for (let i = 0; i < s.length; i++)
        h = ((h << 5) - h + s.charCodeAt(i)) | 0;
    return Math.abs(h);
};
const APP_ICON_PALETTE = [
    'linear-gradient(135deg, #6CCDEF 0%, #5390D9 100%)',
    'linear-gradient(135deg, #B0B5FF 0%, #8B5CF6 100%)',
    'linear-gradient(135deg, #34d399 0%, #10b981 100%)',
    'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
    'linear-gradient(135deg, #f87171 0%, #ef4444 100%)',
    'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
];
/**
 * The flat fill for each gradient above, same index and so the same hue per app:
 * the gradient's end stop. The shared `AppIcon` (`@vim-connect/ui`) draws flat;
 * the gradients stay for the surfaces not yet moved onto it (the Hub included).
 */
const APP_ICON_SOLID = ['#5390D9', '#8B5CF6', '#10b981', '#f59e0b', '#ef4444', '#3b82f6'];
export const paletteFor = (id) => APP_ICON_PALETTE[hashString(id) % APP_ICON_PALETTE.length];
/** The flat colour for this APP id — the same hue as `paletteFor`. */
const solidFor = (id) => APP_ICON_SOLID[hashString(id) % APP_ICON_SOLID.length];
export const initialsFromName = (name) => {
    const clean = name.trim();
    const plusMatch = clean.match(/^([A-Za-z])\+/);
    if (plusMatch)
        return `${plusMatch[1].toUpperCase()}+`;
    const parts = clean.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return clean.slice(0, 1).toUpperCase();
};
/** `appId` is the APP id — an installation or version id gives the same app another colour. */
export function appIconFallback(appId, appName) {
    return { initials: initialsFromName(appName), background: paletteFor(appId), solid: solidFor(appId) };
}
/** An icon value safe to use as an `<img src>`: http(s) or a `data:image/` URI. */
export function isRenderableIconUrl(url) {
    if (!url)
        return false;
    if (url.startsWith('data:image/'))
        return true;
    try {
        return ['http:', 'https:'].includes(new URL(url).protocol);
    }
    catch {
        return false;
    }
}
//# sourceMappingURL=app-icon.js.map