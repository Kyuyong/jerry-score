import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

interface Props {
  title: string
  subtitle?: string
  right?: ReactNode
  back?: boolean
}

export default function Header({ title, subtitle, right, back }: Props) {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between bg-primary px-4 py-3 text-white shadow-sm">
      <div className="flex min-w-0 items-center gap-2">
        {back && (
          <Link
            to="/"
            className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full bg-white/15 hover:bg-white/25"
            aria-label="목록으로"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
            </svg>
          </Link>
        )}
        <div className="min-w-0">
          <h1 className="truncate font-serif text-lg font-semibold leading-tight">{title}</h1>
          {subtitle && (
            <div className="truncate text-[10px] uppercase tracking-widest text-white/70">{subtitle}</div>
          )}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">{right}</div>
    </header>
  )
}
