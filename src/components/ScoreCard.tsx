import { Link } from 'react-router-dom'
import type { ScoreMeta } from '../types'

interface Props {
  score: ScoreMeta
  onEdit: () => void
  onDelete: () => void
}

export default function ScoreCard({ score, onEdit, onDelete }: Props) {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-dark/5">
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
      {score.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 px-3 pb-2">
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
