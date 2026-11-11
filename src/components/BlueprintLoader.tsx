/** The caption under the loader. */
export const LOADING_CAPTION = "Loading…";

type BlueprintLoaderProps = {
  title?: string;
  /** Top-left blueprint tag, e.g. ["Sys://App", "Launch"] */
  tagA?: [string, string];
  /** Bottom-right blueprint tag, e.g. ["Session", "Handshake"] */
  tagB?: [string, string];
};

/**
 * Vim's blueprint loader, as shown during Console sign-in. Styles live in
 * globals.css (`.vc-blueprint-loader`, `.vim-blueprint*`).
 */
export function BlueprintLoader({
  title = LOADING_CAPTION,
  tagA = ["Sys://App", "Launch"],
  tagB = ["Session", "Handshake"],
}: BlueprintLoaderProps) {
  return (
    <div className="vc-blueprint-loader" role="status" aria-live="polite">
      <div className="vim-blueprint" aria-hidden="true">
        <div className="vim-blueprint-tick tl" />
        <div className="vim-blueprint-tick tr" />
        <div className="vim-blueprint-tick bl" />
        <div className="vim-blueprint-tick br" />
        <span className="vim-blueprint-tag a">
          {tagA[0]}
          <br />
          <b>{tagA[1]}</b>
        </span>
        <span className="vim-blueprint-tag b">
          {tagB[0]}
          <br />
          <b>{tagB[1]}</b>
        </span>

        <div className="vim-blueprint-radar">
          <div className="vim-blueprint-ring r1" />
          <div className="vim-blueprint-ring r2" />
          <div className="vim-blueprint-sweep" />
          <div className="vim-blueprint-net">
            <svg viewBox="0 0 180 180">
              <path className="vim-blueprint-connector" d="M90,90 L90,14.4" />
              <path className="vim-blueprint-connector" d="M90,90 L162,122.4" />
              <path className="vim-blueprint-connector" d="M90,90 L43.2,162" />
              <path className="vim-blueprint-connector" d="M90,90 L7.2,57.6" />
            </svg>
            <div className="vim-blueprint-node n1" />
            <div className="vim-blueprint-node n2" />
            <div className="vim-blueprint-node n3" />
            <div className="vim-blueprint-node n4" />
          </div>
          <div className="vim-blueprint-core">
            <svg viewBox="0 0 32 32" aria-hidden="true">
              {/* Vim mark (two-tone, same paths as the brand favicon) */}
              <path d="M28.13 13.83c1.95-2.45 1.48-5.97-1.03-7.86-2.52-1.9-6.13-1.44-8.08 1L15.9 10.9l7.28 9.17z" fill="var(--color-blue)" />
              <path d="M12.9 6.97C10.97 4.53 7.38 4.08 4.89 5.97 2.39 7.86 1.93 11.38 3.86 13.82l9.5 12.04c.59.8 1.55 1.33 2.64 1.33s2.05-.53 2.65-1.33l4.58-5.8z" fill="var(--color-cyan)" />
            </svg>
          </div>
        </div>
      </div>
      <p className="vc-blueprint-loader__title">{title}</p>
      <div className="vim-blueprint-progress" />
    </div>
  );
}
