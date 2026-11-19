/** Entities open in the EHR first, then by how many fields are available; ties keep their order. */
export function orderEntityGroups<T>(
  groups: [string, T][],
  isOpen: (entityType: string) => boolean,
  availableCount: (entityType: string) => number,
): [string, T][] {
  return groups
    .map((group, index) => ({ group, index }))
    .sort(
      (a, b) =>
        Number(isOpen(b.group[0])) - Number(isOpen(a.group[0])) ||
        availableCount(b.group[0]) - availableCount(a.group[0]) ||
        a.index - b.index,
    )
    .map(({ group }) => group);
}
