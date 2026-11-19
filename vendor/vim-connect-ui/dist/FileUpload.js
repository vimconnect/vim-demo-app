import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useRef, useState } from 'react';
import { cva } from 'class-variance-authority';
import { Upload } from 'lucide-react';
import { cn } from './cn.js';
import { Spinner } from './Spinner.js';
import { markLabellable } from './labellable.js';
import { Button } from './Button.js';
import { DisabledTooltip } from './DisabledTooltip.js';
import { PaperclipIcon } from './icons/PaperclipIcon.js';
import { TrashIcon } from './icons/TrashIcon.js';
/**
 * File upload — a dashed drop zone that takes files by click, keyboard or drag,
 * and `FileItem`, the row for a file that's been picked or uploaded.
 *
 * The zone is a `<label>` around a visually hidden file input, so the input is
 * still in the tab order (Space / Enter opens the picker), works inside a form,
 * and takes `Field`'s label, help and error wiring like any other control. Drop
 * a file on it or click it. It filters what arrives by `accept` and `maxSize`
 * and hands the rest to `onFiles`; what it refused goes to `onReject`, so the
 * caller can show why in `Field`'s error.
 *
 * Two sizes: `default`, one row (icon, label, hint), for a form field; `lg`, a
 * centred panel for a page or modal whose main job is the upload.
 *
 * Classes mean the same in Tailwind v3 and v4: arbitrary values on DS tokens
 * only and no `!` important marker.
 */
