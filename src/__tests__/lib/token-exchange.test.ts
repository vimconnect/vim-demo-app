import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { NextRequest } from 'next/server';

// getServerConfig() initializes from process.env on import, so it is stubbed
// rather than driven through the real config service.
vi.mock('@/lib/config', () => ({
  getServerConfig: () => ({
    clientId: 'vim_test_client',
    clientSecret: 'test-secret',
    vimBackendUrl: 'https://api.stage.example.test',
  }),
}));

import { exchangeAuthCode } from '@/lib/token-exchange';

/** Vim's /app-auth/token reply on the token_endpoint flow. */
function vimReplies(body: Record<string, unknown>, ok = true, status = 200) {
  return vi.fn().mockResolvedValue({
    ok,
    status,
    statusText: ok ? 'OK' : 'Bad Request',
    json: async () => body,
  });
}

const post = (body: unknown) =>
  new NextRequest('http://localhost:8080/token', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });

describe('exchangeAuthCode', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('passes id_token through so the SDK can capture it for getIdToken()', async () => {
    vi.stubGlobal(
      'fetch',
      vimReplies({
        access_token: 'at-123',
        id_token: 'idt-456',
        token_type: 'Bearer',
        expires_in: 3600,
        scope: 'read',
      }),
    );

    const res = await exchangeAuthCode(post({ code: 'auth-code' }));

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toMatchObject({
      access_token: 'at-123',
      id_token: 'idt-456',
    });
  });

  it('omits id_token when Vim did not return one, without failing the exchange', async () => {
    vi.stubGlobal('fetch', vimReplies({ access_token: 'at-123', token_type: 'Bearer' }));

    const res = await exchangeAuthCode(post({ code: 'auth-code' }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.access_token).toBe('at-123');
    expect(body.id_token).toBeUndefined();
  });

  it('marks the token response no-store', async () => {
    vi.stubGlobal('fetch', vimReplies({ access_token: 'at-123', id_token: 'idt-456' }));

    const res = await exchangeAuthCode(post({ code: 'auth-code' }));

    expect(res.headers.get('cache-control')).toBe('no-store');
    expect(res.headers.get('pragma')).toBe('no-cache');
  });

  it('defaults token_type to Bearer', async () => {
    vi.stubGlobal('fetch', vimReplies({ access_token: 'at-123' }));

    const res = await exchangeAuthCode(post({ code: 'auth-code' }));
    await expect(res.json()).resolves.toMatchObject({ token_type: 'Bearer' });
  });

  it('400s without calling Vim when the code is missing', async () => {
    const fetchMock = vimReplies({});
    vi.stubGlobal('fetch', fetchMock);

    const res = await exchangeAuthCode(post({}));

    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toMatchObject({ error: 'Missing authorization code' });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("surfaces Vim's error and status when the exchange fails", async () => {
    vi.stubGlobal(
      'fetch',
      vimReplies({ error: 'invalid_grant', error_description: 'code expired' }, false, 400),
    );

    const res = await exchangeAuthCode(post({ code: 'stale' }));

    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toMatchObject({
      error: 'invalid_grant',
      error_description: 'code expired',
    });
  });
});
