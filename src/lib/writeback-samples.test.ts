import { describe, expect, it } from 'vitest';
import type { AppManifest } from '@vimconnect/app-sdk';
import {
  collectionWritebackEntriesOf,
  sampleValueFor,
  writebackEntriesOf,
  writeModesFor,
} from './writeback-samples';

const manifest = {
  supportedEntities: [
    {
      type: 'encounter',
      fields: [],
      schema: {
        type: 'object',
        properties: {
          assessment: {
            type: 'object',
            properties: {
              diagnoses: { type: 'array', items: { type: 'type', typeId: 'diagnosis' } },
              generalNotes: { type: 'string' },
            },
          },
          diagnoses: {
            type: 'array',
            items: { type: 'type', typeId: 'diagnosis' },
            deprecationStatus: { deprecated: true, deprecationText: 'Use assessment.diagnoses instead.' },
          },
          billingInformation: {
            type: 'object',
            properties: { procedureCodes: { type: 'array', items: { type: 'type', typeId: 'procedure' } } },
          },
        },
      },
    },
    {
      type: 'patient',
      fields: [],
      schema: {
        type: 'object',
        properties: {
          demographics: { type: 'type', typeId: 'demographics' },
          contactInfo: { type: 'type', typeId: 'contact-info' },
        },
      },
    },
    {
      type: 'referral',
      fields: [],
      schema: {
        type: 'object',
        properties: {
          basicInformation: {
            type: 'object',
            properties: { startDate: { type: 'date' }, numberOfVisits: { type: 'number' } },
          },
          targetProvider: { type: 'type', typeId: 'provider' },
        },
      },
    },
  ],
  typeDefinitions: [
    {
      id: 'demographics',
      schema: {
        type: 'object',
        properties: { gender: { type: 'enum', enumValues: ['male', 'female', 'unknown'] }, firstName: { type: 'string' } },
      },
    },
    {
      id: 'contact-info',
      schema: { type: 'object', properties: { mobilePhoneNumber: { type: 'string', canonicalFormat: { kind: 'phone' } } } },
    },
    { id: 'provider', schema: { type: 'object', properties: { npi: { type: 'string' } } } },
  ],
  contextWriteback: {
    encounter: { update: { available: true, disruptive: true, updatableFields: ['assessment.diagnoses', 'assessment.generalNotes'] } },
    patient: { update: { available: true, disruptive: false, updatableFields: ['demographics.gender'] } },
  },
} as unknown as AppManifest;

describe('writebackEntriesOf', () => {
  it('flattens contextWriteback into one entry per writable field', () => {
    expect(writebackEntriesOf(manifest)).toEqual([
      { entityType: 'encounter', fieldPath: 'assessment.diagnoses', disruptive: true },
      { entityType: 'encounter', fieldPath: 'assessment.generalNotes', disruptive: true },
      { entityType: 'patient', fieldPath: 'demographics.gender', disruptive: false },
    ]);
  });

  it('is empty without a manifest', () => {
    expect(writebackEntriesOf(null)).toEqual([]);
  });
});

