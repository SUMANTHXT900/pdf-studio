import { useCallback, useEffect, useRef, useState } from 'react'
import { pageCount, renderThumb } from '../lib/pdf'

export function usePageThumbs() {
  const [thumbs, setThumbs] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const cancelRef = useRef(false)

  const load = useCallback(async (buffer: ArrayBuffer): Promise<string[]> => {
    cancelRef.current = true // cancel any in-flight
    const myToken = Symbol()
    ;(load as any)._token = myToken
    setLoading(true)
    setThumbs([])
    const total = await pageCount(buffer)
    const out: string[] = new Array(total).fill('')
    setThumbs([...out])
    for (let i = 1; i <= total; i += 4) {
      if (cancelRef.current && (load as any)._token !== myToken) break
      const batch = await Promise.all(
        Array.from({ length: Math.min(4, total - i + 1) }, async (_, k) => {
          const p = i + k
          return { thumb: await renderThumb(buffer, p), page: p }
        }),
      )
      for (const b of batch) out[b.page - 1] = b.thumb
      setThumbs([...out])
    }
    setLoading(false)
    return out
  }, [])

  useEffect(() => () => { cancelRef.current = true }, [])

  return { thumbs, load, loading }
}
