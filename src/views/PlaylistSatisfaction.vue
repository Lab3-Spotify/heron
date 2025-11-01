<template>
  <div class="min-h-screen bg-black flex items-center justify-center p-4">
    <div class="max-w-2xl w-full bg-gray-900/80 backdrop-blur-md rounded-2xl shadow-2xl p-8 border-2 border-green-500/30 shadow-green-500/20 animate-fadeInUp">
      <!-- 标题 -->
      <h1 class="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-green-400 via-green-300 to-green-400 bg-clip-text text-transparent animate-fadeIn" style="animation-delay: 0.2s; opacity: 0; animation-fill-mode: forwards;">
        歌單整體評分
      </h1>

      <!-- 完成总结 -->
      <div class="bg-green-500/5 rounded-xl p-6 mb-8 border border-green-500/20 animate-fadeIn" style="animation-delay: 0.4s; opacity: 0; animation-fill-mode: forwards;">
        <p class="text-white/80 text-center text-lg mb-2">
          🎉 恭喜您完成了本階段的歌曲試聽！
        </p>
        <p class="text-white/60 text-center">
          您已完成 <span class="text-green-400 font-semibold">{{ totalSongs }}</span> 首歌曲的評分
        </p>
      </div>

      <!-- 整體滿意度评分区域 -->
      <div class="mb-8 animate-fadeIn" style="animation-delay: 0.7s; opacity: 0; animation-fill-mode: forwards;">
        <div class="mb-6">
          <label class="block text-white text-lg font-semibold mb-6 text-center">
            滿意度評分
          </label>
        </div>

        <!-- 自定义滑杆（与歌曲评分一致） -->
        <div class="mb-6 px-2">
          <!-- 左右标签 -->
          <div class="flex justify-between mb-2 px-1">
            <span class="text-white/60 text-sm">非常不滿意</span>
            <span class="text-white/60 text-sm">非常滿意</span>
          </div>
          <div class="relative h-3 rounded-full bg-gray-800/50 backdrop-blur-sm flex items-center">
            <!-- 進度條 -->
            <div
              class="h-full rounded-full transition-all duration-300 bg-gradient-to-r from-green-500 to-green-400"
              :class="[
                hasRatedSatisfaction ? 'shadow-lg shadow-green-500/50' : ''
              ]"
              :style="{ width: ((satisfactionRating - 1) / 9 * 100) + '%' }"
            ></div>

            <!-- 自定義拉桿 -->
            <div
              :class="[
                'absolute w-7 h-7 rounded-full shadow-lg transition-all duration-200 top-1/2 -translate-y-1/2',
                isRatingLocked
                  ? 'bg-gray-500 cursor-not-allowed'
                  : 'bg-green-500 cursor-pointer hover:shadow-2xl hover:shadow-green-500/50 hover:ring-4 hover:ring-green-400/30'
              ]"
              :style="{ left: `calc(${(satisfactionRating - 1) / 9 * 100}% - 14px)` }"
              @mousedown="!isRatingLocked && startDragging($event)"
              @touchstart="!isRatingLocked && startDragging($event)"
            ></div>

            <!-- 隱藏的input用於值綁定 -->
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              v-model="satisfactionRating"
              @input="!isRatingLocked && (hasRatedSatisfaction = true)"
              :disabled="isRatingLocked"
              :class="[
                'absolute inset-0 w-full h-full opacity-0',
                isRatingLocked ? 'cursor-not-allowed' : 'cursor-pointer'
              ]"
            />
          </div>
        </div>

        <!-- 当前分数显示 -->
        <div class="text-center mb-4">
          <div
            class="inline-block rounded-full px-8 py-4 border-2 transition-all duration-300"
            :class="[
              hasRatedSatisfaction
                ? 'bg-green-500/20 border-green-500 shadow-lg shadow-green-500/30'
                : 'bg-white/10 border-white/20'
            ]"
          >
            <span
              class="text-5xl font-bold transition-colors duration-300"
              :class="hasRatedSatisfaction ? 'text-green-400' : 'text-white'"
            >
              {{ satisfactionRating }}
            </span>
            <span class="text-white/60 text-xl ml-2">/ 10</span>
          </div>
        </div>
      </div>

      <!-- 继续按钮（始终显示） -->
      <div class="mt-8 animate-fadeIn" style="animation-delay: 0.9s; opacity: 0; animation-fill-mode: forwards;">
        <button
          @click="allRated ? continueToNextStage() : null"
          :disabled="!allRated"
          :class="[
            'w-full font-bold py-4 px-8 rounded-xl transition-all duration-300 shadow-lg',
            allRated
              ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white transform hover:scale-105 cursor-pointer'
              : 'bg-gray-600 text-gray-400 cursor-not-allowed opacity-50'
          ]"
        >
          {{ allRated ? '繼續下一個實驗階段 →' : '請先完成所有評分' }}
        </button>
      </div>
    </div>

    <!-- Toast 通知 -->
    <Transition name="toast">
      <div
        v-if="toastMessage"
        :class="[
          'fixed top-20 left-1/2 transform -translate-x-1/2 z-50 text-white px-6 py-3 rounded-lg shadow-lg',
          toastType === 'error' ? 'bg-red-600' : 'bg-blue-600'
        ]"
      >
        {{ toastMessage }}
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getUserData, setUserData } from '@/utils/userStorage'
import { storeToRefs } from 'pinia'
import { useExperimentStore } from '@/stores/experiment'
import { checkExperimentComplete, updatePlaylistSatisfaction, getExperimentPlaylist } from '@/services/api'

