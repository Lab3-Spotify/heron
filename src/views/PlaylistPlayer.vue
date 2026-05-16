<template>
  <div class="min-h-screen bg-black text-white">
    <!-- Toast 通知 -->
    <Transition name="toast">
      <div
        v-if="toastMessage"
        :class="[
          'fixed top-32 left-1/2 transform -translate-x-1/2 z-50 text-white px-6 py-3 rounded-lg shadow-lg',
          toastType === 'error' ? 'bg-red-600' : 'bg-blue-600'
        ]"
      >
        {{ toastMessage }}
      </div>
    </Transition>

    <!-- 進度條 -->
    <div class="fixed top-0 left-0 w-full h-1 bg-gray-800 z-50">
      <div 
        :class="[
          'h-full transition-all duration-500 ease-out relative overflow-hidden',
          allSongsRated 
            ? 'bg-gradient-to-r from-green-500 via-yellow-500 to-green-500 progress-complete' 
            : 'bg-gradient-to-r from-green-500 to-green-400'
        ]"
        :style="{ width: ratingProgressPercentage + '%' }"
      >
        <!-- 進度條動畫效果 -->
        <div 
          :class="[
            'absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent',
            allSongsRated ? 'animate-pulse' : ''
          ]"
        ></div>
      </div>
    </div>

    <!-- 標題區域 -->
    <div class="bg-gray-900 border-b border-gray-700 py-4 mt-1">
      <div class="container mx-auto px-4">
        <h1 class="text-2xl font-bold text-center fade-element" data-delay="0">
          歌單播放實驗
        </h1>
        <p class="text-gray-400 text-center mt-2 fade-element" data-delay="200">
          歌單 {{ currentStage }} / 2 - 請按順序聆聽每首歌曲並進行評分
        </p>
        <!-- 進度顯示 -->
        <div class="text-center mt-3 fade-element" data-delay="300">
          <span 
            :class="[
              'text-sm transition-colors duration-300',
              allSongsRated ? 'text-green-400 font-semibold' : 'text-gray-400'
            ]"
          >
            <span v-if="allSongsRated">🎉 恭喜！所有歌曲評分完成</span>
            <span v-else>進度：{{ ratedSongsCount }} / {{ mockPlaylist.length }} 首歌曲已評分</span>
          </span>
        </div>
      </div>
    </div>

    <!-- 主要內容區域 -->
    <div class="container mx-auto px-4 py-6">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <!-- 歌曲列表 -->
        <div class="lg:col-span-2">
          <div class="bg-gray-900 rounded-lg p-6 fade-element" data-delay="400">
            <h2 class="text-xl font-semibold mb-4">歌曲清單</h2>
            <p class="text-sm text-gray-400 mb-4">請按順序聆聽：完成當前歌曲評分後才能選擇下一首，已評分的歌曲無法重新聆聽</p>

            <div class="space-y-3">
              <div
                v-for="(song, index) in mockPlaylist"
                :key="song.id"
                :class="[
                  'flex items-center justify-between p-4 rounded-lg border-2 transition-all',
                  currentSongIndex === index && isPlaying
                    ? 'border-green-500 bg-green-900/20'
                    : songCompletedStatus[index] && !song.rating
                      ? 'border-yellow-500 bg-yellow-900/20'
                      : canReselectSong(index)
                        ? 'border-gray-700 bg-gray-800 hover:border-gray-600 cursor-pointer'
                        : song.rating
                          ? 'border-green-700 bg-gray-800 opacity-70'
                          : 'border-gray-700 bg-gray-800 opacity-50 cursor-not-allowed'
                ]"
                @click="canReselectSong(index) ? selectSong(index) : null"
              >
                <!-- 歌曲資訊 -->
                <div class="flex items-center space-x-4">
                  <div class="flex-shrink-0 relative">
                    <div class="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden">
                      <img
                        v-if="song.albumImage"
                        :src="song.albumImage"
                        :alt="`${song.name} album cover`"
                        class="w-full h-full object-cover"
                      />
                      <div v-else class="w-full h-full bg-gray-600 animate-pulse"></div>
                    </div>
                    <!-- 播放狀態圖示覆蓋 -->
                    <div
                      v-if="currentSongIndex === index && isPlaying"
                      class="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center"
                    >
                      <svg class="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                      </svg>
                    </div>
                  </div>
                  
                  <div>
                    <h3 class="font-semibold">{{ song.name }}</h3>
                    <p class="text-gray-400 text-sm">{{ song.artist }}</p>
                    <p class="text-gray-500 text-xs mt-1">
                      播放片段: {{ Math.floor(song.startTime / 1000) }}s - {{ Math.floor(song.endTime / 1000) }}s
                      ({{ Math.floor(song.duration / 1000) }}秒)
                    </p>
                  </div>
                </div>

                <!-- 評分狀態 -->
                <div class="flex items-center space-x-2">
                  <span v-if="song.rating" class="bg-green-600 text-white px-2 py-1 rounded text-sm">
                    ✓ 已評分
                  </span>
                  <span v-else-if="songCompletedStatus[index] && !song.rating" class="bg-yellow-600 text-white px-2 py-1 rounded text-sm">
                    評分中
                  </span>
                  <span v-else-if="songPlaybackRetryCount[index] > 0 && songPlaybackRetryCount[index] < 3" class="bg-orange-600 text-white px-2 py-1 rounded text-sm">
                    需重試 ({{ songPlaybackRetryCount[index] }}/3)
                  </span>
                  <span v-else-if="songPlaybackRetryCount[index] >= 3" class="bg-red-600 text-white px-2 py-1 rounded text-sm">
                    播放失敗
                  </span>
                  <span v-else-if="canReselectSong(index)" class="bg-blue-600 text-white px-2 py-1 rounded text-sm">
                    可聆聽
                  </span>
                  <span v-else class="bg-gray-600 text-gray-300 px-2 py-1 rounded text-sm">
                    等待中
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 播放器和評分區域 -->
        <div class="space-y-3 sticky top-4 self-start" style="max-height: 85vh;">

          <!-- 播放器和控制 -->
          <div class="bg-gray-900 rounded-lg p-3 fade-element" data-delay="600">
            <h3 class="text-lg font-semibold mb-2">正在播放</h3>

            <div v-if="currentSong" class="flex items-center space-x-4 mb-4">
              <!-- 歌曲封面 -->
              <div class="w-32 h-32 bg-gray-700 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden">
                <img
                  v-if="currentSong.albumImage"
                  :src="currentSong.albumImage"
                  :alt="`${currentSong.name} album cover`"
                  class="w-full h-full object-cover"
                />
                <div v-else class="w-full h-full bg-gray-600 animate-pulse"></div>
              </div>

              <!-- 歌曲信息和播放按鈕 -->
              <div class="flex-1">
                <h4 class="font-semibold text-lg">{{ currentSong.name }}</h4>
                <p class="text-gray-400 text-sm">{{ currentSong.artist }}</p>

                <!-- 播放/暫停按鈕和重新播放按鈕 -->
                <div class="flex items-center gap-3 mt-3">
                  <button
                    @click="togglePlay"
                    :disabled="isCurrentSongCompleted"
                    :class="[
                      'p-4 rounded-full transition-colors flex items-center justify-center player-control-btn',
                      isCurrentSongCompleted
                        ? 'bg-gray-600 cursor-not-allowed opacity-50'
                        : 'bg-green-600 hover:bg-green-700'
                    ]"
                  >
                    <svg v-if="isPlaying" class="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                    </svg>
                    <svg v-else class="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd"></path>
                    </svg>
                  </button>

                  <!-- 重新播放按鈕 -->
                  <button
                    @click="replaySong"
                    :disabled="!canReplaySong"
                    :class="[
                      'p-4 rounded-full transition-colors flex items-center justify-center player-control-btn',
                      canReplaySong
                        ? 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
                        : 'bg-gray-600 cursor-not-allowed opacity-50'
                    ]"
                  >
                    <svg class="w-7 h-7 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <!-- 音量控制 -->
            <div>
              <div class="flex items-center justify-between text-sm text-gray-400 mb-2">
                <span>音量</span>
                <span>{{ Math.round(volume * 100) }}%</span>
              </div>
              
              <div class="relative">
                <!-- 自定義音量拉桿容器 -->
                <div class="relative w-full h-6 flex items-center">
                  <!-- 背景軌道 -->
                  <div class="w-full h-2 bg-gray-700 rounded-full relative">
                    <!-- 進度條 -->
                    <div 
                      class="h-2 bg-green-600 rounded-full transition-all duration-200"
                      :style="{ width: (volume * 100) + '%' }"
                    ></div>
                  </div>
                  
                  <!-- 自定義拉桿 -->
                  <div 
                    class="absolute w-5 h-5 bg-green-500 rounded-full cursor-pointer shadow-lg transition-all duration-200 hover:shadow-2xl hover:shadow-green-500/50 hover:ring-4 hover:ring-green-400/30"
                    :style="{ left: `max(0px, min(calc(100% - 20px), calc(${volume * 100}% - 10px)))` }"
                    @mousedown="startVolumeDragging"
                    @touchstart="startVolumeDragging"
                  ></div>
                  
                  <!-- 隱藏的input用於值綁定 -->
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    :value="volume"
                    @input="updateVolume"
                    class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- 評分區域 -->
          <div class="bg-gray-900 rounded-lg p-3 fade-element" data-delay="1000">
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-lg font-semibold">歌曲評分</h3>
              <!-- 播放狀態提示 -->
              <div v-if="currentSong && !currentSong.rating">
                <!-- 播放失敗提示 -->
                <div v-if="songPlaybackRetryCount[currentSongIndex] > 0 && songPlaybackRetryCount[currentSongIndex] < 3" class="inline-flex items-center space-x-2 px-3 py-2 bg-orange-900/30 border border-orange-500/50 rounded-lg">
                  <svg class="w-4 h-4 text-orange-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                  </svg>
                  <span class="text-orange-300 text-sm font-medium">請再按播放 ({{ songPlaybackRetryCount[currentSongIndex] }}/3)</span>
                </div>
                <div v-else-if="songPlaybackRetryCount[currentSongIndex] >= 3" class="inline-flex items-center space-x-2 px-3 py-2 bg-red-900/30 border border-red-500/50 rounded-lg">
                  <svg class="w-4 h-4 text-red-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                  </svg>
                  <span class="text-red-300 text-sm font-medium">無法播放</span>
                </div>
                <!-- 正常提示 -->
                <div v-else class="inline-flex items-center space-x-2 px-3 py-2 bg-blue-900/30 border border-blue-500/50 rounded-lg">
                  <svg class="w-4 h-4 text-blue-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
                  </svg>
                  <span class="text-blue-300 text-sm font-medium">請先完整聆聽歌曲後再評分</span>
                </div>
              </div>
            </div>

            <div v-if="currentSong">
              <!-- 是否曾經聽過 -->
              <div class="mb-3">
                <label class="block text-white text-sm font-semibold mb-2">
                  您是否曾經聽過這首歌？
                </label>
                <div class="flex gap-2">
                  <button
                    @click="selectEverListened(true)"
                    :disabled="currentSong.rating !== null || !canRate"
                    :class="[
                      'flex-1 px-4 py-2 rounded-lg font-semibold transition-all duration-300',
                      currentSong.everListened === true
                        ? 'bg-green-500 text-white shadow-lg shadow-green-500/50'
                        : 'bg-gray-700 text-white/60 hover:bg-gray-600',
                      currentSong.rating !== null || !canRate ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
                    ]"
                  >
                    是
                  </button>
                  <button
                    @click="selectEverListened(false)"
                    :disabled="currentSong.rating !== null || !canRate"
                    :class="[
                      'flex-1 px-4 py-2 rounded-lg font-semibold transition-all duration-300',
                      currentSong.everListened === false
                        ? 'bg-green-500 text-white shadow-lg shadow-green-500/50'
                        : 'bg-gray-700 text-white/60 hover:bg-gray-600',
                      currentSong.rating !== null || !canRate ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
                    ]"
                  >
                    否
                  </button>
                </div>
              </div>

              <!-- 滿意度評分 -->
              <div class="mb-3">
                <label class="block text-white text-sm font-semibold mb-2">
                  滿意度評分
                </label>

                <div class="flex justify-between text-sm text-gray-400 mb-2 px-2">
                  <span>1</span>
                  <span>5</span>
                  <span>10</span>
                </div>

                <div class="relative">
                  <!-- 自定義拉桿容器 -->
                  <div class="relative w-full h-6 flex items-center">
                    <!-- 背景軌道 -->
                    <div class="w-full h-2 bg-gray-700 rounded-full relative">
                      <!-- 進度條 -->
                      <div
                        class="h-2 bg-green-600 rounded-full transition-all duration-200"
                        :style="{ width: getSliderPercentage(currentTempRating) + '%' }"
                      ></div>
                    </div>

                    <!-- 自定義拉桿 -->
                    <div
                      :class="[
                        'absolute w-5 h-5 rounded-full shadow-lg transition-all duration-200',
                        currentSong.rating !== null || !canRate
                          ? 'bg-gray-500 cursor-not-allowed'
                          : 'bg-green-500 cursor-pointer hover:shadow-2xl hover:shadow-green-500/50 hover:ring-4 hover:ring-green-400/30'
                      ]"
                      :style="{ left: `max(0px, min(calc(100% - 20px), calc(${getSliderPercentage(currentTempRating)}% - 10px)))` }"
                      @mousedown="handleSatisfactionSliderMouseDown"
                      @touchstart="handleSatisfactionSliderTouchStart"
                    ></div>

                    <!-- 隱藏的input用於值綁定 -->
                    <input
                      type="range"
                      min="1"
                      max="10"
                      step="1"
                      :value="currentTempRating"
                      @input="handleSatisfactionInputChange"
                      :disabled="currentSong.rating !== null || !canRate"
                      class="absolute inset-0 w-full h-full opacity-0"
                      :class="{ 'cursor-not-allowed': currentSong.rating !== null || !canRate, 'cursor-pointer': currentSong.rating === null && canRate }"
                    />
                  </div>

                  <!-- 當前評分值顯示 -->
                  <div class="text-center mt-2">
                    <span class="text-xl font-bold text-green-500">
                      {{ currentTempRating }}
                    </span>
                    <span class="text-xs text-gray-400 ml-1">/ 10</span>
                  </div>
                </div>

                <div class="text-xs text-gray-500 flex justify-between mt-1">
                  <span>非常不滿意</span>
                  <span>非常滿意</span>
                </div>
              </div>

              <!-- 驚喜度評分 -->
              <div class="mb-3">
                <label class="block text-white text-sm font-semibold mb-2">
                  驚喜度評分
                </label>

                <div class="flex justify-between text-sm text-gray-400 mb-2 px-2">
                  <span>1</span>
                  <span>5</span>
                  <span>10</span>
                </div>

                <div class="relative">
                  <!-- 自定義拉桿容器 -->
                  <div class="relative w-full h-6 flex items-center">
                    <!-- 背景軌道 -->
                    <div class="w-full h-2 bg-gray-700 rounded-full relative">
                      <!-- 進度條 (綠色) -->
                      <div
                        class="h-2 bg-green-600 rounded-full transition-all duration-200"
                        :style="{ width: getSliderPercentage(currentTempSurpriseRating) + '%' }"
                      ></div>
                    </div>

                    <!-- 自定義拉桿 (綠色) -->
                    <div
                      :class="[
                        'absolute w-5 h-5 rounded-full shadow-lg transition-all duration-200',
                        currentSong.rating !== null || !canRate
                          ? 'bg-gray-500 cursor-not-allowed'
                          : 'bg-green-500 cursor-pointer hover:shadow-2xl hover:shadow-green-500/50 hover:ring-4 hover:ring-green-400/30'
                      ]"
                      :style="{ left: `max(0px, min(calc(100% - 20px), calc(${getSliderPercentage(currentTempSurpriseRating)}% - 10px)))` }"
                      @mousedown="handleSurpriseSliderMouseDown"
                      @touchstart="handleSurpriseSliderTouchStart"
                    ></div>

                    <!-- 隱藏的input用於值綁定 -->
                    <input
                      type="range"
                      min="1"
                      max="10"
                      step="1"
                      :value="currentTempSurpriseRating"
                      @input="handleSurpriseInputChange"
                      :disabled="currentSong.rating !== null || !canRate"
                      class="absolute inset-0 w-full h-full opacity-0"
                      :class="{ 'cursor-not-allowed': currentSong.rating !== null || !canRate, 'cursor-pointer': currentSong.rating === null && canRate }"
                    />
                  </div>

                  <!-- 當前評分值顯示 -->
                  <div class="text-center mt-3">
                    <span class="text-2xl font-bold text-green-500">
                      {{ currentTempSurpriseRating }}
                    </span>
                    <span class="text-sm text-gray-400 ml-1">/ 10</span>
                  </div>
                </div>

                <div class="text-xs text-gray-500 flex justify-between mt-2">
                  <span>完全不驚喜</span>
                  <span>非常驚喜</span>
                </div>
              </div>
              
              <!-- 確認評分按鈕 -->
              <button
                v-if="!currentSong.rating"
                @click="confirmRating"
                :disabled="!canConfirmRating"
                class="w-full bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-all duration-200 hover:shadow-2xl hover:shadow-green-500/30 hover:ring-2 hover:ring-green-400/50"
              >
                <span v-if="!canRate">請先完整聆聽歌曲</span>
                <span v-else-if="currentSong.everListened === null">請選擇是否曾經聽過此歌曲</span>
                <span v-else-if="!hasMovedSatisfactionSlider">請移動滿意度拉桿</span>
                <span v-else-if="!hasMovedSurpriseSlider">請移動驚喜度拉桿</span>
                <span v-else>確認評分</span>
              </button>

              <!-- 已評分提示 -->
              <div v-else class="text-center py-3 bg-green-900/20 border border-green-500/30 rounded-lg">
                <span class="text-green-400 font-semibold">✓ 已評分</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- 實際內容結束 -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { getUserData, setUserData, USER_DATA_KEYS, GLOBAL_DATA_KEYS, getGlobalData, setGlobalData } from '@/utils/userStorage'
