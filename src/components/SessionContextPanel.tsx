'use client';

import { useState } from 'react';
import type { VimSDK } from '@vimconnect/app-sdk';
import { copyText } from '@/lib/clipboard';

type SessionContext = NonNullable<VimSDK['sessionContext']>;

type SessionContextPanelProps = {
  /** Null until the extension hands off the session seed, and on builds that send none. */
  sessionContext: SessionContext | null;
  addLog: (message: string, type: 'info' | 'success' | 'error') => void;
};

export function SessionContextPanel({ sessionContext, addLog }: SessionContextPanelProps) {
  const [collapsed, setCollapsed] = useState(true);
  const [idTokenPending, setIdTokenPending] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  function copyField(label: string, value: string) {
    copyText(value).then((ok) => {
      if (!ok) return;
      setCopiedField(label);
      setTimeout(() => setCopiedField(null), 1200);
    });
  }

  // Resolves only on the token endpoint flow: an app that passed accessToken to
  // initVimSDK(), or whose token endpoint omitted id_token, has none captured
  // and gets ID_TOKEN_UNAVAILABLE.
  async function fetchIdToken() {
    if (!sessionContext || idTokenPending) return;
    setIdTokenPending(true);
    try {
      const { idToken } = await sessionContext.getIdToken();
      // Never log the token itself — length is enough to confirm you got one.
      const copied = await copyText(idToken);
      addLog(
        `getIdToken() resolved — ${idToken.length}-char JWT${copied ? ', copied to clipboard' : ' (clipboard blocked)'}. Send it to your backend, verify it, then issue your own session.`,
        'success',
      );
    } catch (err: unknown) {
      const e = err as { code?: string; message?: string };
      addLog(`getIdToken() rejected: ${e?.code ?? e?.message ?? String(err)}`, 'error');
    } finally {
      setIdTokenPending(false);
    }
  }

  const fields = sessionContext
    ? [
        { label: 'User ID', value: sessionContext.userId },
        { label: 'Account', note: sessionContext.account.name, value: sessionContext.account.id },
        { label: 'EHR', value: sessionContext.ehrType },
        { label: 'Session ID', value: sessionContext.sessionId },
        { label: 'Device ID', value: sessionContext.deviceId },
      ]
    : [];

  return (
    <div className="section-collapsible">
      <div className="section-header" onClick={() => setCollapsed(!collapsed)}>
        <div
          className="section-chevron"
          style={{ transform: collapsed ? 'rotate(0deg)' : 'rotate(90deg)' }}
        >
          ▶
        </div>
        <h2 className="section-title">Session Context</h2>
      </div>
      <div className={`section-content ${collapsed ? 'collapsed' : ''}`}>
        <div className="section-inner">
          <div
            style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-muted)',
              marginBottom: 'var(--space-md)',
            }}
          >
            <code>sdk.sessionContext</code> is seeded synchronously at init — no fetch. It
            identifies the session, not the person: there is no name, email or NPI here. Use{' '}
            <code>getIdToken()</code> and verify it server-side for anything your backend must
            trust.
          </div>
          <div className="updater-card">
            {sessionContext ? (
              <dl className="session-context-list">
                {fields.map(({ label, value, note }) => (
                  <div className="session-context-row" key={label}>
                    <dt className="session-context-label">{label}</dt>
                    <dd style={{ margin: 0 }}>
                      {note && <div className="session-context-note">{note}</div>}
                      <button
                        type="button"
                        onClick={() => copyField(label, value)}
                        className={`session-context-value${copiedField === label ? ' is-copied' : ''}`}
                        title={`Copy ${label}`}
                      >
                        {copiedField === label ? 'Copied' : value}
                      </button>
                    </dd>
                  </div>
                ))}
              </dl>
            ) : (
              <div className="empty-state" style={{ margin: 0 }}>
                No session context — the extension has not handed off the session seed (older
                extension builds send none).
              </div>
            )}
          </div>
          <button
            onClick={fetchIdToken}
            disabled={!sessionContext || idTokenPending}
            className="btn btn-primary"
            style={{
              width: '100%',
              marginTop: 'var(--space-md)',
              opacity: sessionContext && !idTokenPending ? 1 : 0.5,
            }}
            title="Resolves only on the token endpoint flow — copies the token to your clipboard"
          >
            {idTokenPending ? 'Fetching…' : 'Get ID Token'}
          </button>
        </div>
      </div>
    </div>
  );
}
