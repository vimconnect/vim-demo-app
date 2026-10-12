import type { AppManifest, DeprecationStatus, FieldSchema } from '@vimconnect/app-sdk';

/** One line of `JSON.stringify(value, null, 2)`, with the note to show beside it. */
export interface JsonLine {
  text: string;
  note: string | null;
}

/** Says what to note on a value, and how to annotate what it contains. */
export interface Annotator {
  note(value: unknown): string | null;
  child(key: string): Annotator;
  item(): Annotator;
}

const NONE: Annotator = { note: () => null, child: () => NONE, item: () => NONE };

/**
 * The lines of `JSON.stringify(value, null, 2)`, each carrying the note `annotator` gives the
 * value that starts on it. Joined with `\n`, the text is exactly what `JSON.stringify` returns.
 */
export function annotatedLines(value: unknown, annotator: Annotator = NONE): JsonLine[] {
  const json = JSON.stringify(value);
  if (json === undefined) return [];
  const out: JsonLine[] = [];
  write(JSON.parse(json), annotator, '', '', '', null, out);
  return out;
}

function write(
  value: unknown,
  annotator: Annotator,
  indent: string,
  prefix: string,
  suffix: string,
  note: string | null,
  out: JsonLine[],
): void {
  const entries: [string, unknown, Annotator, string | null][] = Array.isArray(value)
    ? value.map((item) => {
        const child = annotator.item();
        return ['', item, child, child.note(item)];
      })
    : value !== null && typeof value === 'object'
      ? Object.entries(value).map(([key, item]) => {
          const child = annotator.child(key);
          return [`${JSON.stringify(key)}: `, item, child, child.note(item)];
        })
      : [];
  if (entries.length === 0) {
    const text = Array.isArray(value) ? '[]' : value !== null && typeof value === 'object' ? '{}' : JSON.stringify(value);
    out.push({ text: `${indent}${prefix}${text}${suffix}`, note });
    return;
  }
  const [open, close] = Array.isArray(value) ? ['[', ']'] : ['{', '}'];
  out.push({ text: `${indent}${prefix}${open}`, note });
  entries.forEach(([key, item, child, childNote], i) => {
    write(item, child, `${indent}  `, key, i < entries.length - 1 ? ',' : '', childNote, out);
  });
  out.push({ text: `${indent}${close}${suffix}`, note: null });
}

/** The text to show for a deprecation, or null when `status` is not deprecated. */
export function noteOf(status: DeprecationStatus | undefined): string | null {
  if (status?.deprecated !== true) return null;
  const text = (status.deprecationText ?? '').trim();
  return text === '' ? 'Deprecated' : text;
}

type Node = FieldSchema | undefined;

/** The node an entity's own schema starts at. Its note is the entity's deprecation. */
function entityNode(manifest: AppManifest, entityType: string): Node {
  const entity = manifest.supportedEntities?.find((e) => e.type === entityType);
  if (entity === undefined) return undefined;
  return { type: 'object', properties: entity.schema?.properties, deprecationStatus: entity.deprecationStatus };
}

/** A `type` or `entity` reference followed to the schema it names. */
function resolve(manifest: AppManifest, node: Node): Node {
  if (node?.typeId === undefined) return node;
  if (node.type === 'type') {
    const def = manifest.typeDefinitions?.find((t) => t.id === node.typeId);
    return def && { type: 'object', properties: def.schema.properties, deprecationStatus: def.deprecationStatus };
  }
  if (node.type === 'entity') return entityNode(manifest, node.typeId);
  return node;
}

function nodeNote(manifest: AppManifest, node: Node): string | null {
  if (node === undefined) return null;
  return (
    noteOf(node.deprecationStatus) ??
    noteOf(resolve(manifest, node)?.deprecationStatus) ??
    (node.items ? nodeNote(manifest, node.items) : null)
  );
}

/**
 * Notes every key whose schema node is deprecated: the field itself, the type definition or
 * entity it points at, or the type its array holds. An array item is never noted, so a
 * deprecated list is noted once, on its key.
 */
export function schemaAnnotator(manifest: AppManifest, node: Node, noteSelf = true): Annotator {
  return {
    note: () => (noteSelf ? nodeNote(manifest, node) : null),
    child(key) {
      const resolved = resolve(manifest, node);
      return schemaAnnotator(manifest, resolved?.properties?.[key]);
    },
    item() {
      const resolved = resolve(manifest, node);
      return schemaAnnotator(manifest, resolved?.type === 'array' ? resolved.items : node, false);
    },
  };
}

function objectNode(properties: Record<string, FieldSchema>): FieldSchema {
  return { type: 'object', properties };
}

/** `ContextData` for `entityType`: its `fields` are the entity, noted with the entity's deprecation. */
export function contextAnnotator(manifest: AppManifest | null, entityType: string): Annotator {
  if (manifest === null) return NONE;
  return schemaAnnotator(manifest, objectNode({ fields: { type: 'entity', typeId: entityType } }));
}

/** An `ehr.api` result. `data` is one `entityType`, or a list of them. */
export function apiResultAnnotator(manifest: AppManifest | null, entityType: string): Annotator {
  if (manifest === null) return NONE;
  return schemaAnnotator(manifest, objectNode({ data: { type: 'entity', typeId: entityType } }));
}

/**
 * A `WorkflowEvent`: `type` is noted with the event's deprecation, each of `entities` with its
 * entity type's, and a fanned-out entity's `data` with its fields'.
 */
export function workflowEventAnnotator(manifest: AppManifest | null, eventType: string): Annotator {
  if (manifest === null) return NONE;
  const event = manifest.supportedEvents?.find((e) => e.id === eventType);
  const entities: Record<string, FieldSchema> = {};
  for (const entity of manifest.supportedEntities ?? []) {
    entities[entity.type] = {
      ...objectNode({ data: objectNode(entity.schema?.properties ?? {}) }),
      deprecationStatus: entity.deprecationStatus,
    };
  }
  return schemaAnnotator(
    manifest,
    objectNode({
      type: { type: 'string', deprecationStatus: event?.deprecationStatus },
      entities: objectNode(entities),
    }),
  );
}

/** The manifest itself: any object carrying a deprecated `deprecationStatus` is noted where it starts. */
export const manifestAnnotator: Annotator = {
  note(value) {
    if (value === null || typeof value !== 'object' || Array.isArray(value)) return null;
    return noteOf((value as { deprecationStatus?: DeprecationStatus }).deprecationStatus);
  },
  child: () => manifestAnnotator,
  item: () => manifestAnnotator,
};

/** The deprecation note for a field of `entityType`, or null when nothing on its path is deprecated. */
export function fieldDeprecation(manifest: AppManifest | null, entityType: string, fieldPath: string): string | null {
  if (manifest === null) return null;
  let annotator = schemaAnnotator(manifest, entityNode(manifest, entityType), false);
  for (const segment of fieldPath.split('.')) annotator = annotator.child(segment);
  return annotator.note(undefined);
}
