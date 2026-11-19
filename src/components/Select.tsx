'use client';

import { Select as SharedSelect } from '@vim-connect/ui';

type Option<V extends string> = { value: V; label: string };

type SelectProps<V extends string> = {
  value: V;
  options: Option<V>[];
  onChange: (value: V) => void;
  /** Accessible name, since the trigger shows only the chosen option. */
  label: string;
  disabled?: boolean;
  className?: string;
};

/** The shared DS Select (@vim-connect/ui), typed to the demo app's string-literal values. */
export function Select<V extends string>({ value, options, onChange, label, disabled, className }: SelectProps<V>) {
  return (
    <SharedSelect
      className={className}
      ariaLabel={label}
      value={value}
      options={options}
      onChange={(next) => onChange(next as V)}
      disabled={disabled}
    />
  );
}
