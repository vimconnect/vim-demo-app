/**
 * SDK Configuration
 *
 * Calculates SDK URL, backend URL, and app URL based on environment.
 * Reads env from window.__CONFIG__ (injected by layout.tsx at SSR time) so
 * runtime helm values take effect rather than build-time Docker ARGs.
 */

import { getConfig } from './client-config';
import { VIM_BACKEND_URLS, APP_URLS, DEVELOPER_DOCS_URLS } from './url-constants';

export function getEnvironment(): 'local' | 'staging' | 'production' {
  return getConfig().env;
}

export function getVimBackendUrl(): string {
  if (process.env.NEXT_PUBLIC_VIM_BACKEND_URL) {
    return process.env.NEXT_PUBLIC_VIM_BACKEND_URL;
  }
  return VIM_BACKEND_URLS[getEnvironment()];
}

export function getAppUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }

  // Client-side: use current origin (always correct!)
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  return APP_URLS[getEnvironment()];
}

export function getDeveloperDocsUrl(): string {
  return DEVELOPER_DOCS_URLS[getEnvironment()];
}
