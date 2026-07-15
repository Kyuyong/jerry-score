import { useEffect, useMemo, useRef, useState } from 'react'
import type { TouchEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Header from '../components/Header'
import ViewerToolbar from '../components/ViewerToolbar'
import PdfPage from '../components/PdfPage'
import PageThumbnails from '../components/PageThumbnails'
import { usePdfDocument } from '../hooks/usePdfDocument'
import { getScores } from '../lib/scoreStore'

const MIN_SCALE = 0.5
const MAX_SCALE = 3
const SWIPE_THRESHOLD = 60

export default function ViewerPage() {
  const { scoreId } = useParams<{ scoreId: string }>()
  const navigate = useNavigate()
  const { pdfDoc, loading, error } = usePdfDocument(scoreId)
  const [page, setPage] = useState(1)
  const [scale, setScale] = useState(1.2)
  const [drawingEnabled, setDrawingEnabled] = useState(true)
  const [showThumbs, setShowThumbs] = useState(false)
  const [clearSignal, setClearSignal] = useState(0)
  const touchStartX = useRef<number | null>(null)

  const score = useMemo(() => getScores().find((s) => s.id === scoreId), [scoreId])
  const numPages = pdfDoc?.numPages ?? 0

  useEffect(() => {
    setPage(1)
  }, [scoreId])

  useEffect(() => {
    if (!scoreId) navigate('/')
  }, [scoreId, navigate])

  if (!scoreId) return null

  const goPrev = () => setPage((p) => Math.max(1, p - 1))
  const goNext = () => setPage((p) => Math.min(numPages, p + 1))

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    if (drawingEnabled) return
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e: TouchEvent<HTMLDivElement>) => {
    if (drawingEnabled || touchStartX.current === null) return
    const delta = e.changedTouches[0].clientX - touchStartX.current
    touchStartX.current = null
    if (delta > SWIPE_THRESHOLD) goPrev()
    else if (delta < -SWIPE_THRESHOLD) goNext()
  }

  return (
    <div className="flex h-screen flex-col bg-dark/5">
      <Header title={score?.title ?? '악보'} back />
      <ViewerToolbar
        page={page}
        numPages={numPages}
        scale={scale}
        drawingEnabled={drawingEnabled}
        onPrev={goPrev}
        onNext={goNext}
        onZoomIn={() => setScale((s) => Math.min(MAX_SCALE, s + 0.2))}
        onZoomOut={() => setScale((s) => Math.max(MIN_SCALE, s - 0.2))}
        onToggleDraw={() => setDrawingEnabled((d) => !d)}
        onClearPage={() => {
          if (confirm('이 페이지의 필기를 모두 지울까요?')) setClearSignal((c) => c + 1)
        }}
        onToggleThumbs={() => setShowThumbs((v) => !v)}
      />
      <div className="flex-1 overflow-auto p-4" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        {loading && <p className="text-center text-dark/50">악보를 불러오는 중...</p>}
        {error && <p className="text-center text-red-600">{error}</p>}
        {pdfDoc && (
          <PdfPage
            pdfDoc={pdfDoc}
            pageNumber={page}
            scale={scale}
            scoreId={scoreId}
            penColor="#4A4A4A"
            penWidth={2.5}
            drawingEnabled={drawingEnabled}
            clearSignal={clearSignal}
          />
        )}
      </div>
      {showThumbs && pdfDoc && (
        <PageThumbnails
          pdfDoc={pdfDoc}
          currentPage={page}
          onSelect={(p) => {
            setPage(p)
            setShowThumbs(false)
          }}
        />
      )}
    </div>
  )
}
