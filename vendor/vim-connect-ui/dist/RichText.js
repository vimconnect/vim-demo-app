'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { useMemo } from 'react';
import { looksLikeAppDescriptionHtml } from '@vim-connect/runtime-types/app-description';
import { cn } from './cn.js';
import { richTextVariants, sanitizeRichTextHtml } from './richTextShared.js';
/**
 * Read-only rich text: an app's description, its "What's new", review notes and feedback. The one
 * place a product puts stored rich text into the DOM, so there is one sanitizer to audit.
 * Renders nothing for an empty value; the caller says what an empty one means.
 */
export function RichText({ value, size, className, 'data-testid': testId }) {
    const text = value ?? '';
    const html = looksLikeAppDescriptionHtml(text);
    const safeHtml = useMemo(() => (html ? sanitizeRichTextHtml(text) : ''), [html, text]);
    if (text.trim() === '')
        return null;
    const classes = cn(richTextVariants({ size }), className);
    return html ? (_jsx("div", { "data-ui": "rich-text", "data-testid": testId, className: classes, dangerouslySetInnerHTML: { __html: safeHtml } })) : (_jsx("div", { "data-ui": "rich-text", "data-testid": testId, className: cn(classes, 'whitespace-pre-wrap'), children: text }));
}
