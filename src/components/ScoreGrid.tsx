import ScoreCard from './ScoreCard'
import type { ScoreMeta } from '../types'

interface Props {
  scores: ScoreMeta[]
  onEdit: (score: ScoreMeta) => void
  onDelete: (score: ScoreMeta) => void
  onToggleFavorite: (score: ScoreMeta) => void
}

export default function ScoreGrid({ scores, onEdit, onDelete, onToggleFavorite }: Props) {
  if (!scores.length) {
    return <p className="mt-12 text-center text-dark/50">악보가 없어요. 위 버튼으로 PDF를 업로드해보세요.</p>
  }
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {scores.map((score) => (
        <ScoreCard
          key={score.id}
          score={score}
          onEdit={() => onEdit(score)}
          onDelete={() => onDelete(score)}
          onToggleFavorite={() => onToggleFavorite(score)}
        />
      ))}
    </div>
  )
}
