import type { ReactNode } from 'react';

export function SearchIcon() {
  return (
    <svg className="nav-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

/** A Lucide line icon (the DS icon set), drawn inline so the demo app needs no icon package. */
function Lucide({ size = 16, children }: { size?: number; children: ReactNode }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}

type IconProps = { size?: number };

/** Lucide `inbox` */
export const InboxIcon = ({ size }: IconProps) => (
  <Lucide size={size}>
    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
    <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
  </Lucide>
);

/** Lucide `pen-line` */
export const PenLineIcon = ({ size }: IconProps) => (
  <Lucide size={size}>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
  </Lucide>
);

/** Lucide `bell` */
export const BellIcon = ({ size }: IconProps) => (
  <Lucide size={size}>
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </Lucide>
);

/** Lucide `shield-check` */
export const ShieldCheckIcon = ({ size }: IconProps) => (
  <Lucide size={size}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="m9 12 2 2 4-4" />
  </Lucide>
);

/** Lucide `cpu` */
export const CpuIcon = ({ size }: IconProps) => (
  <Lucide size={size}>
    <rect x="4" y="4" width="16" height="16" rx="2" />
    <rect x="9" y="9" width="6" height="6" />
    <path d="M15 2v2M15 20v2M2 15h2M2 9h2M20 15h2M20 9h2M9 2v2M9 20v2" />
  </Lucide>
);

/** Lucide `activity` */
export const ActivityIcon = ({ size }: IconProps) => (
  <Lucide size={size}>
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </Lucide>
);

/** Lucide `zap` */
export const ZapIcon = ({ size }: IconProps) => (
  <Lucide size={size}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </Lucide>
);

/** Lucide `radio` */
export const RadioIcon = ({ size }: IconProps) => (
  <Lucide size={size}>
    <path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9" />
    <path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5" />
    <circle cx="12" cy="12" r="2" />
    <path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5" />
    <path d="M19.1 4.9C23 8.8 23 15.1 19.1 19" />
  </Lucide>
);

/** Lucide `user` */
export const UserIcon = ({ size }: IconProps) => (
  <Lucide size={size}>
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </Lucide>
);

/** Lucide `arrow-down-to-line` */
export const ReadIcon = ({ size }: IconProps) => (
  <Lucide size={size}>
    <path d="M12 17V3" />
    <path d="m6 11 6 6 6-6" />
    <path d="M19 21H5" />
  </Lucide>
);

/** Lucide `arrow-up-from-line` */
export const WriteIcon = ({ size }: IconProps) => (
  <Lucide size={size}>
    <path d="m18 9-6-6-6 6" />
    <path d="M12 3v14" />
    <path d="M5 21h14" />
  </Lucide>
);

/** Lucide `copy` */
export const CopyIcon = ({ size }: IconProps) => (
  <Lucide size={size}>
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </Lucide>
);

/** Lucide `check` */
export const CheckIcon = ({ size }: IconProps) => (
  <Lucide size={size}>
    <path d="M20 6 9 17l-5-5" />
  </Lucide>
);
