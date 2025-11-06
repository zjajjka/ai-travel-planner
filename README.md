# AI 旅行规划师 (AI Travel Planner)

一个基于 AI 的智能旅行规划 Web 应用，通过语音输入和自然语言处理，自动生成个性化的旅行路线和详细建议。

## 功能特性

### 核心功能

1. **智能行程规划**
   - 支持语音输入和文本输入
   - AI 自动生成详细的旅行路线
   - 包含交通、住宿、景点、餐厅等完整信息
   - 基于用户偏好（美食、动漫、带孩子等）个性化定制

2. **费用预算与管理**
   - AI 智能预算分析
   - 详细的费用分类（交通、住宿、餐饮、景点等）
   - 实时费用跟踪

3. **用户管理与数据存储**
   - 用户注册登录系统
   - 云端行程同步
   - 多设备访问支持
   - 多份旅行计划管理

4. **地图可视化**
   - 基于高德地图的交互式地图
   - 行程地点标记
   - 地理位置服务

## 技术栈

### 前端
- React 18 + TypeScript
- Vite
- Tailwind CSS
- React Router
- 高德地图 API

### 后端
- Node.js + Express
- TypeScript
- Supabase (认证和数据库)

### AI 服务
- 阿里云通义千问 (大语言模型)
- 科大讯飞 (语音识别)

### 地图服务
- 高德地图 API

## 项目结构

```
.
├── client/                 # 前端应用
│   ├── src/
│   │   ├── pages/         # 页面组件
│   │   ├── components/    # 通用组件
│   │   └── contexts/      # React Context
│   └── package.json
├── server/                # 后端服务
│   ├── src/
│   │   ├── routes/        # API 路由
│   │   └── utils/         # 工具函数
│   └── package.json
├── database/              # 数据库脚本
│   └── schema.sql
├── config/                # 配置文件目录（挂载到容器）
├── Dockerfile
├── docker-compose.yml
└── README.md
```

## 快速开始

### 前置要求

- Docker 和 Docker Compose
- Supabase 账号（用于数据库和认证）
- 以下 API 密钥：
  - 阿里云通义千问 API Key
  - 高德地图 API Key
  - 科大讯飞 API Key（可选）
  - Supabase Project URL 和 Anon Key

### 1. 克隆项目

```bash
git clone <repository-url>
cd ai-travel-planner
```

### 2. 设置 Supabase

