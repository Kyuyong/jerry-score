import { useEffect, useState } from 'react'
import Header from '../components/Header'
import { useAuth } from '../contexts/AuthContext'
import { getStorageQuota } from '../lib/googleDrive'
import { APP_VERSION } from '../version'
import { formatBytes } from '../lib/format'

export default function SettingsPage() {
  const { isSignedIn, signIn, signOut } = useAuth()
  const [quota, setQuota] = useState<{ usage: number; limit: number } | null>(null)
  const [quotaError, setQuotaError] = useState<string | null>(null)

  useEffect(() => {
    if (!isSignedIn) return
    getStorageQuota()
      .then((q) => {
        setQuota({ usage: Number(q.usage ?? 0), limit: Number(q.limit ?? 0) })
      })
      .catch((err: unknown) => {
        setQuotaError(err instanceof Error ? err.message : '저장 용량을 불러오지 못했어요.')
      })
  }, [isSignedIn])

  return (
    <div className="min-h-screen bg-light">
      <Header title="설정" back />
      <main className="mx-auto max-w-md space-y-4 px-4 py-6">
        <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-dark/5">
          <h2 className="mb-2 text-sm font-semibold text-dark/70">Google 계정</h2>
          {isSignedIn ? (
            <div className="flex items-center justify-between">
              <span className="text-sm text-dark">연동됨</span>
              <button onClick={signOut} className="rounded-full border border-dark/20 px-3 py-1 text-sm text-dark/70">
                로그아웃
              </button>
            </div>
          ) : (
            <button
              onClick={() => void signIn()}
              className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-white"
            >
              Google 계정 연결
            </button>
          )}
        </section>

        <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-dark/5">
          <h2 className="mb-2 text-sm font-semibold text-dark/70">Google Drive 저장 용량</h2>
          {!isSignedIn && <p className="text-sm text-dark/50">로그인 후 확인할 수 있어요.</p>}
          {isSignedIn && quotaError && <p className="text-sm text-red-600">{quotaError}</p>}
          {isSignedIn && quota && (
            <div>
              <div className="mb-1 h-2 w-full overflow-hidden rounded-full bg-light">
                <div
                  className="h-full bg-primary"
                  style={{ width: `${Math.min(100, (quota.usage / quota.limit) * 100)}%` }}
                />
              </div>
              <p className="text-sm text-dark/60">
                {formatBytes(quota.usage)} / {formatBytes(quota.limit)} 사용 중
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
