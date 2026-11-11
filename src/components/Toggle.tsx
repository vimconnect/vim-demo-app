'use client';

import type { ReactNode } from 'react';

type ToggleProps = {
  on: boolean;
  onChange: (on: boolean) => void;
  /** Accessible name; also the hover title when no visible label is given. */
  label: string;
  /** Visible text beside the switch, e.g. "Turn all on". */
  children?: ReactNode;
  /** Visible text goes before the switch instead of after it. */
  labelFirst?: boolean;
  disabled?: boolean;
};

/** DS Toggle Switch: a `role="switch"` button, so keyboard and screen readers get the state. */
export function Toggle({ on, onChange, label, children, labelFirst, disabled }: ToggleProps) {
  const text = children ? <span className="toggle-label">{children}</span> : null;
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      title={children ? undefined : label}
      disabled={disabled}
      className={`toggle-switch${disabled ? ' toggle-blocked' : ''}`}
      onClick={() => onChange(!on)}
    >
      {labelFirst && text}
      <span className={`toggle-track${on ? ' active' : ''}`}>
        <span className="toggle-thumb" />
      </span>
      {!labelFirst && text}
    </button>
  );
}
