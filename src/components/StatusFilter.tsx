import type { ScoreStatus } from '../types'
import { STATUS_LABEL, STATUS_ORDER } from '../lib/scoreConstants'

interface Props {
  selected: ScoreStatus[]
  onToggle: (status: ScoreStatus) => void
}

export default function StatusFilter({ selected, onToggle }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {STATUS_ORDER.map((status) => {
        const active = selected.includes(status)
        return (
          <button
            key={status}
            onClick={() => onToggle(status)}
            className={`rounded-full px-3 py-1 text-sm transition ${
              active ? 'bg-primary text-white' : 'border border-dark/10 bg-white text-dark/70'
            }`}
          >
            {STATUS_LABEL[status]}
          </button>
        )
      })}
    </div>
  )
}
