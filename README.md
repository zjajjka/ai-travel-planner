# 智能旅行规划软件 (AI Travel Planner)

## 项目简介

智能旅行规划软件旨在简化旅行规划过程，通过 AI 了解用户需求，自动生成详细的旅行路线和建议，并提供实时旅行辅助。

## 核心功能

1. **智能行程规划**: 用户可以通过语音或文字输入旅行目的地、日期、预算、同行人数、旅行偏好，AI 会自动生成个性化的旅行路线
2. **费用预算与管理**: AI 进行预算分析，记录旅行开销（支持语音输入）
3. **用户管理与数据存储**: 注册登录系统，云端行程同步

## 技术栈

- **后端**: Python Flask + SQLAlchemy
- **前端**: React + TypeScript + Tailwind CSS
- **数据库**: PostgreSQL
- **AI服务**: 阿里云百炼平台
- **语音识别**: Web Speech API + 阿里云语音服务
- **部署**: Docker + GitHub Actions

## 快速开始

### 环境要求

- Docker & Docker Compose
- Node.js 18+
- Python 3.9+

### 本地开发

1. 克隆项目
```bash
git clone https://github.com/your-username/ai-travel-planner.git
cd ai-travel-planner
```

2. 配置环境变量
```bash
cp .env.example .env
# 编辑 .env 文件，添加必要的API密钥
```

3. 启动服务
```bash
# 启动后端
cd backend
pip install -r requirements.txt
python app.py

# 启动前端
cd frontend
npm install
npm start
```

### Docker 部署

```bash
# 构建并启动所有服务
docker-compose up -d

# 访问应用
# 前端: http://localhost:3000
# 后端: http://localhost:5000
```

### 生产环境部署

```bash
# 构建完整应用镜像
docker build -t ai-travel-planner:latest .

# 运行应用
docker run -d -p 80:80 --env-file .env ai-travel-planner:latest
```

## API 密钥配置

请在 `.env` 文件中配置以下API密钥：

```env
# 阿里云百炼平台API密钥
ALIBABA_CLOUD_API_KEY=your_api_key_here
ALIBABA_CLOUD_API_SECRET=your_api_secret_here

# 数据库配置
DATABASE_URL=postgresql://user:password@localhost:5432/travel_planner

# JWT密钥
JWT_SECRET_KEY=your_jwt_secret_here
```

**注意**: 请勿将API密钥提交到代码仓库中，建议通过环境变量或配置文件管理。

## 项目结构

```
ai-travel-planner/
├── backend/                 # 后端服务
│   ├── app.py              # Flask应用入口
│   ├── models/             # 数据模型
│   ├── routes/             # API路由
│   ├── services/           # 业务逻辑
│   ├── Dockerfile          # 后端Docker配置
│   └── requirements.txt    # Python依赖
├── frontend/               # 前端应用
│   ├── src/                # 源代码
│   │   ├── components/     # React组件
│   │   ├── pages/          # 页面组件
│   │   ├── contexts/       # React上下文
│   │   └── App.tsx         # 主应用组件
│   ├── public/             # 静态资源
│   ├── Dockerfile          # 前端Docker配置
│   └── package.json        # Node.js依赖
├── .github/workflows/      # GitHub Actions配置
├── docker-compose.yml      # Docker编排文件
├── Dockerfile              # 完整应用Docker配置
├── nginx.conf              # Nginx配置
├── start.sh                # 启动脚本
└── README.md               # 项目文档
```

## 功能特性

- 🎤 **语音输入**: 支持语音输入旅行需求，自动解析并填入表单
- 🤖 **AI智能规划**: 基于阿里云百炼平台生成个性化旅行路线
- 💰 **费用管理**: 实时记录和分析旅行支出，预算控制
- 👤 **用户系统**: 完整的注册登录和个人信息管理
- ☁️ **数据同步**: 云端存储，多设备访问
- 📱 **响应式设计**: 适配各种设备屏幕
- 🐳 **容器化部署**: Docker支持，一键部署

## API 接口

### 认证接口
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/profile` - 获取用户信息
- `PUT /api/auth/profile` - 更新用户信息

### 旅行管理
- `GET /api/trips/` - 获取旅行列表
- `POST /api/trips/` - 创建新旅行
- `GET /api/trips/{id}` - 获取旅行详情
- `PUT /api/trips/{id}` - 更新旅行信息
- `DELETE /api/trips/{id}` - 删除旅行

### AI服务
- `POST /api/ai/plan` - 生成AI行程规划
- `POST /api/ai/speech-to-text` - 语音转文字
- `POST /api/ai/text-to-speech` - 文字转语音
- `POST /api/ai/analyze-expense` - 支出分析

## 部署说明

### GitHub Actions 自动部署

项目配置了GitHub Actions，支持自动构建和部署到阿里云容器镜像服务：

1. 推送代码到main分支触发自动构建
2. 自动构建Docker镜像
3. 推送到阿里云容器镜像仓库
4. 支持多环境部署

### 环境变量配置

生产环境需要配置以下环境变量：

```bash
# 阿里云百炼平台
ALIBABA_CLOUD_API_KEY=your_api_key
ALIBABA_CLOUD_API_SECRET=your_api_secret

# 数据库
DATABASE_URL=postgresql://user:password@host:port/database

# 应用配置
SECRET_KEY=your_secret_key
JWT_SECRET_KEY=your_jwt_secret
FLASK_ENV=production
```

## 开发指南

### 后端开发

```bash
cd backend
pip install -r requirements.txt
python app.py
```

### 前端开发

```bash
cd frontend
npm install
npm start
```

### 数据库迁移

```bash
cd backend
python -c "from app import db; db.create_all()"
```

## 测试

```bash
# 后端测试
cd backend
python -m pytest tests/

# 前端测试
cd frontend
npm test
```

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 许可证

MIT License

## 联系方式

- GitHub: [项目地址](https://github.com/your-username/ai-travel-planner)
- 问题反馈: [Issues](https://github.com/your-username/ai-travel-planner/issues)

## 更新日志

### v1.0.0 (2024-01-01)
- 初始版本发布
- 支持语音输入和AI行程规划
- 完整的用户管理和费用跟踪功能
- Docker容器化部署支持
