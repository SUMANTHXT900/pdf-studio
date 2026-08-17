import { useEffect, useState } from 'react'
import { ToolHeading, DropZone, FileChip, Button, Spinner, Card } from '../components/ui'
import { usePdfFiles } from '../hooks/usePdfFiles'
import { usePageThumbs } from '../hooks/usePageThumbs'
import { removePages, splitRanges } from '../lib/pdf'

export default function SplitTool() {
  const { files, setFiles, addFiles, error, busy, setBusy, setError } = usePdfFiles()
  const file = files[0] ?? null
  const { thumbs, load, loading } = usePageThumbs()
  const [count, setCount] = useState(0)
  const [keep, setKeep] = useState<boolean[]>([])
  const [mode, setMode] = useState<'pick' | 'ranges'>('pick')
  const [ranges, setRanges] = useState('')
  const [result, setResult] = useState<string | null>(null)
  const [preview, setPreview] = useState<number | null>(null)

  useEffect(() => {
    setResult(null)
    if (!file) { setKeep([]); setCount(0); return }
    let cancelled = false
    ;(async () => {
      const buf = file.data
      const t = await load(buf)
      if (cancelled) return
      setCount(t.length)
      setKeep(t.map(() => true))
    })()
    return () => { cancelled = true }
  }, [file, load])

  function toggle(i: number) {
    setKeep((prev) => prev.map((v, idx) => (idx === i ? !v : v)))
  }

  async function handleCreate() {
    if (!file) return
    setBusy(true); setError(null); setResult(null)
    try {
      const buf = file.data
      if (mode === 'pick') {
        const keepIdx = keep.map((v, i) => (v ? i : -1)).filter((i) => i >= 0)
        if (keepIdx.length === 0) throw new Error('Select at least one page to keep')
        const out = await removePages(buf, keepIdx)
        const blob = new Blob([out as unknown as BlobPart], { type: 'application/pdf' })
        setResult(URL.createObjectURL(blob))
      } else {
        const parsed = ranges
          .split(/[,\n]/)
          .map((p) => p.trim())
          .filter(Boolean)
          .map((p): [number, number] => {
            if (p.includes('-')) {
              const [a, b] = p.split('-').map((x) => parseInt(x, 10))
              return [a, b]
            }
            const n = parseInt(p, 10)
            return [n, n]
          })
          .filter(([a, b]) => !isNaN(a) && !isNaN(b))
        if (parsed.length === 0) throw new Error('Enter at least one page or range')
        const res = await splitRanges(buf, parsed)
        if (res.length === 1) {
          const blob = new Blob([res[0].bytes as unknown as BlobPart], { type: 'application/pdf' })
          setResult(URL.createObjectURL(blob))
        } else {
          // multiple files: download each sequentially
          for (const r of res) {
            const blob = new Blob([r.bytes as unknown as BlobPart], { type: 'application/pdf' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url; a.download = `${file.name.replace(/\.pdf$/i, '')}-p${r.range[0]}-${r.range[1]}.pdf`
            document.body.appendChild(a); a.click(); a.remove()
            setTimeout(() => URL.revokeObjectURL(url), 4000)
          }
          setResult('multi')
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Split failed')
    } finally { setBusy(false) }
  }

  const keepCount = keep.filter(Boolean).length

  return (
    <div className="py-6">
      <ToolHeading icon={<SplitIcon />} name="Split" desc="Uncheck the pages to drop, or extract by ranges" />

      {!file && (
        <DropZone accept="application/pdf" multiple={false} onFiles={(f) => addFiles(f)} title="Drop a PDF to split" hint="No upload — processed in your browser" />
      )}

      {file && (
        <div className="space-y-5">
          <FileChip name={file.name} size={file.size} onRemove={() => { setFiles([]); setResult(null) }} />

          <div className="flex gap-2">
            <button
              onClick={() => setMode('pick')}
              className={'flex-1 rounded-xl border px-4 py-2 text-sm transition-colors ' + (mode === 'pick' ? 'border-brass-400 bg-brass-400/10 text-ink-900 dark:text-paper-100' : 'border-paper-300 dark:border-ink-700 text-ink-400')}
            >Pick pages</button>
            <button
              onClick={() => setMode('ranges')}
              className={'flex-1 rounded-xl border px-4 py-2 text-sm transition-colors ' + (mode === 'ranges' ? 'border-brass-400 bg-brass-400/10 text-ink-900 dark:text-paper-100' : 'border-paper-300 dark:border-ink-700 text-ink-400')}
            >By ranges</button>
          </div>

          {mode === 'pick' && (
            <>
              {loading && <div className="flex items-center gap-2 text-sm text-ink-400"><Spinner /> Rendering pages…</div>}
              {!loading && (
                <Card>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium text-ink-700 dark:text-paper-100">Tap a page to remove it</p>
                    <span className="text-xs text-ink-400">{keepCount} of {count} kept</span>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {thumbs.map((src, i) => (
                      <button
                        key={i}
                        onClick={() => toggle(i)}
                        className={
                          'relative rounded-lg overflow-hidden border-2 transition-all ' +
                          (keep[i] ? 'border-transparent hover:border-brass-400' : 'border-red-400/70 opacity-40')
                        }
                      >
                        <img src={src} alt={`Page ${i + 1}`} className="w-full aspect-[3/4] object-cover bg-white" />
                        <span className="absolute bottom-0 left-0 right-0 bg-black/60 text-paper-100 text-[11px] py-0.5 text-center">
                          {keep[i] ? `Page ${i + 1}` : 'removed'}
                        </span>
                      </button>
                    ))}
                  </div>
                </Card>
              )}
            </>
          )}

          {mode === 'ranges' && (
            <Card>
              <p className="text-sm font-medium text-ink-700 dark:text-paper-100 mb-2">Pages to extract</p>
              <input
                value={ranges}
                onChange={(e) => setRanges(e.target.value)}
                placeholder="e.g. 1-3, 5, 8-10"
                className="w-full rounded-xl border border-paper-300 dark:border-ink-700 bg-paper-50 dark:bg-ink-900 px-4 py-2.5 text-sm text-ink-900 dark:text-paper-100 outline-none focus:border-brass-400"
              />
              <p className="text-xs text-ink-400 mt-2">One file per range; ranges produce multiple downloads.</p>
            </Card>
          )}

          {!result && (
            <Button onClick={handleCreate} disabled={busy} className="w-full">
              {busy ? <Spinner /> : mode === 'pick' ? 'Create PDF (drop removed)' : 'Extract pages'}
            </Button>
          )}

          {result && result !== 'multi' && (
            <Card>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-ink-900 dark:text-paper-100">Done</span>
                <span className="text-xs text-forest-600 dark:text-forest-400">{mode === 'pick' ? `${keepCount} pages` : 'extracted'}</span>
              </div>
              <a href={result} download={file.name.replace(/\.pdf$/i, '') + '-split.pdf'} className="inline-flex items-center gap-2 rounded-lg bg-ink-900 dark:bg-paper-100 text-paper-100 dark:text-ink-900 px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity">
                Download
              </a>
            </Card>
          )}

          {result === 'multi' && (
            <Card><p className="text-sm text-ink-400">Multiple files downloaded.</p></Card>
          )}
        </div>
      )}

      {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

      {preview !== null && thumbs[preview] && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setPreview(null)}>
          <img src={thumbs[preview]} alt={`Page ${preview + 1}`} className="max-w-3xl w-full rounded-xl shadow-2xl bg-white" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  )
}

function SplitIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v18" />
      <circle cx="6" cy="6" r="3" />
      <circle cx="18" cy="6" r="3" />
    </svg>
  )
}
