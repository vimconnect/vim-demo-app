/**
 * Dev-only stand-in for the SDK so the demo app renders without the extension.
 * Open `/app?preview=1` on `next dev` to see every section with a sample manifest.
 * Every call resolves to a no-op; nothing reaches an EHR.
 */
import type { AppManifest, VimSDK } from "@vimconnect/app-sdk";

const str = { type: "string" };

/** An unsigned, JWT-shaped sample so the ID token row has something to decode. */
function previewIdToken(): string {
  const part = (value: object) => btoa(JSON.stringify(value)).replace(/=+$/, "");
  const header = part({ alg: "RS256", typ: "JWT" });
  const payload = part({ sub: "preview-user", aud: "vim_preview_client", scope: "launch openid", exp: 1893456000 });
  return `${header}.${payload}.preview`;
}

const manifest = {
  version: "1.1.3.1",
  apiVersion: "3.0",
  features: [],
  typeDefinitions: [],
  supportedEvents: [
    { id: "chart_open", name: "Chart open", since: "1.0.0", availableEntities: [] },
    { id: "encounter_open", name: "Encounter open", since: "1.0.0", availableEntities: [] },
    { id: "referral_open", name: "Referral open", since: "1.0.0", availableEntities: [] },
    { id: "order_sign", name: "Order sign", since: "1.0.0", availableEntities: [] },
  ],
  supportedContexts: [
    { contextKey: "patient", eventType: "chart_open", entityType: "patient", since: "1.0.0" },
    { contextKey: "encounter", eventType: "encounter_open", entityType: "encounter", since: "1.0.0" },
    { contextKey: "referral", eventType: "referral_open", entityType: "referral", since: "1.0.0" },
  ],
  supportedEntities: [
    {
      type: "patient",
      fields: [],
      since: "1.0.0",
      schema: { type: "object", properties: { demographics: { type: "object", properties: { firstName: str, lastName: str } } } },
    },
    {
      type: "encounter",
      fields: [],
      since: "1.0.0",
      schema: {
        type: "object",
        properties: {
          subjective: { type: "object", properties: { chiefComplaintNotes: str, historyOfPresentIllnessNotes: str } },
          assessment: { type: "object", properties: { generalNotes: str } },
          plan: { type: "object", properties: { generalNotes: str } },
        },
      },
    },
    {
      type: "referral",
      fields: [],
      since: "1.0.0",
      schema: { type: "object", properties: { notes: str, priority: str } },
    },
  ],
  operations: [
    {
      catalogEntryId: "patient.getById",
      operationType: "getById",
      entityTypeId: "patient",
      sdkNamespace: "patient",
      sdkMethod: "getPatientById",
      sdkSignature: "sdk.ehr.api.patient.getPatientById({ patientId })",
      available: true,
      disruptive: false,
      metadata: { type: "getById", targetField: "patientId", idParameterNames: ["patientId"] },
    },
    {
      catalogEntryId: "patient.getProblems",
      operationType: "getById",
      entityTypeId: "patient",
      sdkNamespace: "patient",
      sdkMethod: "getProblems",
      sdkSignature: "vimSDK.ehr.api.patient.getProblems()",
      available: false,
      disruptive: false,
      metadata: { type: "getById", targetField: "patientId", idParameterNames: ["patientId"] },
    },
    {
      catalogEntryId: "patient.getAllergies",
      operationType: "search",
      entityTypeId: "patient",
      sdkNamespace: "patient",
      sdkMethod: "getAllergies",
      sdkSignature: "vimSDK.ehr.api.patient.getAllergies()",
      available: false,
      disruptive: false,
      metadata: { type: "search", supportsQuery: false, filterFields: [], maxResults: 50 },
    },
    {
      catalogEntryId: "patient.getMedications",
      operationType: "getById",
      entityTypeId: "patient",
      sdkNamespace: "patient",
      sdkMethod: "getMedications",
      sdkSignature: "vimSDK.ehr.api.patient.getMedications()",
      available: true,
      disruptive: false,
      metadata: { type: "getById", targetField: "patientId", idParameterNames: ["patientId"] },
    },
    {
      catalogEntryId: "encounter.getById",
      operationType: "getById",
      entityTypeId: "encounter",
      sdkNamespace: "encounter",
      sdkMethod: "getEncounterById",
      sdkSignature: "sdk.ehr.api.encounter.getEncounterById({ encounterId })",
      available: true,
      disruptive: false,
      metadata: { type: "getById", targetField: "encounterId", idParameterNames: ["encounterId"] },
    },
    {
      catalogEntryId: "referral.getById",
      operationType: "getById",
      entityTypeId: "referral",
      sdkNamespace: "referral",
      sdkMethod: "getReferralById",
      sdkSignature: "sdk.ehr.api.referral.getReferralById({ referralId })",
      available: false,
      disruptive: false,
      metadata: { type: "getById", targetField: "referralId", idParameterNames: ["referralId"] },
    },
  ],
  contextWriteback: {
    encounter: {
      update: {
        available: true,
        disruptive: false,
        updatableFields: [
          "subjective.chiefComplaintNotes",
          "subjective.historyOfPresentIllnessNotes",
          "assessment.generalNotes",
          "plan.generalNotes",
        ],
      },
    },
    referral: { update: { available: true, disruptive: false, updatableFields: ["notes", "priority"] } },
  },
} as unknown as AppManifest;

const granted = { available: true, permissionState: "granted" };

/** Any property is another no-op; `then` stays undefined so awaiting it doesn't hang. */
function noop(): unknown {
  return new Proxy(function () {}, {
    get: (_t, key) => (key === "then" || typeof key === "symbol" ? undefined : noop()),
    apply: () => noop(),
  });
}

function overlay(fixed: Record<string, unknown>): Record<string, unknown> {
  return new Proxy(fixed, {
    get: (t, key) => (key in t ? Reflect.get(t, key) : key === "then" || typeof key === "symbol" ? undefined : noop()),
  });
}

const entity = () =>
  overlay({
    getCapability: () => granted,
    getUpdateModes: () => ({}),
    update: async () => ({ success: true }),
    requestPermission: async () => granted,
  });

export function createPreviewSDK(): VimSDK {
  return overlay({
    manifestVersion: { version: 1, status: "in_review" },
    ehr: overlay({
      getManifest: () => manifest,
      // Refuses one manifest event, as a live EHR can, so the refused-row and turn-all paths render.
      workflow: overlay({
        on: (eventId: string) => {
          if (eventId === "order_sign") {
            throw Object.assign(new Error("Not in your app manifest"), { code: "PERMISSION_DENIED" });
          }
          return () => {};
        },
      }),
      context: overlay({
        onChange: () => () => {},
        patient: entity(),
        encounter: entity(),
        referral: entity(),
      }),
      api: overlay({
        patient: overlay({ getCapability: () => granted }),
        encounter: overlay({ getCapability: () => granted }),
        referral: overlay({ getCapability: () => ({ available: false, reason: "not_supported" }) }),
      }),
    }),
    hub: overlay({ consumeGrantedDevices: () => [] }),
    workerState: overlay({ on: () => () => {} }),
    appEvents: overlay({ send: () => {} }),
    sessionContext: {
      sessionId: "preview-session",
      deviceId: "preview-device",
      userId: "preview-user",
      account: { id: "preview-account", name: "Preview Practice" },
      ehrType: "sandbox_ehr_next",
      getIdToken: async () => ({ idToken: previewIdToken() }),
    },
  }) as unknown as VimSDK;
}
