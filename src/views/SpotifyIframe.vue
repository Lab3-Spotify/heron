<template>
  <div class="iframe-container">
    <iframe 
      :src="spotifyUrl" 
      ref="spotifyIframe"
      class="spotify-iframe"
      allowfullscreen
    ></iframe>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const spotifyUrl = ref('')

// 監聽來自 iframe 的消息
const handleMessage = (event: MessageEvent) => {
  if (event.data && event.data.type === 'spotify-callback') {
    console.log('Received message from iframe:', event.data)
    
    // 轉發消息給父頁面（彈出視窗的開啟者）
    if (window.opener) {
      window.opener.postMessage(event.data, '*')
      console.log('Message forwarded to opener')
    }
    
    // 強制關閉彈出視窗
    console.log('Attempting to close popup window...')
    setTimeout(() => {
      window.close()
      
      // 如果無法關閉，顯示提示
      setTimeout(() => {
        if (!window.closed) {
          document.body.innerHTML = `
            <div style="background: black; color: white; padding: 20px; text-align: center; height: 100vh; display: flex; flex-direction: column; justify-content: center;">
              <h2>授權完成！</h2>
              <p>請手動關閉此視窗</p>
              <button onclick="window.close()" style="background: #1DB954; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">關閉視窗</button>
            </div>
          `
        }
      }, 100)
    }, 100)
  }
}

onMounted(() => {
  // 從 URL 參數獲取 Spotify 授權 URL
  spotifyUrl.value = route.query.url as string || ''
  
  // 監聽來自 iframe 的消息
  window.addEventListener('message', handleMessage)
})
</script>

<style scoped>
.iframe-container {
  width: 100%;
  height: 100vh;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

.spotify-iframe {
  width: 100%;
  height: 100%;
  border: none;
}
</style>
