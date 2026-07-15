import { useCallback, useEffect, useRef, useState } from 'react'
import type { PDFDocumentProxy } from 'pdfjs-dist'
import { getPageStrokes, savePageStrokes } from '../lib/annotationDb'
import type { Stroke, StrokePoint } from '../types'

interface Props {
  pdfDoc: PDFDocumentProxy
  pageNumber: number
  scale: number
  scoreId: string
  penColor: string
  penWidth: number
  drawingEnabled: boolean
  clearSignal: number
}

export default function PdfPage({
  pdfDoc,
  pageNumber,
  scale,
  scoreId,
  penColor,
  penWidth,
  drawingEnabled,
  clearSignal,
}: Props) {
  const pdfCanvasRef = useRef<HTMLCanvasElement>(null)
  const annCanvasRef = useRef<HTMLCanvasElement>(null)
  const strokesRef = useRef<Stroke[]>([])
  const currentStrokeRef = useRef<Stroke | null>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    let cancelled = false
    let renderTask: ReturnType<Awaited<ReturnType<PDFDocumentProxy['getPage']>>['render']> | null = null

    void (async () => {
      const page = await pdfDoc.getPage(pageNumber)
      if (cancelled) return
      const viewport = page.getViewport({ scale })
      const canvas = pdfCanvasRef.current
      if (!canvas) return
      canvas.width = viewport.width
      canvas.height = viewport.height
      setSize({ width: viewport.width, height: viewport.height })
      renderTask = page.render({ canvas, viewport })
      await renderTask.promise
    })()

    return () => {
      cancelled = true
      renderTask?.cancel()
    }
  }, [pdfDoc, pageNumber, scale])

  const redraw = useCallback(() => {
    const canvas = annCanvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    for (const stroke of strokesRef.current) {
      if (stroke.points.length < 2) continue
      ctx.beginPath()
      ctx.strokeStyle = stroke.color
      ctx.lineWidth = stroke.width
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y)
      for (const pt of stroke.points.slice(1)) ctx.lineTo(pt.x, pt.y)
      ctx.stroke()
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    void (async () => {
      const strokes = await getPageStrokes(scoreId, pageNumber)
      if (cancelled) return
      strokesRef.current = strokes
      redraw()
    })()
    return () => {
      cancelled = true
    }
  }, [scoreId, pageNumber, redraw])

  useEffect(() => {
    const canvas = annCanvasRef.current
    if (!canvas) return
    canvas.width = size.width
    canvas.height = size.height
    redraw()
  }, [size, redraw])

  const clearSignalRef = useRef(clearSignal)
  useEffect(() => {
    if (clearSignal === clearSignalRef.current) return
    clearSignalRef.current = clearSignal
    strokesRef.current = []
    redraw()
    void savePageStrokes(scoreId, pageNumber, [])
  }, [clearSignal, scoreId, pageNumber, redraw])

  const getPoint = (e: React.PointerEvent<HTMLCanvasElement>): StrokePoint => {
    const rect = e.currentTarget.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingEnabled) return
    e.currentTarget.setPointerCapture(e.pointerId)
    currentStrokeRef.current = { points: [getPoint(e)], color: penColor, width: penWidth }
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const stroke = currentStrokeRef.current
    if (!stroke) return
    stroke.points.push(getPoint(e))
    const ctx = annCanvasRef.current?.getContext('2d')
    if (!ctx || stroke.points.length < 2) return
    const [a, b] = stroke.points.slice(-2)
    ctx.beginPath()
    ctx.strokeStyle = stroke.color
    ctx.lineWidth = stroke.width
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.moveTo(a.x, a.y)
    ctx.lineTo(b.x, b.y)
    ctx.stroke()
  }

  const finishStroke = () => {
    const stroke = currentStrokeRef.current
    currentStrokeRef.current = null
    if (!stroke || stroke.points.length < 2) return
    strokesRef.current = [...strokesRef.current, stroke]
    void savePageStrokes(scoreId, pageNumber, strokesRef.current)
  }

  return (
    <div className="relative mx-auto" style={{ width: size.width || undefined, height: size.height || undefined }}>
      <canvas ref={pdfCanvasRef} className="block rounded-lg bg-white shadow" />
      <canvas
        ref={annCanvasRef}
        className="absolute inset-0"
        style={{
          cursor: drawingEnabled ? 'crosshair' : 'default',
          touchAction: drawingEnabled ? 'none' : 'pan-x pan-y pinch-zoom',
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishStroke}
        onPointerLeave={finishStroke}
        onPointerCancel={finishStroke}
      />
    </div>
  )
}
