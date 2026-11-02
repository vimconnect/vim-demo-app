import { describe, expect, it } from 'vitest';
import { formatManifestVersion } from './manifest-version-label';

describe('formatManifestVersion', () => {
  it('writes the status in words', () => {
    expect(formatManifestVersion({ version: 2, status: 'in_review' })).toBe('v2 (in review)');
    expect(formatManifestVersion({ version: 4, status: 'pending_release' })).toBe('v4 (pending release)');
    expect(formatManifestVersion({ version: 1, status: 'draft' })).toBe('v1 (draft)');
  });

  it('says unknown before the SDK reports a version', () => {
    expect(formatManifestVersion(null)).toBe('unknown');
  });
});
