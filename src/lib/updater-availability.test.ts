import { describe, expect, it } from 'vitest';
import { unavailableReasonText } from './updater-availability';

describe('unavailableReasonText', () => {
  it('points at the manifest when the capability is not granted', () => {
    expect(unavailableReasonText('not_granted', 'encounter', 'write')).toMatch(/app manifest/);
  });

  it('describes an unconfigured read and write differently', () => {
    expect(unavailableReasonText('not_configured', 'referral', 'write')).toBe("This EHR can't write this field");
    expect(unavailableReasonText('not_configured', 'referral', 'read')).toBe("This EHR doesn't support this read");
  });

  it('asks to open the entity with the verb for the action and the right article', () => {
    expect(unavailableReasonText('not_in_context', 'encounter', 'write')).toBe('Open an encounter in the EHR to write it');
    expect(unavailableReasonText('not_in_context', 'referral', 'sample')).toBe('Open a referral in the EHR to sample its fields');
    expect(unavailableReasonText('not_in_context', 'referral', 'update')).toBe('Open a referral in the EHR to update its fields');
    expect(unavailableReasonText('not_in_context', 'encounter', 'read')).toBe('Open an encounter in the EHR to run it');
  });

  it('treats a missing capability as not in context', () => {
    expect(unavailableReasonText(undefined, 'order', 'write')).toBe('Open an order in the EHR to write it');
  });
});
