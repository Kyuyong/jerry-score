import { useEffect, useState } from 'react'
import type { MouseEvent } from 'react'
import type { Difficulty, ScoreMeta, ScoreStatus, Tuning } from '../types'
import { formatBytes } from '../lib/format'
import { renderFirstPageThumbnail } from '../lib/pdfThumbnail'
import { STATUS_LABEL, TUNING_LABEL } from '../lib/scoreConstants'
import StarRating from './StarRating'

type EditableFields = Pick<
  ScoreMeta,
  | 'title'
  | 'composer'
  | 'genre'
  | 'tags'
  | 'difficulty'
  | 'tuning'
  | 'tuningCustom'
  | 'capo'
  | 'key'
  | 'status'
  | 'favorite'
  | 'source'
  | 'memo'
>

interface Props {
  score: ScoreMeta
  onSave: (patch: EditableFields) => void
  onClose: () => void
}

const inputClass =
  'w-full rounded-lg border border-dark/20 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary'
const labelClass = 'mb-1 block text-xs font-medium text-dark/70'

export default function EditScoreDialog({ score, onSave, onClose }: Props) {
  const [title, setTitle] = useState(score.title)
  const [composer, setComposer] = useState(score.composer ?? '')
  const [genre, setGenre] = useState(score.genre ?? '')
  const [tagsInput, setTagsInput] = useState(score.tags.join(', '))
  const [difficulty, setDifficulty] = useState<Difficulty>(score.difficulty)
  const [tuning, setTuning] = useState<Tuning>(score.tuning)
  const [tuningCustom, setTuningCustom] = useState(score.tuningCustom ?? '')
  const [capo, setCapo] = useState(score.capo)
  const [key, setKey] = useState(score.key ?? '')
  const [status, setStatus] = useState<ScoreStatus>(score.status)
  const [favorite, setFavorite] = useState(score.favorite)
  const [source, setSource] = useState(score.source ?? '')
  const [memo, setMemo] = useState(score.memo ?? '')

  const [thumb, setThumb] = useState<string | null>(null)
  const [thumbError, setThumbError] = useState(false)

  useEffect(() => {
    let cancelled = false
    setThumb(null)
    setThumbError(false)
    renderFirstPageThumbnail(score.id)
      .then((url) => {
        if (!cancelled) setThumb(url)
      })
      .catch(() => {
        if (!cancelled) setThumbError(true)
      })
    return () => {
      cancelled = true
    }
  }, [score.id])

  const handleSave = () => {
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
    onSave({
      title: title.trim() || score.title,
      composer: composer.trim() || undefined,
      genre: genre.trim() || undefined,
      tags,
      difficulty,
      tuning,
      tuningCustom: tuning === 'Custom' ? tuningCustom.trim() || undefined : undefined,
      capo,
      key: key.trim() || undefined,
      status,
      favorite,
      source: source.trim() || undefined,
      memo: memo.trim() || undefined,
    })
  }

  const stop = (e: MouseEvent) => e.stopPropagation()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark/40 p-4" onClick={onClose}>
      <div className="flex max-h-[88vh] w-full max-w-md flex-col rounded-2xl bg-white shadow-lg" onClick={stop}>
        <div className="shrink-0 px-5 pb-2 pt-5">
          <h2 className="font-serif text-lg font-semibold text-dark">악보 정보 편집</h2>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-5">
          <div className="flex gap-3 rounded-xl bg-light p-3">
            <div className="flex h-20 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md bg-white ring-1 ring-dark/10">
              {thumb ? (
                <img src={thumb} alt="" className="h-full w-full object-cover" />
              ) : thumbError ? (
                <span className="px-1 text-center text-[9px] leading-tight text-dark/40">미리보기 없음</span>
              ) : (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-dark/20 border-t-primary" />
              )}
            </div>
            <div className="min-w-0 flex-1 space-y-0.5 text-xs text-dark/60">
              <p className="truncate font-medium text-dark">{score.fileName}</p>
              <p>{score.size ? formatBytes(Number(score.size)) : '크기 정보 없음'}</p>
              <p>{score.pageCount ? `총 ${score.pageCount}페이지` : '페이지 수 확인 전'}</p>
            </div>
          </div>

          <div>
            <label className={labelClass}>제목</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className={labelClass}>작곡가</label>
              <input value={composer} onChange={(e) => setComposer(e.target.value)} className={inputClass} />
            </div>
            <div className="flex-1">
              <label className={labelClass}>장르</label>
              <input value={genre} onChange={(e) => setGenre(e.target.value)} className={inputClass} />
            </div>
          </div>

          <div>
            <label className={labelClass}>태그 (쉼표로 구분)</label>
            <input
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="재즈, 클래식"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>난이도</label>
            <StarRating value={difficulty} onChange={setDifficulty} size={20} />
          </div>

          <div>
            <label className={labelClass}>튜닝</label>
            <div className="flex gap-1.5">
              {(Object.keys(TUNING_LABEL) as Tuning[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTuning(t)}
                  className={`flex-1 rounded-lg border px-2 py-1.5 text-xs font-medium transition ${
                    tuning === t ? 'border-primary bg-primary/10 text-primary' : 'border-dark/15 text-dark/60'
                  }`}
                >
                  {TUNING_LABEL[t]}
                </button>
              ))}
            </div>
            {tuning === 'Custom' && (
              <input
                value={tuningCustom}
                onChange={(e) => setTuningCustom(e.target.value)}
                placeholder="예: DADGAD"
                className={`${inputClass} mt-2`}
              />
            )}
          </div>

          <div className="flex gap-3">
            <div>
              <label className={labelClass}>카포</label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCapo((c) => Math.max(0, c - 1))}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-dark/20 text-dark/70"
                  aria-label="카포 감소"
                >
                  －
                </button>
                <span className="w-12 text-center text-sm text-dark">{capo === 0 ? '없음' : capo}</span>
                <button
                  type="button"
                  onClick={() => setCapo((c) => Math.min(12, c + 1))}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-dark/20 text-dark/70"
                  aria-label="카포 증가"
                >
                  ＋
                </button>
              </div>
            </div>
            <div className="flex-1">
              <label className={labelClass}>조 (Key)</label>
              <input value={key} onChange={(e) => setKey(e.target.value)} placeholder="예: C, Gm" className={inputClass} />
            </div>
          </div>

          <div>
            <label className={labelClass}>진행 상태</label>
            <div className="flex gap-1.5">
              {(Object.keys(STATUS_LABEL) as ScoreStatus[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  className={`flex-1 rounded-lg border px-2 py-1.5 text-xs font-medium transition ${
                    status === s ? 'border-primary bg-primary/10 text-primary' : 'border-dark/15 text-dark/60'
                  }`}
                >
                  {STATUS_LABEL[s]}
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-center justify-between rounded-lg border border-dark/15 px-3 py-2">
            <span className="text-sm text-dark">즐겨찾기 (목록 상단 고정)</span>
            <input
              type="checkbox"
              checked={favorite}
              onChange={(e) => setFavorite(e.target.checked)}
              className="h-4 w-4 accent-primary"
            />
          </label>

          <div>
            <label className={labelClass}>출처</label>
            <input value={source} onChange={(e) => setSource(e.target.value)} className={inputClass} />
          </div>

          <div className="pb-1">
            <label className={labelClass}>메모</label>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              rows={3}
              className={`${inputClass} resize-none`}
            />
          </div>
        </div>

        <div className="flex shrink-0 justify-end gap-2 border-t border-dark/10 px-5 py-4">
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
