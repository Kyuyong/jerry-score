import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { listPdfFiles, deleteDriveFile } from '../lib/googleDrive'
import { getScores, upsertScore, removeScore, updateScoreMeta } from '../lib/scoreStore'
import { clearScoreAnnotations } from '../lib/annotationDb'
import type { ScoreMeta } from '../types'

export function useScores() {
  const { isSignedIn } = useAuth()
  const [scores, setScores] = useState<ScoreMeta[]>(getScores())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sync = useCallback(async () => {
    if (!isSignedIn) return
    setLoading(true)
    setError(null)
    try {
      const files = await listPdfFiles()
      const existing = getScores()
      const existingIds = new Set(files.map((f) => f.id))

      for (const file of files) {
        const prev = existing.find((s) => s.id === file.id)
        upsertScore({
          id: file.id,
          title: prev?.title ?? file.name.replace(/\.pdf$/i, ''),
          tags: prev?.tags ?? [],
          addedAt: prev?.addedAt ?? (Date.parse(file.createdTime ?? '') || Date.now()),
          mimeType: file.mimeType,
          size: file.size,
        })
      }
      for (const score of existing) {
        if (!existingIds.has(score.id)) removeScore(score.id)
      }
      setScores(getScores())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google Drive 목록을 불러오지 못했어요.')
    } finally {
      setLoading(false)
    }
  }, [isSignedIn])

  useEffect(() => {
    sync()
  }, [sync])

  const remove = useCallback(async (id: string) => {
    await deleteDriveFile(id)
    removeScore(id)
    await clearScoreAnnotations(id)
    setScores(getScores())
  }, [])

  const updateMeta = useCallback((id: string, patch: Partial<Pick<ScoreMeta, 'title' | 'tags'>>) => {
    updateScoreMeta(id, patch)
    setScores(getScores())
  }, [])

  const refresh = useCallback(() => setScores(getScores()), [])

  return { scores, loading, error, sync, remove, updateMeta, refresh }
}
