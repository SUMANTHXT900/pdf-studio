import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getMostUsedId, recordToolOpen, TOOL_USAGE_KEY } from './toolUsage';

const IDS = ['merge', 'split', 'rotate'];

function readRaw(): Record<string, { opens: number; lastOpened: number }> {
  return JSON.parse(localStorage.getItem(TOOL_USAGE_KEY) ?? '{}');
}

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe('recordToolOpen', () => {
  it('creates a count of one with a fresh timestamp', () => {
    const before = Date.now();
    recordToolOpen('merge');
    const after = Date.now();
    const entry = readRaw().merge;
    expect(entry.opens).toBe(1);
    expect(entry.lastOpened).toBeGreaterThanOrEqual(before);
    expect(entry.lastOpened).toBeLessThanOrEqual(after);
  });

  it('stores counts only — no document names or file contents', () => {
    recordToolOpen('merge');
    expect(Object.keys(readRaw().merge).sort()).toEqual(['lastOpened', 'opens']);
  });

  it('increments on repeat opens', () => {
    recordToolOpen('split');
    recordToolOpen('split');
    expect(readRaw().split.opens).toBe(2);
  });

  it('ignores empty ids without writing', () => {
    recordToolOpen('');
    expect(localStorage.getItem(TOOL_USAGE_KEY)).toBeNull();
  });

  it('never throws when storage is denied (private mode)', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Quota exceeded', 'QuotaExceededError');
    });
    expect(() => recordToolOpen('merge')).not.toThrow();
  });

  it('recovers from corrupt stored JSON', () => {
    localStorage.setItem(TOOL_USAGE_KEY, 'not-json{{{');
    recordToolOpen('merge');
    expect(readRaw().merge.opens).toBe(1);
  });
});

describe('getMostUsedId', () => {
  it('returns the fallback with zero data', () => {
    expect(getMostUsedId(IDS)).toBe('merge');
    expect(getMostUsedId(IDS, 'split')).toBe('split');
    expect(getMostUsedId([])).toBe('merge');
  });

  it('picks the highest open count', () => {
    recordToolOpen('split');
    recordToolOpen('rotate');
    recordToolOpen('rotate');
    expect(getMostUsedId(IDS)).toBe('rotate');
  });

  it('breaks count ties by most recent open', () => {
    localStorage.setItem(
      TOOL_USAGE_KEY,
      JSON.stringify({
        merge: { opens: 2, lastOpened: 1000 },
        split: { opens: 2, lastOpened: 2000 },
      }),
    );
    expect(getMostUsedId(IDS)).toBe('split');
  });

  it('ignores stored ids outside the valid list', () => {
    localStorage.setItem(
      TOOL_USAGE_KEY,
      JSON.stringify({ 'not-a-tool': { opens: 99, lastOpened: 9999 } }),
    );
    expect(getMostUsedId(IDS)).toBe('merge');
  });

  it('ignores malformed entries', () => {
    localStorage.setItem(
      TOOL_USAGE_KEY,
      JSON.stringify({
        merge: { opens: 'lots', lastOpened: 'yesterday' },
        split: 'garbage',
      }),
    );
    expect(getMostUsedId(IDS)).toBe('merge');
  });

  it('returns the fallback when storage throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('Denied', 'SecurityError');
    });
    expect(getMostUsedId(IDS, 'rotate')).toBe('rotate');
  });
});
