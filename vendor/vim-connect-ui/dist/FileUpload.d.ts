import React from 'react';
import { type VariantProps } from 'class-variance-authority';
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
declare const zoneVariants: (props?: ({
    size?: "lg" | "default" | null | undefined;
    state?: "disabled" | "busy" | "idle" | "dragging" | null | undefined;
    invalid?: boolean | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
export type FileUploadSize = NonNullable<VariantProps<typeof zoneVariants>['size']>;
export type FileRejectReason = 'type' | 'size' | 'count';
export interface FileRejection {
    file: File;
    reason: FileRejectReason;
}
export interface FileUploadProps {
    /** Files that passed `accept`, `maxSize` and `maxFiles`. Never called with an empty list. */
    onFiles: (files: File[]) => void;
    /** Files it refused, and why. Show the reason in `Field`'s `error`. */
    onReject?: (rejections: FileRejection[]) => void;
    /** As the input's `accept`: extensions and MIME types, `image/*` allowed. Also enforced on drop. */
    accept?: string;
    multiple?: boolean;
    /** Most files one pick or drop may add (with `multiple`). The rest are rejected as `count`. */
    maxFiles?: number;
    /** Largest file, in bytes. */
    maxSize?: number;
    /** The main line. Default "Upload a file" / "Upload files". */
    label?: React.ReactNode;
    /** The muted line beside (default) or under (lg) it: what it takes. */
    hint?: React.ReactNode;
    size?: FileUploadSize;
    /** An upload is running: spinner, `uploadingLabel`, no new files. */
    uploading?: boolean;
    uploadingLabel?: React.ReactNode;
    disabled?: boolean;
    /** Error state (red border). `Field` sets it with `error`. */
    invalid?: boolean;
    id?: string;
    name?: string;
    className?: string;
    'aria-describedby'?: string;
    'aria-invalid'?: boolean;
    'aria-label'?: string;
}
export declare const FileUpload: React.ForwardRefExoticComponent<FileUploadProps & React.RefAttributes<HTMLInputElement>>;
export interface FileItemProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
    /** File name; a long one wraps to two lines, then truncates. */
    name: string;
    /** Size in bytes, shown as "1.2 MB". Ignored when `meta` is set. */
    size?: number;
    /** The second line instead of the size ("Uploaded 3 Nov · 1.2 MB"). */
    meta?: React.ReactNode;
    /** An image URL for the thumbnail. Otherwise `icon`, else a paperclip. */
    preview?: string;
    icon?: React.ReactNode;
    /** Shows the remove button (ghost-danger, tooltip "Remove"). */
    onRemove?: () => void;
    /** The remove button's accessible name. Default "Remove {name}". */
    removeLabel?: string;
    /** Spinner in the thumbnail; remove is disabled. */
    uploading?: boolean;
    disabled?: boolean;
    /** More actions before remove (a download link, a Replace button). */
    actions?: React.ReactNode;
}
/** A picked or uploaded file: thumbnail, name, size, actions. */
export declare function FileItem({ name, size, meta, preview, icon, onRemove, removeLabel, uploading, disabled, actions, className, ...rest }: FileItemProps): import("react/jsx-runtime").JSX.Element;
export {};
