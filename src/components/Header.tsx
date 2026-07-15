import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

interface Props {
  title: string
  right?: ReactNode
  back?: boolean
}

export default function Header({ title, right, back }: Props) {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between bg-primary px-4 py-3 text-white shadow-sm">
      <div className="flex min-w-0 items-center gap-2">
        {back && (
          <Link to="/" className="rounded-full p-1 hover:bg-white/10" aria-label="목록으로">
            ←
          </Link>
        )}
        <h1 className="truncate text-lg font-semibold">{title}</h1>
      </div>
      <div className="flex shrink-0 items-center gap-2">{right}</div>
    </header>
  )
}