import { storeToRefs } from 'pinia'
import { useSpotifyPlayerStore } from '@/stores/spotifyPlayer'
import { useExperimentStore } from '@/stores/experiment'
import { getExperimentPlaylist, batchUpdateTrackRatings, type TrackRatingItem } from '@/services/api'

// 定義歌曲類型
interface Song {
  id: string
  name: string
  artist: string
  spotifyId: string
  rating: number | null
  everListened: boolean | null
  surpriseRating: number | null
  albumImage: string
  startTime: number
  endTime: number
  duration: number
  playlistTrackId?: number
}

const router = useRouter()

// 使用全局 Spotify Player Store
const spotifyPlayerStore = useSpotifyPlayerStore()
const { spotifyPlayer, deviceId, isPlayerReady } = storeToRefs(spotifyPlayerStore)

// 使用實驗階段 Store
const experimentStore = useExperimentStore()
const { currentStage } = storeToRefs(experimentStore)

// 根據階段生成不同的 storage key
const getSongRatingsKey = () => {
  return `songRatings_stage${currentStage.value}`
}

// 響應式狀態
// const currentPlaylistIndex = ref(0)
const currentSongIndex = ref(0)
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const volume = ref(0.2)

// Debug: 監控 isPlaying 變化
watch(() => isPlaying.value, (newVal, oldVal) => {
  console.log(`[Debug] isPlaying changed: ${oldVal} → ${newVal}`)
}, { immediate: true })
// spotifyPlayer 和 deviceId 現在從全局 store 獲取
const playbackCheckInterval = ref<number | null>(null) // 播放進度檢查定時器
const songCompletedStatus = ref<{[key: number]: boolean}>({}) // 記錄每首歌是否播放完成
const listenersSetup = ref<boolean>(false) // 標記組件特定的 listeners 是否已設置
const componentListeners = ref<{[key: string]: Function}>({}) // 保存組件的 listener 引用，用於清理
const currentSongStarted = ref<boolean>(false) // 當前歌曲是否已開始播放
const songReplayCount = ref<{[key: number]: number}>({}) // 記錄每首歌的重新播放次數
const songPlaybackRetryCount = ref<{[key: number]: number}>({}) // 記錄每首歌的播放失敗重試次數（不同於用戶主動重播）
// const hasMovedSlider = ref<boolean>(false) // 記錄當前歌曲是否移動過評分拉桿

