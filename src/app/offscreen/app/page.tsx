'use client';

import { Suspense, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { initWorkerVimSDK } from '@vimconnect/app-sdk';
import type { WorkerSDK, ContextData, HubNamespace } from '@vimconnect/app-sdk';
import { getEnvironment } from '@/lib/sdk-config';
import {
  DEMO_WORKER_STATE_KEY,
  REFRESH_DEMO_EVENT,
  buildDemoWorkerData,
} from '@/lib/worker-demo';
import {
  DEMO_APP_REPO_URL,
  REDIRECT_HANDLED_EVENT,
  REDIRECT_REQUEST_STATE_KEY,
  pickWelcomePush,
  type RedirectRequest,
} from '@/lib/welcome-push';

/**
 * Offscreen Worker App Page — headless background SDK worker (Phase 1)
 *
 * Loaded inside a hidden iframe managed by OffscreenAppManager.
 * Uses VimSDK.initWorker() (WorkerSDK) to:
 *   - Register for context events (patient, encounter) and write to workerState
 *   - Show a welcome push once, on the first context or workflow event
 *   - Monitor hub.appState (whether the UI App is visible)
 *
 * Auth flow (mirrors the old offscreen/app pattern):
 *   1. OAuth code + state arrive via query params
 *   2. CSRF state validated from sessionStorage
 *   3. Code exchanged for access token via /token
 *   4. VimSDK.initWorker({ accessToken }) called
 *
 * This page renders no visible UI.
 * Look for '[offscreen/worker]' console messages for E2E test verification.
 */
function OffscreenWorkerContent() {
  const searchParams = useSearchParams();
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    initWorker();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function initWorker() {
    try {
      const code = searchParams.get('code');
      const stateParam = searchParams.get('state');

      if (!code || !stateParam) {
        console.error('[offscreen/worker] Missing OAuth parameters');
        return;
      }

      // CSRF validation
      const stateParts = stateParam.split(':');
      if (stateParts.length !== 2) {
        console.error('[offscreen/worker] Malformed state parameter');
        return;
      }
      const [launchId, csrfToken] = stateParts;
      const flowKey = `oauth_state_${launchId}`;
      const storedCsrf = sessionStorage.getItem(flowKey);
      if (storedCsrf !== csrfToken) {
        console.error('[offscreen/worker] CSRF state mismatch');
        return;
      }
      sessionStorage.removeItem(flowKey);

      // Exchange code for access token
      const tokenRes = await fetch('/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      if (!tokenRes.ok) {
        console.error('[offscreen/worker] Token exchange failed');
        return;
      }

      const { access_token: accessToken } = await tokenRes.json().catch(() => ({}));
      if (!accessToken) {
        console.error('[offscreen/worker] No access_token in response');
        return;
      }

      // Initialise Worker SDK (uses VIM_SDK_READY + contextType='worker' handshake).
      // Same runtime override as the UI page: only when THIS app is running in
      // staging do we point the SDK at the staging core-sdk, so the staging worker
      // surface exercises the workspace SDK too. `__overrideEnv` is runtime-only
      // (not in the public type) → cast. Origin gate still applies (this page is
      // served from the demo-app origin, which is whitelisted on staging).
      const sdk: WorkerSDK = await initWorkerVimSDK({
        accessToken,
        ...(getEnvironment() === 'staging' ? { __overrideEnv: 'staging' } : {}),
      } as Parameters<typeof initWorkerVimSDK>[0] & { __overrideEnv?: 'staging' });
      console.log('[offscreen/worker] Worker SDK ready');

      // ── Worker App → UI App round-trip demo (workerState + appEvents) ────────
      // Seed mock state immediately so the UI App has something to render on
      // open (workerState is subscribe-and-sync). A refreshCount closure lets
      // each regeneration produce visibly-new data.
      let demoRefreshCount = 0;
      const writeDemoData = () => {
        demoRefreshCount += 1;
        const data = buildDemoWorkerData(demoRefreshCount);
        sdk.workerState.write(DEMO_WORKER_STATE_KEY, data);
        console.log('[offscreen/worker] workerState.write demoWorkerData', data);
      };
      writeDemoData();

      // appEvents is capability-gated: present only when the host extension
      // advertises it. Older extensions leave it undefined — degrade gracefully
      // (initial state still syncs; the UI App's Refresh button becomes a no-op).
      if (sdk.appEvents) {
        sdk.appEvents.on(REFRESH_DEMO_EVENT, () => {
          console.log('[offscreen/worker] appEvents received:', REFRESH_DEMO_EVENT, '→ regenerating');
          writeDemoData();
        });
        console.log('[offscreen/worker] appEvents listener registered for', REFRESH_DEMO_EVENT);
      } else {
        console.warn(
          '[offscreen/worker] appEvents NOT supported by this extension — Refresh button will be a no-op',
        );
      }

      // ── Monitor UI App open/close state ──────────────────────────────────────
      sdk.hub.appState.subscribe('appOpenStatus', (status: { isAppOpen: boolean }) => {
        console.log('[offscreen/worker] App open status changed:', status.isAppOpen);
        sdk.workerState.write('appIsOpen', status.isAppOpen);
      });

      // ── Welcome push, once per worker lifetime ───────────────────────────────
      // A worker can push only through a handle from a context or workflow callback.
      let welcomeShown = false;
      // The SDK drops a push's button callbacks when its context clears, so the
      // push must not outlive the context it was sent from.
      let openWelcome: { notificationId: string; contextKey: string } | null = null;
      sdk.appEvents?.on(REDIRECT_HANDLED_EVENT, () => {
        sdk.workerState.remove(REDIRECT_REQUEST_STATE_KEY);
      });
      const showWelcomeOnce = (hub: HubNamespace | undefined, trigger: string) => {
        if (welcomeShown || hub == null) return;
        welcomeShown = true;
        const { title, text } = pickWelcomePush();
        const notificationId = `demo-welcome-${Date.now()}`;
        const settle = () => {
          openWelcome = null;
        };
        if (supportedContexts.includes(trigger)) openWelcome = { notificationId, contextKey: trigger };
        hub.pushNotification.show({
          title,
          text,
          notificationId,
          timeoutInSec: 20,
          onTap: settle,
          onTimeout: settle,
          actionButtons: {
            leftButton: {
              text: 'View code',
              buttonStyle: 'LINK',
              openAppButton: true,
              callback: () => {
                settle();
                const request: RedirectRequest = { url: DEMO_APP_REPO_URL, requestedAt: Date.now() };
                sdk.workerState.write(REDIRECT_REQUEST_STATE_KEY, request);
              },
            },
            rightButton: {
              text: 'Explore app',
              buttonStyle: 'PRIMARY',
              openAppButton: true,
              callback: settle,
            },
          },
        })
          .then((result) => {
            console.log(`[offscreen/worker] Welcome push (${trigger}):`, result);
            if (result.status !== 'sent') {
              welcomeShown = false;
              settle();
            }
          })
          .catch((err) => {
            welcomeShown = false;
            settle();
            console.error('[offscreen/worker] Welcome push failed:', err);
          });
      };

      // ── Register for context changes ──────────────────────────────────────────
      // Hardcode context keys — WorkerSDK does not expose getManifest().
      const supportedContexts = [
        'chart_open:patient',
        'encounter_open:encounter',
        'encounter_open:patient',
        'referral_open:referral',
      ];

      for (const contextKey of supportedContexts) {
        try {
          sdk.ehr.context.register<ContextData>(
            contextKey,
            {
              operations: ['notify'],
              debounceMs: 200,
            },
            (prev, curr, handle) => {
              if (curr == null) {
                console.log(`[offscreen/worker] Context cleared: ${contextKey}`);
                if (openWelcome?.contextKey === contextKey) {
                  handle.hub?.pushNotification.hide(openWelcome.notificationId);
                  openWelcome = null;
                }
                return;
              }
              console.log(`[offscreen/worker] Context changed: ${contextKey}`, curr?.fields);
              showWelcomeOnce(handle.hub, contextKey);
            }
          );
          console.log(`[offscreen/worker] Registered context: ${contextKey}`);
        } catch (err) {
          console.warn(`[offscreen/worker] Context not available: ${contextKey}`, err);
        }
      }

      // register throws for an event the EHR or the manifest doesn't support.
      for (const event of ['order_select', 'order_sign', 'referral_save']) {
        try {
          sdk.ehr.workflow.register(event, { operations: ['notify'] }, (_payload, handle) => {
            console.log(`[offscreen/worker] Workflow event: ${event}`);
            showWelcomeOnce(handle.hub, event);
          });
          console.log(`[offscreen/worker] Registered workflow event: ${event}`);
        } catch (err) {
          console.warn(`[offscreen/worker] Workflow event not available: ${event}`, err);
        }
      }

      console.log('[offscreen/worker] Worker SDK fully initialized');
    } catch (err) {
      console.error('[offscreen/worker] Init error:', err);
    }
  }

  // No visible UI — runs silently in a hidden background iframe
  return null;
}

export default function OffscreenWorkerPage() {
  return (
    <Suspense fallback={null}>
      <OffscreenWorkerContent />
    </Suspense>
  );
}
