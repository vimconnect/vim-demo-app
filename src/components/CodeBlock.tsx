'use client';

import { useState } from 'react';
import { Button, Tooltip } from '@vim-connect/ui';
import { copyText } from '@/lib/clipboard';
import { CheckIcon, CopyIcon } from '@/components/icons';
import type { JsonLine } from '@/lib/annotated-json';

/**
 * Copy on the shared DS Button (@vim-connect/ui): icon-only ghost with a tooltip, or a small
 * secondary button with its label. The copy itself stays the app's `copyText`, which falls back
 * to `execCommand` where the extension's iframe blocks `navigator.clipboard`.
 */
export function CopyButton({ text, label = 'Copy', iconOnly = false }: { text: string; label?: string; iconOnly?: boolean }) {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const name = state === 'copied' ? 'Copied' : state === 'failed' ? 'Copy failed' : label;
  const copy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    void copyText(text).then((ok) => {
      setState(ok ? 'copied' : 'failed');
      setTimeout(() => setState('idle'), 2000);
    });
  };
  if (iconOnly) {
    return (
      <Tooltip label={name}>
        <Button variant="ghost" size="sm" iconOnly className="copy-button" aria-label={name} data-copied={state === 'copied' || undefined} onClick={copy}>
          {state === 'copied' ? <CheckIcon size={14} /> : <CopyIcon size={14} />}
        </Button>
      </Tooltip>
    );
  }
  return (
    <Button variant="secondary" size="sm" className="copy-button" onClick={copy}>
      {name}
    </Button>
  );
}

/** JSON lines, each followed by its note as a `// deprecated` comment. */
export function JsonLines({ lines }: { lines: JsonLine[] }) {
  return (
    <>
      {lines.map((line, i) => (
        <span key={i}>
          {line.text}
          {line.note !== null && (
            <span className="json-note" title={`Deprecated — ${line.note}`}>
              {'  // deprecated — '}
              {line.note}
            </span>
          )}
          {i < lines.length - 1 && '\n'}
        </span>
      ))}
    </>
  );
}

/** A code payload with a Copy button pinned to its top-right corner. Copy takes `code`, never the notes. */
export function CodeBlock({ code, lines, className = '' }: { code: string; lines?: JsonLine[]; className?: string }) {
  return (
    <div className={`code-block ${className}`}>
      <CopyButton text={code} iconOnly />
      <pre className="code-block-pre">{lines ? <JsonLines lines={lines} /> : code}</pre>
    </div>
  );
}
