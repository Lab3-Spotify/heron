<template>
  <div class="min-h-screen relative overflow-hidden bg-black">
    <!-- 粒子背景 -->
    <ParticleBackground
      :enabled="true"
      :max-particles="5"
      :particle-radius="1"
      :spawn-interval="1000"
      :single-spawn-chance="0.35"
      :double-spawn-chance="0.15"
      :particle-lifetime="5000"
      :z-index="2"
      :colors="{
        hueRange: [0.25, 0.6],
        saturationRange: [0.6, 1.0],
        lightnessRange: [0.5, 0.9]
      }"
    />

    <!-- 漸層覆蓋層 - Spotify 風格 -->
    <div class="absolute inset-0 bg-gradient-to-br from-green-900/20 via-black/40 to-green-800/20 opacity-95 pointer-events-none"></div>

    <!-- 內容容器 -->
    <div class="relative min-h-screen py-8" style="pointer-events: none; z-index: 3;">
      <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- 實驗標題 -->
        <div class="text-center mb-12">
          <div class="inline-flex items-center space-x-3 mb-6">
            <div class="w-16 h-16 bg-gradient-to-r from-green-500 to-green-400 rounded-full flex items-center justify-center shadow-lg">
              <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.369 4.369 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z"/>
              </svg>
            </div>
            <h1 class="text-6xl font-bold text-white mb-2 bg-gradient-to-r from-green-400 to-green-300 bg-clip-text text-transparent">
              推薦歌單評分任務
            </h1>
          </div>
        </div>

        <!-- 實驗說明卡片 -->
        <div class="bg-gray-900 bg-opacity-80 backdrop-blur-md rounded-xl p-8 mb-8 border border-gray-700 shadow-xl" style="pointer-events: auto;">
          <h2 class="text-2xl font-semibold text-white mb-6 flex items-center justify-center">
            <svg class="w-6 h-6 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
            </svg>
            實驗流程
          </h2>
          <div class="space-y-4 text-gray-300">
            <div class="flex items-start space-x-3">
              <div class="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-green-500 to-green-400 text-white rounded-full flex items-center justify-center text-sm font-medium shadow-lg">
                1
              </div>
              <p>您將被隨機分配到實驗組，聆聽不同長度的歌單</p>
            </div>
            <div class="flex items-start space-x-3">
              <div class="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-green-500 to-green-400 text-white rounded-full flex items-center justify-center text-sm font-medium shadow-lg">
                2
              </div>
              <p>每個歌單包含您熟悉和不熟悉的歌曲</p>
            </div>
            <div class="flex items-start space-x-3">
              <div class="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-green-500 to-green-400 text-white rounded-full flex items-center justify-center text-sm font-medium shadow-lg">
                3
              </div>
              <p>聽完每個歌單後，請您對整體滿意度進行評分</p>
            </div>
            <div class="flex items-start space-x-3">
              <div class="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-green-500 to-green-400 text-white rounded-full flex items-center justify-center text-sm font-medium shadow-lg">
                4
              </div>
              <p>整個實驗約需 20-30 分鐘完成</p>
            </div>
          </div>
        </div>

        <!-- 登入表單 -->
        <div class="bg-gray-900 bg-opacity-80 backdrop-blur-md rounded-xl p-8 mb-8 border border-gray-700 shadow-xl" style="pointer-events: auto;">
          <h2 class="text-2xl font-semibold text-white mb-6 flex items-center justify-center">
            <svg class="w-6 h-6 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" clip-rule="evenodd"/>
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
            </svg>
            開始實驗
          </h2>

          <div class="space-y-6">
            <!-- Step 1: Email 驗證 -->
            <div class="space-y-4">
              <div class="flex items-center space-x-3">
                <div :class="[
                  'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                  emailVerified ? 'bg-green-500 text-white' : 'bg-gray-700 text-gray-300'
                ]">
                  <svg v-if="emailVerified" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                  </svg>
                  <span v-else>1</span>
                </div>
                <h3 class="text-lg font-semibold text-white">驗證 Email</h3>
              </div>

              <div class="ml-11 space-y-3">
                <div class="form-group">
                  <input
                    id="email"
                    v-model="email"
                    type="email"
                    required
                    :disabled="emailVerified"
                    class="w-full px-4 py-3 bg-gray-800 bg-opacity-70 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-white placeholder-gray-400 transition-all duration-200 backdrop-blur-sm text-center text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="your.email@example.com"
                    :class="{ 'border-red-500': emailError && !emailVerified }"
                  />
                </div>

                <!-- 錯誤提示 -->
                <div v-if="emailError && !emailVerified" class="p-3 bg-red-900/50 border border-red-500 rounded-lg">
                  <div class="flex items-center space-x-2">
                    <svg class="w-5 h-5 text-red-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                    </svg>
                    <span class="text-red-300 font-medium">{{ emailError }}</span>
                  </div>
                </div>

                <!-- 成功提示 -->
                <div v-if="emailVerified" class="p-3 bg-green-900/50 border border-green-500 rounded-lg">
                  <div class="flex items-center space-x-2">
                    <svg class="w-5 h-5 text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                    </svg>
                    <span class="text-green-300 font-medium">Email 驗證成功</span>
                  </div>
                </div>

                <button
                  @click="handleEmailSubmit"
                  :disabled="!isEmailValid || emailVerified || isLoadingStep1"
                  class="w-full bg-gradient-to-r from-green-500 to-green-400 hover:from-green-600 hover:to-green-500 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-3 px-8 rounded-lg text-base transition-all duration-300 transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  <span v-if="!isLoadingStep1" class="flex items-center justify-center space-x-2">
                    <span>{{ emailVerified ? '已驗證' : '驗證 Email' }}</span>
                  </span>
                  <span v-else class="flex items-center justify-center space-x-2">
                    <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>驗證中...</span>
                  </span>
                </button>
              </div>
            </div>

            <!-- Divider -->
            <div class="border-t border-gray-700"></div>

            <!-- Step 2: 獲取播放帳號 -->
            <div class="space-y-4">
              <div class="flex items-center space-x-3">
                <div :class="[
                  'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                  proxyAccountAcquired ? 'bg-green-500 text-white' : emailVerified ? 'bg-gray-700 text-gray-300' : 'bg-gray-800 text-gray-500'
                ]">
                  <svg v-if="proxyAccountAcquired" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                  </svg>
                  <span v-else>2</span>
                </div>
                <h3 :class="[
                  'text-lg font-semibold',
                  emailVerified ? 'text-white' : 'text-gray-500'
                ]">獲取播放帳號</h3>
              </div>

              <div class="ml-11 space-y-3">
                <!-- 錯誤提示 -->
                <div v-if="proxyAccountError" class="p-3 bg-red-900/50 border border-red-500 rounded-lg">
                  <div class="flex items-center space-x-2">
                    <svg class="w-5 h-5 text-red-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                    </svg>
                    <span class="text-red-300 font-medium">{{ proxyAccountError }}</span>
                  </div>
                </div>

                <!-- 成功提示 - 顯示 Proxy Account Code -->
                <div v-if="proxyAccountAcquired && proxyAccountData" class="p-4 bg-green-900/50 border border-green-500 rounded-lg">
                  <div class="flex items-start space-x-2">
                    <svg class="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                    </svg>
                    <div class="flex-1">
                      <p class="text-green-300 font-medium mb-2">播放帳號已分配</p>
                      <div class="bg-gray-800 rounded px-3 py-2 font-mono text-sm text-gray-300">
                        帳號代碼: <span class="text-green-400 font-semibold">{{ proxyAccountData.proxy_account_code }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  @click="handleAcquireProxyAccount"
                  :disabled="!emailVerified || proxyAccountAcquired || isLoadingStep2"
                  class="w-full bg-gradient-to-r from-green-500 to-green-400 hover:from-green-600 hover:to-green-500 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-3 px-8 rounded-lg text-base transition-all duration-300 transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  <span v-if="!isLoadingStep2" class="flex items-center justify-center space-x-2">
                    <span>{{ proxyAccountAcquired ? '已獲取' : '獲取播放帳號' }}</span>
                  </span>
                  <span v-else class="flex items-center justify-center space-x-2">
                    <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>獲取中...</span>
                  </span>
                </button>
              </div>
            </div>

            <!-- Divider -->
            <div class="border-t border-gray-700"></div>

            <!-- Step 3: 開始實驗 -->
            <div class="space-y-4">
              <div class="flex items-center space-x-3">
                <div :class="[
                  'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                  proxyAccountAcquired ? 'bg-gray-700 text-gray-300' : 'bg-gray-800 text-gray-500'
                ]">
                  3
                </div>
                <h3 :class="[
                  'text-lg font-semibold',
                  proxyAccountAcquired ? 'text-white' : 'text-gray-500'
                ]">開始實驗</h3>
              </div>

              <div class="ml-11">
                <button
                  @click="startExperiment"
                  :disabled="!proxyAccountAcquired || isCheckingProgress"
                  class="w-full bg-gradient-to-r from-green-500 to-green-400 hover:from-green-600 hover:to-green-500 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-4 px-8 rounded-lg text-lg transition-all duration-300 transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  <span v-if="!isCheckingProgress" class="flex items-center justify-center space-x-2">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd"/>
                    </svg>
                    <span>開始實驗</span>
                  </span>
                  <span v-else class="flex items-center justify-center space-x-2">
                    <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>檢查進度中...</span>
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 同意書 -->
        <div class="bg-gray-900 bg-opacity-80 backdrop-blur-md rounded-xl p-8 mb-8 border border-gray-700 shadow-xl" style="pointer-events: auto;">
          <h2 class="text-2xl font-semibold text-white mb-6 flex items-center justify-center">
            <svg class="w-6 h-6 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"/>
            </svg>
            參與同意書
          </h2>
          <div class="space-y-4 text-gray-300 mb-6">
            <p>我同意參與此研究，並了解：</p>
            <ul class="list-disc list-inside space-y-2 ml-4">
              <li>我的參與是完全自願的，可以隨時退出</li>
              <li>所有收集的數據將被匿名化處理，僅用於研究目的</li>
              <li>我的個人資訊不會被分享給第三方</li>
              <li>我可以隨時要求刪除我的數據</li>
              <li>如有任何問題，可以聯繫研究團隊</li>
            </ul>
          </div>
          <div class="text-center text-sm text-gray-400">
            點擊「開始實驗」即表示您同意上述條款
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import ParticleBackground from '@/components/ParticleBackground.vue'
import { loginUser, acquireProxyAccount, checkExperimentComplete, getExperimentPlaylist } from '@/services/api'
import { setCurrentUserEmail, setUserData, USER_DATA_KEYS } from '@/utils/userStorage'
import { useExperimentStore } from '@/stores/experiment'

