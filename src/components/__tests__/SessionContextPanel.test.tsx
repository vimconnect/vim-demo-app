import '@testing-library/jest-dom/vitest';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('@/lib/clipboard', () => ({ copyText: vi.fn() }));

import { copyText } from '@/lib/clipboard';
import { SessionContextPanel } from '../SessionContextPanel';

const copyTextMock = vi.mocked(copyText);

/** Matches the live shape: five data fields plus getIdToken(). */
function sessionContext(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    userId: 'f3e819c5-3736-4820-a221-073559ca576d',
    account: { id: 'ab2c8289-0234-403e-8672-6aa2128bf073', name: 'Yaniv dev 7' },
    ehrType: 'sandbox_ehr_next',
    sessionId: '68c27eef-68c7-4aa5-88b5-dcb0e1502829',
    deviceId: '405a9e0b-0cfe-43b6-bf54-869e490da206',
    getIdToken: vi.fn().mockResolvedValue({ idToken: 'x'.repeat(1217) }),
    ...overrides,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const renderPanel = (ctx: any, addLog = vi.fn()) => {
  render(<SessionContextPanel sessionContext={ctx} addLog={addLog} />);
  return addLog;
};

const getIdTokenButton = () =>
  screen.getByRole('button', { name: /get id token|fetching|refresh id token/i });

describe('SessionContextPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    copyTextMock.mockResolvedValue(true);
  });

  it('renders all six fields, with the account name and id on their own rows', () => {
    const ctx = sessionContext();
    renderPanel(ctx);

    for (const label of ['User ID', 'Account name', 'Account ID', 'EHR', 'Session ID', 'Device ID']) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
    expect(screen.getByText(ctx.userId)).toBeInTheDocument();
    expect(screen.getByText('Yaniv dev 7')).toBeInTheDocument();
    expect(screen.getByText(ctx.account.id)).toBeInTheDocument();
    expect(screen.getByText(ctx.sessionId)).toBeInTheDocument();
    expect(screen.getByText(ctx.deviceId)).toBeInTheDocument();
  });

  it('shows values as plain text with nothing to click', () => {
    renderPanel(sessionContext());
    expect(screen.queryByTitle(/^Copy /)).not.toBeInTheDocument();
    expect(screen.getAllByRole('button').filter((b) => !b.classList.contains('info-tip'))).toHaveLength(1);
  });

  describe('with no session context', () => {
    it('shows the empty state and names the cause', () => {
      renderPanel(null);
      expect(screen.getByText(/No session context/)).toHaveTextContent(
        /older\s+extension builds send none/,
      );
    });

    it('disables Get ID Token', () => {
      renderPanel(null);
      expect(getIdTokenButton()).toBeDisabled();
    });
  });

  describe('Get ID Token', () => {
    const b64url = (value: unknown) =>
      btoa(JSON.stringify(value)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    const jwt = `${b64url({ alg: 'RS256' })}.${b64url({ sub: 'user-1', aud: 'demo', exp: 0 })}.signature`;

    it('shows the decoded claims and logs the length, never the token', async () => {
      const user = userEvent.setup();
      const ctx = sessionContext({ getIdToken: vi.fn().mockResolvedValue({ idToken: jwt }) });
      const addLog = renderPanel(ctx);

      await user.click(getIdTokenButton());

      await waitFor(() => expect(screen.getByText('ID token claims')).toBeInTheDocument());
      expect(screen.getByText('sub')).toBeInTheDocument();
      expect(screen.getAllByText('User ID').length).toBeGreaterThan(1);
      expect(screen.getByText('user-1')).toBeInTheDocument();
      expect(screen.getByText('demo')).toBeInTheDocument();
      expect(screen.getByText(`0 (${new Date(0).toLocaleString()})`)).toBeInTheDocument();
      const [message, level] = addLog.mock.calls[0];
      expect(level).toBe('success');
      expect(message).toContain(`${jwt.length}-char JWT, 3 claims`);
      expect(message).not.toContain(jwt);
      expect(copyTextMock).not.toHaveBeenCalled();
    });

    it('copies the raw token only from Copy token', async () => {
      const user = userEvent.setup();
      renderPanel(sessionContext({ getIdToken: vi.fn().mockResolvedValue({ idToken: jwt }) }));

      await user.click(getIdTokenButton());
      await user.click(await screen.findByRole('button', { name: 'Copy token' }));

      expect(copyTextMock).toHaveBeenCalledWith(jwt);
      await waitFor(() => expect(screen.getByRole('button', { name: 'Copied ✓' })).toBeInTheDocument());
    });

    it('says a non-JWT token has no claims', async () => {
      const user = userEvent.setup();
      renderPanel(sessionContext());

      await user.click(getIdTokenButton());

      await waitFor(() => expect(screen.getByText(/isn.t a JWT/)).toBeInTheDocument());
    });

    it('shows and logs the SDK error code on rejection', async () => {
      const user = userEvent.setup();
      const ctx = sessionContext({
        getIdToken: vi.fn().mockRejectedValue({ code: 'ID_TOKEN_UNAVAILABLE' }),
      });
      const addLog = renderPanel(ctx);

      await user.click(getIdTokenButton());

      await waitFor(() => expect(addLog).toHaveBeenCalledTimes(1));
      expect(addLog.mock.calls[0][0]).toContain('ID_TOKEN_UNAVAILABLE');
      expect(addLog.mock.calls[0][1]).toBe('error');
      expect(screen.getByText(/rejected: ID_TOKEN_UNAVAILABLE/)).toBeInTheDocument();
      expect(screen.queryByText('ID token claims')).not.toBeInTheDocument();
    });

    it('relabels and ignores a second click while the call is in flight', async () => {
      const user = userEvent.setup();
      let settle: (v: { idToken: string }) => void = () => {};
      const getIdToken = vi.fn().mockReturnValue(
        new Promise<{ idToken: string }>((resolve) => {
          settle = resolve;
        }),
      );
      renderPanel(sessionContext({ getIdToken }));

      await user.click(getIdTokenButton());
      await waitFor(() => expect(getIdTokenButton()).toHaveTextContent('Fetching…'));
      expect(getIdTokenButton()).toBeDisabled();

      await user.click(getIdTokenButton());
      expect(getIdToken).toHaveBeenCalledTimes(1);

      settle({ idToken: jwt });
      await waitFor(() => expect(getIdTokenButton()).toHaveTextContent('Refresh ID Token'));
    });
  });
});
