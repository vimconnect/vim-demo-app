'use client';

import { useState } from 'react';
import type { JsonLine } from '@/lib/annotated-json';
import { CopyButton, JsonLines } from '@/components/CodeBlock';

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

  return (
    <div className={`raw-output raw-output-${tone}`}>
      <div className="raw-output-bar">
        <button
          type="button"
          className="raw-output-toggle"
          aria-expanded={open}
          onClick={() => setOpen((prev) => !prev)}
          // A mouse click shouldn't leave the keyboard focus ring on the toggle.
          onMouseDown={(e) => e.preventDefault()}
        >
          <span className="raw-output-label">{label}</span>
          <span className={`disclosure-chevron${open ? ' open' : ''}`} aria-hidden="true" />
        </button>
        <CopyButton text={value} label="Copy result" iconOnly />
      </div>
      {open && <pre className="raw-output-code">{lines ? <JsonLines lines={lines} /> : value}</pre>}
    </div>
  );
}
