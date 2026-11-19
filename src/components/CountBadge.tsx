import type { ReactNode } from 'react';
import { Badge } from '@vim-connect/ui';

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
  // A count or a done/total fraction ("3/5"), so the shared Badge (sm), not the numeric CountBadge.
  return (
    <Badge size="sm" variant={complete ? 'success' : 'neutral'}>
      {count}
    </Badge>
  );
}