describe('sampleValueFor', () => {
  it('gives coded lists the sandbox EHR resolves for diagnosis and procedure list fields', () => {
    expect(JSON.parse(sampleValueFor(manifest, 'encounter', 'assessment.diagnoses'))).toEqual([
      { code: 'I10', description: 'Essential (primary) hypertension' },
    ]);
    expect(JSON.parse(sampleValueFor(manifest, 'encounter', 'billingInformation.procedureCodes'))[0].code).toBe('99213');
  });

  it('gives a realistic clinical value for known note and referral fields', () => {
    expect(sampleValueFor(manifest, 'encounter', 'subjective.chiefComplaintNotes')).toBe('Headache for 3 days');
    expect(sampleValueFor(manifest, 'encounter', 'plan.generalNotes')).toBe('Ibuprofen 400 mg PRN, follow up in 2 weeks');
    expect(sampleValueFor(manifest, 'referral', 'basicInformation.priority')).toBe('routine');
  });

  it('tells apart same-path fields on different entities', () => {
    expect(sampleValueFor(manifest, 'order', 'basicInformation.notes')).toBe('Fasting required');
    expect(sampleValueFor(manifest, 'referral', 'basicInformation.notes')).toBe('Please see within 2 weeks');
  });

  it('resolves typed fields through typeDefinitions', () => {
    expect(sampleValueFor(manifest, 'patient', 'demographics.gender')).toBe('male');
    expect(sampleValueFor(manifest, 'patient', 'demographics.firstName')).toBe('Sample firstName');
  });

  it('quotes digit-only strings so they stay strings', () => {
    expect(JSON.parse(sampleValueFor(manifest, 'patient', 'contactInfo.mobilePhoneNumber'))).toBe('5551234567');
    expect(JSON.parse(sampleValueFor(manifest, 'referral', 'targetProvider.npi'))).toBe('1234567893');
  });

  it('gives an ISO date and a number where the schema asks for them', () => {
    expect(sampleValueFor(manifest, 'referral', 'basicInformation.startDate')).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(sampleValueFor(manifest, 'referral', 'basicInformation.numberOfVisits')).toBe('3');
  });

  it('falls back to the schema type for a field not in the table', () => {
    const typed = {
      supportedEntities: [
        {
          type: 'visit',
          fields: [],
          schema: { type: 'object', properties: { seenOn: { type: 'date' }, count: { type: 'number' } } },
        },
      ],
      typeDefinitions: [],
    } as unknown as AppManifest;
    expect(sampleValueFor(typed, 'visit', 'seenOn')).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(sampleValueFor(typed, 'visit', 'count')).toBe('3');
  });

  it('lets the schema type win over clinical text for the same field', () => {
    const listNotes = {
      supportedEntities: [
        {
          type: 'order',
          fields: [],
          schema: {
            type: 'object',
            properties: {
              basicInformation: {
                type: 'object',
                properties: { notes: { type: 'array', items: { type: 'type', typeId: 'diagnosis' } } },
              },
            },
          },
        },
      ],
      typeDefinitions: [],
    } as unknown as AppManifest;
    expect(JSON.parse(sampleValueFor(listNotes, 'order', 'basicInformation.notes'))[0].code).toBe('I10');
  });

  it('falls back to sample text for a field neither the table nor the schema describes', () => {
    expect(sampleValueFor(manifest, 'order', 'basicInformation.unknownField')).toBe('Sample unknownField');
  });
});

describe('collectionWritebackEntriesOf', () => {
  const manifest = {
    supportedEntities: [
      {
        type: 'encounter',
        fields: [],
        since: '1.0.0',
        schema: {
          type: 'object',
          properties: {
            subjective: {
              type: 'object',
              properties: {
                chiefComplaintNotes: { type: 'string', supportsUpdates: true },
                readOnly: { type: 'string' },
              },
            },
            assessment: {
              type: 'object',
              properties: {
                diagnoses: { type: 'array', items: { supportsCreate: true } },
              },
            },
          },
        },
      },
      {
        type: 'referral',
        fields: [],
        since: '1.0.0',
        schema: {
          type: 'object',
          properties: {
            targetProvider: {
              type: 'type',
              typeId: 'provider',
              typeFieldOverrides: { npi: { supportsUpdates: true }, ehrProviderId: { supportsUpdates: false } },
            },
          },
        },
      },
    ],
    contextWriteback: {
      encounter: { update: { available: true, disruptive: true, updatableFields: ['assessment.diagnoses', 'extra.field'] } },
    },
  } as unknown as AppManifest;

  it('lists every field the collection lets an app write, marking what the EHR supports', () => {
    expect(collectionWritebackEntriesOf(manifest)).toEqual([
      { entityType: 'encounter', fieldPath: 'subjective.chiefComplaintNotes', disruptive: false, ehrSupported: false },
      { entityType: 'encounter', fieldPath: 'assessment.diagnoses', disruptive: true, ehrSupported: true },
      { entityType: 'referral', fieldPath: 'targetProvider.npi', disruptive: false, ehrSupported: false },
      { entityType: 'encounter', fieldPath: 'extra.field', disruptive: true, ehrSupported: true },
    ]);
  });

  it('is empty without a manifest', () => {
    expect(collectionWritebackEntriesOf(null)).toEqual([]);
  });

  it('applies the platform rule: primitives only, inline objects only, overrides only on references', () => {
    const odd = {
      supportedEntities: [
        {
          type: 'patient',
          fields: [],
          since: '1.0.0',
          schema: {
            type: 'object',
            properties: {
              pcp: { type: 'type', typeId: 'provider', supportsUpdates: true },
              notes: { type: 'string', supportsUpdates: true },
              loose: { type: 'string', properties: { inner: { type: 'string', supportsUpdates: true } } },
              meta: { type: 'string', typeFieldOverrides: { x: { supportsUpdates: true } } },
            },
          },
        },
      ],
    } as unknown as AppManifest;
    expect(collectionWritebackEntriesOf(odd).map((e) => e.fieldPath)).toEqual(['notes']);
  });
});

