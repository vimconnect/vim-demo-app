'use client';

type OverviewCardProps = {
  /** EHR system identifier from the session context (e.g. "athena"); null on builds that send none. */
  ehr: string | null;
  sdkVersion: string;
  manifestVersion: { version: number; status: string } | null;
  /** Entity labels open in the EHR right now, e.g. "Patient", "Encounter". */
  inContext: string[];
};

/** "in_review" → "In review" */
const sentenceCase = (status: string) => {
  const words = status.replace(/_/g, ' ');
  return words.charAt(0).toUpperCase() + words.slice(1);
};

/**
 * The top of the app: connection and manifest status, then what's open in the EHR.
 * Read and write coverage is on the Read from EHR and Write to EHR cards, not here.
 */
export function OverviewCard({ ehr, sdkVersion, manifestVersion, inContext }: OverviewCardProps) {
  const details = [ehr, `SDK ${sdkVersion}`].filter(Boolean).join(' · ');
  return (
    <section className="overview-card" aria-label="Connection overview">
      <div className="overview-head">
        <h2 className="overview-title">
          <span className="status-dot" aria-hidden="true" />
          Connected
        </h2>
        <span className="overview-meta" title={details}>
          {details}
        </span>
        {manifestVersion && (
          <span
            className="badge badge-purple overview-status"
            title={`Manifest v${manifestVersion.version}`}
          >
            v{manifestVersion.version} · {sentenceCase(manifestVersion.status)}
          </span>
        )}
      </div>

      {inContext.length > 0 && (
        <div className="overview-row">
          {inContext.map((label) => (
            <span key={label} className="badge badge-info badge-dot">
              {label}
            </span>
          ))}
        </div>
      )}
    </section>
  );
}
