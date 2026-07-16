import { useEffect, useState } from 'react'
import type { PDFDocumentProxy } from 'pdfjs-dist'

interface Props {
  pdfDoc: PDFDocumentProxy
  activePages: number[]
  onSelect: (page: number) => void
}

export default function PageThumbnails({ pdfDoc, activePages, onSelect }: Props) {
  const [thumbs, setThumbs] = useState<string[]>([])

  useEffect(() => {
    let cancelled = false
    setThumbs([])
    void (async () => {
      const urls: string[] = []
      for (let i = 1; i <= pdfDoc.numPages; i++) {
        if (cancelled) return
        const page = await pdfDoc.getPage(i)
        const viewport = page.getViewport({ scale: 0.15 })
        const canvas = document.createElement('canvas')
        canvas.width = viewport.width
        canvas.height = viewport.height
        await page.render({ canvas, viewport }).promise
        urls.push(canvas.toDataURL())
        if (!cancelled) setThumbs([...urls])
      }
    })()
    return () => {
      cancelled = true
    }
  }, [pdfDoc])

  return (
    <div className="flex gap-2 overflow-x-auto border-t border-dark/10 bg-white/90 p-2 backdrop-blur">
      {thumbs.map((src, idx) => (
        <button
          key={idx}
          onClick={() => onSelect(idx + 1)}
          className={`shrink-0 overflow-hidden rounded border-2 ${
            activePages.includes(idx + 1) ? 'border-primary' : 'border-transparent'
          }`}
        >
          <img src={src} alt={`페이지 ${idx + 1}`} className="h-16 w-auto" />
        </button>
      ))}
    </div>
  )
}
