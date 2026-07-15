import { useState } from 'react'
import type { MouseEvent } from 'react'
import type { ScoreMeta } from '../types'

interface Props {
  score: ScoreMeta
  onSave: (patch: { title: string; tags: string[] }) => void
  onClose: () => void
}

export default function EditScoreDialog({ score, onSave, onClose }: Props) {
  const [title, setTitle] = useState(score.title)
  const [tagsInput, setTagsInput] = useState(score.tags.join(', '))

  const handleSave = () => {
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
    onSave({ title: title.trim() || score.title, tags })
  }

  const stop = (e: MouseEvent) => e.stopPropagation()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark/40 p-4" onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-lg" onClick={stop}>
        <h2 className="mb-4 text-lg font-semibold text-dark">악보 정보 편집</h2>
        <label className="mb-1 block text-sm text-dark/70">제목</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mb-3 w-full rounded-lg border border-dark/20 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <label className="mb-1 block text-sm text-dark/70">장르 태그 (쉼표로 구분)</label>
        <input
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          placeholder="재즈, 클래식"
          className="mb-4 w-full rounded-lg border border-dark/20 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="rounded-full px-4 py-2 text-sm text-dark/60 hover:bg-light">
            취소
          </button>
          <button onClick={handleSave} className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-white">
            저장
          </button>
        </div>
      </div>
    </div>
  )
}
