'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { AppManifest, ContextData, ContextKey, EventType, VimSDK, WorkflowEvent } from '@vimconnect/app-sdk';
import { DeprecatedTag } from '@/components/DeprecatedTag';
import { RawOutput } from '@/components/RawOutput';
import { annotatedLines, apiResultAnnotator, contextAnnotator, noteOf, workflowEventAnnotator } from '@/lib/annotated-json';
import {
  asEntityObject,
  buildMissingOps,
  buildRunnableOps,
  computeCompleteness,
  entityFieldsByType,
  extractEntityId,
  resolveBinding,
  shouldFire,
  withMissingFields,
  type Binding,
  type ContextStore,
  type RunnableOp,
} from '@/lib/capability-engine';
import { getApiMethod, getCapability, getWritebackNamespace, requestApiPermission } from '@/lib/sdk-invoke';

type OperationEntry = NonNullable<AppManifest['operations']>[number];

type OpState = 'idle' | 'running' | 'ok' | 'error';

interface OpResult {
  state: OpState;
  raw?: string;
  at?: string;
  argsLabel?: string;
  /** Parsed result object — used to overlay missing entity fields on reads. */
  result?: unknown;
}
type ResultMap = Record<string, OpResult>;

interface EventRow {
  id: number;
  type: string;
  at: string;
  raw: string;
  event: WorkflowEvent;
}

interface LogRow {
  at: string;
  message: string;
  tone: 'info' | 'success' | 'error';
}

interface WritebackTarget {
  entity: string;
  field: string;
  disruptive: boolean;
}

type CapabilityAutoRunnerProps = {
  /** An already-initialized SDK session — the host page owns OAuth/init. */
  sdk: VimSDK;
  manifest: AppManifest;
  /** Switch back to the classic demo. When set, a control renders in the header. */
  onSwitchMode?: () => void;
};

function now(): string {
  return new Date().toLocaleTimeString();
}

function isFailure(result: unknown): boolean {
  return !!result && typeof result === 'object' && (result as { success?: boolean }).success === false;
}

function buildNestedFromPath(path: string, value: unknown): Record<string, unknown> {
  return path.split('.').reduceRight<Record<string, unknown>>((acc, key) => ({ [key]: acc }), value as Record<string, unknown>);
}

function writeFieldsHint(entry: OperationEntry | undefined): string {
  const meta = entry?.metadata;
  if (!meta) return '';
  if (meta.type === 'updateById') return meta.updateableFields.join(', ');
  if (meta.type === 'create') return [...meta.requiredFields, ...meta.optionalFields.map((f) => `${f}?`)].join(', ');
  return '';
}

