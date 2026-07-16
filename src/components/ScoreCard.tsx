import { Link } from 'react-router-dom'
import type { MouseEvent } from 'react'
import type { ScoreMeta } from '../types'
import { STATUS_BADGE_CLASS, STATUS_LABEL } from '../lib/scoreConstants'
import StarRating from './StarRating'

interface Props {
  score: ScoreMeta
  onEdit: () => void
  onDelete: () => void
  onToggleFavorite: () => void
}

export default function ScoreCard({ score, onEdit, onDelete, onToggleFavorite }: Props) {
  const handleToggleFavorite = (e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onToggleFavorite()
  }

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-dark/5">
      <button
        onClick={handleToggleFavorite}
        aria-label={score.favorite ? '즐겨찾기 해제' : '즐겨찾기 추가'}
        aria-pressed={score.favorite}
        className="absolute right-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-white/85 shadow-sm"
      >
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill={score.favorite ? '#F2C265' : 'none'}
          stroke={score.favorite ? '#F2C265' : '#4A4A4A'}
          strokeWidth={1.8}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 3.5l2.6 5.27 5.82.85-4.21 4.1.99 5.8L12 16.9l-5.2 2.62.99-5.8-4.21-4.1 5.82-.85z"
          />
        </svg>
      </button>
      <Link
        to={`/viewer/${score.id}`}
        className="relative flex aspect-[3/4] flex-1 flex-col items-center justify-center gap-2 p-6"
        style={{
          background:
            'repeating-linear-gradient(#F2F1EA 0px, #F2F1EA 8px, rgba(74,74,74,0.10) 9px, rgba(74,74,74,0.10) 10px, #F2F1EA 11px)',
        }}
      >
        <span className="absolute left-2.5 top-2 text-[8px] uppercase tracking-widest text-dark/35">
          PDF{score.pageCount ? ` · ${score.pageCount}p` : ''}
        </span>
        <span className="font-serif text-3xl italic text-primary/55">♪</span>
        <span className="line-clamp-2 text-center text-sm font-medium text-dark">{score.title}</span>
      </Link>
      <div className="flex items-center justify-between gap-1 px-3 pt-2">
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_BADGE_CLASS[score.status]}`}>
          {STATUS_LABEL[score.status]}
        </span>
        <StarRating value={score.difficulty} size={10} />
      </div>
      {score.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 px-3 pt-1.5 pb-2">
          {score.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-accent/30 px-2 py-0.5 text-xs text-dark">
              {tag}
            </span>
          ))}
        </div>
      )}
      <div className="flex divide-x divide-dark/10 border-t border-dark/10 text-xs">
        <button onClick={onEdit} className="flex-1 py-2 text-dark/70 hover:bg-light">
          편집
        </button>
        <button onClick={onDelete} className="flex-1 py-2 text-red-600 hover:bg-red-50">
          삭제
        </button>
      </div>
    </div>
  )
}
