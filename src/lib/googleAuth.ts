const GIS_SRC = 'https://accounts.google.com/gsi/client'
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined
const SCOPES = 'https://www.googleapis.com/auth/drive.file'
const TOKEN_STORAGE_KEY = 'jerry_score_token'

interface StoredToken {
  accessToken: string
  expiresAt: number
}

let tokenClient: GoogleTokenClient | undefined
let scriptLoadPromise: Promise<void> | undefined
let inMemoryToken: StoredToken | undefined

function loadGisScript(): Promise<void> {
  if (scriptLoadPromise) return scriptLoadPromise
  scriptLoadPromise = new Promise((resolve, reject) => {
    if (window.google?.accounts?.oauth2) {
      resolve()
      return
    }
    const script = document.createElement('script')
    script.src = GIS_SRC
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Google Identity Services 스크립트를 불러오지 못했어요.'))
    document.head.appendChild(script)
  })
  return scriptLoadPromise
}

function readStoredToken(): StoredToken | undefined {
  if (inMemoryToken) return inMemoryToken
  const raw = sessionStorage.getItem(TOKEN_STORAGE_KEY)
  if (!raw) return undefined
  try {
    const parsed = JSON.parse(raw) as StoredToken
    if (parsed.expiresAt > Date.now()) {
      inMemoryToken = parsed
      return parsed
    }
  } catch {
    // ignore malformed cache
  }
  sessionStorage.removeItem(TOKEN_STORAGE_KEY)
  return undefined
}

function writeStoredToken(token: StoredToken) {
  inMemoryToken = token
  sessionStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(token))
}

export async function initGoogleAuth(): Promise<void> {
  if (!CLIENT_ID) {
    throw new Error('VITE_GOOGLE_CLIENT_ID가 설정되지 않았어요. .env 파일을 확인해주세요.')
  }
  await loadGisScript()
}

export function hasStoredToken(): boolean {
  return Boolean(readStoredToken())
}

export function requestAccessToken(promptConsent = false): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!window.google) {
      reject(new Error('Google Identity Services가 아직 로드되지 않았어요.'))
      return
    }
    if (!CLIENT_ID) {
      reject(new Error('VITE_GOOGLE_CLIENT_ID가 설정되지 않았어요.'))
      return
    }
    if (!tokenClient) {
      tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: () => {},
      })
    }
    tokenClient.callback = (response) => {
      if (response.error) {
        reject(new Error(`Google 인증 실패: ${response.error}`))
        return
      }
      const token: StoredToken = {
        accessToken: response.access_token,
        expiresAt: Date.now() + (response.expires_in - 60) * 1000,
      }
      writeStoredToken(token)
      resolve(token.accessToken)
    }
    tokenClient.requestAccessToken({ prompt: promptConsent ? 'consent' : '' })
  })
}

export async function getAccessToken(): Promise<string> {
  const stored = readStoredToken()
  if (stored) return stored.accessToken
  return requestAccessToken()
}

export function signOut(): void {
  const stored = readStoredToken()
  if (stored && window.google) {
    window.google.accounts.oauth2.revoke(stored.accessToken, () => {})
  }
  inMemoryToken = undefined
  sessionStorage.removeItem(TOKEN_STORAGE_KEY)
}
