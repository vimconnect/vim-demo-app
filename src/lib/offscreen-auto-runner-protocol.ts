/**
 * Shared contract between the auto-runner's offscreen mode in the UI App and
 * the Worker App that runs it: commands go out over appEvents, the run's
 * state comes back over workerState.
 */

import type { AutoRunnerPlan, ResultSection, Results, WritebackMode, WritebackTarget } from './auto-runner-engine';

export const AUTO_RUNNER_COMMAND_EVENT = 'auto-runner-command';

export const AUTO_RUNNER_STATUS_KEY = 'auto-runner-status';
export const AUTO_RUNNER_CONTEXT_KEY = 'auto-runner-context';
export const AUTO_RUNNER_EVENTS_KEY = 'auto-runner-events';
export const AUTO_RUNNER_LOG_KEY = 'auto-runner-log';

/** The extension caps an app at 30 workerState keys and 200 KB per value, so results share this many keys. */
export const RESULT_BUCKET_COUNT = 16;

/** The SDK's per-value cap, measured as it measures it: the length of the value's JSON. */
export const WORKER_STATE_VALUE_MAX_LENGTH = 204_800;

/**
 * `runId` is null while the Worker serves no run. `relayErrors` names each workerState key whose latest
 * write was refused; a Worker from an older build omits it.
 */
export interface AutoRunnerStatus {
  runId: string | null;
  autoRunDisruptive: boolean;
  relayErrors?: string[];
}

export type AutoRunnerCommand =
  | { type: 'start'; runId: string; plan: AutoRunnerPlan }
  | { type: 'stop'; runId: string }
  | { type: 'runRead'; opKey: string }
  | { type: 'runWrite'; opKey: string; payloadText: string }
  | { type: 'runWriteback'; target: WritebackTarget; value: string; mode: WritebackMode }
  | { type: 'setAutoRunDisruptive'; value: boolean };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isPlan(value: unknown): value is AutoRunnerPlan {
  return isRecord(value) && Array.isArray(value.contexts) && Array.isArray(value.events) && Array.isArray(value.ops);
}

function isWritebackTarget(value: unknown): value is WritebackTarget {
  return isRecord(value) && typeof value.entity === 'string' && typeof value.field === 'string' && typeof value.disruptive === 'boolean';
}

export function isAutoRunnerCommand(value: unknown): value is AutoRunnerCommand {
  if (!isRecord(value)) return false;
  switch (value.type) {
    case 'start':
      return typeof value.runId === 'string' && isPlan(value.plan);
    case 'stop':
      return typeof value.runId === 'string';
    case 'runRead':
      return typeof value.opKey === 'string';
    case 'runWrite':
      return typeof value.opKey === 'string' && typeof value.payloadText === 'string';
    case 'runWriteback':
      return isWritebackTarget(value.target) && typeof value.value === 'string' && (value.mode === 'override' || value.mode === 'append');
    case 'setAutoRunDisruptive':
      return typeof value.value === 'boolean';
    default:
      return false;
  }
}

export const RESULT_SECTIONS: readonly ResultSection[] = ['reads', 'writes', 'writebacks'];

export function resultBucketKey(bucket: number): string {
  return `auto-runner-results-${bucket}`;
}

export function resultBucketOf(section: ResultSection, key: string): number {
  let hash = 0;
  for (const char of `${section}:${key}`) hash = (hash * 31 + char.charCodeAt(0)) | 0;
  return Math.abs(hash) % RESULT_BUCKET_COUNT;
}

function emptyResults(): Results {
  return { reads: {}, writes: {}, writebacks: {} };
}

export function bucketContents(results: Results, bucket: number): Results {
  const contents = emptyResults();
  for (const section of RESULT_SECTIONS) {
    for (const [key, result] of Object.entries(results[section])) {
      if (resultBucketOf(section, key) === bucket) contents[section][key] = result;
    }
  }
  return contents;
}

export function changedBuckets(prev: Results | null, next: Results): number[] {
  const buckets = new Set<number>();
  for (const section of RESULT_SECTIONS) {
    for (const [key, result] of Object.entries(next[section])) {
      if (prev?.[section][key] !== result) buckets.add(resultBucketOf(section, key));
    }
  }
  return [...buckets];
}

export function mergeBuckets(buckets: ReadonlyArray<Results | null>): Results {
  const merged = emptyResults();
  for (const bucket of buckets) {
    if (!bucket) continue;
    for (const section of RESULT_SECTIONS) Object.assign(merged[section], bucket[section]);
  }
  return merged;
}
