/**
 * Copies `text` to the clipboard from a click: `navigator.clipboard` first, then the legacy
 * `execCommand('copy')` path, which still works in an iframe whose parent doesn't delegate
 * `clipboard-write` (the demo app in the extension). Resolves `true` when the copy landed; never
 * throws. Call it straight from the click handler: the fallback needs the click's user activation,
 * so await nothing slow before it.
 */
export async function copyText(text) {
    try {
        if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(text);
            return true;
        }
    }
    catch {
        // Refused (permissions policy, no focus): fall through to the legacy path.
    }
    return copyWithExecCommand(text);
}
function copyWithExecCommand(text) {
    if (typeof document === 'undefined' || typeof document.execCommand !== 'function')
        return false;
    const textarea = document.createElement('textarea');
    // select() moves focus to the textarea; give it back so keyboard users keep their place.
    const focused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    try {
        textarea.value = text;
        textarea.setAttribute('data-ui', 'copy-fallback');
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'fixed';
        textarea.style.top = '0';
        textarea.style.left = '0';
        textarea.style.opacity = '0';
        textarea.style.pointerEvents = 'none';
        document.body.appendChild(textarea);
        textarea.select();
        return document.execCommand('copy');
    }
    catch {
        return false;
    }
    finally {
        textarea.remove();
        focused?.focus();
    }
}
