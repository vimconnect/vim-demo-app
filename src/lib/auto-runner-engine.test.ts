import { describe, it, expect, vi } from 'vitest';
import type { ContextData, WorkflowEvent } from '@vimconnect/app-sdk';
import {
  createAutoRunnerEngine,
  initialAutoRunnerState,
  type AutoRunnerPlan,
  type AutoRunnerState,
  type AutoRunnerSurface,
} from './auto-runner-engine';
import type { RunnableOp } from './capability-engine';

describe('auto-runner engine', () => {
  describe('context', () => {
    it('holds each entity in context under its entity type', () => {
      const { surface, openContext } = fakeSurface();
      const { state } = startEngine(plan({ contexts: [{ contextKey: 'chart_open:patient', entityType: 'patient' }] }), surface);

      openContext('chart_open:patient', context('patient', 'p1'));

      expect(state().contextStore.patient).toMatchObject({ entityType: 'patient', id: 'p1' });
    });

    it('drops an entity when its context clears', () => {
      const { surface, openContext } = fakeSurface();
      const { state } = startEngine(plan({ contexts: [{ contextKey: 'chart_open:patient', entityType: 'patient' }] }), surface);

      openContext('chart_open:patient', context('patient', 'p1'));
      openContext('chart_open:patient', null);

      expect(state().contextStore.patient).toBeUndefined();
    });

    it('logs a context or event its surface cannot subscribe to, and keeps watching the rest', () => {
      const { surface } = fakeSurface();
      surface.watchEvent.mockImplementation(() => {
        throw new Error('event not granted');
      });
      const { state } = startEngine(
        plan({ contexts: [{ contextKey: 'chart_open:patient', entityType: 'patient' }], events: ['order_sign'] }),
        surface,
      );

      expect(state().log.map((row) => row.message)).toContain('event order_sign not subscribable: event not granted');
      expect(surface.watchContext).toHaveBeenCalledWith('chart_open:patient', expect.any(Function));
    });
  });

  describe('events', () => {
    it('lists workflow events newest first', () => {
      const { surface, fireEvent } = fakeSurface();
      const { state } = startEngine(plan({ events: ['order_select', 'order_sign'] }), surface);

      fireEvent('order_select', workflowEvent('order_select'));
      fireEvent('order_sign', workflowEvent('order_sign'));

      expect(state().events.map((row) => row.type)).toEqual(['order_sign', 'order_select']);
    });
  });

  describe('auto reads', () => {
    it('fires a read the moment the context supplies its inputs', async () => {
      const { surface, openContext } = fakeSurface();
      const getPatient = read('patient.getPatient', ['patientId']);
      const { state } = startEngine(plan({ contexts: [patientContext], ops: [getPatient] }), surface);

      openContext('chart_open:patient', context('patient', 'p1'));
      await settle();

      expect(surface.callApi).toHaveBeenCalledWith(getPatient, [{ patientId: 'p1' }], expect.any(Function));
      expect(state().results.reads['patient.getPatient']).toMatchObject({ state: 'ok', result: { success: true, data: {} } });
    });

    it('fires once per bound input, and again when the input changes', async () => {
      const { surface, openContext } = fakeSurface();
      startEngine(plan({ contexts: [patientContext], ops: [read('patient.getPatient', ['patientId'])] }), surface);

      openContext('chart_open:patient', context('patient', 'p1'));
      openContext('chart_open:patient', context('patient', 'p1'));
      openContext('chart_open:patient', context('patient', 'p2'));
      await settle();

      expect(surface.callApi.mock.calls.map(([, args]) => args)).toEqual([[{ patientId: 'p1' }], [{ patientId: 'p2' }]]);
    });

    it('holds a disruptive read until auto-running disruptive reads is turned on', async () => {
      const { surface, openContext } = fakeSurface();
      const { engine } = startEngine(
        plan({ contexts: [patientContext], ops: [read('patient.getChart', ['patientId'], { disruptive: true })] }),
        surface,
      );

      openContext('chart_open:patient', context('patient', 'p1'));
      await settle();
      expect(surface.callApi).not.toHaveBeenCalled();

      engine.setAutoRunDisruptive(true);
      await settle();
      expect(surface.callApi).toHaveBeenCalledTimes(1);
    });

    it("records the surface's refusal as the read's error", async () => {
      const { surface, openContext } = fakeSurface();
      surface.callApi.mockRejectedValue(new Error('No live worker handle'));
      const { state } = startEngine(plan({ contexts: [patientContext], ops: [read('patient.getPatient', ['patientId'])] }), surface);

      openContext('chart_open:patient', context('patient', 'p1'));
      await settle();

      expect(state().results.reads['patient.getPatient']).toMatchObject({ state: 'error', error: 'No live worker handle' });
    });

    it('marks a success:false response as an error and keeps the response', async () => {
      const { surface, openContext } = fakeSurface();
      surface.callApi.mockResolvedValue({ success: false, error: 'PERMISSION_DENIED' });
      const { state } = startEngine(plan({ contexts: [patientContext], ops: [read('patient.getPatient', ['patientId'])] }), surface);

      openContext('chart_open:patient', context('patient', 'p1'));
      await settle();

      expect(state().results.reads['patient.getPatient']).toMatchObject({
        state: 'error',
        result: { success: false, error: 'PERMISSION_DENIED' },
      });
    });
  });

  describe('writes', () => {
    it('calls an update with the bound ids and the parsed payload', async () => {
      const { surface, openContext } = fakeSurface();
      const update = write('encounter.updateNotes', 'updateById', ['encounterId']);
      const { engine } = startEngine(plan({ contexts: [encounterContext], ops: [update] }), surface);

      openContext('encounter_open:encounter', context('encounter', 'e1'));
      engine.runWrite('encounter.updateNotes', '{"notes":"hi"}');
      await settle();

      expect(surface.callApi).toHaveBeenCalledWith(update, [{ encounterId: 'e1' }, { notes: 'hi' }], expect.any(Function));
    });

    it('refuses a payload that is not JSON without calling the surface', () => {
      const { surface } = fakeSurface();
      const { engine, state } = startEngine(plan({ ops: [write('patient.createPatient', 'create', [])] }), surface);

      engine.runWrite('patient.createPatient', '{nope');

      expect(surface.callApi).not.toHaveBeenCalled();
      expect(state().results.writes['patient.createPatient']).toMatchObject({ state: 'error', error: 'Payload is not valid JSON' });
    });
  });

  describe('context writeback', () => {
    it('writes the field as a nested object, parsing a JSON value', async () => {
      const { surface } = fakeSurface();
      const { engine, state } = startEngine(plan({}), surface);
      const target = { entity: 'encounter', field: 'subjective.notes', disruptive: false };

      engine.runWriteback(target, '["a"]', 'append');
      await settle();

      expect(surface.writeback).toHaveBeenCalledWith(target, { subjective: { notes: ['a'] } }, 'append', expect.any(Function));
      expect(state().results.writebacks['encounter.subjective.notes']).toMatchObject({ state: 'ok' });
    });

    it('writes a value that is not JSON as plain text', async () => {
      const { surface } = fakeSurface();
      const { engine } = startEngine(plan({}), surface);

      engine.runWriteback({ entity: 'encounter', field: 'notes', disruptive: false }, 'plain words', 'override');
      await settle();

      expect(surface.writeback).toHaveBeenCalledWith(expect.anything(), { notes: 'plain words' }, 'override', expect.any(Function));
    });
  });

  describe('stopping', () => {
    it('unsubscribes everything and reports nothing after it stops', async () => {
      const { surface, openContext, unsubscribed } = fakeSurface();
      let resolveRead: (value: unknown) => void = () => {};
      surface.callApi.mockReturnValue(new Promise((resolve) => (resolveRead = resolve)));
      const { engine, state } = startEngine(plan({ contexts: [patientContext], ops: [read('patient.getPatient', ['patientId'])] }), surface);

      openContext('chart_open:patient', context('patient', 'p1'));
      engine.stop();
      resolveRead({ success: true });
      await settle();

      expect(unsubscribed).toEqual(['chart_open:patient']);
      expect(state().results.reads['patient.getPatient']?.state).toBe('running');
    });

    it('makes no SDK calls once stopped', async () => {
      const { surface, openContext } = fakeSurface();
      const { engine } = startEngine(
        plan({ contexts: [encounterContext], ops: [write('encounter.updateNotes', 'updateById', ['encounterId'])] }),
        surface,
      );

      openContext('encounter_open:encounter', context('encounter', 'e1'));
      engine.stop();
      engine.runWrite('encounter.updateNotes', '{}');
      engine.runWriteback({ entity: 'encounter', field: 'notes', disruptive: false }, 'x', 'override');
      await settle();

      expect(surface.callApi).not.toHaveBeenCalled();
      expect(surface.writeback).not.toHaveBeenCalled();
    });
  });
});

