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
