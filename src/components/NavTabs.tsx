'use client';

export type DemoView = 'main' | 'explorer' | 'docs' | 'manifest';

const GITHUB_PATH =
  'M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z';

export function GithubIcon({ className = 'nav-icon' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" aria-hidden="true">
      <path fill="currentColor" d={GITHUB_PATH} />
    </svg>
  );
}

function DocsIcon() {
  return (
    <svg className="nav-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z" />
      <path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5" />
    </svg>
  );
}

function FlashIcon() {
  return (
    <svg className="nav-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2 3 14h9l-1 8 10-12h-9z" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg className="nav-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

type NavTabsProps = {
  view: DemoView;
  onGetCode: () => void;
  /** Called with 'main' when the open tab is tapped again. */
  onNavigate: (view: DemoView) => void;
};

/** The app's tab bar, pinned to the top of the panel. */
export function NavTabs({ view, onGetCode, onNavigate }: NavTabsProps) {
  const tab = (target: Exclude<DemoView, 'main'>, icon: React.ReactNode, label: string) => (
    <button
      type="button"
      className={`nav-tab ${view === target ? 'active' : ''}`}
      aria-current={view === target ? 'page' : undefined}
      onClick={() => onNavigate(view === target ? 'main' : target)}
    >
      {icon}
      <span className="nav-tab-label">{label}</span>
    </button>
  );
  return (
    <nav className="nav-tabs" aria-label="Demo app">
      {tab('docs', <DocsIcon />, 'Docs')}
      <button type="button" className="nav-tab" onClick={onGetCode}>
        <GithubIcon />
        <span className="nav-tab-label">Code</span>
      </button>
      {tab('manifest', <EyeIcon />, 'Manifest')}
      {tab('explorer', <FlashIcon />, 'Auto runner')}
    </nav>
  );
}

/** Breadcrumb back to the main view, above every sub-page. */
export function Breadcrumb({ title, onBack, actions }: { title: string; onBack: () => void; actions?: React.ReactNode }) {
  return (
    <div className="breadcrumb-bar">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <button type="button" className="breadcrumb-link" onClick={onBack}>
          ← Demo app
        </button>
        <span className="breadcrumb-sep" aria-hidden="true">/</span>
        <span className="breadcrumb-current" aria-current="page">{title}</span>
      </nav>
      {actions && <div className="breadcrumb-actions">{actions}</div>}
    </div>
  );
}
