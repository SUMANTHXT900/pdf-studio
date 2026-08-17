import { useState } from 'react'
import { Reorder } from 'framer-motion'
import { ToolHeading, DropZone, FileChip, Button, Spinner, Card, formatBytes } from '../components/ui'
import { usePdfFiles } from '../hooks/usePdfFiles'
import { mergePdfs, downloadBytes, stripExt } from '../lib/pdf'

const MERGE_ICON = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18M3 12h12M3 18h6" />
  </svg>
)

export default function MergeTool() {
  const { files, setFiles, addFiles, remove, clear } = usePdfFiles()
  const [working, setWorking] = useState(false)
  const [done, setDone] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const onMerge = async () => {
    if (files.length < 2) return
    setWorking(true)
    setDone(null)
    setError(null)
    try {
      const out = await mergePdfs(files.map((f) => f.data))
      const name = `merged-${stripExt(files[0].name)}-${files.length}.pdf`
      await downloadBytes(out, name)
      setDone(name)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setWorking(false)
    }
  }

  return (
    <div>
      <ToolHeading icon={MERGE_ICON} name="Merge PDFs" desc="Combine two or more PDF files into a single document. Drag to set the order." />

      <DropZone accept="application/pdf" multiple onFiles={addFiles} />

      {files.length > 0 && (
        <div className="mt-6">
          <Reorder.Group axis="y" values={files} onReorder={setFiles} className="flex flex-col gap-2">
            {files.map((f, i) => (
              <Reorder.Item key={f.id} value={f} className="list-none relative">
                <div className="flex items-center gap-3 rounded-xl border border-paper-300 dark:border-ink-700 bg-paper-50 dark:bg-ink-800 px-2 pl-3 py-3">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-ink-300 dark:text-ink-600 shrink-0">
                    <circle cx="12" cy="6" r="1.6" /><circle cx="12" cy="12" r="1.6" /><circle cx="12" cy="18" r="1.6" />
                  </svg>
                  <span className="w-6 text-sm font-mono text-ink-400 shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink-900 dark:text-paper-100 truncate">{f.name}</p>
                    <p className="text-xs text-ink-400 dark:text-ink-300">{formatBytes(f.size)}</p>
                  </div>
                  <button
                    onClick={() => remove(f.id)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors shrink-0"
                    aria-label={`Remove ${f.name}`}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 6 6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </Reorder.Item>
            ))}
          </Reorder.Group>

          <div className="mt-6 flex items-center gap-4">
            <Button onClick={onMerge} disabled={working || files.length < 2}>
              {working ? 'Merging…' : `Merge ${files.length} files`}
            </Button>
            <button onClick={clear} className="text-sm text-ink-400 hover:text-red-500">Clear all</button>
          </div>
        </div>
      )}

      {working && <Spinner label="Combining pages…" />}
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