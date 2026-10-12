'use client';

import { useState } from 'react';
import { copyText } from '@/lib/clipboard';
import type { JsonLine } from '@/lib/annotated-json';
import { JsonLines } from '@/components/CodeBlock';

type RawOutputProps = {
  /** Raw text (usually pretty-printed JSON) shown in the block and copied verbatim. */
  value: string;
  /** Summary label, e.g. 'raw result' or the entity type. */
  label?: string;
  /** Start expanded. Collapsed by default keeps the grid compact. */
  defaultOpen?: boolean;
  /** Tone of the block border/label — mirrors the operation state. */
  tone?: 'neutral' | 'success' | 'error';
  /** `value` with notes, shown in place of it; Copy still takes `value`. */
  lines?: JsonLine[];
};

export function RawOutput({ value, label = 'raw', defaultOpen = false, tone = 'neutral', lines }: RawOutputProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [copied, setCopied] = useState<'idle' | 'ok' | 'fail'>('idle');

  function copy() {
    copyText(value).then((ok) => {
      setCopied(ok ? 'ok' : 'fail');
      setTimeout(() => setCopied('idle'), 1200);
    });
  }

  return (
    <div className={`raw-output raw-output-${tone}`}>
      <div className="raw-output-bar">
        <button
          type="button"
          className="raw-output-toggle"
          aria-expanded={open}
          onClick={() => setOpen((prev) => !prev)}
        >
          <span className="raw-output-chevron">{open ? '▾' : '▸'}</span>
          <span className="raw-output-label">{label}</span>
        </button>
        <button type="button" className="btn btn-sm" onClick={copy}>
          {copied === 'ok' ? 'Copied' : copied === 'fail' ? 'Copy failed' : 'Copy'}
        </button>
      </div>
      {open && <pre className="raw-output-code">{lines ? <JsonLines lines={lines} /> : value}</pre>}
    </div>
  );
}