const router = useRouter()
const experimentStore = useExperimentStore()

// 步驟狀態
const emailVerified = ref(false)
const proxyAccountAcquired = ref(false)
const isCheckingProgress = ref(false)

// 表單數據
const email = ref('')
const emailError = ref('')
const proxyAccountError = ref('')
const isLoadingStep1 = ref(false)
const isLoadingStep2 = ref(false)
const proxyAccountData = ref<any>(null)

// Email驗證
const isEmailValid = computed(() => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email.value)
})

// 檢查是否有保存的 email
const checkSavedEmail = () => {
  const savedEmail = sessionStorage.getItem('userEmail')
  if (savedEmail) {
    email.value = savedEmail
  }
}

// 步驟 1: 驗證 Email
const handleEmailSubmit = async () => {
  if (!isEmailValid.value || emailVerified.value) {
    return
  }

  emailError.value = ''
  isLoadingStep1.value = true

  try {
    const response = await loginUser(email.value)

    if (response.code === 2000) {
      // 保存 tokens 和用戶資訊
      if (response.data) {
        setCurrentUserEmail(email.value)
        setUserData(USER_DATA_KEYS.ACCESS_TOKEN, response.data.access_token)
        setUserData(USER_DATA_KEYS.REFRESH_TOKEN, response.data.refresh_token)
        sessionStorage.setItem('memberId', response.data.member_id.toString())
        sessionStorage.setItem('userData', JSON.stringify(response.data))
      }

      // 標記 Email 已驗證
      emailVerified.value = true
    } else {
      let errorMessage = response.msg || '登入失敗，請稍後再試'
      if (response.code === 4003) {
        errorMessage = '此 Email 尚未註冊，請確認 Email 或聯絡實驗人員'
      }
      emailError.value = errorMessage
    }
  } catch (error) {
    console.error('Login error:', error)
    emailError.value = '網路連線錯誤，請檢查網路後重試'
  } finally {
    isLoadingStep1.value = false
  }
}

