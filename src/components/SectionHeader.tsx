'use client';

import type { ReactNode } from 'react';
import { CountBadge, splitCount } from '@/components/CountBadge';
import { DocsLink } from '@/components/DocsLink';
import { InfoTip } from '@/components/Hint';

type SectionHeaderProps = {
  /** A trailing "(9/10)" or "(3)" renders as a count badge. */
  title: string;
  collapsed: boolean;
  onToggle: () => void;
  /** Help shown in an ⓘ hover tip after the title. */
  info?: ReactNode;
  /** Developer-docs path this section documents. */
  docsHref?: string;
  /** A Lucide icon, shown in a DS heading icon tile before the title. */
  icon?: ReactNode;
  /** One plain-language line under the title: what this section is for. */
  subtitle?: string;
};

/** The clickable title row of a section card: title, count badge, ⓘ tip, Learn link, chevron. */
export function SectionHeader({ title, collapsed, onToggle, info, docsHref, icon, subtitle }: SectionHeaderProps) {
  const { name, count, complete } = splitCount(title);
  return (
    <div
      className="section-header"
      role="button"
      tabIndex={0}
      aria-expanded={!collapsed}
      onClick={onToggle}
      // A mouse click shouldn't leave the keyboard focus ring on the header.
      onMouseDown={(e) => e.preventDefault()}
      onKeyDown={(e) => {
        if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onToggle();
        }
      }}
    >
      {icon && (
        <span className="icon-tile icon-tile--heading" aria-hidden="true">
          {icon}
        </span>
      )}
      <span className="section-heading">
        <span className="section-title-row">
          <h2 className="section-title">{name}</h2>
          {count && <CountBadge count={count} complete={complete} />}
          {info && <InfoTip label={`About ${name}`}>{info}</InfoTip>}
        </span>
        {subtitle && <span className="section-subtitle">{subtitle}</span>}
      </span>
      {docsHref && <DocsLink path={docsHref} />}
      <span className={`section-chevron${collapsed ? '' : ' open'}`} aria-hidden="true" />
    </div>
  );
}
