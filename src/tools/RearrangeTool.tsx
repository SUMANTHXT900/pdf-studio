import { useEffect, useState } from 'react'
import { Reorder } from 'framer-motion'
import { ToolHeading, DropZone, FileChip, Button, Spinner, Card } from '../components/ui'
import { usePdfFiles } from '../hooks/usePdfFiles'
import { usePageThumbs } from '../hooks/usePageThumbs'
import { reorderPages } from '../lib/pdf'

export default function RearrangeTool() {
  const { files, setFiles, addFiles, error, busy, setBusy, setError } = usePdfFiles()
  const file = files[0] ?? null
  const { thumbs, load, loading } = usePageThumbs()
  const [order, setOrder] = useState<number[]>([])
  const [result, setResult] = useState<string | null>(null)
  const [viewer, setViewer] = useState<number | null>(null) // index in `order` being previewed

  useEffect(() => {
    setResult(null)
    if (!file) { setOrder([]); return }
    let cancelled = false
    ;(async () => {
      const buf = file.data
      const t = await load(buf)
      if (!cancelled) setOrder(t.map((_, i) => i))
    })()
    return () => { cancelled = true }
  }, [file, load])

  async function handleRearrange() {
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
  }

  function move(idx: number, dir: -1 | 1) {
    setOrder((prev) => {
      const next = [...prev]
      const j = idx + dir
      if (j < 0 || j >= next.length) return prev
      ;[next[idx], next[j]] = [next[j], next[idx]]
      return next
    })
  }

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
                {order.map((pageIdx, i) => (
                  <Reorder.Item key={pageIdx} value={pageIdx} className="flex items-center gap-3 rounded-xl border border-paper-300 dark:border-ink-700 bg-paper-50 dark:bg-ink-800/60 px-3 py-2 cursor-grab active:cursor-grabbing">
                    <span className="w-6 text-center text-xs font-mono text-ink-400">{i + 1}</span>
                    <button
                      onClick={() => setViewer(i)}
                      className="flex-1 flex items-center gap-3 text-left"
                    >
                      {thumbs[pageIdx] ? (
                        <img src={thumbs[pageIdx]} alt={`Page ${pageIdx + 1}`} className="w-10 h-14 object-cover rounded border border-paper-300 dark:border-ink-700" />
                      ) : (
                        <div className="w-10 h-14 rounded bg-paper-200 dark:bg-ink-700" />
                      )}
                      <span className="text-sm text-ink-700 dark:text-paper-100">Page {pageIdx + 1}</span>
                    </button>
                    <div className="flex flex-col">
                      <button onClick={() => move(i, -1)} disabled={i === 0} className="px-1.5 py-0.5 text-ink-400 hover:text-brass-500 disabled:opacity-30" aria-label="Move up">↑</button>
                      <button onClick={() => move(i, 1)} disabled={i === order.length - 1} className="px-1.5 py-0.5 text-ink-400 hover:text-brass-500 disabled:opacity-30" aria-label="Move down">↓</button>
                    </div>
                  </Reorder.Item>
                ))}
              </Reorder.Group>
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
              <img src={thumbs[order[viewer]]} alt={`Page ${order[viewer] + 1}`} className="w-full rounded-xl shadow-2xl bg-white" />
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
