'use client';

import { CodeBlock as SharedCodeBlock, Tooltip } from '@vim-connect/ui';
import type { JsonLine } from '@/lib/annotated-json';

/** JSON lines, each followed by its note as a `// deprecated` comment. */
export function JsonLines({ lines }: { lines: JsonLine[] }) {
  return (
    <>
      {lines.map((line, i) => (
        <span key={i}>
          {line.text}
          {line.note !== null && (
            <Tooltip label={`Deprecated — ${line.note}`} wrap>
              <span className="json-note">
                {'  // deprecated — '}
                {line.note}
              </span>
            </Tooltip>
          )}
          {i < lines.length - 1 && '\n'}
        </span>
      ))}
    </>
  );
}

/** Copy takes `code`, never the notes shown from `lines`. */
export function CodeBlock({ code, lines, className = '' }: { code: string; lines?: JsonLine[]; className?: string }) {
  return (
    <SharedCodeBlock code={code} copyLabel="payload" wrap className={`code-block ${className}`}>
      {lines ? <JsonLines lines={lines} /> : undefined}
    </SharedCodeBlock>
  );
}
