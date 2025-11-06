@echo off
REM AI Travel Planner 启动脚本 (Windows)

echo =========================================
echo AI 旅行规划师 - 启动脚本
echo =========================================

REM 检查 Docker 是否安装
where docker >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo 错误: 未找到 Docker，请先安装 Docker Desktop
    exit /b 1
)

REM 检查 Docker Compose 是否安装
where docker-compose >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo 错误: 未找到 Docker Compose，请先安装 Docker Compose
    exit /b 1
)

REM 创建配置目录
if not exist "config" (
    echo 创建配置目录...
    mkdir config
)

REM 构建镜像
echo 构建 Docker 镜像...
docker-compose build

REM 启动容器
echo 启动容器...
docker-compose up -d

REM 等待服务启动
echo 等待服务启动...
timeout /t 5 /nobreak >nul

REM 检查服务状态
docker-compose ps | findstr "Up" >nul
if %ERRORLEVEL% EQU 0 (
    echo.
    echo =========================================
    echo 服务启动成功！
    echo =========================================
    echo 访问地址: http://localhost:3000
    echo.
    echo 下一步：
    echo 1. 访问 http://localhost:3000
    echo 2. 注册账号并登录
    echo 3. 进入设置页面配置 API 密钥
    echo.
    echo 查看日志: docker-compose logs -f
    echo 停止服务: docker-compose down
) else (
    echo 服务启动失败，请查看日志: docker-compose logs
    exit /b 1
)

pause

