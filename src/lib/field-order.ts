import type { AppManifest, FieldSchema } from '@vimconnect/app-sdk';

/** Each path segment's `displayOrder`, as set by Studio's "Reorder fields"; unordered segments rank last. */
function rankOf(manifest: AppManifest | null, entityType: string, fieldPath: string): number[] {
  let properties = manifest?.supportedEntities?.find((e) => e.type === entityType)?.schema?.properties;
  return fieldPath.split('.').map((segment) => {
    const node: FieldSchema | undefined = properties?.[segment];
    properties = node?.properties;
    return node?.displayOrder ?? Number.MAX_SAFE_INTEGER;
  });
}

/** `items` in the collection's authored field order; ties keep their incoming order. */
export function sortByFieldOrder<T extends { entityType: string; fieldPath: string }>(
  manifest: AppManifest | null,
  items: T[],
): T[] {
  return items
    .map((item, index) => ({ item, index, rank: rankOf(manifest, item.entityType, item.fieldPath) }))
    .sort((a, b) => {
      for (let i = 0; i < Math.min(a.rank.length, b.rank.length); i++) {
        if (a.rank[i] !== b.rank[i]) return a.rank[i] - b.rank[i];
      }
      return a.index - b.index;
    })
    .map(({ item }) => item);
}
