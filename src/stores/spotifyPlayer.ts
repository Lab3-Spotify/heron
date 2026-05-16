import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getUserData, setUserData, USER_DATA_KEYS } from '@/utils/userStorage'
import { RESPONSE_CODE, redirectToSpotifyReauth } from '@/services/api'
import { API_BASE_URL, API_ENDPOINTS } from '@/config/environment'

export const useSpotifyPlayerStore = defineStore('spotifyPlayer', () => {
  const spotifyPlayer = ref<any>(null)
  const deviceId = ref<string>('')
  const isPlayerReady = ref(false)
  const isInitializing = ref(false)

  // 載入 Spotify Web Playback SDK
  const loadSpotifySDK = (): Promise<void> => {
    return new Promise((resolve) => {
      if (window.Spotify) {
        resolve()
        return
      }

      window.onSpotifyWebPlaybackSDKReady = () => {
        resolve()
      }

      if (!document.querySelector('script[src="https://sdk.scdn.co/spotify-player.js"]')) {
        const script = document.createElement('script')
        script.src = 'https://sdk.scdn.co/spotify-player.js'
        script.async = true
        document.head.appendChild(script)
      }
    })
  }

  // 刷新 Spotify Token
  const refreshSpotifyToken = async (): Promise<boolean> => {
    try {
      const userAccessToken = getUserData<string>(USER_DATA_KEYS.ACCESS_TOKEN)
      if (!userAccessToken) {
        console.error('[SpotifyStore] No user access token found')
        return false
      }

      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.spotifyToken}?account_type=proxy_account`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${userAccessToken}`
        }
      })

      if (!response.ok) {
        console.error('[SpotifyStore] Failed to refresh token:', response.status)
        return false
      }

      const newTokenData = await response.json()

      if (newTokenData.code === RESPONSE_CODE.REAUTH_REQUIRED) {
        console.warn('[SpotifyStore] Reauth required, redirecting to Spotify OAuth...')
        await redirectToSpotifyReauth()
        return false
      }

      const accessToken = newTokenData.data?.access_token || newTokenData.access_token

      if (!accessToken) {
        console.error('[SpotifyStore] No access_token in API response:', newTokenData)
        return false
      }

      let proxyData = getUserData<any>(USER_DATA_KEYS.PROXY_ACCOUNT_DATA)
      if (!proxyData) {
        proxyData = {}
      }
      proxyData.access_token = accessToken
      setUserData(USER_DATA_KEYS.PROXY_ACCOUNT_DATA, proxyData)

      console.log('[SpotifyStore] ✅ Token refreshed')
      return true
    } catch (error) {
      console.error('[SpotifyStore] Error refreshing token:', error)
      return false
    }
  }

  // 初始化 Spotify Player（全局單例）
  const initializePlayer = async (): Promise<boolean> => {
    // 如果已經初始化且 player 存在，直接返回
    if (spotifyPlayer.value && deviceId.value && isPlayerReady.value) {
      console.log('[SpotifyStore] Player already initialized, device ID:', deviceId.value)
      return true
    }

    // 如果正在初始化，等待
    if (isInitializing.value) {
      console.log('[SpotifyStore] Player initialization in progress, waiting...')
      await new Promise(resolve => {
        const checkInterval = setInterval(() => {
          if (!isInitializing.value) {
            clearInterval(checkInterval)
            resolve(true)
          }
        }, 100)
      })
      return isPlayerReady.value
    }

    isInitializing.value = true

    try {
      // 確保 SDK 已加載
      await loadSpotifySDK()

      // 獲取 token
      let proxyData = getUserData<any>(USER_DATA_KEYS.PROXY_ACCOUNT_DATA)
      if (!proxyData || !proxyData.access_token) {
        console.log('[SpotifyStore] No token found, refreshing...')
        const refreshed = await refreshSpotifyToken()
        if (!refreshed) {
          console.error('[SpotifyStore] Failed to refresh token')
          isInitializing.value = false
          return false
        }
        proxyData = getUserData<any>(USER_DATA_KEYS.PROXY_ACCOUNT_DATA)
      }

      const token = proxyData.access_token
      console.log('[SpotifyStore] Initializing player with token:', token ? 'Token exists' : 'No token')

      const player = new window.Spotify.Player({
        name: 'Heron Experiment Player',
        getOAuthToken: async (cb: (token: string) => void) => {
          const currentProxyData = getUserData<any>(USER_DATA_KEYS.PROXY_ACCOUNT_DATA)
          if (currentProxyData && currentProxyData.access_token) {
            cb(currentProxyData.access_token)
          } else {
            const refreshed = await refreshSpotifyToken()
            if (refreshed) {
              const refreshedProxyData = getUserData<any>(USER_DATA_KEYS.PROXY_ACCOUNT_DATA)
              if (refreshedProxyData && refreshedProxyData.access_token) {
                cb(refreshedProxyData.access_token)
              }
            }
          }
        },
        volume: 0.2
      })

      // 錯誤處理
      player.addListener('initialization_error', ({ message }: { message: string }) => {
        console.error('[SpotifyStore] Initialization error:', message)
      })

      player.addListener('authentication_error', async ({ message }: { message: string }) => {
        console.error('[SpotifyStore] Authentication error:', message)
        const refreshed = await refreshSpotifyToken()
        if (refreshed) {
          await player.disconnect()
          await player.connect()
        }
      })

      // account_error 和 playback_error 由組件自行處理
      // 因為它們可能需要組件特定的邏輯（如重試、UI 更新等）

      // 播放器準備就緒 - 使用 Promise 等待
      const readyPromise = new Promise<void>((resolve) => {
        player.addListener('ready', async ({ device_id }: { device_id: string }) => {
          console.log('[SpotifyStore] ✅ Player ready with device ID:', device_id)
          deviceId.value = device_id
          spotifyPlayer.value = player

          // 等待 Spotify 服務器註冊設備
          console.log('[SpotifyStore] ⏳ Waiting for Spotify to register device...')
          await new Promise(r => setTimeout(r, 2000))

          isPlayerReady.value = true
          isInitializing.value = false
          console.log('[SpotifyStore] ✅ Device registered and ready')
          resolve()
        })
      })

      player.addListener('not_ready', ({ device_id }: { device_id: string }) => {
        console.log('[SpotifyStore] Device offline:', device_id)
        isPlayerReady.value = false
      })

      // 連接播放器
      console.log('[SpotifyStore] 🔌 Connecting player...')
      const connected = await player.connect()
      if (connected) {
        console.log('[SpotifyStore] ✅ Player connected, waiting for ready event...')
        // 等待 ready 事件觸發
        await readyPromise
        console.log('[SpotifyStore] ✅ Ready event received, player fully initialized')
        return true
      } else {
        console.error('[SpotifyStore] ❌ Failed to connect player')
        isInitializing.value = false
        return false
      }
    } catch (error) {
      console.error('[SpotifyStore] Error initializing player:', error)
      isInitializing.value = false
      return false
    }
  }

  // 斷開播放器
  const disconnectPlayer = async () => {
    if (spotifyPlayer.value) {
      await spotifyPlayer.value.disconnect()
      spotifyPlayer.value = null
      deviceId.value = ''
      isPlayerReady.value = false
      console.log('[SpotifyStore] Player disconnected')
    }
  }

  return {
    spotifyPlayer,
    deviceId,
    isPlayerReady,
    isInitializing,
    initializePlayer,
    disconnectPlayer,
    refreshSpotifyToken
  }
})
