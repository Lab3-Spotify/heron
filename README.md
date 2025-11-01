# Vue 3 Frontend Application

一個現代化的 Vue 3 前端應用程式，使用 TypeScript、Tailwind CSS 和 Docker 部署。

## 🚀 特色功能

- ⚡ **Vue 3** - 使用 Composition API
- 🔷 **TypeScript** - 完整的型別支援
- 🎨 **Tailwind CSS** - Utility-first CSS 框架
- 📦 **Pinia** - 現代化狀態管理
- 🛣️ **Vue Router** - 單頁應用路由
- 🔧 **Vite** - 快速的建構工具
- 🐳 **Docker** - 容器化部署
- 🔍 **ESLint + Prettier** - 程式碼品質保證

## 📋 系統需求

- Node.js 18.0+
- npm 或 yarn
- Docker (用於容器化部署)

## 🛠️ 安裝與設定

### 1. 安裝依賴

```bash
npm install
```

### 2. 環境變數設定

根據你的環境需求，複製對應的環境變數檔案：

```bash
# Local 環境
cp env.local .env

# Staging 環境  
cp env.staging .env

# 或使用範例檔案
cp env.example .env
```

編輯對應的 `.env` 檔案，設定你的環境變數。

### 3. 啟動開發伺服器

```bash
# 預設開發模式
npm run dev

# Local 環境
npm run dev:local

# Staging 環境
npm run dev:staging
```

應用程式將在 http://localhost:3000 啟動。

## 🐳 Docker 部署

### 建構並啟動容器

```bash
# 預設開發環境
docker-compose up --build -d

# Local 環境 (http://localhost:3000)
docker-compose -f docker-compose.local.yml up --build -d

# Staging 環境 (http://localhost:8080)
docker-compose -f docker-compose.staging.yml up --build -d

# 查看執行狀態
docker-compose ps

# 查看日誌
docker-compose logs -f frontend
```

### 停止容器

```bash
docker-compose down
```

## 📝 可用指令

```bash
# 開發模式
npm run dev              # 預設開發模式
npm run dev:local        # Local 環境
npm run dev:staging      # Staging 環境

# 建構版本
npm run build            # 預設建構
npm run build:local      # Local 環境建構
npm run build:staging    # Staging 環境建構

# 預覽建構版本
npm run preview

# 程式碼檢查
npm run lint

# 格式化程式碼
npm run format
```

## 📁 專案結構

```
src/
├── components/     # 可重用組件
├── views/          # 頁面組件
├── router/         # 路由配置
├── stores/         # Pinia 狀態管理
├── types/          # TypeScript 型別定義
├── utils/          # 工具函數
│   ├── api.ts      # API 請求工具
│   └── index.ts    # 通用工具函數
├── App.vue         # 根組件
├── main.ts         # 應用程式入口
└── style.css       # 全域樣式
```

## 🔧 配置檔案

- `vite.config.ts` - Vite 建構配置
- `tailwind.config.js` - Tailwind CSS 配置
- `tsconfig.json` - TypeScript 配置
- `.eslintrc.cjs` - ESLint 配置
- `.prettierrc` - Prettier 配置
- `docker-compose.yml` - Docker Compose 配置
- `Dockerfile` - Docker 建構配置

## 🌐 API 整合

此專案已預配置 API 請求工具，位於 `src/utils/api.ts`。

### 使用範例

```typescript
import { apiGet, apiPost } from '@/utils/api'

// GET 請求
const fetchUsers = async () => {
  const response = await apiGet('/users')
  return response.data
}

// POST 請求
const createUser = async (userData: any) => {
  const response = await apiPost('/users', userData)
  return response.data
}
```

## 🎨 樣式系統

使用 Tailwind CSS 進行樣式設計，並在 `src/style.css` 中定義了一些常用的組件類別：

- `.btn` - 基礎按鈕樣式
- `.btn-primary` - 主要按鈕樣式
- `.btn-secondary` - 次要按鈕樣式

## 📱 響應式設計

專案採用行動優先的響應式設計，支援各種螢幕尺寸。

## 🚀 部署到生產環境

1. 建構生產版本：
   ```bash
   npm run build
   ```

2. 使用 Docker 部署：
   ```bash
   docker-compose -f docker-compose.yml up -d
   ```

## 🤝 貢獻指南

1. Fork 此專案
2. 建立功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交變更 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 開啟 Pull Request

## 📄 授權

此專案使用 MIT 授權 - 查看 [LICENSE](LICENSE) 檔案了解詳情。