interface Props {
  pageLabel: string
  numPages: number
  canPrev: boolean
  canNext: boolean
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
  pageLabel,
  numPages,
  canPrev,
  canNext,
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
    <div className="flex items-center justify-between gap-2 bg-[#0c6a5b] px-3 py-2 text-white">
      <div className="flex items-center gap-1">
        <button
          onClick={onPrev}
          disabled={!canPrev}
          className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-white/10 disabled:opacity-30"
          aria-label="이전 페이지"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <span className="min-w-[4.5rem] text-center text-sm">
          {pageLabel} / {numPages || '-'}
        </span>
        <button
          onClick={onNext}
          disabled={!canNext}
          className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-white/10 disabled:opacity-30"
          aria-label="다음 페이지"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 6l6 6-6 6" />
          </svg>
        </button>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={onZoomOut}
          className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-white/10"
          aria-label="축소"
        >
          －
        </button>
        <span className="w-12 text-center text-xs">{Math.round(scale * 100)}%</span>
        <button
          onClick={onZoomIn}
          className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-white/10"
          aria-label="확대"
        >
          ＋
        </button>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={onToggleThumbs}
          className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-white/10"
          aria-label="페이지 썸네일"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
        </button>
        <button
          onClick={onToggleDraw}
          className={`flex h-7 w-7 items-center justify-center rounded-full hover:bg-white/10 ${
            drawingEnabled ? 'bg-accent text-dark' : ''
          }`}
          aria-label="필기 모드 전환"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 20h9" />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"
            />
          </svg>
        </button>
        <button
          onClick={onClearPage}
          className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-white/10"
          aria-label="보이는 페이지 필기 지우기"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18" />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m2 0-.9 13.1a2 2 0 0 1-2 1.9H9.9a2 2 0 0 1-2-1.9L7 6"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}
