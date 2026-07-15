import { useEffect, useState } from 'react'
import type { PDFDocumentProxy } from 'pdfjs-dist'
import { pdfjsLib } from '../lib/pdf'
import { downloadFileBlob } from '../lib/googleDrive'

export function usePdfDocument(scoreId: string | undefined) {
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!scoreId) return
    let cancelled = false
    let doc: PDFDocumentProxy | null = null
    setLoading(true)
    setError(null)
    setPdfDoc(null)

    void (async () => {
      try {
        const blob = await downloadFileBlob(scoreId)
        const buffer = await blob.arrayBuffer()
        if (cancelled) return
        doc = await pdfjsLib.getDocument({ data: buffer }).promise
        if (cancelled) {
          void doc.destroy()
          return
        }
        setPdfDoc(doc)
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'PDF를 불러오지 못했어요.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
      void doc?.destroy()
    }
  }, [scoreId])

  return { pdfDoc, loading, error }
}
