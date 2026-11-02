/**
 * The two SDKs the auto-runner engine runs against, side by side. What one
 * surface can do and the other cannot is exactly what offscreen mode exposes.
 */

import type {
  ContextData,
  ContextKey,
  EventType,
  VimSDK,
  WorkerContextHandle,
  WorkerSDK,
  WorkerWorkflowHandle,
  WorkflowEvent,
} from '@vimconnect/app-sdk';
import type { AutoRunnerSurface } from './auto-runner-engine';
import { getApiMethod, getCapability, getHandleApiMethod, getWritebackNamespace, requestApiPermission } from './sdk-invoke';

export function createAppSurface(sdk: VimSDK): AutoRunnerSurface {
  return {
    watchContext(contextKey, onChange) {
      return sdk.ehr.context.onChange(contextKey as ContextKey, (_prev, current) => onChange(current ? (current as ContextData) : null));
    },
    watchEvent(eventType, onEvent) {
      return sdk.ehr.workflow.on(eventType as EventType, (event: WorkflowEvent) => onEvent(event));
    },
    async callApi(op, args, log) {
      if (op.disruptive) {
        const cap = getCapability(sdk, op.namespace, op.method);
        if (cap && !cap.available) throw new Error(`Not available: ${cap.reason ?? 'unknown'}`);
        if (cap?.disruptive && cap.permissionState !== 'granted') {
          log(`Requesting permission for ${op.key}…`, 'info');
          const grant = await requestApiPermission(sdk, op.namespace, op.method);
          if (grant !== 'granted') throw new Error(`Permission ${grant}`);
        }
      }
      const fn = getApiMethod(sdk, op.namespace, op.method);
      if (!fn) throw new Error('Method not present on SDK');
      return fn(...args);
    },
    async writeback(target, data, mode) {
      const ns = getWritebackNamespace(sdk, target.entity);
      if (!ns) throw new Error(`No writeback namespace for ${target.entity}`);
      const permOptions = { fields: [target.field] };
      if (!ns.hasPermission('update', permOptions)) {
        const grant = await ns.requestPermission('update', permOptions);
        if (grant !== 'granted') throw new Error(`Permission ${grant}`);
      }
      return ns.update(data, { mode });
    },
  };
}

type WorkerHandle = WorkerContextHandle | WorkerWorkflowHandle;

/**
 * A Worker reaches the EHR only through the handle a context or workflow callback hands it,
 * so every call goes through the most recent handle that is still live.
 */
export function createWorkerSurface(sdk: WorkerSDK): AutoRunnerSurface {
  const handles = new Map<string, WorkerHandle>();
  let lastEnded = 'no context change or workflow event has issued one yet';

  function track(source: string, handle: WorkerHandle) {
    handles.delete(source);
    handles.set(source, handle);
    handle.api.onInvalidated((reason) => {
      lastEnded = `the ${source} handle ended: ${reason}`;
    });
  }

  function latestLive<T>(pick: (handle: WorkerHandle) => T | undefined): { source: string; value: T } {
    for (const [source, handle] of [...handles].reverse()) {
      const value = pick(handle);
      if (value !== undefined && handle.api.isValid()) return { source, value };
    }
    throw new Error(`No live worker handle — ${lastEnded}`);
  }

  return {
    watchContext(contextKey, onChange) {
      return sdk.ehr.context.register<ContextData>(contextKey, { operations: ['suggestWriteback'] }, (_prev, current, handle) => {
        track(contextKey, handle);
        onChange(current);
      });
    },
    watchEvent(eventType, onEvent) {
      return sdk.ehr.workflow.register(eventType, {}, (event, handle) => {
        track(`workflow:${eventType}`, handle);
        onEvent(event);
      });
    },
    async callApi(op, args, log) {
      const { source, value: api } = latestLive((handle) => handle.api);
      const fn = getHandleApiMethod(api, op.namespace, op.method);
      if (!fn) throw new Error(`Not on the ${source} handle's api`);
      log(`${op.key} via the ${source} handle`, 'info');
      return fn(...args);
    },
    writeback(target, data, mode, log) {
      const { source, value: context } = latestLive((handle) => handle.ehr?.context);
      log(`suggestWriteback via the ${source} handle — waiting for the provider`, 'info');
      return new Promise((resolve, reject) => {
        context.suggestWriteback({
          entity: target.entity,
          fields: [target.field],
          notification: {
            notificationId: `auto-runner-writeback-${Date.now()}`,
            title: 'Auto-runner writeback',
            text: `Write ${target.entity}.${target.field}?`,
          },
          onGranted: async (wb) => {
            try {
              resolve(await wb.ehr[target.entity].update(data, { mode }));
            } catch (err) {
              reject(err);
            }
          },
          onDenied: () => reject(new Error('Provider denied the writeback')),
          onTimeout: () => reject(new Error('Writeback notification timed out')),
          onInvalidated: () => reject(new Error('Context left scope before the provider answered')),
        });
      });
    },
  };
}
