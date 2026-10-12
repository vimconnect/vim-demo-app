import { describe, expect, it } from 'vitest';
import {
  REDIRECT_REQUEST_TTL_MS,
  WELCOME_PUSH_VARIANTS,
  isFreshRedirectRequest,
  pickWelcomePush,
} from './welcome-push';

describe('pickWelcomePush', () => {
  it('can pick every variant', () => {
    const picked = WELCOME_PUSH_VARIANTS.map((_, i) =>
      pickWelcomePush(() => i / WELCOME_PUSH_VARIANTS.length),
    );
    expect(picked).toEqual(WELCOME_PUSH_VARIANTS);
  });

  it('stays in range at the top of Math.random', () => {
    expect(pickWelcomePush(() => 0.999999)).toBe(WELCOME_PUSH_VARIANTS.at(-1));
  });
});

describe('isFreshRedirectRequest', () => {
  const now = 1_000_000;
  const request = { url: 'https://example.test', requestedAt: now - 1_000 };

  it('accepts a new request within the TTL', () => {
    expect(isFreshRedirectRequest(request, 0, now)).toBe(true);
  });

  it('rejects a missing request', () => {
    expect(isFreshRedirectRequest(null, 0, now)).toBe(false);
  });

  it('rejects a request already handled', () => {
    expect(isFreshRedirectRequest(request, request.requestedAt, now)).toBe(false);
  });

  it('rejects a request older than the TTL', () => {
    const stale = { ...request, requestedAt: now - REDIRECT_REQUEST_TTL_MS - 1 };
    expect(isFreshRedirectRequest(stale, 0, now)).toBe(false);
  });
});
