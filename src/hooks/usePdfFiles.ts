import { useCallback, useState } from 'react'
import { PdfFile, fileToArrayBuffer, makeId } from '../lib/pdf'

export function usePdfFiles() {
  const [files, setFiles] = useState<PdfFile[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const addFiles = useCallback(async (f: File[]) => {
    setBusy(true)
    setError(null)
    try {
      const pdfs = f.filter((x) => x.type === 'application/pdf' || x.name.toLowerCase().endsWith('.pdf'))
      if (pdfs.length < f.length) {
        setError('Skipped non-PDF file(s).')
      }
      const loaded = await Promise.all(
        pdfs.map(async (file): Promise<PdfFile> => ({
          id: makeId(),
          name: file.name,
          size: file.size,
          data: await fileToArrayBuffer(file),
        })),
      )
      setFiles((prev) => [...prev, ...loaded])
    } catch (e) {
      setError('Could not read those files.')
    } finally {
      setBusy(false)
    }
  }, [])

  const remove = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id))
  }, [])

  const clear = useCallback(() => setFiles([]), [])

  return { files, setFiles, addFiles, remove, clear, busy, setBusy, error, setError }
}
