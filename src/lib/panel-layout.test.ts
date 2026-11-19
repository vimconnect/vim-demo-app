import { describe, expect, it } from 'vitest';
import { orderEntityGroups } from './panel-layout';

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