// 步驟 2: 獲取 Proxy Account
const handleAcquireProxyAccount = async () => {
  if (!emailVerified.value || proxyAccountAcquired.value) {
    return
  }

  proxyAccountError.value = ''
  isLoadingStep2.value = true

  try {
    const response = await acquireProxyAccount()

    if (response.code === 2000 || response.code === 200) {
      // 保存 proxy account 資料（包含 access_token）
      proxyAccountData.value = response.data
      setUserData(USER_DATA_KEYS.PROXY_ACCOUNT_DATA, response.data)

      // 標記 Proxy Account 已獲取
      proxyAccountAcquired.value = true
    } else {
      proxyAccountError.value = response.msg || '無法獲取播放帳號，請稍後再試'
    }
  } catch (error) {
    console.error('Acquire proxy account error:', error)
    proxyAccountError.value = '網路連線錯誤，請稍後再試'
  } finally {
    isLoadingStep2.value = false
  }
}

// 步驟 3: 開始實驗
const startExperiment = async () => {
  if (!proxyAccountAcquired.value) {
    return
  }

  isCheckingProgress.value = true

  try {
    console.log('🔍 Checking experiment progress...')

    // 1. 檢查完成狀態
    const completeResponse = await checkExperimentComplete()
    console.log('Complete status:', completeResponse)

    if (completeResponse.code === 2000 && completeResponse.data) {
      const { phase1, phase2 } = completeResponse.data

      // 2. 根據完成狀態決定跳轉
      if (phase2) {
        // 兩個階段都完成了，跳轉到感謝頁面
        console.log('✅ Both phases completed, redirecting to thank-you')
        router.push('/thank-you')
        return
      } else if (phase1) {
        // 第一階段完成，準備開始第二階段
        console.log('✅ Phase 1 completed, redirecting to experiment-start-2')
        experimentStore.setStage(2)

        // 檢查第二階段歌單是否存在
        const playlist2Response = await getExperimentPlaylist(2)
        if (playlist2Response.code === 2000 && playlist2Response.data) {
          console.log('Phase 2 playlist exists')
          router.push('/experiment-start-2')
        } else {
          console.error('Phase 2 playlist not found')
          alert('找不到第二階段歌單，請聯繫實驗人員')
        }
        return
      } else {
        // 都還沒完成，開始第一階段
        console.log('Starting Phase 1')
        experimentStore.setStage(1)

        // 檢查第一階段歌單是否存在
        const playlist1Response = await getExperimentPlaylist(1)
        if (playlist1Response.code === 2000 && playlist1Response.data) {
          console.log('Phase 1 playlist exists')

          // 初始化實驗狀態
          const experimentState = {
            currentStep: 'experiment-start',
            completedSteps: [],
            currentPlaylistIndex: 0,
            ratings: [],
            email: email.value
          }
          setUserData(USER_DATA_KEYS.EXPERIMENT_STATE, experimentState)

          router.push('/experiment-start')
        } else {
          console.error('Phase 1 playlist not found')
          alert('找不到第一階段歌單，請聯繫實驗人員')
        }
      }
    } else {
      console.error('Invalid complete response')
      alert('無法確認實驗進度，請稍後再試')
    }
  } catch (error) {
    console.error('Failed to check experiment progress:', error)
    alert('檢查實驗進度失敗，請稍後再試')
  } finally {
    isCheckingProgress.value = false
  }
}

// 組件掛載時檢查是否有保存的 email
onMounted(() => {
  checkSavedEmail()
})
</script>

<style scoped>
/* 表單組件樣式 */
.form-group input:focus {
  box-shadow: 0 0 0 3px rgba(29, 185, 84, 0.2);
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
