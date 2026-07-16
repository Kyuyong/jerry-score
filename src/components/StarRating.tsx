interface Props {
  value: number
  onChange?: (value: 1 | 2 | 3 | 4 | 5) => void
  size?: number
}

const STAR_VALUES = [1, 2, 3, 4, 5] as const

export default function StarRating({ value, onChange, size = 14 }: Props) {
  const interactive = Boolean(onChange)

  return (
    <div className="flex items-center gap-0.5" role={interactive ? 'radiogroup' : undefined} aria-label="난이도">
      {STAR_VALUES.map((n) => {
        const filled = n <= value
        const star = (
          <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill={filled ? '#F2C265' : 'none'}
            stroke={filled ? '#F2C265' : 'currentColor'}
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 3.5l2.6 5.27 5.82.85-4.21 4.1.99 5.8L12 16.9l-5.2 2.62.99-5.8-4.21-4.1 5.82-.85z"
            />
          </svg>
        )
        if (!interactive) {
          return (
            <span key={n} className="text-dark/25">
              {star}
            </span>
          )
        }
        return (
          <button
            key={n}
            type="button"
            onClick={() => onChange?.(n)}
            aria-label={`난이도 ${n}점`}
            aria-checked={n === value}
            role="radio"
            className="text-dark/25 transition hover:scale-110"
          >
            {star}
          </button>
        )
      })}
    </div>
  )
}