const zoneVariants = cva([
    'group relative flex min-w-0 [box-sizing:border-box] cursor-pointer select-none',
    'rounded-[var(--radius-md)] border-[1.5px] border-dashed [border-color:var(--color-border-medium)]',
    '[background:var(--color-bg-elevated)] [font-family:var(--font-sans)]',
    '[transition:border-color_var(--transition-base),background-color_var(--transition-base),box-shadow_var(--transition-base)]',
    'hover:[border-color:var(--color-cyan-40)]',
    'has-[input:focus-visible]:[border-color:var(--color-cyan-40)] has-[input:focus-visible]:[box-shadow:var(--shadow-focus)]',
].join(' '), {
    variants: {
        size: {
            default: 'items-center gap-[10px] px-[var(--space-md)] py-[12px]',
            lg: 'flex-col items-center justify-center gap-[var(--space-sm)] px-[var(--space-lg)] py-[var(--space-xl)] text-center',
        },
        state: {
            idle: '',
            dragging: '[border-color:var(--color-cyan)] [background:var(--color-cyan-05)] hover:[border-color:var(--color-cyan)]',
            busy: 'cursor-progress opacity-[0.6] hover:[border-color:var(--color-border-medium)]',
            disabled: 'cursor-not-allowed opacity-[0.55] hover:[border-color:var(--color-border-medium)]',
        },
        invalid: {
            true: '[border-color:var(--color-error)] hover:[border-color:var(--color-error)] has-[input:focus-visible]:[border-color:var(--color-error)] has-[input:focus-visible]:[box-shadow:0_0_0_3px_color-mix(in_srgb,var(--color-error)_25%,transparent)]',
            false: '',
        },
    },
    defaultVariants: { size: 'default', state: 'idle', invalid: false },
});
/** Does `file` match an `accept` string (".pdf,image/*,application/json")? */
export function fileMatchesAccept(file, accept) {
    if (!accept)
        return true;
    const name = file.name.toLowerCase();
    const type = (file.type || '').toLowerCase();
    return accept
        .split(',')
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean)
        .some((rule) => {
        if (rule.startsWith('.'))
            return name.endsWith(rule);
        if (rule.endsWith('/*'))
            return type.startsWith(rule.slice(0, -1));
        return type === rule;
    });
}
/** 1.2 MB, 340 KB, 12 B — what `FileItem` shows by default. */
export function formatFileSize(bytes) {
    if (!Number.isFinite(bytes) || bytes < 0)
        return '';
    if (bytes < 1024)
        return `${bytes} B`;
    if (bytes < 1024 * 1024)
        return `${Math.max(1, Math.round(bytes / 1024))} KB`;
    const mb = bytes / (1024 * 1024);
    return `${mb < 10 ? mb.toFixed(1) : Math.round(mb)} MB`;
}
export const FileUpload = React.forwardRef(function FileUpload({ onFiles, onReject, accept, multiple = false, maxFiles, maxSize, label, hint, size = 'default', uploading = false, uploadingLabel = 'Uploading…', disabled = false, invalid = false, id, name, className, 'aria-describedby': describedBy, 'aria-invalid': ariaInvalid, 'aria-label': ariaLabel, }, ref) {
    const [dragging, setDragging] = useState(false);
    // dragenter/leave fire for every child the pointer crosses; count them.
    const depth = useRef(0);
    const blocked = disabled || uploading;
    const isInvalid = invalid || ariaInvalid === true;
    const take = (list) => {
        if (!list || list.length === 0)
            return;
        const accepted = [];
        const rejected = [];
        const limit = multiple ? (maxFiles ?? Infinity) : 1;
        for (const file of Array.from(list)) {
            if (!fileMatchesAccept(file, accept))
                rejected.push({ file, reason: 'type' });
            else if (maxSize != null && file.size > maxSize)
                rejected.push({ file, reason: 'size' });
            else if (accepted.length >= limit)
                rejected.push({ file, reason: 'count' });
            else
                accepted.push(file);
        }
        if (accepted.length)
            onFiles(accepted);
        if (rejected.length)
            onReject?.(rejected);
    };
    // Every file drag is cancelled here, blocked or not: an uncancelled drop opens the file in the tab.
    const onDragEnter = (e) => {
        if (!e.dataTransfer?.types?.includes('Files'))
            return;
        e.preventDefault();
        if (blocked)
            return;
        depth.current += 1;
        setDragging(true);
    };
    const onDragOver = (e) => {
        if (!e.dataTransfer?.types?.includes('Files'))
            return;
        e.preventDefault();
        e.dataTransfer.dropEffect = blocked ? 'none' : 'copy';
    };
    const onDragLeave = () => {
        depth.current = Math.max(0, depth.current - 1);
        if (depth.current === 0)
            setDragging(false);
    };
    const onDrop = (e) => {
        e.preventDefault();
        depth.current = 0;
        setDragging(false);
        if (!blocked)
            take(e.dataTransfer?.files);
    };
    const state = disabled ? 'disabled' : uploading ? 'busy' : dragging ? 'dragging' : 'idle';
    const main = uploading ? uploadingLabel : (label ?? (multiple ? 'Upload files' : 'Upload a file'));
    const lg = size === 'lg';
    return (_jsxs("label", { "data-ui": "file-upload", "data-state": state, className: cn(zoneVariants({ size, state, invalid: isInvalid }), className), onDragEnter: onDragEnter, onDragOver: onDragOver, onDragLeave: onDragLeave, onDrop: onDrop, children: [_jsx("span", { className: cn('inline-flex shrink-0 items-center justify-center [color:var(--color-text-muted)]', 'group-data-[state=dragging]:[color:var(--color-cyan-text)]', lg && 'size-[40px] rounded-full [background:var(--color-cyan-10)] [color:var(--color-cyan-text)]'), children: uploading ? _jsx(Spinner, { size: "xs", className: lg ? 'size-[18px]' : undefined }) : _jsx(Upload, { size: lg ? 20 : 16, "aria-hidden": "true" }) }), _jsxs("span", { className: cn('min-w-0', lg ? 'flex flex-col gap-[2px]' : 'flex flex-wrap items-baseline gap-x-[var(--space-sm)]'), children: [_jsx("span", { className: "text-[length:var(--text-sm)] [font-weight:var(--font-medium)] [color:var(--color-text-secondary)]", children: main }), hint != null && !uploading && (_jsx("span", { className: "text-[length:var(--text-sm)] [color:var(--color-text-muted)]", children: hint }))] }), _jsx("input", { "data-ui": "file-upload-input", ref: ref, id: id, name: name, type: "file", accept: accept, multiple: multiple, disabled: blocked, "aria-describedby": describedBy, "aria-invalid": isInvalid || undefined, "aria-label": ariaLabel, "aria-busy": uploading || undefined, className: "absolute size-px overflow-hidden whitespace-nowrap opacity-0 [clip:rect(0,0,0,0)] [clip-path:inset(50%)]", onChange: (e) => {
                    take(e.target.files);
                    // Let the same file be picked again after a remove.
                    e.target.value = '';
                } })] }));
});
// Keep: lets Field / FormRow tie their label to this control (it forwards id and aria-describedby).
markLabellable(FileUpload);
/** A picked or uploaded file: thumbnail, name, size, actions. */
export function FileItem({ name, size, meta, preview, icon, onRemove, removeLabel, uploading = false, disabled = false, actions, className, ...rest }) {
    const second = meta ?? (size != null ? formatFileSize(size) : null);
    return (_jsxs("div", { "data-ui": "file-item", className: cn('flex min-w-0 items-center gap-[10px] p-[var(--space-sm)] rounded-[var(--radius-lg)]', 'border border-solid [border-color:var(--glass-border-raised)] [background:var(--glass-bg-raised)]', '[font-family:var(--font-sans)]', className), "aria-busy": uploading || undefined, ...rest, children: [_jsx("span", { "aria-hidden": "true", className: "inline-flex size-[36px] shrink-0 items-center justify-center overflow-hidden rounded-[var(--radius-md)] [background:var(--glass-bg-float)] [color:var(--color-text-muted)]", children: uploading ? (_jsx(Spinner, { size: "xs" })) : preview ? (_jsx("img", { src: preview, alt: "", className: "block size-full object-cover" })) : ((icon ?? _jsx(PaperclipIcon, { width: 16, height: 16 }))) }), _jsxs("span", { className: "flex min-w-0 flex-1 flex-col", children: [_jsx("span", { className: "line-clamp-2 [overflow-wrap:anywhere] text-[length:var(--text-sm)] [color:var(--color-text-primary)]", children: name }), second != null && second !== '' && (_jsx("span", { className: "text-[length:var(--text-xs)] [color:var(--color-text-muted)]", children: uploading ? 'Uploading…' : second }))] }), actions, onRemove && (_jsx(DisabledTooltip, { label: "Remove", children: _jsx(Button, { type: "button", variant: "ghost-danger", size: "sm", iconOnly: true, "aria-label": removeLabel ?? `Remove ${name}`, onClick: onRemove, disabled: disabled || uploading, children: _jsx(TrashIcon, { width: 15, height: 15 }) }) }))] }));
}
