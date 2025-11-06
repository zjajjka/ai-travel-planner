# 多阶段构建
# 阶段1: 构建前端
FROM node:18-alpine AS frontend-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install --legacy-peer-deps
COPY client/ ./
RUN npm run build

# 阶段2: 构建后端
FROM node:18-alpine AS backend-builder
WORKDIR /app/server
COPY server/package*.json ./
RUN npm install
COPY server/ ./
RUN npm run build

# 阶段3: 生产镜像
FROM node:18-alpine
WORKDIR /app

# 安装生产依赖
COPY server/package*.json ./server/
WORKDIR /app/server
RUN npm install --omit=dev

# 复制构建后的文件
COPY --from=backend-builder /app/server/dist ./dist
COPY --from=backend-builder /app/server/.env.example ./.env.example
COPY --from=frontend-builder /app/client/dist ./public

# 创建配置文件目录
RUN mkdir -p /app/config

WORKDIR /app/server

EXPOSE 3000

CMD ["node", "dist/index.js"]

