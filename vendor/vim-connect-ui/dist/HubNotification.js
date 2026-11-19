import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { isRenderableIconUrl } from '@vim-connect/runtime-types/app-icon';
import { Tooltip } from './Tooltip.js';
import { cn } from './cn.js';
const ACCENT = {
    info: 'var(--color-cyan)',
    success: 'var(--color-success)',
    warning: 'var(--color-warning)',
    critical: 'var(--color-error)',
};
/** A mask from a vetted URL (http(s) or `data:image/`), quoted as a CSS string. */
function maskStyle(url) {
    const value = `url(${JSON.stringify(url)})`;
    return {
        maskImage: value,
        WebkitMaskImage: value,
        maskSize: 'contain',
        WebkitMaskSize: 'contain',
        maskRepeat: 'no-repeat',
        WebkitMaskRepeat: 'no-repeat',
        maskPosition: 'center',
        WebkitMaskPosition: 'center',
    };
}
const FOOTER_BUTTON = 'border-0 px-[var(--space-md)] py-[13px] text-[length:var(--text-base)] [font-weight:var(--font-semibold)] leading-none cursor-pointer [font-family:var(--font-sans)] outline-none focus-visible:[box-shadow:inset_var(--shadow-focus)] [transition:all_var(--transition-fast)]';
/**
 * Hub Notification (DS → Hub Notification): the push card an app shows next to the
 * Vim Hub — app name and type dot, its icon or a thumbnail, a title and message,
 * up to two footer actions, and a top bar that drains while it waits.
 * For Console previews of the card; the extension draws its own on the EHR page.
 */
