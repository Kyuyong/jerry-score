import { APP_VERSION } from '../version'

export default function VersionBadge() {
  return (
    <span className="rounded-md bg-accent px-1.5 py-0.5 text-[9px] font-bold leading-none tracking-wide text-dark shadow-sm">
      v{APP_VERSION}
    </span>
  )
}
