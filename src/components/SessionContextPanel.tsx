'use client';

import { useState } from 'react';
import type { VimSDK } from '@vimconnect/app-sdk';
import { SectionHeader } from '@/components/SectionHeader';
import { CopyButton } from '@/components/CodeBlock';
import { Notice } from '@/components/Notice';
import { ShieldCheckIcon } from '@/components/icons';
import { claimLabel, decodeJwtClaims, formatClaim } from '@/lib/jwt-claims';
import { sessionContextRows } from '@/lib/session-context-rows';
import { Button } from '@vim-connect/ui';

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
    <dl className={`kv-list kv-list-compact ${className}`}>
      {rows.map(({ label, hint, title, value }) => (
        <div className="kv-row" key={title ?? label}>
          <dt className="kv-label" title={title}>
            <span>{label}</span>
            {hint && <span className="kv-hint">{hint}</span>}
          </dt>
          <dd className="kv-row-value" title={value}>
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

  const rows = sessionContextRows(sessionContext);

  return (
    <div className="section-collapsible">
      <SectionHeader
        title={`Session Context${sessionContext ? ` (${rows.length})` : ''}`}
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        docsHref="/docs/app-sdk/authentication/"
        icon={<ShieldCheckIcon size={12} />}
        subtitle="Who is signed in, and where this session runs"
      />
      <div className={`section-content ${collapsed ? 'collapsed' : ''}`}>
        <div className="section-inner">
          {sessionContext ? (
            <div className="session-card">
              <dl className="session-ids">
                {rows.map(({ key, label, value }) => (
                  <div className="session-id" key={key}>
                    <dt>{label}</dt>
                    <dd title={value}>{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ) : (
            <div className="empty-state" style={{ margin: 0 }}>
              No session context — older extension builds send none.
            </div>
          )}
          <div className="id-token-bar">
            <span className="demo-card-label">{idToken.status === 'ok' && idToken.claims ? 'ID token claims' : 'ID token'}</span>
            <div className="id-token-actions">
              {idToken.status === 'ok' && (
                <CopyButton text={idToken.token} label="Copy token" iconOnly />
              )}
              <Button
                variant="secondary"
                size="sm"
                onClick={fetchIdToken}
                disabled={!sessionContext || idToken.status === 'pending'}
                title="Resolves only on the token endpoint flow"
              >
                {idToken.status === 'pending'
                  ? 'Fetching…'
                  : idToken.status === 'ok'
                    ? 'Refresh ID Token'
                    : 'Get ID Token'}
              </Button>
            </div>
          </div>
          {idToken.status === 'error' && (
            <Notice tone="error">
              getIdToken() rejected: {idToken.code}
            </Notice>
          )}
          {idToken.status === 'ok' &&
            (idToken.claims ? (
              <div className="session-panel">
                <KvRows
                  className="kv-list-claims"
                  rows={Object.entries(idToken.claims).map(([name, value]) => {
                    const { short, meaning } = claimLabel(name);
                    return { label: short, hint: meaning, title: name, value: formatClaim(name, value) };
                  })}
                />
              </div>
            ) : (
              <p className="empty-state" style={{ margin: 0 }}>
                The token isn&apos;t a JWT, so it has no claims to show.
              </p>
            ))}
        </div>
      </div>
    </div>
  );
}
