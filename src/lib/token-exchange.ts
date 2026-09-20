import { NextRequest, NextResponse } from 'next/server';
import { getServerConfig } from '@/lib/config';

/**
 * Exchange an OAuth authorization code for an access token via the Vim backend.
 *
 * Served at BOTH `/token` (the default path the SDK posts to) and the legacy
 * `/api/auth/token` — so moving the default does not break apps whose registered
 * `token_endpoint` still points at the old path. Acts as a secure proxy so the
 * CLIENT_SECRET stays server-side.
 */
export async function exchangeAuthCode(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { code } = body;

    if (!code) {
      return NextResponse.json({ error: 'Missing authorization code' }, { status: 400 });
    }

    // Config is validated and fetched at server startup.
    const config = getServerConfig();
    const { clientId, clientSecret, vimBackendUrl } = config;

    console.log('Exchanging code for token with Vim backend...', { vimBackendUrl });
    const tokenResponse = await fetch(`${vimBackendUrl}/app-auth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        code,
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json().catch(() => ({}));
      console.error('Token exchange failed:', tokenResponse.status, tokenResponse.statusText, errorData);
      return NextResponse.json(
        {
          error: errorData.error || 'token_exchange_failed',
          error_description: errorData.error_description || 'Failed to exchange code for token',
        },
        { status: tokenResponse.status },
      );
    }

    const tokenData = await tokenResponse.json();
    console.log('Token exchange successful');

    return NextResponse.json(
      {
        access_token: tokenData.access_token,
        // Required for sessionContext.getIdToken() — removing it breaks the
        // token_endpoint flow silently.
        id_token: tokenData.id_token,
        token_type: tokenData.token_type || 'Bearer',
        expires_in: tokenData.expires_in,
        scope: tokenData.scope,
      },
      // RFC 6749 §5.1 — a token response carries credentials and must not be stored.
      { headers: { 'Cache-Control': 'no-store', Pragma: 'no-cache' } },
    );
  } catch (error) {
    console.error('Token exchange error:', error);
    return NextResponse.json(
      { error: 'internal_server_error', error_description: 'An unexpected error occurred' },
      { status: 500 },
    );
  }
}