1. 在 [Supabase](https://supabase.com) 创建新项目
2. 在 SQL Editor 中执行 `database/schema.sql` 创建数据表
3. 获取 Project URL 和 Anon Key

### 3. 构建和运行 Docker 容器

#### 方法1: 使用启动脚本（推荐）

**Linux/macOS:**
```bash
chmod +x start.sh
./start.sh
```

**Windows:**
```cmd
start.bat
```

#### 方法2: 手动运行

```bash
# 构建镜像
docker-compose build

# 启动容器
docker-compose up -d

# 查看日志
docker-compose logs -f
```

### 4. 配置 API 密钥

应用启动后，访问 `http://localhost:3000`，注册账号并登录。

然后进入 **设置页面** (`/settings`)，配置以下 API 密钥：

#### 必需配置

1. **阿里云通义千问**
   - API Key: 您的阿里云 API Key
   - API Secret: 您的阿里云 API Secret
   - Endpoint: `https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation`

2. **高德地图**
   - API Key: 您的高德地图 API Key

3. **Supabase**
   - Project URL: 您的 Supabase 项目 URL
   - Anon Key: 您的 Supabase Anon Key

#### 可选配置

4. **科大讯飞语音识别**（可选）
   - App ID
   - API Key
   - API Secret

### 5. 使用应用

1. 注册/登录账号
2. 点击"新建计划"
3. 输入旅行需求（目的地、天数、预算等）
4. 点击"生成旅行计划"
5. 查看 AI 生成的详细行程和地图

## 配置说明

### 环境变量（可选）

您也可以通过环境变量配置 API 密钥，在 `docker-compose.yml` 中添加：

```yaml
environment:
  - ALIYUN_API_KEY=your_key
  - ALIYUN_API_SECRET=your_secret
  - AMAP_KEY=your_key
  - SUPABASE_URL=your_url
  - SUPABASE_ANON_KEY=your_key
```

### 配置文件方式（推荐）

API 密钥会保存在 `/app/config/api-keys.json`（容器内），通过 Docker volume 挂载到 `./config` 目录。

**注意**：配置文件包含敏感信息，请确保：
- 不要将 `config/api-keys.json` 提交到 Git
- 在生产环境中使用适当的文件权限

## API 密钥获取指南

### 阿里云通义千问

1. 访问 [阿里云 DashScope](https://dashscope.console.aliyun.com/)
2. 开通通义千问服务
3. 创建 API Key
4. 获取 API Key 和 API Secret

### 高德地图

1. 访问 [高德开放平台](https://lbs.amap.com/)
2. 注册/登录账号
3. 创建应用
4. 获取 Web 服务 API Key

### 科大讯飞

1. 访问 [科大讯飞开放平台](https://www.xfyun.cn/)
2. 注册/登录账号
3. 创建应用（选择语音识别服务）
4. 获取 App ID、API Key 和 API Secret

### Supabase

1. 访问 [Supabase](https://supabase.com)
2. 创建新项目
3. 在 Project Settings > API 中获取：
   - Project URL
   - anon/public key

## 开发模式

### 本地开发（不使用 Docker）

```bash
# 安装依赖
npm run install:all

# 启动开发服务器（前端 + 后端）
npm run dev

# 前端开发服务器: http://localhost:5173
# 后端 API 服务器: http://localhost:3000
```

### 仅构建前端

```bash
cd client
npm install
npm run build
```

### 仅构建后端

```bash
cd server
npm install
npm run build
```

## Docker 镜像导出

### 构建并导出镜像

```bash
# 构建镜像
docker-compose build

# 导出镜像为 tar 文件
docker save ai-travel-planner-ai-travel-planner:latest -o ai-travel-planner.tar

# 或者使用 gzip 压缩
docker save ai-travel-planner-ai-travel-planner:latest | gzip > ai-travel-planner.tar.gz
```

### 导入并运行镜像

```bash
# 导入镜像
docker load -i ai-travel-planner.tar

# 或者从压缩文件导入
gunzip -c ai-travel-planner.tar.gz | docker load

# 运行容器
docker-compose up -d
```

## 故障排除

### 常见问题

1. **无法连接 Supabase**
   - 检查 Supabase 项目 URL 和 Anon Key 是否正确
   - 确认数据库表已创建（执行 `database/schema.sql`）
   - 检查网络连接

2. **AI 生成计划失败**
   - 检查阿里云 API Key 和 Secret 是否正确
   - 确认账户余额充足
   - 查看服务器日志：`docker-compose logs server`

3. **地图不显示**
   - 检查高德地图 API Key 是否正确
   - 确认 API Key 已启用 Web 服务权限
   - 检查浏览器控制台错误信息

4. **语音识别不工作**
   - 科大讯飞 API 为可选功能
   - 可以继续使用文本输入

### 查看日志

```bash
# 查看所有服务日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f ai-travel-planner
```

## 安全注意事项

1. **API 密钥安全**
   - 所有 API 密钥存储在服务器端，不会暴露在前端代码中
   - 配置文件通过 Docker volume 挂载，便于管理
   - 生产环境建议使用环境变量或密钥管理服务

2. **数据库安全**
   - Supabase 使用行级安全策略（RLS）
   - 用户只能访问自己的数据
   - 使用 HTTPS 连接

3. **生产部署**
   - 使用反向代理（如 Nginx）
   - 启用 HTTPS
   - 配置防火墙规则
   - 定期更新依赖包

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！

## 联系方式

如有问题或建议，请通过 Issue 联系。

