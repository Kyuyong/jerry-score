import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import {
  initGoogleAuth,
  requestAccessToken,
  hasStoredToken,
  wasPreviouslyAuthorized,
  signOut as googleSignOut,
} from '../lib/googleAuth'

interface AuthContextValue {
  isReady: boolean
  isSignedIn: boolean
  initError: string | null
  signIn: () => Promise<void>
  signOut: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(false)
  const [isSignedIn, setIsSignedIn] = useState(false)
  const [initError, setInitError] = useState<string | null>(null)

  useEffect(() => {
    initGoogleAuth()
      .then(async () => {
        if (hasStoredToken()) {
          setIsSignedIn(true)
        } else if (wasPreviouslyAuthorized()) {
          // 이전에 로그인했었지만 토큰이 만료된 상태 — 사용자 상호작용 없이 조용히 재발급 시도
          try {
            await requestAccessToken('none')
            setIsSignedIn(true)
          } catch {
            setIsSignedIn(false)
          }
        }
        setIsReady(true)
      })
      .catch((err: unknown) => {
        setInitError(err instanceof Error ? err.message : 'Google 인증 초기화에 실패했어요.')
        setIsReady(true)
      })
  }, [])

  const signIn = async () => {
    await requestAccessToken('consent')
    setIsSignedIn(true)
  }

  const signOut = () => {
    googleSignOut()
    setIsSignedIn(false)
  }

  return (
    <AuthContext.Provider value={{ isReady, isSignedIn, initError, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth는 AuthProvider 내부에서 사용해야 해요.')
  return ctx
}
