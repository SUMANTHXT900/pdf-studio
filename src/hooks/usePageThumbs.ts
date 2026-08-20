import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { getCachedPageCount, pageCount, renderThumbsBatched } from '../lib/pdf'

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
const MAX_CACHE_ENTRIES = 8

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

// ---------- idle helper ----------
function idle(cb: () => void): void {
  const ric: any = (window as any).requestIdleCallback
  if (typeof ric === 'function') ric(cb, { timeout: 800 })
  else setTimeout(cb, 64)
}

function idlePromise(): Promise<void> {
  return new Promise<void>((res) => idle(() => res()))
}

// ---------- hook ----------
export function usePageThumbs() {
  const [thumbs, setThumbs] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const abortRef = useRef<AbortController | null>(null)
  const hashRef = useRef<string | null>(null)

  // memoized thumbs — stable reference when contents equal; prevents child re-renders
  const memoizedThumbs = useMemo(() => thumbs, [thumbs])

  const load = useCallback(async (buffer: ArrayBuffer): Promise<string[]> => {
    const key = hashBuffer(buffer)

    // cache hit — instant, no pdfjs load
    const cached = getCache(key)
    if (cached) {
      hashRef.current = key
      setThumbs(cached)
      setLoading(false)
      return cached
    }

    // cancel previous
    abortRef.current?.abort()
    const ac = new AbortController()
    abortRef.current = ac
    hashRef.current = key

    setLoading(true)
    setThumbs([])

    try {
      // fast path: use cached pageCount if available
      let total: number
      const cachedCount = getCachedPageCount(buffer)
      if (cachedCount !== undefined) total = cachedCount
      else total = await pageCount(buffer)

      if (ac.signal.aborted) return []

      const out: string[] = new Array(total).fill('')
      setThumbs([...out])

      // Render with concurrency 2, first pages eager, rest idle-scheduled
      // For small docs (<=6) do all eagerly. For larger, first 6 eagerly then idle.
      const EAGER = Math.min(total, 6)
      const CONCURRENCY = 2

      // helper: batched render with concurrency 2
      async function renderRange(startPage: number, endPageExclusive: number) {
        for (let s = startPage; s < endPageExclusive; s += CONCURRENCY) {
          if (ac.signal.aborted) break
          const pageNums: number[] = []
          for (let k = 0; k < CONCURRENCY && s + k < endPageExclusive; k++) pageNums.push(s + k + 1) // 1-indexed
          const batch = await renderThumbsBatched(buffer, pageNums, 0.4, ac.signal)
          if (ac.signal.aborted) break
          for (const [p, url] of batch) out[p - 1] = url
          setThumbs([...out])
          // yield
          await new Promise<void>((r) => setTimeout(r, 0))
        }
      }

      await renderRange(0, EAGER)
      if (ac.signal.aborted) return out

      if (total > EAGER) {
        // schedule remaining via idle to keep main thread snappy
        for (let s = EAGER; s < total; s += CONCURRENCY) {
          if (ac.signal.aborted) break
          // idle gate per batch after first eager pages
          await idlePromise()
          if (ac.signal.aborted) break
          const pageNums: number[] = []
          for (let k = 0; k < CONCURRENCY && s + k < total; k++) pageNums.push(s + k + 1)
          const batch = await renderThumbsBatched(buffer, pageNums, 0.4, ac.signal)
          if (ac.signal.aborted) break
          for (const [p, url] of batch) out[p - 1] = url
          setThumbs([...out])
        }
      }

      if (!ac.signal.aborted) {
        // only cache fully-rendered results (no holes)
        const complete = out.every(Boolean)
        if (complete) setCache(key, [...out])
      }

      return out
    } catch (e) {
      if ((e as any)?.name === 'AbortError') return []
      throw e
    } finally {
      if (abortRef.current === ac) setLoading(false)
    }
  }, [])

  const cancel = useCallback(() => {
    abortRef.current?.abort()
    setLoading(false)
  }, [])

  useEffect(() => () => { abortRef.current?.abort() }, [])

  return { thumbs: memoizedThumbs, load, loading, cancel }
}
