<template>
  <div class="min-h-screen relative overflow-hidden bg-black text-white">
    <!-- Toast 通知 -->
    <Transition name="toast">
      <div
        v-if="toastMessage"
        :class="[
          'fixed top-32 left-1/2 transform -translate-x-1/2 z-50 text-white px-6 py-3 rounded-lg shadow-lg max-w-md text-center',
          toastType === 'error' ? 'bg-red-600' : 'bg-blue-600'
        ]"
      >
        {{ toastMessage }}
      </div>
    </Transition>

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
    
    <!-- 漸層覆蓋層 - Spotify 風格 -->
    <div class="absolute inset-0 bg-gradient-to-br from-green-900/20 via-black/40 to-green-800/20 opacity-95 pointer-events-none"></div>
    <!-- 標題區域 -->
    <div class="bg-gray-900 border-b border-gray-700 py-6 relative z-10">
      <div class="container mx-auto px-4">
        <h1 class="text-3xl font-bold text-center fade-element" data-delay="0">
          Spotify 預授權設定
        </h1>
        <p class="text-gray-400 text-center mt-2 fade-element" data-delay="200">
          請先完成 Spotify 授權，以確保實驗進行順利
        </p>
      </div>
    </div>

    <!-- 主要內容區域 -->
    <div class="container mx-auto px-4 py-8 relative z-10">
      <div class="max-w-2xl mx-auto space-y-8">
        
        <!-- 步驟指示器 -->
        <div class="bg-gray-900 rounded-lg p-6 fade-element" data-delay="400">
          <h2 class="text-xl font-semibold mb-4">授權步驟</h2>
          <div class="space-y-3">
            <div class="flex items-center space-x-3">
              <div :class="[
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold',
                currentStep >= 2 ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-400'
              ]">
                1
              </div>
              <span :class="currentStep >= 2 ? 'text-white' : 'text-gray-400'">
                輸入 Email 並登入
              </span>
            </div>
            <div class="flex items-center space-x-3">
              <div :class="[
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold',
                currentStep >= 4 ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-400'
              ]">
                2
              </div>
              <span :class="currentStep >= 4 ? 'text-white' : 'text-gray-400'">
                完成 Spotify 授權
              </span>
            </div>
            <div class="flex items-center space-x-3">
              <div :class="[
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold',
                currentStep >= 5 ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-400'
              ]">
                3
              </div>
              <span :class="currentStep >= 5 ? 'text-white' : 'text-gray-400'">
                提供 每週新發現(Discover Weekly) 播放清單
              </span>
            </div>
            <div class="flex items-center space-x-3">
              <div :class="[
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold',
                currentStep >= 6 ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-400'
              ]">
                4
              </div>
              <span :class="currentStep >= 6 ? 'text-white' : 'text-gray-400'">
                提供最愛播放清單
              </span>
            </div>
          </div>
        </div>

        <!-- 步驟 1: Email 登入 -->
        <div v-if="currentStep === 1" class="bg-gray-900 rounded-lg p-6 fade-element" data-delay="600">
          <h3 class="text-lg font-semibold mb-4">步驟 1: 輸入您的 Email</h3>
          <p class="text-gray-400 mb-6">
            請輸入您將參與實驗的 Email 地址，我們會驗證您的身份。
          </p>
          
          <form @submit.prevent="handleEmailLogin" class="space-y-4">
            <div>
              <label for="email" class="block text-sm font-medium text-gray-300 mb-2">
                Email 地址
              </label>
              <div class="relative">
                <input
                  id="email"
                  v-model="email"
                  type="email"
                  required
                  placeholder="your.email@example.com"
                  :class="[
                    'w-full px-4 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none transition-colors',
                    showEmailFormatError 
                      ? 'border-red-500 focus:border-red-500' 
                      : 'border-gray-600 focus:border-green-500'
                  ]"
                  :disabled="isLoading"
                />
                
                <!-- Email 格式提示對話框 -->
                <div 
                  v-if="showEmailFormatError" 
                  class="absolute top-full left-0 mt-2 bg-red-900 border border-red-700 rounded-lg p-3 shadow-lg z-10 max-w-xs email-tooltip"
                >
                  <div class="flex items-center space-x-2">
                    <svg class="w-4 h-4 text-red-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                    </svg>
                    <span class="text-red-300 text-sm">Email 格式不正確</span>
                  </div>
                  
                  <!-- 對話框箭頭 -->
                  <div class="absolute -top-2 left-4 w-4 h-4 bg-red-900 border-l border-t border-red-700 transform rotate-45"></div>
                </div>
              </div>
            </div>
            
            <button
              type="submit"
              :disabled="isLoading || !email"
              class="w-full py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
            >
              <span v-if="isLoading" class="flex items-center justify-center">
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                驗證中...
              </span>
              <span v-else>驗證 Email</span>
            </button>
          </form>
        </div>

        <!-- 步驟 2: Spotify 授權 -->
        <div v-if="currentStep === 2" class="bg-gray-900 rounded-lg p-6 fade-element" data-delay="600">
          <h3 class="text-lg font-semibold mb-4">步驟 2: Spotify 授權</h3>
          <p class="text-gray-400 mb-6">
            請點擊下方按鈕前往 Spotify 進行授權，授權完成後會自動返回此頁面。
          </p>
          
          <div class="space-y-4">
            <div class="bg-gray-800 rounded-lg p-4">
              <h4 class="font-semibold text-green-400 mb-2">授權說明</h4>
              <ul class="text-sm text-gray-300 space-y-1">
                <li>• 我們需要存取您的 Spotify 帳戶來播放音樂</li>
                <li>• 您需要擁有 Spotify Premium 帳戶</li>
                <li>• 授權後您可以隨時在 Spotify 設定中取消</li>
              </ul>
            </div>
            
            <button
              @click="startSpotifyAuth"
              :disabled="isLoading"
              class="w-full py-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center justify-center space-x-2"
              style="cursor: pointer;"
            >
              <svg class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
              </svg>
              <span>前往 Spotify 授權</span>
            </button>
          </div>
        </div>


        <!-- 步驟 4: 每週新發現(Discover Weekly) 播放清單 -->
        <div v-if="currentStep === 4" class="bg-gray-900 rounded-lg p-6 fade-element" data-delay="600">
          <h3 class="text-lg font-semibold mb-4">步驟 3: 每週新發現(Discover Weekly) 播放清單</h3>
          <p class="text-gray-400 mb-6">
            請提供您的 Spotify 每週新發現(Discover Weekly) 播放清單。您可以直接貼上完整連結或只提供播放清單 ID。
          </p>

          <div class="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mb-6">
            <h4 class="font-semibold text-blue-400 mb-2">📋 如何準備播放清單？</h4>
            <ol class="text-sm text-gray-300 space-y-2 list-decimal list-inside">
              <li>建立一個全新的歌單</li>
              <li>在 Spotify 搜尋「<span class="text-green-400 font-semibold">每週新發現(Discover Weekly)</span>」</li>
              <li>找到由 <span class="text-green-400 font-semibold">Spotify 官方</span>提供的播放清單</li>
              <li>將每週新發現(Discover Weekly) 所有歌曲，<span class="text-green-400 font-semibold">按原順序</span>複製到新播放清單中</li>
              <li>在新播放清單中點擊「分享」→「複製播放清單連結」</li>
              <li>將完整連結貼到下方輸入框（系統會自動提取 ID）</li>
            </ol>
            <div class="mt-3 space-y-2">
              <p class="text-xs text-gray-400">
                💡 提示：請使用自建的播放清單副本，而非直接使用 Spotify 官方的 每週新發現(Discover Weekly)
              </p>
              <p class="text-xs text-yellow-400">
                ⚠️ 注意：系統會自動檢測並標記播放清單內部的重複歌曲，以及與其他已提供歌單重複的歌曲
              </p>
              <p class="text-xs text-yellow-400">
                ⚠️ 注意：系統可能會過濾掉部分在台灣地區無法播放的歌曲（available_market 不含 TW）
              </p>
            </div>
          </div>

          <div class="space-y-4 fade-element" data-delay="800">
            <div>
              <label for="discover-weekly-id" class="block text-sm font-medium text-gray-300 mb-2">
                每週新發現(Discover Weekly) 播放清單 ID 或連結
              </label>
              <input
                id="discover-weekly-id"
                v-model="discoverWeeklyId"
                type="text"
                required
                placeholder="貼上完整連結或只輸入 ID（例如：5FD5mMh2KlcyllyMTmlT5Z）"
                :class="[
                  'w-full px-4 py-3 border rounded-lg focus:outline-none transition-colors',
                  discoverWeeklyValidated
                    ? 'bg-gray-900/50 border-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-green-500'
                ]"
                :disabled="isValidating || isImporting || discoverWeeklyValidated"
              />
            </div>

            <!-- 驗證按鈕 -->
            <div v-if="!discoverWeeklyValidated">
              <button
                @click="handlePlaylistValidate('discover_weekly')"
                :disabled="isValidating || !discoverWeeklyId"
                class="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
              >
                <span v-if="isValidating" class="flex items-center justify-center">
                  <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  驗證中...
                </span>
                <span v-else>🔍 驗證播放清單</span>
              </button>
            </div>

            <!-- 歌曲列表 -->
            <div v-if="discoverWeeklyValidated && discoverWeeklyTracks.length > 0" class="bg-gray-800 rounded-lg p-4">
              <!-- 驗證結果標題 -->
              <div v-if="discoverWeeklyValidationErrors.length === 0 && !hasDuplicates(discoverWeeklyTracks)" class="flex items-center justify-between mb-4">
                <h4 class="text-sm font-semibold text-green-400 flex items-center">
                  <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                  </svg>
                  驗證成功！找到 {{ discoverWeeklyTracks.length }} 首歌曲
                </h4>
                <span class="text-xs text-gray-400">向下滾動查看全部</span>
              </div>
              <!-- 重複警告 -->
              <div v-else-if="hasDuplicates(discoverWeeklyTracks)" class="mb-4">
                <div class="flex items-start justify-between mb-2">
                  <h4 :class="[
                    'text-sm font-semibold flex items-center',
                    discoverWeeklyIsValid ? 'text-green-400' : 'text-yellow-400'
                  ]">
                    <svg v-if="discoverWeeklyIsValid" class="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                    </svg>
                    <svg v-else class="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                    </svg>
                    找到 {{ discoverWeeklyTracks.length }} 首歌曲，共 {{ getValidTracksCount(discoverWeeklyTracks) }} / {{ discoverWeeklyTracks.length }} 可用
                  </h4>
                  <span class="text-xs text-gray-400">向下滾動查看全部</span>
                </div>
                <div :class="[
                  'rounded-lg p-3 mt-2',
                  discoverWeeklyIsValid
                    ? 'bg-yellow-900/20 border border-yellow-500/30'
                    : 'bg-red-900/20 border border-red-500/30'
                ]">
                  <p :class="[
                    'text-xs font-semibold mb-2',
                    discoverWeeklyIsValid ? 'text-yellow-300' : 'text-red-300'
                  ]">
                    {{ discoverWeeklyIsValid ? '⚠️ 播放清單中有重複的歌曲' : '❌ 驗證失敗' }}
                  </p>
                  <div v-if="discoverWeeklyIsValid">
                    <p class="text-xs text-yellow-200">
                      系統已標記播放清單中重複的歌曲。您可以選擇移除重複歌曲後重新驗證，或直接繼續導入可用的歌曲。
                    </p>
                  </div>
                  <div v-else>
                    <ul class="text-xs text-red-200 space-y-1">
                      <li v-for="(error, index) in discoverWeeklyValidationErrors" :key="index" class="flex items-start">
                        <span class="text-red-400 mr-2">•</span>
                        <span>{{ error }}</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              <div v-else class="mb-4">
                <div class="flex items-start justify-between mb-2">
                  <h4 class="text-sm font-semibold text-red-400 flex items-center">
                    <svg class="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                    </svg>
                    驗證失敗 - 找到 {{ discoverWeeklyTracks.length }} 首歌曲
                  </h4>
                  <span class="text-xs text-gray-400">向下滾動查看全部</span>
                </div>
                <div class="bg-red-900/20 border border-red-500/30 rounded-lg p-3 mt-2">
                  <ul class="text-xs text-red-200 space-y-1">
                    <li v-for="(error, index) in discoverWeeklyValidationErrors" :key="index" class="flex items-start">
                      <span class="text-red-400 mr-2">•</span>
                      <span>{{ error }}</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div class="max-h-96 overflow-y-auto pr-2 space-y-2 custom-scrollbar" @wheel="handlePlaylistScroll">
                <div
                  v-for="(track, index) in discoverWeeklyTracks"
                  :key="index"
                  draggable="true"
                  @dragstart="handleDragStart(index, 'discover_weekly')"
                  @dragover="handleDragOver($event, index)"
                  @dragleave="handleDragLeave()"
                  @drop="handleDrop($event, index, 'discover_weekly')"
                  @dragend="handleDragEnd()"
                  :class="[
                    'flex items-center space-x-3 p-2 rounded-lg transition-colors cursor-move',
                    track.is_duplicated
                      ? 'bg-gray-900/50 opacity-60'
                      : 'hover:bg-gray-700/50',
                    draggedIndex === index && 'opacity-50',
                    dragOverIndex === index && 'border-2 border-green-500'
                  ]"
                >
                  <!-- 序號 -->
                  <span :class="[
                    'text-sm font-medium w-8 flex-shrink-0 text-right',
                    track.is_duplicated ? 'text-gray-600' : 'text-gray-500'
                  ]">
                    {{ index + 1 }}
                  </span>

                  <!-- 專輯封面 -->
                  <div :class="[
                    'w-12 h-12 flex-shrink-0 bg-gray-700 rounded overflow-hidden',
                    track.is_duplicated && 'opacity-40'
                  ]">
                    <img
                      v-if="track.image_url"
                      :src="track.image_url"
                      :alt="track.name"
                      class="w-full h-full object-cover"
                      @error="(e) => (e.target as HTMLImageElement).src = ''"
                    />
                    <div v-else class="w-full h-full flex items-center justify-center">
                      <svg class="w-6 h-6 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z"/>
                      </svg>
                    </div>
                  </div>

                  <!-- 歌曲資訊 -->
                  <div class="flex-1 min-w-0">
                    <p :class="[
                      'text-sm font-medium truncate',
                      track.is_duplicated
                        ? 'text-gray-500 line-through'
                        : 'text-white'
                    ]">
                      {{ track.name }}
                    </p>
                    <p :class="[
                      'text-xs truncate',
                      track.is_duplicated ? 'text-gray-600' : 'text-gray-400'
                    ]">
                      {{ Array.isArray(track.artists) ? track.artists.join(', ') : track.artists }}
                    </p>
                  </div>

                  <!-- 重複標籤 -->
                  <div v-if="track.is_duplicated" class="flex-shrink-0">
                    <span class="text-xs px-2 py-1 bg-yellow-900/40 text-yellow-400 rounded border border-yellow-500/30">
                      重複
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 導入按鈕 -->
            <div v-if="discoverWeeklyValidated" class="flex space-x-3">
              <button
                @click="discoverWeeklyValidated = false; discoverWeeklyTracks = []; discoverWeeklyValidationErrors = []; discoverWeeklyIsValid = false"
                :disabled="isImporting"
                class="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
              >
                🔄 重新驗證
              </button>
              <button
                @click="handlePlaylistImport('discover_weekly')"
                :disabled="isImporting || !discoverWeeklyIsValid"
                :class="[
                  'flex-1 py-3 font-semibold rounded-lg transition-colors',
                  !discoverWeeklyIsValid
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                ]"
              >
                <span v-if="isImporting" class="flex items-center justify-center">
                  <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  導入中...
                </span>
                <span v-else>✓ 確認導入</span>
              </button>
            </div>
          </div>
        </div>

        <!-- 步驟 5: Member Favorite 播放清單 -->
        <div v-if="currentStep === 5" class="bg-gray-900 rounded-lg p-6 fade-element" data-delay="600">
          <h3 class="text-lg font-semibold mb-4">步驟 4: 最愛播放清單</h3>
          <p class="text-gray-400 mb-6">
            請建立一個包含您最喜愛歌曲的播放清單，並按照喜好程度由高到低排序。您可以直接貼上完整連結或只提供播放清單 ID。
          </p>

          <div class="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mb-6">
            <h4 class="font-semibold text-blue-400 mb-2">📋 如何準備播放清單？</h4>
            <ol class="text-sm text-gray-300 space-y-2 list-decimal list-inside">
              <li>在 Spotify 建立一個<span class="text-green-400 font-semibold">新的播放清單</span></li>
              <li>加入<span class="text-green-400 font-semibold">至少 12 首</span>您最喜愛的歌曲</li>
              <li>將歌曲<span class="text-green-400 font-semibold">按照喜好程度排序</span>（最喜歡的放最前面）</li>
              <li>在播放清單中點擊「分享」→「複製播放清單連結」</li>
              <li>將完整連結貼到下方輸入框（系統會自動提取 ID）</li>
            </ol>
            <div class="mt-3 space-y-2">
              <p class="text-xs text-gray-400">
                💡 提示：請選擇能代表您音樂品味的歌曲，排序越準確越好
              </p>
              <p class="text-xs text-yellow-400">
                ⚠️ 注意：系統會自動檢測並標記播放清單內部的重複歌曲，以及與其他已提供歌單重複的歌曲
              </p>
              <p class="text-xs text-yellow-400">
                ⚠️ 注意：系統可能會過濾掉部分在台灣地區無法播放的歌曲（available_market 不含 TW）
              </p>
            </div>
          </div>

          <div class="space-y-4 fade-element" data-delay="800">
            <div>
              <label for="member-favorite-id" class="block text-sm font-medium text-gray-300 mb-2">
                最愛播放清單 ID 或連結
              </label>
              <input
                id="member-favorite-id"
                v-model="memberFavoriteId"
                type="text"
                required
                placeholder="貼上完整連結或只輸入 ID（例如：5FD5mMh2KlcyllyMTmlT5Z）"
                :class="[
                  'w-full px-4 py-3 border rounded-lg focus:outline-none transition-colors',
                  memberFavoriteValidated
                    ? 'bg-gray-900/50 border-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-green-500'
                ]"
                :disabled="isValidating || isImporting || memberFavoriteValidated"
              />
            </div>

            <!-- 驗證按鈕 -->
            <div v-if="!memberFavoriteValidated">
              <button
                @click="handlePlaylistValidate('member_favorite')"
                :disabled="isValidating || !memberFavoriteId"
                class="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
              >
                <span v-if="isValidating" class="flex items-center justify-center">
                  <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  驗證中...
                </span>
                <span v-else>🔍 驗證播放清單</span>
              </button>
            </div>

            <!-- 歌曲列表 -->
            <div v-if="memberFavoriteValidated && memberFavoriteTracks.length > 0" class="bg-gray-800 rounded-lg p-4">
              <!-- 驗證結果標題 -->
              <div v-if="memberFavoriteValidationErrors.length === 0 && !hasDuplicates(memberFavoriteTracks)" class="flex items-center justify-between mb-4">
                <h4 class="text-sm font-semibold text-green-400 flex items-center">
                  <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                  </svg>
                  驗證成功！找到 {{ memberFavoriteTracks.length }} 首歌曲
                </h4>
                <span class="text-xs text-gray-400">向下滾動查看全部</span>
              </div>
              <!-- 重複警告 -->
              <div v-else-if="hasDuplicates(memberFavoriteTracks)" class="mb-4">
                <div class="flex items-start justify-between mb-2">
                  <h4 :class="[
                    'text-sm font-semibold flex items-center',
                    memberFavoriteIsValid ? 'text-green-400' : 'text-yellow-400'
                  ]">
                    <svg v-if="memberFavoriteIsValid" class="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                    </svg>
                    <svg v-else class="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                    </svg>
                    找到 {{ memberFavoriteTracks.length }} 首歌曲，共 {{ getValidTracksCount(memberFavoriteTracks) }} / {{ memberFavoriteTracks.length }} 可用
                  </h4>
                  <span class="text-xs text-gray-400">向下滾動查看全部</span>
                </div>
                <div :class="[
                  'rounded-lg p-3 mt-2',
                  memberFavoriteIsValid
                    ? 'bg-yellow-900/20 border border-yellow-500/30'
                    : 'bg-red-900/20 border border-red-500/30'
                ]">
                  <p :class="[
                    'text-xs font-semibold mb-2',
                    memberFavoriteIsValid ? 'text-yellow-300' : 'text-red-300'
                  ]">
                    {{ memberFavoriteIsValid ? '⚠️ 播放清單中有重複的歌曲' : '❌ 驗證失敗' }}
                  </p>
                  <div v-if="memberFavoriteIsValid">
                    <p class="text-xs text-yellow-200">
                      系統已標記播放清單中重複的歌曲。您可以選擇移除重複歌曲後重新驗證，或直接繼續導入可用的歌曲。
                    </p>
                  </div>
                  <div v-else>
                    <ul class="text-xs text-red-200 space-y-1">
                      <li v-for="(error, index) in memberFavoriteValidationErrors" :key="index" class="flex items-start">
                        <span class="text-red-400 mr-2">•</span>
                        <span>{{ error }}</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              <div v-else class="mb-4">
                <div class="flex items-start justify-between mb-2">
                  <h4 class="text-sm font-semibold text-red-400 flex items-center">
                    <svg class="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                    </svg>
                    驗證失敗 - 找到 {{ memberFavoriteTracks.length }} 首歌曲
                  </h4>
                  <span class="text-xs text-gray-400">向下滾動查看全部</span>
                </div>
                <div class="bg-red-900/20 border border-red-500/30 rounded-lg p-3 mt-2">
                  <ul class="text-xs text-red-200 space-y-1">
                    <li v-for="(error, index) in memberFavoriteValidationErrors" :key="index" class="flex items-start">
                      <span class="text-red-400 mr-2">•</span>
                      <span>{{ error }}</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div class="max-h-96 overflow-y-auto pr-2 space-y-2 custom-scrollbar" @wheel="handlePlaylistScroll">
                <div
                  v-for="(track, index) in memberFavoriteTracks"
                  :key="index"
                  draggable="true"
                  @dragstart="handleDragStart(index, 'member_favorite')"
                  @dragover="handleDragOver($event, index)"
                  @dragleave="handleDragLeave()"
                  @drop="handleDrop($event, index, 'member_favorite')"
                  @dragend="handleDragEnd()"
                  :class="[
                    'flex items-center space-x-3 p-2 rounded-lg transition-colors cursor-move',
                    track.is_duplicated
                      ? 'bg-gray-900/50 opacity-60'
                      : 'hover:bg-gray-700/50',
                    draggedIndex === index && 'opacity-50',
                    dragOverIndex === index && 'border-2 border-green-500'
                  ]"
                >
                  <!-- 序號 -->
                  <span :class="[
                    'text-sm font-medium w-8 flex-shrink-0 text-right',
                    track.is_duplicated ? 'text-gray-600' : 'text-gray-500'
                  ]">
                    {{ index + 1 }}
                  </span>

                  <!-- 專輯封面 -->
                  <div :class="[
                    'w-12 h-12 flex-shrink-0 bg-gray-700 rounded overflow-hidden',
                    track.is_duplicated && 'opacity-40'
                  ]">
                    <img
                      v-if="track.image_url"
                      :src="track.image_url"
                      :alt="track.name"
                      class="w-full h-full object-cover"
                      @error="(e) => (e.target as HTMLImageElement).src = ''"
                    />
                    <div v-else class="w-full h-full flex items-center justify-center">
                      <svg class="w-6 h-6 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z"/>
                      </svg>
                    </div>
                  </div>

                  <!-- 歌曲資訊 -->
                  <div class="flex-1 min-w-0">
                    <p :class="[
                      'text-sm font-medium truncate',
                      track.is_duplicated
                        ? 'text-gray-500 line-through'
                        : 'text-white'
                    ]">
                      {{ track.name }}
                    </p>
                    <p :class="[
                      'text-xs truncate',
                      track.is_duplicated ? 'text-gray-600' : 'text-gray-400'
                    ]">
                      {{ Array.isArray(track.artists) ? track.artists.join(', ') : track.artists }}
                    </p>
                  </div>

                  <!-- 重複標籤 -->
                  <div v-if="track.is_duplicated" class="flex-shrink-0">
                    <span class="text-xs px-2 py-1 bg-yellow-900/40 text-yellow-400 rounded border border-yellow-500/30">
                      重複
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 導入按鈕 -->
            <div v-if="memberFavoriteValidated" class="flex space-x-3">
              <button
                @click="memberFavoriteValidated = false; memberFavoriteTracks = []; memberFavoriteValidationErrors = []; memberFavoriteIsValid = false"
                :disabled="isImporting"
                class="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
              >
                🔄 重新驗證
              </button>
              <button
                @click="handlePlaylistImport('member_favorite')"
                :disabled="isImporting || !memberFavoriteIsValid"
                :class="[
                  'flex-1 py-3 font-semibold rounded-lg transition-colors',
                  !memberFavoriteIsValid
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                ]"
              >
                <span v-if="isImporting" class="flex items-center justify-center">
                  <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  導入中...
                </span>
                <span v-else>✓ 完成設定</span>
              </button>
            </div>
          </div>
        </div>

        <!-- 步驟 6: 完成畫面 -->
        <div v-if="currentStep === 6" class="bg-gray-900 rounded-lg p-6 fade-element success-completion" data-delay="600">
          <div class="text-center py-8">
            <!-- 成功動畫圖示 -->
            <div class="text-green-500 mb-6 success-icon-container">
              <div class="success-checkmark">
                <svg class="w-20 h-20 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
              </div>
            </div>

            <!-- 成功標題 -->
            <h4 class="text-3xl font-bold text-white mb-4 success-title">
              🎉 所有設定完成！
            </h4>

            <!-- 成功訊息 -->
            <div class="bg-green-900/40 border border-green-500/60 rounded-lg p-6 mb-6 success-message">
              <p class="text-green-200 text-lg font-semibold mb-3">
                太棒了！您已經完成所有必要設定
              </p>
              <p class="text-gray-100 text-sm leading-relaxed">
                我們已成功導入您的 Spotify 播放清單，請靜待實驗人員後續的通知！
              </p>
            </div>

            <!-- 完成提示 -->
            <div class="text-gray-200 text-sm">
              <p>您可以關閉此頁面了</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
