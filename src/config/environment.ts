// 環境配置
export const ENV = import.meta.env.ENV || 'local'

// API 基礎 URL - 確保沒有結尾斜線
export const API_BASE_URL = (import.meta.env.WALRUS_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '')

// API 端點配置
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

// 完整的 API URL 生成函數
export const getApiUrl = (endpoint: keyof typeof API_ENDPOINTS): string => {
  return `${API_BASE_URL}${API_ENDPOINTS[endpoint]}`
}

// 環境資訊
export const ENVIRONMENT_INFO = {
  env: ENV,
  apiBaseUrl: API_BASE_URL,
  isLocal: ENV === 'local',
  isStaging: ENV === 'staging'
}
