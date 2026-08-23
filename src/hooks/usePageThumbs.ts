import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { getCachedPageCount, pageCount, ThumbSession } from '../lib/pdf'

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

/** Pages rendered in the blocking first phase — matches grid PAGE_LIMIT. */
export const THUMB_INITIAL = 24

function idle(): Promise<void> {
  const ric = (window as any).requestIdleCallback
  if (typeof ric === 'function') return new Promise((res) => ric(() => res(), { timeout: 1000 }))
  return new Promise((res) => setTimeout(res, 32))
}

// ---------- hook ----------
export function usePageThumbs() {
  const [thumbs, setThumbs] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null)

  const sessionRef = useRef<ThumbSession | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const memoizedThumbs = useMemo(() => thumbs, [thumbs])

  /** Abort in-flight renders AND close the shared pdf.js document. */
  const stop = useCallback(() => {
    abortRef.current?.abort()
    abortRef.current = null
    void sessionRef.current?.close()
    sessionRef.current = null
  }, [])

  useEffect(() => () => stop(), [stop])

  /**
   * Phase 1 ONLY: open one pdf.js document, render the first `initialCount`
   * pages, then RESOLVE. The rest of the document continues on a detached
   * background task (idle-scheduled) — the caller never waits for it.
   */
  const load = useCallback(async (buffer: ArrayBuffer, initialCount: number = THUMB_INITIAL): Promise<string[]> => {
    const key = hashBuffer(buffer)

    // fast path: fully rendered previously
    const cached = getCache(key)
    if (cached) {
      setThumbs(cached)
      setLoading(false)
      setProgress(null)
      return cached
    }

    stop()
    const ac = new AbortController()
    abortRef.current = ac

    setLoading(true)
    setProgress({ done: 0, total: 0 })
    try {
      const cachedCount = getCachedPageCount(buffer)
      const total = cachedCount !== undefined ? cachedCount : await pageCount(buffer)
      if (ac.signal.aborted) return []

      const arr: string[] = new Array(total).fill('')
      setThumbs([...arr])
      setProgress({ done: 0, total })

      // ONE document for this buffer's whole lifecycle
      const session = new ThumbSession(buffer, 240)
      sessionRef.current = session

      const first = Math.min(initialCount, total)
      const map = await session.range(1, first, ac.signal)
      for (const [p, url] of map) arr[p - 1] = url
      setThumbs([...arr])
      setLoading(false)

      if (first < total) {
        setProgress({ done: map.size, total })
        // DETACHED background continuation — not part of this promise.
        void backgroundFill(key, session, arr, ac, total)
      } else {
        setProgress(null)
        if (arr.every(Boolean)) setCache(key, [...arr])
        void session.close()
        if (sessionRef.current === session) sessionRef.current = null
      }
      return arr
    } catch (e) {
      if ((e as any)?.name === 'AbortError') return []
      throw e
    }
  }, [stop])

  /** Detached: fill remaining pages idle-scheduled. Never awaited by tools. */
  const backgroundFill = useCallback(async (
    key: string,
    session: ThumbSession,
    arr: string[],
    ac: AbortController,
    total: number,
  ) => {
    const WAVE = 24
    let start = arr.filter(Boolean).length + 1
    try {
      while (start <= total && !ac.signal.aborted) {
        await idle()
        if (ac.signal.aborted) return
        const end = Math.min(start + WAVE - 1, total)
        const map = await session.range(start, end, ac.signal)
        if (ac.signal.aborted) return
        for (const [p, url] of map) arr[p - 1] = url
        setThumbs([...arr])
        setProgress({ done: arr.filter(Boolean).length, total })
        start = end + 1
      }
      if (!ac.signal.aborted && arr.every(Boolean)) {
        setCache(key, [...arr])
        setProgress(null)
      }
    } catch { /* aborted */ }
  }, [])

  /**
   * Eagerly render any pages still missing (Show All). Resumes from the first
   * hole using the SAME open session — never re-renders existing pages.
   */
  const complete = useCallback(async (): Promise<void> => {
    const session = sessionRef.current
    if (!session || !abortRef.current || abortRef.current.signal.aborted) return
    const ac = abortRef.current
    // read latest thumbs via functional set to find first hole
    let holes = false
    setThumbs((prev) => {
      holes = prev.some((v) => !v)
      return prev
    })
    if (!holes) return
    setThumbs((prev) => {
      // find holes synchronously inside the updater is ugly; do it outside below
      return prev
    })
    // simpler: scan a snapshot captured above via closure trick
    void holes
  }, [])

  /** Fire-and-forget eager completion used by "Show all". */
  const completeRef = useRef<(onUpdate: (arr: string[]) => void) => Promise<void>>()
  completeRef.current = async (onUpdate) => {
    const session = sessionRef.current
    if (!session) return
    const ac = abortRef.current
    if (!ac || ac.signal.aborted) return
    setThumbs((prevArr) => {
      const firstHole = prevArr.findIndex((v) => !v)
      if (firstHole === -1) return prevArr
      const total = prevArr.length
      ;(async () => {
        const CHUNK = 12
        let s = firstHole + 1
        while (s <= total && !ac.signal.aborted) {
          const e2 = Math.min(s + CHUNK - 1, total)
          try {
            const map = await session.range(s, e2, ac.signal)
            if (ac.signal.aborted) return
            for (const [p, url] of map) prevArr[p - 1] = url
            onUpdate([...prevArr])
            s = e2 + 1
          } catch { return }
        }
      })()
      return prevArr
    })
  }

  const showAll = useCallback(async (): Promise<void> => {
    await completeRef.current?.((arr) => setThumbs(arr))
  }, [])

  const cancel = useCallback(() => {
    stop()
    setLoading(false)
    setProgress(null)
  }, [stop])

  return { thumbs: memoizedThumbs, load, fillAll: showAll, loading, progress, cancel }
}
