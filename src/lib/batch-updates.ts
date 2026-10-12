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
  /** One update() per mode, so an append field is never overwritten by another field's override. */
  writes: { mode: 'override' | 'append'; fields: string[]; data: Record<string, unknown> }[];
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
  return [...batches.values()];
}
