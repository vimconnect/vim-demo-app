import type { AppManifest, FieldSchema } from '@vimconnect/app-sdk';

export interface WritebackEntry {
  entityType: string;
  fieldPath: string;
  disruptive: boolean;
}

const PRIMITIVE_TYPES = new Set(['string', 'number', 'boolean', 'date']);

/**
 * Must match `getUpdatableFieldPaths` in `@vim-connect/runtime-types`; the demo app ships as a
 * public template and can't depend on that package.
 */
function writablePaths(properties: Record<string, FieldSchema> | undefined, prefix: string): string[] {
  const out: string[] = [];
  for (const [key, field] of Object.entries(properties ?? {})) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (field.type !== undefined && PRIMITIVE_TYPES.has(field.type) && field.supportsUpdates === true) {
      out.push(path);
    }
    if (field.type === 'array' && field.items?.supportsCreate === true) out.push(path);
    if (field.type === 'object' && field.properties !== undefined) {
      out.push(...writablePaths(field.properties, path));
    }
    if ((field.type === 'type' || field.type === 'entity') && field.typeFieldOverrides !== undefined) {
      for (const [nested, override] of Object.entries(field.typeFieldOverrides)) {
        if (override.supportsUpdates === true) out.push(`${path}.${nested}`);
      }
    }
  }
  return out;
}

export interface CollectionWritebackEntry extends WritebackEntry {
  /** False when the collection offers the field but the active EHR can't write it. */
  ehrSupported: boolean;
}

/**
 * Every field the collection lets an app write (`supportsUpdates`, `supportsCreate`
 * arrays, `typeFieldOverrides`), plus any extra the active EHR reports, each marked
 * with whether the active EHR can write it.
 */