// import { useRouter } from 'vue-router'
import { loginUser, getSpotifyAuthUrl, getSpotifyToken, validatePlaylist, importPlaylist, cachePlaylistOrder, getAccessToken, checkPlaylist, RESPONSE_CODE, redirectToSpotifyReauth } from '@/services/api'
import ParticleBackground from '@/components/ParticleBackground.vue'
import { setCurrentUserEmail, setUserData, USER_DATA_KEYS } from '@/utils/userStorage'

// const router = useRouter()

// 響應式狀態
const currentStep = ref(1)
const email = ref('')
const isLoading = ref(false)
const showEmailFormatError = ref(false)
const showParticleBackground = ref(false)
const discoverWeeklyId = ref('')
const memberFavoriteId = ref('')

// 播放清單驗證狀態
const discoverWeeklyValidated = ref(false)
const memberFavoriteValidated = ref(false)
const discoverWeeklyTracks = ref<any[]>([])
const memberFavoriteTracks = ref<any[]>([])
const discoverWeeklyValidationErrors = ref<string[]>([])
const memberFavoriteValidationErrors = ref<string[]>([])
const discoverWeeklyIsValid = ref(false)
const memberFavoriteIsValid = ref(false)
const isValidating = ref(false)
const isImporting = ref(false)

// 驗證節流控制（每 10 秒只能驗證一次）
const lastValidateTime = ref<number>(0)
const VALIDATE_THROTTLE_MS = 0 // 暫時設為 0 秒，之後改為 10000 (10 秒)

