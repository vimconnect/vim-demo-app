'use client';

import { useState } from 'react';
import type { AppManifest } from '@vimconnect/app-sdk';
import { CodeBlock } from '@/components/CodeBlock';
import { SectionHeader } from '@/components/SectionHeader';
import { annotatedLines, manifestAnnotator } from '@/lib/annotated-json';
import { Card, KeyValue, KeyValueList } from '@vim-connect/ui';

/** A count for array and object values, so a collapsed section still says how much it holds. */
function sizeOf(value: unknown): string {
  if (Array.isArray(value)) return ` (${value.length})`;
  if (value !== null && typeof value === 'object') return ` (${Object.keys(value).length})`;
  return '';
}

/** `sdk.ehr.getManifest()`, one collapsible section per top-level key. */
export function ManifestView({ manifest }: { manifest: AppManifest }) {
  const entries = Object.entries(manifest as unknown as Record<string, unknown>);
  const [open, setOpen] = useState<Set<string>>(new Set());
  const toggle = (key: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  return (
    <div className="demo-content">
      <p className="section-hint">
        What <code>sdk.ehr.getManifest()</code> returns for this session: the events, contexts, entities and
        operations the active EHR offers your app.
      </p>
      {entries.map(([key, value]) => {
        const isOpen = open.has(key);
        const scalar = value === null || typeof value !== 'object';
        return (
          <Card as="section" key={key} className="section-collapsible">
            {scalar ? (
              <KeyValueList className="manifest-scalar">
                <KeyValue label={key}>{String(value)}</KeyValue>
              </KeyValueList>
            ) : (
              <>
                <SectionHeader title={`${key}${sizeOf(value)}`} collapsed={!isOpen} onToggle={() => toggle(key)} />
                {isOpen && (
                  <div className="section-inner">
                    <CodeBlock
                      code={JSON.stringify(value, null, 2)}
                      lines={annotatedLines(value, manifestAnnotator)}
                    />
                  </div>
                )}
              </>
            )}
          </Card>
        );
      })}
    </div>
  );
}
