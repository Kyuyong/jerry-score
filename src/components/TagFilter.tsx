interface Props {
  tags: string[]
  selected: string[]
  onToggle: (tag: string) => void
}

export default function TagFilter({ tags, selected, onToggle }: Props) {
  if (!tags.length) return null
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => {
        const active = selected.includes(tag)
        return (
          <button
            key={tag}
            onClick={() => onToggle(tag)}
            className={`rounded-full px-3 py-1 text-sm transition ${
              active ? 'bg-accent font-medium text-dark' : 'border border-dark/10 bg-white text-dark/70'
            }`}
          >
            {tag}
          </button>
        )
      })}
    </div>
  )
}
