interface Props {
  value: string
  onChange: (value: string) => void
}

export default function SearchBar({ value, onChange }: Props) {
  return (
    <input
      type="search"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="악보 제목 검색"
      className="w-full rounded-full border border-dark/20 bg-white px-4 py-2 text-dark placeholder:text-dark/40 focus:outline-none focus:ring-2 focus:ring-primary"
    />
  )
}
