import { describe, it, expect } from 'vitest';
import type { Results } from './auto-runner-engine';
import { RESULT_BUCKET_COUNT, bucketContents, changedBuckets, isAutoRunnerCommand, mergeBuckets, resultBucketOf } from './offscreen-auto-runner-protocol';

describe('result buckets', () => {
  it('splits results across the buckets and merges them back unchanged', () => {
    const results = manyResults(40);
    const buckets = Array.from({ length: RESULT_BUCKET_COUNT }, (_, bucket) => bucketContents(results, bucket));

    expect(mergeBuckets(buckets)).toEqual(results);
  });

  it('places a result in the same bucket every time', () => {
    expect(resultBucketOf('reads', 'patient.getPatient')).toBe(resultBucketOf('reads', 'patient.getPatient'));
  });

  it('marks only the buckets holding a result that changed', () => {
    const before = manyResults(10);
    const after: Results = { ...before, reads: { ...before.reads, 'ns.op3': { state: 'ok', at: 'later' } } };

    expect(changedBuckets(before, after)).toEqual([resultBucketOf('reads', 'ns.op3')]);
  });

  it('treats every result as changed when nothing was published before', () => {
    const results = manyResults(3);
    const everyBucket = new Set([
      ...Object.keys(results.reads).map((key) => resultBucketOf('reads', key)),
      resultBucketOf('writes', 'ns.write'),
      resultBucketOf('writebacks', 'encounter.notes'),
    ]);

    expect(new Set(changedBuckets(null, results))).toEqual(everyBucket);
  });

  it('merges a bucket that has not been published yet as empty', () => {
    expect(mergeBuckets([null, null])).toEqual({ reads: {}, writes: {}, writebacks: {} });
  });
});

describe('isAutoRunnerCommand', () => {
  it('accepts a command the Worker App understands', () => {
    expect(isAutoRunnerCommand({ type: 'runRead', opKey: 'patient.getPatient' })).toBe(true);
  });

  it('accepts a start that carries its run id and plan', () => {
    expect(isAutoRunnerCommand({ type: 'start', runId: 'r', plan: { contexts: [], events: [], ops: [] } })).toBe(true);
  });

  it('rejects a known command missing what its type requires', () => {
    expect(isAutoRunnerCommand({ type: 'start', runId: 'r' })).toBe(false);
    expect(isAutoRunnerCommand({ type: 'runWrite', opKey: 'encounter.updateNotes' })).toBe(false);
    expect(
      isAutoRunnerCommand({ type: 'runWriteback', target: { entity: 'encounter', field: 'notes', disruptive: false }, value: 'x', mode: 'replace' }),
    ).toBe(false);
  });

  it('rejects anything else', () => {
    expect(isAutoRunnerCommand({ type: 'launchMissiles' })).toBe(false);
    expect(isAutoRunnerCommand('start')).toBe(false);
    expect(isAutoRunnerCommand(null)).toBe(false);
  });
});

function manyResults(count: number): Results {
  const reads: Results['reads'] = {};
  for (let i = 0; i < count; i++) reads[`ns.op${i}`] = { state: 'ok', at: 'now', result: { i } };
  return { reads, writes: { 'ns.write': { state: 'error', error: 'nope' } }, writebacks: { 'encounter.notes': { state: 'running' } } };
}
