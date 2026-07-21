import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { TouchEvent, WheelEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Header from '../components/Header'
import ViewerToolbar from '../components/ViewerToolbar'
import PdfPage from '../components/PdfPage'
import PageThumbnails from '../components/PageThumbnails'
import { usePdfDocument } from '../hooks/usePdfDocument'
import { useWakeLock } from '../hooks/useWakeLock'
import { getScores, updateScorePageCount } from '../lib/scoreStore'
import { clearPageStrokes } from '../lib/annotationDb'

const MIN_SCALE = 0.5
const MAX_SCALE = 3
const DEFAULT_SCALE = 1.2
const SWIPE_THRESHOLD = 60
const RENDER_SCALE = 2.4
const SPREAD_GAP = 14 // px, matches the `gap-3.5` row between spread pages

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
  useWakeLock(Boolean(pdfDoc))
  const [page, setPage] = useState(1)
  const [scale, setScale] = useState(DEFAULT_SCALE)
  const [drawingEnabled, setDrawingEnabled] = useState(false)
  const [showThumbs, setShowThumbs] = useState(false)
  const [reloadToken, setReloadToken] = useState(0)
  const [isLandscape, setIsLandscape] = useState(
    () => window.matchMedia('(orientation: landscape)').matches,
  )
  const [twoPageView, setTwoPageView] = useState(false)
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })
  const [pageSizes, setPageSizes] = useState<Record<number, { width: number; height: number }>>({})
  const touchStartX = useRef<number | null>(null)
  const pinchRef = useRef<{ dist: number; scale: number } | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const wasSpreadRef = useRef(false)

  const score = useMemo(() => getScores().find((s) => s.id === scoreId), [scoreId])
  const numPages = pdfDoc?.numPages ?? 0
  const isSpreadMode = twoPageView && isLandscape
  const spread = useMemo(
    () => getSpread(page, numPages, isSpreadMode),
    [page, numPages, isSpreadMode],
  )

  const handlePageMeasured = useCallback((pageNumber: number, width: number, height: number) => {
    setPageSizes((prev) => {
      const existing = prev[pageNumber]
      if (existing && existing.width === width && existing.height === height) return prev
      return { ...prev, [pageNumber]: { width, height } }
    })
  }, [])

  // 스프레드에 포함된 각 페이지의 실측 크기(1배율 기준)를 모아서 fit 계산과 레이아웃에 함께 써요.
  const spreadMetrics = useMemo(() => {
    const sizes = spread.map((n) => pageSizes[n])
    if (spread.length === 0 || sizes.some((s) => !s)) return null
    const measured = sizes as { width: number; height: number }[]
    const totalWidth = measured.reduce((sum, s) => sum + s.width, 0) + SPREAD_GAP * (measured.length - 1)
    const maxHeight = Math.max(...measured.map((s) => s.height))
    return { totalWidth, maxHeight }
  }, [spread, pageSizes])

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

  // 컨테이너 크기를 추적해서 스프레드 모드의 fit-to-screen 배율을 다시 계산할 수 있게 해요.
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry) return
      const { width, height } = entry.contentRect
      setContainerSize({ width, height })
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // 컨테이너에 페이지(들)가 꽉 차는 배율: 가로/세로 중 더 제약이 큰 쪽 기준으로 계산해요.
  const computeFitScale = () => {
    if (!spreadMetrics || containerSize.width === 0 || containerSize.height === 0) return null
    return Math.min(containerSize.width / spreadMetrics.totalWidth, containerSize.height / spreadMetrics.maxHeight)
  }

  // 스프레드(2페이지) 모드에서는 위 fit 배율을 자동으로 계산해서 고정해요.
  useEffect(() => {
    if (!isSpreadMode) return
    const fit = computeFitScale()
    if (fit !== null) setScale(fit)
  }, [isSpreadMode, spreadMetrics, containerSize])

  // 스프레드 모드를 벗어나면 자동 계산된 배율 대신 기본 배율로 되돌려요.
  useEffect(() => {
    if (wasSpreadRef.current && !isSpreadMode) setScale(DEFAULT_SCALE)
    wasSpreadRef.current = isSpreadMode
  }, [isSpreadMode])

  // 좌우 화살표로도 페이지 전환이 가능하게 해요 (필기 중에는 비활성화).
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (drawingEnabled) return
      if (e.key === 'ArrowLeft') setPage((p) => Math.max(1, p - 1))
      else if (e.key === 'ArrowRight') setPage((p) => Math.min(numPages, p + 1))
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [drawingEnabled, numPages])

  if (!scoreId) return null

  const goPrev = () => setPage((p) => Math.max(1, p - 1))
  const goNext = () => setPage((p) => Math.min(numPages, p + 1))

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2 && !isSpreadMode) {
      const [a, b] = [e.touches[0], e.touches[1]]
      pinchRef.current = { dist: Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY), scale }
      touchStartX.current = null
    } else if (e.touches.length === 1 && !drawingEnabled) {
      touchStartX.current = e.touches[0].clientX
    }
  }

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    if (isSpreadMode) return
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
    if (isSpreadMode || !e.ctrlKey) return
    e.preventDefault()
    setScale((s) => clamp(+(s - e.deltaY * 0.004).toFixed(2), MIN_SCALE, MAX_SCALE))
  }

  const handleFitToScreen = () => {
    const fit = computeFitScale()
    if (fit !== null) setScale(fit)
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
        zoomLocked={isSpreadMode}
        canFitToScreen={spreadMetrics !== null && containerSize.width > 0 && containerSize.height > 0}
        drawingEnabled={drawingEnabled}
        isLandscape={isLandscape}
        twoPageView={twoPageView}
        onPrev={goPrev}
        onNext={goNext}
        onZoomIn={() => setScale((s) => clamp(+(s + 0.2).toFixed(2), MIN_SCALE, MAX_SCALE))}
        onZoomOut={() => setScale((s) => clamp(+(s - 0.2).toFixed(2), MIN_SCALE, MAX_SCALE))}
        onFitToScreen={handleFitToScreen}
        onToggleDraw={() => setDrawingEnabled((d) => !d)}
        onClearPage={handleClear}
        onToggleThumbs={() => setShowThumbs((v) => !v)}
        onToggleTwoPage={() => setTwoPageView((v) => !v)}
      />
      <div
        ref={containerRef}
        className="flex flex-1 touch-none items-center justify-center overflow-hidden p-4"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
      >
        {loading && <p className="text-center text-dark/50">악보를 불러오는 중...</p>}
        {error && <p className="text-center text-red-600">{error}</p>}
        {pdfDoc && (
          <div
            style={
              spreadMetrics
                ? { width: spreadMetrics.totalWidth * scale, height: spreadMetrics.maxHeight * scale }
                : undefined
            }
          >
            <div
              className="flex w-fit gap-3.5"
              style={{ transform: `scale(${scale / RENDER_SCALE})`, transformOrigin: 'top left' }}
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
                  onMeasured={handlePageMeasured}
                />
              ))}
            </div>
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
