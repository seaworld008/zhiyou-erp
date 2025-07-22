# 🏭 志友ERP管理系统

<div align="center">

![Vue.js](https://img.shields.io/badge/Vue.js-3.0+-4FC08D?style=flat-square&logo=vue.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Element Plus](https://img.shields.io/badge/Element%20Plus-2.0+-409EFF?style=flat-square&logo=element&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5.0+-646CFF?style=flat-square&logo=vite&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

**现代化工业ERP/MES管理系统前端**

[在线预览](https://your-demo-link.com) · [功能文档](./docs) · [部署指南](./DEPLOYMENT_GUIDE.md) · [问题反馈](https://github.com/seaworld008/zhiyou-erp/issues)

</div>

## 📖 项目简介

志友ERP管理系统是一套完整的现代化工业ERP/MES解决方案，专为制造业企业设计。系统涵盖生产管理、品质控制、设备监控、库存管理、绩效分析等核心业务流程，提供直观的数据可视化和高效的操作体验。

### ✨ 核心特性

- 🎯 **工业级设计** - 专为制造业场景优化的界面和交互
- 📊 **实时数据** - 生产数据实时监控和统计分析
- 🔄 **流程管控** - SOP标准作业程序数字化管理
- 📱 **响应式设计** - 支持PC、平板、手机多端访问
- 🎨 **多主题支持** - Light/Dark/Factory三套主题
- 🔐 **权限管理** - 基于角色的细粒度权限控制
- 🌐 **国际化** - 支持多语言切换
- ⚡ **高性能** - 基于Vue 3 + Vite的现代化技术栈

## 🔧 技术栈

### 前端核心
- **Vue 3.4+** - 采用Composition API的渐进式框架
- **TypeScript 5.0+** - 提供完整的类型安全保障
- **Element Plus 2.8+** - 企业级Vue 3组件库
- **Vite 5.0+** - 极速的前端构建工具
- **Pinia** - Vue 3官方推荐的状态管理库

### 开发工具
- **ESLint + Prettier** - 代码质量和格式化工具
- **Playwright** - 端到端自动化测试
- **Vitest** - 基于Vite的单元测试框架
- **SCSS** - CSS预处理器

### 数据可视化
- **ECharts 5** - 丰富的图表组件库
- **自定义图表** - 针对工业场景的专业图表

## 🚀 快速开始

### 环境要求

- **Node.js** >= 20.0.0
- **npm** >= 9.0.0 或 **yarn** >= 1.22.0
- **现代浏览器** (支持ES2020+)

### 安装部署

```bash
# 克隆项目
git clone https://github.com/seaworld008/zhiyou-erp.git
cd zhiyou-erp

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

### 默认账号

```
用户名: erp
密码:   123456
```

## 📁 项目结构

```
zhiyou-erp-admin/
├── public/                 # 静态资源
├── src/
│   ├── api/               # API接口
│   ├── assets/            # 资源文件
│   ├── components/        # 公共组件
│   │   ├── icons/         # 图标组件
│   │   └── ...
│   ├── layouts/           # 布局组件
│   ├── mock/              # Mock数据
│   ├── router/            # 路由配置
│   ├── stores/            # 状态管理
│   ├── styles/            # 样式文件
│   ├── types/             # TypeScript类型定义
│   ├── views/             # 页面组件
│   └── main.ts            # 应用入口
├── e2e/                   # E2E测试
├── docs/                  # 项目文档
└── dist/                  # 构建输出
```

## 🎯 功能模块

### 📊 数据仪表盘
- **KPI指标卡片** - 实时显示关键业绩指标
- **生产趋势图** - 产量、效率、质量趋势分析
- **工位状态监控** - 实时监控生产线工位状态
- **异常告警** - 甜甜圈图展示异常分布
- **待办事项** - 个人和团队任务管理

### 🔧 SOP管理
- **SOP列表** - 标准作业程序文档管理
- **SOP详情** - 支持图片、视频、文档预览
- **SOP播放** - 分步骤引导式操作界面
- **SOP接收** - 员工SOP培训和确认记录

### 📈 绩效管理
- **今日业绩** - 员工当日工作成果统计
- **工时汇报** - 详细的工时记录和审批
- **计件统计** - 基于产量的绩效计算

### 👥 考勤管理
- **考勤记录** - 员工打卡记录查询和管理
- **排班管理** - 灵活的排班计划和调整
- **考勤审批** - 请假、调休等审批流程

### 🔍 品质管理
- **异常管理** - 质量问题记录和跟踪
- **质量抽检** - 检验计划和结果记录
- **返修管理** - 不良品返修流程管理

### ⚙️ 设备管理
- **设备台账** - 设备基础信息管理
- **设备点检** - 定期检查和维护记录
- **OEE分析** - 设备综合效率分析

### 📦 库存管理
- **库存总览** - 实时库存状态和预警
- **出入库** - 物料进出库操作记录

### 🏭 生产管理
- **生产订单** - 订单计划和执行跟踪
- **计件管理** - 员工计件工资核算

### 🚨 Andon系统
- **异常呼叫** - 生产线异常快速响应
- **状态监控** - Andon看板实时状态

### 📱 系统管理
- **用户管理** - 用户账号和权限管理
- **消息中心** - 系统通知和消息推送
- **系统参数** - 系统配置参数管理
- **系统日志** - 操作日志查询和审计
- **报表中心** - 各类业务报表生成

### 🎛️ 工位看板
- **实时监控** - 工位状态实时显示
- **多视图切换** - 网格视图和列表视图
- **数据筛选** - 按状态、部门等条件筛选
- **自动刷新** - 数据自动更新机制

## 🎨 主题系统

系统提供三套完整的主题方案：

- **🌞 Light主题** - 经典明亮风格，适合办公环境
- **🌙 Dark主题** - 护眼暗色风格，适合长时间使用
- **🏭 Factory主题** - 工业风格设计，突出制造业特色

## 📱 响应式设计

- **桌面端** (1200px+) - 完整功能体验
- **平板端** (768px-1199px) - 优化的触控体验
- **手机端** (< 768px) - 移动优先的精简界面

## 🧪 测试

```bash
# 运行单元测试
npm run test:unit

# 运行E2E测试
npm run test:e2e

# 测试覆盖率
npm run test:coverage
```

## 📦 构建部署

```bash
# 生产构建
npm run build

# 类型检查
npm run type-check

# 代码检查
npm run lint

# 格式化代码
npm run format
```

## 🔧 开发指南

### 代码规范
- 使用 **ESLint** 进行代码质量检查
- 使用 **Prettier** 进行代码格式化
- 遵循 **Vue 3 Composition API** 最佳实践
- 使用 **TypeScript** 严格模式

### 提交规范
```bash
feat: 新功能
fix: 修复bug
docs: 文档更新
style: 代码格式调整
refactor: 代码重构
test: 测试相关
chore: 构建过程或辅助工具的变动
```

### 组件开发
- 组件命名使用 **PascalCase**
- 使用 **<script setup>** 语法
- 完整的 **TypeScript** 类型定义
- 响应式设计优先

## 🤝 贡献指南

1. **Fork** 本仓库
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的修改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启一个 **Pull Request**

## 📄 许可证

本项目基于 [MIT License](LICENSE) 开源协议。

## 🙏 致谢

- [Vue.js](https://vuejs.org/) - 渐进式JavaScript框架
- [Element Plus](https://element-plus.org/) - Vue 3组件库
- [ECharts](https://echarts.apache.org/) - 数据可视化图表库
- [Vite](https://vitejs.dev/) - 下一代前端工具链

## 📞 联系我们

- **GitHub Issues**: [问题反馈](https://github.com/seaworld008/zhiyou-erp/issues)
- **Email**: seaworld008@example.com
- **项目主页**: [https://github.com/seaworld008/zhiyou-erp](https://github.com/seaworld008/zhiyou-erp)

---

<div align="center">

**⭐ 如果这个项目对你有帮助，请给一个Star支持一下！ ⭐**

Made with ❤️ by [seaworld008](https://github.com/seaworld008)

</div>
