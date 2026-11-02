/** The caption under the loader. Matches the Vim Hub side panel's, so the hand-over shows no change. */
export const LOADING_CAPTION = "Loading…";

/** The Vim Hub's brand loader. Keep the markup in step with extension/src/auth/BrandDotLoader.tsx. */
export function BrandLoader({ message = LOADING_CAPTION }: { message?: string }) {
  return (
    <div className="brand-loader">
      <div className="vim-dots" role="status" aria-label={message}>
        <span className="vim-dots__dot" />
        <span className="vim-dots__dot" />
        <span className="vim-dots__dot" />
        <span className="vim-dots__dot" />
      </div>
      <p className="brand-loader__message">{message}</p>
    </div>
  );
}
