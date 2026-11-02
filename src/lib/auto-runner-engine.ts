/**
 * The auto-runner's behaviour, independent of where it runs.
 *
 * The UI App runs it against `VimSDK`; the offscreen Worker App runs the same
 * engine against its `WorkerSDK` handles. Everything that differs between the
 * two is the `AutoRunnerSurface` each host supplies, so a difference in what
 * the two modes report is a difference in the SDK surfaces themselves.
 */

import type { AppManifest, ContextData, WorkflowEvent } from '@vimconnect/app-sdk';
import { buildRunnableOps, extractEntityId, resolveBinding, shouldFire, type ContextStore, type RunnableOp } from './capability-engine';

export type OpState = 'idle' | 'running' | 'ok' | 'error';

export interface OpResult {
  state: OpState;
  at?: string;
  argsLabel?: string;
  result?: unknown;
  error?: string;
}

export type ResultMap = Record<string, OpResult>;
export type ResultSection = 'reads' | 'writes' | 'writebacks';
export type Results = Record<ResultSection, ResultMap>;

export interface EventRow {
  id: number;
  type: string;
  at: string;
  event: WorkflowEvent;
}

export type LogTone = 'info' | 'success' | 'error';

export interface LogRow {
  at: string;
  message: string;
  tone: LogTone;
}

export type Log = (message: string, tone: LogTone) => void;

export interface WritebackTarget {
  entity: string;
  field: string;
  disruptive: boolean;
}

export type WritebackMode = 'override' | 'append';

export interface AutoRunnerState {
  contextStore: ContextStore;
  events: EventRow[];
  results: Results;
  log: LogRow[];
  autoRunDisruptive: boolean;
}

/** What the runner watches and runs. Built by the UI App — a Worker App cannot read the manifest. */
export interface AutoRunnerPlan {
  contexts: Array<{ contextKey: string; entityType: string }>;
  events: string[];
  ops: RunnableOp[];
}

/** One host's SDK. Each method throws (or rejects) when its SDK cannot do the thing asked. */
export interface AutoRunnerSurface {
  watchContext(contextKey: string, onChange: (current: ContextData | null) => void): () => void;
  watchEvent(eventType: string, onEvent: (event: WorkflowEvent) => void): () => void;
  callApi(op: RunnableOp, args: unknown[], log: Log): Promise<unknown>;
  writeback(target: WritebackTarget, data: Record<string, unknown>, mode: WritebackMode, log: Log): Promise<unknown>;
}

export interface AutoRunnerActions {
  runRead(opKey: string): void;
  runWrite(opKey: string, payloadText: string): void;
  runWriteback(target: WritebackTarget, value: string, mode: WritebackMode): void;
  setAutoRunDisruptive(value: boolean): void;
}

export interface AutoRunnerEngine extends AutoRunnerActions {
  start(): void;
  stop(): void;
}

const MAX_EVENTS = 100;
const MAX_LOG_ROWS = 200;

export function buildAutoRunnerPlan(manifest: AppManifest): AutoRunnerPlan {
  return {
    contexts: (manifest.supportedContexts ?? []).map(({ contextKey, entityType }) => ({ contextKey, entityType })),
    events: (manifest.supportedEvents ?? []).map((event) => event.id),
    ops: buildRunnableOps(manifest),
  };
}

export function initialAutoRunnerState(): AutoRunnerState {
  return {
    contextStore: {},
    events: [],
    results: { reads: {}, writes: {}, writebacks: {} },
    log: [],
    autoRunDisruptive: false,
  };
}

export function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

function now(): string {
  return new Date().toLocaleTimeString();
}

function isFailure(result: unknown): boolean {
  return !!result && typeof result === 'object' && (result as { success?: boolean }).success === false;
}

