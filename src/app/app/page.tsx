"use client";

import { Suspense, useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { initVimSDK, type VimSDK, type AppManifest, type WorkflowEvent, type AppOpenStatus, type ContextKey, type ContextKeyEntityMap, type EventType } from "@vimconnect/app-sdk";
import { ErrorScreen } from "@/components/ErrorScreen";
import { CapabilityAutoRunner } from "@/components/CapabilityAutoRunner";
import { getEnvironment } from "@/lib/sdk-config";
import { SessionContextPanel } from "@/components/SessionContextPanel";
import {
  DEMO_WORKER_STATE_KEY,
  REFRESH_DEMO_EVENT,
  type DemoWorkerData,
} from "@/lib/worker-demo";

type LogEntry = {
  timestamp: string;
  message: string;
  type: "info" | "success" | "error";
};

type PermScopeMode = "all" | "prefix" | "specific";
type FieldPermScope = { mode: PermScopeMode; token: string | null };

type UpdaterInfo = {
  entityType: string;
  fieldPath: string;
  componentId: string;
  value: string;
  mode: "override" | "append";
  permScope: FieldPermScope;
};

type EventPreview = {
  id: string;
  timestamp: string;
  type: string;
  data: Record<string, unknown>;
  streamType: "workflow" | "context";
};

type ContextEntityData = ContextKeyEntityMap[ContextKey];

type ContextChange = {
  contextKey: string;
  timestamp: string;
  changeType: "opened" | "changed" | "closed";
  previousData: ContextEntityData | undefined;
  currentData: ContextEntityData | undefined;
};

type AppStateLogEntry = {
  timestamp: string;
  isOpen: boolean;
  trigger?: string;
};

type ErrorDetail = {
  message: string;
  code: string | undefined;
  timestamp: string;
  userAgent: string;
};

/**
 * Context keys we deliberately hide from the demo — TEMPORARY WORKAROUND.
 *
 * These are workflow-only events that our infra currently *also* emits as context
 * variants, even though no EHR implementation populates their entity. Verified
 * against the prod Official Collection (v24):
 *   - order_select:order / order_sign:order — Surescripts orders, workflow-only.
 *   - referral_save:referral — wired only in Practice Fusion, as a bare click on the
 *     send-referral button with zero extractors; it mines no referral data, so the
 *     context variant promises an entity that never arrives.
 * (referral_start:referral is a genuine context event and stays visible.)
 *
 * Kept in sync with CONTEXT_EXCLUDED_EVENT_IDS in the app-sdk type generator, which
 * drops these same keys from the generated SDK types. Remove both once the infra
 * supports workflow-only events and stops emitting the context variants.
 */
const HIDDEN_CONTEXT_KEYS: ReadonlySet<string> = new Set([
  "order_select:order",
  "order_sign:order",
  "referral_save:referral",
]);

/**
 * Main App Page Content - OAuth Callback + Full SDK Demo
 */
function AppPageContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "connected" | "error">(
    "loading",
  );
  const [error, setError] = useState<ErrorDetail | null>(null);
  const [vimSDK, setVimSDK] = useState<VimSDK | null>(null);
  const [manifest, setManifest] = useState<AppManifest | null>(null);
  // Which experience is shown once connected — the classic demo or the
  // SDK Capability Auto-Runner. Both share this one initialized SDK session.
  const [view, setView] = useState<"classic" | "explorer">("classic");

  // Activity Log
  const [logEntries, setLogEntries] = useState<LogEntry[]>([]);

  // Event subscriptions
  const [subscribedWorkflowEvents, setSubscribedWorkflowEvents] = useState<
    Set<string>
  >(new Set());
  const [subscribedContexts, setSubscribedContexts] = useState<Set<string>>(
    new Set(),
  );
  const contextUnsubscribeRefs = useRef<Map<string, () => void>>(new Map());
  const [eventPreviews, setEventPreviews] = useState<EventPreview[]>([]);
  const [contextChanges, setContextChanges] = useState<ContextChange[]>([]);

  // Updaters (Write to EHR)
  const [activeUpdaters, setActiveUpdaters] = useState<
    Map<string, Map<string, UpdaterInfo>>
  >(new Map());
  const [detectedComponents, setDetectedComponents] = useState<
    Map<string, Set<string>>
  >(new Map());
  // Collapsible sections state
  const [sdkSubscriptionCollapsed, setSdkSubscriptionCollapsed] =
    useState(true);
  const [hubControlsCollapsed, setHubControlsCollapsed] = useState(true);
  const [eventPreviewCollapsed, setEventPreviewCollapsed] = useState(true);
  const [activeUpdatersCollapsed, setActiveUpdatersCollapsed] = useState(true);
  const [apiWritesCollapsed, setApiWritesCollapsed] = useState(true);
  const [apiReadsCollapsed, setApiReadsCollapsed] = useState(true);
  const [activityLogCollapsed, setActivityLogCollapsed] = useState(false); // Open by default

  // API Writes (SDK ehr.api.*) state
  const [cptEncounterId, setCptEncounterId] = useState("");
  const [cptCode, setCptCode] = useState('[{"code":"77770"},{"code":"01234"}]');

  // API Reads (SDK ehr.api.* getById/search) state.
  // Per-operation search inputs, keyed by `${sdkNamespace}.${sdkMethod}.<field>`
  // where <field> is `query`, `cursor`, `filters.${paramName}`, or `id.${paramName}`
  // for a getById id (optional — empty means resolve from EHR context). Latest
  // response per op, keyed by `${ns}.${method}`.
  const [readOpInputs, setReadOpInputs] = useState<Record<string, string>>({});
  const [readOpResults, setReadOpResults] = useState<Record<string, string>>(
    {},
  );
  // Per-op "in flight" flag + last-run timestamp, so a repeat Run is visible
  // even when the response is byte-identical to the previous one.
  const [readOpRunning, setReadOpRunning] = useState<Record<string, boolean>>(
    {},
  );
  const [readOpRanAt, setReadOpRanAt] = useState<Record<string, string>>({});

  // Modal state
  const [manifestModalOpen, setManifestModalOpen] = useState(false);

  // Hub Controls state
  const [hubActivationStatus, setHubActivationStatus] = useState<
    "ENABLED" | "LOADING" | "DISABLED"
  >("ENABLED");
  const [tooltipText, setTooltipText] = useState("");
  const [notificationBadgeActive, setNotificationBadgeActive] = useState(false);
  const [notificationBadgeCount, setNotificationBadgeCount] = useState(3);
  const [microphoneBadgeActive, setMicrophoneBadgeActive] = useState(false);
  const [pushNotificationText, setPushNotificationText] = useState(
    "Important update available",
  );
  const [pushNotificationTimeout, setPushNotificationTimeout] = useState(12);
  const [appStateSubscribed, setAppStateSubscribed] = useState(false);
  const [appStateIsOpen, setAppStateIsOpen] = useState<boolean | null>(null);
  const [appStateLog, setAppStateLog] = useState<AppStateLogEntry[]>([]);

  const appStateUnsubRef = useRef<(() => void) | null>(null);

  // Worker App round-trip demo (workerState + appEvents)
  const [workerData, setWorkerData] = useState<DemoWorkerData | null>(null);
  const [appEventsSupported, setAppEventsSupported] = useState(false);
  const workerStateUnsubRef = useRef<(() => void) | null>(null);

  // Prevent duplicate initialization
  const initializingRef = useRef(false);
  const initializedRef = useRef(false);
  const subscribedAllRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current || initializingRef.current) {
      return;
    }
    initializingRef.current = true;
    initializeApp();
  }, []);

  // Subscribe to every supported workflow event + context by default, once the
  // SDK and manifest are ready. Subscribes directly via the shared helpers and
  // sets the full sets once — we don't loop the stateful toggles here, since
  // each toggle would compute its next set from the same empty snapshot.
  useEffect(() => {
    if (!vimSDK || !manifest || subscribedAllRef.current) return;
    subscribedAllRef.current = true;

    const eventIds: string[] = (manifest.supportedEvents ?? [])
      .map((e: any) => e.id)
      .filter(Boolean);
    const ctxKeys: string[] = (manifest.supportedContexts ?? [])
      .map((c) => c.contextKey)
      // Skip workflow-only events that shouldn't appear as context (see HIDDEN_CONTEXT_KEYS).
      .filter((k) => !HIDDEN_CONTEXT_KEYS.has(k));

    eventIds.forEach((id) => subscribeToWorkflowEvent(id));
    const subscribedCtxKeys = ctxKeys.filter((k) => subscribeToContext(k));

    setSubscribedWorkflowEvents(new Set(eventIds));
    setSubscribedContexts(new Set(subscribedCtxKeys));
  }, [vimSDK, manifest]);

  function addLog(
    message: string,
    type: "info" | "success" | "error" = "info",
  ) {
    setLogEntries((prev) => [
      {
        timestamp: new Date().toLocaleTimeString(),
        message,
        type,
      },
      ...prev,
    ]);
  }

  async function initializeApp() {
    try {
      const code = searchParams.get("code");
      const stateParam = searchParams.get("state");

      if (!code || !stateParam) {
        throw new Error("Missing OAuth parameters");
      }

      // Validate CSRF state
      const [launchId, csrfToken] = stateParam.split(":");
      if (!launchId || !csrfToken) {
        throw new Error("Invalid state parameter format");
      }
      const flowKey = `oauth_state_${launchId}`;
      const storedToken = sessionStorage.getItem(flowKey);
      if (csrfToken !== storedToken) {
        throw new Error("CSRF validation failed");
      }
      sessionStorage.removeItem(flowKey);

      initializedRef.current = true;

      // Initialize SDK via workspace import (typed). Build-once, run-anywhere:
      // the core-sdk host is decided at runtime by origin. We only nudge the SDK
      // to the staging host when THIS app is itself running in staging, so the
      // staging deploy actually exercises the workspace SDK. `__overrideEnv` is a
      // runtime-only param (not in the public SDKInitOptions type) — hence the cast.
      const sdk = await initVimSDK({
        debug: true,
        ...(getEnvironment() === "staging" ? { __overrideEnv: "staging" } : {}),
      } as Parameters<typeof initVimSDK>[0] & { __overrideEnv?: "staging" });

      setVimSDK(sdk);
      setStatus("connected");
      addLog("SDK initialized successfully", "success");

      // Load manifest
      const sdkManifest = sdk.ehr.getManifest();
      setManifest(sdkManifest);

      addLog(
        `Manifest loaded: ${sdkManifest.supportedEvents?.length || 0} events, ${sdkManifest.supportedContexts?.length || 0} contexts`,
        "info",
      );

      // ── Worker App round-trip demo ──────────────────────────────────────────
      // Subscribe to the mock state the Worker App writes (subscribe-and-sync:
      // fires immediately if the Worker already wrote it).
      workerStateUnsubRef.current = sdk.workerState.on<DemoWorkerData>(
        DEMO_WORKER_STATE_KEY,
        (_prev, next) => {
          setWorkerData(next);
          if (next) {
            addLog(
              `workerState "${DEMO_WORKER_STATE_KEY}" → #${next.refreshCount} (${next.token})`,
              "success",
            );
          } else {
            addLog(`workerState "${DEMO_WORKER_STATE_KEY}" cleared`, "info");
          }
        },
      );

      // appEvents is capability-gated — present only when the extension
      // advertises it. Feature-detect so older extensions degrade gracefully.
      const supportsAppEvents = !!sdk.appEvents;
      setAppEventsSupported(supportsAppEvents);
      addLog(
        supportsAppEvents
          ? "appEvents supported — Refresh button is live"
          : "appEvents NOT supported by this extension — Refresh disabled",
        supportsAppEvents ? "info" : "error",
      );
    } catch (err: any) {
      console.error("Initialization error:", err);
      setError({
        message: err.message ?? "Unknown error",
        code: err.code,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
      });
      setStatus("error");
      initializedRef.current = false;
    } finally {
      initializingRef.current = false;
    }
  }

  // Clean up the workerState subscription on unmount
  useEffect(() => {
    return () => {
      workerStateUnsubRef.current?.();
      workerStateUnsubRef.current = null;
    };
  }, []);

  // Worker App round-trip: ask the Worker to regenerate its mock state.
  // Fire-and-forget — the new data arrives back via the workerState subscription.
  function refreshWorkerData() {
    if (!vimSDK?.appEvents) {
      addLog("appEvents not supported by this extension", "error");
      return;
    }
    try {
      vimSDK.appEvents.send(REFRESH_DEMO_EVENT);
      addLog(`Sent appEvent "${REFRESH_DEMO_EVENT}" → Worker`, "success");
    } catch (err: any) {
      addLog(`appEvents.send failed: ${err.message}`, "error");
    }
  }

  // Hub Control Functions
  function hubSetActivationStatus(
    newStatus: "ENABLED" | "LOADING" | "DISABLED",
  ) {
    if (!vimSDK) return;
    vimSDK.hub.setActivationStatus(newStatus);
    setHubActivationStatus(newStatus);
    addLog(`Hub: setActivationStatus → ${newStatus}`, "success");
  }

  function hubApplyTooltip() {
    if (!vimSDK || !tooltipText.trim()) return;
    vimSDK.hub.setTooltipText(tooltipText);
    addLog(`Hub: setTooltipText → "${tooltipText}"`, "success");
  }

  function hubClearTooltip() {
    if (!vimSDK) return;
    vimSDK.hub.setTooltipText("");
    setTooltipText("");
    addLog("Hub: tooltip cleared", "success");
  }

  function hubToggleNotificationBadge() {
    if (!vimSDK) return;
    const newState = !notificationBadgeActive;
    if (newState) {
      vimSDK.hub.notificationBadge.set(notificationBadgeCount);
      addLog(
        `Hub: notificationBadge.set(${notificationBadgeCount})`,
        "success",
      );
    } else {
      vimSDK.hub.notificationBadge.hide();
      addLog("Hub: notificationBadge.hide()", "info");
    }
    setNotificationBadgeActive(newState);
  }

  function hubToggleMicrophoneBadge() {
    if (!vimSDK) return;
    const newState = !microphoneBadgeActive;
    if (newState) {
      vimSDK.hub.microphoneBadge.show();
      addLog("Hub: microphoneBadge.show()", "success");
    } else {
      vimSDK.hub.microphoneBadge.hide();
      addLog("Hub: microphoneBadge.hide()", "info");
    }
    setMicrophoneBadgeActive(newState);
  }

  function hubShowPushNotification() {
    if (!vimSDK) return;
    const details = {
      text: pushNotificationText,
      notificationId: `demo-${Date.now()}`,
      timeoutInSec: pushNotificationTimeout,
    };
    vimSDK.hub.pushNotification.show(details);
    addLog(
      `Hub: pushNotification.show (timeout: ${pushNotificationTimeout}s)`,
      "success",
    );
  }

  function hubHidePushNotification() {
    if (!vimSDK) return;
    vimSDK.hub.pushNotification.hide();
    addLog("Hub: pushNotification.hide()", "success");
  }

  // Multi-notification test presets
  type NotifPreset = {
    label: string;
    title?: string;
    text: string;
    type?: "warning" | "success" | "critical";
    imageUrl?: string;
    buttons?: {
      leftButton?: {
        text: string;
        buttonStyle: "PRIMARY" | "LINK";
        callback: () => void;
        openAppButton?: boolean;
      };
      rightButton?: {
        text: string;
        buttonStyle: "PRIMARY" | "LINK";
        callback: () => void;
        openAppButton?: boolean;
      };
    };
  };

  const MULTI_NOTIF_PRESETS: NotifPreset[] = [
    {
      label: "🔴 Critical (no timeout, ack required)",
      title: "Drug Interaction Detected",
      text: "<b>Warfarin</b> + <b>Aspirin</b> — high bleed risk. Review immediately.",
      type: "critical" as const,
      buttons: {
        rightButton: {
          text: "Review",
          buttonStyle: "PRIMARY" as const,
          openAppButton: true,
          callback: () => {},
        },
      },
    },
    {
      label: "⚠️ Warning",
      title: "Prior Auth Expiring",
      text: "Prior auth expires in <b>3 days</b>",
      type: "warning" as const,
      buttons: {
        leftButton: {
          text: "Dismiss",
          buttonStyle: "LINK" as const,
          callback: () => {},
        },
        rightButton: {
          text: "Renew",
          buttonStyle: "PRIMARY" as const,
          openAppButton: true,
          callback: () => {},
        },
      },
    },
    {
      label: "✅ Success",
      title: "Care Gap Closed",
      text: "HbA1c documented — gap resolved ✓",
      type: "success" as const,
    },
    {
      label: "🔴 Critical plain",
      title: "Critical Lab Value",
      text: "Hemoglobin 5.2 g/dL — critical low",
      type: "critical" as const,
    },
    {
      label: "Plain (no type)",
      text: "Patient A1C is 9.2 — review recommended",
    },
    {
      label: "⚠️ Warning multi-line",
      title: "Medication Alert",
      text: "<b>Warfarin 5mg</b> — INR check overdue",
      type: "warning" as const,
    },
  ];

  function hubFirePreset(index: number) {
    if (!vimSDK) return;
    const preset = MULTI_NOTIF_PRESETS[index];
    const notificationId = `demo-preset-${index}-${Date.now()}`;
    vimSDK.hub.pushNotification.show({
      title: preset.title,
      text: preset.text,
      notificationId,
      timeoutInSec: 30,
      type: preset.type,
      imageUrl: preset.imageUrl,
      actionButtons: preset.buttons,
    });
    addLog(`Push: fired preset "${preset.label}"`, "success");
  }

  function hubFireCount(count: number) {
    if (!vimSDK) return;
    const ts = Date.now();
    for (let i = 0; i < count; i++) {
      const preset = MULTI_NOTIF_PRESETS[i % MULTI_NOTIF_PRESETS.length];
      vimSDK.hub.pushNotification.show({
        title: preset.title,
        text: preset.text,
        notificationId: `demo-burst-${i}-${ts}`,
        timeoutInSec: 30,
        type: preset.type,
        imageUrl: preset.imageUrl,
        actionButtons: preset.buttons,
      });
    }
    addLog(`Push: fired ${count} notifications`, "success");
  }

  function hubCloseApp() {
    if (!vimSDK) return;
    vimSDK.hub.closeApp();
    addLog("Hub: closeApp()", "success");
  }

  function hubSubscribeAppState() {
    if (!vimSDK || appStateSubscribed) return;

    appStateUnsubRef.current = vimSDK.hub.appState.subscribe(
      "appOpenStatus",
      (statusEvent: AppOpenStatus) => {
        setAppStateIsOpen(statusEvent.isAppOpen);
        setAppStateLog((prev) => [
          {
            timestamp: new Date().toLocaleTimeString(),
            isOpen: statusEvent.isAppOpen,
            trigger: statusEvent.isAppOpen
              ? statusEvent.appOpenTrigger
              : statusEvent.appCloseTrigger,
          },
          ...prev,
        ]);
        addLog(
          `Hub: appState changed → isAppOpen=${statusEvent.isAppOpen}`,
          statusEvent.isAppOpen ? "success" : "info",
        );
      },
    );

    setAppStateSubscribed(true);
    addLog("Hub: subscribed to appState", "success");
  }

  function hubUnsubscribeAppState() {
    if (appStateUnsubRef.current) {
      appStateUnsubRef.current();
      appStateUnsubRef.current = null;
    }
    setAppStateSubscribed(false);
    setAppStateLog([]);
    addLog("Hub: unsubscribed from appState", "info");
  }

  // Event Subscription Functions
  // SDK-subscribe side effects, shared by the toggles and the auto-subscribe
  // effect. These only touch the SDK / unsubscribe refs — they never mutate the
  // subscribed-* sets, so callers own that state and can batch it.
  function subscribeToWorkflowEvent(eventId: string) {
    if (!vimSDK) return;
    vimSDK.ehr.workflow.on(eventId as EventType, (event: WorkflowEvent) => {
      addLog(`Workflow event: ${event.type}`, "success");
      setEventPreviews((prev) => [
        {
          id: eventId,
          timestamp: new Date().toISOString(),
          type: event.type,
          data: event as unknown as Record<string, unknown>,
          streamType: "workflow",
        },
        ...prev,
      ]);

      // Mark component as detected
      const componentId = event.metadata?.componentId;
      if (componentId) {
        setDetectedComponents((prev) => {
          const newMap = new Map(prev);
          if (!newMap.has(eventId)) {
            newMap.set(eventId, new Set());
          }
          newMap.get(eventId)!.add(componentId);
          return newMap;
        });
        addLog(`Component detected: ${componentId} for ${eventId}`, "success");
      }
    });
  }

  // Returns true if the subscription was established (false on invalid key or
  // SDK error), so callers know whether to track it in subscribedContexts.
  function subscribeToContext(contextKey: string): boolean {
    if (!vimSDK) return false;

    // Validate context key
    if (
      !contextKey ||
      contextKey === "undefined" ||
      contextKey.startsWith("context-")
    ) {
      addLog(`Invalid context key: ${contextKey}`, "error");
      console.error("Invalid context key:", contextKey);
      return false;
    }

    try {
      const unsubscribe = vimSDK.ehr.context.onChange(
        contextKey as ContextKey,
        (previousData, currentData) => {
          const changeType =
            !previousData && currentData
              ? "opened"
              : previousData && currentData
                ? "changed"
                : "closed";
          addLog(`Context ${changeType}: ${contextKey}`, "success");
          setContextChanges((prev) => [
            {
              contextKey,
              timestamp: new Date().toISOString(),
              changeType,
              previousData,
              currentData,
            },
            ...prev,
          ]);
        },
      );
      contextUnsubscribeRefs.current.set(contextKey, unsubscribe);
      addLog(`Subscribed to context ${contextKey}`, "success");
      return true;
    } catch (err: any) {
      addLog(`Failed to subscribe to context: ${err.message}`, "error");
      return false;
    }
  }

  function toggleWorkflowEvent(eventId: string) {
    if (!vimSDK) return;

    const newSet = new Set(subscribedWorkflowEvents);
    if (newSet.has(eventId)) {
      newSet.delete(eventId);
      addLog(`Unsubscribed from ${eventId}`, "info");
    } else {
      newSet.add(eventId);
      subscribeToWorkflowEvent(eventId);
      addLog(`Subscribed to ${eventId}`, "success");
    }
    setSubscribedWorkflowEvents(newSet);
  }

  function toggleContextEvent(contextKey: string) {
    if (!vimSDK) return;

    const newSet = new Set(subscribedContexts);
    if (newSet.has(contextKey)) {
      newSet.delete(contextKey);
      contextUnsubscribeRefs.current.get(contextKey)?.();
      contextUnsubscribeRefs.current.delete(contextKey);
      addLog(`Unsubscribed from context ${contextKey}`, "info");
      setSubscribedContexts(newSet);
    } else if (subscribeToContext(contextKey)) {
      newSet.add(contextKey);
      setSubscribedContexts(newSet);
    }
  }

  // Updater Functions (Write to EHR)
  function toggleUpdater(
    entityTypeKey: string,
    fieldPath: string,
    componentId: string,
  ) {
    const key = `${entityTypeKey}:${fieldPath}`;
    const newMap = new Map(activeUpdaters);

    if (newMap.has(entityTypeKey) && newMap.get(entityTypeKey)!.has(key)) {
      newMap.get(entityTypeKey)!.delete(key);
      if (newMap.get(entityTypeKey)!.size === 0) {
        newMap.delete(entityTypeKey);
      }
      addLog(`Disabled updater for ${fieldPath}`, "info");
    } else {
      if (!newMap.has(entityTypeKey)) {
        newMap.set(entityTypeKey, new Map());
      }
      newMap.get(entityTypeKey)!.set(key, {
        entityType: entityTypeKey,
        fieldPath,
        componentId,
        value: "",
        mode: "override",
        permScope: { mode: "all", token: null },
      });
      addLog(`Enabled updater for ${fieldPath}`, "success");
    }

    setActiveUpdaters(newMap);
  }

  // SDK API write — uses the apiAutomation path (vimSDK.ehr.api.encounter.updateProcedureCodes)
  // rather than the field-automation path used by executeUpdate. Routes through the
  // kareo_tebra apiAutomation → update-encounter-procedure-codes automation → 5-step
  // charge-capture chain → PUT /charge-capture-ui/api/Encounter/charges/{guid}.
  //
  // The automation is marked isDisruptive: true, so the SDK requires a permission grant
  // before the call. We use the ehr.api.* permission lifecycle (#4954): check current
  // state via getCapability(), prompt the user via requestPermission() when needed,
  // then invoke the method.
  async function executeUpdateProcedureCodes() {
    if (!vimSDK) return;
    const encounterId = cptEncounterId.trim();
    const code = cptCode.trim();
    if (!encounterId) {
      addLog("Encounter ID is required for updateProcedureCodes", "error");
      return;
    }
    if (!code) {
      addLog("CPT code is required for updateProcedureCodes", "error");
      return;
    }
    let procedureCodes: Array<{ code: string; description?: string }>;
    if (code.startsWith("[")) {
      try {
        procedureCodes = JSON.parse(code);
      } catch {
        addLog("CPT code field looks like JSON but failed to parse", "error");
        return;
      }
    } else {
      procedureCodes = [{ code }];
    }

    const encounterApi = (vimSDK.ehr.api as any).encounter;

    // Permission lifecycle for the disruptive apiAutomation. Non-disruptive operations
    // return permissionState: 'granted' here without prompting.
    try {
      const cap = encounterApi.getCapability("updateProcedureCodes");
      if (!cap.available) {
        addLog(
          `updateProcedureCodes not available in this EHR (${cap.reason})`,
          "error",
        );
        return;
      }
      if (cap.disruptive && cap.permissionState !== "granted") {
        addLog(
          "Requesting permission for updateProcedureCodes…",
          "info",
        );
        const result = await encounterApi.requestPermission("updateProcedureCodes");
        if (result !== "granted") {
          addLog(
            `Permission ${result} for updateProcedureCodes`,
            "error",
          );
          return;
        }
        addLog("Permission granted — invoking updateProcedureCodes", "success");
      }
    } catch (err: any) {
      addLog(`Permission flow threw: ${err.message}`, "error");
      return;
    }

    try {
      addLog(
        `API call: ehr.api.encounter.updateProcedureCodes(${encounterId}, ${JSON.stringify(procedureCodes)})`,
        "info",
      );
      const result = await encounterApi.updateProcedureCodes(
        { encounterId },
        { billingInformation: { procedureCodes } },
      );
      if (result && (result as any).success === false) {
        const r = result as any;
        const detail = r.error ?? r.apiError ?? JSON.stringify(r).slice(0, 500);
        addLog(`updateProcedureCodes failed: ${detail}`, "error");
        return;
      }
      addLog(`updateProcedureCodes succeeded for encounter ${encounterId}`, "success");
    } catch (err: any) {
      addLog(`updateProcedureCodes threw: ${err.message}`, "error");
    }
  }

  // SDK API read — catalog-based getById/search operations (non-disruptive, so
  // no permission lifecycle). Data-driven from manifest.operations, so this lists
  // whatever read ops the active EHR's collection exposes (e.g. patient.getPatient,
  // patient.getInsurances, patient.getProblems).
  //
  // getById ops take an optional id per metadata.idParameterNames; omitting it
  // resolves the id from live EHR context. search ops take an optional typed
  // `input`: `query` (when
  // metadata.supportsQuery), `filters` keyed by metadata.filterFields, and `cursor`
  // (when metadata.paginated) — each included only when the user supplied a value.
  async function executeReadOperation(op: any) {
    if (!vimSDK) return;
    const opKey = `${op.sdkNamespace}.${op.sdkMethod}`;
    const namespace = (vimSDK.ehr.api as any)[op.sdkNamespace];
    if (!namespace || typeof namespace[op.sdkMethod] !== "function") {
      addLog(`ehr.api.${opKey} is not available on this SDK`, "error");
      return;
    }

    // Build the argument object from the per-op inputs.
    let callArg: any;
    if (op.operationType === "search") {
      const meta = op.metadata ?? {};
      const input: Record<string, unknown> = {};
      if (meta.supportsQuery) {
        const query = readOpInputs[`${opKey}.query`]?.trim();
        if (query) input.query = query;
      }
      const filters: Record<string, string> = {};
      for (const field of (meta.filterFields ?? []) as string[]) {
        const v = readOpInputs[`${opKey}.filters.${field}`]?.trim();
        if (v) filters[field] = v;
      }
      if (Object.keys(filters).length > 0) input.filters = filters;
      if (meta.paginated) {
        const cursor = readOpInputs[`${opKey}.cursor`]?.trim();
        if (cursor) input.cursor = cursor;
      }
      callArg = input;
    } else {
      // An empty box must be omitted — `{}` is what makes the id resolve from context.
      const ids: Record<string, string> = {};
      for (const name of (op.metadata?.idParameterNames ?? []) as string[]) {
        const v = readOpInputs[`${opKey}.id.${name}`]?.trim();
        if (v) ids[name] = v;
      }
      callArg = ids;
    }

    setReadOpRunning((prev) => ({ ...prev, [opKey]: true }));
    try {
      addLog(`API call: ehr.api.${opKey}(${JSON.stringify(callArg)})`, "info");
      const result = await namespace[op.sdkMethod](callArg);
      const pretty = JSON.stringify(result, null, 2);
      setReadOpResults((prev) => ({ ...prev, [opKey]: pretty }));
      if (result && (result as any).success === false) {
        const r = result as any;
        const detail = r.error ?? r.apiError ?? pretty.slice(0, 500);
        addLog(`${opKey} returned success:false — ${detail}`, "error");
      } else {
        addLog(`${opKey} succeeded`, "success");
      }
    } catch (err: any) {
      setReadOpResults((prev) => ({ ...prev, [opKey]: `Error: ${err.message}` }));
      addLog(`${opKey} threw: ${err.message}`, "error");
    } finally {
      // Stamp the run time (changes every run → visible even if result is
      // identical) and clear the in-flight flag.
      setReadOpRanAt((prev) => ({
        ...prev,
        [opKey]: new Date().toLocaleTimeString(),
      }));
      setReadOpRunning((prev) => ({ ...prev, [opKey]: false }));
    }
  }

  async function executeUpdate(updaterInfo: UpdaterInfo) {
    if (!vimSDK) return;

    try {
      addLog(
        `Executing update: ${updaterInfo.entityType}.${updaterInfo.fieldPath} = "${updaterInfo.value}" (${updaterInfo.mode})`,
        "info",
      );

      const namespace = (vimSDK.ehr.context as any)[updaterInfo.entityType];
      if (!namespace) {
        addLog(`No writeback namespace for ${updaterInfo.entityType}`, "error");
        return;
      }

      const permFields = getPermFieldsForUpdater(updaterInfo);
      const permOptions = permFields ? { fields: permFields } : undefined;

      // Request permission if needed before updating
      if (!namespace.hasPermission("update", permOptions)) {
        const scopeLabel = permFields
          ? ` [scope: ${permFields.join(", ")}]`
          : " [scope: all fields]";
        addLog(
          `Requesting permission for ${updaterInfo.entityType}${scopeLabel}...`,
          "info",
        );
        const permResult = await namespace.requestPermission("update", permOptions);
        if (permResult !== "granted") {
          addLog(`Permission denied for ${updaterInfo.entityType}`, "error");
          return;
        }
      }

      let parsedValue: any = updaterInfo.value;
      try {
        parsedValue = JSON.parse(updaterInfo.value);
      } catch {
        // Not valid JSON — send as plain string
      }

      const data = buildNestedFromPath(updaterInfo.fieldPath, parsedValue);

      const result = await namespace.update(data, { mode: updaterInfo.mode });

      if (result && result.success === false) {
        addLog(`Update failed: ${result.error || "Unknown error"}`, "error");
        return;
      }

      addLog(
        `Update successful: ${updaterInfo.entityType}.${updaterInfo.fieldPath}`,
        "success",
      );
    } catch (err: any) {
      addLog(`Update failed: ${err.message}`, "error");
    }
  }

  function updateUpdaterValue(
    entityTypeKey: string,
    key: string,
    value: string,
  ) {
    setActiveUpdaters((prev) => {
      const newMap = new Map(prev);
      if (newMap.has(entityTypeKey) && newMap.get(entityTypeKey)!.has(key)) {
        const updater = newMap.get(entityTypeKey)!.get(key)!;
        newMap.get(entityTypeKey)!.set(key, { ...updater, value });
      }
      return newMap;
    });
  }

  function updateUpdaterMode(
    entityTypeKey: string,
    key: string,
    mode: "override" | "append",
  ) {
    setActiveUpdaters((prev) => {
      const newMap = new Map(prev);
      if (newMap.has(entityTypeKey) && newMap.get(entityTypeKey)!.has(key)) {
        const updater = newMap.get(entityTypeKey)!.get(key)!;
        newMap.get(entityTypeKey)!.set(key, { ...updater, mode });
      }
      return newMap;
    });
  }

  function updateUpdaterPermScope(
    entityTypeKey: string,
    key: string,
    scope: FieldPermScope,
  ) {
    setActiveUpdaters((prev) => {
      const newMap = new Map(prev);
      if (newMap.has(entityTypeKey) && newMap.get(entityTypeKey)!.has(key)) {
        const updater = newMap.get(entityTypeKey)!.get(key)!;
        newMap.get(entityTypeKey)!.set(key, { ...updater, permScope: scope });
      }
      return newMap;
    });
  }

  /** Returns parent prefix tokens for a single field path (e.g. 'subjective.chiefComplaintNotes' → ['subjective']) */
  function getFieldParentPrefixes(fieldPath: string): string[] {
    const parts = fieldPath.split(".");
    const prefixes: string[] = [];
    for (let i = 1; i < parts.length; i++) {
      prefixes.push(parts.slice(0, i).join("."));
    }
    return prefixes;
  }

  /** Returns the fields array for permission calls based on the updater's own permScope */
  function getPermFieldsForUpdater(updater: UpdaterInfo): string[] | undefined {
    const { permScope } = updater;
    if (!permScope || permScope.mode === "all") return undefined;
    if (permScope.token) return [permScope.token];
    return undefined;
  }

  /** Converts 'a.b.c' + value → { a: { b: { c: value } } } */
  function buildNestedFromPath(
    path: string,
    value: unknown,
  ): Record<string, unknown> {
    return path.split(".").reduceRight<Record<string, unknown>>(
      (acc, key) => ({ [key]: acc }),
      value as any,
    );
  }

  if (status === "loading") {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <div className="spinner" style={{ margin: "0 auto 16px" }} />
          <p style={{ color: "var(--color-text-muted)" }}>
            Connecting to Vim...
          </p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    /*
     * UX split: show a friendly message for end users (providers/patients)
     * who should never see raw SDK internals. Technical details live behind
     * "Show Diagnostics" so developers can expand and copy them into bug
     * reports. Copy this pattern in production apps — never surface raw SDK
     * error messages directly to end users.
     */
    return (
      <ErrorScreen
        heading="Connection Error"
        message="Something went wrong. Press retry to reload the application."
        diagnostics={[
          { label: "Error:", value: error?.message ?? "Unknown error" },
          { label: "Code:", value: error?.code ?? "N/A" },
          { label: "Time:", value: error?.timestamp ?? "N/A" },
          { label: "Browser:", value: error?.userAgent ?? "N/A" },
        ]}
        retry={{
          label: "Retry",
          onClick: () => window.location.reload(),
        }}
      />
    );
  }

  const supportedEvents = manifest?.supportedEvents || [];
  // Hide workflow-only events that shouldn't appear as context (see HIDDEN_CONTEXT_KEYS).
  // Filtering here keeps the section count and the rendered toggles in agreement.
  const supportedContexts = (manifest?.supportedContexts || []).filter(
    (ctx) => !HIDDEN_CONTEXT_KEYS.has(ctx.contextKey),
  );
  const contextWriteback: Record<string, any> =
    manifest?.contextWriteback || {};
  // Flatten contextWriteback into a list for the UI
  const writebackEntries = Object.entries(contextWriteback).flatMap(
    ([entityType, config]: [string, any]) =>
      (config.update?.updatableFields ?? []).map((field: string) => ({
        entityType,
        fieldPath: field,
        disruptive: config.update?.disruptive ?? false,
      })),
  );

  // Read-side API operations exposed by the active EHR's catalog. getById/search
  // are the non-disruptive reads (updateById/create are writes, handled above).
  const readOps = (manifest?.operations ?? []).filter(
    (op: any) =>
      op.available &&
      (op.operationType === "getById" || op.operationType === "search"),
  );

  return view === "explorer" && vimSDK && manifest ? (
    <CapabilityAutoRunner
      sdk={vimSDK}
      manifest={manifest}
      onSwitchMode={() => setView("classic")}
    />
  ) : (
    <div className="demo-container">
      {/* Header */}
      <div className="demo-header">
        <div className="demo-header-text">
          <h1>Vim Connect Demo App</h1>
          <p className="demo-header-subtitle">
            Connected via OAuth • SDK Version: {manifest?.version || "Unknown"}
          </p>
          <div className="status-badge">
            <div className="status-dot" />
            <span>Connected</span>
          </div>
        </div>
        <button
          type="button"
          className="btn btn-gradient btn-sm"
          onClick={() => setView("explorer")}
        >
          ⚡ Auto-Runner
        </button>
      </div>

      <div className="demo-content">
        {/* View SDK Manifest Button */}
        <div style={{ marginBottom: "var(--space-2xl)" }}>
          <button
            onClick={() => setManifestModalOpen(true)}
            className="btn-gradient"
          >
            View SDK Manifest
          </button>
        </div>

        <SessionContextPanel
          sessionContext={vimSDK?.sessionContext ?? null}
          addLog={addLog}
        />

        {/* Worker App Round-Trip (workerState + appEvents) */}
        <div className="demo-card-section" style={{ marginBottom: "var(--space-2xl)" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "var(--space-sm)",
            }}
          >
            <div className="demo-card-label" style={{ marginBottom: 0 }}>
              Worker App Round-Trip
            </div>
            <span
              style={{
                fontSize: "var(--text-xs)",
                fontWeight: 600,
                padding: "2px 8px",
                borderRadius: "var(--radius-sm, 4px)",
                fontFamily: "var(--font-mono, monospace)",
                background: appEventsSupported
                  ? "color-mix(in srgb, var(--color-success) 15%, transparent)"
                  : "color-mix(in srgb, var(--color-text-muted) 15%, transparent)",
                color: appEventsSupported
                  ? "var(--color-success)"
                  : "var(--color-text-muted)",
              }}
            >
              appEvents {appEventsSupported ? "SUPPORTED" : "UNSUPPORTED"}
            </span>
          </div>
          <div
            style={{
              fontSize: "var(--text-xs)",
              color: "var(--color-text-muted)",
              marginBottom: "var(--space-md)",
            }}
          >
            Worker App writes mock data via <code>workerState</code>; this UI
            subscribes to it. Refresh sends an <code>appEvents</code> message
            back to the Worker, which regenerates the data and re-syncs it.
          </div>
          <div className="updater-card">
            {workerData ? (
              <>
                <div style={{ marginBottom: "var(--space-xs)" }}>
                  Refresh #: <strong>{workerData.refreshCount}</strong>
                </div>
                <div style={{ marginBottom: "var(--space-xs)" }}>
                  Token: <code>{workerData.token}</code>
                </div>
                <div style={{ marginBottom: "var(--space-xs)" }}>
                  Generated:{" "}
                  <span style={{ color: "var(--color-text-muted)" }}>
                    {new Date(workerData.generatedAt).toLocaleTimeString()}
                  </span>
                </div>
                <div style={{ color: "var(--color-text-muted)" }}>
                  {workerData.message}
                </div>
              </>
            ) : (
              <div className="empty-state" style={{ margin: 0 }}>
                Waiting for Worker App to sync data…
              </div>
            )}
          </div>
          <button
            onClick={refreshWorkerData}
            disabled={!appEventsSupported}
            className="btn btn-primary"
            style={{
              width: "100%",
              marginTop: "var(--space-md)",
              opacity: appEventsSupported ? 1 : 0.5,
            }}
            title={
              appEventsSupported
                ? "Send appEvents → Worker regenerates data"
                : "This extension does not support appEvents"
            }
          >
            Refresh Worker Data
          </button>
        </div>

        {/* SDK Subscriptions */}
        <div className="section-collapsible">
          <div
            className="section-header"
            onClick={() =>
              setSdkSubscriptionCollapsed(!sdkSubscriptionCollapsed)
            }
          >
            <div
              className="section-chevron"
              style={{
                transform: sdkSubscriptionCollapsed
                  ? "rotate(0deg)"
                  : "rotate(90deg)",
              }}
            >
              ▶
            </div>
            <h2 className="section-title">SDK Subscriptions</h2>
          </div>
          <div
            className={`section-content ${sdkSubscriptionCollapsed ? "collapsed" : ""}`}
          >
            <div className="section-inner">
              <div className="demo-card-section">
                <div className="demo-card-label">
                  Workflow Events ({supportedEvents.length})
                </div>
                <div className="event-list">
                  {supportedEvents.length === 0 ? (
                    <div className="empty-state">
                      No workflow events available
                    </div>
                  ) : (
                    supportedEvents.map((evt: { id: string; name?: string }, idx: number) => (
                      <div key={evt.id || `evt-${idx}`} className="event-item">
                        <div className="event-name">{evt.name || evt.id}</div>
                        <div
                          className="toggle-switch"
                          onClick={() => toggleWorkflowEvent(evt.id)}
                        >
                          <div
                            className={`toggle-track ${subscribedWorkflowEvents.has(evt.id) ? "active" : ""}`}
                          >
                            <div className="toggle-thumb" />
                          </div>
                          <span className="toggle-label">
                            {subscribedWorkflowEvents.has(evt.id)
                              ? "ON"
                              : "OFF"}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="demo-card-section">
                <div className="demo-card-label">
                  Context Events ({supportedContexts.length})
                </div>
                <div className="event-list">
                  {supportedContexts.length === 0 ? (
                    <div className="empty-state">
                      No context events available
                    </div>
                  ) : (
                    supportedContexts.map((ctx) => {
                      const contextKey = ctx.contextKey;

                      return (
                        <div key={contextKey} className="event-item">
                          {/* Label is the event:entity key itself (e.g. chart_open:patient) —
                              that's what a developer subscribes to. Description, when present,
                              is a hover tooltip. */}
                          <div className="event-name" title={ctx.description}>
                            {contextKey}
                          </div>
                          <div
                            className="toggle-switch"
                            onClick={() => toggleContextEvent(contextKey)}
                          >
                            <div
                              className={`toggle-track ${subscribedContexts.has(contextKey) ? "active" : ""}`}
                            >
                              <div className="toggle-thumb" />
                            </div>
                            <span className="toggle-label">
                              {subscribedContexts.has(contextKey)
                                ? "ON"
                                : "OFF"}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hub Controls */}
        <div className="section-collapsible">
          <div
            className="section-header"
            onClick={() => setHubControlsCollapsed(!hubControlsCollapsed)}
          >
            <div
              className="section-chevron"
              style={{
                transform: hubControlsCollapsed
                  ? "rotate(0deg)"
                  : "rotate(90deg)",
              }}
            >
              ▶
            </div>
            <h2 className="section-title">Hub Controls</h2>
          </div>
          <div
            className={`section-content ${hubControlsCollapsed ? "collapsed" : ""}`}
          >
            <div className="section-inner">
              <div className="demo-card-section">
                <div className="demo-card-label">Activation Status</div>
                <div className="btn-group">
                  <button
                    onClick={() => hubSetActivationStatus("ENABLED")}
                    className={`btn-activation ${hubActivationStatus === "ENABLED" ? "enabled" : ""}`}
                  >
                    <span style={{ fontSize: "10px" }}>●</span>
                    ENABLED
                  </button>
                  <button
                    onClick={() => hubSetActivationStatus("LOADING")}
                    className={`btn-activation ${hubActivationStatus === "LOADING" ? "loading" : ""}`}
                  >
                    <span style={{ fontSize: "10px" }}>◐</span>
                    LOADING
                  </button>
                  <button
                    onClick={() => hubSetActivationStatus("DISABLED")}
                    className={`btn-activation ${hubActivationStatus === "DISABLED" ? "disabled" : ""}`}
                  >
                    <span style={{ fontSize: "10px" }}>✕</span>
                    DISABLED
                  </button>
                </div>
              </div>

              <div className="demo-card-section">
                <div className="demo-card-label">Tooltip Text</div>
                <div className="input-group">
                  <input
                    type="text"
                    value={tooltipText}
                    onChange={(e) => setTooltipText(e.target.value)}
                    placeholder="Enter tooltip text..."
                    className="input"
                  />
                  <button
                    onClick={hubApplyTooltip}
                    className="btn btn-primary btn-sm"
                  >
                    Set
                  </button>
                  <button onClick={hubClearTooltip} className="btn btn-sm">
                    Clear
                  </button>
                </div>
              </div>

              <div className="demo-card-section">
                <div className="demo-card-label">Notification Badge</div>
                <div className="input-group">
                  <div
                    className="toggle-switch"
                    onClick={hubToggleNotificationBadge}
                  >
                    <div
                      className={`toggle-track ${notificationBadgeActive ? "active" : ""}`}
                    >
                      <div className="toggle-thumb" />
                    </div>
                    <span className="toggle-label">
                      {notificationBadgeActive ? "ON" : "OFF"}
                    </span>
                  </div>
                  <input
                    type="number"
                    value={notificationBadgeCount}
                    onChange={(e) =>
                      setNotificationBadgeCount(parseInt(e.target.value) || 0)
                    }
                    className="input input-number"
                    style={{ marginLeft: "auto" }}
                  />
                </div>
              </div>

              <div className="demo-card-section">
                <div className="demo-card-label">Microphone Badge</div>
                <div
                  className="toggle-switch"
                  onClick={hubToggleMicrophoneBadge}
                >
                  <div
                    className={`toggle-track ${microphoneBadgeActive ? "active" : ""}`}
                  >
                    <div className="toggle-thumb" />
                  </div>
                  <span className="toggle-label">
                    {microphoneBadgeActive ? "ON" : "OFF"}
                  </span>
                </div>
              </div>

              <div className="demo-card-section">
                <div className="demo-card-label">Push Notification</div>
                <input
                  type="text"
                  value={pushNotificationText}
                  onChange={(e) => setPushNotificationText(e.target.value)}
                  placeholder="Notification text..."
                  className="input"
                  style={{ marginBottom: "var(--space-sm)" }}
                />
                <div className="input-group">
                  <input
                    type="number"
                    value={pushNotificationTimeout}
                    onChange={(e) =>
                      setPushNotificationTimeout(parseInt(e.target.value) || 12)
                    }
                    placeholder="Timeout (sec)"
                    className="input input-number"
                  />
                  <button
                    onClick={hubShowPushNotification}
                    className="btn btn-primary"
                    style={{ flex: 1 }}
                  >
                    Show
                  </button>
                  <button
                    onClick={hubHidePushNotification}
                    className="btn btn-sm"
                  >
                    Hide
                  </button>
                </div>
              </div>

              <div className="demo-card-section">
                <div className="demo-card-label">
                  Multi-notification testing
                </div>
                {/* Fire N at once */}
                <div style={{ marginBottom: "var(--space-sm)" }}>
                  <div
                    style={{
                      fontSize: "var(--text-xs)",
                      color: "var(--color-text-muted)",
                      marginBottom: "var(--space-xs)",
                    }}
                  >
                    Fire burst (timeout 30s each)
                  </div>
                  <div className="btn-group">
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <button
                        key={n}
                        onClick={() => hubFireCount(n)}
                        className="btn btn-sm btn-primary"
                      >
                        ×{n}
                      </button>
                    ))}
                    <button
                      onClick={hubHidePushNotification}
                      className="btn btn-sm btn-danger"
                    >
                      Hide all
                    </button>
                  </div>
                </div>
                {/* Individual presets */}
                <div
                  style={{
                    fontSize: "var(--text-xs)",
                    color: "var(--color-text-muted)",
                    marginBottom: "var(--space-xs)",
                  }}
                >
                  Individual presets
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "var(--space-xs)",
                  }}
                >
                  {MULTI_NOTIF_PRESETS.map((preset, i) => (
                    <button
                      key={i}
                      onClick={() => hubFirePreset(i)}
                      className="btn btn-sm"
                      style={{
                        textAlign: "left",
                        justifyContent: "flex-start",
                      }}
                    >
                      <span
                        style={{
                          opacity: 0.5,
                          marginRight: "6px",
                          fontFamily: "monospace",
                        }}
                      >
                        {i + 1}
                      </span>
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="demo-card-section">
                <div className="demo-card-label">App Control</div>
                <button
                  onClick={hubCloseApp}
                  className="btn btn-danger"
                  style={{ width: "100%" }}
                >
                  Close App
                </button>
              </div>

              <div className="demo-card-section">
                <div className="demo-card-label">App State Subscription</div>
                {!appStateSubscribed ? (
                  <button
                    onClick={hubSubscribeAppState}
                    className="btn btn-primary"
                    style={{ width: "100%" }}
                  >
                    Subscribe
                  </button>
                ) : (
                  <>
                    <button
                      onClick={hubUnsubscribeAppState}
                      className="btn"
                      style={{ width: "100%", marginBottom: "var(--space-sm)" }}
                    >
                      Unsubscribe
                    </button>
                    <div className="updater-card">
                      <div style={{ marginBottom: "var(--space-xs)" }}>
                        Status:{" "}
                        <strong>
                          {appStateIsOpen === null
                            ? "Unknown"
                            : appStateIsOpen
                              ? "OPEN"
                              : "CLOSED"}
                        </strong>
                      </div>
                      {appStateLog.length > 0 && (
                        <div
                          style={{
                            marginTop: "var(--space-sm)",
                            maxHeight: "120px",
                            overflowY: "auto",
                          }}
                        >
                          {appStateLog.map((entry, i) => (
                            <div key={i} className="log-entry">
                              <span className="log-timestamp">
                                {entry.timestamp}
                              </span>
                              <span
                                style={{
                                  color: entry.isOpen
                                    ? "var(--color-success)"
                                    : "var(--color-text-muted)",
                                  fontWeight: "var(--font-semibold)",
                                }}
                              >
                                {entry.isOpen ? "OPENED" : "CLOSED"}
                              </span>
                              {entry.trigger && (
                                <span
                                  style={{
                                    color: "var(--color-text-muted)",
                                    fontSize: "var(--text-xs)",
                                  }}
                                >
                                  {" "}
                                  ({entry.trigger})
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Event Preview */}
        <div className="section-collapsible">
          <div
            className="section-header"
            onClick={() => setEventPreviewCollapsed(!eventPreviewCollapsed)}
          >
            <div
              className="section-chevron"
              style={{
                transform: eventPreviewCollapsed
                  ? "rotate(0deg)"
                  : "rotate(90deg)",
              }}
            >
              ▶
            </div>
            <h2 className="section-title">Event Preview</h2>
          </div>
          <div
            className={`section-content ${eventPreviewCollapsed ? "collapsed" : ""}`}
          >
            <div className="section-inner">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "var(--space-lg)",
                }}
              >
                <div style={{ color: "var(--color-text-secondary)" }}>
                  {eventPreviews.length} event
                  {eventPreviews.length !== 1 ? "s" : ""}
                </div>
                {eventPreviews.length > 0 && (
                  <button
                    onClick={() => setEventPreviews([])}
                    className="btn btn-sm"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                {eventPreviews.length === 0 ? (
                  <p className="empty-state">
                    No events yet. Subscribe to events to see them here.
                  </p>
                ) : (
                  eventPreviews.map((event, index) => (
                    <div key={index} className="event-preview-card">
                      <div className="event-preview-header">
                        <div className="event-preview-title">{event.type}</div>
                        <div className="event-preview-time">
                          {new Date(event.timestamp).toLocaleTimeString()} •{" "}
                          {event.streamType}
                        </div>
                      </div>
                      <pre className="event-preview-code">
                        {JSON.stringify(event.data, null, 2)}
                      </pre>
                    </div>
                  ))
                )}
              </div>

              {/* Context Changes */}
              {contextChanges.length > 0 && (
                <>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      margin: "var(--space-xl) 0 var(--space-lg)",
                    }}
                  >
                    <div className="demo-card-label">Context Changes</div>
                    <button
                      onClick={() => setContextChanges([])}
                      className="btn btn-sm"
                    >
                      Clear
                    </button>
                  </div>
                  <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                    {contextChanges.map((change, index) => (
                      <div key={index} className="event-preview-card">
                        <div className="event-preview-header">
                          <div className="event-preview-title">
                            {change.contextKey}{" "}
                            <span
                              style={{
                                color: "var(--color-text-muted)",
                                fontWeight: "normal",
                              }}
                            >
                              ({change.changeType})
                            </span>
                          </div>
                          <div className="event-preview-time">
                            {new Date(change.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                        {change.changeType !== "closed" && (
                          <pre className="event-preview-code">
                            {JSON.stringify(change.currentData, null, 2)}
                          </pre>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Active Updaters (Write to EHR) */}
        <div className="section-collapsible">
          <div
            className="section-header"
            onClick={() => setActiveUpdatersCollapsed(!activeUpdatersCollapsed)}
          >
            <div
              className="section-chevron"
              style={{
                transform: activeUpdatersCollapsed
                  ? "rotate(0deg)"
                  : "rotate(90deg)",
              }}
            >
              ▶
            </div>
            <h2 className="section-title">Active Updaters (Write to EHR)</h2>
          </div>
          <div
            className={`section-content ${activeUpdatersCollapsed ? "collapsed" : ""}`}
          >
            <div className="section-inner">
              <div className="demo-card-section">
                <div className="demo-card-label">
                  Available Updaters ({writebackEntries.length})
                </div>
                <div className="event-list">
                  {writebackEntries.length === 0 ? (
                    <div className="empty-state">No updaters available</div>
                  ) : (
                    writebackEntries.map((upd, idx: number) => {
                      const isActive =
                        activeUpdaters.has(upd.entityType) &&
                        activeUpdaters
                          .get(upd.entityType)!
                          .has(`${upd.entityType}:${upd.fieldPath}`);
                      return (
                        <div
                          key={`${upd.entityType}-${upd.fieldPath}-${idx}`}
                          className="event-item"
                        >
                          <div>
                            <div className="event-name">{upd.fieldPath}</div>
                            <div
                              style={{
                                fontSize: "var(--text-xs)",
                                color: "var(--color-text-muted)",
                              }}
                            >
                              {upd.entityType}
                              {upd.disruptive ? " • requires permission" : ""}
                            </div>
                          </div>
                          <div
                            className="toggle-switch"
                            onClick={() =>
                              toggleUpdater(upd.entityType, upd.fieldPath, "")
                            }
                          >
                            <div
                              className={`toggle-track ${isActive ? "active" : ""}`}
                            >
                              <div className="toggle-thumb" />
                            </div>
                            <span className="toggle-label">
                              {isActive ? "ON" : "OFF"}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Active Updater Controls */}
              {activeUpdaters.size > 0 && (
                <div className="demo-card-section">
                  <div className="demo-card-label">Update Controls</div>
                  {Array.from(activeUpdaters.entries()).map(
                    ([entityTypeKey, updaterMap]) => {
                      return (
                      <div
                        key={entityTypeKey}
                        style={{ marginBottom: "var(--space-md)" }}
                      >
                        <div
                          className="demo-card-label"
                          style={{ marginBottom: "var(--space-sm)" }}
                        >
                          {entityTypeKey}
                        </div>
                        {Array.from(updaterMap.entries()).map(
                          ([key, updater]) => {
                            const fieldPrefixes = getFieldParentPrefixes(updater.fieldPath);
                            const currentScope = updater.permScope;
                            const permFields = getPermFieldsForUpdater(updater);
                            const capOptions = permFields ? { fields: permFields } : undefined;
                            const cap =
                              (vimSDK?.ehr?.context as any)?.[
                                updater.entityType
                              ]?.getCapability("update", capOptions);
                            const detected = cap?.available ?? false;
                            return (
                              <div
                                key={key}
                                className={`updater-card ${!detected ? "disabled" : ""}`}
                              >
                                <div className="updater-card-header">
                                  {updater.fieldPath}
                                  {!detected && (
                                    <span className="updater-warning">
                                      ({cap?.reason === "not_granted"
                                        ? "not granted to this app"
                                        : cap?.reason === "not_configured"
                                          ? "not configured in this EHR"
                                          : "not in context"})
                                    </span>
                                  )}
                                </div>
                                {/* Per-field permission scope selector */}
                                <div style={{ marginBottom: "var(--space-sm)", display: "flex", alignItems: "center", gap: "var(--space-sm)", flexWrap: "wrap" }}>
                                  <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)" }}>
                                    Perm scope:
                                  </span>
                                  <select
                                    value={
                                      currentScope.mode === "all"
                                        ? "all"
                                        : `${currentScope.mode}:${currentScope.token}`
                                    }
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      if (val === "all") {
                                        updateUpdaterPermScope(entityTypeKey, key, { mode: "all", token: null });
                                      } else if (val.startsWith("prefix:")) {
                                        updateUpdaterPermScope(entityTypeKey, key, { mode: "prefix", token: val.slice(7) });
                                      } else if (val.startsWith("specific:")) {
                                        updateUpdaterPermScope(entityTypeKey, key, { mode: "specific", token: val.slice(9) });
                                      }
                                    }}
                                    className="input"
                                    style={{ fontSize: "var(--text-xs)", padding: "2px 6px" }}
                                  >
                                    <option value="all">All fields</option>
                                    {fieldPrefixes.map((prefix) => (
                                      <option key={`prefix:${prefix}`} value={`prefix:${prefix}`}>
                                        Prefix: {prefix}.*
                                      </option>
                                    ))}
                                    <option value={`specific:${updater.fieldPath}`}>
                                      Field: {updater.fieldPath}
                                    </option>
                                  </select>
                                </div>
                                <div className="input-group">
                                  <input
                                    type="text"
                                    value={updater.value}
                                    onChange={(e) =>
                                      updateUpdaterValue(
                                        entityTypeKey,
                                        key,
                                        e.target.value,
                                      )
                                    }
                                    placeholder="Enter value..."
                                    disabled={!detected}
                                    className="input"
                                  />
                                  <select
                                    value={updater.mode}
                                    onChange={(e) =>
                                      updateUpdaterMode(
                                        entityTypeKey,
                                        key,
                                        e.target.value as "override" | "append",
                                      )
                                    }
                                    disabled={!detected}
                                    className="input"
                                  >
                                    <option value="override">Override</option>
                                    <option value="append">Append</option>
                                  </select>
                                </div>
                                <button
                                  onClick={() => executeUpdate(updater)}
                                  disabled={!detected}
                                  className="btn btn-primary"
                                  style={{
                                    width: "100%",
                                    opacity: detected ? 1 : 0.5,
                                  }}
                                >
                                  Update
                                </button>
                              </div>
                            );
                          },
                        )}
                      </div>
                      );
                    }
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* API Writes (Write via SDK API) — apiAutomation path */}
        <div className="section-collapsible">
          <div
            className="section-header"
            onClick={() => setApiWritesCollapsed(!apiWritesCollapsed)}
          >
            <div
              className="section-chevron"
              style={{
                transform: apiWritesCollapsed ? "rotate(0deg)" : "rotate(90deg)",
              }}
            >
              ▶
            </div>
            <h2 className="section-title">API Writes (SDK ehr.api.*)</h2>
          </div>
          <div
            className="section-content"
            style={{ display: apiWritesCollapsed ? "none" : "block" }}
          >
            <div className="updater-card">
              <div className="updater-card-header">
                encounter.updateProcedureCodes (CPT)
                <span
                  style={{
                    marginLeft: "var(--space-sm)",
                    fontSize: "var(--text-xs)",
                    fontWeight: 600,
                    padding: "2px 6px",
                    borderRadius: "var(--radius-sm, 4px)",
                    background: "color-mix(in srgb, #9333ea 15%, transparent)",
                    color: "#9333ea",
                    border: "1px solid color-mix(in srgb, #9333ea 30%, transparent)",
                    letterSpacing: "0.5px",
                    fontFamily: "var(--font-mono, monospace)",
                  }}
                >
                  UPDATE
                </span>
              </div>
              <div
                style={{
                  marginBottom: "var(--space-sm)",
                  fontSize: "var(--text-xs)",
                  color: "var(--color-text-muted)",
                }}
              >
                Calls vimSDK.ehr.api.encounter.updateProcedureCodes — the
                active EHR's apiAutomation handles the call. Independent of
                the user's current view.
              </div>
              <div className="input-group" style={{ marginBottom: "var(--space-sm)" }}>
                <input
                  type="text"
                  value={cptEncounterId}
                  onChange={(e) => setCptEncounterId(e.target.value)}
                  placeholder="Encounter ID (required)"
                  className="input"
                />
              </div>
              <div className="input-group" style={{ marginBottom: "var(--space-sm)" }}>
                <input
                  type="text"
                  value={cptCode}
                  onChange={(e) => setCptCode(e.target.value)}
                  placeholder='CPT code (e.g. 99213) or JSON array [{"code":"99213"}]'
                  className="input"
                />
              </div>
              <button
                onClick={executeUpdateProcedureCodes}
                className="btn btn-primary"
                style={{ width: "100%" }}
              >
                Update Procedure Codes
              </button>
            </div>
          </div>
        </div>

        {/* API Reads (Read via SDK API) — catalog getById/search, data-driven */}
        <div className="section-collapsible">
          <div
            className="section-header"
            onClick={() => setApiReadsCollapsed(!apiReadsCollapsed)}
          >
            <div
              className="section-chevron"
              style={{
                transform: apiReadsCollapsed ? "rotate(0deg)" : "rotate(90deg)",
              }}
            >
              ▶
            </div>
            <h2 className="section-title">API Reads (SDK ehr.api.*)</h2>
          </div>
          <div
            className="section-content"
            style={{ display: apiReadsCollapsed ? "none" : "block" }}
          >
            {readOps.length === 0 ? (
              <div
                style={{
                  fontSize: "var(--text-sm)",
                  color: "var(--color-text-muted)",
                }}
              >
                No read operations (getById / search) are available in this
                EHR&apos;s collection.
              </div>
            ) : (
              readOps.map((op: any) => {
                const opKey = `${op.sdkNamespace}.${op.sdkMethod}`;
                const meta = op.metadata ?? {};
                // search inputs, all optional and data-driven from the manifest:
                // a query box (supportsQuery), one box per filter paramName, and a
                // cursor box (paginated). getById ops expose no inputs — the id is
                // resolved from live context.
                const showQuery =
                  op.operationType === "search" && !!meta.supportsQuery;
                const filterFields: string[] =
                  op.operationType === "search"
                    ? (meta.filterFields ?? [])
                    : [];
                const showCursor =
                  op.operationType === "search" && !!meta.paginated;
                // Optional — an empty box leaves the id to EHR context.
                const idFields: string[] =
                  op.operationType === "getById"
                    ? (meta.idParameterNames ?? [])
                    : [];
                const result = readOpResults[opKey];
                return (
                  <div className="updater-card" key={opKey}>
                    <div className="updater-card-header">
                      ehr.api.{opKey}
                      <span
                        style={{
                          marginLeft: "var(--space-sm)",
                          fontSize: "var(--text-xs)",
                          fontWeight: 600,
                          padding: "2px 6px",
                          borderRadius: "var(--radius-sm, 4px)",
                          background:
                            "color-mix(in srgb, #0891b2 15%, transparent)",
                          color: "#0891b2",
                          border:
                            "1px solid color-mix(in srgb, #0891b2 30%, transparent)",
                          letterSpacing: "0.5px",
                          fontFamily: "var(--font-mono, monospace)",
                        }}
                      >
                        {op.operationType === "search" ? "SEARCH" : "GET"}
                      </span>
                    </div>
                    <div
                      style={{
                        marginBottom: "var(--space-sm)",
                        fontSize: "var(--text-xs)",
                        color: "var(--color-text-muted)",
                      }}
                    >
                      {op.sdkSignature ?? `Catalog entry: ${op.catalogEntryId}`}
                    </div>

                    {/* getById ids — optional; empty means "use EHR context" */}
                    {idFields.map((name) => {
                      const key = `${opKey}.id.${name}`;
                      return (
                        <div
                          className="input-group"
                          style={{ marginBottom: "var(--space-xs)" }}
                          key={name}
                        >
                          <input
                            type="text"
                            value={readOpInputs[key] ?? ""}
                            onChange={(e) =>
                              setReadOpInputs((prev) => ({
                                ...prev,
                                [key]: e.target.value,
                              }))
                            }
                            placeholder={`${name} (optional — defaults to EHR context)`}
                            className="input"
                          />
                        </div>
                      );
                    })}

                    {/* search query — only when the op supports free-text query */}
                    {showQuery && (
                      <div
                        className="input-group"
                        style={{ marginBottom: "var(--space-xs)" }}
                      >
                        <input
                          type="text"
                          value={readOpInputs[`${opKey}.query`] ?? ""}
                          onChange={(e) =>
                            setReadOpInputs((prev) => ({
                              ...prev,
                              [`${opKey}.query`]: e.target.value,
                            }))
                          }
                          placeholder="query (optional)"
                          className="input"
                        />
                      </div>
                    )}

                    {/* typed filters — one box per filter paramName in the schema */}
                    {filterFields.map((field) => {
                      const key = `${opKey}.filters.${field}`;
                      return (
                        <div
                          className="input-group"
                          style={{ marginBottom: "var(--space-xs)" }}
                          key={field}
                        >
                          <input
                            type="text"
                            value={readOpInputs[key] ?? ""}
                            onChange={(e) =>
                              setReadOpInputs((prev) => ({
                                ...prev,
                                [key]: e.target.value,
                              }))
                            }
                            placeholder={`filters.${field} (optional)`}
                            className="input"
                          />
                        </div>
                      );
                    })}

                    {/* cursor — pagination token for paginated searches */}
                    {showCursor && (
                      <div
                        className="input-group"
                        style={{ marginBottom: "var(--space-sm)" }}
                      >
                        <input
                          type="text"
                          value={readOpInputs[`${opKey}.cursor`] ?? ""}
                          onChange={(e) =>
                            setReadOpInputs((prev) => ({
                              ...prev,
                              [`${opKey}.cursor`]: e.target.value,
                            }))
                          }
                          placeholder="cursor (optional — from a previous page's pagination.nextCursor)"
                          className="input"
                        />
                      </div>
                    )}

                    <button
                      onClick={() => executeReadOperation(op)}
                      className="btn btn-primary"
                      style={{ width: "100%" }}
                      disabled={readOpRunning[opKey]}
                    >
                      {readOpRunning[opKey]
                        ? "Running…"
                        : `Run ${op.sdkMethod}`}
                    </button>

                    {readOpRanAt[opKey] && (
                      <div
                        style={{
                          marginTop: "var(--space-xs)",
                          fontSize: "var(--text-xs)",
                          color: "var(--color-text-muted)",
                        }}
                      >
                        Last run: {readOpRanAt[opKey]}
                      </div>
                    )}

                    {result != null && (
                      <pre
                        style={{
                          marginTop: "var(--space-sm)",
                          padding: "var(--space-sm)",
                          background: "var(--color-surface-alt, #f4f4f5)",
                          borderRadius: "var(--radius-sm, 4px)",
                          fontSize: "var(--text-xs)",
                          fontFamily: "var(--font-mono, monospace)",
                          maxHeight: "260px",
                          overflow: "auto",
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-word",
                        }}
                      >
                        {result}
                      </pre>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Activity Log */}
        <div className="section-collapsible">
          <div
            className="section-header"
            onClick={() => setActivityLogCollapsed(!activityLogCollapsed)}
          >
            <div
              className="section-chevron"
              style={{
                transform: activityLogCollapsed
                  ? "rotate(0deg)"
                  : "rotate(90deg)",
              }}
            >
              ▶
            </div>
            <h2 className="section-title">Activity Log</h2>
          </div>
          <div
            className={`section-content ${activityLogCollapsed ? "collapsed" : ""}`}
          >
            <div className="section-inner">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "var(--space-lg)",
                }}
              >
                <div style={{ color: "var(--color-text-secondary)" }}>
                  {logEntries.length} log entr
                  {logEntries.length !== 1 ? "ies" : "y"}
                </div>
                {logEntries.length > 0 && (
                  <button
                    onClick={() => setLogEntries([])}
                    className="btn btn-sm"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="activity-log">
                {logEntries.length === 0 ? (
                  <p className="empty-state">No activity yet</p>
                ) : (
                  logEntries.map((entry, index) => (
                    <div key={index} className={`log-entry ${entry.type}`}>
                      <span className="log-timestamp">{entry.timestamp}</span>{" "}
                      {entry.message}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SDK Manifest Modal */}
      {manifestModalOpen && (
        <div
          className="modal-overlay"
          onClick={() => setManifestModalOpen(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">SDK Manifest</h2>
              <button
                className="modal-close"
                onClick={() => setManifestModalOpen(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <pre className="modal-json">
                {JSON.stringify(manifest, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Main App Page with Suspense boundary
 */
export default function AppPage() {
  return (
    <Suspense
      fallback={
        <div className="loading-container">
          <div className="loading-content">
            <div className="spinner" style={{ margin: "0 auto 16px" }} />
            <p style={{ color: "var(--color-text-muted)" }}>Loading...</p>
          </div>
        </div>
      }
    >
      <AppPageContent />
    </Suspense>
  );
}
