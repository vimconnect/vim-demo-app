import { describe, it, expect, vi } from 'vitest';
import type {
  ContextData,
  ContextWritebackNamespace,
  EhrContextHandleNamespace,
  HookDeclaration,
  InvalidationReason,
  SuggestWritebackOptions,
  WorkerContextCallback,
  WorkerContextHandle,
  WorkerHandleApi,
  WorkerSDK,
} from '@vimconnect/app-sdk';
import type { AutoRunnerPlan } from './auto-runner-engine';
import type { RunnableOp } from './capability-engine';
import { serveOffscreenAutoRunner } from './offscreen-auto-runner';
import {
  AUTO_RUNNER_COMMAND_EVENT,
  AUTO_RUNNER_CONTEXT_KEY,
  AUTO_RUNNER_STATUS_KEY,
  RESULT_BUCKET_COUNT,
  mergeBuckets,
  resultBucketKey,
  resultBucketOf,
  type AutoRunnerCommand,
} from './offscreen-auto-runner-protocol';

describe('offscreen auto-runner (Worker App side)', () => {
  it('reports itself idle once it can take commands', () => {
    const worker = fakeWorker();

    serveOffscreenAutoRunner(worker.sdk);

    expect(worker.published(AUTO_RUNNER_STATUS_KEY)).toEqual({ runId: null, autoRunDisruptive: false, relayErrors: [] });
    expect(worker.sdk.appEvents?.on).toHaveBeenCalledWith(AUTO_RUNNER_COMMAND_EVENT, expect.any(Function));
  });

  it('runs the plan the UI App sends and publishes the context it sees', () => {
    const worker = fakeWorker();
    serveOffscreenAutoRunner(worker.sdk);

    worker.send({ type: 'start', runId: 'run-1', plan: patientPlan([]) });
    worker.openContext('chart_open:patient', context('patient', 'p1'), fakeHandle({}).handle);

    expect(worker.published(AUTO_RUNNER_STATUS_KEY)).toEqual({ runId: 'run-1', autoRunDisruptive: false, relayErrors: [] });
    expect(worker.published(AUTO_RUNNER_CONTEXT_KEY)).toMatchObject({ patient: { id: 'p1' } });
  });

  it("fires a read through the handle of the context change that bound it", async () => {
    const worker = fakeWorker();
    serveOffscreenAutoRunner(worker.sdk);
    const getPatient = vi.fn(async () => ({ success: true, data: { id: 'p1' } }));

    worker.send({ type: 'start', runId: 'run-1', plan: patientPlan([read('patient.getPatient', ['patientId'])]) });
    worker.openContext('chart_open:patient', context('patient', 'p1'), fakeHandle({ patient: { getPatient } }).handle);
    await settle();

    expect(getPatient).toHaveBeenCalledWith({ patientId: 'p1' });
    expect(worker.results().reads['patient.getPatient']).toMatchObject({ state: 'ok', result: { success: true } });
  });

  it("reports an operation the worker handle's api does not carry", async () => {
    const worker = fakeWorker();
    serveOffscreenAutoRunner(worker.sdk);

    worker.send({ type: 'start', runId: 'run-1', plan: patientPlan([read('patient.searchPatients', [], { kind: 'search' })]) });
    worker.openContext('chart_open:patient', context('patient', 'p1'), fakeHandle({}).handle);
    await settle();

    expect(worker.results().reads['patient.searchPatients']).toMatchObject({
      state: 'error',
      error: "Not on the chart_open:patient handle's api",
    });
  });

  it('reports a call made after every handle ended, naming how the last one ended', async () => {
    const worker = fakeWorker();
    serveOffscreenAutoRunner(worker.sdk);
    const { handle, invalidate } = fakeHandle({ patient: { getPatient: vi.fn(async () => ({ success: true })) } });

    worker.send({ type: 'start', runId: 'run-1', plan: patientPlan([read('patient.getPatient', ['patientId'])]) });
    worker.openContext('chart_open:patient', context('patient', 'p1'), handle);
    await settle();
    invalidate('superseded');
    worker.send({ type: 'runRead', opKey: 'patient.getPatient' });
    await settle();

    expect(worker.results().reads['patient.getPatient']).toMatchObject({
      state: 'error',
      error: 'No live worker handle — the chart_open:patient handle ended: superseded',
    });
  });

  it('writes back by suggesting it to the provider, and records the write once granted', async () => {
    const worker = fakeWorker();
    serveOffscreenAutoRunner(worker.sdk);
    const { handle, suggestions } = fakeHandle({});
    const update = vi.fn<ContextWritebackNamespace['update']>(async () => ({ success: true }));

    worker.send({ type: 'start', runId: 'run-1', plan: patientPlan([]) });
    worker.openContext('chart_open:patient', context('patient', 'p1'), handle);
    worker.send({ type: 'runWriteback', target: { entity: 'patient', field: 'notes', disruptive: false }, value: 'hi', mode: 'override' });
    await suggestions[0].onGranted({ ehr: { patient: writebackNamespace(update) } });
    await settle();

    expect(suggestions[0]).toMatchObject({ entity: 'patient', fields: ['notes'] });
    expect(update).toHaveBeenCalledWith({ notes: 'hi' }, { mode: 'override' });
    expect(worker.results().writebacks['patient.notes']).toMatchObject({ state: 'ok' });
  });

  it('records suggestWriteback refusing to run while the UI App is open', async () => {
    const worker = fakeWorker();
    serveOffscreenAutoRunner(worker.sdk);
    const { handle } = fakeHandle({}, { suggestWritebackThrows: 'suggestWriteback() cannot be called while the UI App is open' });

    worker.send({ type: 'start', runId: 'run-1', plan: patientPlan([]) });
    worker.openContext('chart_open:patient', context('patient', 'p1'), handle);
    worker.send({ type: 'runWriteback', target: { entity: 'patient', field: 'notes', disruptive: false }, value: 'hi', mode: 'override' });
    await settle();

    expect(worker.results().writebacks['patient.notes']).toMatchObject({
      state: 'error',
      error: 'suggestWriteback() cannot be called while the UI App is open',
    });
  });

  it('publishes a result too large for workerState as an error rather than dropping it', async () => {
    const worker = fakeWorker();
    serveOffscreenAutoRunner(worker.sdk);
    const huge = 'x'.repeat(WORKER_STATE_MAX_BYTES);

    worker.send({ type: 'start', runId: 'run-1', plan: patientPlan([read('patient.getPatient', ['patientId'])]) });
    worker.openContext(
      'chart_open:patient',
      context('patient', 'p1'),
      fakeHandle({ patient: { getPatient: async () => ({ success: true, data: huge }) } }).handle,
    );
    await settle();

    expect(worker.results().reads['patient.getPatient']).toMatchObject({
      state: 'error',
      error: expect.stringContaining('Result not relayed to the UI App'),
    });
  });

  it('keeps the other results in a bucket when one of them is too large to relay', async () => {
    const worker = fakeWorker();
    serveOffscreenAutoRunner(worker.sdk);
    const [small, large] = twoKeysInOneBucket('patient');
    const huge = 'x'.repeat(WORKER_STATE_MAX_BYTES);

    worker.send({
      type: 'start',
      runId: 'run-1',
      plan: patientPlan([read(`patient.${small}`, ['patientId']), read(`patient.${large}`, ['patientId'])]),
    });
    worker.openContext(
      'chart_open:patient',
      context('patient', 'p1'),
      fakeHandle({
        patient: {
          [small]: async () => ({ success: true, data: { id: 'p1' } }),
          [large]: async () => ({ success: true, data: huge }),
        },
      }).handle,
    );
    await settle();

    expect(worker.results().reads[`patient.${small}`]).toMatchObject({ state: 'ok', result: { success: true } });
    expect(worker.results().reads[`patient.${large}`]).toMatchObject({ state: 'error', error: expect.stringContaining('not relayed') });
  });

  it('strips a result that cannot be serialized and keeps the rest', async () => {
    const worker = fakeWorker();
    serveOffscreenAutoRunner(worker.sdk);
    const [small, circular] = twoKeysInOneBucket('patient');
    const loop: Record<string, unknown> = {};
    loop.self = loop;

    worker.send({
      type: 'start',
      runId: 'run-1',
      plan: patientPlan([read(`patient.${small}`, ['patientId']), read(`patient.${circular}`, ['patientId'])]),
    });
    worker.openContext(
      'chart_open:patient',
      context('patient', 'p1'),
      fakeHandle({
        patient: {
          [small]: async () => ({ success: true, data: { id: 'p1' } }),
          [circular]: async () => ({ success: true, data: loop }),
        },
      }).handle,
    );
    await settle();

    expect(worker.results().reads[`patient.${small}`]).toMatchObject({ state: 'ok' });
    expect(worker.results().reads[`patient.${circular}`]).toMatchObject({ state: 'error', error: expect.stringContaining('unserializable') });
  });

  it('reports a refusal that is not about size without stripping the results it refused', async () => {
    const refusedBucket = resultBucketKey(resultBucketOf('reads', 'patient.getPatient'));
    const worker = fakeWorker({ refuse: (key) => (key === refusedBucket ? 'max 30 keys per app scope reached' : null) });
    serveOffscreenAutoRunner(worker.sdk);

    worker.send({ type: 'start', runId: 'run-1', plan: patientPlan([read('patient.getPatient', ['patientId'])]) });
    worker.openContext(
      'chart_open:patient',
      context('patient', 'p1'),
      fakeHandle({ patient: { getPatient: async () => ({ success: true, data: { id: 'p1' } }) } }).handle,
    );
    await settle();

    const attempts = vi.mocked(worker.sdk.workerState.write).mock.calls.filter(([key]) => key === refusedBucket);
    expect(attempts.map(([, value]) => JSON.stringify(value))).not.toContainEqual(expect.stringContaining('not relayed'));
    expect(worker.published(AUTO_RUNNER_STATUS_KEY)).toMatchObject({
      relayErrors: [`${refusedBucket}: max 30 keys per app scope reached`],
    });
  });

  it('tells the UI App which of its state could not be relayed', () => {
    const worker = fakeWorker();
    serveOffscreenAutoRunner(worker.sdk);
    const hugeContext: ContextData = { ...context('patient', 'p1'), fields: { notes: 'x'.repeat(WORKER_STATE_MAX_BYTES) } };

    worker.send({ type: 'start', runId: 'run-1', plan: patientPlan([]) });
    worker.openContext('chart_open:patient', hugeContext, fakeHandle({}).handle);

    expect(worker.published(AUTO_RUNNER_STATUS_KEY)).toMatchObject({
      runId: 'run-1',
      relayErrors: [expect.stringContaining(`${AUTO_RUNNER_CONTEXT_KEY}: workerState value exceeds max size`)],
    });
  });

  it('ignores a command that is missing what its type requires', () => {
    const worker = fakeWorker();
    serveOffscreenAutoRunner(worker.sdk);

    worker.sendRaw({ type: 'start', runId: 'run-1' });

    expect(worker.sdk.ehr.context.register).not.toHaveBeenCalled();
  });

  it('stops the run and clears what it published when the UI App leaves offscreen mode', () => {
    const worker = fakeWorker();
    serveOffscreenAutoRunner(worker.sdk);

    worker.send({ type: 'start', runId: 'run-1', plan: patientPlan([]) });
    worker.openContext('chart_open:patient', context('patient', 'p1'), fakeHandle({}).handle);
    worker.send({ type: 'stop', runId: 'run-1' });

    expect(worker.published(AUTO_RUNNER_CONTEXT_KEY)).toBeUndefined();
    expect(worker.published(AUTO_RUNNER_STATUS_KEY)).toEqual({ runId: null, autoRunDisruptive: false, relayErrors: [] });
    expect(worker.registeredContexts()).toEqual([]);
  });

  it('ignores a stop meant for a run it is no longer serving', () => {
    const worker = fakeWorker();
    serveOffscreenAutoRunner(worker.sdk);

    worker.send({ type: 'start', runId: 'run-2', plan: patientPlan([]) });
    worker.send({ type: 'stop', runId: 'run-1' });

    expect(worker.published(AUTO_RUNNER_STATUS_KEY)).toEqual({ runId: 'run-2', autoRunDisruptive: false, relayErrors: [] });
  });

  it('keeps one run per UI App run id', () => {
    const worker = fakeWorker();
    serveOffscreenAutoRunner(worker.sdk);

    worker.send({ type: 'start', runId: 'run-1', plan: patientPlan([]) });
    worker.send({ type: 'start', runId: 'run-1', plan: patientPlan([]) });

    expect(worker.sdk.ehr.context.register).toHaveBeenCalledTimes(1);
  });
});

