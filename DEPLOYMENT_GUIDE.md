# 志友ERP系统 - 部署与对接指南

## 📋 目录
- [项目概述](#项目概述)
- [技术栈](#技术栈)
- [快速启动](#快速启动)
- [开发环境搭建](#开发环境搭建)
- [生产环境部署](#生产环境部署)
- [后端API对接](#后端api对接)
- [配置说明](#配置说明)
- [测试指南](#测试指南)
- [故障排除](#故障排除)
- [性能优化](#性能优化)

---

## 🏭 项目概述

志友ERP是一个现代化的工业制造型ERP/MES前端管理系统，专为工厂生产环境设计。

### 核心特性
- ✅ **27个功能页面** - 完整的业务模块覆盖
- ✅ **工业级UI设计** - 3种主题(light/dark/factory)
- ✅ **响应式布局** - 支持桌面端、平板、手机
- ✅ **实时数据展示** - WebSocket + 自动刷新
- ✅ **完整权限系统** - 基于角色的访问控制
- ✅ **零编译错误** - 企业级代码质量

### 业务模块
1. **仪表盘** - KPI概览、实时图表、工位看板
2. **工序SOP** - 作业指导书管理、播放、接收确认
3. **绩效管理** - 工时、计件、业绩统计
4. **考勤管理** - 打卡记录、排班、审批
5. **品质管理** - 异常跟踪、抽检、返修
6. **设备管理** - 状态监控、点检、OEE分析
7. **库存管理** - 出入库、安全库存预警
8. **生产管理** - 工单、报工、物料需求
9. **Andon系统** - 异常呼叫、响应追踪
10. **消息中心** - 待办事项、系统通知
11. **报表中心** - 数据导出、定时报表
12. **系统管理** - 用户权限、参数配置、审计日志

---

## 🛠 技术栈

### 前端框架
- **Vue 3.5.17** - 组合式API + `<script setup>`
- **TypeScript 5.8** - 完整类型安全
- **Vite** - 现代化构建工具
- **Element Plus 2.10.4** - 企业级UI组件库

### 状态管理
- **Pinia 3.0.3** - 现代状态管理
- **Vue Router 4.5.1** - 路由管理

### 数据可视化
- **ECharts 5.5.0** - 图表库
- **自定义工业组件** - KPI卡片、进度条等

### 工具链
- **Axios 1.10.0** - HTTP客户端
- **dayjs 1.11.13** - 时间处理
- **vue-i18n 10.0.4** - 国际化(可选)

---

## ⚡ 快速启动

### 1. 环境要求
```bash
Node.js >= 18.0.0
npm >= 8.0.0 或 yarn >= 1.22.0
```

### 2. 安装依赖
```bash
cd zhiyou-erp-admin
npm install
```

### 3. 启动开发服务器
```bash
npm run dev
```
访问: http://localhost:5173

### 4. 默认登录信息
```
用户名: erp
密码: 123456
```

### 5. 构建生产版本
```bash
npm run build
```

---

## 🔧 开发环境搭建

### 1. 克隆项目
```bash
git clone <repository-url>
cd zhiyou-erp-admin
```

### 2. 环境配置
复制环境变量文件：
```bash
cp .env.example .env.local
```

编辑 `.env.local`：
```bash
# API基础URL
VITE_API_BASE_URL=http://localhost:8080/api

# WebSocket地址
VITE_WS_URL=ws://localhost:8080/ws

# 系统配置
VITE_APP_TITLE=志友ERP
VITE_DEFAULT_THEME=light

# 功能开关
VITE_ENABLE_MOCK=true
VITE_ENABLE_WEBSOCKET=true
VITE_ENABLE_I18N=false
```

### 3. 开发工具配置

#### VSCode推荐插件
```json
{
  "recommendations": [
    "Vue.volar",
    "Vue.vscode-typescript-vue-plugin",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint"
  ]
}
```

#### ESLint + Prettier 配置
项目已预配置，支持：
- TypeScript类型检查
- Vue 3组合式API规范
- 自动格式化

### 4. 开发模式特性
- ✅ **热重载** - 文件修改自动刷新
- ✅ **Mock数据** - 完整的模拟数据系统
- ✅ **类型检查** - 实时TypeScript验证
- ✅ **错误提示** - 详细的开发者错误信息

---

## 🚀 生产环境部署

### 1. 构建配置

#### 环境变量 (.env.production)
```bash
VITE_API_BASE_URL=https://your-api-domain.com/api
VITE_WS_URL=wss://your-api-domain.com/ws
VITE_APP_TITLE=志友ERP生产系统
VITE_DEFAULT_THEME=factory
VITE_ENABLE_MOCK=false
VITE_ENABLE_WEBSOCKET=true
```

#### 构建命令
```bash
# 安装依赖
npm ci --only=production

# 构建
npm run build

# 输出目录: dist/
```

### 2. Nginx配置

#### nginx.conf 示例
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/zhiyou-erp/dist;
    index index.html;

    # Gzip压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA路由支持
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API代理
    location /api {
        proxy_pass http://backend-server:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket代理
    location /ws {
        proxy_pass http://backend-server:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

### 3. Docker部署

#### Dockerfile
```dockerfile
# 构建阶段
FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

COPY . .
RUN npm run build

# 生产阶段
FROM nginx:alpine

# 复制构建产物
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制Nginx配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

#### docker-compose.yml
```yaml
version: '3.8'

services:
  zhiyou-erp-frontend:
    build: .
    ports:
      - "80:80"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
    networks:
      - erp-network

  # 后端服务（示例）
  zhiyou-erp-backend:
    image: your-backend-image:latest
    ports:
      - "8080:8080"
    environment:
      - SPRING_PROFILES_ACTIVE=prod
    restart: unless-stopped
    networks:
      - erp-network

networks:
  erp-network:
    driver: bridge
```

---

## 🔌 后端API对接

### 1. API规范

#### 统一响应格式
```typescript
interface ApiResponse<T = any> {
  code: number;        // 0=成功, 其他=错误码
  msg: string;         // 响应消息
  data: T;            // 响应数据
  traceId?: string;   // 链路追踪ID
}
```

#### 请求头设置
```typescript
{
  'Content-Type': 'application/json',
  'Authorization': 'Bearer <token>',
  'X-Tenant-Id': '<tenant_id>',     // 多租户支持
  'X-Request-Id': '<request_id>'    // 请求追踪
}
```

### 2. 认证授权接口

#### 登录接口
```typescript
POST /api/auth/login
{
  "username": "string",
  "password": "string",
  "captcha"?: "string"
}

// 响应
{
  "code": 0,
  "msg": "登录成功",
  "data": {
    "token": "jwt_token_string",
    "refreshToken": "refresh_token_string",
    "expires": 1640995200,
    "user": {
      "id": "string",
      "username": "string", 
      "name": "string",
      "avatar": "string",
      "roles": ["admin", "operator"],
      "permissions": ["dash:view", "sop:edit"]
    }
  }
}
```

#### 刷新令牌
```typescript
POST /api/auth/refresh
{
  "refreshToken": "string"
}
```

#### 获取用户菜单
```typescript
GET /api/auth/menus

// 响应
{
  "code": 0,
  "data": [
    {
      "id": "dash",
      "path": "/dashboard", 
      "name": "仪表盘",
      "icon": "ep:data-analysis",
      "children": [...]
    }
  ]
}
```

### 3. 核心业务接口

#### 仪表盘数据
```typescript
// KPI数据
GET /api/dashboard/kpis?date=2025-01-17

// 每小时产量
GET /api/dashboard/hourly-output?date=2025-01-17&shift=day

// 异常分布
GET /api/dashboard/abnormal?date=2025-01-17

// 工位状态
GET /api/dashboard/workstations
```

#### SOP管理
```typescript
// SOP列表
GET /api/sop/list?page=1&size=20&product_code=&process_code=

// SOP详情
GET /api/sop/{id}

// 创建SOP
POST /api/sop
{
  "product_code": "string",
  "process_code": "string", 
  "title": "string",
  "steps": [...],
  // ...其他字段
}

// 更新SOP
PUT /api/sop/{id}

// SOP接收确认
POST /api/sop/{id}/acknowledge
{
  "user_id": "string",
  "station_id": "string"
}
```

#### 绩效数据
```typescript
// 今日业绩
GET /api/performance/today?date=2025-01-17&dept_id=

// 工时记录
GET /api/performance/time-records?start_date=&end_date=&emp_id=
POST /api/performance/time-records

// 计件数据
GET /api/performance/piece-records?start_date=&end_date=&emp_id=
POST /api/performance/piece-records
```

#### 考勤管理
```typescript
// 打卡记录
GET /api/attendance/records?date=2025-01-17&emp_id=
POST /api/attendance/checkin
POST /api/attendance/checkout

// 排班表
GET /api/attendance/schedules?start_date=&end_date=&dept_id=
POST /api/attendance/schedules

// 异常审批
GET /api/attendance/approvals?status=pending
POST /api/attendance/approvals/{id}/approve
```

### 4. WebSocket实时数据

#### 连接建立
```typescript
// 连接URL
ws://your-domain.com/ws?token=<jwt_token>

// 消息格式
{
  "type": "dashboard_update" | "andon_alert" | "message_notify",
  "data": any,
  "timestamp": 1640995200
}
```

#### 订阅主题
```typescript
// 发送订阅消息
{
  "action": "subscribe",
  "topics": ["dashboard", "workstation", "andon"]
}

// 取消订阅
{
  "action": "unsubscribe", 
  "topics": ["dashboard"]
}
```

### 5. 文件上传接口

#### 图片/视频上传
```typescript
POST /api/upload/file
Content-Type: multipart/form-data

{
  "file": File,
  "type": "image" | "video" | "document",
  "module": "sop" | "quality" | "other"
}

// 响应
{
  "code": 0,
  "data": {
    "url": "https://your-domain.com/uploads/xxx.jpg",
    "filename": "original_name.jpg",
    "size": 1024000,
    "type": "image/jpeg"
  }
}
```

---

## ⚙️ 配置说明

### 1. 环境变量配置

#### 开发环境 (.env.development)
```bash
# API配置
VITE_API_BASE_URL=http://localhost:8080/api
VITE_WS_URL=ws://localhost:8080/ws

# 系统配置
VITE_APP_TITLE=志友ERP开发版
VITE_DEFAULT_THEME=light

# 功能开关
VITE_ENABLE_MOCK=true          # 启用Mock数据
VITE_ENABLE_WEBSOCKET=true     # 启用WebSocket
VITE_ENABLE_I18N=false         # 禁用国际化
VITE_ENABLE_DEVTOOLS=true      # 启用开发工具

# 性能配置
VITE_DASHBOARD_REFRESH=30000   # 仪表盘刷新间隔(ms)
VITE_WORKSTATION_REFRESH=10000 # 工位数据刷新间隔(ms)
```

#### 生产环境 (.env.production)
```bash
# API配置
VITE_API_BASE_URL=https://api.zhiyou-erp.com/api
VITE_WS_URL=wss://api.zhiyou-erp.com/ws

# 系统配置  
VITE_APP_TITLE=志友ERP生产系统
VITE_DEFAULT_THEME=factory

# 功能开关
VITE_ENABLE_MOCK=false
VITE_ENABLE_WEBSOCKET=true
VITE_ENABLE_I18N=true
VITE_ENABLE_DEVTOOLS=false

# 性能配置
VITE_DASHBOARD_REFRESH=30000
VITE_WORKSTATION_REFRESH=5000

# 安全配置
VITE_TOKEN_STORAGE_KEY=zhiyou_token
VITE_USER_INFO_KEY=zhiyou_user
VITE_SESSION_TIMEOUT=3600000   # 会话超时(ms)
```

### 2. 主题配置

#### 自定义主题
在 `src/styles/themes/` 下新建主题文件：

```scss
// custom-theme.scss
:root[data-theme="custom"] {
  // 主色调
  --color-primary: #your-color;
  --color-success: #your-color;
  --color-warning: #your-color;
  --color-danger: #your-color;
  
  // 背景色
  --bg-body: #your-color;
  --bg-card: #your-color;
  
  // 文字色
  --text-primary: #your-color;
  --text-secondary: #your-color;
  
  // 边框色
  --border-color: #your-color;
}
```

### 3. 权限配置

#### 角色权限示例
```typescript
// src/mock/user.ts
export const rolePermissions = {
  admin: [
    'dash:view', 'dash:workstation',
    'sop:view', 'sop:edit', 'sop:delete',
    'perf:view', 'perf:edit',
    'att:view', 'att:edit', 'att:approve',
    'sys:user', 'sys:param', 'sys:log'
  ],
  manager: [
    'dash:view', 'dash:workstation', 
    'sop:view', 'sop:edit',
    'perf:view', 'perf:edit',
    'att:view', 'att:approve'
  ],
  operator: [
    'dash:view',
    'sop:view', 'sop:ack', 'sop:play',
    'perf:today', 'perf:time', 'perf:piece',
    'att:record'
  ]
}
```

---

## 🧪 测试指南

### 1. 单元测试
```bash
# 运行单元测试
npm run test:unit

# 测试覆盖率
npm run test:unit -- --coverage
```

### 2. E2E测试
```bash
# 安装浏览器
npx playwright install

# 运行E2E测试
npm run test:e2e

# 交互式测试
npm run test:e2e -- --ui
```

### 3. 手动测试清单

#### 登录流程
- [ ] 正确用户名密码登录成功
- [ ] 错误凭据显示错误信息
- [ ] 记住密码功能
- [ ] 登出功能

#### 仪表盘
- [ ] KPI数据正确显示  
- [ ] 图表渲染正常
- [ ] 自动刷新功能
- [ ] 响应式布局

#### 各业务模块
- [ ] SOP管理：列表、详情、编辑、播放
- [ ] 绩效管理：今日业绩、工时、计件
- [ ] 考勤管理：记录、排班、审批
- [ ] 权限控制：菜单、按钮权限

#### 系统功能
- [ ] 主题切换：light/dark/factory
- [ ] 响应式：桌面/平板/手机
- [ ] 国际化：中英文切换(如启用)
- [ ] 错误处理：网络异常、权限不足

### 4. 性能测试

#### Lighthouse测试
```bash
# 安装lighthouse
npm install -g lighthouse

# 运行性能测试
lighthouse http://localhost:5173 --output html --output-path ./performance-report.html
```

目标指标：
- Performance: > 90
- Accessibility: > 95  
- Best Practices: > 90
- SEO: > 85

---

## 🔧 故障排除

### 1. 常见问题

#### 构建失败
```bash
# 清理缓存
rm -rf node_modules package-lock.json
npm install

# 检查Node版本
node --version  # 需要 >= 18.0.0
```

#### TypeScript错误
```bash
# 重新生成类型
npm run type-check

# 检查配置文件
cat tsconfig.json
```

#### 样式问题
```bash
# 检查SCSS编译
npm run build

# 清理样式缓存
rm -rf dist .vite
```

### 2. 开发服务器问题

#### 端口占用
```bash
# 查看端口占用
lsof -i :5173

# 杀死进程
kill -9 <PID>

# 使用其他端口
npm run dev -- --port 3000
```

#### 热重载失败
```bash
# 检查文件监听限制
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

### 3. 部署问题

#### Nginx 404错误
确保SPA路由配置正确：
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

#### API跨域问题
后端需要配置CORS：
```javascript
// Express.js示例
app.use(cors({
  origin: ['http://localhost:5173', 'https://your-domain.com'],
  credentials: true
}))
```

#### WebSocket连接失败
检查代理配置：
```nginx
location /ws {
    proxy_pass http://backend;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
}
```

---

## ⚡ 性能优化

### 1. 构建优化

#### Vite配置优化
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    // 代码分割
    rollupOptions: {
      output: {
        manualChunks: {
          vue: ['vue', 'vue-router', 'pinia'],
          element: ['element-plus'],
          charts: ['echarts'],
          utils: ['axios', 'dayjs']
        }
      }
    },
    // 压缩配置
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  }
})
```

### 2. 运行时优化

#### 路由懒加载
```typescript
// router/index.ts  
const routes = [
  {
    path: '/dashboard',
    component: () => import('../views/Dashboard.vue')
  }
]
```

#### 图片优化
```vue
<!-- 使用WebP格式 -->
<img 
  :src="webpUrl" 
  :fallback="jpegUrl"
  loading="lazy" 
/>
```

#### 缓存策略
```typescript
// API缓存
axios.get('/api/dashboard/kpis', {
  headers: {
    'Cache-Control': 'max-age=300' // 5分钟缓存
  }
})
```

### 3. 监控和分析

#### 性能监控
```typescript
// main.ts
if (import.meta.env.PROD) {
  // 性能监控SDK初始化
  performanceMonitor.init({
    appId: 'zhiyou-erp',
    version: '1.0.0'
  })
}
```

#### 错误监控
```typescript
// 全局错误处理
app.config.errorHandler = (error) => {
  console.error('全局错误:', error)
  // 发送到监控平台
  errorMonitor.report(error)
}
```

---

## 📞 技术支持

### 联系方式
- **技术文档**: 本文档
- **问题反馈**: 创建Issue
- **功能建议**: 提交Feature Request

### 开发团队
- **架构师**: AI Assistant
- **UI/UX**: 工业设计专家
- **前端**: Vue 3 + TypeScript专家
- **测试**: 自动化测试专家

---

## 📜 更新日志

### v1.0.0 (2025-01-17)
- ✅ 完成27个功能页面开发
- ✅ 实现3套主题系统
- ✅ 完成Element Plus迁移
- ✅ 零TypeScript编译错误
- ✅ 完整E2E测试覆盖
- ✅ 生产环境部署就绪

---

**🎉 项目已达到生产就绪状态，可立即对接后端API并投入使用！** 