'use client';

import type { ReactNode } from 'react';
import { InfoTip } from '@/components/Hint';
import { DocsLink } from '@/components/DocsLink';
import { CountBadge, splitCount } from '@/components/CountBadge';

type CollapsibleCardProps = {
  title: ReactNode;
  /** Shown after the title, e.g. an "Open in EHR" pill. */
  badge?: ReactNode;
  /** Help shown in an ⓘ hover tip after the title. */
  info?: ReactNode;
  /** Controls kept visible while collapsed: bulk buttons, a turn-all toggle. */
  actions?: ReactNode;
  /** Developer-docs path this card documents, e.g. `/docs/app-sdk/ehr-connectivity/`. */
  docsHref?: string;
  expanded: boolean;
  onToggle: () => void;
  children: ReactNode;
};

export function CollapsibleCard({ title, badge, info, actions, docsHref, expanded, onToggle, children }: CollapsibleCardProps) {
  const { name, count, complete } = splitCount(title);
  return (
    <div className={`entity-card ${expanded ? 'expanded' : ''}`}>
      <div className="entity-card-header">
        <button type="button" className="entity-card-toggle" aria-expanded={expanded} onClick={onToggle}>
          <span className="entity-card-chevron" aria-hidden="true" />
          <span className="updater-group-title">{name}</span>
          {count && <CountBadge count={count} complete={complete} />}
          {badge}
        </button>
        {info && <InfoTip label={`About ${typeof name === 'string' ? name : 'this card'}`}>{info}</InfoTip>}
        {docsHref && <DocsLink path={docsHref} />}
        {actions && <div className="updater-group-actions">{actions}</div>}
      </div>
      {expanded && <div className="entity-card-body">{children}</div>}
    </div>
  );
}
