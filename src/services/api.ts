import { getApiUrl, API_BASE_URL, API_ENDPOINTS } from '@/config/environment'
import { getUserData, setUserData, USER_DATA_KEYS } from '@/utils/userStorage'

// Token 管理
export const getAccessToken = (): string | null => {
  return getUserData<string>(USER_DATA_KEYS.ACCESS_TOKEN)
}

export const getRefreshToken = (): string | null => {
  return getUserData<string>(USER_DATA_KEYS.REFRESH_TOKEN)
}

export const setTokens = (accessToken: string, refreshToken: string): void => {
  setUserData(USER_DATA_KEYS.ACCESS_TOKEN, accessToken)
  setUserData(USER_DATA_KEYS.REFRESH_TOKEN, refreshToken)
}


export const clearAllCache = (): void => {
  sessionStorage.clear()
  localStorage.removeItem('trackInfoCache_v3')
}

export const RESPONSE_CODE = {
  SUCCESS: 2000,
  REAUTH_REQUIRED: 6003,
} as const

// API 響應類型定義
export interface ApiResponse<T = any> {
  code: number
  data: T
  msg: string
  details?: any
}

// Spotify 授權響應類型
export interface SpotifyAuthResponse {
  spotify_authorize_url: string
}


// Spotify Token 響應類型
export interface SpotifyTokenResponse {
  access_token: string
  spotify_access_token?: string
  token?: string
}

export interface LoginResponse {
  member_id: number
  access_token: string
  refresh_token: string
}

export interface ProxyAccountResponse {
  proxy_account_code: string
  provider_code: string
  access_token: string
  refresh_token: string
  expires_at: string
}

export interface LoginRequest {
  email: string
}

// 通用 API 請求函數
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {},
  skipReauth = false
): Promise<ApiResponse<T>> => {
  const url = endpoint.startsWith('http') ? endpoint : getApiUrl(endpoint as keyof typeof API_ENDPOINTS)
  
  console.log(`API Request: ${options.method || 'GET'} ${url}`)
  console.log('Endpoint:', endpoint)
  console.log('Full URL:', url)
  
  // 自動添加 Authorization header（如果有的話）
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  
  // 合併自定義 headers
  if (options.headers) {
    Object.assign(headers, options.headers)
  }
  
  const accessToken = getAccessToken()
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`
    console.log('Authorization header added')
  } else {
    console.log('No access token found')
  }
  
  const defaultOptions: RequestInit = {
    headers,
    ...options,
  }

  console.log('Request options:', defaultOptions)

  try {
    console.log('Making fetch request...')
    const response = await fetch(url, defaultOptions)
    console.log('Response received:', response.status, response.statusText)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('HTTP error response:', errorText)
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`)
    }
    
    const data: ApiResponse<T> = await response.json()
    console.log('Response data:', data)

    if (!skipReauth && data.code === RESPONSE_CODE.REAUTH_REQUIRED) {
      redirectToSpotifyReauth()
    }

    return data
  } catch (error) {
    console.error('API request failed:', error)
    throw error
  }
}

// 登入 API
export const loginUser = async (email: string): Promise<ApiResponse<LoginResponse>> => {
  const requestData: LoginRequest = { email }
  
  return apiRequest<LoginResponse>('login', {
    method: 'POST',
    body: JSON.stringify(requestData),
  })
}

// Spotify OAuth 授權 API（第二步：獲取授權 URL）
export const getSpotifyAuthUrl = async (): Promise<ApiResponse<SpotifyAuthResponse>> => {
  return apiRequest<SpotifyAuthResponse>('spotifyAuth', { method: 'GET' }, true)
}


// 獲取 Spotify Token API
export const getSpotifyToken = async (skipReauth = false): Promise<ApiResponse<SpotifyTokenResponse>> => {
  return apiRequest<SpotifyTokenResponse>('spotifyToken', { method: 'GET' }, skipReauth)
}

export const redirectToSpotifyReauth = (): never => {
  clearAllCache()
  window.location.href = '/spotify-pre-auth'
  throw new Error('REAUTH_REDIRECT')
}

// 處理 Spotify OAuth 授權碼 API
export const processSpotifyAuthCode = async (code: string, state?: string): Promise<ApiResponse<any>> => {
  return apiRequest<any>('spotifyAuth', {
    method: 'POST',
    body: JSON.stringify({
      code: code,
      state: state || null
    }),
  })
}



