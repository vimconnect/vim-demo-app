import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Check, CheckCircle2 } from 'lucide-react';
import { cn } from './cn.js';
/** A step is done once the user has gone past it, even after going back to it; else it is current or still to come. */
export function stepStatus(index, current, reached = current) {
    if (index < reached)
        return 'completed';
    if (index === current)
        return 'active';
    return 'upcoming';
}
const TONE = {
    cyan: '[--step-tone:var(--color-cyan)] [--step-tone-text:var(--color-cyan-text)]',
    blue: '[--step-tone:var(--color-blue)] [--step-tone-text:var(--color-blue)]',
};
const FOCUS = 'focus-visible:outline-none focus-visible:[box-shadow:var(--shadow-focus)]';
/**
 * Stepper: where the user is in a short, ordered flow (a modal's steps,
 * onboarding). Done steps show a green check; the current step is tinted;
 * steps still to come are muted. Going back is a click on a reached step;
 * going forward is the flow's own Next button.
 */
export function Stepper({ steps, current, reached = current, onStepClick, orientation = 'horizontal', tone = 'cyan', caption, 'aria-label': ariaLabel, className, }) {
    const vertical = orientation === 'vertical';
    const captionOf = caption ?? ((i) => (vertical ? String(i + 1).padStart(2, '0') : `Step ${i + 1}`));
    return (_jsx("ol", { "aria-label": ariaLabel, "data-ui": "stepper", "data-orientation": orientation, className: cn('m-0 p-0 list-none flex', vertical ? 'flex-col gap-[var(--space-xs)] [--step-tile:30px]' : 'gap-[var(--space-sm)]', TONE[tone], className), children: steps.map((step, i) => {
            const status = stepStatus(i, current, reached);
            const navigable = !!onStepClick && i !== current && i <= reached;
            const isCurrent = i === current;
            const label = typeof step.label === 'string' ? step.label : undefined;
            const body = vertical ? (_jsxs(_Fragment, { children: [_jsx("span", { "aria-hidden": "true", className: cn('grid place-items-center shrink-0 size-[var(--step-tile)] rounded-[9px] border border-solid [&_svg]:size-[16px]', '[transition:background_200ms_ease,color_200ms_ease,box-shadow_200ms_ease,border-color_200ms_ease]', status === 'completed' && '[background:var(--color-success)] border-transparent [color:var(--color-text-on-gradient)]', status === 'active' && '[background:var(--step-tone)] border-transparent [color:var(--color-text-on-gradient)] [box-shadow:0_4px_10px_color-mix(in_srgb,var(--step-tone)_18%,transparent)]', status === 'upcoming' && '[background:var(--glass-bg-base)] [border-color:var(--color-border-light)] [color:var(--color-text-muted)]'), children: status === 'completed' ? _jsx(CheckCircle2, {}) : (step.icon ?? _jsx("span", { className: "text-[length:var(--text-xs)] [font-weight:var(--font-bold)]", children: i + 1 })) }), _jsxs("span", { className: "flex flex-col leading-[1.15] min-w-0", children: [_jsx("span", { className: cn('text-[10.5px] [font-weight:var(--font-bold)] tracking-[0.1em]', status === 'completed' ? '[color:var(--color-success)]' : status === 'active' ? '[color:var(--step-tone-text)]' : '[color:var(--color-text-subtle)]'), children: captionOf(i) }), _jsx("span", { className: cn('mt-[2px] text-[13.5px]', status === 'active'
                                    ? '[font-weight:var(--font-bold)] [color:var(--color-text-primary)]'
                                    : '[font-weight:var(--font-semibold)] [color:var(--color-text-secondary)]'), children: step.label })] })] })) : (_jsxs(_Fragment, { children: [_jsxs("span", { className: cn('flex items-center gap-[6px] text-[length:var(--text-xs)]', status === 'completed' ? '[color:var(--color-success-text)]' : status === 'active' ? '[color:var(--step-tone-text)]' : '[color:var(--color-text-muted)]'), children: [status === 'completed' && _jsx(Check, { "aria-hidden": "true", className: "size-[12px]" }), captionOf(i)] }), _jsx("span", { className: cn('block mt-[2px] text-[length:var(--text-lg)] [font-weight:var(--font-semibold)]', status === 'upcoming' ? '[color:var(--color-text-muted)]' : '[color:var(--color-text-primary)]'), children: step.label })] }));
            const itemClass = vertical
                ? cn('flex items-center gap-[var(--space-md)] w-full p-[var(--space-md)] rounded-[var(--radius-xl)] border border-solid text-left [font:inherit]', '[transition:background_200ms_ease,border-color_200ms_ease]', status === 'active'
                    ? '[background:color-mix(in_srgb,var(--step-tone)_8%,transparent)] [border-color:color-mix(in_srgb,var(--step-tone)_22%,transparent)]'
                    : 'bg-transparent border-transparent')
                : cn('block w-full h-full text-left px-[12px] py-[9px] rounded-[var(--radius-md)] border border-solid [font:inherit]', '[transition:background_200ms_ease,border-color_200ms_ease]', isCurrent
                    ? '[background:color-mix(in_srgb,var(--step-tone)_8%,transparent)] [border-color:color-mix(in_srgb,var(--step-tone)_50%,transparent)]'
                    : 'bg-transparent [border-color:var(--glass-border-base)]');
            const hover = 'cursor-pointer hover:[background:color-mix(in_srgb,var(--step-tone)_6%,transparent)] hover:[border-color:color-mix(in_srgb,var(--step-tone)_20%,transparent)]';
            return (_jsxs("li", { className: cn('flex flex-col', !vertical && 'flex-1 min-w-0'), children: [navigable ? (_jsx("button", { type: "button", "data-ui": "stepper-step", "data-status": status, "aria-current": isCurrent ? 'step' : undefined, "aria-label": label ? `Go back to ${label}` : undefined, onClick: () => onStepClick(i), className: cn(itemClass, hover, FOCUS), children: body })) : (_jsx("div", { "data-ui": "stepper-step", "data-status": status, "aria-current": isCurrent ? 'step' : undefined, className: itemClass, children: body })), vertical && i < steps.length - 1 && (_jsx("span", { "aria-hidden": "true", className: cn('block w-[2px] h-[14px] rounded-[1px] ml-[calc(var(--space-md)+var(--step-tile)/2-1px)]', status === 'completed'
                            ? '[background:linear-gradient(180deg,var(--color-success),color-mix(in_srgb,var(--color-success)_30%,transparent))]'
                            : '[background:var(--color-border-light)]') }))] }, step.id));
        }) }));
}
