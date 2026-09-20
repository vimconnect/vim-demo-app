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

const getIdTokenButton = () => screen.getByRole('button', { name: /get id token|fetching/i });

describe('SessionContextPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    copyTextMock.mockResolvedValue(true);
  });

  it('renders all five fields, with the account name alongside its id', () => {
    const ctx = sessionContext();
    renderPanel(ctx);

    for (const label of ['User ID', 'Account', 'EHR', 'Session ID', 'Device ID']) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
    expect(screen.getByText(ctx.userId)).toBeInTheDocument();
    expect(screen.getByText('Yaniv dev 7')).toBeInTheDocument();
    expect(screen.getByText(ctx.account.id)).toBeInTheDocument();
    expect(screen.getByText(ctx.sessionId)).toBeInTheDocument();
    expect(screen.getByText(ctx.deviceId)).toBeInTheDocument();
  });

  it('copies a field and flashes Copied', async () => {
    const user = userEvent.setup();
    const ctx = sessionContext();
    renderPanel(ctx);

    await user.click(screen.getByTitle('Copy Session ID'));

    expect(copyTextMock).toHaveBeenCalledWith(ctx.sessionId);
    await waitFor(() => expect(screen.getByTitle('Copy Session ID')).toHaveTextContent('Copied'));
  });

  it('leaves the value shown when the copy is refused', async () => {
    const user = userEvent.setup();
    copyTextMock.mockResolvedValue(false);
    const ctx = sessionContext();
    renderPanel(ctx);

    await user.click(screen.getByTitle('Copy User ID'));

    await waitFor(() => expect(copyTextMock).toHaveBeenCalled());
    expect(screen.getByTitle('Copy User ID')).toHaveTextContent(ctx.userId);
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
    it('reports the length and the clipboard copy, never the token', async () => {
      const user = userEvent.setup();
      const ctx = sessionContext();
      const addLog = renderPanel(ctx);

      await user.click(getIdTokenButton());

      await waitFor(() => expect(addLog).toHaveBeenCalledTimes(1));
      const [message, level] = addLog.mock.calls[0];
      expect(level).toBe('success');
      expect(message).toContain('1217-char JWT');
      expect(message).toContain('copied to clipboard');
      expect(message).not.toContain('x'.repeat(24));
      expect(copyTextMock).toHaveBeenCalledWith('x'.repeat(1217));
    });

    it('says the clipboard was blocked rather than claiming a copy that did not happen', async () => {
      const user = userEvent.setup();
      copyTextMock.mockResolvedValue(false);
      const addLog = renderPanel(sessionContext());

      await user.click(getIdTokenButton());

      await waitFor(() => expect(addLog).toHaveBeenCalledTimes(1));
      const [message] = addLog.mock.calls[0];
      expect(message).toContain('(clipboard blocked)');
      expect(message).not.toContain('copied to clipboard');
    });

    it('logs the SDK error code on rejection, and copies nothing', async () => {
      const user = userEvent.setup();
      const ctx = sessionContext({
        getIdToken: vi.fn().mockRejectedValue({ code: 'ID_TOKEN_UNAVAILABLE' }),
      });
      const addLog = renderPanel(ctx);

      await user.click(getIdTokenButton());

      await waitFor(() => expect(addLog).toHaveBeenCalledTimes(1));
      expect(addLog.mock.calls[0][0]).toContain('ID_TOKEN_UNAVAILABLE');
      expect(addLog.mock.calls[0][1]).toBe('error');
      expect(copyTextMock).not.toHaveBeenCalled();
    });

    it('relabels and ignores a second click while the call is in flight', async () => {
      const user = userEvent.setup();
      let settle: (v: { idToken: string }) => void = () => {};
      const getIdToken = vi.fn().mockReturnValue(
        new Promise<{ idToken: string }>((resolve) => {
          settle = resolve;
        }),
      );
      const ctx = sessionContext({ getIdToken });
      renderPanel(ctx);

      await user.click(getIdTokenButton());
      await waitFor(() => expect(getIdTokenButton()).toHaveTextContent('Fetching…'));
      expect(getIdTokenButton()).toBeDisabled();

      await user.click(getIdTokenButton());
      expect(getIdToken).toHaveBeenCalledTimes(1);

      settle({ idToken: 'y'.repeat(10) });
      await waitFor(() => expect(getIdTokenButton()).toHaveTextContent('Get ID Token'));
    });
  });
});