// 加載狀態
const isLoadingImages = ref(false)
const imageLoadProgress = ref(0)

// 當前用戶 email（用於區分用戶資料）
const currentUserEmail = ref<string>('')

// Toast 通知
const toastMessage = ref<string>('')
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


// Mock 歌單資料 (後續替換為真實資料)
// 使用 20 個 Spotify 歌曲 ID，每首歌隨機分配播放時間區間
const mockPlaylist = ref<Song[]>([])

// 計算屬性
const currentSong = computed(() => mockPlaylist.value[currentSongIndex.value])
const ratedSongsCount = computed(() =>
  mockPlaylist.value.filter(song =>
    song.rating !== null &&
    song.everListened !== null &&
    song.surpriseRating !== null
  ).length
)
const allSongsRated = computed(() =>
  mockPlaylist.value.length > 0 && ratedSongsCount.value === mockPlaylist.value.length
)
// 評分進度百分比
const ratingProgressPercentage = computed(() =>
  mockPlaylist.value.length > 0 ? (ratedSongsCount.value / mockPlaylist.value.length) * 100 : 0
)

// 檢查當前歌曲是否播放完成
const isCurrentSongCompleted = computed(() =>
  songCompletedStatus.value[currentSongIndex.value] === true
)

// 檢查當前歌曲是否可以評分（必須播放完成才能評分）
const canRate = computed(() =>
  isCurrentSongCompleted.value
)

// 檢查當前歌曲是否可以重新播放（歌曲完成後禁止重新播放）
const canReplaySong = computed(() => {
  // 如果歌曲已完成，則無法重新播放
  if (isCurrentSongCompleted.value) {
    return false
  }
  const replayCount = songReplayCount.value[currentSongIndex.value] || 0
  return replayCount < 1
})

// 監聽 canRate 變化進行調試
watch(canRate, (newValue) => {
  console.log('canRate changed to:', newValue)
})

watch(songCompletedStatus, (newValue) => {
  console.log('songCompletedStatus changed:', newValue)
}, { deep: true })

// 監聽所有歌曲評分完成，自動跳轉到滿意度頁面
watch(allSongsRated, async (newValue) => {
  if (newValue) {
    console.log('🎉 所有歌曲評分完成，準備批次更新評分...')

    // 取得 playlist_id
    const stagePrefix = currentStage.value === 1 ? 'stage1' : 'stage2'
    const playlistId = getUserData<number>(`playlistId_${stagePrefix}`)

    if (!playlistId) {
      console.error('❌ No playlist_id found, cannot batch update ratings')
      showToast('無法取得歌單資訊，請重新載入頁面', 5000, 'error')
      return
    }

    // 準備批次更新的資料
    const ratings: TrackRatingItem[] = mockPlaylist.value
      .filter(song => song.rating !== null && song.everListened !== null && song.surpriseRating !== null)
      .map(song => ({
        playlist_track_id: song.playlistTrackId!,
        is_ever_listened: song.everListened!,
        satisfaction_score: song.rating!,
        splendid_score: song.surpriseRating!
      }))

    console.log(`📝 Batch updating ${ratings.length} track ratings for playlist ${playlistId}...`)
    console.log('Ratings data:', ratings)

    try {
      const response = await batchUpdateTrackRatings(playlistId, ratings)
      console.log('✅ Batch update response:', response)

      if (response.code === 2000) {
        console.log('✅ All ratings updated successfully')

        // 標記該階段的所有歌曲已評分完成
        const completedKey = currentStage.value === 1
          ? 'allSongsCompleted_stage1'
          : 'allSongsCompleted_stage2'
        setUserData(completedKey, true)
        console.log(`Marked stage ${currentStage.value} as all songs completed`)

        // 延遲 2 秒後跳轉，讓用戶看到完成提示
        setTimeout(() => {
          console.log(`跳轉到滿意度頁面 (Stage ${currentStage.value})`)
          router.push('/playlist-satisfaction')
        }, 2000)
      } else {
        console.error('❌ Batch update failed:', response)
        showToast('評分更新失敗，請稍後再試', 5000, 'error')
      }
    } catch (error) {
      console.error('❌ Failed to batch update ratings:', error)
      showToast('評分更新失敗，請檢查網路連線', 5000, 'error')
    }
  }
})

// 快取歌曲資訊（專輯封面）
const trackInfoCache = ref<{[key: string]: any}>({})

// 從全局快取載入快取資料（所有用戶共用）
const loadTrackInfoCache = () => {
  try {
    const cached = getGlobalData<any>(GLOBAL_DATA_KEYS.TRACK_INFO_CACHE, {})
    console.log('📦 Loading cache from localStorage, key:', GLOBAL_DATA_KEYS.TRACK_INFO_CACHE)
    console.log('📦 Cached data:', cached)
    if (cached && Object.keys(cached).length > 0) {
      trackInfoCache.value = cached
      console.log('✅ Loaded track info cache:', Object.keys(trackInfoCache.value).length, 'tracks')
    } else {
      console.log('⚠️ No cache found or cache is empty')
    }
  } catch (error) {
    console.error('❌ Failed to load track info cache:', error)
  }
}

// 儲存快取到全局儲存（所有用戶共用）
const saveTrackInfoCache = () => {
  try {
    console.log('💾 Saving cache to localStorage, key:', GLOBAL_DATA_KEYS.TRACK_INFO_CACHE)
    console.log('💾 Saving', Object.keys(trackInfoCache.value).length, 'tracks')
    setGlobalData(GLOBAL_DATA_KEYS.TRACK_INFO_CACHE, trackInfoCache.value)
    console.log('✅ Cache saved successfully')
  } catch (error) {
    console.error('❌ Failed to save track info cache:', error)
  }
}

