import { useEffect, useState } from 'react'
import { ToolHeading, DropZone, FileChip, Button, Spinner, Card } from '../components/ui'
import { usePdfFiles } from '../hooks/usePdfFiles'
import { usePageThumbs } from '../hooks/usePageThumbs'
import { applyRotations, downloadBytes, stripExt } from '../lib/pdf'

const ICON = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12a9 9 0 1 1-9-9c2.5 0 4.75 1 6.4 2.6L21 8" />
    <path d="M21 3v5h-5" />
  </svg>
)

export default function RotateTool() {
  const { files, addFiles, remove, clear } = usePdfFiles()
  const file = files[0]
  const { thumbs, load, loading } = usePageThumbs()

  useEffect(() => {
    if (file) load(file.data)
  }, [file, load])

  // rotations: page index -> net +1 (clockwise) increments; allRot applies to every page
  const [rot, setRot] = useState<Record<number, number>>({})
  const [allRot, setAllRot] = useState(0)
  const [working, setWorking] = useState(false)
  const [done, setDone] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const spinOne = (pageIndex: number, delta: number) => {
    setRot((r) => ({ ...r, [pageIndex]: (((r[pageIndex] || 0) + delta) % 4 + 4) % 4 }))
  }

  const spinAll = (delta: number) => {
    setAllRot((a) => (((a + delta) % 4) + 4) % 4)
  }

  const onDownload = async () => {
    if (!file) return
    setWorking(true)
    setError(null)
    try {
      // bake any pending global rotation into the per-page map before applying
      let final = rot
      if (allRot !== 0 && thumbs.length > 0) {
        final = { ...rot }
        thumbs.forEach((_, idx) => {
          final[idx] = (((final[idx] || 0) + allRot) % 4 + 4) % 4
        })
      }
      const out = await applyRotations(file.data, final)
      const name = `${stripExt(file.name)}-rotated.pdf`
      await downloadBytes(out as unknown as Uint8Array, name)
      setDone(name)
    } catch {
      setError('Could not rotate the PDF.')
    } finally {
      setWorking(false)
    }
  }

  return (
    <div>
      <ToolHeading icon={ICON} name="Rotate pages" desc="Rotate individual pages or the whole document." />

      {!file ? (
        <DropZone accept="application/pdf" onFiles={addFiles} title="Drop a PDF to rotate" />
      ) : (
        <>
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <div className="flex-none"><FileChip name={file.name} size={file.size} onRemove={() => { setRot({}); setAllRot(0); remove(file.id) }} /></div>
            <Button variant="ghost" onClick={() => {
              setRot((r) => {
                const next = { ...r }
                thumbs.forEach((_, idx) => {
                  next[idx] = (((next[idx] || 0) + allRot) % 4 + 4) % 4
                })
                return next
              })
              setAllRot(0)
            }} disabled={working || !allRot}>Apply all</Button>
            <Button variant="ghost" onClick={() => spinAll(1)} disabled={working}>↻ All +90°</Button>
            <Button variant="ghost" onClick={() => spinAll(-1)} disabled={working}>↺ All −90°</Button>
          </div>

          {allRot !== 0 && (
            <p className="text-xs text-brass-500 mb-3">＋{allRot * 90}° to every page — press “Apply all” to preview, or Download.</p>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {thumbs.map((src, idx) => {
              const angle = (rot[idx] || 0) * 90
              return (
                <div key={idx} className="flex flex-col items-center gap-2">
                  <div
                    className="w-full aspect-[3/4] rounded-lg overflow-hidden border-2 border-paper-300 dark:border-ink-700 bg-white relative"
                    style={{ transform: `rotate(${angle}deg)`, transition: 'transform .2s' }}
                  >
                    {src ? (
                      <img src={src} alt={`Page ${idx + 1}`} className="w-full h-full object-scale-down" />
                    ) : (
                      <span className="absolute inset-0 flex items-center justify-center text-xs text-ink-400 animate-pulse">…</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => spinOne(idx, -1)}
                      className="w-8 h-8 rounded-lg border border-paper-300 dark:border-ink-700 flex items-center justify-center text-sm hover:bg-paper-200 dark:hover:bg-ink-800 transition-colors"
                      aria-label="Rotate left"
                    >↺</button>
                    <span className="w-6 text-center text-xs font-medium text-ink-400">{idx + 1}</span>
                    <button
                      onClick={() => spinOne(idx, 1)}
                      className="w-8 h-8 rounded-lg border border-paper-300 dark:border-ink-700 flex items-center justify-center text-sm hover:bg-paper-200 dark:hover:bg-ink-800 transition-colors"
                      aria-label="Rotate right"
                    >↻</button>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-8">
            <Button onClick={onDownload} disabled={working || thumbs.length === 0}>
              Download rotated PDF
            </Button>
            <button onClick={() => { setRot({}); setAllRot(0) }} className="ml-4 text-sm text-ink-400 hover:text-ink-900 dark:hover:text-paper-100">Reset</button>
          </div>
        </>
      )}

      {working && <Spinner label="Rotating…" />}
      {done && (
        <Card className="mt-6 border-forest-400/40">
          <p className="text-sm text-forest-500 dark:text-forest-400">✓ Check your downloads — <span className="font-medium">{done}</span></p>
        </Card>
      )}
      {error && (
        <Card className="mt-6 border-red-500/40">
          <p className="text-sm text-red-500">{error}</p>
        </Card>
      )}
    </div>
  )
}