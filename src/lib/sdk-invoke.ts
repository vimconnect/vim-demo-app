/**
 * Typed accessors over the SDK's dynamic dispatch surface.
 *
 * `ehr.api.<namespace>.<method>` and `ehr.context.<entity>` are indexed by
 * runtime strings taken from the manifest, so there is no static type for the
 * specific method being called. This module confines that dynamic access (and
 * the casts it needs) behind small, named, typed helpers so the UI never
 * reaches into `as any`.
 */

import type { ApiNamespace, VimSDK } from '@vimconnect/app-sdk';

export type ApiMethod = (...args: unknown[]) => Promise<unknown>;

/** Narrowed shape of a CapabilityResult — only the fields the UI branches on. */
export interface Capability {
  available: boolean;
  reason?: string;
  disruptive?: boolean;
  permissionState?: string;
}

export interface WritebackNamespace {
  hasPermission(operation: 'update', options?: { fields?: string[] }): boolean;
  requestPermission(operation: 'update', options?: { fields?: string[] }): Promise<string>;
  update(data: Record<string, unknown>, options?: { mode?: string }): Promise<unknown>;
}

function namespaceOf(api: Record<string, unknown>, namespace: string): Record<string, unknown> | null {
  const ns = api[namespace];
  return ns && typeof ns === 'object' ? (ns as Record<string, unknown>) : null;
}

function apiNamespace(sdk: VimSDK, namespace: string): Record<string, unknown> | null {
  return namespaceOf(sdk.ehr.api as unknown as Record<string, unknown>, namespace);
}

function methodOf(ns: Record<string, unknown> | null, method: string): ApiMethod | null {
  const fn = ns?.[method];
  return typeof fn === 'function' ? (fn as ApiMethod) : null;
}

export function getApiMethod(sdk: VimSDK, namespace: string, method: string): ApiMethod | null {
  return methodOf(apiNamespace(sdk, namespace), method);
}

/** A method on a Worker handle's `api`, which carries only what the handle factory built for it. */
export function getHandleApiMethod(api: ApiNamespace, namespace: string, method: string): ApiMethod | null {
  return methodOf(namespaceOf(api, namespace), method);
}

export function getCapability(sdk: VimSDK, namespace: string, method: string): Capability | null {
  const ns = apiNamespace(sdk, namespace);
  const fn = ns?.getCapability;
  if (typeof fn !== 'function') return null;
  const result = (fn as (m: string) => unknown).call(ns, method);
  return result && typeof result === 'object' ? (result as Capability) : null;
}

export async function requestApiPermission(sdk: VimSDK, namespace: string, method: string): Promise<string> {
  const ns = apiNamespace(sdk, namespace);
  const fn = ns?.requestPermission;
  if (typeof fn !== 'function') return 'denied';
  return String(await (fn as (m: string) => Promise<unknown>).call(ns, method));
}

export function getWritebackNamespace(sdk: VimSDK, entity: string): WritebackNamespace | null {
  const context = sdk.ehr.context as unknown as Record<string, unknown>;
  const ns = context[entity];
  if (!ns || typeof ns !== 'object') return null;
  const candidate = ns as Record<string, unknown>;
  return typeof candidate.update === 'function' ? (candidate as unknown as WritebackNamespace) : null;
}
