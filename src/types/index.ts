export interface ScoreMeta {
  id: string
  title: string
  tags: string[]
  addedAt: number
  mimeType: string
  size?: string
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
