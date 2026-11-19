'use client';

import { Button, CopyButton, ErrorPage } from '@vim-connect/ui';

export type DiagnosticsField = {
  label: string;
  value: string;
};

type ErrorScreenProps = {
  heading: string;
  message: string;
  diagnostics: DiagnosticsField[];
  retry?: {
    label: string;
    onClick: () => void;
  };
};

/** One aligned "Label  value" line per field: what the diagnostics show and copy. */
export function formatDiagnostics(fields: DiagnosticsField[]): string {
  const maxLabel = fields.reduce((max, f) => Math.max(max, f.label.length), 0);
  return fields
    .map((f) => `${f.label.padEnd(maxLabel + 1)}${f.value}`)
    .join('\n');
}

/**
 * A friendly error on the shared DS ErrorPage (@vim-connect/ui): heading, one
 * plain sentence, Retry, and the raw diagnostics folded under "Error details"
 * with a copy action, so developers can paste them into a bug report. Copy
 * this pattern in production apps: never surface raw SDK errors to end users.
 */
export function ErrorScreen({ heading, message, diagnostics, retry }: ErrorScreenProps) {
  const diagnosticsText = formatDiagnostics(diagnostics);
  return (
    <ErrorPage
      kind="error"
      title={heading}
      description={message}
      details={diagnosticsText}
      actions={
        <>
          {retry && (
            <Button variant="primary" onClick={retry.onClick}>
              {retry.label}
            </Button>
          )}
          <CopyButton value={diagnosticsText} label="diagnostics" showLabel size="default" />
        </>
      }
    />
  );
}
