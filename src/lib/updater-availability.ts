export type UnavailableReason = 'not_granted' | 'not_configured' | 'not_in_context';
export type CapabilityAction = 'write' | 'read' | 'sample' | 'update';

const IN_CONTEXT_VERB: Record<CapabilityAction, string> = {
  write: 'write it',
  read: 'run it',
  sample: 'sample its fields',
  update: 'update its fields',
};

function withArticle(noun: string): string {
  return `a${/^[aeiou]/i.test(noun) ? 'n' : ''} ${noun}`;
}

/** The short line shown when `getCapability()` is unavailable for `action`. */
export function unavailableReasonText(
  reason: string | undefined,
  entityType: string,
  action: CapabilityAction,
): string {
  switch (reason) {
    case 'not_granted':
      return 'Not in your app manifest — add it on the EHR tab';
    case 'not_configured':
      return action === 'read' ? "This EHR doesn't support this read" : "This EHR can't write this field";
    default:
      return `Open ${withArticle(entityType)} in the EHR to ${IN_CONTEXT_VERB[action]}`;
  }
}