// ── Test infrastructure ─────────────────────────────────────────────────────

const patientContext = { contextKey: 'chart_open:patient', entityType: 'patient' };
const encounterContext = { contextKey: 'encounter_open:encounter', entityType: 'encounter' };

function plan(partial: Partial<AutoRunnerPlan>): AutoRunnerPlan {
  return { contexts: [], events: [], ops: [], ...partial };
}

function startEngine(runPlan: AutoRunnerPlan, surface: AutoRunnerSurface) {
  let latest: AutoRunnerState = initialAutoRunnerState();
  const engine = createAutoRunnerEngine(runPlan, surface, (next) => {
    latest = next;
  });
  engine.start();
  return { engine, state: () => latest };
}

function fakeSurface() {
  const contextListeners = new Map<string, (current: ContextData | null) => void>();
  const eventListeners = new Map<string, (event: WorkflowEvent) => void>();
  const unsubscribed: string[] = [];
  const surface = {
    watchContext: vi.fn<AutoRunnerSurface['watchContext']>((contextKey, onChange) => {
      contextListeners.set(contextKey, onChange);
      return () => unsubscribed.push(contextKey);
    }),
    watchEvent: vi.fn<AutoRunnerSurface['watchEvent']>((eventType, onEvent) => {
      eventListeners.set(eventType, onEvent);
      return () => unsubscribed.push(eventType);
    }),
    callApi: vi.fn<AutoRunnerSurface['callApi']>(async () => ({ success: true, data: {} })),
    writeback: vi.fn<AutoRunnerSurface['writeback']>(async () => ({ success: true })),
  };
  return {
    surface,
    unsubscribed,
    openContext: (contextKey: string, data: ContextData | null) => contextListeners.get(contextKey)?.(data),
    fireEvent: (eventType: string, event: WorkflowEvent) => eventListeners.get(eventType)?.(event),
  };
}

function read(key: string, idParameterNames: string[], overrides: Partial<RunnableOp> = {}): RunnableOp {
  const [namespace, method] = key.split('.');
  return { key, namespace, method, signature: `${key}(...)`, kind: 'getById', disruptive: false, idParameterNames, isRead: true, ...overrides };
}

function write(key: string, kind: 'updateById' | 'create', idParameterNames: string[]): RunnableOp {
  const [namespace, method] = key.split('.');
  return { key, namespace, method, signature: `${key}(...)`, kind, disruptive: false, idParameterNames, isRead: false };
}

function context(type: string, id: string): ContextData {
  return { id, type, identifier: { type: 'existing', id }, fields: {} };
}

function workflowEvent(type: string): WorkflowEvent {
  return { type, timestamp: 0, entities: {}, metadata: { componentId: 'c', trigger: 't', systemId: 's', timestamp: 0 } };
}

function settle(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}