export function CapabilityAutoRunner({ sdk, manifest, onSwitchMode }: CapabilityAutoRunnerProps) {
  const [contextStore, setContextStore] = useState<ContextStore>({});
  const [events, setEvents] = useState<EventRow[]>([]);
  const [readResults, setReadResults] = useState<ResultMap>({});
  const [writeResults, setWriteResults] = useState<ResultMap>({});
  const [writebackResults, setWritebackResults] = useState<ResultMap>({});
  const [autoRunDisruptive, setAutoRunDisruptive] = useState(false);
  const [writePayloads, setWritePayloads] = useState<Record<string, string>>({});
  const [writebackInputs, setWritebackInputs] = useState<Record<string, { value: string; mode: string }>>({});
  const [log, setLog] = useState<LogRow[]>([]);

  const firedRef = useRef<Record<string, string>>({});
  const eventIdRef = useRef(0);

  const addLog = useCallback((message: string, tone: LogRow['tone']) => {
    setLog((prev) => [{ at: now(), message, tone }, ...prev].slice(0, 200));
  }, []);

  // ── Operation invocation ──────────────────────────────────────────────────

  const runApiOperation = useCallback(
    async (op: RunnableOp, callArgs: unknown[], setResults: (fn: (prev: ResultMap) => ResultMap) => void, source: 'auto' | 'manual') => {
      const argsLabel = callArgs.map((a) => JSON.stringify(a)).join(', ');
      setResults((prev) => ({ ...prev, [op.key]: { state: 'running', at: now(), argsLabel } }));
      addLog(`${source === 'auto' ? 'auto ▸' : 'run ▸'} ehr.api.${op.key}(${argsLabel})`, 'info');

      try {
        if (op.disruptive) {
          const cap = getCapability(sdk, op.namespace, op.method);
          if (cap && !cap.available) {
            setResults((prev) => ({ ...prev, [op.key]: { state: 'error', raw: `Not available: ${cap.reason ?? 'unknown'}`, at: now(), argsLabel } }));
            addLog(`${op.key} not available (${cap.reason ?? 'unknown'})`, 'error');
            return;
          }
          if (cap?.disruptive && cap.permissionState !== 'granted') {
            addLog(`Requesting permission for ${op.key}…`, 'info');
            const grant = await requestApiPermission(sdk, op.namespace, op.method);
            if (grant !== 'granted') {
              setResults((prev) => ({ ...prev, [op.key]: { state: 'error', raw: `Permission ${grant}`, at: now(), argsLabel } }));
              addLog(`Permission ${grant} for ${op.key}`, 'error');
              return;
            }
          }
        }

        const fn = getApiMethod(sdk, op.namespace, op.method);
        if (!fn) {
          setResults((prev) => ({ ...prev, [op.key]: { state: 'error', raw: 'Method not present on SDK', at: now(), argsLabel } }));
          addLog(`ehr.api.${op.key} is not present on this SDK`, 'error');
          return;
        }

        const result = await fn(...callArgs);
        const raw = JSON.stringify(result, null, 2);
        const failed = isFailure(result);
        setResults((prev) => ({ ...prev, [op.key]: { state: failed ? 'error' : 'ok', raw, at: now(), argsLabel, result } }));
        addLog(failed ? `${op.key} returned success:false` : `${op.key} ✓`, failed ? 'error' : 'success');
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        setResults((prev) => ({ ...prev, [op.key]: { state: 'error', raw: `Error: ${message}`, at: now(), argsLabel } }));
        addLog(`${op.key} threw: ${message}`, 'error');
      }
    },
    [sdk, addLog],
  );

  const runRead = useCallback(
    (op: RunnableOp, binding: Binding, source: 'auto' | 'manual') => {
      void runApiOperation(op, [binding.args], setReadResults, source);
    },
    [runApiOperation],
  );

  const runWrite = useCallback(
    (op: RunnableOp, binding: Binding) => {
      const payloadText = writePayloads[op.key] ?? '{}';
      let payload: unknown;
      try {
        payload = JSON.parse(payloadText);
      } catch {
        setWriteResults((prev) => ({ ...prev, [op.key]: { state: 'error', raw: 'Payload is not valid JSON', at: now() } }));
        addLog(`${op.key}: payload is not valid JSON`, 'error');
        return;
      }
      const callArgs = op.kind === 'create' ? [payload] : [binding.args, payload];
      void runApiOperation(op, callArgs, setWriteResults, 'manual');
    },
    [writePayloads, runApiOperation, addLog],
  );

  const runWriteback = useCallback(
    async (target: WritebackTarget) => {
      const key = `${target.entity}.${target.field}`;
      const input = writebackInputs[key] ?? { value: '', mode: 'override' };
      setWritebackResults((prev) => ({ ...prev, [key]: { state: 'running', at: now() } }));
      addLog(`writeback ▸ ${target.entity}.${target.field} = ${input.value} (${input.mode})`, 'info');

      try {
        const ns = getWritebackNamespace(sdk, target.entity);
        if (!ns) {
          setWritebackResults((prev) => ({ ...prev, [key]: { state: 'error', raw: `No writeback namespace for ${target.entity}`, at: now() } }));
          addLog(`No writeback namespace for ${target.entity}`, 'error');
          return;
        }
        const permOptions = { fields: [target.field] };
        if (!ns.hasPermission('update', permOptions)) {
          const grant = await ns.requestPermission('update', permOptions);
          if (grant !== 'granted') {
            setWritebackResults((prev) => ({ ...prev, [key]: { state: 'error', raw: `Permission ${grant}`, at: now() } }));
            addLog(`Permission ${grant} for ${target.entity}.${target.field}`, 'error');
            return;
          }
        }
        let value: unknown = input.value;
        try {
          value = JSON.parse(input.value);
        } catch {
          // keep as plain string
        }
        const data = buildNestedFromPath(target.field, value);
        const result = await ns.update(data, { mode: input.mode });
        const raw = JSON.stringify(result, null, 2);
        const failed = isFailure(result);
        setWritebackResults((prev) => ({ ...prev, [key]: { state: failed ? 'error' : 'ok', raw, at: now() } }));
        addLog(failed ? `writeback ${key} failed` : `writeback ${key} ✓`, failed ? 'error' : 'success');
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        setWritebackResults((prev) => ({ ...prev, [key]: { state: 'error', raw: `Error: ${message}`, at: now() } }));
        addLog(`writeback ${key} threw: ${message}`, 'error');
      }
    },
    [sdk, writebackInputs, addLog],
  );

  // ── Subscribe to every event & context for the life of this view ────────────
  useEffect(() => {
    const unsubs: Array<() => void> = [];
    addLog(`watching — ${manifest.supportedEvents?.length ?? 0} events, ${manifest.supportedContexts?.length ?? 0} contexts, ${manifest.operations?.length ?? 0} operations`, 'success');

    for (const ctx of manifest.supportedContexts ?? []) {
      const entityType = ctx.entityType;
      try {
        const unsub = sdk.ehr.context.onChange(ctx.contextKey as ContextKey, (_prev, current) => {
          setContextStore((prev) => {
            const next = { ...prev };
            if (current) {
              const data = current as ContextData;
              next[entityType] = { entityType, id: extractEntityId(data), data, at: now() };
            } else {
              delete next[entityType];
            }
            return next;
          });
        });
        unsubs.push(unsub);
      } catch {
        // Context not subscribable in this session — skip silently.
      }
    }

    for (const evt of manifest.supportedEvents ?? []) {
      try {
        const unsub = sdk.ehr.workflow.on(evt.id as EventType, (event: WorkflowEvent) => {
          eventIdRef.current += 1;
          setEvents((prev) => [{ id: eventIdRef.current, type: event.type, at: now(), raw: JSON.stringify(event, null, 2), event }, ...prev].slice(0, 100));
          addLog(`event ${event.type}`, 'success');
        });
        unsubs.push(unsub);
      } catch {
        // Event not subscribable in this session — skip silently.
      }
    }

    return () => {
      for (const unsub of unsubs) {
        try {
          unsub();
        } catch {
          // ignore teardown failures
        }
      }
    };
  }, [sdk, manifest, addLog]);

  // ── Derived catalog ───────────────────────────────────────────────────────

  const runnableOps = useMemo(() => buildRunnableOps(manifest), [manifest]);
  const readOps = useMemo(() => runnableOps.filter((o) => o.isRead), [runnableOps]);
  const writeOps = useMemo(() => runnableOps.filter((o) => !o.isRead), [runnableOps]);
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

  // ── Reactive auto-fire: reads emit the moment context satisfies their inputs.
  useEffect(() => {
    for (const op of readOps) {
      const binding = resolveBinding(op, contextStore);
      if (shouldFire(op, binding, { autoRunDisruptive, lastFingerprint: firedRef.current[op.key] })) {
        firedRef.current[op.key] = binding.fingerprint;
        runRead(op, binding, 'auto');
      }
    }
  }, [contextStore, autoRunDisruptive, readOps, runRead]);

  const contextEntries = Object.values(contextStore);

  return (
    <div className="xp-container">
      <header className="xp-header">
        <div className="xp-header-main">
          <h1>SDK Capability Auto-Runner</h1>
          <p className="xp-subtitle">
            Subscribes to every event & context, and fires each read the instant the context supplies its inputs.
          </p>
        </div>
        <div className="xp-header-side">
          {onSwitchMode && (
            <button type="button" className="btn btn-gradient btn-sm" onClick={onSwitchMode}>
              ← Classic demo
            </button>
          )}
          <span className="status-badge">
            <span className="status-dot" /> Connected · v{manifest.version ?? '?'}
          </span>
          <label className="toggle-switch">
            <span className={`toggle-track ${autoRunDisruptive ? 'active' : ''}`} onClick={() => setAutoRunDisruptive((v) => !v)}>
              <span className="toggle-thumb" />
            </span>
            <span className="toggle-label">Auto-run disruptive reads</span>
          </label>
        </div>
      </header>

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
                  value={evt.raw}
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
              const result = readResults[op.key];
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
                    <button
                      type="button"
                      className="btn btn-sm"
                      disabled={binding.status !== 'ready'}
                      onClick={() => runRead(op, binding, 'manual')}
                    >
                      {result ? 'Re-run' : 'Run'}
                    </button>
                  </div>
                  {result?.raw && (
                    <RawOutput
                      value={result.raw}
                      lines={
                        result.result !== undefined && entityType
                          ? annotatedLines(result.result, apiResultAnnotator(manifest, entityType))
                          : undefined
                      }
                      label="raw result"
                      tone={result.state === 'error' ? 'error' : 'success'}
                    />
                  )}
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
              const result = writeResults[op.key];
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
                      onClick={() => runWrite(op, binding)}
                    >
                      Run
                    </button>
                  </div>
                  {result?.raw && <RawOutput value={result.raw} label="raw result" tone={result.state === 'error' ? 'error' : 'success'} />}
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
              const result = writebackResults[key];
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
                      onChange={(e) => setWritebackInputs((prev) => ({ ...prev, [key]: { ...input, mode: e.target.value } }))}
                    >
                      <option value="override">override</option>
                      <option value="append">append</option>
                    </select>
                  </div>
                  <div className="xp-card-foot">
                    <StateChip state={result?.state ?? 'idle'} at={result?.at} />
                    <button type="button" className="btn btn-sm btn-primary" onClick={() => void runWriteback(target)}>
                      Run
                    </button>
                  </div>
                  {result?.raw && <RawOutput value={result.raw} label="raw result" tone={result.state === 'error' ? 'error' : 'success'} />}
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

function BindingLine({ binding }: { binding: Binding }) {
  if (binding.status === 'ready') {
    const ids = Object.entries(binding.resolvedIds);
    const label = ids.length ? ids.map(([k, v]) => `${k}=${v}`).join(', ') : 'resolved from current context';
    return <div className="xp-binding xp-binding-ready">bound · {label}</div>;
  }
  return <div className="xp-binding xp-binding-waiting">waiting for {binding.waitingOn.join(', ')}</div>;
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
