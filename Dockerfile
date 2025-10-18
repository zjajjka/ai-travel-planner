# 多阶段构建
FROM node:18-alpine AS frontend-build

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM python:3.9-slim AS backend-build

WORKDIR /app/backend

# 安装系统依赖
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    libpq-dev \
    portaudio19-dev \
    && rm -rf /var/lib/apt/lists/*

# 复制依赖文件
COPY backend/requirements.txt .

# 安装Python依赖
RUN pip install --no-cache-dir -r requirements.txt

# 复制后端代码
COPY backend/ .

# 生产阶段
FROM python:3.9-slim

WORKDIR /app

# 安装运行时依赖
RUN apt-get update && apt-get install -y \
    libpq-dev \
    portaudio19-dev \
    nginx \
    && rm -rf /var/lib/apt/lists/*

# 复制Python依赖
COPY --from=backend-build /usr/local/lib/python3.9/site-packages /usr/local/lib/python3.9/site-packages
COPY --from=backend-build /usr/local/bin /usr/local/bin

# 复制后端代码
COPY backend/ ./backend/

# 复制前端构建结果
COPY --from=frontend-build /app/frontend/build ./frontend/build

# 配置nginx
COPY nginx.conf /etc/nginx/nginx.conf

# 创建静态文件目录
RUN mkdir -p /app/static/audio

# 暴露端口
EXPOSE 80

# 启动脚本
COPY start.sh ./
RUN chmod +x start.sh

CMD ["./start.sh"]