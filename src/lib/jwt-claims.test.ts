import { describe, expect, it } from 'vitest';
import { claimLabel, decodeJwtClaims, formatClaim } from './jwt-claims';

const encode = (value: unknown) =>
  btoa(JSON.stringify(value)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

describe('decodeJwtClaims', () => {
  it('decodes a base64url payload, including non-ASCII text', () => {
    const token = `${encode({ alg: 'RS256' })}.${btoa(unescape(encodeURIComponent(JSON.stringify({ sub: 'u1', name: 'Zoë' })))).replace(/=+$/, '')}.sig`;
    expect(decodeJwtClaims(token)).toEqual({ sub: 'u1', name: 'Zoë' });
  });

  it('returns null for a token that is not a JWT', () => {
    expect(decodeJwtClaims('opaque')).toBeNull();
    expect(decodeJwtClaims('a.!!!.c')).toBeNull();
    expect(decodeJwtClaims(`a.${encode([1, 2])}.c`)).toBeNull();
  });
});

describe('formatClaim', () => {
  it('shows a NumericDate claim with its local time', () => {
    expect(formatClaim('exp', 0)).toBe(`0 (${new Date(0).toLocaleString()})`);
  });

  it('shows strings as-is and everything else as JSON', () => {
    expect(formatClaim('sub', 'u1')).toBe('u1');
    expect(formatClaim('aud', ['a', 'b'])).toBe('["a","b"]');
    expect(formatClaim('exp', 'soon')).toBe('soon');
  });
});

describe('claimLabel', () => {
  it('shortens a namespaced URL claim and names what it holds', () => {
    expect(claimLabel('https://getvim.ai/user_id')).toEqual({ short: '…vim.ai/user_id', meaning: 'User ID' });
    expect(claimLabel('https://getvim.ai/launch_id')).toEqual({ short: '…vim.ai/launch_id', meaning: 'Launch ID' });
  });

  it('keeps a registered claim name and explains it', () => {
    expect(claimLabel('sub')).toEqual({ short: 'sub', meaning: 'User ID' });
    expect(claimLabel('exp')).toEqual({ short: 'exp', meaning: 'Expires at' });
  });

  it('has no meaning for an unknown claim', () => {
    expect(claimLabel('custom')).toEqual({ short: 'custom', meaning: null });
  });
});
