'use client';

import { useState } from 'react';
import { copyText } from '@/lib/clipboard';
import type { JsonLine } from '@/lib/annotated-json';

export function CopyButton({ text, label = 'Copy' }: { text: string; label?: string }) {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle');
  return (
    <button
      type="button"
      className="btn btn-sm copy-button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void copyText(text).then((ok) => {
          setState(ok ? 'copied' : 'failed');
          setTimeout(() => setState('idle'), 2000);
        });
      }}
    >
      {state === 'copied' ? 'Copied ✓' : state === 'failed' ? 'Copy failed' : label}
    </button>
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
      <CopyButton text={code} />
      <pre className="code-block-pre">{lines ? <JsonLines lines={lines} /> : code}</pre>
    </div>
  );
}
