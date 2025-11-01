<template>
  <div class="min-h-screen bg-black text-white page-container relative overflow-hidden">
    <!-- 粒子背景 -->
    <ParticleBackground
      v-if="showParticleBackground"
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

    <!-- 漸層覆蓋層 -->
    <div class="absolute inset-0 bg-gradient-to-br from-green-900/20 via-black/40 to-green-800/20 opacity-95 pointer-events-none"></div>

    <!-- 標題區域 -->
    <div class="bg-gray-900 border-b border-gray-700 py-6 relative z-10">
      <div class="container mx-auto px-4">
        <h1 class="text-3xl font-bold text-center fade-element" data-delay="0">
          實驗即將開始
        </h1>
        <p class="text-gray-400 text-center mt-2 fade-element" data-delay="200">
          請仔細閱讀以下說明，準備開始您的音樂聆聽體驗
        </p>
      </div>
    </div>

    <!-- 主要內容區域 -->
    <div class="container mx-auto px-4 py-8 relative z-10">
      <div class="max-w-2xl mx-auto space-y-8">

        <!-- 實驗流程卡片 -->
        <div class="bg-gray-900 rounded-lg p-6 fade-element" data-delay="400">
          <h2 class="text-xl font-semibold mb-4">實驗流程</h2>
          <div class="space-y-3">
            <div class="flex items-start space-x-3 fade-element" data-delay="600">
              <div class="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-sm font-semibold flex-shrink-0">
                1
              </div>
              <p class="text-gray-300 pt-1">您將聆聽兩個不同長度的歌單</p>
            </div>
            <div class="flex items-start space-x-3 fade-element" data-delay="700">
              <div class="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-sm font-semibold flex-shrink-0">
                2
              </div>
              <p class="text-gray-300 pt-1">每個歌單包含熟悉和不熟悉的歌曲</p>
            </div>
            <div class="flex items-start space-x-3 fade-element" data-delay="800">
              <div class="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-sm font-semibold flex-shrink-0">
                3
              </div>
              <p class="text-gray-300 pt-1">聽完每個歌單後，請您對整體滿意度進行評分</p>
            </div>
            <div class="flex items-start space-x-3 fade-element" data-delay="900">
              <div class="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-sm font-semibold flex-shrink-0">
                4
              </div>
              <p class="text-gray-300 pt-1">整個實驗約需 20-30 分鐘完成</p>
            </div>
          </div>
        </div>

        <!-- 開始按鈕 -->
        <div class="text-center fade-element" data-delay="1000">
          <button
            @click="startExperiment"
            class="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
          >
            開始聆聽第一個歌單
          </button>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { getCurrentUserEmail, getUserData, setUserData, USER_DATA_KEYS } from '@/utils/userStorage'
import { useExperimentStore } from '@/stores/experiment'
import ParticleBackground from '@/components/ParticleBackground.vue'

const router = useRouter()
const experimentStore = useExperimentStore()
const showParticleBackground = ref(false)

onMounted(() => {
  console.log('ExperimentStart.vue mounted')

  const email = getCurrentUserEmail()
  console.log('User email from sessionStorage:', email)

  if (!email) {
    console.log('No email found, redirecting to welcome')
    router.replace('/')
    return
  }

  console.log('ExperimentStart component should render normally')

  // 頁面和組件淡入效果
  nextTick(() => {
    const container = document.querySelector('.page-container')
    if (container) {
      container.classList.add('fade-in')
    }

    // 為各個組件添加淡入動畫
    const fadeElements = document.querySelectorAll('.fade-element')
    fadeElements.forEach((element) => {
      const delay = parseInt(element.getAttribute('data-delay') || '0')
      setTimeout(() => {
        element.classList.add('fade-in')
      }, delay)
    })
  })

  // 等待所有組件載入完畢後，再顯示粒子背景
  setTimeout(() => {
    showParticleBackground.value = true
  }, 1000) // 延遲 1 秒確保所有組件都已載入
})

const startExperiment = () => {
  // 設置為第一階段
  experimentStore.setStage(1)

  const experimentState = getUserData<any>(USER_DATA_KEYS.EXPERIMENT_STATE, {})
  experimentState.currentStep = 'playlist-player'
  experimentState.currentPlaylistIndex = 0
  setUserData(USER_DATA_KEYS.EXPERIMENT_STATE, experimentState)

  router.replace('/playlist-player')
}
</script>

<style scoped>
/* 頁面淡入動畫 */
.page-container {
  opacity: 0;
  transition: opacity 0.5s ease-in;
}

.page-container.fade-in {
  opacity: 1;
}

/* 組件淡入動畫 */
.fade-element {
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.6s ease-out;
}

.fade-element.fade-in {
  opacity: 1;
  transform: translateY(0);
}

/* 確保頁面樣式 */
.min-h-screen {
  background-color: black !important;
  color: white !important;
}

.container {
  color: white !important;
}

h1, h2, p, li, button {
  color: inherit !important;
}

/* 按鈕效果 */
button {
  transition: all 0.2s ease;
}

button:hover:not(:disabled) {
  transform: scale(1.02);
}

button:active:not(:disabled) {
  transform: scale(0.98);
}
</style>
