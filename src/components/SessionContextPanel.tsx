'use client';

import { useState } from 'react';
import type { VimSDK } from '@vimconnect/app-sdk';
import { copyText } from '@/lib/clipboard';
import { InfoTip } from '@/components/Hint';
import { claimLabel, decodeJwtClaims, formatClaim } from '@/lib/jwt-claims';

type SessionContext = NonNullable<VimSDK['sessionContext']>;

type SessionContextPanelProps = {
  /** Null until the extension hands off the session seed, and on builds that send none. */
  sessionContext: SessionContext | null;
  addLog: (message: string, type: 'info' | 'success' | 'error') => void;
};

type IdTokenState =
  | { status: 'idle' | 'pending' }
  | { status: 'ok'; token: string; claims: Record<string, unknown> | null }
  | { status: 'error'; code: string };

function KvRows({
  rows,
  className = '',
}: {
  rows: { label: string; hint?: string | null; title?: string; value: string }[];
  className?: string;
}) {
  return (
    <dl className={`kv-list ${className}`}>
      {rows.map(({ label, hint, title, value }) => (
        <div className="kv-row" key={title ?? label}>
          <dt className="kv-label" title={title}>
            <span>{label}</span>
            {hint && <span className="kv-hint">{hint}</span>}
          </dt>
          <dd className="kv-row-value">
            <span className="kv-value">{value}</span>
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function SessionContextPanel({ sessionContext, addLog }: SessionContextPanelProps) {
  const [collapsed, setCollapsed] = useState(true);
  const [idToken, setIdToken] = useState<IdTokenState>({ status: 'idle' });
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');

  // Resolves only on the token endpoint flow: an app that passed accessToken to
  // initVimSDK(), or whose token endpoint omitted id_token, has none captured
  // and gets ID_TOKEN_UNAVAILABLE.
  async function fetchIdToken() {
    if (!sessionContext || idToken.status === 'pending') return;
    setIdToken({ status: 'pending' });
    try {
      const { idToken: token } = await sessionContext.getIdToken();
      const claims = decodeJwtClaims(token);
      setIdToken({ status: 'ok', token, claims });
      // Never log the token itself — length is enough to confirm you got one.
      addLog(
        `getIdToken() resolved — ${token.length}-char JWT${claims ? `, ${Object.keys(claims).length} claims` : ''}. Send it to your backend, verify it, then issue your own session.`,
        'success',
      );
    } catch (err: unknown) {
      const e = err as { code?: string; message?: string };
      const code = e?.code ?? e?.message ?? String(err);
      setIdToken({ status: 'error', code });
      addLog(`getIdToken() rejected: ${code}`, 'error');
    }
  }

  async function copyToken(token: string) {
    const ok = await copyText(token);
    setCopyState(ok ? 'copied' : 'failed');
    setTimeout(() => setCopyState('idle'), 2000);
  }

  const fields: { label: string; value: string }[] = sessionContext
    ? [
        { label: 'User ID', value: sessionContext.userId },
        { label: 'Account name', value: sessionContext.account.name },
        { label: 'Account ID', value: sessionContext.account.id },
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
        <h2 className="section-title">
          Session Context{sessionContext ? ` (${fields.length})` : ''}
        </h2>
        <InfoTip label="About Session Context">Seeded at init; identifies the session, not the person. Verify <code>getIdToken()</code> server-side.</InfoTip>
      </div>
      <div className={`section-content ${collapsed ? 'collapsed' : ''}`}>
        <div className="section-inner">
          {sessionContext ? (
            <KvRows rows={fields} />
          ) : (
            <div className="empty-state" style={{ margin: 0 }}>
              No session context — older extension builds send none.
            </div>
          )}
          <button
            onClick={fetchIdToken}
            disabled={!sessionContext || idToken.status === 'pending'}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: 'var(--space-md)' }}
            title="Resolves only on the token endpoint flow"
          >
            {idToken.status === 'pending'
              ? 'Fetching…'
              : idToken.status === 'ok'
                ? 'Refresh ID Token'
                : 'Get ID Token'}
          </button>
          {idToken.status === 'error' && (
            <p className="op-reason id-token-error">getIdToken() rejected: {idToken.code}</p>
          )}
          {idToken.status === 'ok' && (
            <div className="id-token-claims">
              <div className="id-token-claims-header">
                <span className="demo-card-label">ID token claims</span>
                <button type="button" className="btn btn-sm" onClick={() => void copyToken(idToken.token)}>
                  {copyState === 'copied' ? 'Copied ✓' : copyState === 'failed' ? 'Copy failed' : 'Copy token'}
                </button>
              </div>
              {idToken.claims ? (
                <KvRows
                  className="kv-list-claims"
                  rows={Object.entries(idToken.claims).map(([name, value]) => {
                    const { short, meaning } = claimLabel(name);
                    return { label: short, hint: meaning, title: name, value: formatClaim(name, value) };
                  })}
                />
              ) : (
                <p className="empty-state" style={{ margin: 0 }}>
                  The token isn&apos;t a JWT, so it has no claims to show.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
