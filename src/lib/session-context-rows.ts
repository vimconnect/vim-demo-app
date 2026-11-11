export type SessionContextRow = { key: string; label: string; value: string };

const LABELS: Record<string, string> = {
  ehrUsername: 'EHR username',
  ehrType: 'EHR',
  'account.name': 'Account name',
  'account.id': 'Account ID',
  userId: 'User ID',
  sessionId: 'Session ID',
  deviceId: 'Device ID',
};

const ORDER = Object.keys(LABELS);

/** "fooBarId" → "Foo bar ID", for a field the SDK added after this list was written. */
function humanize(key: string): string {
  const words = key
    .split('.')
    .flatMap((part) => part.replace(/([a-z0-9])([A-Z])/g, '$1 $2').split(/\s+/))
    .map((word) => (word.toLowerCase() === 'id' ? 'ID' : word.toLowerCase()));
  const text = words.join(' ');
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function flatten(value: unknown, prefix: string, out: Array<[string, unknown]>): void {
  if (typeof value === 'function' || value === undefined || value === null) return;
  if (typeof value === 'object' && !Array.isArray(value)) {
    for (const [key, child] of Object.entries(value)) flatten(child, prefix ? `${prefix}.${key}` : key, out);
    return;
  }
  out.push([prefix, value]);
}

/**
 * One row per data field the SDK put on `sessionContext`, nested objects flattened
 * (`account.name`), so a field a newer SDK adds shows up without a code change.
 */
export function sessionContextRows(sessionContext: object | null): SessionContextRow[] {
  if (sessionContext === null) return [];
  const entries: Array<[string, unknown]> = [];
  flatten(sessionContext, '', entries);
  const rank = (key: string) => {
    const i = ORDER.indexOf(key);
    return i === -1 ? ORDER.length : i;
  };
  return entries
    .sort(([a], [b]) => rank(a) - rank(b))
    .map(([key, value]) => ({
      key,
      label: LABELS[key] ?? humanize(key),
      value: typeof value === 'string' ? value : JSON.stringify(value),
    }));
}