// 刷新 Spotify token (使用 proxy_account)
// 從 Spotify API 獲取歌曲資訊（包含專輯封面）
const fetchTrackInfo = async (trackId: string, retryCount = 0): Promise<any> => {
  // 檢查快取
  if (trackInfoCache.value[trackId]) {
    console.log(`Using cached track info for ${trackId}`)
    return trackInfoCache.value[trackId]
  }

  const proxyData = getUserData<any>(USER_DATA_KEYS.PROXY_ACCOUNT_DATA)
  if (!proxyData) {
    console.error('No proxy account data found')
    return null
  }

  let token: string
  try {
    token = proxyData.access_token
    if (!token) {
      console.error('No access token in proxy account data')
      return null
    }
  } catch (error) {
    console.error('Failed to parse proxy account data:', error)
    return null
  }

  try {
    const response = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    // 處理 401 錯誤（token 過期）
    if (response.status === 401 && retryCount === 0) {
      console.log('Spotify token expired, refreshing...')
      const refreshed = await spotifyPlayerStore.refreshSpotifyToken()
      if (refreshed) {
        // 重試一次
        return await fetchTrackInfo(trackId, retryCount + 1)
      } else {
        console.error('Failed to refresh token')
        return null
      }
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch track info: ${response.status}`)
    }

    const trackData = await response.json()

    // 儲存到快取
    trackInfoCache.value[trackId] = trackData
    saveTrackInfoCache()

    return trackData
  } catch (error) {
    console.error('Error fetching track info:', error)
    return null
  }
}

// 批次載入所有歌曲的專輯封面
const loadAllAlbumImages = async () => {
  console.log('Loading album images for all tracks...')

  isLoadingImages.value = true
  console.log('🎨 Skeleton loading started, isLoadingImages =', isLoadingImages.value)
  imageLoadProgress.value = 0
  const totalSongs = mockPlaylist.value.length

  // 檢查是否所有圖片都已經有快取
  console.log('🔍 Checking if all images are cached...')
  console.log('🔍 Current trackInfoCache has', Object.keys(trackInfoCache.value).length, 'tracks')

  const allCached = mockPlaylist.value.every(song => {
    if (!song.spotifyId) return true
    const cached = trackInfoCache.value[song.spotifyId]
    const hasCachedImage = cached && cached.album && cached.album.images && cached.album.images.length > 0
    if (!hasCachedImage) {
      console.log('❌ No cached image for:', song.name, '(', song.spotifyId, ')')
    }
    return hasCachedImage
  })

  console.log('🔍 All cached?', allCached)

  if (allCached) {
    console.log('✅ All images available in cache, loading from cache...')
    // 直接從快取載入
    for (let i = 0; i < totalSongs; i++) {
      const song = mockPlaylist.value[i]
      if (song.spotifyId && !song.albumImage) {
        const trackInfo = trackInfoCache.value[song.spotifyId]
        if (trackInfo && trackInfo.album && trackInfo.album.images && trackInfo.album.images.length > 0) {
          const imageUrl = trackInfo.album.images[1]?.url || trackInfo.album.images[0]?.url
          mockPlaylist.value[i].albumImage = imageUrl
        }
      }
      imageLoadProgress.value = Math.round(((i + 1) / totalSongs) * 100)
    }

    console.log('All album images loaded from cache')
    isLoadingImages.value = false
    console.log('🎨 Skeleton loading ended, isLoadingImages =', isLoadingImages.value)
    return
  }

  // 有些圖片未快取，需要從 API 獲取
  for (let i = 0; i < totalSongs; i++) {
    const song = mockPlaylist.value[i]
    if (song.spotifyId && !song.albumImage) {
      const trackInfo = await fetchTrackInfo(song.spotifyId)
      if (trackInfo && trackInfo.album && trackInfo.album.images && trackInfo.album.images.length > 0) {
        // 使用中等尺寸的圖片（通常是第二張，640x640）
        const imageUrl = trackInfo.album.images[1]?.url || trackInfo.album.images[0]?.url
        mockPlaylist.value[i].albumImage = imageUrl
        console.log(`✓ Loaded image for ${song.name}: ${imageUrl}`)
      } else {
        console.warn(`✗ Failed to load image for ${song.name} (${song.spotifyId})`)
      }
    }

    // 更新進度
    imageLoadProgress.value = Math.round(((i + 1) / totalSongs) * 100)
  }

  console.log('All album images loaded')
  isLoadingImages.value = false
  console.log('🎨 Skeleton loading ended, isLoadingImages =', isLoadingImages.value)
}

// Spotify SDK 相關函數
const initializeSpotifySDK = async () => {
  // 檢查 SDK 是否已載入
  if (window.Spotify) {
    console.log('[Component] Spotify SDK already loaded, initializing player...')
    await initializePlayer()
    return
  }

  // 動態載入 Spotify SDK
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://sdk.scdn.co/spotify-player.js'
    script.async = true

    // SDK 準備就緒的回調
    window.onSpotifyWebPlaybackSDKReady = async () => {
      console.log('[Component] Spotify SDK loaded via script, initializing player...')
      await initializePlayer()
      resolve(true)
    }

    script.onerror = () => reject(new Error('Failed to load Spotify SDK'))
    document.head.appendChild(script)
  })
}

const initializePlayer = async () => {
  console.log('[Component] 🚀 initializePlayer called')

  // 檢查 store 中是否已有 player
  if (spotifyPlayer.value && deviceId.value && isPlayerReady.value) {
    console.log('[Component] Player already exists in store, reusing it. Device ID:', deviceId.value)
    // 不要 return，繼續設置組件特定的 listeners
  } else if (spotifyPlayerStore.isInitializing) {
    // 如果 store 正在初始化，等待
    console.log('[Component] Store is initializing player, waiting...')
    await new Promise(resolve => {
      const checkInterval = setInterval(() => {
        if (!spotifyPlayerStore.isInitializing) {
          clearInterval(checkInterval)
          resolve(true)
        }
      }, 100)
    })
  } else {
    // 調用 store 來初始化 player
    console.log('[Component] Initializing player through store...')
    const success = await spotifyPlayerStore.initializePlayer()
    if (!success) {
      showToast('無法初始化播放器，請重新整理頁面', 3000, 'error')
      return
    }
  }

  // Player 應該已經準備好，現在添加組件特定的 listeners
  if (!spotifyPlayer.value) {
    console.error('[Component] Player not available after initialization')
    return
  }

  // 檢查 listeners 是否已設置，避免重複添加
  console.log('[Component] Checking listeners setup status:', {
    listenersSetup: listenersSetup.value,
    hasPlayer: !!spotifyPlayer.value,
    deviceId: deviceId.value
  })

  if (listenersSetup.value) {
    console.log('[Component] Listeners already set up, skipping')
    return
  }

  const player = spotifyPlayer.value
  console.log('[Component] Setting up component-specific listeners')

  // 組件特定的錯誤處理
  const accountErrorListener = ({ message }: { message: string }) => {
    console.error('[Component] Account error:', message)
    showToast('帳號錯誤：' + message, 3000, 'error')
  }
  player.addListener('account_error', accountErrorListener)
  componentListeners.value['account_error'] = accountErrorListener

  const playbackErrorListener = async ({ message }: { message: string }) => {
    console.error('🔴 SDK playback error:', message)

    // 記錄完整的錯誤資訊
    const song = currentSong.value
    console.log('🔴 詳細錯誤資訊：', {
      songName: song?.name,
      songIndex: currentSongIndex.value,
      spotifyId: song?.spotifyId,
      errorMessage: message,
      currentRetryCount: songPlaybackRetryCount.value[currentSongIndex.value] || 0,
      isPlaying: isPlaying.value,
      currentSongStarted: currentSongStarted.value
    })

    // 如果播放錯誤，停止播放並清理定時器
    isPlaying.value = false
    stopPlaybackCheckInterval()

    // 獲取當前重試次數
    const currentRetryCount = songPlaybackRetryCount.value[currentSongIndex.value] || 0

    // 顯示錯誤訊息並處理重試
    if (message.includes('restriction') || message.includes('Restriction')) {
      console.warn(`SDK 報告 Restriction 錯誤 (retry ${currentRetryCount}/3)`)

      if (currentRetryCount < 3) {
        // 增加重試計數
        songPlaybackRetryCount.value[currentSongIndex.value] = currentRetryCount + 1
        currentSongStarted.value = false

        if (currentRetryCount === 0) {
          // 第一次失敗：自動重試
          console.log('🔄 SDK 錯誤後自動重試...')
          console.log('📝 等待 500ms 後重新播放')
          showToast('歌曲載入中，正在重試...', 2000, 'info')

          const song = currentSong.value
          if (song?.spotifyId) {
            await new Promise(resolve => setTimeout(resolve, 500)) // 等待 500ms
            console.log('🔄 開始第 1 次自動重試')
            await playSpotifyTrack(song.spotifyId, song.startTime || 0, song.endTime)
          }
        } else {
          // 第二、三次失敗：提示用戶手動重試
          console.log(`📝 等待用戶手動重試 (${currentRetryCount}/3)`)
          showToast(`歌曲載入遇到問題，請再按一次播放按鈕 (${currentRetryCount}/3)`, 3000, 'info')
        }
      } else {
        // 超過3次
        console.error('❌ SDK 播放失敗，超過重試上限')
        console.log('📊 最終失敗資訊：', {
          songName: song?.name,
          trackId: song?.spotifyId,
          retryCount: currentRetryCount
        })
        showToast('此歌曲嘗試多次後仍無法播放，請聯繫實驗人員', 5000, 'error')
        currentSongStarted.value = false
      }
    } else {
      console.error('SDK 其他播放錯誤:', message)
      showToast('播放發生錯誤：' + message, 3000, 'error')
      currentSongStarted.value = false
    }
  }
  player.addListener('playback_error', playbackErrorListener)
  componentListeners.value['playback_error'] = playbackErrorListener

  // 播放器狀態更新（組件特定）
  const playerStateChangedListener = (state: any) => {
    console.log('[Component] 🎵 player_state_changed event received')
    if (!state) {
      console.warn('⚠️ player_state_changed: state is null')
      return
    }

    const wasPlaying = isPlaying.value
    isPlaying.value = !state.paused

    console.log(`[Component] Playback state: ${wasPlaying ? 'playing' : 'paused'} → ${isPlaying.value ? 'playing' : 'paused'}`, {
      paused: state.paused,
      track: state.track_window?.current_track?.name
    })

    const song = currentSong.value
    const currentPositionMs = state.position

    // 計算相對於播放片段的當前時間
    if (song && song.startTime !== undefined) {
      // currentTime 顯示從片段開始算起的時間
      const relativeTime = (currentPositionMs - song.startTime) / 1000
      currentTime.value = Math.max(0, relativeTime) // 確保不會是負數
    } else {
      currentTime.value = currentPositionMs / 1000
    }

    // 使用歌曲的播放時長，而不是歌曲總時長
    if (song && song.duration) {
      duration.value = song.duration / 1000 // 轉換為秒
    } else {
      duration.value = state.duration / 1000
    }

    // 當播放開始時，啟動播放進度檢查定時器
    if (!state.paused) {
      if (!playbackCheckInterval.value) {
        console.log('🔄 State changed to playing, starting timer')
        startPlaybackCheckInterval()
      } else {
        // Timer 已經在運行
        // console.log('✓ State changed to playing, timer already running')
      }
    } else {
      // 當播放暫停時，清除定時器
      console.log('⏸️ State changed to paused, stopping timer')
      stopPlaybackCheckInterval()
    }
  }
  player.addListener('player_state_changed', playerStateChangedListener)
  componentListeners.value['player_state_changed'] = playerStateChangedListener

  console.log('[Component] Component-specific listeners set up successfully')
  listenersSetup.value = true

  // 主動獲取當前播放狀態（因為 player_state_changed 只在狀態變化時觸發）
  player.getCurrentState().then((state: any) => {
    if (state) {
      isPlaying.value = !state.paused
      console.log('[Component] 🎯 Initial playback state set:', {
        paused: state.paused,
        isPlaying: isPlaying.value,
        track: state.track_window?.current_track?.name
      })
    } else {
      console.log('[Component] ⚠️ No initial state available from player')
    }
  }).catch((error: any) => {
    console.error('[Component] ❌ Error getting initial state:', error)
  })
}

// 啟動播放進度檢查定時器
const startPlaybackCheckInterval = () => {
  // 如果定時器已經在運行，先清除
  if (playbackCheckInterval.value) {
    console.log('⚠️ Timer already running, clearing first')
    window.clearInterval(playbackCheckInterval.value)
    playbackCheckInterval.value = null
  }

  // 啟動新的定時器
  const song = currentSong.value
  console.log('▶️ Starting playback check interval for:', {
    songIndex: currentSongIndex.value,
    songName: song?.name,
    startTime: song?.startTime,
    endTime: song?.endTime,
    duration: song?.duration
  })

  playbackCheckInterval.value = window.setInterval(() => {
    checkPlaybackPosition()
  }, 100) // 每 100ms 檢查一次

  console.log('✅ Timer started, interval ID:', playbackCheckInterval.value)
}

// 停止播放進度檢查定時器
const stopPlaybackCheckInterval = () => {
  if (playbackCheckInterval.value) {
    console.log('⏸️ Stopping playback check interval, ID:', playbackCheckInterval.value)
    window.clearInterval(playbackCheckInterval.value)
    playbackCheckInterval.value = null
    console.log('✅ Timer stopped')
  } else {
    console.log('⚠️ No timer to stop')
  }
}

// 檢查播放位置，確保不超過結束時間
const checkPlaybackPosition = async () => {
  if (!spotifyPlayer.value) {
    // console.warn('⚠️ checkPlaybackPosition: spotifyPlayer not available')
    return
  }

  try {
    const state = await spotifyPlayer.value.getCurrentState()
    if (!state) {
      // console.warn('⚠️ checkPlaybackPosition: state is null')
      return
    }

    const song = currentSong.value
    if (!song) {
      console.warn('⚠️ checkPlaybackPosition: currentSong is null')
      return
    }

    if (!song.endTime) {
      console.warn('⚠️ checkPlaybackPosition: song.endTime is null', {
        songIndex: currentSongIndex.value,
        songName: song.name,
        startTime: song.startTime,
        duration: song.duration
      })
      return
    }

    const currentPositionMs = state.position

    if (typeof currentPositionMs !== 'number') {
      console.error('❌ state.position is not a number:', currentPositionMs, 'state:', state)
      return
    }

    // 定期日誌（每秒）- 用於調試
    if (Math.floor(currentPositionMs / 1000) !== Math.floor((currentPositionMs - 100) / 1000)) {
      console.log(`⏱️ Playback position: ${Math.floor(currentPositionMs / 1000)}s / ${Math.floor(song.endTime / 1000)}s (Song: ${song.name})`)
    }

    // 檢查是否到達或超過結束時間
    if (currentPositionMs >= song.endTime) {
      console.log(`✅ Reached end time (${song.endTime}ms, current: ${currentPositionMs}ms), pausing playback`)
      await spotifyPlayer.value.pause()

      // 清除定時器
      stopPlaybackCheckInterval()

      // 標記當前歌曲為已完成
      songCompletedStatus.value[currentSongIndex.value] = true
      // 重置歌曲開始狀態
      currentSongStarted.value = false

      console.log(`✅ Song ${currentSongIndex.value} (${song.name}) marked as completed. Can rate:`, canRate.value)
      showToast('歌曲片段播放完畢，請進行評分', 2000, 'info')
    }
  } catch (error: any) {
    // 靜默處理常見的暫時性錯誤，避免污染控制台
    // 這些錯誤通常在播放器初始化或切換曲目時出現
    const silentErrors = [
      'The player is not ready',
      'No active device found',
      'Playback not available'
    ]

    const errorMessage = error?.message || String(error)
    const isSilentError = silentErrors.some(msg => errorMessage.includes(msg))

    if (!isSilentError) {
      console.error('❌ Error in checkPlaybackPosition:', error)
    }
    // 即使出錯也不停止定時器，避免影響後續播放
  }
}

// 播放控制函數
const togglePlay = async () => {
  console.log('[Component] 🎮 togglePlay called:', {
    isPlaying: isPlaying.value,
    hasPlayer: !!spotifyPlayer.value,
    deviceId: deviceId.value
  })

  if (!spotifyPlayer.value || !deviceId.value) {
    console.warn('Spotify player not ready, attempting to reinitialize...')

    // 嘗試重新初始化 player
    try {
      await initializePlayer()

      // 等待一下確保初始化完成
      await new Promise(resolve => setTimeout(resolve, 1500))

      // 如果還是不行，顯示錯誤
      if (!spotifyPlayer.value || !deviceId.value) {
        console.error('Failed to reinitialize Spotify player')
        showToast('播放器未就緒，請重新整理頁面', 3000, 'error')
        return
      }

      console.log('✅ Spotify player reinitialized successfully')
    } catch (error) {
      console.error('Error reinitializing Spotify player:', error)
      showToast('播放器初始化失敗，請重新整理頁面', 3000, 'error')
      return
    }
  }

  // 如果歌曲已完成，不允許繼續播放
  if (isCurrentSongCompleted.value) {
    showToast('此歌曲片段已播放完畢，請評分後繼續', 2000, 'info')
    return
  }

  if (isPlaying.value) {
    // 暫停播放
    await spotifyPlayer.value.pause()
    console.log('Paused playback')
  } else {
    // 繼續/開始播放
    if (currentSongStarted.value && !songPlaybackRetryCount.value[currentSongIndex.value]) {
      // 如果當前歌曲已經開始過且沒有重試計數，則繼續播放
      await spotifyPlayer.value.resume()
      console.log('Resumed playback')

      // 確保定時器啟動（以防 state_changed 事件沒觸發）
      setTimeout(() => {
        if (isPlaying.value && !playbackCheckInterval.value) {
          startPlaybackCheckInterval()
        }
      }, 500)
    } else {
      // 如果當前歌曲還沒開始過，或者有重試計數（需要重新播放），則從指定位置開始播放
      if (currentSong.value?.spotifyId) {
        console.log('🎬 開始播放歌曲', {
          spotifyId: currentSong.value.spotifyId,
          startTime: currentSong.value.startTime,
          endTime: currentSong.value.endTime,
          retryCount: songPlaybackRetryCount.value[currentSongIndex.value] || 0
        })

        await playSpotifyTrack(
          currentSong.value.spotifyId,
          currentSong.value.startTime || 0,
          currentSong.value.endTime
        )

        // 只有在沒有錯誤時才設置為 true
        // 如果有錯誤，playSpotifyTrack 內部會將其設為 false
        console.log('Started playback from', currentSong.value.startTime)

        // 確保定時器啟動（以防 state_changed 事件沒觸發）
        setTimeout(() => {
          if (isPlaying.value && !playbackCheckInterval.value) {
            startPlaybackCheckInterval()
          }
        }, 500)
      }
    }
  }
}

// API 請求防抖與限流
const lastApiCallTime = ref<number>(0)
const API_CALL_INTERVAL = 500 // 最小間隔 500ms

const playSpotifyTrack = async (trackId: string, startTime: number = 0, endTime?: number, authRetryCount = 0) => {
  // 顯示當前歌曲的重試狀態
  const currentRetryCount = songPlaybackRetryCount.value[currentSongIndex.value] || 0
  if (currentRetryCount > 0) {
    console.log(`📊 當前歌曲重試狀態: ${currentRetryCount}/3`)
  }

  // 檢查是否太頻繁呼叫 API
  const now = Date.now()
  const timeSinceLastCall = now - lastApiCallTime.value
  if (timeSinceLastCall < API_CALL_INTERVAL) {
    console.log(`API call throttled, waiting ${API_CALL_INTERVAL - timeSinceLastCall}ms`)
    await new Promise(resolve => setTimeout(resolve, API_CALL_INTERVAL - timeSinceLastCall))
  }

  // 從用戶資料中獲取 proxy account 數據中的 token
  const proxyData = getUserData<any>(USER_DATA_KEYS.PROXY_ACCOUNT_DATA)
  if (!proxyData) {
    console.error('No proxy account data found')
    return
  }

  let token: string
  try {
    token = proxyData.access_token
  } catch (error) {
    console.error('Failed to parse proxy account data:', error)
    return
  }

  if (!token || !deviceId.value) {
    console.error('Missing token or device ID', {
      hasToken: !!token,
      hasDeviceId: !!deviceId.value,
      deviceId: deviceId.value
    })
    return
  }

  try {
    const song = currentSong.value
    console.log(`🎵 準備播放歌曲：`, {
      songName: song?.name,
      trackId,
      startTime,
      endTime,
      duration: (endTime || 0) - startTime,
      songIndex: currentSongIndex.value
    })

    const response = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId.value}`, {
      method: 'PUT',
      body: JSON.stringify({
        uris: [`spotify:track:${trackId}`],
        position_ms: startTime  // 設置起始播放位置
      }),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })

    lastApiCallTime.value = Date.now()

    console.log(`📡 API Response Status: ${response.status}`)

    // 處理 401 錯誤（token 過期）
    if (response.status === 401 && authRetryCount === 0) {
      console.log('Spotify token expired during playback, refreshing...')
      const refreshed = await spotifyPlayerStore.refreshSpotifyToken()
      if (refreshed) {
        // 重試一次
        return await playSpotifyTrack(trackId, startTime, endTime, authRetryCount + 1)
      } else {
        console.error('Failed to refresh token for playback')
        showToast('播放失敗：無法刷新授權', 3000, 'error')
        return
      }
    }

    if (!response.ok) {
      let errorData
      try {
        errorData = await response.json()
      } catch {
        errorData = { error: { message: await response.text() } }
      }

      console.error('Spotify API error:', response.status, errorData)

      // 處理 rate limit 錯誤
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After')
        console.warn(`Rate limited! Retry after ${retryAfter} seconds`)
        showToast(`播放請求過於頻繁，請稍後再試（${retryAfter}秒後）`, 3000, 'error')
        return
      }

      // 處理 403 錯誤（包含 Restriction violated）
      if (response.status === 403) {
        const errorReason = errorData?.error?.reason || errorData?.error?.message || ''

        console.log('🚫 403 錯誤詳細資訊：', {
          trackId,
          startTime,
          endTime,
          errorReason,
          errorMessage: errorData?.error?.message,
          fullErrorData: errorData,
          songName: currentSong.value?.name
        })

        if (errorReason.includes('PREMIUM_REQUIRED')) {
          console.warn('Premium account required')
          showToast('此歌曲需要 Premium 帳號才能播放', 3000, 'error')
          currentSongStarted.value = false
          return
        }

        // Restriction violated 或 UNKNOWN - 不阻擋，讓 SDK 嘗試播放
        if (errorReason.includes('Restriction violated') || errorReason === 'UNKNOWN') {
          console.warn('⚠️ Web API 回報錯誤 (reason: ' + errorReason + ')，但繼續讓 SDK 嘗試播放')
          console.log('📝 將繼續執行播放驗證流程，等待 SDK 的反應...')
          // 不 return，不 throw，直接跳到驗證流程
          // 如果 SDK 真的無法播放，會觸發 playback_error 事件
        } else {
          // 其他 403 錯誤
          console.warn('Forbidden - possibly rate limited or insufficient permissions')
          showToast('播放請求被拒絕，可能是請求過於頻繁，請稍後再試', 3000, 'error')
          currentSongStarted.value = false
          return
        }
      } else {
        // 非 403 的其他錯誤才 throw
        throw new Error(`Failed to play track: ${response.status}`)
      }
    }

    console.log(`✅ API 調用成功，等待播放器真正開始播放...`)

    // 等待並驗證播放器真的開始播放了
    let verifyAttempts = 0
    const maxVerifyAttempts = 10 // 最多檢查 10 次（2 秒）

    const verifyPlaybackStarted = async () => {
      verifyAttempts++
      console.log(`🔍 驗證播放狀態 (嘗試 ${verifyAttempts}/${maxVerifyAttempts})`)

      try {
        const state = await spotifyPlayer.value.getCurrentState()

        if (!state) {
          console.warn(`⚠️ 第 ${verifyAttempts} 次檢查：state 為 null`)
          if (verifyAttempts < maxVerifyAttempts) {
            setTimeout(verifyPlaybackStarted, 200)
          } else {
            console.error('❌ 播放器狀態檢查超時，播放可能失敗')
            currentSongStarted.value = false
          }
          return
        }

        console.log(`📊 第 ${verifyAttempts} 次檢查：`, {
          paused: state.paused,
          position: state.position,
          trackUri: state.track_window?.current_track?.uri
        })

        if (!state.paused && state.position >= startTime) {
          // 播放器真的在播放了
          console.log(`✅ 確認播放已開始！position: ${state.position}ms, startTime: ${startTime}ms`)
          currentSongStarted.value = true
          spotifyPlayer.value.setVolume(volume.value)

          // 清除重試計數
          if (songPlaybackRetryCount.value[currentSongIndex.value] > 0) {
            console.log(`清除歌曲 ${currentSongIndex.value} 的重試計數`)
            songPlaybackRetryCount.value[currentSongIndex.value] = 0
          }

          // 確保計時器啟動
          if (!playbackCheckInterval.value) {
            console.log('🔧 播放確認後啟動計時器')
            startPlaybackCheckInterval()
          }
        } else if (!state.paused && state.position < startTime && verifyAttempts >= 3) {
          // 播放器在播放，但位置錯誤（可能從 0 開始而不是從 startTime 開始）
          // 在第 3 次檢查後嘗試 seek 到正確位置
          console.warn(`⚠️ 播放位置不正確！當前: ${state.position}ms, 應該是: ${startTime}ms`)
          console.log('🔧 使用 SDK seek() 強制跳到正確位置')

          try {
            await spotifyPlayer.value.seek(startTime)
            console.log(`✅ 已 seek 到 ${startTime}ms`)

            // 再驗證一次
            if (verifyAttempts < maxVerifyAttempts) {
              setTimeout(verifyPlaybackStarted, 500) // 給更多時間讓 seek 生效
            }
          } catch (error) {
            console.error('❌ Seek 失敗:', error)
            if (verifyAttempts < maxVerifyAttempts) {
              setTimeout(verifyPlaybackStarted, 200)
            }
          }
        } else {
          // 還在暫停或位置不對，繼續等待
          console.warn(`⚠️ 播放器還未真正開始 (paused: ${state.paused}, position: ${state.position})`)

          // 如果超過 5 次驗證還是暫停狀態，記錄更詳細的資訊
          if (state.paused && verifyAttempts >= 5) {
            console.log('🔍 播放器保持暫停狀態，檢查完整狀態：', {
              paused: state.paused,
              position: state.position,
              duration: state.duration,
              trackUri: state.track_window?.current_track?.uri,
              trackName: state.track_window?.current_track?.name,
              restrictions: state.restrictions,
              disallows: state.disallows
            })
          }

          if (verifyAttempts < maxVerifyAttempts) {
            setTimeout(verifyPlaybackStarted, 200)
          } else {
            console.error('❌ 播放器未能在 2 秒內開始播放')
            console.log('📊 最終播放器狀態：', {
              paused: state.paused,
              position: state.position,
              trackName: state.track_window?.current_track?.name,
              restrictions: state.restrictions,
              disallows: state.disallows
            })
            currentSongStarted.value = false
          }
        }
      } catch (error: any) {
        // 在驗證階段，靜默處理暫時性錯誤
        const silentErrors = [
          'The player is not ready',
          'No active device found',
          'Playback not available'
        ]

        const errorMessage = error?.message || String(error)
        const isSilentError = silentErrors.some(msg => errorMessage.includes(msg))

        if (!isSilentError) {
          console.error('驗證播放狀態時出錯:', error)
        }

        if (verifyAttempts < maxVerifyAttempts) {
          setTimeout(verifyPlaybackStarted, 200)
        } else {
          // 達到最大嘗試次數，記錄錯誤
          console.error('❌ 播放驗證失敗，已達最大嘗試次數:', error)
          currentSongStarted.value = false
        }
      }
    }

    // 開始驗證（延遲 300ms 後開始，給 Spotify 時間處理）
    setTimeout(verifyPlaybackStarted, 300)
  } catch (error) {
    console.error('Error playing track:', error)
    // 播放失敗，確保狀態為未開始
    currentSongStarted.value = false
  }
}

