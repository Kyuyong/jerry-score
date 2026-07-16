import type { ScoreMeta } from '../types'

const STORAGE_KEY = 'jerry_score_scores'

export type { ScoreMeta }

type StoredScore = Partial<ScoreMeta> & Pick<ScoreMeta, 'id' | 'title' | 'tags' | 'addedAt' | 'mimeType'>

/** 이전 버전에서 저장된 악보에 새 필드 기본값을 채워 넣어요 (하위 호환 마이그레이션). */
function normalizeScore(raw: StoredScore): ScoreMeta {
  return {
    id: raw.id,
    title: raw.title,
    tags: raw.tags ?? [],
    addedAt: raw.addedAt,
    mimeType: raw.mimeType,
    size: raw.size,
    pageCount: raw.pageCount,
    fileName: raw.fileName ?? raw.title,
    composer: raw.composer,
    genre: raw.genre,
    difficulty: raw.difficulty ?? 3,
    tuning: raw.tuning ?? 'Standard',
    tuningCustom: raw.tuningCustom,
    capo: raw.capo ?? 0,
    key: raw.key,
    status: raw.status ?? 'new',
    favorite: raw.favorite ?? false,
    source: raw.source,
    memo: raw.memo,
  }
}

export function getScores(): ScoreMeta[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? (JSON.parse(raw) as StoredScore[]) : []
    return parsed.map(normalizeScore)
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

type EditableScoreFields = Omit<ScoreMeta, 'id' | 'addedAt' | 'mimeType' | 'size' | 'pageCount' | 'fileName'>

export function updateScoreMeta(id: string, patch: Partial<EditableScoreFields>): void {
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
