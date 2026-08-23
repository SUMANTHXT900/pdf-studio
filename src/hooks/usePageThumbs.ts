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

// ---------- hook ----------
export function usePageThumbs() {
  const [thumbs, setThumbs] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null)

  const abortRef = useRef<AbortController | null>(null)

  // stable reference when contents equal; prevents child re-renders
  const memoizedThumbs = useMemo(() => thumbs, [thumbs])

  const load = useCallback(async (buffer: ArrayBuffer): Promise<string[]> => {
    const key = hashBuffer(buffer)

    // cache hit — instant, no pdfjs load
    const cached = getCache(key)
    if (cached) {
      setThumbs(cached)
      setLoading(false)
      setProgress(null)
      return cached
    }

    // cancel previous
    abortRef.current?.abort()
    const ac = new AbortController()
    abortRef.current = ac

    setLoading(true)
    setProgress({ done: 0, total: 0 })
    try {
      // fast path: use cached pageCount if available
      let total: number
      const cachedCount = getCachedPageCount(buffer)
      if (cachedCount !== undefined) total = cachedCount
      else total = await pageCount(buffer)

      if (ac.signal.aborted) return []

      const out: string[] = new Array(total).fill('')
      setThumbs([...out])
      setProgress({ done: 0, total })

      // ONE document load, pages streamed in chunks of 3, painted as they land.
      await renderThumbSeries(buffer, total, 0.8, ac.signal, (chunk) => {
        for (const [p, url] of chunk) out[p - 1] = url
        if (!ac.signal.aborted) {
          setThumbs([...out])
          setProgress({ done: out.filter(Boolean).length, total })
        }
      })

      if (!ac.signal.aborted) {
        const complete = out.every(Boolean)
        if (complete) setCache(key, [...out])
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

  const cancel = useCallback(() => {
    abortRef.current?.abort()
    setLoading(false)
    setProgress(null)
  }, [])

  useEffect(() => () => { abortRef.current?.abort() }, [])

  return { thumbs: memoizedThumbs, load, loading, progress, cancel }
}