// 重新播放當前歌曲（已禁用 - 歌曲完成後無法重新播放）
const replaySong = async () => {
  // 歌曲完成後不允許重新播放
  if (isCurrentSongCompleted.value) {
    showToast('歌曲片段已播放完畢，無法重新播放', 2000, 'info')
    return
  }

  if (!canReplaySong.value) {
    showToast('此歌曲已使用過重新播放功能', 2000, 'info')
    return
  }

  const song = currentSong.value
  if (!song?.spotifyId) {
    return
  }

  // 記錄重新播放次數
  songReplayCount.value[currentSongIndex.value] = (songReplayCount.value[currentSongIndex.value] || 0) + 1

  // 重置歌曲開始狀態（但不重置完成狀態）
  currentSongStarted.value = false

  console.log(`Replaying song ${currentSongIndex.value}:`, {
    name: song.name,
    replayCount: songReplayCount.value[currentSongIndex.value]
  })

  // 從頭播放歌曲
  await playSpotifyTrack(song.spotifyId, song.startTime || 0, song.endTime)
  // currentSongStarted 會在 playSpotifyTrack 成功後自動設置

  showToast('已重新播放歌曲', 2000, 'info')
}

const selectSong = async (index: number) => {
  // 檢查是否可以選擇該歌曲
  if (!canReselectSong(index)) {
    return
  }

  // 如果點擊的是當前正在播放的歌曲，則暫停/繼續
  if (index === currentSongIndex.value) {
    await togglePlay()
    return
  }

  currentSongIndex.value = index
  const song = mockPlaylist.value[index]

  // 重置當前歌曲開始狀態
  currentSongStarted.value = false

  // 重置拉桿移動狀態
  hasMovedSatisfactionSlider.value = false
  hasMovedSurpriseSlider.value = false

  console.log(`Selected song ${index}:`, {
    name: song.name,
    startTime: `${song.startTime}ms`,
    endTime: `${song.endTime}ms`,
    duration: `${song.duration}ms`,
    isCompleted: songCompletedStatus.value[index],
    canRate: canRate.value
  })

  // 重置臨時評分為當前歌曲的評分或預設值
  if (song.rating !== null) {
    tempRating.value = song.rating
  } else {
    tempRating.value = 5  // 默認改為 5 分
  }

  if (song.surpriseRating !== null && song.surpriseRating !== undefined) {
    tempSurpriseRating.value = song.surpriseRating
  } else {
    tempSurpriseRating.value = 5  // 默認改為 5 分
  }

  console.log(`🎵 Song ${index} ratings reset:`, {
    satisfactionRating: tempRating.value,
    surpriseRating: tempSurpriseRating.value,
    storedSatisfaction: song.rating,
    storedSurprise: song.surpriseRating
  })

  if (song?.spotifyId) {
    await playSpotifyTrack(song.spotifyId, song.startTime || 0, song.endTime)
    // currentSongStarted 會在 playSpotifyTrack 成功後自動設置
  }
}


