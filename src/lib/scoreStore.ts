import type { ScoreMeta } from '../types'

const STORAGE_KEY = 'jerry_score_scores'

export type { ScoreMeta }

export function getScores(): ScoreMeta[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as ScoreMeta[]) : []
  } catch {
    return []
  }
}

function saveScores(scores: ScoreMeta[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(scores))
}

export function upsertScore(meta: ScoreMeta): void {
  const scores = getScores()
  const idx = scores.findIndex((s) => s.id === meta.id)
  if (idx >= 0) {
    scores[idx] = meta
  } else {
    scores.unshift(meta)
  }
  saveScores(scores)
}

export function removeScore(id: string): void {
  saveScores(getScores().filter((s) => s.id !== id))
}

export function updateScoreMeta(id: string, patch: Partial<Pick<ScoreMeta, 'title' | 'tags'>>): void {
  const scores = getScores()
  const idx = scores.findIndex((s) => s.id === id)
  if (idx < 0) return
  scores[idx] = { ...scores[idx], ...patch }
  saveScores(scores)
}

export function updateScorePageCount(id: string, pageCount: number): void {
  const scores = getScores()
  const idx = scores.findIndex((s) => s.id === id)
  if (idx < 0 || scores[idx].pageCount === pageCount) return
  scores[idx] = { ...scores[idx], pageCount }
  saveScores(scores)
}

export function allTags(): string[] {
  const set = new Set<string>()
  for (const score of getScores()) {
    for (const tag of score.tags) set.add(tag)
  }
  return Array.from(set).sort()
}
