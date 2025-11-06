# Docker 镜像构建和导出指南

## 构建 Docker 镜像

```bash
# 使用 docker-compose 构建
docker-compose build

# 或者直接使用 docker build
docker build -t ai-travel-planner:latest .
```

## 导出 Docker 镜像

### 方法1: 使用 docker save（推荐）

```bash
# 导出为 tar 文件
docker save ai-travel-planner_ai-travel-planner:latest -o ai-travel-planner.tar

# 或者导出为压缩文件（更小）
docker save ai-travel-planner_ai-travel-planner:latest | gzip > ai-travel-planner.tar.gz
```

### 方法2: 使用 docker-compose 构建后导出

```bash
# 1. 构建镜像
docker-compose build

# 2. 查看镜像名称
docker images | grep ai-travel-planner

# 3. 导出镜像（替换为实际的镜像名称）
docker save <image-name> -o ai-travel-planner.tar
```

## 导入和运行 Docker 镜像

### 导入镜像

```bash
# 从 tar 文件导入
docker load -i ai-travel-planner.tar

# 或者从压缩文件导入
gunzip -c ai-travel-planner.tar.gz | docker load
```

### 运行容器

```bash
# 使用 docker-compose（推荐）
docker-compose up -d

# 或者直接使用 docker run
docker run -d \
  -p 3000:3000 \
  -v $(pwd)/config:/app/config \
  --name ai-travel-planner \
  ai-travel-planner:latest
```

## 验证运行

```bash
# 查看容器状态
docker ps

# 查看日志
docker-compose logs -f

# 访问应用
curl http://localhost:3000/api/health
```

## 镜像大小优化

如果需要减小镜像大小，可以考虑：

1. 使用多阶段构建（已在 Dockerfile 中实现）
2. 清理不必要的文件
3. 使用 Alpine Linux 基础镜像

## 注意事项

1. 确保 `config` 目录存在且可写
2. 首次运行前需要在设置页面配置 API 密钥
3. 确保 Supabase 数据库表已创建（执行 `database/schema.sql`）