// 評分相關變數
const tempRating = ref<number>(5)
const tempSurpriseRating = ref<number>(5)
const hasMovedSatisfactionSlider = ref<boolean>(false)
const hasMovedSurpriseSlider = ref<boolean>(false)

// 計算當前歌曲的臨時評分
const currentTempRating = computed(() => {
  if (currentSong.value?.rating !== null) {
    return currentSong.value.rating
  }
  return tempRating.value
})

const currentTempSurpriseRating = computed(() => {
  if (currentSong.value?.surpriseRating !== null && currentSong.value?.surpriseRating !== undefined) {
    return currentSong.value.surpriseRating
  }
  return tempSurpriseRating.value
})

// 檢查是否可以確認評分（所有三個項目都已填寫）
const canConfirmRating = computed(() => {
  if (!currentSong.value) return false
  if (!canRate.value) return false
  if (currentSong.value.everListened === null) return false
  if (!hasMovedSatisfactionSlider.value) return false
  if (!hasMovedSurpriseSlider.value) return false
  return true
})

// 判斷歌曲是否可以點擊（按順序聆聽）
const isSongClickable = (index: number): boolean => {
  // 第一首歌曲永遠可以點擊
  if (index === 0) return true
  
  // 檢查前面的歌曲是否都已評分
  for (let i = 0; i < index; i++) {
    if (mockPlaylist.value[i].rating === null) {
      return false
    }
  }
  
  return true
}

// 判斷歌曲是否可以重新選擇（已評分的歌曲不能重新選擇）
const canReselectSong = (index: number): boolean => {
  // 如果歌曲已評分，則不能重新選擇
  if (mockPlaylist.value[index].rating !== null) {
    return false
  }
  
  // 否則檢查是否符合順序聆聽規則
  return isSongClickable(index)
}

// 計算拉桿百分比位置
const getSliderPercentage = (value: number): number => {
  if (value <= 5) {
    // 1-5分：0% 到 50%
    return ((value - 1) / 4) * 50
  } else {
    // 6-10分：50% 到 100%
    return 50 + ((value - 5) / 5) * 50
  }
}

