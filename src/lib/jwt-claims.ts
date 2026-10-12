/**
 * The payload of a JWT, decoded for display. Never a verification: the app's backend must check
 * the signature before trusting any claim.
 */
export function decodeJwtClaims(token: string): Record<string, unknown> | null {
  const payload = token.split('.')[1];
  if (!payload) return null;
  try {
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    const bytes = Uint8Array.from(atob(padded), (c) => c.charCodeAt(0));
    const claims: unknown = JSON.parse(new TextDecoder().decode(bytes));
    return claims !== null && typeof claims === 'object' && !Array.isArray(claims)
      ? (claims as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

const TIME_CLAIMS = new Set(['exp', 'iat', 'nbf', 'auth_time']);

/** A claim value as one display line; NumericDate claims also show their local time. */
export function formatClaim(name: string, value: unknown): string {
  if (TIME_CLAIMS.has(name) && typeof value === 'number') {
    return `${value} (${new Date(value * 1000).toLocaleString()})`;
  }
  return typeof value === 'string' ? value : JSON.stringify(value);
}

const CLAIM_MEANINGS: Record<string, string> = {
  sub: 'User ID',
  aud: "Your app's client ID",
  scope: 'Granted scopes',
  iss: 'Issuer',
  iat: 'Issued at',
  exp: 'Expires at',
  nbf: 'Not valid before',
  auth_time: 'Signed in at',
  jti: 'Token ID',
  user_id: 'User ID',
  app_client_id: "Your app's client ID",
  app_id: 'App ID',
  account_id: 'Account ID',
  launch_id: 'Launch ID',
};

/**
 * A claim name short enough for one line, and what it holds. Namespaced URL claims keep their
 * last path segment: `https://getvim.ai/user_id` shows as `…vim.ai/user_id`.
 */
export function claimLabel(name: string): { short: string; meaning: string | null } {
  let short = name;
  let key = name;
  try {
    const url = new URL(name);
    if (url.protocol === 'http:' || url.protocol === 'https:') {
      const host = url.hostname.length > 6 ? `…${url.hostname.slice(-6)}` : url.hostname;
      short = `${host}${url.pathname}`;
      key = url.pathname.split('/').filter(Boolean).pop() ?? name;
    }
  } catch {
    // Not a URL: a registered or plain claim name.
  }
  return { short, meaning: CLAIM_MEANINGS[key] ?? null };
}
