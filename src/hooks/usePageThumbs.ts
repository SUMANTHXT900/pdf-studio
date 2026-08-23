import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { getCachedPageCount, pageCount, renderThumbSeries } from '../lib/pdf'

// ---------- hash + global cache ----------
function hashBuffer(buf: ArrayBuffer): string {
  const u8 = new Uint8Array(buf)
  const len = u8.length
  let h = 2166136261 >>> 0
  const head = Math.min(len, 16384)
  for (let i = 0; i < head; i++) h = Math.imul(h ^ u8[i], 16777619)
  if (len > 32768) for (let i = len - 16384; i < len; i++) h = Math.imul(h ^ u8[i], 16777619)
  return `${len}-${h >>> 0}`
}

const thumbCache = new Map<string, string[]>()
const MAX_CACHE_ENTRIES = 6

function getCache(key: string): string[] | undefined {
  return thumbCache.get(key)
}
function setCache(key: string, val: string[]) {
  thumbCache.set(key, val)
  if (thumbCache.size > MAX_CACHE_ENTRIES) {
    const first = thumbCache.keys().next().value as string
    thumbCache.delete(first)
  }
}

/** Pages rendered in the blocking first phase — matches the grid's PAGE_LIMIT. */
export const THUMB_INITIAL = 24

function idle(): Promise<void> {
  const ric = (window as any).requestIdleCallback
  if (typeof ric === 'function') return new Promise((res) => ric(() => res(), { timeout: 1200 }))
  return new Promise((res) => setTimeout(res, 32))
}

// ---------- hook ----------
export function usePageThumbs() {
  const [thumbs, setThumbs] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null)

  const abortRef = useRef<AbortController | null>(null)

  const memoizedThumbs = useMemo(() => thumbs, [thumbs])

  /**
   * Render thumbnails with windowing:
   *  - Phase 1 (blocking): render `initialCount` (default 24) pages — what the
   *    grid actually shows. This is all the user waits for.
   *  - Phase 2 (idle priority): silently render the rest so "Show all" is
   *    instant later. Never shows a spinner.
   */
  const load = useCallback(async (buffer: ArrayBuffer, initialCount?: number): Promise<string[]> => {
    const key = hashBuffer(buffer)

    // full cache hit — instant, zero pdfjs work
    const cached = getCache(key)
    if (cached) {
      setThumbs(cached)
      setLoading(false)
      setProgress(null)
      return cached
    }

    abortRef.current?.abort()
    const ac = new AbortController()
    abortRef.current = ac

    setLoading(true)
    setProgress({ done: 0, total: 0 })
    try {
      let total: number
      const cachedCount = getCachedPageCount(buffer)
      total = cachedCount !== undefined ? cachedCount : await pageCount(buffer)
      if (ac.signal.aborted) return []

      const out: string[] = new Array(total).fill('')
      setThumbs([...out])
      setProgress({ done: 0, total })

      const firstBatch = initialCount ? Math.min(initialCount, total) : total

      // ---- Phase 1: visible window only ----
      await renderThumbSeries(buffer, firstBatch, 240, ac.signal, (chunk) => {
        for (const [p, url] of chunk) out[p - 1] = url
        if (!ac.signal.aborted) {
          setThumbs([...out])
          setProgress({ done: out.filter(Boolean).length, total })
        }
      })
      setLoading(false)
      setProgress(null)
      if (ac.signal.aborted) return out.filter(Boolean).length ? out : []

      // ---- Phase 2: rest of the document at idle priority ----
      if (firstBatch < total) {
        try {
          await renderThumbSeries(buffer, total, 240, ac.signal, (chunk) => {
            for (const [p, url] of chunk) out[p - 1] = url
            if (!ac.signal.aborted && chunk.size) setThumbs([...out])
          }, firstBatch + 1)
        } catch { /* aborted mid-phase-2 — partial results are still valid */ }
      }

      if (!ac.signal.aborted) {
        if (out.every(Boolean)) setCache(key, [...out])
      }
      return out
    } catch (e) {
      if ((e as any)?.name === 'AbortError') return []
      throw e
    } finally {
      if (abortRef.current === ac) {
        setLoading(false)
        setProgress(null)
      }
    }
  }, [])

  /** Idle gate between phase-2 chunks lives inside pdf.ts yields + this hook's callers. */
  const cancel = useCallback(() => {
    abortRef.current?.abort()
    setLoading(false)
    setProgress(null)
  }, [])

  useEffect(() => () => { abortRef.current?.abort() }, [])

  return { thumbs: memoizedThumbs, load, loading, progress, cancel, idle }
}
