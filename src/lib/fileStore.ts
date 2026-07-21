import { openDB, type DBSchema, type IDBPDatabase } from 'idb'

interface JerryFileDB extends DBSchema {
  files: {
    key: string
    value: Blob
  }
}

let dbPromise: Promise<IDBPDatabase<JerryFileDB>> | undefined

function getDb(): Promise<IDBPDatabase<JerryFileDB>> {
  if (!dbPromise) {
    dbPromise = openDB<JerryFileDB>('jerry-score-files', 1, {
      upgrade(db) {
        db.createObjectStore('files')
      },
    })
  }
  return dbPromise
}

export async function saveFile(id: string, file: Blob): Promise<void> {
  const db = await getDb()
  await db.put('files', file, id)
}

export async function getFile(id: string): Promise<Blob | undefined> {
  const db = await getDb()
  return db.get('files', id)
}

export async function deleteFile(id: string): Promise<void> {
  const db = await getDb()
  await db.delete('files', id)
}

export async function getStorageEstimate(): Promise<{ usage: number; quota: number } | null> {
  if (!navigator.storage?.estimate) return null
  const { usage, quota } = await navigator.storage.estimate()
  if (usage === undefined || quota === undefined) return null
  return { usage, quota }
}
