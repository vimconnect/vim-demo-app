import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useId } from 'react';
import { cva } from 'class-variance-authority';
import { Card } from './Card.js';
import { cn } from './cn.js';
import { BLUEPRINTS, BLUEPRINT_DEFS, BLUEPRINT_KEYFRAMES } from './emptyStateBlueprints.js';
/**
 * Design-system empty state — vim-ai `Design System.html` → Empty State
 * Blueprints, plus the Console's compact icon-tile variant.
 *
 * Two looks, same copy rules (DS): a title that names what's missing, then one
 * plain sentence saying what will appear or what to do. No apologies,
 * exclamation marks or jokes.
 * - `blueprint`: one of the 15 DS illustrations (320×240 viewBox, on theme
 *   tokens, one motion cue, still under prefers-reduced-motion).
 * - `blueprintSize`: `md` (default, 320px wide) or `sm` (168px — narrow panels).
 * - `icon`: an 88px cyan icon tile (the Console's long-standing look) for
 *   compact places.
 *
 * Rendered inside a static card (shadow-only hover: the CTA is the clickable
 * thing, not the card); `bare` drops the card for a state that sits inside a
 * card the caller already built (e.g. under a table header).
 *
 * Classes mean the same in Tailwind v3 and v4: arbitrary values on DS tokens
 * only and no `!` important marker.
 */
const emptyStateBlueprintVariants = cva('block w-full h-auto rounded-[16px] border border-solid [border-color:var(--color-cyan-15)]', {
    variants: {
        size: {
            md: 'max-w-[320px]',
            sm: 'max-w-[168px]',
        },
    },
    defaultVariants: { size: 'md' },
});
/** One DS blueprint illustration on its own (decorative). */
export function EmptyStateBlueprint({ name, size = 'md', className }) {
    const prefix = `es${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
    const scope = (s) => s.replace(/\bes(Grid|Bg|Glass|Ah|Frame)\b/g, `${prefix}$1`);
    const markup = `<style>${BLUEPRINT_KEYFRAMES} @media (prefers-reduced-motion: reduce) { [data-es="${prefix}"] * { animation: none !important; } }</style>` +
        `<defs>${scope(BLUEPRINT_DEFS)}</defs>` +
        scope(BLUEPRINTS[name].markup);
    return (_jsx("svg", { viewBox: "0 0 320 240", "data-es": prefix, "data-size": size, "aria-hidden": "true", focusable: "false", className: cn(emptyStateBlueprintVariants({ size }), className), 
        // Static, trusted DS markup generated from Design System.html (no user input).
        dangerouslySetInnerHTML: { __html: markup } }));
}
const ICON_TILE = [
    'flex items-center justify-center size-[88px] rounded-[24px] mb-[24px]',
    '[background:color-mix(in_srgb,var(--color-cyan)_15%,transparent)]',
    'border border-solid [border-color:var(--color-cyan-30)] [color:var(--color-cyan)]',
    '[&_svg]:size-[40px]',
].join(' ');
const TITLE = 'm-0 mb-[8px] [font-family:var(--font-title)] text-[length:var(--text-2xl)] [font-weight:var(--font-bold)] [color:var(--color-text-primary)]';
const DESCRIPTION = 'm-0 max-w-[440px] text-[length:var(--text-lg)] leading-[1.55] [color:var(--color-text-muted)]';
/** Accent one word or phrase of a title in brand cyan, e.g. `No invitations <EmptyStateAccent>yet</EmptyStateAccent>`. */
export function EmptyStateAccent({ children }) {
    return _jsx("span", { className: "[color:var(--color-cyan)]", children: children });
}
export function EmptyState({ blueprint, blueprintSize = 'md', icon, illustration, title, description, action, bare, className, }) {
    const bp = blueprint ? BLUEPRINTS[blueprint] : undefined;
    const content = (_jsxs("div", { className: cn('flex flex-col items-center text-center [font-family:var(--font-sans)]', bare ? 'px-[40px] pt-[48px] pb-[52px]' : '', className), children: [bp ? (_jsx(EmptyStateBlueprint, { name: blueprint, size: blueprintSize, className: "mb-[24px]" })) : illustration ? (_jsx("div", { className: "mb-[16px]", children: illustration })) : icon ? (_jsx("div", { className: ICON_TILE, "aria-hidden": "true", children: icon })) : null, _jsx("h3", { className: TITLE, children: title ?? bp?.title }), (description ?? bp?.description) && _jsx("p", { className: DESCRIPTION, children: description ?? bp?.description }), action && _jsx("div", { className: "mt-[28px]", children: action })] }));
    if (bare)
        return content;
    return (_jsx(Card, { hover: "shadow", className: "px-[40px] pt-[72px] pb-[76px]", children: content }));
}
export { BLUEPRINTS as EMPTY_STATE_BLUEPRINTS };
