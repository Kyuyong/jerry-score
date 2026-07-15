import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import SearchBar from '../components/SearchBar'
import TagFilter from '../components/TagFilter'
import ScoreGrid from '../components/ScoreGrid'
import UploadButton from '../components/UploadButton'
import EditScoreDialog from '../components/EditScoreDialog'
import { useAuth } from '../contexts/AuthContext'
import { useScores } from '../hooks/useScores'
import { allTags } from '../lib/scoreStore'
import type { ScoreMeta } from '../types'

export default function ScoreListPage() {
  const { isReady, isSignedIn, initError, signIn } = useAuth()
  const { scores, loading, error, sync, remove, updateMeta } = useScores()
  const [query, setQuery] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [editing, setEditing] = useState<ScoreMeta | null>(null)

  const tags = useMemo(() => allTags(), [scores])

  const filtered = useMemo(() => {
    return scores.filter((s) => {
      const matchesQuery = s.title.toLowerCase().includes(query.toLowerCase())
      const matchesTags = selectedTags.every((t) => s.tags.includes(t))
      return matchesQuery && matchesTags
    })
  }, [scores, query, selectedTags])

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  const handleDelete = async (score: ScoreMeta) => {
    if (!confirm(`"${score.title}"을(를) 삭제할까요? Google Drive 원본도 함께 삭제돼요.`)) return
    try {
      await remove(score.id)
    } catch (err) {
      alert(err instanceof Error ? err.message : '삭제에 실패했어요.')
    }
  }

  if (!isReady) {
    return <div className="flex h-screen items-center justify-center text-dark/50">불러오는 중...</div>
  }

  if (initError) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-2 bg-light px-6 text-center">
        <p className="font-medium text-red-600">설정 오류</p>
        <p className="text-sm text-dark/60">{initError}</p>
      </div>
    )
  }

  if (!isSignedIn) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-light px-6 text-center">
        <img src="/score.jpg" alt="Jerry Score" className="h-24 w-24 rounded-2xl object-cover shadow" />
        <h1 className="text-xl font-semibold text-dark">Jerry Score</h1>
        <p className="text-sm text-dark/60">Google 계정으로 로그인해서 악보를 관리해보세요.</p>
        <button onClick={() => void signIn()} className="rounded-full bg-primary px-6 py-2 font-medium text-white shadow-sm">
          Google 계정으로 로그인
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-light pb-8">
      <Header
        title="Jerry Score"
        right={
          <>
            <UploadButton onUploaded={() => void sync()} />
            <Link to="/settings" className="rounded-full p-2 hover:bg-white/10" aria-label="설정">
              ⚙️
            </Link>
          </>
        }
      />
      <main className="mx-auto max-w-5xl px-4 pt-4">
        <div className="mb-4 flex flex-col gap-3">
          <SearchBar value={query} onChange={setQuery} />
          <TagFilter tags={tags} selected={selectedTags} onToggle={toggleTag} />
        </div>
        {loading && <p className="mb-2 text-sm text-dark/50">Drive와 동기화 중...</p>}
        {error && <p className="mb-2 text-sm text-red-600">{error}</p>}
        <ScoreGrid scores={filtered} onEdit={setEditing} onDelete={(s) => void handleDelete(s)} />
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
    </div>
  )
}
