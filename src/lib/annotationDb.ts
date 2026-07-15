import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { Stroke } from '../types'

interface AnnotationRecord {
  scoreId: string
  page: number
  strokes: Stroke[]
  updatedAt: number
}

interface JerryScoreDB extends DBSchema {
  annotations: {
    key: string
    value: AnnotationRecord
  }
}

let dbPromise: Promise<IDBPDatabase<JerryScoreDB>> | undefined

function getDb(): Promise<IDBPDatabase<JerryScoreDB>> {
  if (!dbPromise) {
    dbPromise = openDB<JerryScoreDB>('jerry-score', 1, {
      upgrade(db) {
        db.createObjectStore('annotations')
      },
    })
  }
  return dbPromise
}

function keyFor(scoreId: string, page: number): string {
  return `${scoreId}:${page}`
}

export async function getPageStrokes(scoreId: string, page: number): Promise<Stroke[]> {
  const db = await getDb()
  const record = await db.get('annotations', keyFor(scoreId, page))
  return record?.strokes ?? []
}

export async function savePageStrokes(scoreId: string, page: number, strokes: Stroke[]): Promise<void> {
  const db = await getDb()
  await db.put('annotations', { scoreId, page, strokes, updatedAt: Date.now() }, keyFor(scoreId, page))
}

export async function clearPageStrokes(scoreId: string, page: number): Promise<void> {
  const db = await getDb()
  await db.delete('annotations', keyFor(scoreId, page))
}

export async function clearScoreAnnotations(scoreId: string): Promise<void> {
  const db = await getDb()
  const tx = db.transaction('annotations', 'readwrite')
  let cursor = await tx.store.openCursor()
  while (cursor) {
    if (cursor.value.scoreId === scoreId) await cursor.delete()
    cursor = await cursor.continue()
  }
  await tx.done
}
