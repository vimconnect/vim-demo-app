import { describe, expect, it } from 'vitest';
import type { AppManifest } from '@vimconnect/app-sdk';
import { entityLabel } from './entity-label';

const manifest = {
  operations: [
    { entityTypeId: 'providerRecord', sdkNamespace: 'provider', sdkMethod: 'getById' },
    { entityTypeId: 'patient', sdkNamespace: 'patient', sdkMethod: 'getById' },
  ],
} as unknown as AppManifest;

describe('entityLabel', () => {
  it('uses the SDK namespace, not the entity id', () => {
    expect(entityLabel(manifest, 'providerRecord')).toBe('Provider');
    expect(entityLabel(manifest, 'patient')).toBe('Patient');
  });

  it('falls back to the entity id when no operation names a namespace', () => {
    expect(entityLabel(manifest, 'facility')).toBe('Facility');
    expect(entityLabel(null, 'encounter')).toBe('Encounter');
  });
});
