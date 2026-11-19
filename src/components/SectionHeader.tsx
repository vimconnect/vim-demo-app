'use client';

import type { MouseEvent, ReactNode } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { CardHeader, IconButton } from '@vim-connect/ui';
import { CountBadge, splitCount } from '@/components/CountBadge';
import { DocsLink } from '@/components/DocsLink';
import { InfoTip } from '@/components/Hint';

type SectionHeaderProps = {
  /** A trailing "(9/10)" or "(3)" renders as a count badge. */
  title: string;
  collapsed: boolean;
  onToggle: () => void;
  /** Help shown in an ⓘ hover card after the title. */
  info?: ReactNode;
  /** Developer-docs path this section documents. */
  docsHref?: string;
  /** A Lucide icon, shown in the card header's icon badge. */
  icon?: ReactNode;
  /** One plain-language line under the title: what this section is for. */
  subtitle?: string;
};

/**
 * A collapsible section's header: the shared DS CardHeader (icon badge, title with its count,
 * one hint line) with the docs link and a chevron IconButton. Clicking the row toggles too,
 * except on its own links and buttons.
 */
export function SectionHeader({ title, collapsed, onToggle, info, docsHref, icon, subtitle }: SectionHeaderProps) {
  const { name, count, complete } = splitCount(title);
  const onRowClick = (e: MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('a, button, [role="button"]')) return;
    onToggle();
  };
  return (
    <CardHeader
      className="section-header"
      onClick={onRowClick}
      icon={icon}
      hint={subtitle}
      title={
        <span className="section-title-row">
          {name}
          {count && <CountBadge count={count} complete={complete} />}
          {info && <InfoTip label={`About ${name}`}>{info}</InfoTip>}
        </span>
      }
      actions={
        <>
          {docsHref && <DocsLink path={docsHref} />}
          <IconButton
            size="sm"
            label={collapsed ? `Expand ${name}` : `Collapse ${name}`}
            icon={collapsed ? <ChevronDown /> : <ChevronUp />}
            aria-expanded={!collapsed}
            onClick={onToggle}
          />
        </>
      }
    />
  );
}
