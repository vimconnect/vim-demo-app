export interface BatchableUpdater {
  entityType: string;
  fieldPath: string;
  value: string;
  mode: 'override' | 'append';
}

export interface EntityBatch {
  entityType: string;
  /** Every field path in the batch, for one permission request covering all of them. */
  fields: string[];
  /** One update() per mode — the fallback where the extension cannot take a per-field map. */
  writes: { mode: 'override' | 'append'; fields: string[]; data: Record<string, unknown> }[];
  /**
   * The same fields as one call, each named in the list for its mode. Only set where
   * the batch actually mixes modes; one mode needs no requirements to say so.
   */
  mixed?: {
    data: Record<string, unknown>;
    updateRequirements: { fieldsToOverride: string[]; fieldsToAppend: string[] };
  };
}

/** Box text to a value: JSON when it parses, the raw string otherwise. */
export function parseUpdaterValue(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export function setPath(target: Record<string, unknown>, path: string, value: unknown): void {
  const keys = path.split('.');
  let node = target;
  for (const key of keys.slice(0, -1)) {
    const next = node[key];
    if (next === null || typeof next !== 'object' || Array.isArray(next)) node[key] = {};
    node = node[key] as Record<string, unknown>;
  }
  node[keys[keys.length - 1]] = value;
}

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  v !== null && typeof v === 'object' && !Array.isArray(v);

/**
 * Deep-merges one per-mode payload into the shared one, so `plan.a` and `plan.b`
 * survive together. Never aliases `value`'s nested objects into `target`: the
 * per-mode writes still hold them.
 */
function mergeInto(target: Record<string, unknown>, key: string, value: unknown): void {
  const existing = target[key];
  if (!isPlainObject(existing) || !isPlainObject(value)) {
    target[key] = isPlainObject(value) ? structuredClone(value) : value;
    return;
  }
  for (const [k, v] of Object.entries(value)) {
    mergeInto(existing, k, v);
  }
}

/** Updaters with a value, grouped into one permission request per entity, in first-seen entity order. */
export function groupUpdatesByEntity(updaters: BatchableUpdater[]): EntityBatch[] {
  const batches = new Map<string, EntityBatch>();
  for (const u of updaters) {
    if (u.value.trim() === '') continue;
    let batch = batches.get(u.entityType);
    if (!batch) {
      batch = { entityType: u.entityType, fields: [], writes: [] };
      batches.set(u.entityType, batch);
    }
    batch.fields.push(u.fieldPath);
    let write = batch.writes.find((w) => w.mode === u.mode);
    if (!write) {
      write = { mode: u.mode, fields: [], data: {} };
      batch.writes.push(write);
    }
    write.fields.push(u.fieldPath);
    setPath(write.data, u.fieldPath, parseUpdaterValue(u.value));
  }
  for (const batch of batches.values()) {
    if (batch.writes.length < 2) continue;
    const data: Record<string, unknown> = {};
    const requirements = { fieldsToOverride: [] as string[], fieldsToAppend: [] as string[] };
    for (const write of batch.writes) {
      for (const field of write.fields) requirements[write.mode === 'append' ? 'fieldsToAppend' : 'fieldsToOverride'].push(field);
      for (const [key, value] of Object.entries(write.data)) mergeInto(data, key, value);
    }
    batch.mixed = { data, updateRequirements: requirements };
  }
  return [...batches.values()];
}
