import { getAccessToken } from './googleAuth'

const API_BASE = 'https://www.googleapis.com/drive/v3'
const UPLOAD_BASE = 'https://www.googleapis.com/upload/drive/v3'
const APP_FOLDER_NAME = 'Jerry Score'
const FOLDER_ID_CACHE_KEY = 'jerry_score_folder_id'

export interface DriveFile {
  id: string
  name: string
  mimeType: string
  createdTime?: string
  size?: string
}

async function authHeaders(): Promise<HeadersInit> {
  const token = await getAccessToken()
  return { Authorization: `Bearer ${token}` }
}

async function driveFetch(path: string, init?: RequestInit): Promise<Response> {
  const headers = await authHeaders()
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { ...headers, ...(init?.headers ?? {}) },
  })
  if (!res.ok) {
    throw new Error(`Google Drive 요청 실패 (${res.status})`)
  }
  return res
}

export async function ensureAppFolder(): Promise<string> {
  const cached = localStorage.getItem(FOLDER_ID_CACHE_KEY)
  if (cached) return cached

  const q = encodeURIComponent(
    `name='${APP_FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
  )
  const listRes = await driveFetch(`/files?q=${q}&fields=files(id,name)&spaces=drive`)
  const listData = (await listRes.json()) as { files: DriveFile[] }

  if (listData.files?.length) {
    const folderId = listData.files[0].id
    localStorage.setItem(FOLDER_ID_CACHE_KEY, folderId)
    return folderId
  }

  const createRes = await driveFetch('/files?fields=id', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: APP_FOLDER_NAME, mimeType: 'application/vnd.google-apps.folder' }),
  })
  const created = (await createRes.json()) as { id: string }
  localStorage.setItem(FOLDER_ID_CACHE_KEY, created.id)
  return created.id
}

export async function listPdfFiles(): Promise<DriveFile[]> {
  const folderId = await ensureAppFolder()
  const q = encodeURIComponent(`'${folderId}' in parents and trashed=false`)
  const res = await driveFetch(
    `/files?q=${q}&fields=files(id,name,mimeType,createdTime,size)&orderBy=createdTime desc&pageSize=200`,
  )
  const data = (await res.json()) as { files: DriveFile[] }
  return data.files ?? []
}

export function uploadPdf(file: File, onProgress?: (percent: number) => void): Promise<DriveFile> {
  return ensureAppFolder().then(
    (folderId) =>
      new Promise<DriveFile>((resolve, reject) => {
        getAccessToken()
          .then((token) => {
            const metadata = {
              name: file.name,
              parents: [folderId],
              mimeType: 'application/pdf',
            }
            const form = new FormData()
            form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }))
            form.append('file', file)

            const xhr = new XMLHttpRequest()
            xhr.open(
              'POST',
              `${UPLOAD_BASE}/files?uploadType=multipart&fields=id,name,mimeType,createdTime,size`,
            )
            xhr.setRequestHeader('Authorization', `Bearer ${token}`)
            xhr.upload.onprogress = (event) => {
              if (event.lengthComputable && onProgress) {
                onProgress(Math.round((event.loaded / event.total) * 100))
              }
            }
            xhr.onload = () => {
              if (xhr.status >= 200 && xhr.status < 300) {
                resolve(JSON.parse(xhr.responseText) as DriveFile)
              } else {
                reject(new Error(`업로드 실패 (${xhr.status})`))
              }
            }
            xhr.onerror = () => reject(new Error('업로드 중 네트워크 오류가 발생했어요.'))
            xhr.send(form)
          })
          .catch(reject)
      }),
  )
}

export async function deleteDriveFile(fileId: string): Promise<void> {
  await driveFetch(`/files/${fileId}`, { method: 'DELETE' })
}

export async function downloadFileBlob(fileId: string): Promise<Blob> {
  const res = await driveFetch(`/files/${fileId}?alt=media`)
  return res.blob()
}

export interface StorageQuota {
  limit?: string
  usage?: string
  usageInDrive?: string
}

export async function getStorageQuota(): Promise<StorageQuota> {
  const res = await driveFetch('/about?fields=storageQuota')
  const data = (await res.json()) as { storageQuota: StorageQuota }
  return data.storageQuota
}
