interface Props {
  page: number
  numPages: number
  scale: number
  drawingEnabled: boolean
  onPrev: () => void
  onNext: () => void
  onZoomIn: () => void
  onZoomOut: () => void
  onToggleDraw: () => void
  onClearPage: () => void
  onToggleThumbs: () => void
}

export default function ViewerToolbar({
  page,
  numPages,
  scale,
  drawingEnabled,
  onPrev,
  onNext,
  onZoomIn,
  onZoomOut,
  onToggleDraw,
  onClearPage,
  onToggleThumbs,
}: Props) {
  return (
    <div className="flex items-center justify-between gap-2 bg-primary px-3 py-2 text-white">
      <div className="flex items-center gap-1">
        <button
          onClick={onPrev}
          disabled={page <= 1}
          className="rounded-full p-2 hover:bg-white/10 disabled:opacity-30"
          aria-label="이전 페이지"
        >
          ◀
        </button>
        <span className="min-w-[4.5rem] text-center text-sm">
          {page} / {numPages || '-'}
        </span>
        <button
          onClick={onNext}
          disabled={page >= numPages}
          className="rounded-full p-2 hover:bg-white/10 disabled:opacity-30"
          aria-label="다음 페이지"
        >
          ▶
        </button>
      </div>
      <div className="flex items-center gap-1">
        <button onClick={onZoomOut} className="rounded-full p-2 hover:bg-white/10" aria-label="축소">
          －
        </button>
        <span className="w-12 text-center text-xs">{Math.round(scale * 100)}%</span>
        <button onClick={onZoomIn} className="rounded-full p-2 hover:bg-white/10" aria-label="확대">
          ＋
        </button>
      </div>
      <div className="flex items-center gap-1">
        <button onClick={onToggleThumbs} className="rounded-full p-2 hover:bg-white/10" aria-label="페이지 썸네일">
          ▦
        </button>
        <button
          onClick={onToggleDraw}
          className={`rounded-full p-2 hover:bg-white/10 ${drawingEnabled ? 'bg-accent text-dark' : ''}`}
          aria-label="필기 모드 전환"
        >
          ✏️
        </button>
        <button onClick={onClearPage} className="rounded-full p-2 hover:bg-white/10" aria-label="이 페이지 필기 지우기">
          🗑️
        </button>
      </div>
    </div>
  )
}
