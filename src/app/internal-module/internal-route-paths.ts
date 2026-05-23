/** Base URL segment for the admin (internal) area. */
export const INTERNAL_ROOT = '/internal';

/** Build router commands under the internal module. */
export function internalUrl(...segments: (string | number)[]): string[] {
  return [INTERNAL_ROOT, ...segments.map(String)];
}

/** Normalize legacy or relative commands to `/internal/...` paths. */
export function resolveInternalRouterCommands(commands: string[]): string[] {
  if (!commands.length) {
    return [INTERNAL_ROOT];
  }

  const [first, ...rest] = commands;
  if (first === 'internal' || first === '/internal') {
    return first.startsWith('/') ? commands : [INTERNAL_ROOT, ...rest];
  }
  if (first.startsWith('/internal/') || first === '/internal') {
    return commands;
  }
  if (first.startsWith('/')) {
    return [INTERNAL_ROOT, first.slice(1), ...rest];
  }
  return [INTERNAL_ROOT, first, ...rest];
}
