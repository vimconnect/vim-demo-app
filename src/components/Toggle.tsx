'use client';

import type { ReactNode } from 'react';
import { Toggle as SharedToggle, Tooltip } from '@vim-connect/ui';

type ToggleProps = {
  on: boolean;
  onChange: (on: boolean) => void;
  /** Accessible name; also the switch's tooltip when no visible label is given. */
  label: string;
  /** Visible text beside the switch, e.g. "Turn all on". Clicking it flips the switch too. */
  children?: ReactNode;
  /** Visible text goes before the switch instead of after it. */
  labelFirst?: boolean;
  disabled?: boolean;
};

/**
 * The demo app's switch: the shared DS Toggle (@vim-connect/ui, sm), with an
 * optional visible label beside it. No visible label → the shared Tooltip
 * carries the name on hover/focus.
 */
export function Toggle({ on, onChange, label, children, labelFirst, disabled }: ToggleProps) {
  const sw = <SharedToggle size="sm" checked={on} onChange={onChange} label={label} disabled={disabled} />;
  if (!children) return <Tooltip label={label}>{sw}</Tooltip>;
  const text = (
    <span
      className={`toggle-label${disabled ? '' : ' is-clickable'}`}
      onClick={() => !disabled && onChange(!on)}
    >
      {children}
    </span>
  );
  return (
    <span className="toggle-switch">
      {labelFirst && text}
      {sw}
      {!labelFirst && text}
    </span>
  );
}
