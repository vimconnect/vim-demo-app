'use client';

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { AppManifest, VimSDK } from '@vimconnect/app-sdk';
import { DeprecatedTag } from '@/components/DeprecatedTag';
import { Hint } from '@/components/Hint';
import { RawOutput } from '@/components/RawOutput';
import { annotatedLines, apiResultAnnotator, contextAnnotator, noteOf, workflowEventAnnotator, type JsonLine } from '@/lib/annotated-json';
import {
  asEntityObject,
  buildMissingOps,
  computeCompleteness,
  entityFieldsByType,
  resolveBinding,
  withMissingFields,
  type Binding,
  type ContextStore,
  type RunnableOp,
} from '@/lib/capability-engine';
import {
  buildAutoRunnerPlan,
  createAutoRunnerEngine,
  errorMessage,
  initialAutoRunnerState,
  type AutoRunnerActions,
  type AutoRunnerEngine,
  type AutoRunnerPlan,
  type AutoRunnerState,
  type EventRow,
  type LogRow,
  type OpResult,
  type OpState,
  type Results,
  type WritebackMode,
  type WritebackTarget,
} from '@/lib/auto-runner-engine';
import { createAppSurface } from '@/lib/auto-runner-surfaces';
import {
  AUTO_RUNNER_COMMAND_EVENT,
  AUTO_RUNNER_CONTEXT_KEY,
  AUTO_RUNNER_EVENTS_KEY,
  AUTO_RUNNER_LOG_KEY,
  AUTO_RUNNER_STATUS_KEY,
  RESULT_BUCKET_COUNT,
  mergeBuckets,
  resultBucketKey,
  type AutoRunnerCommand,
  type AutoRunnerStatus,
} from '@/lib/offscreen-auto-runner-protocol';

type OperationEntry = NonNullable<AppManifest['operations']>[number];

type RunnerMode = 'app' | 'offscreen';

type WorkerPhase = 'waiting' | 'starting' | 'running';

interface AutoRunner extends AutoRunnerActions {
  state: AutoRunnerState;
}

type CapabilityAutoRunnerProps = {
  /** An already-initialized SDK session — the host page owns OAuth/init. */
  sdk: VimSDK;
  manifest: AppManifest;
  /** Switch back to the classic demo. When set, a control renders in the header. */
  onSwitchMode?: () => void;
};

type RunnerChrome = {
  manifest: AppManifest;
  plan: AutoRunnerPlan;
  mode: RunnerMode;
  onModeChange: (mode: RunnerMode) => void;
  offscreenUnavailable: string | null;
  onSwitchMode?: () => void;
};

function writeFieldsHint(entry: OperationEntry | undefined): string {
  const meta = entry?.metadata;
  if (!meta) return '';
  if (meta.type === 'updateById') return meta.updateableFields.join(', ');
  if (meta.type === 'create') return [...meta.requiredFields, ...meta.optionalFields.map((f) => `${f}?`)].join(', ');
  return '';
}


export function CapabilityAutoRunner({ sdk, manifest, onSwitchMode }: CapabilityAutoRunnerProps) {
  const [mode, setMode] = useState<RunnerMode>('app');
  const plan = useMemo(() => buildAutoRunnerPlan(manifest), [manifest]);
  const chrome: RunnerChrome = {
    manifest,
    plan,
    mode,
    onModeChange: setMode,
    offscreenUnavailable: sdk.appEvents ? null : 'This extension does not support appEvents, so the UI App cannot reach its Worker App',
    onSwitchMode,
  };
  return mode === 'app' ? <AppAutoRunner sdk={sdk} {...chrome} /> : <OffscreenAutoRunner sdk={sdk} {...chrome} />;
}

function AppAutoRunner({ sdk, ...chrome }: RunnerChrome & { sdk: VimSDK }) {
  const runner = useAppAutoRunner(sdk, chrome.plan);
  return <AutoRunnerView runner={runner} {...chrome} />;
}

