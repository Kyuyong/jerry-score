import type { ScoreStatus, Tuning } from '../types'

export const STATUS_ORDER: ScoreStatus[] = ['new', 'practicing', 'mastered']
export const TUNING_ORDER: Tuning[] = ['Standard', 'DropD', 'Custom']

export const STATUS_LABEL: Record<ScoreStatus, string> = {
  new: '신규',
  practicing: '연습중',
  mastered: '완성',
}

export const TUNING_LABEL: Record<Tuning, string> = {
  Standard: '스탠다드',
  DropD: '드롭 D',
  Custom: '커스텀',
}

export const STATUS_BADGE_CLASS: Record<ScoreStatus, string> = {
  new: 'bg-dark/10 text-dark/60',
  practicing: 'bg-accent/35 text-dark',
  mastered: 'bg-primary/15 text-primary',
}
