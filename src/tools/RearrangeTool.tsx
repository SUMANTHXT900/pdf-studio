import { useEffect, useState, useMemo, memo, useCallback } from 'react'
import { Reorder } from 'framer-motion'
import { ToolHeading, DropZone, FileChip, Button, Spinner, Card } from '../components/ui'
import { usePdfFiles } from '../hooks/usePdfFiles'
import { usePageThumbs } from '../hooks/usePageThumbs'
import { reorderPages } from '../lib/pdf'

const PAGE_LIMIT = 24

const RearrangeRow = memo(function RearrangeRow({ pageIdx, pos, thumb, onMoveUp, onMoveDown, onPreview, isFirst, isLast }: { pageIdx: number; pos: number; thumb: string; onMoveUp: () => void; onMoveDown: () => void; onPreview: () => void; isFirst: boolean; isLast: boolean }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-paper-300 dark:border-ink-700 bg-paper-50 dark:bg-ink-800/60 px-3 py-2">
      <span className="w-6 text-center text-xs font-mono text-ink-400">{pos + 1}</span>
      <button onClick={onPreview} className="flex-1 flex items-center gap-3 text-left">
        {thumb ? (
          <img src={thumb} alt={`Page ${pageIdx + 1}`} loading="lazy" decoding="async" className="w-10 h-14 object-cover rounded border border-paper-300 dark:border-ink-700" />
        ) : (
          <div className="w-10 h-14 rounded bg-paper-200 dark:bg-ink-700 animate-pulse" />
        )}
        <span className="text-sm text-ink-700 dark:text-paper-100">Page {pageIdx + 1}</span>
      </button>
      <div className="flex flex-col">
        <button onClick={onMoveUp} disabled={isFirst} className="px-1.5 py-0.5 text-ink-400 hover:text-brass-500 disabled:opacity-30" aria-label="Move up">↑</button>
        <button onClick={onMoveDown} disabled={isLast} className="px-1.5 py-0.5 text-ink-400 hover:text-brass-500 disabled:opacity-30" aria-label="Move down">↓</button>
      </div>
    </div>
  )
})

export default function RearrangeTool() {
  const { files, setFiles, addFiles, error, busy, setBusy, setError } = usePdfFiles()
  const file = files[0] ?? null
  const { thumbs, load, loading } = usePageThumbs()
  const [order, setOrder] = useState<number[]>([])
  const [result, setResult] = useState<string | null>(null)
  const [viewer, setViewer] = useState<number | null>(null)
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    setResult(null)
    setShowAll(false)
    if (!file) { setOrder([]); return }
    let cancelled = false
    ;(async () => {
      const buf = file.data
      const t = await load(buf)
      if (!cancelled) setOrder(t.map((_, i) => i))
    })()
    return () => { cancelled = true }
  }, [file, load])

  const visibleOrder = useMemo(() => {
    if (order.length <= 30 || showAll) return order
    return order.slice(0, PAGE_LIMIT)
  }, [order, showAll])
  const hiddenCount = order.length - visibleOrder.length

  const handleRearrange = useCallback(async () => {
    if (!file) return
    setBusy(true); setError(null); setResult(null)
    try {
      const buf = file.data
      const out = await reorderPages(buf, order)
      const blob = new Blob([out as unknown as BlobPart], { type: 'application/pdf' })
      setResult(URL.createObjectURL(blob))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Rearrange failed')
    } finally { setBusy(false) }
  }, [file, order, setBusy, setError])

  const move = useCallback((idx: number, dir: -1 | 1) => {
    setOrder((prev) => {
      const next = [...prev]
      const j = idx + dir
      if (j < 0 || j >= next.length) return prev
      ;[next[idx], next[j]] = [next[j], next[idx]]
      return next
    })
  }, [])

  return (
    <div className="py-6">
      <ToolHeading icon={<RearrangeIcon />} name="Rearrange" desc="Drag to reorder, or use the arrows — click a page to preview it" />

      {!file && (
        <DropZone accept="application/pdf" multiple={false} onFiles={(f) => addFiles(f)} title="Drop a PDF to rearrange" hint="No upload — processed in your browser" />
      )}

      {file && (
        <div className="space-y-5">
          <FileChip name={file.name} size={file.size} onRemove={() => { setFiles([]); setResult(null) }} />

          {loading && (
            <div className="flex items-center gap-2 text-sm text-ink-400"><Spinner /> Rendering page previews…</div>
          )}

          {!loading && order.length > 0 && (
            <Card>
              <p className="text-sm font-medium text-ink-700 dark:text-paper-100 mb-3">Drag, click to preview, or use arrows</p>
              <Reorder.Group axis="y" values={order} onReorder={setOrder} className="space-y-2">
                {visibleOrder.map((pageIdx, i) => (
                  <Reorder.Item key={pageIdx} value={pageIdx} className="list-none">
                    <RearrangeRow
                      pageIdx={pageIdx}
                      pos={i}
                      thumb={thumbs[pageIdx]}
                      onMoveUp={() => move(i, -1)}
                      onMoveDown={() => move(i, 1)}
                      onPreview={() => setViewer(i)}
                      isFirst={i === 0}
                      isLast={i === order.length - 1}
                    />
                  </Reorder.Item>
                ))}
              </Reorder.Group>
              {hiddenCount > 0 && (
                <button onClick={() => setShowAll(true)} className="mt-3 w-full rounded-xl border-2 border-dashed border-paper-300 dark:border-ink-700 py-3 text-sm text-ink-500 hover:border-brass-400 hover:text-brass-600 transition-colors">
                  Show {hiddenCount} more pages
                </button>
              )}
              {hiddenCount === 0 && order.length > 30 && showAll && (
                <button onClick={() => setShowAll(false)} className="mt-3 text-xs text-ink-400 hover:text-ink-700">Show less</button>
              )}
            </Card>
          )}

          {!result && order.length > 0 && (
            <Button onClick={handleRearrange} disabled={busy} className="w-full">
              {busy ? <Spinner /> : 'Save rearranged PDF'}
            </Button>
          )}

          {result && (
            <Card>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-ink-900 dark:text-paper-100">Done</span>
                <span className="text-xs text-forest-600 dark:text-forest-400">pages reordered</span>
              </div>
              <a href={result} download={file.name.replace(/\.pdf$/i, '') + '-rearranged.pdf'} className="inline-flex items-center gap-2 rounded-lg bg-ink-900 dark:bg-paper-100 text-paper-100 dark:text-ink-900 px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity">
                Download rearranged PDF
              </a>
            </Card>
          )}
        </div>
      )}

      {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

      {viewer !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setViewer(null)}
        >
          <div className="max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-2 text-paper-100">
              <span className="font-display text-lg">Page {order[viewer] + 1}</span>
              <button onClick={() => setViewer(null)} className="rounded-full bg-white/10 px-3 py-1 text-sm hover:bg-white/20">Close</button>
            </div>
            {thumbs[order[viewer]] && (
              <img src={thumbs[order[viewer]]} alt={`Page ${order[viewer] + 1}`} loading="lazy" className="w-full rounded-xl shadow-2xl bg-white" />
            )}
          </div>
        </div>
      )}
    </div>
  )
}
function RearrangeIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 8l6-5-6 5zm0 0 6 5M21 16l-6 5 6-5zm0 0-6-5" />
    </svg>
  )
}
