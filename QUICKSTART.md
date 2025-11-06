# 快速开始指南

## 5 分钟快速启动

### 步骤 1: 准备 Supabase

1. 访问 https://supabase.com 并创建账号
2. 创建新项目
3. 在 SQL Editor 中执行 `database/schema.sql`
4. 在 Project Settings > API 中复制：
   - Project URL
   - anon/public key

### 步骤 2: 获取 API 密钥

#### 必需：
- **阿里云通义千问**: https://dashscope.console.aliyun.com/
- **高德地图**: https://lbs.amap.com/
- **Supabase**: 已在步骤1获取

#### 可选：
- **科大讯飞**: https://www.xfyun.cn/ （语音识别功能）

### 步骤 3: 启动应用

```bash
# Linux/macOS
chmod +x start.sh
./start.sh

# Windows
start.bat
```

### 步骤 4: 配置 API 密钥

1. 访问 http://localhost:3000
2. 注册账号并登录
3. 点击右上角设置图标
4. 填入所有 API 密钥
5. 点击"保存配置"

### 步骤 5: 创建第一个旅行计划

1. 点击"新建计划"
2. 填写旅行信息：
   - 目的地：例如"日本东京"
   - 天数：5
   - 预算：10000
   - 同行人数：2
   - 偏好：例如"喜欢美食和动漫，带孩子"
3. 点击"生成旅行计划"
4. 等待 AI 生成计划（约 10-30 秒）
5. 查看生成的详细行程和地图

## 常见问题

### Q: 服务无法启动？
A: 检查 Docker 是否运行，查看日志：`docker-compose logs`

### Q: 地图不显示？
A: 检查高德地图 API Key 是否正确配置，确认已启用 Web 服务权限

### Q: AI 生成计划失败？
A: 检查阿里云 API Key 和 Secret，确认账户余额充足

### Q: 无法登录？
A: 检查 Supabase 配置是否正确，确认数据库表已创建

## 下一步

- 查看 [README.md](./README.md) 了解详细功能
- 查看 [BUILD.md](./BUILD.md) 了解如何导出 Docker 镜像
- 查看 [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) 了解项目结构

