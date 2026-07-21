import type { MouseEvent } from 'react'
import type { ScoreMeta } from '../types'

interface Props {
  score: ScoreMeta
  onCancel: () => void
  onConfirm: () => void
}

export default function DeleteConfirmDialog({ score, onCancel, onConfirm }: Props) {
  const stop = (e: MouseEvent) => e.stopPropagation()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark/40 p-4" onClick={onCancel}>
      <div className="w-full max-w-xs rounded-2xl bg-white p-5 text-center shadow-lg" onClick={stop}>
        <p className="mb-1 text-sm font-semibold text-dark">&quot;{score.title}&quot;을(를) 삭제할까요?</p>
        <p className="mb-4 text-xs text-dark/55">기기에 저장된 파일도 함께 삭제돼요.</p>
        <div className="flex justify-center gap-2">
          <button onClick={onCancel} className="rounded-full px-4 py-2 text-sm text-dark/60 hover:bg-light">
            취소
          </button>
          <button onClick={onConfirm} className="rounded-full bg-red-600 px-4 py-2 text-sm font-medium text-white">
            삭제
          </button>
        </div>
      </div>
    </div>
  )
}