const router = useRouter()

// 滿意度評分
const satisfactionRating = ref(5)
const hasRatedSatisfaction = ref(false)

const totalSongs = ref(0) // 從評分資料中動態計算
const isRatingLocked = ref(false) // 是否已經確認提交，鎖定評分

// Toast 訊息
const toastMessage = ref('')
const toastType = ref<'info' | 'error'>('info')
const toastTimeout = ref<ReturnType<typeof setTimeout> | null>(null)

const showToast = (message: string, duration: number = 3000, type: 'info' | 'error' = 'info') => {
  toastMessage.value = message
  toastType.value = type
  if (toastTimeout.value) {
    clearTimeout(toastTimeout.value)
  }
  toastTimeout.value = setTimeout(() => {
    toastMessage.value = ''
  }, duration)
}

// 使用實驗階段 Store
const experimentStore = useExperimentStore()
const { currentStage } = storeToRefs(experimentStore)

// 計算是否所有項目都完成
const allRated = computed(() => {
  return hasRatedSatisfaction.value
})

onMounted(async () => {
  console.log('PlaylistSatisfaction mounted')
  console.log(`Current stage: ${currentStage.value}`)

  // 檢查該階段的所有歌曲是否真的都已評分完成
  const completedKey = currentStage.value === 1
    ? 'allSongsCompleted_stage1'
    : 'allSongsCompleted_stage2'

  const allSongsCompleted = getUserData<boolean>(completedKey)

  if (!allSongsCompleted) {
    // 如果所有歌曲還沒評分完成，說明用戶是返回到這個頁面的
    console.warn(`Stage ${currentStage.value} songs not all completed, redirecting back to player`)
    router.replace('/playlist-player')
    return
  }

  console.log(`Stage ${currentStage.value} all songs completed, proceeding with satisfaction rating`)

  const stagePrefix = currentStage.value === 1 ? 'stage1' : 'stage2'

  // 從 API 載入歌單資料（包含 satisfaction_score）
  try {
    console.log(`🔍 Loading playlist data for stage ${currentStage.value}...`)
    const playlistResponse = await getExperimentPlaylist(currentStage.value)

    if (playlistResponse.code === 2000 && playlistResponse.data) {
      const apiPlaylist = Array.isArray(playlistResponse.data) ? playlistResponse.data[0] : playlistResponse.data

      // 計算歌曲數量
      if (apiPlaylist.playlist_tracks && Array.isArray(apiPlaylist.playlist_tracks)) {
        totalSongs.value = apiPlaylist.playlist_tracks.length
        console.log(`Total songs in stage ${currentStage.value}: ${totalSongs.value}`)
      }

      // 從 API 載入歌單滿意度評分
      if (apiPlaylist.satisfaction_score !== null && apiPlaylist.satisfaction_score !== undefined) {
        satisfactionRating.value = apiPlaylist.satisfaction_score
        hasRatedSatisfaction.value = true
        isRatingLocked.value = true // API 有評分表示已提交過
        console.log(`Loaded satisfaction score from API: ${apiPlaylist.satisfaction_score}`)
      } else {
        console.log('No satisfaction score in API, checking sessionStorage cache...')
        // 如果 API 沒有評分，檢查 sessionStorage cache
        const cachedSatisfaction = getUserData<number>(`playlistSatisfactionRating_${stagePrefix}`)
        if (cachedSatisfaction !== null && cachedSatisfaction !== undefined) {
          satisfactionRating.value = cachedSatisfaction
          hasRatedSatisfaction.value = true
          console.log(`Loaded satisfaction score from cache: ${cachedSatisfaction}`)
        }
      }
    }
  } catch (error) {
    console.error('❌ Failed to load playlist data:', error)
    showToast('載入歌單資料失敗', 5000, 'error')
  }
})

// 滿意度拖拽功能
let isDragging = false

