import { describe, expect, it } from 'vitest';
import { hintPosition, orderEntityGroups } from './panel-layout';

const rect = (left: number, top: number, width: number, height = 30) => ({
  left,
  top,
  width,
  right: left + width,
  bottom: top + height,
});

describe('hintPosition', () => {
  it('anchors a left-side trigger to its left edge, below it', () => {
    expect(hintPosition(rect(20, 100, 80), 400, 800, false)).toEqual({ top: 136, left: 20, maxWidth: 240 });
  });

  it('anchors a right-side trigger to its right edge so the hint stays on screen', () => {
    expect(hintPosition(rect(300, 100, 80), 400, 800, false)).toEqual({ top: 136, right: 20, maxWidth: 240 });
  });

  it('never goes past the viewport edge', () => {
    expect(hintPosition(rect(2, 100, 40), 400, 800, false).left).toBe(8);
    expect(hintPosition(rect(370, 100, 40), 400, 800, false).right).toBe(8);
  });

  it('flips above the trigger near the bottom of the viewport', () => {
    expect(hintPosition(rect(20, 760, 80), 400, 800, false)).toEqual({ bottom: 46, left: 20, maxWidth: 240 });
  });

  it('matches a block trigger width so the hint stays inside its card', () => {
    expect(hintPosition(rect(40, 100, 320), 400, 800, true)).toEqual({ top: 136, left: 40, maxWidth: 320 });
  });

  it('caps the width on a narrow viewport', () => {
    expect(hintPosition(rect(20, 100, 80), 200, 800, false).maxWidth).toBe(172);
  });

  it('keeps a mid-panel hint inside the viewport on both sides', () => {
    // A trigger just right of centre in a 360px panel: anchoring right at full width would cross x=0.
    const pos = hintPosition(rect(135, 100, 90), 360, 800, false);
    const width = pos.maxWidth;
    const leftEdge = pos.left ?? 360 - (pos.right ?? 0) - width;
    expect(leftEdge).toBeGreaterThanOrEqual(8);
    expect(leftEdge + width).toBeLessThanOrEqual(352);
  });
});

describe('orderEntityGroups', () => {
  const groups: [string, number][] = [
    ['encounter', 1],
    ['referral', 2],
    ['order', 3],
  ];

  it('puts entities open in the EHR first', () => {
    const order = orderEntityGroups(groups, (e) => e === 'referral', () => 0).map(([e]) => e);
    expect(order).toEqual(['referral', 'encounter', 'order']);
  });

  it('then sorts by available fields, keeping the original order on ties', () => {
    const available: Record<string, number> = { encounter: 0, referral: 5, order: 0 };
    const order = orderEntityGroups(groups, () => false, (e) => available[e]).map(([e]) => e);
    expect(order).toEqual(['referral', 'encounter', 'order']);
  });
});