// 測試 API 連接
export const testApiConnection = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/account/login/`, {
      method: 'OPTIONS', // 使用 OPTIONS 方法測試連接
    })
    return response.ok
  } catch (error) {
    console.error('API connection test failed:', error)
    return false
  }
}

// 獲取 Proxy Account
export const acquireProxyAccount = async (): Promise<ApiResponse<ProxyAccountResponse>> => {
  return apiRequest<ProxyAccountResponse>('acquireProxyAccount', {
    method: 'POST',
  })
}

// 釋放 Proxy Account
export const releaseProxyAccount = async (): Promise<ApiResponse<any>> => {
  return apiRequest<any>('releaseProxyAccount', {
    method: 'POST',
  })
}

// Playlist 驗證請求類型
export interface PlaylistValidateRequest {
  spotify_playlist_id: string
  type: 'discover_weekly' | 'member_favorite'
}

// Playlist 導入請求類型
export interface PlaylistImportRequest {
  spotify_playlist_id: string
  type: 'discover_weekly' | 'member_favorite'
}

// Playlist 驗證響應類型
export interface PlaylistValidateResponse {
  is_valid: boolean
  validation_errors?: string[]
  tracks?: any[]
  playlist_name?: string
  track_count?: number
}

// Playlist 導入響應類型
export interface PlaylistImportResponse {
  success: boolean
  message?: string
  imported_tracks?: number
}

// 驗證 Playlist
export const validatePlaylist = async (
  spotifyPlaylistId: string,
  type: 'discover_weekly' | 'member_favorite'
): Promise<ApiResponse<PlaylistValidateResponse>> => {
  const requestData: PlaylistValidateRequest = {
    spotify_playlist_id: spotifyPlaylistId,
    type: type
  }

  return apiRequest<PlaylistValidateResponse>('playlistValidate', {
    method: 'POST',
    body: JSON.stringify(requestData),
  })
}

// 導入 Playlist
export const importPlaylist = async (
  spotifyPlaylistId: string,
  type: 'discover_weekly' | 'member_favorite'
): Promise<ApiResponse<PlaylistImportResponse>> => {
  const requestData: PlaylistImportRequest = {
    spotify_playlist_id: spotifyPlaylistId,
    type: type
  }

  return apiRequest<PlaylistImportResponse>('playlistImport', {
    method: 'POST',
    body: JSON.stringify(requestData),
  })
}

// Playlist 檢查響應類型
export interface PlaylistCheckResponse {
  id?: number
  type?: string
  external_id?: string
  description?: string
  created_at?: string
  playlist_tracks?: any[]
}

// 檢查 Playlist 是否已存在
export const checkPlaylist = async (
  type: 'discover_weekly' | 'member_favorite' | string
): Promise<ApiResponse<PlaylistCheckResponse>> => {
  const url = `${getApiUrl('playlistCheck')}?type=${type}`

  return apiRequest<PlaylistCheckResponse>(url, {
    method: 'GET',
  })
}

// Cache Order 請求類型
export interface CacheOrderRequest {
  type: 'discover_weekly' | 'member_favorite'
  track_ids: string[]
}

// Cache Order 響應類型
export interface CacheOrderResponse {
  success: boolean
  message?: string
}

// 快取播放清單順序
export const cachePlaylistOrder = async (
  type: 'discover_weekly' | 'member_favorite',
  trackIds: string[]
): Promise<ApiResponse<CacheOrderResponse>> => {
  const requestData: CacheOrderRequest = {
    type: type,
    track_ids: trackIds
  }

  return apiRequest<CacheOrderResponse>('playlistCacheOrder', {
    method: 'POST',
    body: JSON.stringify(requestData),
  })
}

// 獲取實驗播放清單
export const getExperimentPlaylist = async (
  experimentPhase?: number
): Promise<ApiResponse<PlaylistCheckResponse>> => {
  const url = experimentPhase !== undefined
    ? `${getApiUrl('playlistCheck')}?experiment_phase=${experimentPhase}&type=experiment`
    : `${getApiUrl('playlistCheck')}?type=experiment`

  return apiRequest<PlaylistCheckResponse>(url, {
    method: 'GET',
  })
}

// 更新歌曲評分請求類型
export interface UpdateSongRatingRequest {
  satisfaction_score?: number
  familiarity?: boolean
  surprise_score?: number
}

// 更新歌曲評分
export const updateSongRating = async (
  playlistTrackId: number,
  ratingData: UpdateSongRatingRequest
): Promise<ApiResponse<any>> => {
  const url = `${API_BASE_URL}/api/playlist/member/${playlistTrackId}/`

  return apiRequest<any>(url, {
    method: 'PATCH',
    body: JSON.stringify(ratingData),
  })
}

// 實驗階段完成確認類型
export interface ExperimentCompleteResponse {
  phase1: boolean
  phase2: boolean
}

// 確認實驗階段完成狀態
export const checkExperimentComplete = async (): Promise<ApiResponse<ExperimentCompleteResponse>> => {
  return apiRequest<ExperimentCompleteResponse>('experimentComplete', {
    method: 'GET',
  })
}

// 更新歌單滿意度評分請求類型
export interface UpdatePlaylistSatisfactionRequest {
  satisfaction_score: number
}

// 更新歌單滿意度評分
export const updatePlaylistSatisfaction = async (
  playlistId: number,
  satisfactionScore: number
): Promise<ApiResponse<any>> => {
  const url = `${API_BASE_URL}/api/playlist/member/${playlistId}/`

  const requestData: UpdatePlaylistSatisfactionRequest = {
    satisfaction_score: satisfactionScore
  }

  return apiRequest<any>(url, {
    method: 'PATCH',
    body: JSON.stringify(requestData),
  })
}

// 批次更新歌曲評分請求類型
export interface TrackRatingItem {
  playlist_track_id: number
  is_ever_listened: boolean
  satisfaction_score: number
  splendid_score: number
}

export interface BatchUpdateRatingsRequest {
  ratings: TrackRatingItem[]
}

// 批次更新所有歌曲評分
export const batchUpdateTrackRatings = async (
  playlistId: number,
  ratings: TrackRatingItem[]
): Promise<ApiResponse<any>> => {
  const url = `${API_BASE_URL}/api/playlist/member/${playlistId}/tracks/ratings/`

  const requestData: BatchUpdateRatingsRequest = {
    ratings: ratings
  }

  return apiRequest<any>(url, {
    method: 'PATCH',
    body: JSON.stringify(requestData),
  })
}