// ── Test infrastructure ─────────────────────────────────────────────────────

const WORKER_STATE_MAX_BYTES = 204_800;

type ContextListener = (current: ContextData | null, handle: WorkerContextHandle) => void;
type FakeApi = Record<string, Record<string, (params?: Record<string, unknown>) => Promise<unknown>>>;

function patientPlan(ops: RunnableOp[]): AutoRunnerPlan {
  return { contexts: [{ contextKey: 'chart_open:patient', entityType: 'patient' }], events: [], ops };
}

function fakeWorker(options: { refuse?: (key: string) => string | null } = {}) {
  const store = new Map<string, unknown>();
  const contexts = new Map<string, ContextListener>();
  let onCommand: (payload: unknown) => void = () => {};

  const sdk: WorkerSDK = {
    ehr: {
      context: {
        register: vi.fn(<T,>(key: string, _decl: HookDeclaration, cb: WorkerContextCallback<T>) => {
          contexts.set(key, (current, handle) => void cb(null, current as T | null, handle));
          return () => contexts.delete(key);
        }),
      },
      workflow: { register: vi.fn(() => () => {}) },
    },
    hub: {
      setActivationStatus: vi.fn(),
      setTooltipText: vi.fn(),
      notificationBadge: { set: vi.fn(), hide: vi.fn() },
      appState: { isAppOpen: true, subscribe: vi.fn(() => () => {}) },
    },
    workerState: {
      write: vi.fn((key: string, value: unknown) => {
        const refusal = options.refuse?.(key);
        if (refusal) throw new Error(refusal);
        if (JSON.stringify(value).length > WORKER_STATE_MAX_BYTES) {
          throw new Error(`workerState value exceeds max size of ${WORKER_STATE_MAX_BYTES} bytes`);
        }
        store.set(key, value);
      }),
      remove: vi.fn((key: string) => {
        store.delete(key);
      }),
    },
    appEvents: {
      on: vi.fn(<T,>(_name: string, cb: (payload: T) => void) => {
        onCommand = (payload) => cb(payload as T);
        return () => {};
      }),
    },
    sessionContext: null,
    manifestVersion: null,
  };

  return {
    sdk,
    send: (command: AutoRunnerCommand) => onCommand(command),
    sendRaw: (payload: unknown) => onCommand(payload),
    openContext: (key: string, data: ContextData | null, handle: WorkerContextHandle) => contexts.get(key)?.(data, handle),
    registeredContexts: () => [...contexts.keys()],
    published: (key: string) => store.get(key),
    results: () =>
      mergeBuckets(
        Array.from({ length: RESULT_BUCKET_COUNT }, (_, bucket) => {
          const contents = store.get(resultBucketKey(bucket));
          return contents && typeof contents === 'object' ? (contents as ReturnType<typeof mergeBuckets>) : null;
        }),
      ),
  };
}

