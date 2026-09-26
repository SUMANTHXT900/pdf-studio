/**
 * Usage-based Home grid: per-tool open counts in localStorage.
 *
 * Stored shape is `{ [toolId]: { opens: number, lastOpened: number } }` —
 * counts and timestamps only, no document names, no file contents, no PII.
 * Everything here is defensive: corrupt JSON, missing storage, and
 * private-mode quota errors all degrade to "no data" and never throw.
 */

export const TOOL_USAGE_KEY = 'folio:tool-usage:v1';

interface ToolUsageEntry {
  opens: number;
  lastOpened: number;
}

type ToolUsageStore = Record<string, ToolUsageEntry>;

function storage(): Storage | null {
  try {
    if (typeof localStorage === 'undefined') return null;
    return localStorage;
  } catch {
    return null;
  }
}

/** Reads the store, dropping malformed entries (wrong types, zero counts). */
function readStore(): ToolUsageStore {
  const store = storage();
  if (store === null) return {};
  try {
    const raw = store.getItem(TOOL_USAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return {};
    const clean: ToolUsageStore = {};
    for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
      if (typeof value !== 'object' || value === null) continue;
      const entry = value as Record<string, unknown>;
      const opens =
        typeof entry.opens === 'number' && Number.isFinite(entry.opens) && entry.opens > 0
          ? Math.floor(entry.opens)
          : 0;
      if (opens <= 0) continue;
      const lastOpened =
        typeof entry.lastOpened === 'number' &&
        Number.isFinite(entry.lastOpened) &&
        entry.lastOpened > 0
          ? entry.lastOpened
          : 0;
      clean[key] = { opens, lastOpened };
    }
    return clean;
  } catch {
    return {};
  }
}

/**
 * Records one open of a tool. Never throws — private-mode quota errors
 * must never break navigation.
 */
export function recordToolOpen(id: string): void {
  if (typeof id !== 'string' || id === '') return;
  try {
    const store = storage();
    if (store === null) return;
    const current = readStore();
    const prev = current[id];
    current[id] = { opens: (prev?.opens ?? 0) + 1, lastOpened: Date.now() };
    store.setItem(TOOL_USAGE_KEY, JSON.stringify(current));
  } catch {
    // Storage denied or full (private mode): usage data is best-effort.
  }
}

/**
 * Returns the id with the highest open count. Ties break toward the most
 * recently opened tool. Store keys outside `validIds` are ignored; an
 * empty store (or unreadable storage) yields `fallback`.
 */
export function getMostUsedId(validIds: readonly string[], fallback = 'merge'): string {
  try {
    const current = readStore();
    let best: string | null = null;
    let bestOpens = 0;
    let bestRecent = -1;
    for (const id of validIds) {
      const entry = current[id];
      if (!entry || entry.opens <= 0) continue;
      if (entry.opens > bestOpens || (entry.opens === bestOpens && entry.lastOpened > bestRecent)) {
        best = id;
        bestOpens = entry.opens;
        bestRecent = entry.lastOpened;
      }
    }
    return best ?? fallback;
  } catch {
    return fallback;
  }
}
