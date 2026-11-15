export const HIDE_AFTER_PX = 60;
export const SCROLL_STEP_PX = 6;

/** Whether the bar shows after a scroll from `previousY` to `y`; `current` is returned for movement smaller than a step. */
export function nextBarVisibility(previousY: number, y: number, current: boolean): boolean {
  if (y <= SCROLL_STEP_PX) return true;
  const delta = y - previousY;
  if (delta >= SCROLL_STEP_PX && y > HIDE_AFTER_PX) return false;
  if (delta <= -SCROLL_STEP_PX) return true;
  return current;
}

export interface ScrollTracker {
  anchorY: number;
  visible: boolean;
}

/** Moves the anchor only after a step of movement, so a slow scroll accumulates instead of resetting. */
export function advanceScroll({ anchorY, visible }: ScrollTracker, y: number): ScrollTracker {
  if (y > SCROLL_STEP_PX && Math.abs(y - anchorY) < SCROLL_STEP_PX) return { anchorY, visible };
  return { anchorY: y, visible: nextBarVisibility(anchorY, y, visible) };
}
