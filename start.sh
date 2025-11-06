#!/bin/bash

# AI Travel Planner 启动脚本

echo "========================================="
echo "AI 旅行规划师 - 启动脚本"
echo "========================================="

# 检查 Docker 是否安装
if ! command -v docker &> /dev/null; then
    echo "错误: 未找到 Docker，请先安装 Docker"
    exit 1
fi

# 检查 Docker Compose 是否安装
if ! command -v docker-compose &> /dev/null; then
    echo "错误: 未找到 Docker Compose，请先安装 Docker Compose"
    exit 1
fi

# 创建配置目录
if [ ! -d "config" ]; then
    echo "创建配置目录..."
    mkdir -p config
    chmod 755 config
fi

# 构建镜像
echo "构建 Docker 镜像..."
docker-compose build

# 启动容器
echo "启动容器..."
docker-compose up -d

# 等待服务启动
echo "等待服务启动..."
sleep 5

# 检查服务状态
if docker-compose ps | grep -q "Up"; then
    echo ""
    echo "========================================="
    echo "服务启动成功！"
    echo "========================================="
    echo "访问地址: http://localhost:3000"
    echo ""
    echo "下一步："
    echo "1. 访问 http://localhost:3000"
    echo "2. 注册账号并登录"
    echo "3. 进入设置页面配置 API 密钥"
    echo ""
    echo "查看日志: docker-compose logs -f"
    echo "停止服务: docker-compose down"
else
    echo "服务启动失败，请查看日志: docker-compose logs"
    exit 1
fi

