import { useEffect, useState } from 'react'
import Header from '../components/Header'
import { getStorageEstimate } from '../lib/fileStore'
import { APP_VERSION } from '../version'
import { formatBytes } from '../lib/format'

export default function SettingsPage() {
  const [storage, setStorage] = useState<{ usage: number; quota: number } | null>(null)
  const [storageError, setStorageError] = useState<string | null>(null)

  useEffect(() => {
    getStorageEstimate()
      .then((estimate) => {
        if (estimate) setStorage(estimate)
        else setStorageError('이 브라우저에서는 저장 용량을 확인할 수 없어요.')
      })
      .catch(() => setStorageError('저장 용량을 불러오지 못했어요.'))
  }, [])

  return (
    <div className="min-h-screen bg-light">
      <Header title="설정" back />
      <main className="mx-auto max-w-md space-y-4 px-4 py-6">
        <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-dark/5">
          <h2 className="mb-2 text-sm font-semibold text-dark/70">기기 저장 용량</h2>
          {storageError && <p className="text-sm text-red-600">{storageError}</p>}
          {storage && (
            <div>
              <div className="mb-1 h-2 w-full overflow-hidden rounded-full bg-light">
                <div
                  className="h-full bg-primary"
                  style={{ width: `${Math.min(100, (storage.usage / storage.quota) * 100)}%` }}
                />
              </div>
              <p className="text-sm text-dark/60">
                {formatBytes(storage.usage)} / {formatBytes(storage.quota)} 사용 중
              </p>
            </div>
          )}
        </section>

        <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-dark/5">
          <h2 className="mb-2 text-sm font-semibold text-dark/70">앱 정보</h2>
          <p className="text-sm text-dark/60">Jerry Score v{APP_VERSION}</p>
          <p className="text-sm text-dark/60">개인용 PDF 악보 뷰어 PWA</p>
        </section>
      </main>
    </div>
  )
}