export function HubNotification({ appName, appIcon, imageUrl, title, text, type = 'info', buttons, onDismiss, onOpen, timeoutMs, className, }) {
    const accent = ACCENT[type];
    const draining = type !== 'critical' && !!timeoutMs && timeoutMs > 0;
    const Message = onOpen ? 'button' : 'div';
    const icon = isRenderableIconUrl(appIcon) ? appIcon : null;
    const thumb = isRenderableIconUrl(imageUrl) ? imageUrl : null;
    // The card owns its timer, so the dismissal and the bar's pause always agree.
    const [hovered, setHovered] = useState(false);
    const [focused, setFocused] = useState(false);
    const paused = hovered || focused;
    const remaining = useRef(timeoutMs ?? 0);
    // Fires once: a card the caller leaves mounted after it expires must not dismiss again.
    const expired = useRef(false);
    const onDismissRef = useRef(onDismiss);
    onDismissRef.current = onDismiss;
    useEffect(() => {
        // A new timeout starts the countdown over, as the bar's new animation does.
        remaining.current = timeoutMs ?? 0;
        expired.current = false;
    }, [timeoutMs]);
    useEffect(() => {
        if (!draining || paused || expired.current)
            return;
        const started = Date.now();
        const timer = setTimeout(() => {
            expired.current = true;
            onDismissRef.current?.();
        }, remaining.current);
        return () => {
            clearTimeout(timer);
            remaining.current = Math.max(0, remaining.current - (Date.now() - started));
        };
    }, [draining, paused, timeoutMs]);
    return (_jsxs("div", { "data-ui": "hub-notification", "data-type": type, role: type === 'critical' ? 'alert' : 'status', className: cn('relative w-[360px] max-w-full overflow-hidden rounded-[var(--radius-md)] text-left', 'border border-solid [border-color:var(--glass-border-raised)] [background:var(--color-bg-card)] [box-shadow:var(--glass-shadow-float)]', '[font-family:var(--font-sans)] text-[length:var(--text-base)] leading-[1.5] [color:var(--color-text-primary)]', '[transition:border-color_var(--transition-base),box-shadow_var(--transition-base),transform_var(--transition-base)]', 'hover:[border-color:var(--color-cyan-35)] motion-safe:hover:scale-[1.02]', className), style: { ['--hub-accent']: accent }, onMouseEnter: () => setHovered(true), onMouseLeave: () => setHovered(false), onFocus: () => setFocused(true), onBlur: (e) => {
            if (!e.currentTarget.contains(e.relatedTarget))
                setFocused(false);
        }, children: [_jsx("div", { "aria-hidden": "true", className: "absolute inset-x-0 top-0 h-[2px] overflow-hidden", children: _jsx("div", { "data-draining": draining ? (paused ? 'paused' : 'running') : undefined, className: cn('h-full w-full origin-left [background:var(--hub-accent)]', draining && 'motion-safe:[animation:hub-notification-drain_linear_forwards]'), style: draining ? { animationDuration: `${timeoutMs}ms`, animationPlayState: paused ? 'paused' : 'running' } : undefined }, timeoutMs) }), _jsxs("div", { className: "flex items-center justify-between gap-[var(--space-sm)] px-[var(--space-lg)] pt-[var(--space-md)]", children: [_jsxs("span", { className: "min-w-0 flex-1 truncate text-[length:var(--text-2xs)] [font-weight:var(--font-medium)] uppercase tracking-[0.08em] [color:var(--color-text-muted)]", children: [_jsx("span", { "aria-hidden": "true", className: "mr-[6px] inline-block size-[6px] rounded-full align-[1px] [background:var(--hub-accent)]" }), appName, type !== 'info' && _jsxs("span", { className: "sr-only", children: [" \u2014 ", type] })] }), onDismiss && (_jsx(Tooltip, { label: "Dismiss", children: _jsx("button", { "data-ui": "hub-notification-button", type: "button", "aria-label": "Dismiss", onClick: onDismiss, className: "inline-flex size-[24px] shrink-0 items-center justify-center rounded-full border-0 bg-transparent p-0 cursor-pointer [color:var(--color-text-muted)] hover:[background:var(--color-cyan-10)] hover:[color:var(--color-text-primary)] outline-none focus-visible:[box-shadow:var(--shadow-focus)]", children: _jsx(X, { "aria-hidden": "true", className: "size-[14px]" }) }) }))] }), _jsxs(Message, { ...(onOpen ? { type: 'button', onClick: onOpen, 'data-ui': 'hub-notification-message' } : {}), className: cn('grid w-full grid-cols-[32px_1fr] items-start gap-[var(--space-md)] border-0 bg-transparent px-[var(--space-lg)] pt-[var(--space-sm)] pb-[var(--space-lg)] text-left [font:inherit] [color:inherit]', onOpen && 'cursor-pointer outline-none focus-visible:[box-shadow:inset_var(--shadow-focus)]'), children: [thumb ? (_jsx("img", { src: thumb, alt: "", className: "size-[32px] rounded-[var(--radius-md)] object-cover border border-solid [border-color:var(--color-border-light)]" })) : (_jsx("span", { "aria-hidden": "true", className: "flex size-[32px] items-center justify-center rounded-[var(--radius-md)] border border-solid [border-color:var(--color-border-light)] [background:var(--glass-bg-base)]", children: icon ? (
                        // The hub draws an app's icon in one colour; a mask takes the text colour in both themes.
                        _jsx("span", { className: "block size-[22px] [background:var(--color-text-primary)]", style: maskStyle(icon) })) : (_jsx("span", { className: "text-[length:var(--text-sm)] [font-weight:var(--font-semibold)]", children: appName.trim().charAt(0).toUpperCase() || '?' })) })), _jsxs("span", { className: "min-w-0 pt-px", children: [title && (_jsx("span", { className: "mb-[3px] block text-[length:var(--text-lg)] [font-family:var(--font-title)] [font-weight:var(--font-semibold)] leading-[1.3]", children: title })), _jsx("span", { className: "block [color:var(--color-text-secondary)]", children: text })] })] }), buttons && buttons.length > 0 && (_jsx("div", { "data-buttons": buttons.length, className: cn('grid border-0 border-t border-solid [border-color:var(--color-border-light)] [background:var(--glass-bg-base)]', buttons.length === 2 ? 'grid-cols-2' : 'grid-cols-1'), children: buttons.map((b, i) => b.style === 'primary' ? (_jsx("button", { "data-ui": "hub-notification-button", type: "button", "data-variant": type === 'critical' ? 'acknowledge' : 'primary', onClick: b.onClick, className: cn(FOOTER_BUTTON, '[color:var(--color-text-on-gradient)] hover:[box-shadow:inset_0_0_0_9999px_rgba(0,0,0,0.10)]', type === 'critical' ? '[background:var(--color-error-text-strong)]' : '[background:var(--gradient-cta)]'), children: b.text }, i)) : (_jsx("button", { "data-ui": "hub-notification-button", type: "button", "data-variant": "link", onClick: b.onClick, className: cn(FOOTER_BUTTON, 'bg-transparent [color:var(--color-text-secondary)] hover:[color:var(--color-text-primary)] hover:[background:var(--color-cyan-05)]', i === 1 && buttons[0].style !== 'primary' && 'border-0 border-l border-solid [border-color:var(--color-border-light)]'), children: b.text }, i))) })), _jsx("style", { href: "vc-hub-notification-keyframes", precedence: "default", children: '@keyframes hub-notification-drain{from{transform:scaleX(1)}to{transform:scaleX(0)}}' })] }));
}
