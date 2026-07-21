import { useEffect } from 'react'

/** 뷰어를 보는 동안 화면이 꺼지지 않도록 유지해요. 탭 전환 등으로 잠금이 풀리면 되돌아왔을 때 다시 잡아요. */
export function useWakeLock(active: boolean): void {
  useEffect(() => {
    if (!active || !navigator.wakeLock) return

    let sentinel: WakeLockSentinel | null = null
    let cancelled = false

    const acquire = async () => {
      try {
        const lock = await navigator.wakeLock.request('screen')
        if (cancelled) {
          void lock.release()
          return
        }
        sentinel = lock
      } catch {
        // 권한 거부 등으로 실패해도 뷰어 사용 자체는 막지 않아요.
      }
    }

    void acquire()

    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && !sentinel) void acquire()
    }
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', handleVisibility)
      void sentinel?.release()
    }
  }, [active])
}
