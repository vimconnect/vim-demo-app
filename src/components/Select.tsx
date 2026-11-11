'use client';

import { useEffect, useId, useRef, useState } from 'react';

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

/**
 * DS Select: a full-pill trigger that opens a glass panel of options. Arrow keys move,
 * Enter or Space picks, Escape or a click outside closes.
 */
export function Select<V extends string>({ value, options, onChange, label, disabled, className = '' }: SelectProps<V>) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(() => Math.max(0, options.findIndex((o) => o.value === value)));
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = `select-${useId().replace(/[^\w-]/g, '')}`;
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  const pick = (index: number) => {
    const option = options[index];
    if (option) onChange(option.value);
    setOpen(false);
  };

  const openAt = () => {
    setActive(Math.max(0, options.findIndex((o) => o.value === value)));
    setOpen(true);
  };

  return (
    <div ref={rootRef} className={`select ${className}`}>
      <button
        type="button"
        className={`select-trigger${open ? ' is-open' : ''}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={`${label}: ${selected?.label ?? ''}`}
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : openAt())}
        onKeyDown={(e) => {
          if (e.key === 'Escape') return setOpen(false);
          if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault();
            if (!open) return openAt();
            const step = e.key === 'ArrowDown' ? 1 : -1;
            setActive((i) => (i + step + options.length) % options.length);
          }
          if (open && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            pick(active);
          }
        }}
      >
        <span className="select-value">{selected?.label}</span>
        <svg className="select-chevron" width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <ul id={listId} className="select-panel" role="listbox" aria-label={label}>
          {options.map((option, i) => (
            <li
              key={option.value}
              role="option"
              aria-selected={option.value === value}
              className={`select-option${option.value === value ? ' is-selected' : ''}${i === active ? ' is-active' : ''}`}
              onMouseEnter={() => setActive(i)}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => pick(i)}
            >
              <span>{option.label}</span>
              {option.value === value && (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M2.5 7l3 3 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
