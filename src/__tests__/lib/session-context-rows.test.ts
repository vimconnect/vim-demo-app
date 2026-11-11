import { describe, it, expect } from 'vitest';
import { sessionContextRows } from '@/lib/session-context-rows';

const base = {
  sessionId: 's-1',
  deviceId: 'd-1',
  userId: 'u-1',
  account: { id: 'acc-1', name: 'Clinic' },
  ehrType: 'ecw_web',
};

describe('sessionContextRows', () => {
  it('lists every data field in a stable order, with the account flattened', () => {
    expect(sessionContextRows(base).map((r) => [r.label, r.value])).toEqual([
      ['EHR', 'ecw_web'],
      ['Account name', 'Clinic'],
      ['Account ID', 'acc-1'],
      ['User ID', 'u-1'],
      ['Session ID', 's-1'],
      ['Device ID', 'd-1'],
    ]);
  });

  it('shows a field a newer SDK adds without a code change, labelled from its name', () => {
    const rows = sessionContextRows({ ...base, ehrUsername: 'dr.smith', practiceLocationId: 'loc-9' });
    expect(rows[0]).toEqual({ key: 'ehrUsername', label: 'EHR username', value: 'dr.smith' });
    expect(rows.at(-1)).toEqual({ key: 'practiceLocationId', label: 'Practice location ID', value: 'loc-9' });
  });

  it('skips methods and empty values', () => {
    const ctx = { ...base, getIdToken: () => Promise.resolve({ idToken: 'x' }), ehrUsername: undefined };
    expect(sessionContextRows(ctx).map((r) => r.key)).not.toContain('getIdToken');
    expect(sessionContextRows(ctx).map((r) => r.key)).not.toContain('ehrUsername');
  });

  it('is empty without a session context', () => {
    expect(sessionContextRows(null)).toEqual([]);
  });
});