const startDragging = (event: MouseEvent | TouchEvent) => {
  isDragging = true
  hasRatedSatisfaction.value = true
  updateSatisfactionRatingFromEvent(event)

  const handleMove = (e: MouseEvent | TouchEvent) => {
    if (isDragging) {
      updateSatisfactionRatingFromEvent(e)
    }
  }

  const handleEnd = () => {
    isDragging = false
    document.removeEventListener('mousemove', handleMove)
    document.removeEventListener('mouseup', handleEnd)
    document.removeEventListener('touchmove', handleMove)
    document.removeEventListener('touchend', handleEnd)
  }

  document.addEventListener('mousemove', handleMove)
  document.addEventListener('mouseup', handleEnd)
  document.addEventListener('touchmove', handleMove)
  document.addEventListener('touchend', handleEnd)
}

const updateSatisfactionRatingFromEvent = (event: MouseEvent | TouchEvent) => {
  const target = event.currentTarget as HTMLElement
  if (!target) return

  const slider = target.closest('.relative') as HTMLElement
  if (!slider) return

  const rect = slider.getBoundingClientRect()
  const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX
  const percentage = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))

  // 将百分比转换为 1-10 的评分
  satisfactionRating.value = Math.round(percentage * 9) + 1

  // 更新到 sessionStorage cache
  const stagePrefix = currentStage.value === 1 ? 'stage1' : 'stage2'
  setUserData(`playlistSatisfactionRating_${stagePrefix}`, satisfactionRating.value)
  console.log(`✅ Cached satisfaction rating: ${satisfactionRating.value}`)
}

const continueToNextStage = async () => {
  const stagePrefix = currentStage.value === 1 ? 'stage1' : 'stage2'

  // 如果還沒鎖定（表示是新評分），需要打 API 更新
  if (!isRatingLocked.value) {
    // 保存滿意度評分到 sessionStorage
    setUserData(`playlistSatisfactionRating_${stagePrefix}`, satisfactionRating.value)

    console.log(`Stage ${currentStage.value} ratings saved to sessionStorage:`, {
      satisfaction: satisfactionRating.value
    })

    // 取得 playlist_id
    const playlistId = getUserData<number>(`playlistId_${stagePrefix}`)

    if (!playlistId) {
      console.error('❌ No playlist_id found in sessionStorage')
      showToast('無法取得歌單資訊，請重新載入頁面', 5000, 'error')
      return
    }

    // 呼叫 API 更新歌單滿意度評分
    try {
      console.log(`📝 Updating playlist satisfaction for playlist_id ${playlistId}...`)
      const updateResponse = await updatePlaylistSatisfaction(playlistId, satisfactionRating.value)
      console.log('✅ Playlist satisfaction updated:', updateResponse)

      if (updateResponse.code === 200 || updateResponse.code === 2000) {
        // 標記已提交
        isRatingLocked.value = true
        console.log('✅ Satisfaction score updated successfully')
      } else {
        console.error('❌ Failed to update satisfaction score:', updateResponse)
        showToast('評分更新失敗，請稍後再試', 5000, 'error')
        return
      }
    } catch (error) {
      console.error('❌ Failed to update playlist satisfaction:', error)
      showToast('評分更新失敗，請檢查網路連線', 5000, 'error')
      return
    }
  } else {
    console.log('Rating already submitted, skipping API update')
  }

  // 檢查完成狀態並跳轉
  try {
    console.log('🔍 Checking experiment complete status...')
    const completeResponse = await checkExperimentComplete()
    console.log('✅ Complete response:', completeResponse)

    if (completeResponse.code === 2000 && completeResponse.data) {
      const { phase1, phase2 } = completeResponse.data
      console.log(`Completion status - Phase1: ${phase1}, Phase2: ${phase2}`)

      // 檢查當前階段是否完成
      const isCurrentPhaseCompleted = currentStage.value === 1 ? phase1 : phase2

      if (!isCurrentPhaseCompleted) {
        console.error('❌ Current phase not completed according to API!')
        showToast('評分尚未完成，請確認所有歌曲都已評分', 5000, 'error')
        return
      }

      console.log('✅ Current phase completed, proceeding to next stage...')

      // 根据当前阶段跳转
      if (currentStage.value === 1) {
        router.push('/experiment-start-2')
      } else {
        router.push('/thank-you')
      }
    } else {
      console.error('❌ Invalid API response')
      showToast('無法確認完成狀態，請稍後再試', 5000, 'error')
    }
  } catch (error) {
    console.error('❌ Failed to check experiment complete status:', error)
    showToast('API 呼叫失敗，請檢查網路連線', 5000, 'error')
  }
}
</script>

<style scoped>
/* 淡入上升动画 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.animate-fadeInUp {
  animation: fadeInUp 0.8s ease-out;
}

/* 按钮淡入动画 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.5s ease-out;
}

/* Toast 淡入淡出動畫 */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translate(-50%, -20px);
}

.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, -20px);
}
</style>
