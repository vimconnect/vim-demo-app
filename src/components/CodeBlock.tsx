'use client';

import { useState } from 'react';
import { copyText } from '@/lib/clipboard';
import { CheckIcon, CopyIcon } from '@/components/icons';
import { IconTip } from '@/components/Hint';
import type { JsonLine } from '@/lib/annotated-json';

/** `iconOnly` draws a copy icon (a check once copied) and keeps `label` as the accessible name. */
export function CopyButton({ text, label = 'Copy', iconOnly = false }: { text: string; label?: string; iconOnly?: boolean }) {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const name = state === 'copied' ? 'Copied' : state === 'failed' ? 'Copy failed' : label;
  const button = (
    <button
      type="button"
      className={`btn btn-sm copy-button${iconOnly ? ' btn-icon' : ''}${iconOnly && state === 'copied' ? ' is-done' : ''}`}
      aria-label={iconOnly ? name : undefined}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void copyText(text).then((ok) => {
          setState(ok ? 'copied' : 'failed');
          setTimeout(() => setState('idle'), 2000);
        });
      }}
    >
      {iconOnly
        ? state === 'copied'
          ? <CheckIcon size={14} />
          : <CopyIcon size={14} />
        : state === 'copied'
          ? 'Copied ✓'
          : state === 'failed'
            ? 'Copy failed'
            : label}
    </button>
  );
  return iconOnly ? <IconTip label={name}>{button}</IconTip> : button;
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
