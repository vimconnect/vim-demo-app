export interface Rect {
  top: number;
  bottom: number;
  left: number;
  right: number;
  width: number;
}

export interface HintPosition {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
  maxWidth: number;
}

const GAP = 6;
const EDGE = 8;
const MAX_WIDTH = 240;
const EST_HEIGHT = 56;

/**
 * Where a fixed-position hint goes for a trigger at `rect` in a viewport of `vw` × `vh`: below it
 * unless that would leave the viewport, and anchored to whichever trigger edge keeps it on screen.
 */
export function hintPosition(rect: Rect, vw: number, vh: number, block: boolean): HintPosition {
  const fitsBelow = rect.bottom + GAP + EST_HEIGHT <= vh;
  const vertical = fitsBelow ? { top: rect.bottom + GAP } : { bottom: vh - rect.top + GAP };
  if (block) {
    return {
      ...vertical,
      left: Math.max(EDGE, rect.left),
      maxWidth: Math.max(0, Math.min(rect.width, vw - 2 * EDGE)),
    };
  }
  const left = Math.max(EDGE, rect.left);
  const right = Math.max(EDGE, vw - rect.right);
  const roomFromLeft = vw - EDGE - left;
  const roomFromRight = vw - EDGE - right;
  return roomFromRight > roomFromLeft
    ? { ...vertical, right, maxWidth: Math.max(0, Math.min(MAX_WIDTH, roomFromRight)) }
    : { ...vertical, left, maxWidth: Math.max(0, Math.min(MAX_WIDTH, roomFromLeft)) };
}

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
