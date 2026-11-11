'use client';

import { useState } from 'react';

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
  diagnosticsPanelId?: string;
};

export function formatDiagnostics(fields: DiagnosticsField[]): string {
  const maxLabel = fields.reduce((max, f) => Math.max(max, f.label.length), 0);
  return fields
    .map((f) => `${f.label.padEnd(maxLabel + 1)}${f.value}`)
    .join('\n');
}

export function ErrorScreen({
  heading,
  message,
  diagnostics,
  retry,
  diagnosticsPanelId = 'error-diagnostics-panel',
}: ErrorScreenProps) {
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const diagnosticsText = formatDiagnostics(diagnostics);

  return (
    <div className="error-container">
      <div className="error-content">
        <h2>{heading}</h2>
        <p>{message}</p>
        <div className="error-actions">
          {retry && (
            <button
              type="button"
              onClick={retry.onClick}
              className="btn btn-primary"
            >
              {retry.label}
            </button>
          )}
          <button
            type="button"
            onClick={() => setShowDiagnostics((prev) => !prev)}
            className="btn"
            aria-expanded={showDiagnostics}
            aria-controls={diagnosticsPanelId}
          >
            {showDiagnostics ? 'Hide Diagnostics' : 'Show Diagnostics'}
          </button>
        </div>
        {showDiagnostics && (
          <div id={diagnosticsPanelId} className="error-diagnostics">
            <pre className="error-diagnostics-code">{diagnosticsText}</pre>
            <button
              type="button"
              onClick={() =>
                navigator.clipboard.writeText(diagnosticsText).catch(console.error)
              }
              className="btn btn-sm error-diagnostics-copy"
            >
              Copy to Clipboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