function OffscreenAutoRunner({ sdk, ...chrome }: RunnerChrome & { sdk: VimSDK }) {
  const { runner, phase, error, relayErrors } = useOffscreenAutoRunner(sdk, chrome.plan);
  return (
    <AutoRunnerView runner={runner} {...chrome} notice={<WorkerNotice phase={phase} error={error} relayErrors={relayErrors} />} />
  );
}

function useAppAutoRunner(sdk: VimSDK, plan: AutoRunnerPlan): AutoRunner {
  const [state, setState] = useState(initialAutoRunnerState);
  const engineRef = useRef<AutoRunnerEngine | null>(null);

  useEffect(() => {
    const engine = createAutoRunnerEngine(plan, createAppSurface(sdk), setState);
    engineRef.current = engine;
    engine.start();
    return () => engine.stop();
  }, [sdk, plan]);

  const actions = useMemo<AutoRunnerActions>(
    () => ({
      runRead: (opKey) => engineRef.current?.runRead(opKey),
      runWrite: (opKey, payloadText) => engineRef.current?.runWrite(opKey, payloadText),
      runWriteback: (target, value, mode) => engineRef.current?.runWriteback(target, value, mode),
      setAutoRunDisruptive: (value) => engineRef.current?.setAutoRunDisruptive(value),
    }),
    [],
  );
  return { state, ...actions };
}

/** Drives a run inside the Worker App: commands go out over appEvents, its state comes back over workerState. */
function useOffscreenAutoRunner(
  sdk: VimSDK,
  plan: AutoRunnerPlan,
): { runner: AutoRunner; phase: WorkerPhase; error: string | null; relayErrors: string[] } {
  const [state, setState] = useState(initialAutoRunnerState);
  const [phase, setPhase] = useState<WorkerPhase>('waiting');
  const [error, setError] = useState<string | null>(null);
  const [relayErrors, setRelayErrors] = useState<string[]>([]);
  const sendRef = useRef<(command: AutoRunnerCommand) => void>(() => {});

  useEffect(() => {
    const appEvents = sdk.appEvents;
    if (!appEvents) return;
    const runId = crypto.randomUUID();
    const send = (command: AutoRunnerCommand) => {
      try {
        appEvents.send(AUTO_RUNNER_COMMAND_EVENT, command);
      } catch (err) {
        setError(errorMessage(err));
      }
    };
    sendRef.current = send;

    const buckets: Array<Results | null> = new Array(RESULT_BUCKET_COUNT).fill(null);
    // Preempts another UI's run at most once.
    let tookOver = false;
    const unsubscribes = [
      sdk.workerState.on<AutoRunnerStatus>(AUTO_RUNNER_STATUS_KEY, (_prev, status) => {
        if (status?.runId === runId) {
          setPhase('running');
          setRelayErrors(status.relayErrors ?? []);
          setState((s) => ({ ...s, autoRunDisruptive: status.autoRunDisruptive }));
        } else if (status?.runId == null || !tookOver) {
          tookOver = true;
          setPhase('starting');
          send({ type: 'start', runId, plan });
        }
      }),
      sdk.workerState.on<ContextStore>(AUTO_RUNNER_CONTEXT_KEY, (_prev, contextStore) =>
        setState((s) => ({ ...s, contextStore: contextStore ?? {} })),
      ),
      sdk.workerState.on<EventRow[]>(AUTO_RUNNER_EVENTS_KEY, (_prev, events) => setState((s) => ({ ...s, events: events ?? [] }))),
      sdk.workerState.on<LogRow[]>(AUTO_RUNNER_LOG_KEY, (_prev, log) => setState((s) => ({ ...s, log: log ?? [] }))),
      ...buckets.map((_, bucket) =>
        sdk.workerState.on<Results>(resultBucketKey(bucket), (_prev, contents) => {
          buckets[bucket] = contents;
          setState((s) => ({ ...s, results: mergeBuckets(buckets) }));
        }),
      ),
    ];

    return () => {
      for (const unsubscribe of unsubscribes) unsubscribe();
      send({ type: 'stop', runId });
    };
  }, [sdk, plan]);

  const actions = useMemo<AutoRunnerActions>(
    () => ({
      runRead: (opKey) => sendRef.current({ type: 'runRead', opKey }),
      runWrite: (opKey, payloadText) => sendRef.current({ type: 'runWrite', opKey, payloadText }),
      runWriteback: (target, value, mode) => sendRef.current({ type: 'runWriteback', target, value, mode }),
      setAutoRunDisruptive: (value) => sendRef.current({ type: 'setAutoRunDisruptive', value }),
    }),
    [],
  );
  return { runner: { state, ...actions }, phase, error, relayErrors };
}

