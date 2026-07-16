import { useEffect, useMemo, useRef, useState } from 'react'
import type { TouchEvent, WheelEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Header from '../components/Header'
import ViewerToolbar from '../components/ViewerToolbar'
import PdfPage from '../components/PdfPage'
import PageThumbnails from '../components/PageThumbnails'
import { usePdfDocument } from '../hooks/usePdfDocument'
import { getScores, updateScorePageCount } from '../lib/scoreStore'
import { clearPageStrokes } from '../lib/annotationDb'

const MIN_SCALE = 0.5
const MAX_SCALE = 3
const SWIPE_THRESHOLD = 60
const RENDER_SCALE = 2.4

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))

function getSpread(page: number, numPages: number, twoPageView: boolean): number[] {
  if (numPages <= 0) return []
  if (twoPageView) {
    return [page, page + 1].filter((n) => n <= numPages)
  }
  return [Math.min(page, numPages)]
}

export default function ViewerPage() {
  const { scoreId } = useParams<{ scoreId: string }>()
  const navigate = useNavigate()
  const { pdfDoc, loading, error } = usePdfDocument(scoreId)
  const [page, setPage] = useState(1)
  const [scale, setScale] = useState(1.2)
  const [drawingEnabled, setDrawingEnabled] = useState(false)
  const [showThumbs, setShowThumbs] = useState(false)
  const [reloadToken, setReloadToken] = useState(0)
  const [isLandscape, setIsLandscape] = useState(
    () => window.matchMedia('(orientation: landscape)').matches,
  )
  const [twoPageView, setTwoPageView] = useState(false)
  const touchStartX = useRef<number | null>(null)
  const pinchRef = useRef<{ dist: number; scale: number } | null>(null)

  const score = useMemo(() => getScores().find((s) => s.id === scoreId), [scoreId])
  const numPages = pdfDoc?.numPages ?? 0
  const spread = useMemo(
    () => getSpread(page, numPages, twoPageView && isLandscape),
    [page, numPages, twoPageView, isLandscape],
  )

  useEffect(() => {
    setPage(1)
  }, [scoreId])

  useEffect(() => {
    if (!scoreId) navigate('/')
  }, [scoreId, navigate])

  useEffect(() => {
    if (pdfDoc && scoreId) updateScorePageCount(scoreId, pdfDoc.numPages)
  }, [pdfDoc, scoreId])

  useEffect(() => {
    const mq = window.matchMedia('(orientation: landscape)')
    const handler = (e: MediaQueryListEvent) => setIsLandscape(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  useEffect(() => {
    if (!isLandscape) setTwoPageView(false)
  }, [isLandscape])

  if (!scoreId) return null

  const goPrev = () => setPage((p) => Math.max(1, p - 1))
  const goNext = () => setPage((p) => Math.min(numPages, p + 1))

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2) {
      const [a, b] = [e.touches[0], e.touches[1]]
      pinchRef.current = { dist: Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY), scale }
      touchStartX.current = null
    } else if (e.touches.length === 1 && !drawingEnabled) {
      touchStartX.current = e.touches[0].clientX
    }
  }

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2 && pinchRef.current) {
      const [a, b] = [e.touches[0], e.touches[1]]
      const dist = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY)
      const factor = dist / pinchRef.current.dist
      setScale(clamp(pinchRef.current.scale * factor, MIN_SCALE, MAX_SCALE))
    }
  }

  const handleTouchEnd = (e: TouchEvent<HTMLDivElement>) => {
    if (e.touches.length < 2) pinchRef.current = null
    if (touchStartX.current !== null && e.changedTouches.length) {
      const delta = e.changedTouches[0].clientX - touchStartX.current
      touchStartX.current = null
      if (delta > SWIPE_THRESHOLD) goPrev()
      else if (delta < -SWIPE_THRESHOLD) goNext()
    }
  }

  const handleWheel = (e: WheelEvent<HTMLDivElement>) => {
    if (!e.ctrlKey) return
    e.preventDefault()
    setScale((s) => clamp(+(s - e.deltaY * 0.004).toFixed(2), MIN_SCALE, MAX_SCALE))
  }

  const handleClear = () => {
    if (!confirm('보이는 페이지의 필기를 모두 지울까요?')) return
    void Promise.all(spread.map((n) => clearPageStrokes(scoreId, n))).then(() => {
      setReloadToken((t) => t + 1)
    })
  }

  const pageLabel = spread.length === 2 ? `${spread[0]}-${spread[1]}` : String(spread[0] ?? 1)

  return (
    <div className="flex h-screen flex-col bg-dark/5">
      <Header title={score?.title ?? '악보'} back />
      <ViewerToolbar
        pageLabel={pageLabel}
        numPages={numPages}
        canPrev={spread.length ? spread[0] > 1 : false}
        canNext={spread.length ? spread[spread.length - 1] < numPages : false}
        scale={scale}
        drawingEnabled={drawingEnabled}
        isLandscape={isLandscape}
        twoPageView={twoPageView}
        onPrev={goPrev}
        onNext={goNext}
        onZoomIn={() => setScale((s) => clamp(+(s + 0.2).toFixed(2), MIN_SCALE, MAX_SCALE))}
        onZoomOut={() => setScale((s) => clamp(+(s - 0.2).toFixed(2), MIN_SCALE, MAX_SCALE))}
        onToggleDraw={() => setDrawingEnabled((d) => !d)}
        onClearPage={handleClear}
        onToggleThumbs={() => setShowThumbs((v) => !v)}
        onToggleTwoPage={() => setTwoPageView((v) => !v)}
      />
      <div
        className="flex-1 overflow-auto p-4"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
      >
        {loading && <p className="text-center text-dark/50">악보를 불러오는 중...</p>}
        {error && <p className="text-center text-red-600">{error}</p>}
        {pdfDoc && (
          <div
            className="flex w-fit gap-3.5"
            style={{ margin: '0 auto', transform: `scale(${scale / RENDER_SCALE})`, transformOrigin: 'top center' }}
          >
            {spread.map((pageNum) => (
              <PdfPage
                key={pageNum}
                pdfDoc={pdfDoc}
                pageNumber={pageNum}
                renderScale={RENDER_SCALE}
                scoreId={scoreId}
                penColor="#4A4A4A"
                penWidth={2.5}
                drawingEnabled={drawingEnabled}
                reloadToken={reloadToken}
              />
            ))}
          </div>
        )}
      </div>
      {showThumbs && pdfDoc && (
        <PageThumbnails
          pdfDoc={pdfDoc}
          activePages={spread}
          onSelect={(p) => {
            setPage(p)
            setShowThumbs(false)
          }}
        />
      )}
    </div>
  )
}
