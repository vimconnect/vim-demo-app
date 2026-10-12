import type { AppManifest } from '@vimconnect/app-sdk';

/**
 * The name a developer codes against for an entity — its `vimSDK.ehr.api.<namespace>` — capitalised.
 * The manifest carries no entity display name, and an entity id can differ from it (`providerRecord` → "Provider").
 */
export function entityLabel(manifest: AppManifest | null, entityType: string): string {
  const namespace = manifest?.operations?.find((op) => op.entityTypeId === entityType)?.sdkNamespace;
  const name = namespace || entityType;
  return name.charAt(0).toUpperCase() + name.slice(1);
}