function fakeHandle(api: FakeApi, options: { suggestWritebackThrows?: string } = {}) {
  let valid = true;
  const listeners: Array<(reason: InvalidationReason) => void> = [];
  const suggestions: SuggestWritebackOptions[] = [];
  const lifecycle = {
    isValid: () => valid,
    onInvalidated: (cb: (reason: InvalidationReason) => void) => {
      listeners.push(cb);
      return () => {};
    },
  };
  const context: EhrContextHandleNamespace = {
    ...lifecycle,
    suggestWriteback: (suggestion) => {
      if (options.suggestWritebackThrows) throw new Error(options.suggestWritebackThrows);
      suggestions.push(suggestion);
    },
  };
  // A fake carries only the operations its test names, not every read the pinned collection types.
  const handleApi = { ...lifecycle, ...api } as WorkerHandleApi;
  const handle: WorkerContextHandle = { close: () => {}, api: handleApi, ehr: { context } };
  return {
    handle,
    suggestions,
    invalidate: (reason: InvalidationReason) => {
      valid = false;
      for (const cb of listeners) cb(reason);
    },
  };
}

function writebackNamespace(update: ContextWritebackNamespace['update']): ContextWritebackNamespace {
  return {
    getCapability: () => ({ available: true, disruptive: false, permissionState: 'granted' }),
    hasPermission: () => true,
    requestPermission: async () => 'granted',
    update,
  };
}

/** Two method names whose `reads` results hash into the same workerState bucket. */
function twoKeysInOneBucket(namespace: string): [string, string] {
  const first = 'getPatient';
  const target = resultBucketOf('reads', `${namespace}.${first}`);
  for (let i = 0; ; i++) {
    const candidate = `getOther${i}`;
    if (resultBucketOf('reads', `${namespace}.${candidate}`) === target) return [first, candidate];
  }
}

function read(key: string, idParameterNames: string[], overrides: Partial<RunnableOp> = {}): RunnableOp {
  const [namespace, method] = key.split('.');
  return { key, namespace, method, signature: `${key}(...)`, kind: 'getById', disruptive: false, idParameterNames, isRead: true, ...overrides };
}

function context(type: string, id: string): ContextData {
  return { id, type, identifier: { type: 'existing', id }, fields: {} };
}

function settle(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}