// Toast 通知
const toastMessage = ref<string>('')
const toastType = ref<'info' | 'error'>('info')

// 拖曳狀態
const draggedIndex = ref<number | null>(null)
const dragOverIndex = ref<number | null>(null)

// 顯示 Toast 訊息
const showToast = (message: string, duration: number = 3000, type: 'info' | 'error' = 'info') => {
  toastMessage.value = message
  toastType.value = type

  setTimeout(() => {
    toastMessage.value = ''
  }, duration)
}

// 檢查是否可以進行驗證（節流檢查）
const canValidate = (): { allowed: boolean; remainingTime?: number } => {
  const now = Date.now()
  const timeSinceLastValidate = now - lastValidateTime.value

  if (timeSinceLastValidate < VALIDATE_THROTTLE_MS) {
    const remainingTime = Math.ceil((VALIDATE_THROTTLE_MS - timeSinceLastValidate) / 1000)
    return { allowed: false, remainingTime }
  }

  return { allowed: true }
}





// Email 格式驗證
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// 處理 Email 登入
const handleEmailLogin = async () => {
  if (!email.value) return
  
  // 先驗證 email 格式
  if (!validateEmail(email.value)) {
    showEmailFormatError.value = true
    return
  }
  
  // 清除格式錯誤提示
  showEmailFormatError.value = false
  
  isLoading.value = true
  
  try {
    const response = await loginUser(email.value)

    if (response.code === 2000) {
      // 儲存用戶資訊和 token
      setCurrentUserEmail(email.value)
      setUserData(USER_DATA_KEYS.ACCESS_TOKEN, response.data.access_token)
      setUserData(USER_DATA_KEYS.REFRESH_TOKEN, response.data.refresh_token)

      // 設定標識，表示這是從 pre-auth 頁面開始的授權
      setUserData(USER_DATA_KEYS.FROM_PRE_AUTH, true)

      // 登入成功後，先檢查是否已有 Spotify token
      // skipReauth=true：token 無效時不跳轉，直接往下走 OAuth 流程
      try {
        console.log('Checking if Spotify token already exists...')
        const tokenResponse = await getSpotifyToken(true)

        if (tokenResponse.code === RESPONSE_CODE.SUCCESS && tokenResponse.data &&
            (tokenResponse.data.access_token || tokenResponse.data.spotify_access_token)) {
          // 已經有 token，不需要重新授權，直接檢查步驟完成狀態
          console.log('Spotify token already exists, skipping authorization')
          await checkStepCompletion()
          return
        }

        // token 無效或不存在，進行 Spotify 授權
        console.log('No valid Spotify token found, starting authorization...')
      } catch (tokenCheckError) {
        console.log('Token check error, proceeding with authorization:', tokenCheckError)
      }

      // 獲取 Spotify 授權 URL
      try {
        const authResponse = await getSpotifyAuthUrl()

        if (authResponse.code === 2000 || authResponse.code === 200) {
          const authUrl = authResponse.data.spotify_authorize_url

          if (authUrl) {
            // 自動跳轉到 Spotify 授權頁面
            window.location.href = authUrl
            return // 跳轉後不需要執行後面的程式碼
          } else {
            throw new Error('授權 URL 為空')
          }
        } else {
          throw new Error(authResponse.msg || '無法獲取授權連結')
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : '無法獲取 Spotify 授權連結'
        showToast(errorMsg, 3000, 'error')
        isLoading.value = false
        return
      }

      // 如果沒有自動跳轉，進入步驟 2（手動授權）
      currentStep.value = 2

      // 確保 isLoading 被重置
      isLoading.value = false
    } else {
      throw new Error(response.msg || '登入失敗')
    }
  } catch (error) {
    if (error instanceof Error && error.message === 'REAUTH_REDIRECT') return
    const errorMsg = error instanceof Error ? error.message : '登入失敗，請檢查 Email 地址'
    showToast(errorMsg, 3000, 'error')
    isLoading.value = false
  }
}



// 提取純粹的播放清單 ID（移除 URL 和查詢參數）
const extractPlaylistId = (input: string): string => {
  // 移除前後空白
  let id = input.trim()

  // 如果是完整 URL，提取 ID
  if (id.includes('spotify.com/playlist/')) {
    const match = id.match(/playlist\/([a-zA-Z0-9]+)/)
    if (match && match[1]) {
      id = match[1]
    }
  }

  // 移除查詢參數（?si=xxx 等）
  const questionMarkIndex = id.indexOf('?')
  if (questionMarkIndex !== -1) {
    id = id.substring(0, questionMarkIndex)
  }

  return id
}

// 檢查播放清單是否有重複歌曲
const hasDuplicates = (tracks: any[]): boolean => {
  return tracks.some(track => track.is_duplicated === true)
}

// 計算可用歌曲數量（非重複的歌曲）
const getValidTracksCount = (tracks: any[]): number => {
  return tracks.filter(track => !track.is_duplicated).length
}

// 拖曳處理函數
const handleDragStart = (index: number, _type: 'discover_weekly' | 'member_favorite') => {
  draggedIndex.value = index
}

const handleDragOver = (event: DragEvent, index: number) => {
  event.preventDefault()
  dragOverIndex.value = index
}

const handleDragLeave = () => {
  dragOverIndex.value = null
}

const handleDrop = (event: DragEvent, index: number, type: 'discover_weekly' | 'member_favorite') => {
  event.preventDefault()

  if (draggedIndex.value === null || draggedIndex.value === index) {
    draggedIndex.value = null
    dragOverIndex.value = null
    return
  }

  const tracks = type === 'discover_weekly' ? discoverWeeklyTracks.value : memberFavoriteTracks.value
  const newTracks = [...tracks]
  const draggedItem = newTracks[draggedIndex.value]

  // 移除被拖曳的項目
  newTracks.splice(draggedIndex.value, 1)
  // 插入到新位置
  newTracks.splice(index, 0, draggedItem)

  if (type === 'discover_weekly') {
    discoverWeeklyTracks.value = newTracks
  } else {
    memberFavoriteTracks.value = newTracks
  }

  draggedIndex.value = null
  dragOverIndex.value = null
}

const handleDragEnd = () => {
  draggedIndex.value = null
  dragOverIndex.value = null
}

// 驗證播放清單
const handlePlaylistValidate = async (type: 'discover_weekly' | 'member_favorite') => {
  // 檢查節流限制
  const throttleCheck = canValidate()
  if (!throttleCheck.allowed) {
    showToast(`請稍候 ${throttleCheck.remainingTime} 秒後再試`, 3000, 'error')
    return
  }

  const rawInput = type === 'discover_weekly' ? discoverWeeklyId.value : memberFavoriteId.value

  if (!rawInput) {
    showToast('請輸入播放清單 ID 或連結', 3000, 'error')
    return
  }

  // 提取純粹的播放清單 ID
  const playlistId = extractPlaylistId(rawInput)

  if (!playlistId) {
    showToast('無法識別播放清單 ID，請檢查輸入格式', 3000, 'error')
    return
  }

  isValidating.value = true

  try {
    // 更新最後驗證時間
    lastValidateTime.value = Date.now()

    const validateResponse = await validatePlaylist(playlistId, type)

    if (validateResponse.code !== 2000 && validateResponse.code !== 200) {
      // 構建錯誤訊息，如果有 details 就顯示
      let errorMsg = validateResponse.msg || '播放清單驗證失敗'
      if (validateResponse.details) {
        errorMsg += `\n詳細資訊：${JSON.stringify(validateResponse.details)}`
      }
      throw new Error(errorMsg)
    }

    // 儲存歌曲列表和驗證結果
    const tracks = validateResponse.data.tracks || []
    const validationErrors = validateResponse.data.validation_errors || []
    const isValid = validateResponse.data.is_valid !== undefined ? validateResponse.data.is_valid : false

    if (type === 'discover_weekly') {
      discoverWeeklyValidated.value = true
      discoverWeeklyTracks.value = tracks
      discoverWeeklyValidationErrors.value = validationErrors
      discoverWeeklyIsValid.value = isValid
    } else {
      memberFavoriteValidated.value = true
      memberFavoriteTracks.value = tracks
      memberFavoriteValidationErrors.value = validationErrors
      memberFavoriteIsValid.value = isValid
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : '驗證播放清單時發生錯誤'
    showToast(errorMsg, 5000, 'error')
  } finally {
    isValidating.value = false
  }
}

// 導入播放清單
const handlePlaylistImport = async (type: 'discover_weekly' | 'member_favorite') => {
  const rawInput = type === 'discover_weekly' ? discoverWeeklyId.value : memberFavoriteId.value
  const playlistId = extractPlaylistId(rawInput)

  if (!playlistId) {
    showToast('無法識別播放清單 ID', 3000, 'error')
    return
  }

  isImporting.value = true

  try {
    // 第一步：取得非重複歌曲的 track_ids
    const tracks = type === 'discover_weekly' ? discoverWeeklyTracks.value : memberFavoriteTracks.value
    const validTrackIds = tracks
      .filter(track => !track.is_duplicated)
      .map(track => track.external_id)

    // 第二步：先調用 cache-order API 設定順序
    const cacheResponse = await cachePlaylistOrder(type, validTrackIds)

    if (cacheResponse.code !== 2000 && cacheResponse.code !== 200) {
      let errorMsg = cacheResponse.msg || '快取播放清單順序失敗'
      if (cacheResponse.details) {
        errorMsg += `\n詳細資訊：${JSON.stringify(cacheResponse.details)}`
      }
      throw new Error(errorMsg)
    }

    // 第三步：調用 import API 導入
    const importResponse = await importPlaylist(playlistId, type)

    if (importResponse.code !== 2000 && importResponse.code !== 200) {
      // 構建錯誤訊息，如果有 details 就顯示
      let errorMsg = importResponse.msg || '播放清單導入失敗'
      if (importResponse.details) {
        errorMsg += `\n詳細資訊：${JSON.stringify(importResponse.details)}`
      }
      throw new Error(errorMsg)
    }

    // 根據類型進入下一步驟
    if (type === 'discover_weekly') {
      // 每週新發現(Discover Weekly) 完成，進入 Member Favorite
      showToast('每週新發現(Discover Weekly) 播放清單導入成功！', 2000, 'info')
      currentStep.value = 5

      // 重置狀態
      discoverWeeklyValidated.value = false
      discoverWeeklyTracks.value = []
      discoverWeeklyValidationErrors.value = []
      discoverWeeklyIsValid.value = false

      // 等待 DOM 更新後觸發淡入動畫
      await nextTick()
      setTimeout(() => {
        const fadeElements = document.querySelectorAll('.fade-element')
        fadeElements.forEach((element) => {
          element.classList.remove('fade-in')
          const delay = parseInt(element.getAttribute('data-delay') || '0')
          setTimeout(() => {
            element.classList.add('fade-in')
          }, delay)
        })
      }, 50)
    } else {
      // Member Favorite 完成，顯示完成畫面
      showToast('所有播放清單導入完成！', 2000, 'info')
      currentStep.value = 6

      // 重置狀態
      memberFavoriteValidated.value = false
      memberFavoriteTracks.value = []
      memberFavoriteValidationErrors.value = []
      memberFavoriteIsValid.value = false

    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : '導入播放清單時發生錯誤'
    showToast(errorMsg, 5000, 'error')
  } finally {
    isImporting.value = false
  }
}

// 處理歌單滾動，防止觸發外部滾動
const handlePlaylistScroll = (event: WheelEvent) => {
  const target = event.currentTarget as HTMLElement
  const { scrollTop, scrollHeight, clientHeight } = target
  const isScrollingDown = event.deltaY > 0
  const isScrollingUp = event.deltaY < 0

  // 如果向下滾動且已經到底部，或向上滾動且已經到頂部，阻止事件傳播
  if ((isScrollingDown && scrollTop + clientHeight >= scrollHeight) ||
      (isScrollingUp && scrollTop === 0)) {
    event.preventDefault()
  }

  // 阻止事件冒泡到外部容器
  event.stopPropagation()
}




// 開始 Spotify 授權流程
const startSpotifyAuth = async () => {
  try {
    // 設置標識，表示這是從 pre-auth 頁面開始的授權
    setUserData(USER_DATA_KEYS.FROM_PRE_AUTH, true)
    
    isLoading.value = true
    
    // 獲取 Spotify 授權 URL
    const authResponse = await getSpotifyAuthUrl()
    
    if (authResponse.code === 2000 || authResponse.code === 200) {
      const authUrl = authResponse.data.spotify_authorize_url
      
      if (authUrl) {
        // 直接跳轉到 Spotify 授權頁面
        window.location.href = authUrl
      } else {
        throw new Error('授權 URL 為空')
      }
    } else {
      throw new Error(authResponse.msg || '無法獲取授權連結')
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : '無法開始 Spotify 授權流程'
    showToast(errorMsg, 3000, 'error')
    isLoading.value = false
  }
  // 注意：使用 window.location.href 跳轉時，整個頁面會重新載入
  // 所以不需要手動重置 loading 狀態
}

// 處理 Spotify OAuth 回調 (未使用，保留以備後用)
// const handleSpotifyCallback = async () => {
//   const code = route.query.code as string
//   const state = route.query.state as string

//   if (!code) {
//     currentStep.value = 2
//     showToast('未收到授權碼，請重新授權', 3000, 'error')
//     return
//   }

//   try {
//     // 調用後端 API 處理授權碼
//     const response = await processSpotifyAuthCode(code, state)

//     if (response.code === 2000 || response.code === 200) {
//       // 授權成功，進入驗證步驟
//       currentStep.value = 3
//       verifyAuthStatus()
//     } else {
//       throw new Error(response.msg || 'Spotify 授權失敗')
//     }
//   } catch (error) {
//     currentStep.value = 2
//     const errorMsg = error instanceof Error ? error.message : '處理 Spotify 授權時發生錯誤'
//     showToast(errorMsg, 3000, 'error')
//   }
// }



// 檢查步驟完成狀態
const checkStepCompletion = async () => {
  try {
    // 檢查是否有 access token（步驟 1 完成）
    const accessToken = getAccessToken()
    console.log('Access token check:', accessToken ? 'exists' : 'not found')
    if (!accessToken) {
      currentStep.value = 1
      return
    }

    // 檢查是否有 Spotify token（步驟 2 完成）
    // 改為調用 API 檢查，而不是從 sessionStorage 檢查
    let hasSpotifyToken = false
    try {
      const tokenResponse = await getSpotifyToken()

      if (tokenResponse.code === RESPONSE_CODE.REAUTH_REQUIRED) {
        console.warn('Reauth required, redirecting to Spotify OAuth...')
        redirectToSpotifyReauth()
        return
      }

      hasSpotifyToken = !!(tokenResponse.code === RESPONSE_CODE.SUCCESS &&
                        tokenResponse.data &&
                        (tokenResponse.data.access_token || tokenResponse.data.spotify_access_token))
      console.log('Spotify token API check:', tokenResponse, 'hasSpotifyToken:', hasSpotifyToken)
    } catch (error) {
      if (error instanceof Error && error.message === 'REAUTH_REDIRECT') throw error
      console.log('Spotify token check error:', error)
      hasSpotifyToken = false
    }

    if (!hasSpotifyToken) {
      currentStep.value = 2
      return
    }

    // 一次檢查兩個播放清單是否已導入
    let hasDiscoverWeekly = false
    let hasMemberFavorite = false

    try {
      const playlistsCheck = await checkPlaylist('member_favorite,discover_weekly')
      console.log('Playlists check:', playlistsCheck)

      if (playlistsCheck.code === 2000 && Array.isArray(playlistsCheck.data)) {
        // 根據 type 分別處理
        playlistsCheck.data.forEach((playlist: any) => {
          if (playlist.type === 'discover_weekly' && playlist.playlist_tracks && playlist.playlist_tracks.length > 0) {
            hasDiscoverWeekly = true
          } else if (playlist.type === 'member_favorite' && playlist.playlist_tracks && playlist.playlist_tracks.length > 0) {
            hasMemberFavorite = true
          }
        })
      }

      console.log('hasDiscoverWeekly:', hasDiscoverWeekly, 'hasMemberFavorite:', hasMemberFavorite)
    } catch (error) {
      console.log('Playlists check error:', error)
      hasDiscoverWeekly = false
      hasMemberFavorite = false
    }

    // 根據完成狀態決定當前步驟
    if (hasMemberFavorite && hasDiscoverWeekly) {
      // 兩個都完成，顯示完成畫面
      currentStep.value = 6
    } else if (hasDiscoverWeekly) {
      // 每週新發現(Discover Weekly) 完成，進入 Member Favorite
      currentStep.value = 5
    } else {
      // 都未完成，進入 每週新發現(Discover Weekly)
      currentStep.value = 4
    }

    console.log('Final step:', currentStep.value)

    // 等待 DOM 更新後觸發淡入動畫
    await nextTick()
    // 需要等待一小段時間確保 DOM 完全渲染
    setTimeout(() => {
      const fadeElements = document.querySelectorAll('.fade-element')
      fadeElements.forEach((element) => {
        // 先移除 fade-in class，然後重新添加以觸發動畫
        element.classList.remove('fade-in')
        const delay = parseInt(element.getAttribute('data-delay') || '0')
        setTimeout(() => {
          element.classList.add('fade-in')
        }, delay)
      })
    }, 50)
  } catch (error) {
    if (error instanceof Error && error.message === 'REAUTH_REDIRECT') return
    console.error('檢查步驟完成狀態時發生錯誤:', error)
    currentStep.value = 1
  }
}

// 組件生命週期
onMounted(async () => {
  // 添加淡入動畫
  await nextTick()
  const fadeElements = document.querySelectorAll('.fade-element')
  fadeElements.forEach((element) => {
    const delay = parseInt(element.getAttribute('data-delay') || '0')
    setTimeout(() => {
      element.classList.add('fade-in')
    }, delay)
  })

  // 檢查是否已登入
  const accessToken = getAccessToken()
  if (accessToken) {
    // 已登入，檢查步驟完成狀態（包括 Spotify 授權）
    await checkStepCompletion()
  }
  // 未登入則保持在步驟 1（currentStep 的初始值）

  // 等待所有組件載入完畢後，再顯示粒子背景
  setTimeout(() => {
    showParticleBackground.value = true
  }, 1000) // 延遲 1 秒確保所有組件都已載入
})
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

/* 按鈕特效 */
button {
  transition: all 0.2s ease;
}

button:hover:not(:disabled) {
  transform: scale(1.02);
}

button:active:not(:disabled) {
  transform: scale(0.98);
}

/* 輸入框特效 */
input:focus {
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
}

/* Placeholder 和輸入內容置中 */
input::placeholder {
  text-align: center;
}

input {
  text-align: center;
}

/* 步驟指示器動畫 */
.w-8.h-8 {
  transition: all 0.3s ease;
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

/* 自訂滾動條樣式 */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(31, 41, 55, 0.5);
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(16, 185, 129, 0.5);
  border-radius: 3px;
  transition: background 0.2s;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(16, 185, 129, 0.7);
}

/* Email 提示對話框動畫 */
.email-tooltip {
  animation: tooltipSlideIn 0.3s ease-out;
}

@keyframes tooltipSlideIn {
  from {
    opacity: 0;
    transform: translateY(-10px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* 成功完成特效 */
.success-completion {
  animation: successSlideIn 0.8s ease-out;
  background: rgba(16, 185, 129, 0.1);
  border: 2px solid rgba(16, 185, 129, 0.3);
  border-radius: 12px;
  padding: 20px;
  position: relative;
  z-index: 10;
  margin-top: 20px;
  /* 強制顯示 */
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
}

@keyframes successSlideIn {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.success-icon-container {
  position: relative;
  display: inline-block;
}

.success-checkmark {
  animation: checkmarkBounce 0.8s ease-out 0.3s both;
  filter: drop-shadow(0 0 20px rgba(16, 185, 129, 0.6));
}

@keyframes checkmarkBounce {
  0% {
    transform: scale(0) rotate(-45deg);
    opacity: 0;
  }
  50% {
    transform: scale(1.3) rotate(0deg);
  }
  70% {
    transform: scale(0.9) rotate(0deg);
  }
  100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
}

.celebration-particles {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 120px;
  height: 120px;
  pointer-events: none;
  z-index: 5;
}

.particle {
  position: absolute;
  width: 8px;
  height: 8px;
  background: #10B981;
  border-radius: 50%;
  box-shadow: 0 0 8px rgba(16, 185, 129, 0.8);
  animation: particleFloat 1.5s ease-out infinite;
  animation-delay: calc(var(--i) * 0.1s);
  z-index: 6;
}

@keyframes particleFloat {
  0% {
    opacity: 0;
    transform: scale(0);
  }
  50% {
    opacity: 1;
    transform: scale(1);
  }
  100% {
    opacity: 0;
    transform: scale(0);
  }
}

/* 為每個粒子設定不同的位置 */
.particle:nth-child(1) { top: 20%; left: 50%; }
.particle:nth-child(2) { top: 30%; left: 70%; }
.particle:nth-child(3) { top: 50%; left: 80%; }
.particle:nth-child(4) { top: 70%; left: 70%; }
.particle:nth-child(5) { top: 80%; left: 50%; }
.particle:nth-child(6) { top: 70%; left: 30%; }
.particle:nth-child(7) { top: 50%; left: 20%; }
.particle:nth-child(8) { top: 30%; left: 30%; }
.particle:nth-child(9) { top: 40%; left: 40%; }
.particle:nth-child(10) { top: 60%; left: 60%; }
.particle:nth-child(11) { top: 40%; left: 60%; }
.particle:nth-child(12) { top: 60%; left: 40%; }

.success-title {
  animation: titleGlow 2s ease-in-out infinite alternate;
  position: relative;
}

.success-title::before {
  content: '';
  position: absolute;
  top: -10px;
  left: -10px;
  right: -10px;
  bottom: -10px;
  background: radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%);
  border-radius: 20px;
  z-index: 0;
}

@keyframes titleGlow {
  from {
    text-shadow: 0 0 10px rgba(16, 185, 129, 0.5), 0 0 20px rgba(16, 185, 129, 0.3);
    transform: scale(1);
  }
  to {
    text-shadow: 0 0 20px rgba(16, 185, 129, 0.8), 0 0 30px rgba(16, 185, 129, 0.6), 0 0 40px rgba(16, 185, 129, 0.4);
    transform: scale(1.02);
  }
}

.success-message {
  animation: messageSlideIn 0.6s ease-out 0.5s both;
}

.next-steps {
  animation: messageSlideIn 0.6s ease-out 0.7s both;
}

@keyframes messageSlideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* 按鈕特效 */
.success-completion button {
  animation: buttonSlideIn 0.6s ease-out 0.9s both;
}

@keyframes buttonSlideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