export function collectionWritebackEntriesOf(manifest: AppManifest | null): CollectionWritebackEntry[] {
  const ehr = writebackEntriesOf(manifest);
  const ehrByKey = new Map(ehr.map((e) => [`${e.entityType}:${e.fieldPath}`, e]));
  const seen = new Set<string>();
  const out: CollectionWritebackEntry[] = [];
  for (const entity of manifest?.supportedEntities ?? []) {
    for (const fieldPath of writablePaths(entity.schema?.properties, '')) {
      const key = `${entity.type}:${fieldPath}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const onEhr = ehrByKey.get(key);
      out.push({
        entityType: entity.type,
        fieldPath,
        disruptive: onEhr?.disruptive ?? false,
        ehrSupported: onEhr !== undefined,
      });
    }
  }
  for (const e of ehr) {
    const key = `${e.entityType}:${e.fieldPath}`;
    if (!seen.has(key)) out.push({ ...e, ehrSupported: true });
  }
  return out;
}

/** Every writable `${entity}.${field}` the active EHR reports, in manifest order. */
export function writebackEntriesOf(manifest: AppManifest | null): WritebackEntry[] {
  return Object.entries(manifest?.contextWriteback ?? {}).flatMap(([entityType, config]) =>
    (config.update?.updatableFields ?? []).map((fieldPath) => ({
      entityType,
      fieldPath,
      disruptive: config.update?.disruptive ?? false,
    })),
  );
}

/** Coded list items keyed by the type they instantiate; codes must exist in the sandbox EHR's reference lists. */
const CODED_SAMPLES: Record<string, { code: string; description: string }> = {
  diagnosis: { code: 'I10', description: 'Essential (primary) hypertension' },
  procedure: { code: '99213', description: 'Office visit – established, low complexity' },
};

/**
 * Realistic text for string fields, keyed by `entity:path`. Consulted only after the
 * schema says the field is a string, so it never overrides a list, enum, date,
 * number or boolean the manifest declares.
 */
const CLINICAL_TEXT: Record<string, string> = {
  'encounter:subjective.chiefComplaintNotes': 'Headache for 3 days',
  'encounter:subjective.historyOfPresentIllnessNotes': 'Gradual onset, worse in the morning, 6/10, no aura',
  'encounter:subjective.reviewOfSystemsNotes': 'Negative for fever, vision changes, neck stiffness',
  'encounter:subjective.generalNotes': 'Works night shifts, 3 coffees a day',
  'encounter:objective.physicalExamNotes': 'Alert, no focal deficits, neck supple',
  'encounter:objective.generalNotes': 'BP 128/82, HR 74',
  'encounter:assessment.generalNotes': 'Likely tension-type headache',
  'encounter:plan.generalNotes': 'Ibuprofen 400 mg PRN, follow up in 2 weeks',
  'encounter:patientInstructions.generalNotes': 'Hydrate, limit screen time, return if worse',
  'encounter:encounterNotes.generalNotes': 'Discussed sleep hygiene',
  'referral:basicInformation.specialty': 'Cardiology',
  'referral:basicInformation.priority': 'routine',
  'referral:basicInformation.authCode': 'AUTH-12345',
  'referral:basicInformation.reason': 'Evaluate chest pain on exertion',
  'referral:basicInformation.reasons': 'Evaluate chest pain on exertion',
  'referral:basicInformation.facilityName': 'Heart Center West',
  'referral:basicInformation.notes': 'Please see within 2 weeks',
  'referral:targetProvider.firstName': 'Jane',
  'referral:targetProvider.lastName': 'Smith',
  'order:basicInformation.notes': 'Fasting required',
};

function resolveType(node: FieldSchema | undefined, manifest: AppManifest): FieldSchema | undefined {
  if (node?.type !== 'type' || node.typeId === undefined) return node;
  const def = manifest.typeDefinitions?.find((t) => t.id === node.typeId);
  return def && { type: 'object', properties: def.schema.properties };
}

function schemaNodeAt(manifest: AppManifest, entityType: string, fieldPath: string): FieldSchema | undefined {
  const entity = manifest.supportedEntities?.find((e) => e.type === entityType);
  let node: FieldSchema | undefined = entity && { type: 'object', properties: entity.schema?.properties };
  for (const segment of fieldPath.split('.')) {
    node = resolveType(node, manifest)?.properties?.[segment];
    if (node === undefined) return undefined;
  }
  return node;
}

/**
 * The text to put in an updater's value box: valid JSON where the field needs
 * structure or a digit-only string, plain text otherwise (the box falls back to
 * a string when its content doesn't parse).
 */
export function sampleValueFor(manifest: AppManifest | null, entityType: string, fieldPath: string): string {
  const leaf = fieldPath.split('.').pop() ?? fieldPath;
  const node = manifest ? schemaNodeAt(manifest, entityType, fieldPath) : undefined;

  if (node?.type === 'array') {
    const sample = CODED_SAMPLES[node.items?.typeId ?? ''];
    return sample ? JSON.stringify([sample]) : '[]';
  }
  const enumValues = node?.enumValues ?? node?.enum;
  if (enumValues !== undefined && enumValues.length > 0) return enumValues[0];

  switch (node?.type) {
    case 'date':
      return new Date().toISOString().slice(0, 10);
    case 'number':
      return '3';
    case 'boolean':
      return 'true';
  }

  const text = CLINICAL_TEXT[`${entityType}:${fieldPath}`];
  if (text !== undefined) return text;

  // Digit-only strings are quoted so the box doesn't parse them as numbers.
  if (node?.canonicalFormat?.kind === 'phone') return '"5551234567"';
  if (leaf.toLowerCase() === 'npi') return '"1234567893"';
  if (leaf.toLowerCase() === 'email') return 'jane.doe@example.com';
  return `Sample ${leaf}`;
}

export type WriteMode = 'override' | 'append';

export interface WriteModes {
  modes: WriteMode[];
  defaultMode: WriteMode;
}

const FREE_TEXT_LEAF = /(notes?|reasons?|instructions?|complaint|comments?)$/i;

/**
 * The `update()` modes the demo offers per field. The collection declares no modes, so this is
 * the demo's own reading of the schema: a `supportsCreate` array adds items, a free-text string
 * offers both (append by default), and every other field is replaced.
 */
export function writeModesFor(manifest: AppManifest | null, entityType: string, fieldPath: string): WriteModes {
  const node = manifest ? schemaNodeAt(manifest, entityType, fieldPath) : undefined;
  if (node?.type === 'array' && node.items?.supportsCreate === true) {
    return { modes: ['append'], defaultMode: 'append' };
  }
  const leaf = fieldPath.split('.').pop() ?? fieldPath;
  const enumValues = node?.enumValues ?? node?.enum;
  const formatted = node?.canonicalFormat?.kind !== undefined && node.canonicalFormat.kind !== 'string';
  const freeText =
    node?.type === 'string' && !(enumValues && enumValues.length > 0) && !formatted && FREE_TEXT_LEAF.test(leaf);
  return freeText
    ? { modes: ['override', 'append'], defaultMode: 'append' }
    : { modes: ['override'], defaultMode: 'override' };
}