// 選擇是否曾經聽過
const selectEverListened = (value: boolean) => {
  if (currentSong.value && currentSong.value.rating === null && canRate.value) {
    mockPlaylist.value[currentSongIndex.value].everListened = value
  }
}

// 處理滿意度評分 input 值變化
const handleSatisfactionInputChange = (event: Event) => {
  if (currentSong.value?.rating === null) {
    const target = event.target as HTMLInputElement
    tempRating.value = parseInt(target.value)
    hasMovedSatisfactionSlider.value = true
  }
}

// 處理驚喜度評分 input 值變化
const handleSurpriseInputChange = (event: Event) => {
  if (currentSong.value?.rating === null) {
    const target = event.target as HTMLInputElement
    tempSurpriseRating.value = parseInt(target.value)
    hasMovedSurpriseSlider.value = true
  }
}

// 處理滿意度拉桿滑鼠按下事件
const handleSatisfactionSliderMouseDown = (event: MouseEvent) => {
  if (currentSong.value?.rating === null) {
    startSatisfactionDragging(event)
  }
}

// 處理滿意度拉桿觸摸開始事件
const handleSatisfactionSliderTouchStart = (event: TouchEvent) => {
  if (currentSong.value?.rating === null) {
    startSatisfactionDragging(event)
  }
}

// 處理驚喜度拉桿滑鼠按下事件
const handleSurpriseSliderMouseDown = (event: MouseEvent) => {
  if (currentSong.value?.rating === null) {
    startSurpriseDragging(event)
  }
}

// 處理驚喜度拉桿觸摸開始事件
const handleSurpriseSliderTouchStart = (event: TouchEvent) => {
  if (currentSong.value?.rating === null) {
    startSurpriseDragging(event)
  }
}

// 開始拖拽滿意度評分拉桿
const startSatisfactionDragging = (_event: MouseEvent | TouchEvent) => {
  if (currentSong.value?.rating !== null) return // 已評分則不允許拖拽
  if (!canRate.value) return // 未播放完成則不允許拖拽

  hasMovedSatisfactionSlider.value = true // 標記已移動拉桿

  const handleMouseMove = (e: MouseEvent | TouchEvent) => {
    // 找到滿意度拉桿容器元素 (第一個拉桿)
    const sliderContainers = document.querySelectorAll('.relative.w-full.h-6')
    const rect = sliderContainers[0]?.getBoundingClientRect()
    if (!rect) return

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const percentage = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100))

    // 將百分比轉換回評分值
    let newValue: number
    if (percentage <= 50) {
      // 0-50% 對應 1-5分
      newValue = Math.round(1 + (percentage / 50) * 4)
    } else {
      // 50-100% 對應 6-10分
      newValue = Math.round(5 + ((percentage - 50) / 50) * 5)
    }

    // 確保值在1-10範圍內
    newValue = Math.max(1, Math.min(10, newValue))
    tempRating.value = newValue
  }

  const handleMouseUp = () => {
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
    document.removeEventListener('touchmove', handleMouseMove)
    document.removeEventListener('touchend', handleMouseUp)
  }

  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
  document.addEventListener('touchmove', handleMouseMove)
  document.addEventListener('touchend', handleMouseUp)
}

// 開始拖拽驚喜度評分拉桿
const startSurpriseDragging = (_event: MouseEvent | TouchEvent) => {
  if (currentSong.value?.rating !== null) return // 已評分則不允許拖拽
  if (!canRate.value) return // 未播放完成則不允許拖拽

  hasMovedSurpriseSlider.value = true // 標記已移動拉桿

  const handleMouseMove = (e: MouseEvent | TouchEvent) => {
    // 找到驚喜度拉桿容器元素 (第二個拉桿)
    const sliderContainers = document.querySelectorAll('.relative.w-full.h-6')
    const rect = sliderContainers[1]?.getBoundingClientRect()
    if (!rect) return

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const percentage = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100))

    // 將百分比轉換回評分值
    let newValue: number
    if (percentage <= 50) {
      // 0-50% 對應 1-5分
      newValue = Math.round(1 + (percentage / 50) * 4)
    } else {
      // 50-100% 對應 6-10分
      newValue = Math.round(5 + ((percentage - 50) / 50) * 5)
    }

    // 確保值在1-10範圍內
    newValue = Math.max(1, Math.min(10, newValue))
    tempSurpriseRating.value = newValue
  }

  const handleMouseUp = () => {
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
    document.removeEventListener('touchmove', handleMouseMove)
    document.removeEventListener('touchend', handleMouseUp)
  }

  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
  document.addEventListener('touchmove', handleMouseMove)
  document.addEventListener('touchend', handleMouseUp)
}

// 確認評分
const confirmRating = async () => {
  if (currentSong.value) {
    // 儲存所有三個評分項目到歌曲物件
    mockPlaylist.value[currentSongIndex.value].rating = tempRating.value
    mockPlaylist.value[currentSongIndex.value].surpriseRating = tempSurpriseRating.value

    // 儲存評分到 sessionStorage cache（根據阶段使用不同的 key）
    const ratingsKey = getSongRatingsKey()
    const ratings = getUserData<any>(ratingsKey, {})
    ratings[`song_${currentSongIndex.value}`] = {
      songId: currentSong.value.id,
      songName: currentSong.value.name,
      artist: currentSong.value.artist,
      everListened: currentSong.value.everListened,
      satisfactionRating: tempRating.value,
      surpriseRating: tempSurpriseRating.value,
      timestamp: new Date().toISOString()
    }
    setUserData(ratingsKey, ratings)
    console.log(`✅ Saved rating to sessionStorage cache for song ${currentSongIndex.value}`)

    // 重置拉桿移動狀態
    hasMovedSatisfactionSlider.value = false
    hasMovedSurpriseSlider.value = false

    // 不重置臨時評分，讓它保持當前值
  }
}

// 音量控制
const updateVolume = (event: Event) => {
  const target = event.target as HTMLInputElement
  volume.value = parseFloat(target.value)
  
  // 更新 Spotify 播放器音量
  if (spotifyPlayer.value) {
    spotifyPlayer.value.setVolume(volume.value)
  }
}

// 開始拖拽音量拉桿
const startVolumeDragging = (_event: MouseEvent | TouchEvent) => {
  const handleMouseMove = (e: MouseEvent | TouchEvent) => {
    // 找到音量拉桿容器元素
    const sliderContainer = document.querySelector('.relative.w-full.h-6')
    const rect = sliderContainer?.getBoundingClientRect()
    if (!rect) return
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const percentage = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100))
    
    // 將百分比轉換為音量值 (0-1)
    const newVolume = percentage / 100
    volume.value = newVolume
    
    // 更新 Spotify 播放器音量
    if (spotifyPlayer.value) {
      spotifyPlayer.value.setVolume(newVolume)
    }
  }
  
  const handleMouseUp = () => {
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
    document.removeEventListener('touchmove', handleMouseMove)
    document.removeEventListener('touchend', handleMouseUp)
  }
  
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
  document.addEventListener('touchmove', handleMouseMove)
  document.addEventListener('touchend', handleMouseUp)
}

