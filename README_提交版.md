# 智能旅行规划软件

## 项目提交信息

**GitHub仓库地址**: https://github.com/your-username/ai-travel-planner

**项目简介**: 基于AI的智能旅行规划软件，支持语音输入和自动行程规划

## 核心功能

1. **智能行程规划**: AI自动生成个性化旅行路线
2. **语音识别**: 支持语音输入旅行需求
3. **费用管理**: 实时记录和分析旅行支出
4. **用户系统**: 完整的注册登录和数据管理

## 技术栈

- **后端**: Python Flask + SQLAlchemy
- **前端**: React + TypeScript + Tailwind CSS
- **数据库**: PostgreSQL
- **AI服务**: 阿里云百炼平台
- **部署**: Docker + GitHub Actions

## 快速部署

```bash
# 1. 克隆项目
git clone https://github.com/your-username/ai-travel-planner.git
cd ai-travel-planner

# 2. 配置环境变量
cp .env.example .env
# 编辑.env文件，添加API密钥

# 3. 启动服务
docker-compose up -d

# 4. 访问应用
# 前端: http://localhost:3000
# 后端: http://localhost:5000
```

## API密钥配置

请在.env文件中配置以下API密钥：

```env
# 阿里云百炼平台API密钥 (3个月内有效)
ALIBABA_CLOUD_API_KEY=your_api_key_here
ALIBABA_CLOUD_API_SECRET=your_api_secret_here

# 数据库配置
DATABASE_URL=postgresql://user:password@localhost:5432/travel_planner

# JWT密钥
JWT_SECRET_KEY=your_jwt_secret_here
```

## Docker镜像

项目已配置GitHub Actions自动构建Docker镜像并推送到阿里云容器镜像仓库：

- **后端镜像**: registry.cn-hangzhou.aliyuncs.com/namespace/ai-travel-planner-backend:latest
- **前端镜像**: registry.cn-hangzhou.aliyuncs.com/namespace/ai-travel-planner-frontend:latest
- **完整应用**: registry.cn-hangzhou.aliyuncs.com/namespace/ai-travel-planner:latest

## 功能演示

1. **语音输入**: 点击麦克风按钮，说出旅行需求，系统自动解析并填入表单
2. **AI规划**: 填写基本信息后，AI自动生成详细的行程安排
3. **费用管理**: 实时记录旅行支出，预算控制和统计分析
4. **用户管理**: 注册登录，个人信息管理，云端数据同步

## 项目特色

- 🎤 创新的语音输入功能
- 🤖 基于AI的智能行程规划
- 💰 完整的费用管理系统
- 📱 响应式设计，适配各种设备
- 🐳 Docker容器化部署
- 🔄 GitHub Actions自动化构建

## 开发记录

项目保持了详细的Git提交记录，包含：
- 项目基础结构搭建
- 后端API服务开发
- 前端React应用开发
- 语音识别和AI服务集成
- Docker和CI/CD配置
- 文档和测试完善

## 联系方式

如有问题，请通过GitHub Issues反馈：
https://github.com/your-username/ai-travel-planner/issues

---

**项目地址**: https://github.com/your-username/ai-travel-planner  
**提交日期**: 2024年1月1日  
**版本**: v1.0.0
