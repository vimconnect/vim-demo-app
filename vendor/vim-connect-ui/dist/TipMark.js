import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from './cn.js';
const SLABS = 9;
/** Front slab (0) cyan → blue at the middle → purple at the back, from the DS brand colours. */
function slabColor(i) {
    const t = i / (SLABS - 1);
    if (t <= 0.5)
        return `color-mix(in srgb, var(--color-blue) ${Math.round(t * 200)}%, var(--color-cyan))`;
    return `color-mix(in srgb, var(--color-purple) ${Math.round((t - 0.5) * 200)}%, var(--color-blue))`;
}
/** Keyframes and the registered angle for the slab swing (ships with the component, like the Skeleton's). */
const TIP_MARK_CSS = `
@property --vc-slab-r { syntax: '<angle>'; inherits: false; initial-value: 0deg; }
@keyframes vc-slab-twist {
  0%, 4% { --vc-slab-r: 0deg; }
  14% { --vc-slab-r: var(--k); }
  28% { --vc-slab-r: calc(var(--k) * -1); }
  40%, 54% { --vc-slab-r: 0deg; }
  64% { --vc-slab-r: calc(var(--k) * -1); }
  78% { --vc-slab-r: var(--k); }
  90%, 100% { --vc-slab-r: 0deg; }
}
@keyframes vc-slab-tint {
  0%, 4% { background: var(--vc-slab-gray); }
  34%, 54% { background: var(--c); }
  90%, 100% { background: var(--vc-slab-gray); }
}
.vc-slab { --vc-slab-gray: color-mix(in srgb, var(--color-text-primary) 28%, var(--color-bg-primary)); transform: translateZ(calc(var(--i) * -5.5px)) rotate(var(--vc-slab-r)); }
@media (prefers-reduced-motion: no-preference) {
  .vc-slab {
    background: var(--vc-slab-gray);
    animation: vc-slab-twist 10s cubic-bezier(0.45, 0, 0.25, 1) 0.3s infinite both, vc-slab-tint 10s ease-in-out 0.3s infinite both;
  }
}
`;
/**
 * Tip Mark (DS → Tip): a stack of nine thin square slabs in CSS 3D. It cycles grey → swings one
 * way then the other while turning cyan / blue / purple (front slab cyan, back slab purple) → holds →
 * runs back to grey with the opposite swing, forever. Under `prefers-reduced-motion` it shows the
 * settled gradient and never moves. Decorative, so `aria-hidden`; 80px square.
 */
export function TipMark({ className }) {
    return (_jsxs(_Fragment, { children: [_jsx("span", { "aria-hidden": "true", "data-ui": "tip-mark", className: cn('block size-[80px] shrink-0 [perspective:320px]', className), children: _jsx("span", { className: "relative block size-full [transform-style:preserve-3d] [transform:translateX(6px)_rotateX(-22deg)_rotateY(36deg)]", children: Array.from({ length: SLABS }, (_, i) => (_jsx("span", { className: "vc-slab absolute left-[20px] top-[20px] size-[40px] rounded-[3px] border border-solid border-[rgba(255,255,255,0.75)] [backface-visibility:hidden] [background:var(--c)]", style: {
                            '--i': i,
                            '--c': slabColor(i),
                            // Every slab swings, the front one included; deeper slabs swing further, which reads as a twist.
                            '--k': `${40 + i * 8}deg`,
                        } }, i))) }) }), _jsx("style", { href: "vc-tip-mark-keyframes", precedence: "default", children: TIP_MARK_CSS })] }));
}
