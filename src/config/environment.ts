declare global {
  interface Window {
    CONFIG: {
      WALRUS_API_BASE_URL: string
      ENV: string
      APP_TITLE: string
    }
  }
}

export const ENV = window.CONFIG?.ENV || 'local'
export const API_BASE_URL = (window.CONFIG?.WALRUS_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '')

export const API_ENDPOINTS = {
  login: '/api/account/auth/login/',
  spotifyAuth: '/api/provider/spotify-auth/member/authorize',
  spotifyToken: '/api/provider/member/token/spotify/',
  acquireProxyAccount: '/api/provider/member/proxy-account/acquire/',
  releaseProxyAccount: '/api/provider/member/proxy-account/release/',
  playlistValidate: '/api/playlist/member/validate/',
  playlistImport: '/api/playlist/member/import/',
  playlistCheck: '/api/playlist/member/',
  playlistCacheOrder: '/api/playlist/member/cache-order/',
  experimentComplete: '/api/playlist/member/experiment/complete/'
}

export const getApiUrl = (endpoint: keyof typeof API_ENDPOINTS): string => {
  return `${API_BASE_URL}${API_ENDPOINTS[endpoint]}`
}

export const ENVIRONMENT_INFO = {
  env: ENV,
  apiBaseUrl: API_BASE_URL,
  isLocal: ENV === 'local',
  isStaging: ENV === 'staging'
}
