import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

interface Props {
  title: string
  subtitle?: string
  titleBadge?: ReactNode
  right?: ReactNode
  back?: boolean
}

export default function Header({ title, subtitle, titleBadge, right, back }: Props) {
  return (
    <header
      className="sticky top-0 z-10 flex items-center justify-between bg-primary px-4 py-3 text-white shadow-sm"
      style={{ paddingTop: 'calc(0.75rem + env(safe-area-inset-top))' }}
    >
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
          <div className="flex items-center gap-1.5">
            <h1 className="truncate font-serif text-lg font-semibold leading-tight">{title}</h1>
            {titleBadge}
          </div>
          {subtitle && (
            <div className="truncate text-[10px] uppercase tracking-widest text-white/70">{subtitle}</div>
          )}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">{right}</div>
    </header>
  )
}