function AutoRunnerView({
  runner,
  manifest,
  plan,
  mode,
  onModeChange,
  offscreenUnavailable,
  onSwitchMode,
  notice,
}: RunnerChrome & { runner: AutoRunner; notice?: ReactNode }) {
  const { contextStore, events, results, log, autoRunDisruptive } = runner.state;
  const [writePayloads, setWritePayloads] = useState<Record<string, string>>({});
  const [writebackInputs, setWritebackInputs] = useState<Record<string, { value: string; mode: WritebackMode }>>({});

  const readOps = useMemo(() => plan.ops.filter((o) => o.isRead), [plan]);
  const writeOps = useMemo(() => plan.ops.filter((o) => !o.isRead), [plan]);
  const opEntryByKey = useMemo(() => {
    const map = new Map<string, OperationEntry>();
    for (const op of manifest.operations ?? []) map.set(`${op.sdkNamespace}.${op.sdkMethod}`, op);
    return map;
  }, [manifest]);
  const writebackTargets = useMemo<WritebackTarget[]>(
    () =>
      Object.entries(manifest.contextWriteback ?? {}).flatMap(([entity, cfg]) =>
        (cfg.update?.updatableFields ?? []).map((field) => ({ entity, field, disruptive: cfg.update?.disruptive ?? false })),
      ),
    [manifest],
  );
  const entityFields = useMemo(() => entityFieldsByType(manifest), [manifest]);
  const missingReads = useMemo(() => buildMissingOps(manifest).filter((o) => o.isRead), [manifest]);
  const missingWrites = useMemo(() => buildMissingOps(manifest).filter((o) => !o.isRead), [manifest]);

  const contextEntries = Object.values(contextStore);

  return (
    <div className="xp-container">
      <header className="xp-header">
        <div className="xp-header-main">
          <h1>SDK Capability Auto-Runner</h1>
          <p className="xp-subtitle">
            {mode === 'app'
              ? 'Subscribes to every event & context, and fires each read the instant the context supplies its inputs.'
              : 'Does the same from inside the offscreen Worker App: the worker subscribes, fires the reads and runs every action, so whatever fails here is what a worker cannot do.'}
          </p>
        </div>
        <div className="xp-header-side">
          {onSwitchMode && (
            <button type="button" className="btn btn-gradient btn-sm" onClick={onSwitchMode}>
              ← Classic demo
            </button>
          )}
          <div className="mode-toggle" role="group" aria-label="Where the runner executes">
            <button
              type="button"
              className={`mode-option ${mode === 'app' ? 'active' : ''}`}
              aria-pressed={mode === 'app'}
              onClick={() => onModeChange('app')}
            >
              In app
            </button>
            <Hint text={offscreenUnavailable}>
              <button
                type="button"
                className={`mode-option ${mode === 'offscreen' ? 'active' : ''}`}
                aria-pressed={mode === 'offscreen'}
                disabled={offscreenUnavailable !== null}
                onClick={() => onModeChange('offscreen')}
              >
                Offscreen
              </button>
            </Hint>
          </div>
          <span className="status-badge">
            <span className="status-dot" /> Connected · v{manifest.version ?? '?'}
          </span>
          <label className="toggle-switch">
            <span className={`toggle-track ${autoRunDisruptive ? 'active' : ''}`} onClick={() => runner.setAutoRunDisruptive(!autoRunDisruptive)}>
              <span className="toggle-thumb" />
            </span>
            <span className="toggle-label">Auto-run disruptive reads</span>
          </label>
        </div>
      </header>

      {notice}

      <div className="xp-chips">
        <span className="xp-chip">{manifest.supportedEvents?.length ?? 0} events</span>
        <span className="xp-chip">{manifest.supportedContexts?.length ?? 0} contexts</span>
        <span className="xp-chip">{readOps.length} reads</span>
        <span className="xp-chip">{writeOps.length} writes</span>
        <span className="xp-chip">{writebackTargets.length} writeback fields</span>
        <span className="xp-chip xp-chip-live">{contextEntries.length} in context</span>
      </div>

      {/* Context */}
      <section className="xp-section">
        <h2 className="xp-section-title">Context</h2>
        {contextEntries.length === 0 ? (
          <p className="empty-state">No entities in context yet — open a chart / encounter in the EHR.</p>
        ) : (
          <div className="xp-grid">
            {contextEntries.map((entry) => (
              <div key={entry.entityType} className="xp-card">
                <div className="xp-card-head">
                  <span className="xp-card-title">{entry.entityType}</span>
                  <span className="xp-mono xp-dim">{entry.id ?? 'no id'}</span>
                </div>
                <div className="xp-card-meta">updated {entry.at}</div>
                <RawOutput
                  value={JSON.stringify(entry.data, null, 2)}
                  lines={annotatedLines(entry.data, contextAnnotator(manifest, entry.entityType))}
                  label="context data"
                  tone="success"
                />
                {/* The entity id lives at the top level of context data, not under
                    .fields — fold it in so an `id` field isn't reported missing. */}
                <CompletenessBlock allFields={entityFields[entry.entityType] ?? []} value={{ id: entry.id, ...entry.data.fields }} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Events */}
      <section className="xp-section">
        <h2 className="xp-section-title">Events</h2>
        {events.length === 0 ? (
          <p className="empty-state">Listening on all supported events — none received yet.</p>
        ) : (
          <div className="xp-grid">
            {events.map((evt) => (
              <div key={evt.id} className="xp-card">
                <div className="xp-card-head">
                  <span className="xp-card-title">{evt.type}</span>
                  <span className="xp-dim">{evt.at}</span>
                </div>
                <RawOutput
                  value={JSON.stringify(evt.event, null, 2)}
                  lines={annotatedLines(evt.event, workflowEventAnnotator(manifest, evt.type))}
                  label="event payload"
                />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Auto reads */}
      <section className="xp-section">
        <h2 className="xp-section-title">Auto Reads</h2>
        {readOps.length === 0 ? (
          <p className="empty-state">This EHR exposes no read operations.</p>
        ) : (
          <div className="xp-grid">
            {readOps.map((op) => {
              const binding = resolveBinding(op, contextStore);
              const result = results.reads[op.key];
              const entityType = opEntryByKey.get(op.key)?.entityTypeId;
              const readEntity = asEntityObject(asEntityObject(result?.result)?.data);
              return (
                <div key={op.key} className="xp-card">
                  <div className="xp-card-head">
                    <span className="xp-card-title xp-mono">
                      {op.key}
                      <DeprecatedTag note={noteOf(opEntryByKey.get(op.key)?.deprecationStatus)} />
                    </span>
                    <span className="xp-badges">
                      <span className="xp-badge xp-badge-read">{op.kind}</span>
                      {op.disruptive && <span className="xp-badge xp-badge-disruptive">disruptive</span>}
                    </span>
                  </div>
                  <BindingLine binding={binding} />
                  <div className="xp-card-foot">
                    <StateChip state={result?.state ?? 'idle'} at={result?.at} />
                    <button type="button" className="btn btn-sm" disabled={binding.status !== 'ready'} onClick={() => runner.runRead(op.key)}>
                      {result ? 'Re-run' : 'Run'}
                    </button>
                  </div>
                  <ResultOutput
                    result={result}
                    lines={
                      result?.result !== undefined && entityType
                        ? annotatedLines(result.result, apiResultAnnotator(manifest, entityType))
                        : undefined
                    }
                  />
                  {entityType && <CompletenessBlock allFields={entityFields[entityType] ?? []} value={readEntity} />}
                </div>
              );
            })}
          </div>
        )}
        <MissingOpsList ops={missingReads} />
      </section>

      {/* Actions — API writes */}
      <section className="xp-section">
        <h2 className="xp-section-title">Actions · API writes</h2>
        {writeOps.length === 0 ? (
          <p className="empty-state">This EHR exposes no write operations.</p>
        ) : (
          <div className="xp-grid">
            {writeOps.map((op) => {
              const binding = resolveBinding(op, contextStore);
              const result = results.writes[op.key];
              const hint = writeFieldsHint(opEntryByKey.get(op.key));
              return (
                <div key={op.key} className="xp-card">
                  <div className="xp-card-head">
                    <span className="xp-card-title xp-mono">
                      {op.key}
                      <DeprecatedTag note={noteOf(opEntryByKey.get(op.key)?.deprecationStatus)} />
                    </span>
                    <span className="xp-badges">
                      <span className="xp-badge xp-badge-write">{op.kind}</span>
                      {op.disruptive && <span className="xp-badge xp-badge-disruptive">disruptive</span>}
                    </span>
                  </div>
                  <BindingLine binding={binding} />
                  {hint && <div className="xp-card-meta">fields: {hint}</div>}
                  <textarea
                    className="input xp-payload"
                    spellCheck={false}
                    value={writePayloads[op.key] ?? '{}'}
                    onChange={(e) => setWritePayloads((prev) => ({ ...prev, [op.key]: e.target.value }))}
                  />
                  <div className="xp-card-foot">
                    <StateChip state={result?.state ?? 'idle'} at={result?.at} />
                    <button
                      type="button"
                      className="btn btn-sm btn-primary"
                      disabled={op.kind !== 'create' && binding.status !== 'ready'}
                      onClick={() => runner.runWrite(op.key, writePayloads[op.key] ?? '{}')}
                    >
                      Run
                    </button>
                  </div>
                  <ResultOutput result={result} />
                </div>
              );
            })}
          </div>
        )}
        <MissingOpsList ops={missingWrites} />
      </section>

      {/* Actions — context writeback */}
      {writebackTargets.length > 0 && (
        <section className="xp-section">
          <h2 className="xp-section-title">Actions · Context writeback</h2>
          <div className="xp-grid">
            {writebackTargets.map((target) => {
              const key = `${target.entity}.${target.field}`;
              const input = writebackInputs[key] ?? { value: '', mode: 'override' };
              const result = results.writebacks[key];
              const boundEntity = !!contextStore[target.entity];
              return (
                <div key={key} className="xp-card">
                  <div className="xp-card-head">
                    <span className="xp-card-title xp-mono">{target.entity}.{target.field}</span>
                    <span className="xp-badges">
                      <span className="xp-badge xp-badge-write">writeback</span>
                      {target.disruptive && <span className="xp-badge xp-badge-disruptive">disruptive</span>}
                    </span>
                  </div>
                  <div className={`xp-binding ${boundEntity ? 'xp-binding-ready' : 'xp-binding-waiting'}`}>
                    {boundEntity ? `${target.entity} in context` : `waiting for ${target.entity}`}
                  </div>
                  <div className="input-group">
                    <input
                      className="input"
                      placeholder="value (JSON or text)"
                      value={input.value}
                      onChange={(e) => setWritebackInputs((prev) => ({ ...prev, [key]: { ...input, value: e.target.value } }))}
                    />
                    <select
                      className="input xp-mode"
                      value={input.mode}
                      onChange={(e) =>
                        setWritebackInputs((prev) => ({ ...prev, [key]: { ...input, mode: e.target.value === 'append' ? 'append' : 'override' } }))
                      }
                    >
                      <option value="override">override</option>
                      <option value="append">append</option>
                    </select>
                  </div>
                  <div className="xp-card-foot">
                    <StateChip state={result?.state ?? 'idle'} at={result?.at} />
                    <button type="button" className="btn btn-sm btn-primary" onClick={() => runner.runWriteback(target, input.value, input.mode)}>
                      Run
                    </button>
                  </div>
                  <ResultOutput result={result} />
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Activity log */}
      <section className="xp-section">
        <h2 className="xp-section-title">Activity log</h2>
        <div className="activity-log">
          {log.length === 0 ? (
            <p className="empty-state">No activity yet.</p>
          ) : (
            log.map((row, i) => (
              <div key={`${row.at}-${i}`} className={`log-entry ${row.tone}`}>
                <span className="log-timestamp">{row.at}</span>
                {row.message}
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

function WorkerNotice({ phase, error, relayErrors }: { phase: WorkerPhase; error: string | null; relayErrors: string[] }) {
  if (error) return <div className="xp-binding xp-worker-status xp-worker-status-error">Could not reach the Worker App: {error}</div>;
  if (phase === 'running' && relayErrors.length > 0) {
    return (
      <div className="xp-binding xp-worker-status xp-worker-status-error">
        Running inside the Worker App, but some of its state did not reach this panel:
        <ul>
          {relayErrors.map((relayError) => (
            <li key={relayError}>{relayError}</li>
          ))}
        </ul>
      </div>
    );
  }
  if (phase === 'running') return <div className="xp-binding xp-binding-ready xp-worker-status">Running inside the Worker App.</div>;
  return (
    <div className="xp-binding xp-binding-waiting xp-worker-status">
      {phase === 'starting' ? 'Starting the run in the Worker App…' : 'Waiting for the Worker App to serve the auto-runner…'}
    </div>
  );
}

function BindingLine({ binding }: { binding: Binding }) {
  if (binding.status === 'ready') {
    const ids = Object.entries(binding.resolvedIds);
    const label = ids.length ? ids.map(([k, v]) => `${k}=${v}`).join(', ') : 'resolved from current context';
    return <div className="xp-binding xp-binding-ready">bound · {label}</div>;
  }
  return <div className="xp-binding xp-binding-waiting">waiting for {binding.waitingOn.join(', ')}</div>;
}

function ResultOutput({ result, lines }: { result: OpResult | undefined; lines?: JsonLine[] }) {
  if (!result) return null;
  const text = result.error ?? (result.result === undefined ? undefined : JSON.stringify(result.result, null, 2));
  if (!text) return null;
  return <RawOutput value={text} lines={lines} label="raw result" tone={result.state === 'error' ? 'error' : 'success'} />;
}

function StateChip({ state, at }: { state: OpState; at?: string }) {
  const label = state === 'idle' ? 'idle' : state === 'running' ? 'running…' : state === 'ok' ? `ok · ${at ?? ''}` : `error · ${at ?? ''}`;
  return <span className={`xp-state xp-state-${state}`}>{label}</span>;
}

function CompletenessBlock({ allFields, value }: { allFields: string[]; value: Record<string, unknown> | null }) {
  if (allFields.length === 0 || !value) return null;
  const comp = computeCompleteness(allFields, value);
  return (
    <div className="xp-complete">
      <div className="xp-complete-summary">
        fields {comp.present.length}/{comp.total} populated
        {comp.missing.length > 0 && <span className="xp-complete-gap"> · {comp.missing.length} missing</span>}
      </div>
      {comp.missing.length > 0 && (
        <div className="xp-missing-fields">
          {comp.missing.map((f) => (
            <span key={f} className="xp-missing-chip">{f}</span>
          ))}
        </div>
      )}
      <RawOutput value={JSON.stringify(withMissingFields(allFields, value), null, 2)} label="entity + missing fields (null)" />
    </div>
  );
}

function MissingOpsList({ ops }: { ops: RunnableOp[] }) {
  if (ops.length === 0) return null;
  return (
    <div className="xp-missing-caps">
      <div className="xp-missing-caps-title">Not available in this EHR ({ops.length})</div>
      <ul className="xp-missing-caps-list">
        {ops.map((o) => (
          <li key={o.key}>
            <span className="xp-mono">{o.key}</span>
            <span className="xp-dim"> {o.kind}{o.disruptive ? ' · disruptive' : ''}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
