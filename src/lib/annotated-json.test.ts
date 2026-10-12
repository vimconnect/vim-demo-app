import { describe, expect, it } from 'vitest';
import type { AppManifest } from '@vimconnect/app-sdk';
import {
  annotatedLines,
  apiResultAnnotator,
  contextAnnotator,
  fieldDeprecation,
  manifestAnnotator,
  workflowEventAnnotator,
} from './annotated-json';

const deprecated = (deprecationText: string) => ({ deprecated: true, deprecationText });

const manifest = {
  supportedEvents: [
    { id: 'chart_open', name: 'Chart Open', availableEntities: [], since: '1.0.0' },
    {
      id: 'legacy_open',
      name: 'Legacy Open',
      availableEntities: [],
      since: '1.0.0',
      deprecationStatus: deprecated('Use chart_open instead.'),
    },
  ],
  supportedEntities: [
    {
      type: 'encounter',
      fields: [],
      since: '1.0.0',
      schema: {
        type: 'object',
        properties: {
          id: { type: 'string', deprecationStatus: deprecated('Use identifiers.ehrEncounterId instead.') },
          identifiers: { type: 'object', properties: { ehrEncounterId: { type: 'string' } } },
          diagnoses: {
            type: 'object',
            deprecationStatus: deprecated('Use assessment.diagnoses instead.'),
            properties: { code: { type: 'string' } },
          },
          assessment: {
            type: 'object',
            properties: { diagnoses: { type: 'array', items: { type: 'type', typeId: 'diagnosis' } } },
          },
          medications: { type: 'array', items: { type: 'type', typeId: 'medication' } },
          note: { type: 'type', typeId: 'legacyNote' },
        },
      },
    },
    {
      type: 'visit',
      fields: [],
      since: '1.0.0',
      deprecationStatus: deprecated('Use encounter instead.'),
      schema: { type: 'object', properties: { reason: { type: 'string' } } },
    },
  ],
  typeDefinitions: [
    { id: 'diagnosis', name: 'Diagnosis', schema: { properties: { code: { type: 'string' } } } },
    {
      id: 'medication',
      name: 'Medication',
      schema: {
        properties: {
          medicationName: { type: 'string', deprecationStatus: deprecated('Use basicInformation.medicationName instead.') },
          strength: { type: 'string' },
        },
      },
    },
    {
      id: 'legacyNote',
      name: 'Legacy note',
      deprecationStatus: deprecated('Use encounterNotes instead.'),
      schema: { properties: { text: { type: 'string' } } },
    },
  ],
} as unknown as AppManifest;

const notes = (lines: ReturnType<typeof annotatedLines>) =>
  lines.filter((line) => line.note !== null).map((line) => [line.text.trim(), line.note]);

describe('annotatedLines', () => {
  it('prints exactly what JSON.stringify prints', () => {
    const value = {
      a: 1,
      b: [1, { c: null, d: [] }, 'x'],
      e: {},
      f: undefined,
      g: new Date(0),
      h: [undefined],
    };
    const text = annotatedLines(value).map((line) => line.text).join('\n');
    expect(text).toBe(JSON.stringify(value, null, 2));
  });

  it('prints nothing for undefined', () => {
    expect(annotatedLines(undefined)).toEqual([]);
  });

  it('notes nothing without an annotator', () => {
    expect(notes(annotatedLines({ id: '1' }))).toEqual([]);
  });
});