function parseLoose(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function buildNestedFromPath(path: string, value: unknown): Record<string, unknown> {
  return path.split('.').reduceRight<Record<string, unknown>>((acc, key) => ({ [key]: acc }), value as Record<string, unknown>);
}

export function createAutoRunnerEngine(
  plan: AutoRunnerPlan,
  surface: AutoRunnerSurface,
  onState: (state: AutoRunnerState) => void,
): AutoRunnerEngine {
  let state = initialAutoRunnerState();
  let stopped = false;
  let eventSeq = 0;
  const firedFingerprints: Record<string, string> = {};
  const unsubscribes: Array<() => void> = [];
  const readOps = plan.ops.filter((op) => op.isRead);

  function update(next: (prev: AutoRunnerState) => AutoRunnerState) {
    if (stopped) return;
    state = next(state);
    onState(state);
  }

  function log(message: string, tone: LogTone) {
    update((s) => ({ ...s, log: [{ at: now(), message, tone }, ...s.log].slice(0, MAX_LOG_ROWS) }));
  }

  function setResult(section: ResultSection, key: string, result: OpResult) {
    update((s) => ({ ...s, results: { ...s.results, [section]: { ...s.results[section], [key]: result } } }));
  }

  async function callOp(section: 'reads' | 'writes', op: RunnableOp, args: unknown[], source: 'auto' | 'manual') {
    if (stopped) return;
    const argsLabel = args.map((a) => JSON.stringify(a)).join(', ');
    setResult(section, op.key, { state: 'running', at: now(), argsLabel });
    log(`${source === 'auto' ? 'auto ▸' : 'run ▸'} ehr.api.${op.key}(${argsLabel})`, 'info');
    try {
      const result = await surface.callApi(op, args, log);
      const failed = isFailure(result);
      setResult(section, op.key, { state: failed ? 'error' : 'ok', at: now(), argsLabel, result });
      log(failed ? `${op.key} returned success:false` : `${op.key} ✓`, failed ? 'error' : 'success');
    } catch (err) {
      const message = errorMessage(err);
      setResult(section, op.key, { state: 'error', at: now(), argsLabel, error: message });
      log(`${op.key} failed: ${message}`, 'error');
    }
  }

  async function writeback(target: WritebackTarget, value: string, mode: WritebackMode) {
    if (stopped) return;
    const key = `${target.entity}.${target.field}`;
    setResult('writebacks', key, { state: 'running', at: now() });
    log(`writeback ▸ ${key} = ${value} (${mode})`, 'info');
    try {
      const result = await surface.writeback(target, buildNestedFromPath(target.field, parseLoose(value)), mode, log);
      const failed = isFailure(result);
      setResult('writebacks', key, { state: failed ? 'error' : 'ok', at: now(), result });
      log(failed ? `writeback ${key} failed` : `writeback ${key} ✓`, failed ? 'error' : 'success');
    } catch (err) {
      const message = errorMessage(err);
      setResult('writebacks', key, { state: 'error', at: now(), error: message });
      log(`writeback ${key} failed: ${message}`, 'error');
    }
  }

  function autoFire() {
    for (const op of readOps) {
      const binding = resolveBinding(op, state.contextStore);
      if (shouldFire(op, binding, { autoRunDisruptive: state.autoRunDisruptive, lastFingerprint: firedFingerprints[op.key] })) {
        firedFingerprints[op.key] = binding.fingerprint;
        void callOp('reads', op, [binding.args], 'auto');
      }
    }
  }

  function setContext(entityType: string, current: ContextData | null) {
    update((s) => {
      const contextStore = { ...s.contextStore };
      if (current) contextStore[entityType] = { entityType, id: extractEntityId(current), data: current, at: now() };
      else delete contextStore[entityType];
      return { ...s, contextStore };
    });
    autoFire();
  }

  function addEvent(event: WorkflowEvent) {
    eventSeq += 1;
    const row: EventRow = { id: eventSeq, type: event.type, at: now(), event };
    update((s) => ({ ...s, events: [row, ...s.events].slice(0, MAX_EVENTS) }));
    log(`event ${event.type}`, 'success');
  }

  function watch(label: string, subscribe: () => () => void) {
    try {
      unsubscribes.push(subscribe());
    } catch (err) {
      log(`${label} not subscribable: ${errorMessage(err)}`, 'error');
    }
  }

  function findOp(opKey: string): RunnableOp | undefined {
    return plan.ops.find((op) => op.key === opKey);
  }

  return {
    start() {
      log(`watching — ${plan.events.length} events, ${plan.contexts.length} contexts, ${plan.ops.length} operations`, 'success');
      for (const { contextKey, entityType } of plan.contexts) {
        watch(`context ${contextKey}`, () => surface.watchContext(contextKey, (current) => setContext(entityType, current)));
      }
      for (const eventType of plan.events) {
        watch(`event ${eventType}`, () => surface.watchEvent(eventType, addEvent));
      }
    },
    stop() {
      stopped = true;
      for (const unsubscribe of unsubscribes.splice(0)) {
        try {
          unsubscribe();
        } catch {}
      }
    },
    runRead(opKey) {
      const op = findOp(opKey);
      if (op) void callOp('reads', op, [resolveBinding(op, state.contextStore).args], 'manual');
    },
    runWrite(opKey, payloadText) {
      const op = findOp(opKey);
      if (!op) return;
      let payload: unknown;
      try {
        payload = JSON.parse(payloadText);
      } catch {
        setResult('writes', op.key, { state: 'error', at: now(), error: 'Payload is not valid JSON' });
        log(`${op.key}: payload is not valid JSON`, 'error');
        return;
      }
      const args = op.kind === 'create' ? [payload] : [resolveBinding(op, state.contextStore).args, payload];
      void callOp('writes', op, args, 'manual');
    },
    runWriteback(target, value, mode) {
      void writeback(target, value, mode);
    },
    setAutoRunDisruptive(value) {
      update((s) => ({ ...s, autoRunDisruptive: value }));
      autoFire();
    },
  };
}
