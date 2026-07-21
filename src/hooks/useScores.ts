import { useCallback, useState } from 'react'
import { getScores, removeScore, updateScoreMeta } from '../lib/scoreStore'
import { deleteFile } from '../lib/fileStore'
import { clearScoreAnnotations } from '../lib/annotationDb'
import type { ScoreMeta } from '../types'

export function useScores() {
  const [scores, setScores] = useState<ScoreMeta[]>(getScores())

  const refresh = useCallback(() => setScores(getScores()), [])

  const remove = useCallback(async (id: string) => {
    await deleteFile(id)
    removeScore(id)
    await clearScoreAnnotations(id)
    setScores(getScores())
  }, [])

  const updateMeta = useCallback(
    (id: string, patch: Partial<Omit<ScoreMeta, 'id' | 'addedAt' | 'mimeType' | 'size' | 'pageCount' | 'fileName'>>) => {
      updateScoreMeta(id, patch)
      setScores(getScores())
    },
    [],
  )

  return { scores, remove, updateMeta, refresh }
}
