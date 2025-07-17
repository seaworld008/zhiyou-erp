# 志友ERP管理后台

这是一个基于Vue 3 + TypeScript + Naive UI开发的现代化ERP管理系统。

## 技术栈

- **Vue 3** - 渐进式JavaScript框架
- **TypeScript** - 类型安全的JavaScript超集
- **Naive UI** - 现代化Vue 3组件库
- **Vite** - 现代化前端构建工具
- **Pinia** - Vue 3状态管理库
- **Vue Router** - Vue.js官方路由管理器

## 功能特性

### 已实现功能
- 🔐 用户登录认证
- 📊 数据统计仪表板
- 👥 用户管理
- 🎨 主题切换（明/暗模式）
- 📱 响应式设计

### 规划功能
- 🛒 采购管理
- 💰 销售管理
- 📦 库存管理
- 💼 财务管理
- 📋 订单管理
- 🏢 供应商管理
- 👤 客户管理

## 快速开始

### 环境要求
- Node.js >= 18
- npm >= 9

### 安装依赖
```bash
npm install
```

### 开发运行
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
```

### 预览生产版本
```bash
npm run preview
```

## 登录信息

- 用户名：`erp`
- 密码：`123456`

## 项目结构

```
src/
├── api/                # API接口
├── assets/            # 静态资源
├── components/        # 公共组件
├── layouts/          # 布局组件
├── router/           # 路由配置
├── stores/           # Pinia状态管理
├── styles/           # 全局样式
├── types/            # TypeScript类型定义
├── utils/            # 工具函数
└── views/            # 页面组件
```

## 开发规范

- 使用TypeScript进行类型安全开发
- 遵循Vue 3 Composition API最佳实践
- 使用ESLint + Prettier进行代码规范
- 组件采用单文件组件（SFC）格式
- 样式使用CSS变量进行主题管理

## 浏览器支持

- Chrome >= 87
- Firefox >= 78
- Safari >= 14
- Edge >= 88

## License

MIT License

