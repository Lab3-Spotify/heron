<template>
  <div class="min-h-screen flex items-center justify-center bg-black">
    <div class="text-center">
      <!-- 載入動畫 -->
      <div v-if="isLoading" class="space-y-4">
        <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500 mx-auto"></div>
        <h2 class="text-2xl font-bold text-white">處理 Spotify 授權中...</h2>
        <p class="text-gray-400">請稍候，正在驗證您的授權狀態</p>
      </div>
      
      <!-- 成功狀態 -->
      <div v-else-if="authStatus === 'success'" class="space-y-4">
        <div class="text-green-500 mx-auto">
          <svg class="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
          </svg>
        </div>
        <h2 class="text-2xl font-bold text-white">Spotify 授權成功！</h2>
        <p class="text-gray-400">正在跳轉頁面...</p>
      </div>
      
      <!-- 錯誤狀態 -->
      <div v-else-if="authStatus === 'error'" class="space-y-4">
        <div class="text-red-500 mx-auto">
          <svg class="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
          </svg>
        </div>
        <h2 class="text-2xl font-bold text-white">Spotify 授權失敗</h2>
        <p class="text-gray-400 mb-6">{{ errorMessage }}</p>
        
        <!-- 操作按鈕區域 -->
        <div class="space-y-3">
          <button 
            @click="retryAuthorization" 
            class="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-semibold"
          >
            🔄 重新嘗試授權
          </button>
          
          <button 
            @click="goBackToWelcome" 
            class="w-full px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors font-semibold"
          >
            ← 返回登入頁面
          </button>
        </div>
      </div>
      
      <!-- 未知狀態 -->
      <div v-else class="space-y-4">
        <div class="text-yellow-500 mx-auto">
          <svg class="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
          </svg>
        </div>
        <h2 class="text-2xl font-bold text-white">未知狀態</h2>
        <p class="text-gray-400 mb-6">無法識別的授權狀態，請重新嘗試或返回登入頁面</p>
        
        <!-- 操作按鈕區域 -->
        <div class="space-y-3">
          <button 
            @click="retryAuthorization" 
            class="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-semibold"
          >
            🔄 重新嘗試授權
          </button>
          
          <button 
            @click="goBackToWelcome" 
            class="w-full px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors font-semibold"
          >
            ← 返回登入頁面
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getUserData, setUserData, USER_DATA_KEYS } from '@/utils/userStorage'
import { getSpotifyToken, RESPONSE_CODE, redirectToSpotifyReauth } from '@/services/api'

const router = useRouter()
const route = useRoute()

// 狀態管理
const isLoading = ref(true)
const authStatus = ref<'loading' | 'success' | 'error' | 'unknown'>('loading')
const errorMessage = ref('')



// 處理授權回調
const handleAuthCallback = async () => {
  try {
    // 檢查是否有錯誤參數
    const error = route.query.error as string

    console.log('Spotify callback received:', {
      error,
      fullQuery: route.query
    })

    // 檢查是從哪個頁面來的
    const fromPreAuth = getUserData<boolean>(USER_DATA_KEYS.FROM_PRE_AUTH, false)
    console.log('fromPreAuth flag:', fromPreAuth)

    // 如果有錯誤參數，表示授權失敗
    if (error) {
      console.error('Spotify OAuth error:', error)
      authStatus.value = 'error'
      errorMessage.value = `Spotify 授權失敗: ${error}`

      // 失敗時不自動跳轉，讓用戶手動選擇操作
      return
    }

    // 沒有錯誤，檢查 Spotify token 是否存在
    console.log('Checking Spotify token...')
    try {
      const tokenResponse = await getSpotifyToken()

      if (tokenResponse.code === RESPONSE_CODE.REAUTH_REQUIRED) {
        console.warn('Reauth required after callback, redirecting to Spotify OAuth...')
        await redirectToSpotifyReauth()
        return
      }

      if (tokenResponse.code === RESPONSE_CODE.SUCCESS && tokenResponse.data &&
          (tokenResponse.data.access_token || tokenResponse.data.spotify_access_token)) {
        // 授權成功，有 token
        authStatus.value = 'success'
        console.log('Spotify token exists, authorization successful')

        // 儲存 access token
        const accessToken = tokenResponse.data.access_token || tokenResponse.data.spotify_access_token
        setUserData(USER_DATA_KEYS.SPOTIFY_ACCESS_TOKEN, accessToken)

        // 延遲跳轉，讓用戶看到成功訊息
        setTimeout(() => {
          console.log('Redirecting to spotify-pre-auth...')

          // 根據來源頁面決定跳轉目標
          const fromWelcome = getUserData<boolean>(USER_DATA_KEYS.FROM_WELCOME, false)

          if (fromPreAuth) {
            // 從 pre-auth 來的，回到 pre-auth（不帶參數，讓它自己檢查狀態）
            router.replace('/spotify-pre-auth')
          } else if (fromWelcome) {
            // 從 welcome 來的，跳到實驗開始
            setUserData(USER_DATA_KEYS.FROM_WELCOME, false)
            router.replace('/experiment-start')
          } else {
            // 正式實驗，跳到實驗開始
            router.replace('/experiment-start')
          }
        }, 1500)
      } else {
        // 沒有 token，授權可能失敗
        throw new Error('No Spotify token found')
      }
    } catch (tokenError) {
      console.error('Failed to get Spotify token:', tokenError)
      authStatus.value = 'error'
      errorMessage.value = '無法獲取 Spotify 授權，請重新嘗試'
    }
    
  } catch (error) {
    console.error('Auth callback error:', error)
    authStatus.value = 'error'
    errorMessage.value = '處理授權回調時發生錯誤'
  } finally {
    isLoading.value = false
  }
}

// 返回登入頁面
const goBackToWelcome = () => {
  const fromPreAuth = getUserData<boolean>(USER_DATA_KEYS.FROM_PRE_AUTH, false)
  const fromWelcome = getUserData<boolean>(USER_DATA_KEYS.FROM_WELCOME, false)
  
  if (fromPreAuth) {
    router.replace('/spotify-pre-auth')
  } else if (fromWelcome) {
    router.replace('/welcome')
  } else {
    router.replace('/')
  }
}

// 重新嘗試授權
const retryAuthorization = async () => {
  console.log('Retrying Spotify authorization...')
  isLoading.value = true
  authStatus.value = 'loading'
  errorMessage.value = ''
  
  try {
    // 重新執行授權流程
    await handleAuthCallback()
  } catch (error) {
    console.error('Retry failed:', error)
    authStatus.value = 'error'
    errorMessage.value = '重新嘗試失敗，請檢查網路連線或稍後再試'
  } finally {
    isLoading.value = false
  }
}

// 組件掛載時處理回調
onMounted(() => {
  console.log('SpotifyCallback mounted')
  console.log('Current URL:', window.location.href)
  console.log('URL search params:', window.location.search)
  console.log('Route query:', route.query)
  handleAuthCallback()
})
</script>

<style scoped>
/* 頁面轉場效果 */
.min-h-screen {
  transition: opacity 0.8s ease-out;
  background-color: #000000 !important;
}

/* 狀態切換動畫 */
.text-center > div {
  animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 載入動畫增強 */
.animate-spin {
  animation: spin 1s linear infinite;
}

/* Spotify 風格的滾動條 */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #1a1a1a;
}

::-webkit-scrollbar-thumb {
  background: #1DB954;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #1ED760;
}
</style>
