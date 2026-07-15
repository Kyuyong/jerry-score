export {}

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient(config: {
            client_id: string
            scope: string
            callback: (response: GoogleTokenResponse) => void
          }): GoogleTokenClient
          revoke(accessToken: string, done: () => void): void
        }
      }
    }
  }

  interface GoogleTokenResponse {
    access_token: string
    expires_in: number
    error?: string
  }

  interface GoogleTokenClient {
    callback: (response: GoogleTokenResponse) => void
    requestAccessToken(overrides?: { prompt?: string }): void
  }
}
