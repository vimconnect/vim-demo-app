import type { ReactNode } from 'react';
import { Notice as SharedNotice, StatusDot, type NoticeVariant } from '@vim-connect/ui';

type NoticeTone = 'blue' | 'purple' | 'orange' | 'error';

const VARIANT: Record<NoticeTone, NoticeVariant> = {
  blue: 'info',
  purple: 'purple',
  orange: 'warning',
  error: 'error',
};

/** The shared DS Notice (@vim-connect/ui); the demo app's tone names map onto its variants. */
export function Notice({ tone = 'blue', children }: { tone?: NoticeTone; children: ReactNode }) {
  return (
    <SharedNotice variant={VARIANT[tone]} role={tone === 'error' ? 'alert' : 'status'}>
      {children}
    </SharedNotice>
  );
}

export function StatusLine({ tone = 'live', children }: { tone?: 'live' | 'waiting' | 'off'; children: ReactNode }) {
  return (
    <span className={`status-line is-${tone}`}>
      <StatusDot tone={tone === 'live' ? 'success' : 'neutral'} motion={tone === 'waiting' ? 'blink' : 'none'} />
      {children}
    </span>
  );
}
