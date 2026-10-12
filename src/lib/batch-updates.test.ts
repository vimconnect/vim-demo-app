import { describe, expect, it } from 'vitest';
import { groupUpdatesByEntity, parseUpdaterValue } from './batch-updates';

describe('groupUpdatesByEntity', () => {
  it('merges every field of an entity into one nested object and one field list', () => {
    const [encounter] = groupUpdatesByEntity([
      { entityType: 'encounter', fieldPath: 'subjective.chiefComplaintNotes', value: 'Headache', mode: 'override' },
      { entityType: 'encounter', fieldPath: 'subjective.generalNotes', value: 'Night shifts', mode: 'override' },
      { entityType: 'encounter', fieldPath: 'assessment.diagnoses', value: '[{"code":"I10"}]', mode: 'override' },
    ]);
    expect(encounter.fields).toEqual([
      'subjective.chiefComplaintNotes',
      'subjective.generalNotes',
      'assessment.diagnoses',
    ]);
    expect(encounter.writes).toHaveLength(1);
    expect(encounter.writes[0].data).toEqual({
      subjective: { chiefComplaintNotes: 'Headache', generalNotes: 'Night shifts' },
      assessment: { diagnoses: [{ code: 'I10' }] },
    });
    expect(encounter.writes[0].mode).toBe('override');
  });

  it('makes one batch per entity, in first-seen order', () => {
    const batches = groupUpdatesByEntity([
      { entityType: 'referral', fieldPath: 'basicInformation.notes', value: 'Soon', mode: 'override' },
      { entityType: 'encounter', fieldPath: 'plan.generalNotes', value: 'Rest', mode: 'override' },
      { entityType: 'referral', fieldPath: 'basicInformation.priority', value: 'routine', mode: 'override' },
    ]);
    expect(batches.map((b) => b.entityType)).toEqual(['referral', 'encounter']);
    expect(batches[0].fields).toEqual(['basicInformation.notes', 'basicInformation.priority']);
  });

  it('skips updaters with no value', () => {
    expect(
      groupUpdatesByEntity([{ entityType: 'order', fieldPath: 'basicInformation.notes', value: '  ', mode: 'override' }]),
    ).toEqual([]);
  });

  it('splits an entity into one write per mode, so an append field is never sent as override', () => {
    const [encounter] = groupUpdatesByEntity([
      { entityType: 'encounter', fieldPath: 'plan.generalNotes', value: 'Rest', mode: 'append' },
      { entityType: 'encounter', fieldPath: 'subjective.chiefComplaintNotes', value: 'Headache', mode: 'override' },
      { entityType: 'encounter', fieldPath: 'encounterNotes.generalNotes', value: 'Sleep', mode: 'append' },
    ]);
    expect(encounter.fields).toEqual([
      'plan.generalNotes',
      'subjective.chiefComplaintNotes',
      'encounterNotes.generalNotes',
    ]);
    expect(encounter.writes).toEqual([
      {
        mode: 'append',
        fields: ['plan.generalNotes', 'encounterNotes.generalNotes'],
        data: { plan: { generalNotes: 'Rest' }, encounterNotes: { generalNotes: 'Sleep' } },
      },
      {
        mode: 'override',
        fields: ['subjective.chiefComplaintNotes'],
        data: { subjective: { chiefComplaintNotes: 'Headache' } },
      },
    ]);
  });

  it('parses JSON and falls back to the raw text', () => {
    expect(parseUpdaterValue('"1234567893"')).toBe('1234567893');
    expect(parseUpdaterValue('3')).toBe(3);
    expect(parseUpdaterValue('Headache for 3 days')).toBe('Headache for 3 days');
  });
});