describe('writeModesFor', () => {
  const manifest = {
    supportedEntities: [
      {
        type: 'encounter',
        fields: [],
        since: '1.0.0',
        schema: {
          type: 'object',
          properties: {
            assessment: {
              type: 'object',
              properties: {
                diagnoses: { type: 'array', items: { type: 'type', typeId: 'diagnosis', supportsCreate: true } },
                generalNotes: { type: 'string', supportsUpdates: true },
              },
            },
            basicInformation: {
              type: 'object',
              properties: {
                status: { type: 'string', enumValues: ['open', 'signed'], supportsUpdates: true },
                statusNotes: { type: 'string', enumValues: ['a'], supportsUpdates: true },
                phoneNotes: { type: 'string', canonicalFormat: { kind: 'phone' }, supportsUpdates: true },
              },
            },
          },
        },
      },
      {
        type: 'referral',
        fields: [],
        since: '1.0.0',
        schema: {
          type: 'object',
          properties: {
            basicInformation: {
              type: 'object',
              properties: { reason: { type: 'string', supportsUpdates: true } },
            },
            targetProvider: {
              type: 'type',
              typeId: 'provider',
              typeFieldOverrides: { npi: { supportsUpdates: true } },
            },
          },
        },
      },
    ],
    typeDefinitions: [
      {
        id: 'provider',
        name: 'Provider',
        schema: { type: 'object', properties: { npi: { type: 'string' }, firstName: { type: 'string' } } },
      },
    ],
  } as unknown as AppManifest;

  it('only appends to an array whose items can be created', () => {
    expect(writeModesFor(manifest, 'encounter', 'assessment.diagnoses')).toEqual({
      modes: ['append'],
      defaultMode: 'append',
    });
  });

  it('offers both modes on a free-text field, appending by default', () => {
    for (const [entity, path] of [
      ['encounter', 'assessment.generalNotes'],
      ['referral', 'basicInformation.reason'],
    ]) {
      expect(writeModesFor(manifest, entity, path)).toEqual({
        modes: ['override', 'append'],
        defaultMode: 'append',
      });
    }
  });

  it('only overrides an enum, a formatted string, a name, or an id', () => {
    for (const path of ['basicInformation.status', 'basicInformation.statusNotes', 'basicInformation.phoneNotes']) {
      expect(writeModesFor(manifest, 'encounter', path).modes).toEqual(['override']);
    }
    expect(writeModesFor(manifest, 'referral', 'targetProvider.npi').modes).toEqual(['override']);
  });

  it('only overrides an unknown field', () => {
    expect(writeModesFor(manifest, 'encounter', 'nope.missing').modes).toEqual(['override']);
    expect(writeModesFor(null, 'encounter', 'assessment.diagnoses').modes).toEqual(['override']);
  });
});
