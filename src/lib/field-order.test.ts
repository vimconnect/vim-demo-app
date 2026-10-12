import { describe, expect, it } from 'vitest';
import type { AppManifest } from '@vimconnect/app-sdk';
import { sortByFieldOrder } from './field-order';

const entries = (paths: string[]) => paths.map((fieldPath) => ({ entityType: 'encounter', fieldPath }));

const manifest = {
  supportedEntities: [
    {
      type: 'encounter',
      schema: {
        properties: {
          assessment: { displayOrder: 50, properties: { generalNotes: { displayOrder: 20 }, diagnoses: { displayOrder: 10 } } },
          plan: { displayOrder: 60, properties: { generalNotes: { displayOrder: 10 } } },
          subjective: {
            displayOrder: 30,
            properties: { generalNotes: { displayOrder: 40 }, chiefComplaintNotes: { displayOrder: 10 } },
          },
          extra: { properties: { note: {} } },
        },
      },
    },
  ],
} as unknown as AppManifest;

describe('sortByFieldOrder', () => {
  it('follows displayOrder at every level, not the key order', () => {
    const sorted = sortByFieldOrder(
      manifest,
      entries([
        'assessment.generalNotes',
        'assessment.diagnoses',
        'plan.generalNotes',
        'subjective.generalNotes',
        'subjective.chiefComplaintNotes',
      ]),
    );
    expect(sorted.map((e) => e.fieldPath)).toEqual([
      'subjective.chiefComplaintNotes',
      'subjective.generalNotes',
      'assessment.diagnoses',
      'assessment.generalNotes',
      'plan.generalNotes',
    ]);
  });

  it('puts fields without a displayOrder last, in their incoming order', () => {
    const sorted = sortByFieldOrder(manifest, entries(['extra.note', 'unknown', 'plan.generalNotes']));
    expect(sorted.map((e) => e.fieldPath)).toEqual(['plan.generalNotes', 'extra.note', 'unknown']);
  });

  it('keeps the incoming order with no manifest', () => {
    expect(sortByFieldOrder(null, entries(['b', 'a'])).map((e) => e.fieldPath)).toEqual(['b', 'a']);
  });
});
