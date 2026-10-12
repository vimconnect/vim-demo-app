/** The Console-style "Deprecated ⓘ" tag; hovering it shows what to use instead. Renders nothing for a null note. */
export function DeprecatedTag({ note }: { note: string | null }) {
  if (note === null) return null;
  return (
    <span className="deprecated-tag" title={`Deprecated — ${note}`}>
      Deprecated
      <svg viewBox="0 0 16 16" aria-hidden="true">
        <circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 7v4M8 4.75v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </span>
  );
}
