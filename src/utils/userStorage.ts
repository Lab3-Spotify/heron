// 用戶特定資料的 sessionStorage 管理工具
// 所有用戶相關資料都會加上用戶 email 作為前綴，確保不同用戶資料獨立

/**
 * 獲取當前用戶的 email
 */
export const getCurrentUserEmail = (): string => {
  return sessionStorage.getItem('userEmail') || ''
}

/**
 * 設置當前用戶的 email
 */
export const setCurrentUserEmail = (email: string): void => {
  sessionStorage.setItem('userEmail', email)
}

/**
 * 獲取用戶特定資料的 key
 */
const getUserKey = (key: string): string => {
  const email = getCurrentUserEmail()
  return email ? `${key}_${email}` : key
}

/**
 * 儲存用戶特定資料
 */
export const setUserData = (key: string, value: any): void => {
  const userKey = getUserKey(key)
  sessionStorage.setItem(userKey, JSON.stringify(value))
}

/**
 * 獲取用戶特定資料
 */
export const getUserData = <T>(key: string, defaultValue: T | null = null): T | null => {
  const userKey = getUserKey(key)
  const data = sessionStorage.getItem(userKey)
  if (!data) return defaultValue
  try {
    return JSON.parse(data) as T
  } catch {
    return defaultValue
  }
}

/**
 * 移除用戶特定資料
 */
export const removeUserData = (key: string): void => {
  const userKey = getUserKey(key)
  sessionStorage.removeItem(userKey)
}

/**
 * 清除當前用戶的所有資料
 */
export const clearCurrentUserData = (): void => {
  const email = getCurrentUserEmail()
  if (!email) return

  // 找出所有屬於當前用戶的 key 並刪除
  const keysToRemove: string[] = []
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i)
    if (key && key.endsWith(`_${email}`)) {
      keysToRemove.push(key)
    }
  }

  keysToRemove.forEach(key => sessionStorage.removeItem(key))
  console.log(`Cleared ${keysToRemove.length} items for user ${email}`)
}

/**
 * 儲存全局共用資料（不區分用戶）
 */
export const setGlobalData = (key: string, value: any): void => {
  sessionStorage.setItem(key, JSON.stringify(value))
}

/**
 * 獲取全局共用資料（不區分用戶）
 */
export const getGlobalData = <T>(key: string, defaultValue: T | null = null): T | null => {
  const data = sessionStorage.getItem(key)
  if (!data) return defaultValue
  try {
    return JSON.parse(data) as T
  } catch {
    return defaultValue
  }
}

// 用戶特定資料的 key 常量
export const USER_DATA_KEYS = {
  SONG_RATINGS: 'songRatings',
  EXPERIMENT_STATE: 'experimentState',
  PROXY_ACCOUNT_DATA: 'proxyAccountData',
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  SPOTIFY_ACCESS_TOKEN: 'spotifyAccessToken',
  FROM_PRE_AUTH: 'fromPreAuth',
  FROM_WELCOME: 'fromWelcome',
} as const

// 全局共用資料的 key 常量
export const GLOBAL_DATA_KEYS = {
  TRACK_INFO_CACHE: 'trackInfoCache_v3', // v3: 再次更新失效的歌曲 ID
  USER_EMAIL: 'userEmail',
} as const
