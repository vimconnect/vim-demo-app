"use client";

import { Fragment, Suspense, useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { initVimSDK, type VimSDK, type AppManifest, type WorkflowEvent, type AppOpenStatus, type ContextKey, type ContextKeyEntityMap, type EventType } from "@vimconnect/app-sdk";
import { ErrorScreen } from "@/components/ErrorScreen";
import { CapabilityAutoRunner } from "@/components/CapabilityAutoRunner";
import { CodeBlock, CopyButton } from "@/components/CodeBlock";
import { CollapsibleCard } from "@/components/CollapsibleCard";
import { DocsView } from "@/components/DocsView";
import { ManifestView } from "@/components/ManifestView";
import { Breadcrumb, GithubIcon, NavTabs, type DemoView } from "@/components/NavTabs";
import { getDeveloperDocsUrl, getEnvironment } from "@/lib/sdk-config";
import { SessionContextPanel } from "@/components/SessionContextPanel";
import {
  DEMO_WORKER_STATE_KEY,
  REFRESH_DEMO_EVENT,
  type DemoWorkerData,
} from "@/lib/worker-demo";
import {
  DEMO_APP_FORK_COMMAND,
  DEMO_APP_REPO_URL,
  REDIRECT_HANDLED_EVENT,
  REDIRECT_REQUEST_STATE_KEY,
  isFreshRedirectRequest,
  type RedirectRequest,
} from "@/lib/welcome-push";
import {
  collectionWritebackEntriesOf,
  sampleValueFor,
  writebackEntriesOf,
  writeModesFor,
  type WriteMode,
} from "@/lib/writeback-samples";
import { sortByFieldOrder } from "@/lib/field-order";
import { DeprecatedTag } from "@/components/DeprecatedTag";
import {
  annotatedLines,
  apiResultAnnotator,
  contextAnnotator,
  fieldDeprecation,
  noteOf,
  workflowEventAnnotator,
} from "@/lib/annotated-json";
import { orderEntityGroups } from "@/lib/panel-layout";
import { Hint, InfoTip } from "@/components/Hint";
import { DeviceAccessControls } from "@/components/DeviceAccessControls";
import { InPageSearch } from "@/components/InPageSearch";
import { entityLabel } from "@/lib/entity-label";
import { groupUpdatesByEntity, parseUpdaterValue, setPath } from "@/lib/batch-updates";
import { copyText } from "@/lib/clipboard";
import { unavailableReasonText, type CapabilityAction } from "@/lib/updater-availability";

type LogEntry = {
  timestamp: string;
  message: string;
  type: "info" | "success" | "error";
};

type UpdaterInfo = {
  entityType: string;
  fieldPath: string;
  componentId: string;
  value: string;
};

type UpdaterMap = Map<string, Map<string, UpdaterInfo>>;

function newUpdater(entityType: string, fieldPath: string): UpdaterInfo {
  return {
    entityType,
    fieldPath,
    componentId: "",
    value: "",
  };
}

/** `prev` plus an updater for each entry it lacks; existing updaters keep their state. */
function withUpdaters(
  prev: UpdaterMap,
  entries: { entityType: string; fieldPath: string }[],
): UpdaterMap {
  const next: UpdaterMap = new Map(
    Array.from(prev, ([entity, updaters]) => [entity, new Map(updaters)]),
  );
  for (const { entityType, fieldPath } of entries) {
    const key = `${entityType}:${fieldPath}`;
    if (!next.has(entityType)) next.set(entityType, new Map());
    const updaters = next.get(entityType)!;
    if (!updaters.has(key)) updaters.set(key, newUpdater(entityType, fieldPath));
  }
  return next;
}

/** "v29 (live)"; null when the extension predates manifest-version reporting. */
function formatManifestVersion(v: { version: number; status: string } | null): string {
  return v ? `v${v.version} (${v.status})` : "unknown";
}

function ToggleAllLabel({
  label,
  count,
  allOn,
  onToggle,
}: {
  label: string;
  count: number;
  allOn: boolean;
  onToggle: (on: boolean) => void;
}) {
  return (
    <div
      className="demo-card-label"
      style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
    >
      <span>{label}</span>
      {count > 0 && (
        <div className="toggle-switch" onClick={() => onToggle(!allOn)}>
          <span className="toggle-label">{allOn ? "Turn all off" : "Turn all on"}</span>
          <div className={`toggle-track ${allOn ? "active" : ""}`}>
            <div className="toggle-thumb" />
          </div>
        </div>
      )}
    </div>
  );
}

function withoutKey<V>(map: Map<string, V>, key: string): Map<string, V> {
  if (!map.has(key)) return map;
  const next = new Map(map);
  next.delete(key);
  return next;
}

/** The short reason shown on a subscription row the SDK refused. */
function refusalText(err: any): string {
  return err?.code === "PERMISSION_DENIED"
    ? "Not in your app manifest — add it on the EHR tab"
    : (err?.message ?? "Refused by the SDK");
}

type EventPreview = {
  /** Unique per entry: the stable React key for its <details>. */
  key: number;
  id: string;
  timestamp: string;
  type: string;
  data: Record<string, unknown>;
  streamType: "workflow" | "context";
};

type ContextEntityData = ContextKeyEntityMap[ContextKey];

type ContextChange = {
  /** Unique per entry: the stable React key for its <details>. */
  key: number;
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
 * (referral_open:referral is a genuine context event and stays visible.)
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
  // Every view shares this one initialized SDK session and its subscriptions.
  const [view, setView] = useState<DemoView>("main");

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
  const workflowUnsubscribeRefs = useRef<Map<string, () => void>>(new Map());
  const previewKeyRef = useRef(0);
  const nextPreviewKey = () => ++previewKeyRef.current;
  // A ref, not only state: a second click in the same render must see the run in progress.
  const updatingAllRef = useRef(false);
  const [updatingAll, setUpdatingAll] = useState(false);
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
  const [workerCollapsed, setWorkerCollapsed] = useState(true);
  const [readCollapsed, setReadCollapsed] = useState(false);
  const [hubControlsCollapsed, setHubControlsCollapsed] = useState(true);
  const [eventPreviewCollapsed, setEventPreviewCollapsed] = useState(false);
  const [activeUpdatersCollapsed, setActiveUpdatersCollapsed] = useState(true);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [searchOpen, setSearchOpen] = useState(false);
  const [activityLogCollapsed, setActivityLogCollapsed] = useState(false);
  const toggleCard = (id: string) =>
    setExpandedCards((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  // The write mode picked per `${entity}:${field}`; absent means the field's default.
  const [writeModeChoice, setWriteModeChoice] = useState<Record<string, WriteMode>>({});

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
  const [readOpValues, setReadOpValues] = useState<Record<string, unknown>>({});
  // Per-op "in flight" flag + last-run timestamp, so a repeat Run is visible
  // even when the response is byte-identical to the previous one.
  const [readOpRunning, setReadOpRunning] = useState<Record<string, boolean>>(
    {},
  );
  const [readOpRanAt, setReadOpRanAt] = useState<Record<string, string>>({});

  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
  // Why the SDK refused a workflow event or context subscription, keyed by event id / context key.
  const [subscriptionRefusals, setSubscriptionRefusals] = useState<Map<string, string>>(new Map());
  // Subscribed context keys whose entity is currently open in the EHR.
  const [openContextKeys, setOpenContextKeys] = useState<Set<string>>(new Set());
  const [redirectCopy, setRedirectCopy] = useState<{
    target: "command" | "link";
    ok: boolean;
  } | null>(null);
  const redirectCopyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const copyRedirect = (target: "command" | "link", text: string) => {
    void copyText(text).then((ok) => {
      setRedirectCopy({ target, ok });
      if (redirectCopyTimerRef.current) clearTimeout(redirectCopyTimerRef.current);
      if (ok) {
        redirectCopyTimerRef.current = setTimeout(() => setRedirectCopy(null), 2000);
      }
    });
  };
  const handledRedirectAtRef = useRef(0);
  const redirectUnsubRef = useRef<(() => void) | null>(null);

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
  // A field turned off by the user stays off when the manifest is re-read.
  const seenUpdaterKeysRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const unseen = writebackEntriesOf(manifest).filter(
      (e) => !seenUpdaterKeysRef.current.has(`${e.entityType}:${e.fieldPath}`),
    );
    if (unseen.length === 0) return;
    unseen.forEach((e) =>
      seenUpdaterKeysRef.current.add(`${e.entityType}:${e.fieldPath}`),
    );
    setActiveUpdaters((prev) => withUpdaters(prev, unseen));
  }, [manifest]);

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

    const subscribedEventIds = eventIds.filter((id) => subscribeToWorkflowEvent(id));
    const subscribedCtxKeys = ctxKeys.filter((k) => subscribeToContext(k));

    setSubscribedWorkflowEvents(new Set(subscribedEventIds));
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
      addLog(
        `App manifest: ${formatManifestVersion(sdk.manifestVersion)}`,
        sdk.manifestVersion?.status === "live" ? "info" : "error",
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

      redirectUnsubRef.current = sdk.workerState.on<RedirectRequest>(
        REDIRECT_REQUEST_STATE_KEY,
        (_prev, next) => {
          if (!isFreshRedirectRequest(next, handledRedirectAtRef.current)) {
            return;
          }
          handledRedirectAtRef.current = next.requestedAt;
          setRedirectCopy(null);
          setRedirectUrl(next.url);
          sdk.appEvents?.send(REDIRECT_HANDLED_EVENT);
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
      redirectUnsubRef.current?.();
      redirectUnsubRef.current = null;
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
    try {
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
    } catch (err: any) {
      // Also to the console: an in-app panel is easy to miss, and a swallowed
      // refusal is the silence this gate exists to replace.
      console.error("[demo-app] hub.notificationBadge refused:", err);
      addLog(`Hub: notificationBadge failed — ${err.message}`, "error");
      return;
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
    try {
      vimSDK.hub.pushNotification.show(details);
      addLog(
        `Hub: pushNotification.show (timeout: ${pushNotificationTimeout}s)`,
        "success",
      );
    } catch (err: any) {
      console.error("[demo-app] hub.pushNotification.show refused:", err);
      addLog(`Hub: pushNotification.show failed — ${err.message}`, "error");
    }
  }

  function hubHidePushNotification() {
    if (!vimSDK) return;
    try {
      vimSDK.hub.pushNotification.hide();
      addLog("Hub: pushNotification.hide()", "success");
    } catch (err: any) {
      console.error("[demo-app] hub.pushNotification.hide refused:", err);
      addLog(`Hub: pushNotification.hide failed — ${err.message}`, "error");
    }
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
  // Returns true if the subscription was established, so callers know whether
  // to track it in subscribedWorkflowEvents. `on()` throws for an event the EHR
  // does not define and for one the manifest does not grant — neither should
  // cost the app the events it IS allowed.
  function subscribeToWorkflowEvent(eventId: string): boolean {
    if (!vimSDK) return false;
    try {
      const unsubscribe = vimSDK.ehr.workflow.on(eventId as EventType, (event: WorkflowEvent) => {
        addLog(`Workflow event: ${event.type}`, "success");
        setEventPreviews((prev) => [
          {
            key: nextPreviewKey(),
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
      workflowUnsubscribeRefs.current.set(eventId, unsubscribe);
      setSubscriptionRefusals((prev) => withoutKey(prev, eventId));
      return true;
    } catch (err: any) {
      setSubscriptionRefusals((prev) => new Map(prev).set(eventId, refusalText(err)));
      // Also to the console: an in-app panel is easy to miss, and a swallowed
      // refusal is the silence this gate exists to replace.
      console.error(`[demo-app] workflow.on("${eventId}") refused:`, err);
      addLog(`Failed to subscribe to ${eventId}: ${err.message}`, "error");
      return false;
    }
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
          setOpenContextKeys((prev) => {
            const next = new Set(prev);
            if (currentData) next.add(contextKey);
            else next.delete(contextKey);
            return next;
          });
          setContextChanges((prev) => [
            {
              key: nextPreviewKey(),
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
      setSubscriptionRefusals((prev) => withoutKey(prev, contextKey));
      return true;
    } catch (err: any) {
      setSubscriptionRefusals((prev) => new Map(prev).set(contextKey, refusalText(err)));
      console.error(`[demo-app] context.onChange("${contextKey}") refused:`, err);
      addLog(`Failed to subscribe to context: ${err.message}`, "error");
      return false;
    }
  }

  function toggleWorkflowEvent(eventId: string) {
    if (!vimSDK) return;

    const newSet = new Set(subscribedWorkflowEvents);
    if (newSet.has(eventId)) {
      newSet.delete(eventId);
      workflowUnsubscribeRefs.current.get(eventId)?.();
      workflowUnsubscribeRefs.current.delete(eventId);
      addLog(`Unsubscribed from ${eventId}`, "info");
    } else if (subscribeToWorkflowEvent(eventId)) {
      newSet.add(eventId);
      addLog(`Subscribed to ${eventId}`, "success");
    }
    setSubscribedWorkflowEvents(newSet);
  }

  function setAllWorkflowEvents(on: boolean) {
    if (!vimSDK) return;
    const ids: string[] = (manifest?.supportedEvents ?? []).map((e) => e.id);
    if (on) {
      const added = ids.filter(
        (id) => subscribedWorkflowEvents.has(id) || subscribeToWorkflowEvent(id),
      );
      setSubscribedWorkflowEvents(new Set(added));
    } else {
      workflowUnsubscribeRefs.current.forEach((unsubscribe) => unsubscribe());
      workflowUnsubscribeRefs.current.clear();
      setSubscribedWorkflowEvents(new Set());
    }
    addLog(`${on ? "Subscribed to" : "Unsubscribed from"} all workflow events`, "info");
  }

  function setAllContextEvents(on: boolean) {
    if (!vimSDK) return;
    const keys = (manifest?.supportedContexts ?? [])
      .map((c) => c.contextKey)
      .filter((k) => !HIDDEN_CONTEXT_KEYS.has(k));
    if (on) {
      const added = keys.filter(
        (k) => subscribedContexts.has(k) || subscribeToContext(k),
      );
      setSubscribedContexts(new Set(added));
    } else {
      contextUnsubscribeRefs.current.forEach((unsubscribe) => unsubscribe());
      contextUnsubscribeRefs.current.clear();
      setSubscribedContexts(new Set());
      setOpenContextKeys(new Set());
    }
    addLog(`${on ? "Subscribed to" : "Unsubscribed from"} all context events`, "info");
  }

  function toggleContextEvent(contextKey: string) {
    if (!vimSDK) return;

    const newSet = new Set(subscribedContexts);
    if (newSet.has(contextKey)) {
      newSet.delete(contextKey);
      contextUnsubscribeRefs.current.get(contextKey)?.();
      contextUnsubscribeRefs.current.delete(contextKey);
      setOpenContextKeys((prev) => {
        const next = new Set(prev);
        next.delete(contextKey);
        return next;
      });
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
      newMap
        .get(entityTypeKey)!
        .set(key, { ...newUpdater(entityTypeKey, fieldPath), componentId });
      addLog(`Enabled updater for ${fieldPath}`, "success");
    }

    setActiveUpdaters(newMap);
  }

  function setAllUpdaters(on: boolean, entityType?: string) {
    const entries = (on ? availableWritebackEntries : writebackEntries).filter(
      (e) => entityType === undefined || e.entityType === entityType,
    );
    setActiveUpdaters((prev) => {
      if (on) return withUpdaters(prev, entries);
      const next: UpdaterMap = new Map(
        Array.from(prev, ([entity, updaters]) => [entity, new Map(updaters)]),
      );
      for (const e of entries) {
        next.get(e.entityType)?.delete(`${e.entityType}:${e.fieldPath}`);
        if (next.get(e.entityType)?.size === 0) next.delete(e.entityType);
      }
      return next;
    });
    addLog(
      `${on ? "Enabled" : "Disabled"} ${entries.length} ${entityType ?? "available"} updater(s)`,
      "info",
    );
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
    if (!encounterApi) {
      addLog(
        "encounter.updateProcedureCodes is not in this session's manifest — the EHR was likely not detected when the app launched. Reopen the app on the encounter.",
        "error",
      );
      return;
    }

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
      setReadOpValues((prev) => ({ ...prev, [opKey]: result }));
      if (result && (result as any).success === false) {
        const r = result as any;
        const detail = r.error ?? r.apiError ?? pretty.slice(0, 500);
        addLog(`${opKey} returned success:false — ${detail}`, "error");
      } else {
        addLog(`${opKey} succeeded`, "success");
      }
    } catch (err: any) {
      setReadOpResults((prev) => ({ ...prev, [opKey]: `Error: ${err.message}` }));
      setReadOpValues((prev) => ({ ...prev, [opKey]: undefined }));
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

  /**
   * Asks for `scope` when it is not already granted, then runs each write. Permission is
   * re-checked before every write: an "Allow once" grant is used up by the first one.
   * Returns how many of the writes' fields were written.
   */
  async function writeWithPermission(
    entityType: string,
    scope: string[] | undefined,
    writes: { mode: "override" | "append"; fields: string[]; data: Record<string, unknown> }[],
  ): Promise<number> {
    if (!vimSDK) return 0;
    const namespace = (vimSDK.ehr.context as any)[entityType];
    if (!namespace) {
      addLog(`No writeback namespace for ${entityType}`, "error");
      return 0;
    }
    const permOptions = scope ? { fields: scope } : undefined;
    const scopeLabel = scope ? `[scope: ${scope.join(", ")}]` : "[scope: all fields]";
    let written = 0;
    for (const write of writes) {
      try {
        if (!namespace.hasPermission("update", permOptions)) {
          addLog(`Requesting permission for ${entityType} ${scopeLabel}...`, "info");
          const permResult = await namespace.requestPermission("update", permOptions);
          if (permResult !== "granted") {
            addLog(`Permission ${permResult} for ${entityType}`, "error");
            return written;
          }
        }
        const result = await namespace.update(write.data, { mode: write.mode });
        if (result && result.success === false) {
          addLog(
            `Update failed: ${entityType} [${write.fields.join(", ")}] (${write.mode}) — ${result.error || "Unknown error"}`,
            "error",
          );
          continue;
        }
        written += write.fields.length;
        addLog(`Update successful: ${entityType} [${write.fields.join(", ")}] (${write.mode})`, "success");
      } catch (err: any) {
        addLog(`Update failed: ${entityType} [${write.fields.join(", ")}] — ${err.message}`, "error");
      }
    }
    return written;
  }

  async function executeUpdate(updaterInfo: UpdaterInfo): Promise<boolean> {
    const data: Record<string, unknown> = {};
    setPath(data, updaterInfo.fieldPath, parseUpdaterValue(updaterInfo.value));
    const written = await writeWithPermission(updaterInfo.entityType, getPermFieldsForUpdater(updaterInfo), [
      {
        mode: modeFor(updaterInfo),
        fields: [updaterInfo.fieldPath],
        data,
      },
    ]);
    return written === 1;
  }

  /** The capability a card shows and the bulk buttons count: in context, configured, and granted. */
  function updaterCapability(u: UpdaterInfo) {
    const permFields = getPermFieldsForUpdater(u);
    return (vimSDK?.ehr?.context as any)?.[u.entityType]?.getCapability(
      "update",
      permFields ? { fields: permFields } : undefined,
    );
  }

  function isWritable(u: UpdaterInfo): boolean {
    return updaterCapability(u)?.available === true;
  }

  /** The `getCapability('update')` reason a field can't be written now, or null when it can. */
  function fieldUnavailableReason(entityType: string, fieldPath: string): string | null {
    const cap = (vimSDK?.ehr?.context as any)?.[entityType]?.getCapability("update", {
      fields: [fieldPath],
    });
    return cap?.available === true ? null : (cap?.reason ?? "not_in_context");
  }

  function sampleAllUpdaters(entityType?: string) {
    const inScope = (u: UpdaterInfo) => entityType === undefined || u.entityType === entityType;
    setActiveUpdaters((prev) => {
      const next: UpdaterMap = new Map();
      for (const [entity, updaters] of prev) {
        next.set(
          entity,
          new Map(
            Array.from(updaters, ([key, u]) => [
              key,
              inScope(u) && isWritable(u)
                ? { ...u, value: sampleValueFor(manifest, u.entityType, u.fieldPath) }
                : u,
            ]),
          ),
        );
      }
      return next;
    });
    addLog(
      `Sampled the ${writableUpdaters.filter(inScope).length} ${entityType ?? ""} updater(s) writable in the current context`,
      "info",
    );
  }

  /**
   * The permission scope covering every updater of a batch: the union of their Perm scopes,
   * or the whole entity when any of them asks for all fields.
   */
  function batchScope(updaters: UpdaterInfo[]): string[] {
    return [...new Set(updaters.flatMap(getPermFieldsForUpdater))];
  }

  async function updateAllUpdaters(entityType?: string) {
    if (updatingAllRef.current) return;
    const toWrite = writableWithValue.filter(
      (u) => entityType === undefined || u.entityType === entityType,
    );
    const batches = groupUpdatesByEntity(toWrite);
    if (batches.length === 0) {
      addLog("Update all: no writable updater has a value", "error");
      return;
    }
    updatingAllRef.current = true;
    setUpdatingAll(true);
    let written = 0;
    let failed = 0;
    try {
      for (const batch of batches) {
        const updaters = toWrite.filter((u) => u.entityType === batch.entityType);
        const done = await writeWithPermission(batch.entityType, batchScope(updaters), batch.writes);
        written += done;
        failed += batch.fields.length - done;
      }
    } finally {
      updatingAllRef.current = false;
      setUpdatingAll(false);
    }
    addLog(
      `Update all: ${batches.length} entities, ${written} fields written, ${failed} failed`,
      failed === 0 ? "success" : "error",
    );
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

  function getPermFieldsForUpdater(updater: UpdaterInfo): string[] {
    return [updater.fieldPath];
  }

  function modeFor(u: { entityType: string; fieldPath: string }): WriteMode {
    return (
      writeModeChoice[`${u.entityType}:${u.fieldPath}`] ??
      writeModesFor(manifest, u.entityType, u.fieldPath).defaultMode
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
  const writebackEntries = sortByFieldOrder(manifest, collectionWritebackEntriesOf(manifest));
  const writableUpdaters = Array.from(activeUpdaters.values())
    .flatMap((m) => Array.from(m.values()))
    .filter(isWritable)
    .map((u) => ({ ...u, mode: modeFor(u) }));
  const writableWithValue = writableUpdaters.filter((u) => u.value.trim() !== "");
  const unavailableReasons = new Map(
    writebackEntries.map((e) => [
      `${e.entityType}:${e.fieldPath}`,
      e.ehrSupported ? fieldUnavailableReason(e.entityType, e.fieldPath) : "not_configured",
    ]),
  );
  const availableWritebackEntries = writebackEntries.filter(
    (e) => unavailableReasons.get(`${e.entityType}:${e.fieldPath}`) === null,
  );
  const writebackByEntity = Array.from(
    writebackEntries.reduce((groups, e) => {
      groups.set(e.entityType, [...(groups.get(e.entityType) ?? []), e]);
      return groups;
    }, new Map<string, typeof writebackEntries>()),
  );
  const openEntityTypes = new Set(
    (manifest?.supportedContexts ?? [])
      .filter((c) => openContextKeys.has(c.contextKey))
      .map((c) => c.entityType),
  );
  const availableCountFor = (entityType: string) =>
    (writebackByEntity.find(([e]) => e === entityType)?.[1] ?? []).filter(
      (e) => unavailableReasons.get(`${e.entityType}:${e.fieldPath}`) === null,
    ).length;
  const isEntityOpen = (entityType: string) =>
    openEntityTypes.has(entityType) || availableCountFor(entityType) > 0;
  const orderedEntityGroups = orderEntityGroups(writebackByEntity, isEntityOpen, availableCountFor);
  const isUpdaterOn = (e: { entityType: string; fieldPath: string }) =>
    activeUpdaters.get(e.entityType)?.has(`${e.entityType}:${e.fieldPath}`) === true;
  const allUpdatersOn =
    availableWritebackEntries.length > 0 && availableWritebackEntries.every(isUpdaterOn);

  // Read-side API operations exposed by the active EHR's catalog. getById/search
  // are the non-disruptive reads (updateById/create are writes, handled above).
  /** Short top-right label for an API card the app can't use here, or null. */
  const apiOpLabel = (op: any): string | null => {
    if (!op?.available) return "Not supported on this EHR";
    const cap = (vimSDK?.ehr?.api as any)?.[op.sdkNamespace]?.getCapability?.(op.sdkMethod);
    if (cap?.available === false) {
      return cap.reason === "not_granted" ? "Not in your manifest" : "Not supported on this EHR";
    }
    return null;
  };
  const apiOpReason = (op: any): string | null => {
    if (!op.available) return "This EHR doesn't implement it";
    const cap = (vimSDK?.ehr?.api as any)?.[op.sdkNamespace]?.getCapability?.(op.sdkMethod);
    if (cap && cap.available === false) {
      const isRead = op.operationType === "getById" || op.operationType === "search";
      return unavailableReasonText(cap.reason, op.entityTypeId, isRead ? "read" : "write");
    }
    return null;
  };
  const readOps = (manifest?.operations ?? []).filter(
    (op: any) => op.operationType === "getById" || op.operationType === "search",
  );
  const availableReadOps = readOps.filter((op: any) => apiOpReason(op) === null);
  const writeOps = (manifest?.operations ?? []).filter(
    (op: any) => op.operationType === "updateById" || op.operationType === "create",
  );
  const procedureCodesOp = writeOps.find(
    (op: any) => op.sdkNamespace === "encounter" && op.sdkMethod === "updateProcedureCodes",
  );
  const procedureCodesReason = procedureCodesOp
    ? apiOpReason(procedureCodesOp)
    : "This EHR doesn't implement it";
  const groupReason = (
    entries: { entityType: string; fieldPath: string }[],
    action: CapabilityAction,
  ): string => {
    const first = entries.find((e) => unavailableReasons.get(`${e.entityType}:${e.fieldPath}`));
    return first
      ? unavailableReasonText(
          unavailableReasons.get(`${first.entityType}:${first.fieldPath}`) ?? undefined,
          first.entityType,
          action,
        )
      : "No field here is writable now";
  };
  const availableEvents = supportedEvents.filter((e) => !subscriptionRefusals.has(e.id));
  const availableContexts = supportedContexts.filter(
    (c) => !subscriptionRefusals.has(c.contextKey),
  );


  const readOpsByEntity = Array.from(
    readOps.reduce((groups, op: any) => {
      const entity = op.entityTypeId ?? op.sdkNamespace;
      groups.set(entity, [...(groups.get(entity) ?? []), op]);
      return groups;
    }, new Map<string, any[]>()),
  );
  const orderedReadGroups = orderEntityGroups(
    readOpsByEntity,
    (entity) => openEntityTypes.has(entity),
    (entity) =>
      (readOpsByEntity.find(([e]) => e === entity)?.[1] ?? []).filter((op) => apiOpReason(op) === null).length,
  );
  const allWorkflowOn =
    supportedEvents.length > 0 && supportedEvents.every((e) => subscribedWorkflowEvents.has(e.id));
  const allContextsOn =
    supportedContexts.length > 0 && supportedContexts.every((c) => subscribedContexts.has(c.contextKey));
  const subscriptionTotal = supportedEvents.length + supportedContexts.length;
  const subscriptionAvailable = availableEvents.length + availableContexts.length;
  const readTotal = subscriptionTotal + readOps.length;
  const readAvailable = subscriptionAvailable + availableReadOps.length;

  const turnAllToggle = (on: boolean, onToggle: (on: boolean) => void, label: string) => (
    <div
      className="toggle-switch"
      title={on ? `Turn all ${label} off` : `Turn all ${label} on`}
      onClick={() => onToggle(!on)}
    >
      <div className={`toggle-track ${on ? "active" : ""}`}>
        <div className="toggle-thumb" />
      </div>
    </div>
  );

  const renderReadOp = (op: any) => {
    const opKey = `${op.sdkNamespace}.${op.sdkMethod}`;
    const meta = op.metadata ?? {};
    const showQuery = op.operationType === "search" && !!meta.supportsQuery;
    const filterFields: string[] = op.operationType === "search" ? (meta.filterFields ?? []) : [];
    const showCursor = op.operationType === "search" && !!meta.paginated;
    // Optional — an empty box leaves the id to EHR context.
    const idFields: string[] = op.operationType === "getById" ? (meta.idParameterNames ?? []) : [];
    const result = readOpResults[opKey];
    const opReason = apiOpReason(op);
    // Open only while a subscribed context for this entity reports it; typing an id always unblocks.
    const entityOpen = (manifest?.supportedContexts ?? []).some(
      (c) => c.entityType === op.entityTypeId && openContextKeys.has(c.contextKey),
    );
    const needsContext =
      op.operationType === "getById" &&
      !entityOpen &&
      idFields.every((name) => !(readOpInputs[`${opKey}.id.${name}`] ?? "").trim());
    const runBlocked =
      opReason ??
      (needsContext
        ? `${unavailableReasonText("not_in_context", op.entityTypeId, "read")}, or enter ${idFields.join(" / ") || "an id"}`
        : null);
    const fields: { key: string; placeholder: string; title?: string }[] = [
      ...idFields.map((name) => ({
        key: `${opKey}.id.${name}`,
        placeholder: `${name} (optional)`,
        title: "Leave empty to use the one open in the EHR",
      })),
      ...(showQuery ? [{ key: `${opKey}.query`, placeholder: "query (optional)" }] : []),
      ...filterFields.map((field) => ({ key: `${opKey}.filters.${field}`, placeholder: `filters.${field} (optional)` })),
      ...(showCursor
        ? [{ key: `${opKey}.cursor`, placeholder: "cursor (optional)", title: "From a previous page's pagination.nextCursor" }]
        : []),
    ];
    const input = ({ key, placeholder, title }: (typeof fields)[number]) => (
      <input
        key={key}
        type="text"
        value={readOpInputs[key] ?? ""}
        onChange={(e) => setReadOpInputs((prev) => ({ ...prev, [key]: e.target.value }))}
        placeholder={placeholder}
        title={title}
        aria-label={placeholder}
        className="input"
      />
    );
    const lastField = fields[fields.length - 1];
    return (
      <div className={`updater-card ${opReason ? "op-unavailable" : ""}`} key={opKey}>
        <div className="updater-card-header">
          ehr.api.{opKey}
          <DeprecatedTag note={noteOf(op.deprecationStatus)} />
          <span className="verb-badge verb-get">{op.operationType === "search" ? "search" : "get"}</span>
          {apiOpLabel(op) && (
            <span className="op-status" title={opReason ?? undefined}>
              {apiOpLabel(op)}
            </span>
          )}
        </div>
        <div className="op-signature">{op.sdkSignature ?? `Catalog entry: ${op.catalogEntryId}`}</div>
        {fields.slice(0, -1).map((field) => (
          <div className="op-input-row" key={field.key}>
            {input(field)}
          </div>
        ))}
        <div className="op-input-row">
          {lastField && input(lastField)}
          <Hint text={runBlocked} block={!lastField}>
            <button
              onClick={() => executeReadOperation(op)}
              className={`btn btn-primary ${lastField ? "op-run-btn" : "op-run-btn-full"}`}
              disabled={readOpRunning[opKey] || runBlocked !== null}
            >
              {readOpRunning[opKey] ? "Running…" : "Run"}
            </button>
          </Hint>
        </div>
        {!opReason && runBlocked && <div className="op-reason">{runBlocked}</div>}
        {readOpRanAt[opKey] && <div className="op-last-run">Last run: {readOpRanAt[opKey]}</div>}
        {result != null && (
          <CodeBlock
            code={result}
            lines={
              readOpValues[opKey] === undefined
                ? undefined
                : annotatedLines(readOpValues[opKey], apiResultAnnotator(manifest, op.entityTypeId))
            }
            className="op-result"
          />
        )}
      </div>
    );
  };

  const subscriptionRow = (
    key: string,
    label: string,
    tooltip: string,
    on: boolean,
    onToggle: () => void,
    deprecation: string | null = null,
  ) => (
    <div key={key} className={`event-item ${subscriptionRefusals.has(key) ? "updater-unavailable" : ""}`}>
      <div className="event-item-text">
        <div className="event-name" title={tooltip}>
          {label}
          <DeprecatedTag note={deprecation} />
        </div>
        {subscriptionRefusals.has(key) && <div className="updater-meta">{subscriptionRefusals.get(key)}</div>}
      </div>
      <div className="toggle-switch" onClick={onToggle}>
        <div className={`toggle-track ${on ? "active" : ""}`}>
          <div className="toggle-thumb" />
        </div>
        <span className="toggle-label">{on ? "ON" : "OFF"}</span>
      </div>
    </div>
  );

  const sectionHeader = (title: string, collapsed: boolean, onToggle: () => void, info?: React.ReactNode) => (
    <div className="section-header" onClick={onToggle}>
      <div className="section-chevron" style={{ transform: collapsed ? "rotate(0deg)" : "rotate(90deg)" }}>
        ▶
      </div>
      <h2 className="section-title">{title}</h2>
      {info && <InfoTip label={`About ${title}`}>{info}</InfoTip>}
    </div>
  );

  const subPageTitle: Record<Exclude<DemoView, "main">, string> = {
    explorer: "Auto runner",
    docs: "Docs",
    manifest: "Manifest",
  };

  const apiWritesEntity = procedureCodesOp?.entityTypeId ?? "encounter";
  const entityWriteOps = writeOps.filter((op: any) => op.entityTypeId === apiWritesEntity);
  const availableEntityWriteOps = entityWriteOps.filter((op: any) => apiOpReason(op) === null);
  const apiWritesCard = (
    <div className={`updater-card ${procedureCodesReason ? "op-unavailable" : ""}`}>
      <div className="updater-card-header">
        encounter.updateProcedureCodes (CPT)
        <DeprecatedTag note={noteOf(procedureCodesOp?.deprecationStatus)} />
        <span className="verb-badge verb-update">update</span>
        {apiOpLabel(procedureCodesOp) && (
          <span className="op-status">{apiOpLabel(procedureCodesOp)}</span>
        )}
      </div>
      <div className="op-signature">
        Calls vimSDK.ehr.api.encounter.updateProcedureCodes — the
        active EHR&apos;s apiAutomation handles the call. Independent of
        the user&apos;s current view.
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
      {!procedureCodesReason && !cptEncounterId.trim() && (
        <div className="op-reason">Enter the encounter ID to write to</div>
      )}
      <Hint block text={procedureCodesReason ??
          (!cptEncounterId.trim()
            ? "Enter the encounter ID to write to"
            : !cptCode.trim()
              ? "Enter a CPT code"
              : undefined)}>
        <button
          onClick={executeUpdateProcedureCodes}
          className="btn btn-primary"
          style={{ width: "100%" }}
          disabled={procedureCodesReason !== null || !cptEncounterId.trim() || !cptCode.trim()}
        >
          Update Procedure Codes
        </button>
      </Hint>
    </div>
  );

  const statusLine = `Connected via OAuth · SDK ${manifest?.version || "unknown"} · Manifest ${formatManifestVersion(vimSDK?.manifestVersion ?? null)}`;

  return (
    <>
      {vimSDK && manifest && (
        <>
          <div className="app-topbar">
            <NavTabs view={view} onGetCode={() => setRedirectUrl(DEMO_APP_REPO_URL)} onNavigate={setView} />
            <InPageSearch rootSelector="#demo-search-root" open={searchOpen} onOpenChange={setSearchOpen} />
          </div>
          <p className="status-banner" title={statusLine}>
            <span className="status-dot" aria-hidden="true" />
            <span className="status-banner-text">{statusLine}</span>
          </p>
        </>
      )}
      {view !== "main" && vimSDK && manifest ? (
        <div id="demo-search-root" className={`subpage subpage-${view}`}>
          <Breadcrumb
            title={subPageTitle[view]}
            onBack={() => setView("main")}
            actions={
              view === "manifest" ? (
                <CopyButton text={JSON.stringify(manifest, null, 2)} label="Copy manifest" />
              ) : view === "docs" ? (
                <CopyButton text={getDeveloperDocsUrl()} label="Copy link" />
              ) : undefined
            }
          />
          {view === "explorer" && <CapabilityAutoRunner sdk={vimSDK} manifest={manifest} />}
          {view === "docs" && <DocsView />}
          {view === "manifest" && <ManifestView manifest={manifest} />}
        </div>
      ) : (
    <div id="demo-search-root" className="demo-container">

      <div className="demo-content">
        {/* Read from EHR: subscriptions, what they delivered, and on-demand API reads */}
        <div className="section-collapsible">
          {sectionHeader(
            `Read from EHR (${readAvailable}/${readTotal})`,
            readCollapsed,
            () => setReadCollapsed(!readCollapsed),
            <><code>sdk.ehr.workflow.on()</code> and <code>sdk.ehr.context.onChange()</code> push what the provider does; <code>sdk.ehr.api.&lt;entity&gt;.&lt;method&gt;()</code> reads on demand.</>,
          )}
          <div className={`section-content ${readCollapsed ? "collapsed" : ""}`}>
            <div className="section-inner">
              <CollapsibleCard
                title={`Subscriptions (${subscriptionAvailable}/${subscriptionTotal})`}
                expanded={expandedCards.has("__subscriptions")}
                onToggle={() => toggleCard("__subscriptions")}
                actions={
                  subscriptionTotal > 0 &&
                  turnAllToggle(
                    allWorkflowOn && allContextsOn,
                    (on) => {
                      setAllWorkflowEvents(on);
                      setAllContextEvents(on);
                    },
                    "subscriptions",
                  )
                }
              >
                <div className="nested-card nested-card-stack">
                  <CollapsibleCard
                    title={`Workflow events (${availableEvents.length}/${supportedEvents.length})`}
                    expanded={expandedCards.has("__workflow")}
                    onToggle={() => toggleCard("__workflow")}
                    actions={supportedEvents.length > 0 && turnAllToggle(allWorkflowOn, setAllWorkflowEvents, "workflow events")}
                  >
                    <div className="event-list">
                      {supportedEvents.length === 0 ? (
                        <div className="empty-state">No workflow events available</div>
                      ) : (
                        supportedEvents.map((evt) =>
                          subscriptionRow(
                            evt.id,
                            evt.name || evt.id,
                            evt.name || evt.id,
                            subscribedWorkflowEvents.has(evt.id),
                            () => toggleWorkflowEvent(evt.id),
                            noteOf(evt.deprecationStatus),
                          ),
                        )
                      )}
                    </div>
                  </CollapsibleCard>

                  <CollapsibleCard
                    title={`Context events (${availableContexts.length}/${supportedContexts.length})`}
                    expanded={expandedCards.has("__context")}
                    onToggle={() => toggleCard("__context")}
                    actions={supportedContexts.length > 0 && turnAllToggle(allContextsOn, setAllContextEvents, "context events")}
                  >
                    <div className="event-list">
                      {supportedContexts.length === 0 ? (
                        <div className="empty-state">No context events available</div>
                      ) : (
                        supportedContexts.map((ctx) =>
                          subscriptionRow(
                            ctx.contextKey,
                            ctx.contextKey,
                            ctx.description ?? ctx.contextKey,
                            subscribedContexts.has(ctx.contextKey),
                            () => toggleContextEvent(ctx.contextKey),
                            noteOf(supportedEvents.find((e) => e.id === ctx.eventType)?.deprecationStatus) ??
                              noteOf(manifest?.supportedEntities.find((e) => e.type === ctx.entityType)?.deprecationStatus),
                          ),
                        )
                      )}
                    </div>
                  </CollapsibleCard>
                </div>
              </CollapsibleCard>

              <hr className="section-divider" />

              <div className="subsection">
                <button
                  type="button"
                  className="subsection-header"
                  aria-expanded={!eventPreviewCollapsed}
                  onClick={() => setEventPreviewCollapsed(!eventPreviewCollapsed)}
                >
                  <span className="entity-card-chevron" style={{ transform: eventPreviewCollapsed ? "none" : "rotate(90deg)" }}>
                    ▶
                  </span>
                  Event preview ({eventPreviews.length + contextChanges.length})
                </button>
                {!eventPreviewCollapsed && (
                  <div className="subsection-body">
                    <div className="subsection-row">
                      <div className="demo-card-label">Workflow events ({eventPreviews.length})</div>
                      {eventPreviews.length > 0 && (
                        <button onClick={() => setEventPreviews([])} className="btn btn-sm">
                          Clear
                        </button>
                      )}
                    </div>
                    {eventPreviews.length === 0 ? (
                      <p className="empty-state">
                        No events yet. Open a patient, encounter, order or referral in the EHR to see them here.
                      </p>
                    ) : (
                      eventPreviews.map((event, index) => (
                        <details key={event.key} className="event-preview-card" open={index === 0}>
                          <summary className="event-preview-header">
                            <span className="event-preview-title">{event.type}</span>
                            <span className="event-preview-time">
                              {new Date(event.timestamp).toLocaleTimeString()} • {event.streamType}
                            </span>
                          </summary>
                          <CodeBlock
                            code={JSON.stringify(event.data, null, 2)}
                            lines={annotatedLines(event.data, workflowEventAnnotator(manifest, event.id))}
                            className="event-preview-body"
                          />
                        </details>
                      ))
                    )}

                    <div className="subsection-row" style={{ marginTop: "var(--space-lg)" }}>
                      <div className="demo-card-label">Context changes ({contextChanges.length})</div>
                      {contextChanges.length > 0 && (
                        <button onClick={() => setContextChanges([])} className="btn btn-sm">
                          Clear
                        </button>
                      )}
                    </div>
                    {contextChanges.length === 0 ? (
                      <p className="empty-state">No context changes yet.</p>
                    ) : (
                      contextChanges.map((change, index) => (
                        <details key={change.key} className="event-preview-card" open={index === 0}>
                          <summary className="event-preview-header">
                            <span className="event-preview-title">
                              {change.contextKey}{" "}
                              <span className="event-preview-change">({change.changeType})</span>
                            </span>
                            <span className="event-preview-time">
                              {new Date(change.timestamp).toLocaleTimeString()}
                            </span>
                          </summary>
                          {change.changeType !== "closed" && (
                            <CodeBlock
                              code={JSON.stringify(change.currentData, null, 2)}
                              lines={annotatedLines(
                                change.currentData,
                                contextAnnotator(manifest, change.contextKey.split(":").pop() ?? ""),
                              )}
                              className="event-preview-body"
                            />
                          )}
                        </details>
                      ))
                    )}
                  </div>
                )}
              </div>

              <hr className="section-divider" />

              <div className="demo-card-label">
                API reads ({availableReadOps.length}/{readOps.length})
              </div>
              {readOps.length === 0 ? (
                <div className="empty-state">
                  No read operations (getById / search) are available in this EHR&apos;s collection.
                </div>
              ) : (
                orderedReadGroups.map(([entityType, ops]) => {
                  const available = ops.filter((op) => apiOpReason(op) === null);
                  return (
                    <CollapsibleCard
                      key={entityType}
                      title={`${entityLabel(manifest, entityType)} (${available.length}/${ops.length})`}
                      badge={openEntityTypes.has(entityType) && <span className="entity-open-pill">Open in EHR</span>}
                      expanded={expandedCards.has(`__read:${entityType}`)}
                      onToggle={() => toggleCard(`__read:${entityType}`)}
                    >
                      <div className="entity-card-ops">{ops.map(renderReadOp)}</div>
                    </CollapsibleCard>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Write to EHR */}
        <div className="section-collapsible">
          {sectionHeader(
            `Write to EHR (${availableWritebackEntries.length}/${writebackEntries.length})`,
            activeUpdatersCollapsed,
            () => setActiveUpdatersCollapsed(!activeUpdatersCollapsed),
            <><code>sdk.ehr.context.&lt;entity&gt;.update()</code> writes into the open record.</>,
          )}
          <div className={`section-content ${activeUpdatersCollapsed ? "collapsed" : ""}`}>
            <div className="section-inner">
              <div className="updater-summary-card">
                <ToggleAllLabel
                  label={`Available updaters (${availableWritebackEntries.length}/${writebackEntries.length})`}
                  count={availableWritebackEntries.length + activeUpdaters.size}
                  allOn={allUpdatersOn || (availableWritebackEntries.length === 0 && activeUpdaters.size > 0)}
                  onToggle={(on) => setAllUpdaters(on && availableWritebackEntries.length > 0)}
                />
                <div className="section-actions">
                  <Hint text={writableUpdaters.length === 0
                        ? "No updater is writable in the current context"
                        : `Samples the ${writableUpdaters.length} field(s) writable in the current context`}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => sampleAllUpdaters()}
                      disabled={writableUpdaters.length === 0}
                    >
                      Sample all ({writableUpdaters.length})
                    </button>
                  </Hint>
                  <Hint text={writableWithValue.length === 0
                        ? "No updater writable in the current context has a value"
                        : `Writes the ${writableWithValue.length} field(s) writable in the current context`}>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => void updateAllUpdaters()}
                      disabled={updatingAll || writableWithValue.length === 0}
                    >
                      {updatingAll ? "Updating…" : `Update all (${writableWithValue.length})`}
                    </button>
                  </Hint>
                </div>
              </div>

              {writebackEntries.length === 0 ? (
                <div className="empty-state">No updaters available</div>
              ) : (
                orderedEntityGroups.map(([entityType, entries]) => {
                  const available = entries.filter(
                    (e) => unavailableReasons.get(`${e.entityType}:${e.fieldPath}`) === null,
                  );
                  const entityWritable = writableUpdaters.filter((u) => u.entityType === entityType);
                  const entityWithValue = writableWithValue.filter((u) => u.entityType === entityType);
                  const entityUpdaters = entries
                    .map((e) => activeUpdaters.get(entityType)?.get(`${e.entityType}:${e.fieldPath}`))
                    .filter((u): u is UpdaterInfo => u !== undefined);
                  return (
                    <CollapsibleCard
                      key={entityType}
                      title={`${entityLabel(manifest, entityType)} (${available.length}/${entries.length})`}
                      badge={isEntityOpen(entityType) && <span className="entity-open-pill">Open in EHR</span>}
                      expanded={expandedCards.has(entityType)}
                      onToggle={() => toggleCard(entityType)}
                      actions={
                        <>
                          <Hint text={entityWritable.length === 0
                                ? groupReason(entries, "sample")
                                : `Fill the ${entityWritable.length} writable ${entityType} field(s) with sample values`}>
                            <button
                              type="button"
                              className="btn btn-sm"
                              onClick={() => sampleAllUpdaters(entityType)}
                              disabled={entityWritable.length === 0}
                            >
                              Sample ({entityWritable.length})
                            </button>
                          </Hint>
                          <Hint text={entityWritable.length === 0
                                ? groupReason(entries, "update")
                                : entityWithValue.length === 0
                                  ? "Sample or type a value first"
                                  : `Write the ${entityWithValue.length} ${entityType} field(s) that have a value`}>
                            <button
                              type="button"
                              className="btn btn-primary btn-sm"
                              onClick={() => void updateAllUpdaters(entityType)}
                              disabled={updatingAll || entityWithValue.length === 0}
                            >
                              Update ({entityWithValue.length})
                            </button>
                          </Hint>
                          {(available.length > 0 || entries.some(isUpdaterOn)) &&
                            turnAllToggle(
                              available.length > 0 && available.every(isUpdaterOn),
                              (on) => setAllUpdaters(on && available.length > 0, entityType),
                              entityType,
                            )}
                        </>
                      }
                    >
                      <div className="nested-card nested-card-top">
                        <CollapsibleCard
                          title={`Fields (${available.length}/${entries.length})`}
                          expanded={expandedCards.has(`__fields:${entityType}`)}
                          onToggle={() => toggleCard(`__fields:${entityType}`)}
                        >
                          <div className="event-list">
                            {entries.map((upd) => {
                              const reason = unavailableReasons.get(`${upd.entityType}:${upd.fieldPath}`) ?? null;
                              const isActive = isUpdaterOn(upd);
                              return (
                                <div
                                  key={`${upd.entityType}-${upd.fieldPath}`}
                                  className={`event-item ${reason ? "updater-unavailable" : ""}`}
                                >
                                  <div className="event-item-text">
                                    <div className="event-name" title={upd.fieldPath}>
                                      {upd.fieldPath}
                                      <DeprecatedTag note={fieldDeprecation(manifest, upd.entityType, upd.fieldPath)} />
                                    </div>
                                    <div className="updater-meta">
                                      {reason
                                        ? unavailableReasonText(reason, upd.entityType, "write")
                                        : upd.disruptive
                                          ? "Requires permission"
                                          : "Writable now"}
                                    </div>
                                  </div>
                                  <div
                                    className={`toggle-switch ${reason && !isActive ? "toggle-blocked" : ""}`}
                                    aria-disabled={reason !== null && !isActive}
                                    onClick={() => {
                                      if (reason === null || isActive) {
                                        toggleUpdater(upd.entityType, upd.fieldPath, "");
                                      }
                                    }}
                                  >
                                    <div className={`toggle-track ${isActive ? "active" : ""}`}>
                                      <div className="toggle-thumb" />
                                    </div>
                                    <span className="toggle-label">
                                      {isActive ? "ON" : reason ? "N/A" : "OFF"}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </CollapsibleCard>
                      </div>
                      {entityUpdaters.length === 0 && (
                        <p className="empty-state">No field is turned on. Open Fields above to turn some on.</p>
                      )}
                      {entityUpdaters.map((updater) => {
                        const key = `${updater.entityType}:${updater.fieldPath}`;
                        const cap = updaterCapability(updater);
                        const detected = cap?.available ?? false;
                        const { modes } = writeModesFor(manifest, updater.entityType, updater.fieldPath);
                        const selectedMode = modeFor(updater);
                        return (
                          <div key={key} className={`updater-card ${!detected ? "disabled" : ""}`}>
                            <div className="updater-card-header">
                              {updater.fieldPath}
                              <DeprecatedTag note={fieldDeprecation(manifest, updater.entityType, updater.fieldPath)} />
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
                            <input
                              type="text"
                              value={updater.value}
                              onChange={(e) => updateUpdaterValue(entityType, key, e.target.value)}
                              placeholder="Enter value..."
                              disabled={!detected}
                              className="input"
                            />
                            <div className="update-row">
                              <button
                                type="button"
                                onClick={() =>
                                  updateUpdaterValue(
                                    entityType,
                                    key,
                                    sampleValueFor(manifest, updater.entityType, updater.fieldPath),
                                  )
                                }
                                disabled={!detected}
                                className="btn btn-sm"
                                title="Fill a sample value in the format this field expects"
                              >
                                Sample
                              </button>
                              <div className="mode-toggle" role="group" aria-label="Write mode">
                                {(["override", "append"] as const).map((mode) => {
                                  const offered = modes.includes(mode);
                                  return (
                                    <Hint
                                      key={mode}
                                      text={
                                        !offered
                                          ? mode === "override"
                                            ? "Writes to this list add items; it has no replace mode"
                                            : "This field takes a single value, so every write replaces it"
                                          : mode === "append"
                                            ? "Sends mode: 'append'. The runtime doesn't apply it yet, so the write still replaces the field"
                                            : null
                                      }
                                    >
                                      <button
                                        type="button"
                                        className={`mode-option ${mode === selectedMode ? "active" : ""}`}
                                        aria-pressed={mode === selectedMode}
                                        disabled={!offered || !detected}
                                        onClick={() => setWriteModeChoice((prev) => ({ ...prev, [key]: mode }))}
                                      >
                                        {mode === "override" ? "Override" : "Append"}
                                      </button>
                                    </Hint>
                                  );
                                })}
                              </div>
                              <button
                                onClick={() => executeUpdate(updater)}
                                disabled={!detected}
                                className="btn btn-primary btn-sm update-row-submit"
                              >
                                Update
                              </button>
                            </div>
                          </div>
                        );
                      })}
                      {entityType === apiWritesEntity && (
                        <>
                          <div className="demo-card-label api-writes-label">
                            API writes ({availableEntityWriteOps.length}/{entityWriteOps.length})
                            <InfoTip label="About API writes">
                              <code>sdk.ehr.api.&lt;entity&gt;.&lt;method&gt;()</code> writes by record ID, on EHRs that implement it.
                            </InfoTip>
                          </div>
                          {apiWritesCard}
                        </>
                      )}
                    </CollapsibleCard>
                  );
                })
              )}

              {!orderedEntityGroups.some(([entityType]) => entityType === apiWritesEntity) && (
                <CollapsibleCard
                  title={`API writes (${availableEntityWriteOps.length}/${entityWriteOps.length})`}
                  info={<><code>sdk.ehr.api.&lt;entity&gt;.&lt;method&gt;()</code> writes by record ID, on EHRs that implement it.</>}
                  expanded={expandedCards.has("__api_writes")}
                  onToggle={() => toggleCard("__api_writes")}
                >
                  {apiWritesCard}
                </CollapsibleCard>
              )}
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
                <div className="activation-group" role="group" aria-label="Activation status">
                  {([
                    ["ENABLED", "●", "Enabled"],
                    ["LOADING", "◐", "Loading"],
                    ["DISABLED", "✕", "Disabled"],
                  ] as const).map(([status, icon, label]) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => hubSetActivationStatus(status)}
                      aria-pressed={hubActivationStatus === status}
                      className={`btn-activation ${hubActivationStatus === status ? status.toLowerCase() : ""}`}
                    >
                      <span aria-hidden="true">{icon}</span>
                      {label}
                    </button>
                  ))}
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
                <div className="demo-card-label">
                  Microphone &amp; video
                  <InfoTip label="About microphone and video">
                    Calls <code>navigator.mediaDevices.getUserMedia()</code>. The hub delegates the device only when the
                    manifest turns on Allow Microphone / Allow Video Capture; Chrome then asks the provider the first time.
                  </InfoTip>
                </div>
                <DeviceAccessControls addLog={addLog} />
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

        <SessionContextPanel
          sessionContext={vimSDK?.sessionContext ?? null}
          addLog={addLog}
        />

        <div className="section-collapsible">
          <div className="section-header" onClick={() => setWorkerCollapsed(!workerCollapsed)}>
            <div
              className="section-chevron"
              style={{ transform: workerCollapsed ? "rotate(0deg)" : "rotate(90deg)" }}
            >
              ▶
            </div>
            <h2 className="section-title">Worker App</h2>
            <InfoTip label="About the Worker App">A Vim app can run a headless Worker in the background alongside this UI. The Worker publishes state with <code>workerState</code>; the UI subscribes to it and sends the Worker messages with <code>appEvents</code>. Refresh asks the Worker to regenerate its data.</InfoTip>
          </div>
          <div className={`section-content ${workerCollapsed ? "collapsed" : ""}`}>
            <div className="section-inner">
              <div className="worker-strip-main">
                <span className={`pill ${appEventsSupported ? "pill-ok" : "pill-muted"}`}>
                  appEvents {appEventsSupported ? "supported" : "not supported"}
                </span>
                {workerData ? (
                  <dl className="worker-fields">
                    <dt>Refresh #</dt>
                    <dd>{workerData.refreshCount}</dd>
                    <dt>Generated</dt>
                    <dd>{new Date(workerData.generatedAt).toLocaleTimeString()}</dd>
                    <dt>Token</dt>
                    <dd>{workerData.token}</dd>
                  </dl>
                ) : (
                  <span className="worker-strip-summary">Waiting for the Worker…</span>
                )}
                <button
                  onClick={refreshWorkerData}
                  disabled={!appEventsSupported}
                  className="btn btn-secondary btn-sm"
                >
                  Refresh
                </button>
              </div>
            </div>
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
            <h2 className="section-title">Activity Log ({logEntries.length})</h2>
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

    </div>
      )}

      {redirectUrl && (
        <div className="modal-overlay" onClick={() => setRedirectUrl(null)}>
          <div
            className="modal-content redirect-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close redirect-close"
              aria-label="Close"
              onClick={() => setRedirectUrl(null)}
            >
              ✕
            </button>
            <div className="redirect-hero">
              <GithubIcon className="redirect-github" />
              <div>
                <h2 className="modal-title">Fork this app</h2>
                <p className="redirect-tagline">
                  A working Vim app you can build on today.
                </p>
              </div>
            </div>
            <ul className="redirect-points">
              <li>OAuth launch and token exchange, end to end</li>
              <li>Live EHR context, reads and writes for your manifest</li>
              <li>A Worker App that sends pushes like the one you clicked</li>
            </ul>
            <code className="redirect-url">
              {DEMO_APP_FORK_COMMAND.split(" ").map((token, i) => (
                <Fragment key={i}>
                  {i > 0 ? " " : ""}
                  <span className="redirect-token">{token}</span>
                </Fragment>
              ))}
            </code>
            <div className="redirect-actions">
              <button
                type="button"
                className="btn btn-gradient btn-sm"
                onClick={() => copyRedirect("command", DEMO_APP_FORK_COMMAND)}
              >
                {redirectCopy?.target === "command" && redirectCopy.ok
                  ? "Copied ✓"
                  : "Copy command"}
              </button>
              <button
                type="button"
                className="btn btn-gradient-outline btn-sm"
                onClick={() => copyRedirect("link", redirectUrl)}
              >
                {redirectCopy?.target === "link" && redirectCopy.ok
                  ? "Copied ✓"
                  : "Copy link"}
              </button>
            </div>
            {redirectCopy && !redirectCopy.ok && (
              <p className="redirect-hint">
                Copy failed. Select it manually:{" "}
                <code className="redirect-url">
                  {redirectCopy.target === "link"
                    ? redirectUrl
                    : DEMO_APP_FORK_COMMAND}
                </code>
              </p>
            )}
          </div>
        </div>
      )}

    </>
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