// 組件生命週期
onMounted(async () => {
  console.log('PlaylistPlayer mounted')
  console.log(`Current stage: ${currentStage.value}`)

  // 載入快取（歌曲資訊快取，全局共用）
  loadTrackInfoCache()

  // 檢查用戶權限
  const email = sessionStorage.getItem('userEmail')
  if (!email) {
    router.replace('/')
    return
  }

  // 設置當前用戶 email
  currentUserEmail.value = email

  // 從 API 獲取實驗歌單
  try {
    console.log(`Fetching experiment playlist for phase ${currentStage.value}...`)
    const playlistResponse = await getExperimentPlaylist(currentStage.value)

    if (playlistResponse.code === 2000 && playlistResponse.data) {
      console.log('Experiment playlist received:', playlistResponse.data)

      // 將 API 返回的歌單轉換為前端格式
      const apiPlaylist = Array.isArray(playlistResponse.data) ? playlistResponse.data[0] : playlistResponse.data

      if (apiPlaylist && apiPlaylist.playlist_tracks && Array.isArray(apiPlaylist.playlist_tracks)) {
        // 儲存 playlist_id 到 sessionStorage，供 PlaylistSatisfaction 使用
        const stagePrefix = currentStage.value === 1 ? 'stage1' : 'stage2'
        if (apiPlaylist.id) {
          setUserData(`playlistId_${stagePrefix}`, apiPlaylist.id)
          console.log(`Saved playlist_id for ${stagePrefix}: ${apiPlaylist.id}`)
        }

        // 按照 order 排序
        const sortedTracks = [...apiPlaylist.playlist_tracks].sort((a, b) => {
          const orderA = a.order !== null && a.order !== undefined ? a.order : 999999
          const orderB = b.order !== null && b.order !== undefined ? b.order : 999999
          return orderA - orderB
        })

        console.log('Sorted tracks by order:', sortedTracks.map((pt: any) => ({ id: pt.id, order: pt.order, name: pt.track.name })))

        mockPlaylist.value = sortedTracks.map((playlistTrack: any, index: number) => {
          const track = playlistTrack.track
          console.log(`Track ${index}: order = ${playlistTrack.order}, playlistTrack.id = ${playlistTrack.id}, track.external_id = ${track.external_id}`)

          // 從 API 讀取已評分的資料
          const satisfaction = playlistTrack.satisfaction_score !== null && playlistTrack.satisfaction_score !== undefined
            ? playlistTrack.satisfaction_score
            : null
          const everListened = playlistTrack.is_ever_listened !== null && playlistTrack.is_ever_listened !== undefined
            ? playlistTrack.is_ever_listened
            : null
          const splendid = playlistTrack.splendid_score !== null && playlistTrack.splendid_score !== undefined
            ? playlistTrack.splendid_score
            : null

          if (satisfaction !== null || everListened !== null || splendid !== null) {
            console.log(`Track ${index} has existing ratings - satisfaction: ${satisfaction}, everListened: ${everListened}, splendid: ${splendid}`)
          }

          return {
            id: track.external_id,
            playlistTrackId: playlistTrack.id, // 用於 API 更新評分
            name: track.name,
            artist: Array.isArray(track.artists) ? track.artists.join(', ') : track.artists,
            spotifyId: track.external_id,
            rating: satisfaction,
            everListened: everListened,
            surpriseRating: splendid,
            albumImage: '',
            startTime: track.clip_start_ms || 0,
            endTime: track.clip_end_ms || 45000,
            duration: (track.clip_end_ms || 45000) - (track.clip_start_ms || 0)
          }
        })

        console.log(`Loaded ${mockPlaylist.value.length} tracks from API`)
        console.log('First track playlistTrackId:', mockPlaylist.value[0]?.playlistTrackId)

        // 將 API 的評分資料同步到 sessionStorage cache
        const ratingsKey = getSongRatingsKey()
        const ratingsCache: any = {}

        mockPlaylist.value.forEach((song, index) => {
          if (song.rating !== null || song.everListened !== null || song.surpriseRating !== null) {
            const songKey = `song_${index}`
            ratingsCache[songKey] = {
              satisfactionRating: song.rating,
              everListened: song.everListened,
              surpriseRating: song.surpriseRating
            }
          }
        })

        // 保存到 sessionStorage
        if (Object.keys(ratingsCache).length > 0) {
          setUserData(ratingsKey, ratingsCache)
          console.log(`Synced ${Object.keys(ratingsCache).length} ratings from API to sessionStorage`)
        }

      } else {
        console.error('Invalid playlist structure:', apiPlaylist)
        showToast('歌單格式錯誤，請聯繫管理員', 5000, 'error')
      }
    } else {
      console.error('Failed to fetch experiment playlist:', playlistResponse)
      showToast('無法載入實驗歌單，請重新整理頁面', 5000, 'error')
    }
  } catch (error) {
    console.error('Error fetching experiment playlist:', error)
    showToast('載入歌單時發生錯誤', 5000, 'error')
  }

  // 如果 sessionStorage 有更新的資料（例如用戶剛評分但還沒批次更新），優先使用 sessionStorage
  const ratingsKey = getSongRatingsKey()
  const cachedRatings = getUserData<any>(ratingsKey, {})
  if (Object.keys(cachedRatings).length > 0) {
    console.log(`Found cached ratings in sessionStorage, merging...`)
    Object.keys(cachedRatings).forEach((key) => {
      const ratingData = cachedRatings[key]
      const songIndex = parseInt(key.split('_').pop() || '0')
      if (songIndex < mockPlaylist.value.length) {
        // 只有當 sessionStorage 有資料且不為 null 時才覆蓋
        if (ratingData.satisfactionRating !== null && ratingData.satisfactionRating !== undefined) {
          mockPlaylist.value[songIndex].rating = ratingData.satisfactionRating
        }
        if (ratingData.everListened !== null && ratingData.everListened !== undefined) {
          mockPlaylist.value[songIndex].everListened = ratingData.everListened
        }
        if (ratingData.surpriseRating !== null && ratingData.surpriseRating !== undefined) {
          mockPlaylist.value[songIndex].surpriseRating = ratingData.surpriseRating
        }
        console.log(`Merged cached rating for song ${songIndex}`)
      }
    })
  }

  // 找到第一首未評分的歌曲（檢查三個評分項目）
  console.log('Playlist ratings status:', mockPlaylist.value.map((s, i) => ({
    index: i,
    name: s.name,
    rating: s.rating,
    everListened: s.everListened,
    surpriseRating: s.surpriseRating
  })))
  const firstUnratedIndex = mockPlaylist.value.findIndex(song =>
    song.rating === null ||
    song.everListened === null ||
    song.surpriseRating === null
  )
  if (firstUnratedIndex !== -1) {
    currentSongIndex.value = firstUnratedIndex
    console.log(`Setting current song to first unrated song at index ${firstUnratedIndex}`)
  } else {
    // 如果所有歌曲都已評分，設置為最後一首
    currentSongIndex.value = mockPlaylist.value.length - 1
    console.log('All songs rated, setting to last song')
  }

  // 設置當前歌曲的臨時評分
  if (currentSong.value?.rating !== null) {
    tempRating.value = currentSong.value.rating
  } else {
    tempRating.value = 5
  }

  // 添加淡入動畫
  await nextTick()
  const fadeElements = document.querySelectorAll('.fade-element')
  fadeElements.forEach((element) => {
    const delay = parseInt(element.getAttribute('data-delay') || '0')
    setTimeout(() => {
      element.classList.add('fade-in')
    }, delay)
  })

  // 初始化 Spotify SDK
  try {
    await initializeSpotifySDK()
    console.log('Spotify SDK initialized successfully')
  } catch (error) {
    console.error('Failed to initialize Spotify SDK:', error)
  }

  // 載入所有歌曲的專輯封面
  try {
    await loadAllAlbumImages()
    console.log('Album images loaded successfully')
  } catch (error) {
    console.error('Failed to load album images:', error)
  }

  // 初始化完成
  // 輸出播放時間區間信息
  console.log('=== Playlist Time Intervals ===')
  mockPlaylist.value.forEach((song, index) => {
    console.log(`${index + 1}. ${song.name}:`, {
      startTime: `${Math.floor(song.startTime / 1000)}s`,
      endTime: `${Math.floor(song.endTime / 1000)}s`,
      duration: `${Math.floor(song.duration / 1000)}s`
    })
  })
  console.log('===============================')

  console.log('PlaylistPlayer initialization completed')
})

onUnmounted(() => {
  // 清理播放進度檢查定時器
  stopPlaybackCheckInterval()

  // 移除組件特定的 listeners
  if (spotifyPlayer.value && Object.keys(componentListeners.value).length > 0) {
    console.log('[Component] Removing component listeners on unmount')
    Object.entries(componentListeners.value).forEach(([eventName, listener]) => {
      spotifyPlayer.value.removeListener(eventName, listener)
    })
    componentListeners.value = {}
    listenersSetup.value = false
  }

  // 不 disconnect 全局播放器，因為其他組件可能還在使用
  // 播放器現在由全局 store 管理生命週期

  // 清理 toast timeout
  if (toastTimeout.value) {
    clearTimeout(toastTimeout.value)
  }
})

// TypeScript 型別宣告
declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady: () => void
    Spotify: any
  }
}
</script>

<style scoped>
/* 頁面和組件淡入動畫 */
.fade-element {
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.6s ease-out;
}

.fade-element.fade-in {
  opacity: 1;
  transform: translateY(0);
}

/* 歌曲列表動畫 */
.space-y-3 > div {
  transition: all 0.3s ease;
}

/* 播放控制按鈕 - 禁止移動 */
.player-control-btn {
  transform: none !important;
}

.player-control-btn:hover,
.player-control-btn:active {
  transform: none !important;
}

/* 播放按鈕特效 */
button:not([class*="bg-green-600"]):not(.player-control-btn) {
  transition: all 0.2s ease;
}

button:not([class*="bg-green-600"]):not(.player-control-btn):hover:not(:disabled) {
  transform: scale(1.05);
}

button:not([class*="bg-green-600"]):not(.player-control-btn):active:not(:disabled) {
  transform: scale(0.95);
}

/* 評分按鈕特效 - 已移除 hover 效果 */

/* 進度條動畫 */
.bg-green-600, .bg-blue-600 {
  transition: width 0.3s ease;
}

/* 響應式調整 */
@media (max-width: 1024px) {
  .grid-cols-1.lg\\:grid-cols-3 {
    grid-template-columns: 1fr;
  }
  
  .lg\\:col-span-2 {
    grid-column: span 1;
  }
}

/* 歌曲項目 hover 效果 */
.cursor-pointer:hover:not(.slider):not(.slider *) {
  transform: translateX(4px);
}

/* 播放器卡片 */
.bg-gray-900 {
  backdrop-filter: blur(10px);
  border: 1px solid rgba(75, 85, 99, 0.3);
}

/* 當前播放歌曲高亮 */
.border-green-500 {
  box-shadow: 0 0 20px rgba(34, 197, 94, 0.3);
  animation: greenPulse 2s ease-in-out infinite;
}

@keyframes greenPulse {
  0%, 100% {
    box-shadow: 0 0 20px rgba(34, 197, 94, 0.3);
  }
  50% {
    box-shadow: 0 0 30px rgba(34, 197, 94, 0.5);
  }
}

/* 評分中狀態高亮 */
.border-yellow-500 {
  box-shadow: 0 0 20px rgba(234, 179, 8, 0.3);
  animation: yellowPulse 2s ease-in-out infinite;
}

@keyframes yellowPulse {
  0%, 100% {
    box-shadow: 0 0 20px rgba(234, 179, 8, 0.3);
  }
  50% {
    box-shadow: 0 0 30px rgba(234, 179, 8, 0.5);
  }
}

/* 自定義拉桿樣式 */
.relative.w-full.h-6 {
  user-select: none;
}

.relative.w-full.h-6 .bg-gray-700 {
  cursor: pointer;
}

.relative.w-full.h-6 .bg-green-500 {
  transition: all 0.2s ease;
}

/* 自定義拉桿 hover 效果已移除 */

/* 音量控制使用與評分相同的自定義拉桿樣式 */

/* 美化滾動條 */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: rgba(75, 85, 99, 0.3);
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgba(75, 85, 99, 0.8);
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(75, 85, 99, 1);
}

/* 進度條動畫 */
@keyframes progressShine {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.animate-pulse {
  animation: progressShine 2s ease-in-out infinite;
}

/* 進度條完成時的慶祝效果 */
.progress-complete {
  animation: progressComplete 0.5s ease-out;
}

@keyframes progressComplete {
  0% {
    transform: scaleY(1);
  }
  50% {
    transform: scaleY(2);
  }
  100% {
    transform: scaleY(1);
  }
}

/* Toast 通知動畫 */
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

/* Fade 過渡動畫 */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translate(-50%, -10px);
}
</style>
