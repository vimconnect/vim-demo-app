'use client';

import { Suspense, useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { getVimBackendUrl, getAppUrl } from '@/lib/sdk-config';
import { getConfig } from '@/lib/client-config';
import { ErrorScreen } from '@/components/ErrorScreen';
import { BrandLoader } from '@/components/BrandLoader';

/**
 * Landing Page - OAuth Flow Launcher
 *
 * This page receives the launch_id from the extension iframe URL
 * and immediately redirects to Vim's OAuth authorization endpoint
 */
type LaunchErrorDetail = {
  message: string;
  timestamp: string;
  userAgent: string;
};

function LaunchPageContent() {
  const searchParams = useSearchParams();
  const [error, setError] = useState<LaunchErrorDetail | null>(null);

  // Prevent duplicate redirects (React StrictMode runs effects twice)
  const redirectingRef = useRef(false);

  useEffect(() => {
    // Only redirect once
    if (redirectingRef.current) {
      console.log('LandingPage: Skipping duplicate redirect');
      return;
    }

    const launchId = searchParams.get('launch_id');

    console.log('LandingPage: Starting OAuth flow', { launchId });

    if (!launchId) {
      setError({
        message: 'Missing launch_id parameter. This app must be launched from Vim Connect extension.',
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
      });
      return;
    }

    // Mark as redirecting before any async operations
    redirectingRef.current = true;

    // Generate CSRF state token (only once!)
    // Use launch_id as the flow identifier to avoid conflicts between tabs.
    const csrfToken = crypto.randomUUID();
    const flowKey = `oauth_state_${launchId}`;
    sessionStorage.setItem(flowKey, csrfToken);
    console.log('LandingPage: Generated state token for flow:', {
      launchId: launchId.substring(0, 12) + '...',
      csrfToken: csrfToken.substring(0, 8) + '...',
    });

    // Encode launch_id in state parameter so we can look it up on callback
    // Format: "launchId:csrfToken"
    const stateParam = `${launchId}:${csrfToken}`;

    // Build OAuth authorization URL
    const vimBackendUrl = getVimBackendUrl();
    const clientId = getConfig().clientId;
    const appUrl = getAppUrl();

    const authorizeUrl = new URL('/app-auth/authorize', vimBackendUrl);
    authorizeUrl.searchParams.set('response_type', 'code');
    authorizeUrl.searchParams.set('client_id', clientId!);
    authorizeUrl.searchParams.set('launch', launchId);
    authorizeUrl.searchParams.set('scope', 'launch openid');
    authorizeUrl.searchParams.set('redirect_uri', `${appUrl}/app`);
    authorizeUrl.searchParams.set('state', stateParam);

    console.log('LandingPage: Redirecting to OAuth authorization:', authorizeUrl.toString());

    // Redirect to Vim OAuth
    window.location.href = authorizeUrl.toString();
  }, []); // Empty dependency array - only run once on mount

  if (error) {
    return (
      <ErrorScreen
        heading="Launch Error"
        message="Something went wrong. Please reopen this app from the Vim Connect extension."
        diagnostics={[
          { label: 'Error:', value: error.message },
          { label: 'Time:', value: error.timestamp },
          { label: 'Browser:', value: error.userAgent },
        ]}
        diagnosticsPanelId="launch-error-diagnostics-panel"
      />
    );
  }

  return <BrandLoader />;
}

export default function LandingPage() {
  return (
    <Suspense fallback={<BrandLoader />}>
      <LaunchPageContent />
    </Suspense>
  );
}
