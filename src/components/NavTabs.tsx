'use client';

import { IconButton, TabBar } from '@vim-connect/ui';

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

type NavTabsProps = {
  view: DemoView;
  onGetCode: () => void;
  onNavigate: (view: DemoView) => void;
};

/** `idPrefix` shared by the view tabs and the `TabPanel` around the current view. */
export const VIEW_TABS_ID = 'demo-view';

const VIEW_TABS = [
  { id: 'main', label: 'Overview' },
  { id: 'docs', label: 'Docs' },
  { id: 'manifest', label: 'Manifest' },
  { id: 'explorer', label: 'Auto runner' },
] as const satisfies readonly { id: DemoView; label: string }[];

/** The app's top bar: the view tabs (Overview is the home view) and the GitHub icon button that opens the fork dialog. */
export function NavTabs({ view, onGetCode, onNavigate }: NavTabsProps) {
  return (
    <div className="nav-bar">
      <div className="nav-bar-tabs">
        <TabBar tabs={VIEW_TABS} activeTab={view} onSelect={onNavigate} ariaLabel="Demo app" idPrefix={VIEW_TABS_ID} compact flush noGap />
      </div>
      <IconButton size="sm" label="This app's source on GitHub" icon={<GithubIcon />} onClick={onGetCode} />
    </div>
  );
}
