import type { ReactNode } from 'react';

/** Splits a trailing "(9/10)" or "(3)" off a title so the count can render as a badge. */
export function splitCount(title: ReactNode): { name: ReactNode; count: string | null; complete: boolean } {
  const match = typeof title === 'string' ? /^(.*?)\s*\((\d+)(?:\/(\d+))?\)$/.exec(title) : null;
  if (!match) return { name: title, count: null, complete: false };
  const [, name, done, total] = match;
  return {
    name,
    count: total === undefined ? done : `${done}/${total}`,
    complete: total !== undefined && done === total && total !== '0',
  };
}

/** DS badge: success when everything is available, neutral otherwise. */
export function CountBadge({ count, complete }: { count: string; complete: boolean }) {
  return <span className={`badge ${complete ? 'badge-success' : 'badge-neutral'} count-badge`}>{count}</span>;
}
