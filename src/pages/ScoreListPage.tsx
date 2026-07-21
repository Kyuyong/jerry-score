import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import SearchBar from '../components/SearchBar'
import TagFilter from '../components/TagFilter'
import StatusFilter from '../components/StatusFilter'
import ScoreGrid from '../components/ScoreGrid'
import UploadButton from '../components/UploadButton'
import EditScoreDialog from '../components/EditScoreDialog'
import DeleteConfirmDialog from '../components/DeleteConfirmDialog'
import VersionBadge from '../components/VersionBadge'
import { useScores } from '../hooks/useScores'
import { allTags } from '../lib/scoreStore'
import type { ScoreMeta, ScoreStatus } from '../types'

export default function ScoreListPage() {
  const { scores, remove, updateMeta, refresh } = useScores()
  const [query, setQuery] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedStatuses, setSelectedStatuses] = useState<ScoreStatus[]>([])
  const [editing, setEditing] = useState<ScoreMeta | null>(null)
  const [deleting, setDeleting] = useState<ScoreMeta | null>(null)

  const tags = useMemo(() => allTags(), [scores])

  const filtered = useMemo(() => {
    const result = scores.filter((s) => {
      const matchesQuery = s.title.toLowerCase().includes(query.toLowerCase())
      const matchesTags = selectedTags.every((t) => s.tags.includes(t))
      const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(s.status)
      return matchesQuery && matchesTags && matchesStatus
    })
    return result.sort((a, b) => Number(b.favorite) - Number(a.favorite))
  }, [scores, query, selectedTags, selectedStatuses])

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  const toggleStatus = (status: ScoreStatus) => {
    setSelectedStatuses((prev) => (prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]))
  }

  const handleToggleFavorite = (score: ScoreMeta) => {
    updateMeta(score.id, { favorite: !score.favorite })
  }

  const handleConfirmDelete = async () => {
    if (!deleting) return
    try {
      await remove(deleting.id)
    } catch (err) {
      alert(err instanceof Error ? err.message : '삭제에 실패했어요.')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="min-h-screen bg-light pb-8">
      <Header
        title="Jerry Score"
        subtitle="PDF 악보 보관함"
        titleBadge={<VersionBadge />}
        right={
          <>
            <UploadButton onUploaded={refresh} />
            <Link
              to="/settings"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
              aria-label="설정"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                <circle cx="12" cy="12" r="3" />
                <path
                  strokeLinecap="round"
                  d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
                />
              </svg>
            </Link>
          </>
        }
      />
      <main className="mx-auto max-w-5xl px-4 pt-4">
        <div className="mb-4 flex flex-col gap-3">
          <SearchBar value={query} onChange={setQuery} />
          <StatusFilter selected={selectedStatuses} onToggle={toggleStatus} />
          <TagFilter tags={tags} selected={selectedTags} onToggle={toggleTag} />
        </div>
        <ScoreGrid
          scores={filtered}
          onEdit={setEditing}
          onDelete={setDeleting}
          onToggleFavorite={handleToggleFavorite}
        />
      </main>
      {editing && (
        <EditScoreDialog
          score={editing}
          onClose={() => setEditing(null)}
          onSave={(patch) => {
            updateMeta(editing.id, patch)
            setEditing(null)
          }}
        />
      )}
      {deleting && (
        <DeleteConfirmDialog
          score={deleting}
          onCancel={() => setDeleting(null)}
          onConfirm={() => void handleConfirmDelete()}
        />
      )}
    </div>
  )
}
