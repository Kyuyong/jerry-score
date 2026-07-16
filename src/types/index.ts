export type Tuning = 'Standard' | 'DropD' | 'Custom'
export type ScoreStatus = 'new' | 'practicing' | 'mastered'
export type Difficulty = 1 | 2 | 3 | 4 | 5

export interface ScoreMeta {
  id: string
  title: string
  tags: string[]
  addedAt: number
  mimeType: string
  size?: string
  pageCount?: number
  fileName: string

  composer?: string
  genre?: string
  difficulty: Difficulty
  tuning: Tuning
  tuningCustom?: string
  capo: number
  key?: string
  status: ScoreStatus
  favorite: boolean
  source?: string
  memo?: string
}

export interface StrokePoint {
  x: number
  y: number
}

export interface Stroke {
  points: StrokePoint[]
  color: string
  width: number
}
