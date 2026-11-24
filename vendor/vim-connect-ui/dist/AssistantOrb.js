'use client';
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
import { ASSISTANT_ORB_MORPH_MS } from './assistantOrbShared.js';
import { cn } from './cn.js';
/**
 * Assistant Orb (DS → Assistant Orb): the AI Assistant's mark, a morphing glass ball with two
 * counter-rotating swirls, a rim light and a glint. Decorative, so always `aria-hidden`.
 * Clicking the hero orb turns it liquid: it wobbles through blob shapes, its colours flow and
 * shift, the glass goes see-through while the inner currents swell, and the glint slides round;
 * then it springs back. Still under `prefers-reduced-motion`. Colours come from the `--orb-*`
 * tokens, which follow the theme.
 */
export function AssistantOrb({ size = 'hero', thinking = false, className }) {
    const hero = size === 'hero';
    const [morphs, setMorphs] = useState(0);
    const [morphing, setMorphing] = useState(false);
    const settle = useRef(null);
    useEffect(() => () => {
        if (settle.current)
            clearTimeout(settle.current);
    }, []);
    const morph = () => {
        setMorphs((n) => n + 1);
        setMorphing(true);
        if (settle.current)
            clearTimeout(settle.current);
        settle.current = setTimeout(() => setMorphing(false), ASSISTANT_ORB_MORPH_MS);
    };
    return (_jsxs(_Fragment, { children: [_jsx("span", { "data-ui": "assistant-orb", "data-size": size, "data-thinking": thinking || undefined, "data-morphing": morphing || undefined, "aria-hidden": "true", style: MORPH_DURATION, className: cn('vc-orb', `vc-orb--${size}`, thinking && 'vc-orb--thinking', morphing && 'vc-orb--morph', className), onClick: hero ? morph : undefined, children: _jsxs("span", { className: "vc-orb__glass", children: [_jsxs("span", { className: "vc-orb__inner", children: [_jsx("span", { className: "vc-orb__body" }), _jsx("span", { className: "vc-orb__swirl" }), _jsx("span", { className: "vc-orb__swirl2" }), hero && (_jsxs(_Fragment, { children: [_jsx("span", { className: "vc-orb__tint" }), _jsx("span", { className: "vc-orb__glow" })] }))] }), _jsx("span", { className: "vc-orb__rim" }), _jsx("span", { className: "vc-orb__shine" }), hero && _jsx("span", { className: "vc-orb__shine2" })] }, morphs) }), _jsx("style", { href: "vc-assistant-orb", precedence: "default", children: ORB_CSS })] }));
}
/** The morph's length for the CSS, from the same constant the timer uses. */
const MORPH_DURATION = { '--orb-morph-duration': `${ASSISTANT_ORB_MORPH_MS}ms` };
const ORB_CSS = `
.vc-orb { --orb-size: 18px; --orb-blur: 4px; position: relative; display: block; flex: none; width: var(--orb-size); height: var(--orb-size); -webkit-tap-highlight-color: transparent; }
.vc-orb--hero { --orb-size: 132px; --orb-blur: 12px; cursor: pointer; animation: vc-orb-float 6s ease-in-out infinite; }
.vc-orb--hero::after { content: ''; position: absolute; left: 14%; right: 14%; bottom: -26px; height: 16px; border-radius: 50%; background: var(--orb-floor); filter: blur(6px); animation: vc-orb-floor 6s ease-in-out infinite; }
.vc-orb__glass { position: absolute; inset: 0; isolation: isolate; border-radius: 50% 50% 48% 52% / 52% 48% 52% 48%; box-shadow: var(--orb-glass-shadow); animation: vc-orb-morph 8s ease-in-out infinite; transition: transform .35s cubic-bezier(.3,1.6,.5,1); }
.vc-orb__inner { position: absolute; inset: 0; overflow: hidden; border-radius: inherit; -webkit-mask-image: radial-gradient(#000, #000); mask-image: radial-gradient(#000, #000); }
.vc-orb__body { position: absolute; inset: 0; background: var(--orb-glass); }
.vc-orb--hero:hover .vc-orb__glass { transform: scale(1.06); }
.vc-orb--avatar .vc-orb__glass { box-shadow: var(--orb-mini-shadow); }
.vc-orb__swirl, .vc-orb__swirl2 { position: absolute; inset: -40%; filter: blur(var(--orb-blur)) saturate(1.35); }
.vc-orb__swirl { background: var(--orb-swirl); opacity: var(--orb-swirl-opacity); animation: vc-orb-spin 12s linear infinite; }
.vc-orb__swirl2 { inset: -10%; background: var(--orb-swirl2); opacity: var(--orb-swirl2-opacity); mix-blend-mode: screen; animation: vc-orb-spin 14s linear infinite reverse; }
.vc-orb--avatar .vc-orb__swirl { opacity: 1; }
.vc-orb__tint, .vc-orb__glow { position: absolute; pointer-events: none; opacity: 0; }
.vc-orb__tint { inset: -30%; background: var(--orb-morph-tint); filter: blur(var(--orb-blur)); }
.vc-orb__glow { inset: 0; background: var(--orb-morph-glow); mix-blend-mode: screen; }
.vc-orb__rim { position: absolute; inset: 0; border-radius: inherit; background: var(--orb-rim); pointer-events: none; }
.vc-orb--avatar .vc-orb__rim { background: var(--orb-mini-rim); }
.vc-orb__shine { position: absolute; top: 9%; left: 14%; width: 38%; height: 24%; border-radius: 50%; background: var(--orb-shine); transform: rotate(-32deg); filter: blur(1.5px); pointer-events: none; animation: vc-orb-glint 6s ease-in-out infinite; }
.vc-orb--avatar .vc-orb__shine { top: 12%; left: 16%; width: 40%; height: 26%; filter: none; }
.vc-orb__shine2 { position: absolute; right: 12%; bottom: 10%; width: 36%; height: 22%; border-radius: 50%; border-bottom: 3px solid var(--orb-shine2); transform: rotate(-38deg); filter: blur(1px); pointer-events: none; }
.vc-orb--thinking .vc-orb__swirl { animation-duration: 2.2s; }
.vc-orb--thinking .vc-orb__swirl2 { animation-duration: 3.4s; }
.vc-orb--thinking .vc-orb__glass { animation: vc-orb-morph 1.8s ease-in-out infinite, vc-orb-pulse 1.1s ease-in-out infinite; }
.vc-orb--morph .vc-orb__glass { animation: vc-orb-blob var(--orb-morph-duration) cubic-bezier(.45,0,.2,1); }
.vc-orb--morph .vc-orb__body { animation: vc-orb-clear var(--orb-morph-duration) ease-in-out; }
.vc-orb--morph .vc-orb__swirl { animation: vc-orb-spin 2.4s cubic-bezier(.3,0,.2,1) infinite, vc-orb-flow var(--orb-morph-duration) ease-in-out; }
.vc-orb--morph .vc-orb__swirl2 { animation: vc-orb-swell var(--orb-morph-duration) ease-in-out; }
.vc-orb--morph .vc-orb__tint { animation: vc-orb-tint var(--orb-morph-duration) ease-in-out, vc-orb-spin var(--orb-morph-duration) cubic-bezier(.4,0,.2,1); }
.vc-orb--morph .vc-orb__glow { animation: vc-orb-glow var(--orb-morph-duration) ease-in-out; }
.vc-orb--morph .vc-orb__shine { animation: vc-orb-slide var(--orb-morph-duration) cubic-bezier(.45,0,.2,1); }
@keyframes vc-orb-float { 50% { transform: translateY(-8px); } }
@keyframes vc-orb-floor { 0%, 100% { transform: scaleX(1); opacity: .9; } 50% { transform: scaleX(.78); opacity: .5; } }
@keyframes vc-orb-morph { 0%, 100% { border-radius: 50% 50% 48% 52% / 52% 48% 52% 48%; } 33% { border-radius: 47% 53% 52% 48% / 49% 53% 47% 51%; } 66% { border-radius: 53% 47% 49% 51% / 51% 47% 53% 49%; } }
@keyframes vc-orb-spin { to { transform: rotate(360deg); } }
@keyframes vc-orb-glint { 50% { opacity: .6; } }
@keyframes vc-orb-pulse { 50% { transform: scale(1.14); } }
@keyframes vc-orb-blob {
  0%, 100% { border-radius: 50% 50% 48% 52% / 52% 48% 52% 48%; transform: none; }
  12% { border-radius: 38% 62% 58% 42% / 60% 38% 62% 40%; transform: scale(1.09, .9); }
  27% { border-radius: 63% 37% 41% 59% / 38% 63% 37% 62%; transform: scale(.9, 1.1) rotate(7deg); }
  43% { border-radius: 42% 58% 64% 36% / 56% 42% 58% 44%; transform: scale(1.06, .95) rotate(-5deg); }
  60% { border-radius: 56% 44% 45% 55% / 45% 57% 43% 55%; transform: scale(.97, 1.04) rotate(2deg); }
  78% { border-radius: 48% 52% 53% 47% / 53% 47% 52% 48%; transform: scale(1.015, .99); }
}
@keyframes vc-orb-clear { 0%, 100% { opacity: 1; } 30%, 62% { opacity: .3; } }
@keyframes vc-orb-flow { 0%, 100% { filter: blur(var(--orb-blur)) saturate(1.35); opacity: var(--orb-swirl-opacity); } 35% { filter: blur(calc(var(--orb-blur) * .6)) saturate(1.9) hue-rotate(-40deg); opacity: 1; } 65% { filter: blur(calc(var(--orb-blur) * .6)) saturate(1.7) hue-rotate(35deg); opacity: 1; } }
@keyframes vc-orb-swell { 0% { opacity: var(--orb-swirl2-opacity); transform: scale(1) translate(0, 0) rotate(0deg); } 40% { opacity: 1; transform: scale(1.35) translate(-6%, 4%) rotate(-140deg); } 70% { opacity: .8; transform: scale(1.15) translate(5%, -5%) rotate(-250deg); } 100% { opacity: var(--orb-swirl2-opacity); transform: scale(1) translate(0, 0) rotate(-360deg); } }
@keyframes vc-orb-tint { 0%, 100% { opacity: 0; } 25%, 65% { opacity: .75; } }
@keyframes vc-orb-glow { 0%, 100% { opacity: 0; transform: scale(.6); } 40% { opacity: .7; transform: scale(1.05); } 70% { opacity: .25; transform: scale(1.2); } }
@keyframes vc-orb-slide { 0%, 100% { transform: rotate(-32deg); opacity: 1; } 30% { transform: translate(52%, 10%) rotate(-8deg) scale(.8, 1.1); opacity: .75; } 60% { transform: translate(18%, 148%) rotate(24deg) scale(.9); opacity: .55; } 85% { transform: translate(-6%, 8%) rotate(-40deg); opacity: .95; } }
@media (prefers-reduced-motion: reduce) { .vc-orb, .vc-orb *, .vc-orb::after { animation: none !important; transition: none; } }
`;
