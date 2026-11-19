/**
 * Copies `text` to the clipboard from a click: `navigator.clipboard` first, then the legacy
 * `execCommand('copy')` path, which still works in an iframe whose parent doesn't delegate
 * `clipboard-write` (the demo app in the extension). Resolves `true` when the copy landed; never
 * throws. Call it straight from the click handler: the fallback needs the click's user activation,
 * so await nothing slow before it.
 */
export declare function copyText(text: string): Promise<boolean>;
