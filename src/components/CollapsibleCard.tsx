'use client';

import type { ReactNode } from 'react';
import { AccordionItem } from '@vim-connect/ui';
import { InfoTip } from '@/components/Hint';
import { DocsLink } from '@/components/DocsLink';
import { CountBadge, splitCount } from '@/components/CountBadge';

type CollapsibleCardProps = {
  /** Stable id within the parent `Accordion`. */
  id: string;
  title: ReactNode;
  /** Shown after the title, e.g. an "Open in EHR" pill. */
  badge?: ReactNode;
  /** Help shown in an ⓘ hover tip beside the title. */
  info?: ReactNode;
  /** Controls kept visible while collapsed: bulk buttons, a turn-all toggle. */
  actions?: ReactNode;
  /** Developer-docs path this card documents, e.g. `/docs/app-sdk/ehr-connectivity/`. */
  docsHref?: string;
  expanded: boolean;
  onToggle: () => void;
  children: ReactNode;
};

/**
 * One entity row (Patient, Fields, API writes) as an item of the caller's `Accordion`.
 * A trailing "(3/5)" in the title shows as a count badge. The ⓘ tip, docs link and
 * actions sit beside the header button, so using them doesn't open or close the row.
 * The body mounts only while open.
 */
export function CollapsibleCard({ id, title, badge, info, actions, docsHref, expanded, onToggle, children }: CollapsibleCardProps) {
  const { name, count, complete } = splitCount(title);
  const aside = (count || badge) && (
    <>
      {count && <CountBadge count={count} complete={complete} />}
      {badge}
    </>
  );
  const controls = (info || docsHref || actions) && (
    <>
      {info && <InfoTip label={`About ${typeof name === 'string' ? name : 'this card'}`}>{info}</InfoTip>}
      {docsHref && <DocsLink path={docsHref} />}
      {actions}
    </>
  );
  return (
    // `entity-card` has no styles: e2e helpers find a row by it.
    <AccordionItem
      id={id}
      className="entity-card"
      title={name}
      aside={aside}
      actions={controls}
      open={expanded}
      onOpenChange={onToggle}
    >
      {expanded && children}
    </AccordionItem>
  );
}
