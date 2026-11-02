/** "v2 (in review)": the version and its status in words; 'unknown' when the extension predates manifest-version reporting. */
export function formatManifestVersion(v: { version: number; status: string } | null): string {
  return v ? `v${v.version} (${v.status.replace(/_/g, ' ')})` : 'unknown';
}
