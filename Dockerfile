# 第一階段：構建
FROM node:18-alpine AS builder

WORKDIR /app

# 複製 package files
COPY package*.json ./

# 安裝依賴
RUN npm ci

# 複製源代碼
COPY . .

# 接收構建參數
ARG WALRUS_API_BASE_URL=https://lab3-walrus.ddns.net
ARG ENV=staging
ARG APP_TITLE=Heron

# 設置環境變數供構建使用
ENV WALRUS_API_BASE_URL=${WALRUS_API_BASE_URL}
ENV ENV=${ENV}
ENV APP_TITLE=${APP_TITLE}

# 構建生產版本
RUN npm run build

# 第二階段：生產環境
FROM nginx:alpine

# 複製 nginx 配置
COPY nginx.conf /etc/nginx/nginx.conf

# 從構建階段複製編譯好的文件
COPY --from=builder /app/dist /usr/share/nginx/html

# 暴露端口
EXPOSE 80

# 健康檢查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/health || exit 1

# 啟動 nginx
CMD ["nginx", "-g", "daemon off;"]
