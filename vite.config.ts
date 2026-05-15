import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 載入環境變數
  const env = loadEnv(mode, resolve(__dirname, 'env'), '')

  return {
  // 將環境變數注入到客戶端代碼
  define: {
    'import.meta.env.WALRUS_API_BASE_URL': JSON.stringify(env.WALRUS_API_BASE_URL || 'http://localhost:8000'),
    'import.meta.env.ENV': JSON.stringify(env.ENV || mode),
    'import.meta.env.APP_TITLE': JSON.stringify(env.APP_TITLE || 'Heron')
  },
  plugins: [
    vue(),
    AutoImport({
      imports: [
        'vue',
        'vue-router',
        'pinia',
        '@vueuse/core'
      ],
      dts: true,
      vueTemplate: true
    }),
    Components({
      dts: true
    })
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  optimizeDeps: {
    include: ['three']
  },
  server: {
    port: 3000,
    open: false,
    host: true // 允許外部訪問
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router', 'pinia'],
          utils: ['@vueuse/core', 'axios'],
          three: ['three']
        }
      }
    }
  }
  }
})