describe('contextAnnotator', () => {
  const context = {
    id: 'e1',
    type: 'encounter',
    identifier: { type: 'existing', id: 'e1' },
    fields: {
      id: 'e1',
      identifiers: { ehrEncounterId: 'e1' },
      diagnoses: { code: 'I10' },
      assessment: { diagnoses: [{ code: 'I10' }] },
      medications: [{ medicationName: 'Aspirin', strength: '81mg' }, { medicationName: 'Ibuprofen' }],
      note: { text: 'n' },
    },
  };

  it('notes deprecated fields, groups, typed fields and type definitions at any depth', () => {
    expect(notes(annotatedLines(context, contextAnnotator(manifest, 'encounter')))).toEqual([
      ['"id": "e1",', 'Use identifiers.ehrEncounterId instead.'],
      ['"diagnoses": {', 'Use assessment.diagnoses instead.'],
      ['"medicationName": "Aspirin",', 'Use basicInformation.medicationName instead.'],
      ['"medicationName": "Ibuprofen"', 'Use basicInformation.medicationName instead.'],
      ['"note": {', 'Use encounterNotes instead.'],
    ]);
  });

  it('notes the fields of a deprecated entity once, on `fields`', () => {
    const lines = annotatedLines({ type: 'visit', fields: { reason: 'r' } }, contextAnnotator(manifest, 'visit'));
    expect(notes(lines)).toEqual([['"fields": {', 'Use encounter instead.']]);
  });

  it('notes nothing for an unknown entity or no manifest', () => {
    expect(notes(annotatedLines(context, contextAnnotator(manifest, 'nope')))).toEqual([]);
    expect(notes(annotatedLines(context, contextAnnotator(null, 'encounter')))).toEqual([]);
  });
});

describe('apiResultAnnotator', () => {
  it('notes a getById result', () => {
    const lines = annotatedLines({ success: true, data: { id: 'e1' } }, apiResultAnnotator(manifest, 'encounter'));
    expect(notes(lines)).toEqual([['"id": "e1"', 'Use identifiers.ehrEncounterId instead.']]);
  });

  it('notes each item of a search result', () => {
    const lines = annotatedLines(
      { success: true, data: [{ id: 'e1' }, { id: 'e2' }] },
      apiResultAnnotator(manifest, 'encounter'),
    );
    expect(notes(lines)).toEqual([
      ['"id": "e1"', 'Use identifiers.ehrEncounterId instead.'],
      ['"id": "e2"', 'Use identifiers.ehrEncounterId instead.'],
    ]);
  });
});

describe('workflowEventAnnotator', () => {
  it('notes a deprecated event, a deprecated entity, and a fanned-out entity`s fields', () => {
    const event = {
      type: 'legacy_open',
      timestamp: 1,
      entities: {
        visit: { entityType: 'visit', type: 'existing', id: 'v1' },
        encounter: { entityType: 'encounter', type: 'existing', id: 'e1', data: { id: 'e1' } },
      },
      metadata: { componentId: 'c', trigger: 't', systemId: 's', timestamp: 1 },
    };
    expect(notes(annotatedLines(event, workflowEventAnnotator(manifest, 'legacy_open')))).toEqual([
      ['"type": "legacy_open",', 'Use chart_open instead.'],
      ['"visit": {', 'Use encounter instead.'],
      ['"id": "e1"', 'Use identifiers.ehrEncounterId instead.'],
    ]);
  });

  it('notes nothing on a current event', () => {
    const lines = annotatedLines({ type: 'chart_open', entities: {} }, workflowEventAnnotator(manifest, 'chart_open'));
    expect(notes(lines)).toEqual([]);
  });
});

describe('manifestAnnotator', () => {
  it('notes every deprecated event, entity, type definition and field where it starts', () => {
    const lines = annotatedLines(
      { supportedEvents: manifest.supportedEvents, typeDefinitions: manifest.typeDefinitions.slice(2) },
      manifestAnnotator,
    );
    expect(notes(lines)).toEqual([
      ['{', 'Use chart_open instead.'],
      ['{', 'Use encounterNotes instead.'],
    ]);
  });
});

describe('fieldDeprecation', () => {
  it('returns the note for a deprecated field, group, typed field or type definition', () => {
    expect(fieldDeprecation(manifest, 'encounter', 'diagnoses')).toBe('Use assessment.diagnoses instead.');
    expect(fieldDeprecation(manifest, 'encounter', 'diagnoses.code')).toBeNull();
    expect(fieldDeprecation(manifest, 'encounter', 'note')).toBe('Use encounterNotes instead.');
    expect(fieldDeprecation(manifest, 'encounter', 'medications')).toBeNull();
  });

  it('is null for a current field, an unknown field, or no manifest', () => {
    expect(fieldDeprecation(manifest, 'encounter', 'assessment.diagnoses')).toBeNull();
    expect(fieldDeprecation(manifest, 'encounter', 'nope')).toBeNull();
    expect(fieldDeprecation(null, 'encounter', 'diagnoses')).toBeNull();
  });
});
