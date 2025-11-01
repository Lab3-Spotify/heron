<template>
  <div class="min-h-screen bg-black text-white relative overflow-hidden">
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

    <div class="relative z-10 min-h-screen flex items-center justify-center p-4">
      <div class="max-w-4xl w-full">
        <!-- 主要內容區塊 -->
        <div class="bg-gray-900/60 backdrop-blur-xl rounded-3xl p-8 md:p-12 border-2 border-green-500/20 shadow-2xl shadow-green-500/10 text-center animate-fadeInUp">
          <!-- 完成图标 -->
      <div class="mb-8 animate-fadeIn" style="animation-delay: 0.2s; opacity: 0; animation-fill-mode: forwards;">
        <div class="inline-block p-4 bg-green-500/20 rounded-full border-2 border-green-500 shadow-lg shadow-green-500/50">
          <svg class="w-12 h-12 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
      </div>

      <!-- 标题 -->
      <h1 class="text-5xl font-bold mb-6 bg-gradient-to-r from-green-400 via-green-300 to-green-400 bg-clip-text text-transparent animate-fadeIn" style="animation-delay: 0.4s; opacity: 0; animation-fill-mode: forwards;">
        實驗完成！
      </h1>

      <!-- 感谢文字 -->
      <div class="space-y-4 mb-8 animate-fadeIn" style="animation-delay: 0.6s; opacity: 0; animation-fill-mode: forwards;">
        <p class="text-xl text-white/80">
          🎉 感謝您完成本次音樂聆聽實驗！
        </p>
        <p class="text-lg text-white/60">
          您的參與和認真評分對我們的研究非常重要
        </p>
      </div>

      <!-- 统计信息 -->
      <div class="bg-gray-900/80 backdrop-blur-md rounded-2xl p-8 mb-8 border-2 border-green-500/30 animate-fadeIn" style="animation-delay: 0.8s; opacity: 0; animation-fill-mode: forwards;">
        <h2 class="text-2xl font-semibold text-green-400 mb-6">您的實驗統計</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="bg-green-500/10 rounded-xl p-4 border border-green-500/20">
            <div class="text-3xl font-bold text-green-400 mb-2">2</div>
            <div class="text-white/60">完成歌單</div>
          </div>
          <div class="bg-green-500/10 rounded-xl p-4 border border-green-500/20">
            <div class="text-3xl font-bold text-green-400 mb-2">{{ totalSongsRated }}</div>
            <div class="text-white/60">評分歌曲</div>
          </div>
          <div class="bg-green-500/10 rounded-xl p-4 border border-green-500/20">
            <div class="text-3xl font-bold text-green-400 mb-2">2</div>
            <div class="text-white/60">滿意度評分</div>
          </div>
        </div>
      </div>

      <!-- 结束语 -->
      <div class="text-white/60 animate-fadeIn" style="animation-delay: 1s; opacity: 0; animation-fill-mode: forwards;">
        <p class="mb-4">您的數據已安全保存</p>
        <p class="text-sm">如有任何問題，請聯繫實驗人員</p>
      </div>

      <!-- 返回按钮（可选） -->
      <div class="mt-12 animate-fadeIn" style="animation-delay: 1.2s; opacity: 0; animation-fill-mode: forwards;">
        <button
          @click="returnToWelcome"
          class="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-300"
        >
          返回首頁
        </button>
      </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import ParticleBackground from '@/components/ParticleBackground.vue'
import { releaseProxyAccount, getExperimentPlaylist } from '@/services/api'
import { getUserData } from '@/utils/userStorage'

const router = useRouter()
const showParticleBackground = ref(false)
const totalSongsRated = ref(0)

onMounted(async () => {
  console.log('ThankYou page mounted')

  // 從 API 載入所有實驗歌單，計算總歌曲數量
  try {
    // 不帶 experiment_phase 參數，一次拿到所有實驗歌單
    const playlistsResponse = await getExperimentPlaylist()

    if (playlistsResponse.code === 2000 && playlistsResponse.data && Array.isArray(playlistsResponse.data)) {
      let totalCount = 0

      playlistsResponse.data.forEach((playlist: any) => {
        const phase = playlist.experiment_phase
        const trackCount = playlist.playlist_tracks?.length || 0
        console.log(`Phase ${phase} playlist has ${trackCount} tracks`)
        totalCount += trackCount
      })

      totalSongsRated.value = totalCount
      console.log(`Total songs across all playlists: ${totalSongsRated.value}`)
    } else {
      console.warn('Unexpected playlist response format')
      // 使用備用方案
      const stage1Ratings = getUserData<any>('songRatings_stage1', {})
      const stage2Ratings = getUserData<any>('songRatings_stage2', {})
      totalSongsRated.value = Object.keys(stage1Ratings).length + Object.keys(stage2Ratings).length
      console.log(`Fallback: Using sessionStorage count = ${totalSongsRated.value}`)
    }
  } catch (error) {
    console.error('❌ Failed to load playlist data:', error)
    // 如果 API 失敗，使用 sessionStorage 的資料作為備用
    const stage1Ratings = getUserData<any>('songRatings_stage1', {})
    const stage2Ratings = getUserData<any>('songRatings_stage2', {})
    totalSongsRated.value = Object.keys(stage1Ratings).length + Object.keys(stage2Ratings).length
    console.log(`Fallback: Using sessionStorage count = ${totalSongsRated.value}`)
  }

  // 延遲顯示粒子背景
  setTimeout(() => {
    showParticleBackground.value = true
  }, 500)

  // 釋放 Proxy Account
  try {
    console.log('📤 Releasing proxy account...')
    const response = await releaseProxyAccount()
    console.log('✅ Proxy account released:', response)

    if (response.code === 2000 || response.code === 200) {
      console.log('✅ Proxy account released successfully')
    } else {
      console.warn('⚠️ Failed to release proxy account:', response)
    }
  } catch (error) {
    console.error('❌ Error releasing proxy account:', error)
    // 即使失敗也不影響頁面顯示
  }
})

const returnToWelcome = () => {
  router.push('/welcome')
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

/* 淡入动画 */
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
</style>
