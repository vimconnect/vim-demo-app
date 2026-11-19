import { Info } from 'lucide-react';
import { Badge, Tooltip } from '@vim-connect/ui';

/** The Console-style "Deprecated ⓘ" tag; hovering or focusing it shows what to use instead. Renders nothing for a null note. */
export function DeprecatedTag({ note }: { note: string | null }) {
  if (note === null) return null;
  return (
    <Tooltip label={`Deprecated — ${note}`}>
      <Badge variant="warning" size="sm" className="deprecated-tag" tabIndex={0}>
        Deprecated
        <Info aria-hidden="true" />
      </Badge>
    </Tooltip>
  );
}
