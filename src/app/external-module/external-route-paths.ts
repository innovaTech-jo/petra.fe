/** Base URL segment for the external user area. */
export const EXTERNAL_ROOT = '/external';

/** Build router commands under the external module. */
export function externalUrl(...segments: (string | number)[]): string[] {
  return [EXTERNAL_ROOT, ...segments.map(String)];
}
