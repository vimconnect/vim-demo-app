/**
 * Worker App host for the auto-runner's offscreen mode: runs the engine on
 * the Worker's own SDK and mirrors its state into workerState for the UI App.
 */

import type { WorkerSDK } from '@vimconnect/app-sdk';
import {
  createAutoRunnerEngine,
  errorMessage,
  type AutoRunnerEngine,
  type AutoRunnerState,
  type ResultSection,
  type Results,
} from './auto-runner-engine';
import { createWorkerSurface } from './auto-runner-surfaces';
import {
  AUTO_RUNNER_COMMAND_EVENT,
  AUTO_RUNNER_CONTEXT_KEY,
  AUTO_RUNNER_EVENTS_KEY,
  AUTO_RUNNER_LOG_KEY,
  AUTO_RUNNER_STATUS_KEY,
  RESULT_SECTIONS,
  WORKER_STATE_VALUE_MAX_LENGTH,
  bucketContents,
  changedBuckets,
  isAutoRunnerCommand,
  resultBucketKey,
  type AutoRunnerStatus,
} from './offscreen-auto-runner-protocol';

type WorkerState = WorkerSDK['workerState'];

interface StatePublisher {
  publish(state: AutoRunnerState): void;
  /** Removes every key this run wrote except the status key, which the host owns. */
  clear(): void;
}

const IDLE_STATUS: AutoRunnerStatus = { runId: null, autoRunDisruptive: false, relayErrors: [] };

/** The length the SDK checks against its cap; a value that cannot be serialized never fits. */
function jsonLength(value: unknown): number {
  try {
    return JSON.stringify(value)?.length ?? 0;
  } catch {
    return Infinity;
  }
}

/** The bucket with its largest result replaced by an error, or null when no entry still carries a result. */
function withoutLargestResult(bucket: Results): Results | null {
  let largest: { section: ResultSection; key: string; length: number } | null = null;
  for (const section of RESULT_SECTIONS) {
    for (const [key, entry] of Object.entries(bucket[section])) {
      if (entry.result === undefined) continue;
      const length = jsonLength(entry.result);
      if (!largest || length > largest.length) largest = { section, key, length };
    }
  }
  if (!largest) return null;
  const { section, key, length } = largest;
  const { at, argsLabel } = bucket[section][key];
  const error = `Result not relayed to the UI App — its ${Number.isFinite(length) ? `${length}-character` : 'unserializable'} payload does not fit workerState's ${WORKER_STATE_VALUE_MAX_LENGTH}-character limit`;
  return { ...bucket, [section]: { ...bucket[section], [key]: { state: 'error', at, argsLabel, error } } };
}

/** Strips results, largest first, until the bucket fits the SDK's cap. */
function fitBucket(contents: Results): Results {
  let bucket = contents;
  while (jsonLength(bucket) > WORKER_STATE_VALUE_MAX_LENGTH) {
    const smaller = withoutLargestResult(bucket);
    if (!smaller) break;
    bucket = smaller;
  }
  return bucket;
}

function createStatePublisher(workerState: WorkerState, runId: string): StatePublisher {
  let prev: AutoRunnerState | null = null;
  let sentStatus: string | null = null;
  const written = new Set<string>();
  const relayErrors = new Map<string, string>();

  function write(key: string, value: unknown) {
    try {
      workerState.write(key, value);
      written.add(key);
      relayErrors.delete(key);
    } catch (err) {
      relayErrors.set(key, errorMessage(err));
    }
  }

  function writeStatus(autoRunDisruptive: boolean) {
    const status: AutoRunnerStatus = {
      runId,
      autoRunDisruptive,
      relayErrors: [...relayErrors].map(([key, message]) => `${key}: ${message}`),
    };
    const serialized = JSON.stringify(status);
    if (serialized === sentStatus) return;
    try {
      workerState.write(AUTO_RUNNER_STATUS_KEY, status);
      sentStatus = serialized;
    } catch (err) {
      console.warn('[offscreen/auto-runner] status write failed:', errorMessage(err));
    }
  }

  return {
    publish(state) {
      if (state.contextStore !== prev?.contextStore) write(AUTO_RUNNER_CONTEXT_KEY, state.contextStore);
      if (state.events !== prev?.events) write(AUTO_RUNNER_EVENTS_KEY, state.events);
      if (state.log !== prev?.log) write(AUTO_RUNNER_LOG_KEY, state.log);
      for (const bucket of changedBuckets(prev?.results ?? null, state.results)) {
        write(resultBucketKey(bucket), fitBucket(bucketContents(state.results, bucket)));
      }
      writeStatus(state.autoRunDisruptive);
      prev = state;
    },
    clear() {
      for (const key of written) workerState.remove(key);
      written.clear();
    },
  };
}

export function serveOffscreenAutoRunner(sdk: WorkerSDK): void {
  const appEvents = sdk.appEvents;
  if (!appEvents) {
    console.warn('[offscreen/auto-runner] appEvents NOT supported by this extension — offscreen auto-runner unavailable');
    return;
  }

  let run: { runId: string; engine: AutoRunnerEngine; publisher: StatePublisher } | null = null;

  function endRun() {
    run?.engine.stop();
    run?.publisher.clear();
    run = null;
  }

  appEvents.on(AUTO_RUNNER_COMMAND_EVENT, (command) => {
    if (!isAutoRunnerCommand(command)) {
      console.warn('[offscreen/auto-runner] Ignoring malformed command');
      return;
    }
    try {
      switch (command.type) {
        case 'start': {
          if (run?.runId === command.runId) return;
          endRun();
          const publisher = createStatePublisher(sdk.workerState, command.runId);
          const engine = createAutoRunnerEngine(command.plan, createWorkerSurface(sdk), publisher.publish);
          run = { runId: command.runId, engine, publisher };
          engine.start();
          console.log('[offscreen/auto-runner] Run started');
          return;
        }
        case 'stop':
          if (run?.runId !== command.runId) return;
          endRun();
          sdk.workerState.write(AUTO_RUNNER_STATUS_KEY, IDLE_STATUS);
          console.log('[offscreen/auto-runner] Run stopped');
          return;
        case 'runRead':
          run?.engine.runRead(command.opKey);
          return;
        case 'runWrite':
          run?.engine.runWrite(command.opKey, command.payloadText);
          return;
        case 'runWriteback':
          run?.engine.runWriteback(command.target, command.value, command.mode);
          return;
        case 'setAutoRunDisruptive':
          run?.engine.setAutoRunDisruptive(command.value);
          return;
      }
    } catch (err) {
      console.error('[offscreen/auto-runner] Command failed:', command.type, errorMessage(err));
    }
  });

  sdk.workerState.write(AUTO_RUNNER_STATUS_KEY, IDLE_STATUS);
  console.log('[offscreen/auto-runner] Ready');
}
