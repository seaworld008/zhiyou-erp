# 志友ERP / Zhiyou ERP  
**工业制造型 ERP + MES + 工位看板 + 绩效 + 考勤 前端项目超级提示词（Super Prompt）**  
_角色设定：你（AI）是一名具有 20 年经验的全栈架构师 + UI/UX 设计师 + 工业软件（ERP/MES）专家。请根据本文档逐步输出代码、页面、接口封装与实现建议。_

---

## 快速使用指南

> **怎么用？**  
> 1. 把本文档粘贴给 Cursor / Claude Code。  
> 2. 先让 AI 输出【待确认问题】→ 你补充。  
> 3. 确认技术栈 → 生成【项目骨架】。  
> 4. 分阶段（仪表盘、SOP、绩效、考勤、品质等）逐步生成代码。  
> 5. 每个模块：先 UI Mock + 假数据 → 再对接真实接口。

---

## 目录

- [1. 项目背景 & 目标](#1-项目背景--目标)
- [2. 技术栈基线](#2-技术栈基线)
- [3. 环境占位符（请补全）](#3-环境占位符请补全)
- [4. 信息架构 / 导航树](#4-信息架构--导航树)
- [5. 仪表盘（酷炫工业风）](#5-仪表盘酷炫工业风)
- [6. 工序SOP 模块](#6-工序sop-模块)
- [7. 绩效模块](#7-绩效模块)
- [8. 考勤管理模块](#8-考勤管理模块)
- [9. 品质管理模块（建议）](#9-品质管理模块建议)
- [10. 设备与点检 / OEE（建议）](#10-设备与点检--oee建议)
- [11. 仓储 / 物料管理（建议）](#11-仓储--物料管理建议)
- [12. Andon 异常呼叫 & 消息中心](#12-andon-异常呼叫--消息中心)
- [13. 报表中心 & 导出](#13-报表中心--导出)
- [14. API 规范与封装](#14-api-规范与封装)
- [15. 权限模型](#15-权限模型)
- [16. 样式与主题规范](#16-样式与主题规范)
- [17. 组件库与复用约定](#17-组件库与复用约定)
- [18. 性能优化（工业现场适配）](#18-性能优化工业现场适配)
- [19. 安全合规](#19-安全合规)
- [20. 项目目录建议](#20-项目目录建议)
- [21. 分阶段实施计划](#21-分阶段实施计划)
- [22. 类型定义草稿](#22-类型定义草稿)
- [23. Mock 数据示例](#23-mock-数据示例)
- [24. 待确认问题（AI 第一步输出）](#24-待确认问题ai-第一步输出)
- [25. 下一步操作指令](#25-下一步操作指令)
- [附录：路由 JSON 草案](#附录路由-json-草案)

---

## 1. 项目背景 & 目标

我们已有 **登录功能**（token 可获取），登录后进入一个简陋仪表盘（当前版本截图-图4）。  
目标：升级为一个 **工业制造型 ERP/MES Web 管理系统**，包含以下场景：

- 工位看板（图1风格升级）
- 工序 SOP（图2）
- 绩效 / 工时 / 计件 / 工资（图3）
- 考勤管理
- 常见工业模块扩展：品质、设备、物料、Andon、报表、消息中心等
- UI 更酷炫：工业大屏、响应式、主题切换（亮 / 暗 / 工厂大屏）

系统名称：**志友ERP**（Zhiyou ERP）。  
使用接口拉取数据，前后端分离。

---

## 2. 技术栈基线

> 若现有项目不同，请 AI 生成兼容迁移方案。

| 层级 | 方案 | 说明 |
|------|------|------|
| 框架 | Vue 3 + Vite | 组合式 API / `<script setup>` |
| UI | Element Plus + 自定义工业卡片 | 丰富后台控件 + 可扩展样式 |
| 图表 | Apache ECharts | 柱状、环形、趋势、大屏炫图 |
| 状态管理 | Pinia | 用户、权限、主题、缓存 |
| 路由 | Vue Router 4 | 动态菜单 + 权限注入 |
| HTTP | Axios 封装 | token/错误/重试/加载 |
| 国际化 | vue-i18n | 中英文；默认中文 |
| 样式 | SCSS + CSS Vars | 主题切换 / 大屏字体放大 |
| 时间 | dayjs | 格式化 / 时区 |
| 构建 | Vite + env | 打包分环境 |
| Mock | vite-plugin-mock 或 msw | 开发阶段 |

---

## 3. 环境占位符（请补全）

在开始生成代码前，请 AI 提示我补充以下内容（缺失的用占位）：

```yaml
API_BASE_URL:       <<<http://api.example.com>>>
TOKEN_STORAGE_KEY:  <<<zhiyou_token>>>
USER_INFO_KEY:      <<<zhiyou_user>>>
DEFAULT_THEME:      light   # light | dark | factory
ENABLE_WEBSOCKET:   true
SUPPORT_OFFLINE:    true    # 是否缓存 SOP/工单
PERM_MODEL:         role_based # 或 data_scope
BUILD_TARGET:       web_kiosk | desktop_packaged | both
```

---

## 4. 信息架构 / 导航树

> 登录后根据角色动态加载菜单。下表列出建议模块。

### 导航概览

| 一级菜单 | 子菜单 | 简述 | 必选? | 权限示例 |
|----------|--------|------|-------|----------|
| 仪表盘 | 概览 | KPI 聚合 | ✅ | dash:view |
| 仪表盘 | 工位看板 | 班组/工位实时产量 | ✅ | dash:workstation |
| 仪表盘 | 产线总览 | 多线对比 | 推荐 | dash:line |
| 工序 / SOP | 工序SOP | 列表/编辑/版本 | ✅ | sop:view |
| 工序 / SOP | SOP接收 | 员工已阅记录 | ✅ | sop:ack |
| 工序 / SOP | SOP播放 | 全屏播放 | ✅ | sop:play |
| 生产管理 | 派工单 | 工单计划→完工 | ✅ | prod:order |
| 生产管理 | 工时报工 | 人/机工时 | ✅ | prod:time |
| 生产管理 | 计件录入 | 数量采集 | ✅ | prod:piece |
| 生产管理 | 缺料/补料 | 物料异常 | 推荐 | prod:material |
| 生产管理 | 停线/异常 | Andon 对接 | 推荐 | prod:andon |
| 品质管理 | 品质异常 | 不良录入 | 推荐 | qa:defect |
| 品质管理 | 抽检录入 | AQL 抽检 | 推荐 | qa:inspect |
| 品质管理 | 返修/追溯 | 可选 | qa:rework |
| 绩效 | 今日业绩 | 人/班组达成 | ✅ | perf:today |
| 绩效 | 工时汇报 | 时薪/加班 | ✅ | perf:time |
| 绩效 | 计件明细 | 数量单价 | ✅ | perf:piece |
| 绩效 | 绩效工资 | 汇总工资 | 推荐 | perf:salary |
| 考勤管理 | 打卡记录 | 日历/明细 | ✅ | att:record |
| 考勤管理 | 排班表 | 班次计划 | ✅ | att:schedule |
| 考勤管理 | 异常审批 | 补卡、加班 | 推荐 | att:approve |
| 设备 & 点检 | 设备列表 | 状态灯 | 建议 | eqp:list |
| 设备 & 点检 | 点检计划 | 点检任务 | 建议 | eqp:check |
| 设备 & 点检 | OEE分析 | MTTR/MTBF | 建议 | eqp:oee |
| 仓储 | 库存总览 | 安全库存 | 建议 | inv:stock |
| 仓储 | 收料/发料 | 流转 | 建议 | inv:io |
| 消息中心 | 待办 | 异常/审批 | 推荐 | msg:todo |
| 消息中心 | 系统通知 | WebSocket | 推荐 | msg:sys |
| 系统管理 | 用户角色 | 权限 | ✅ | sys:user |
| 系统管理 | 菜单权限 | 动态菜单 | ✅ | sys:menu |
| 系统管理 | 参数配置 | 工厂日历等 | ✅ | sys:param |
| 系统管理 | 审计日志 | 操作记录 | 推荐 | sys:log |

---

## 5. 仪表盘（酷炫工业风）

结合 **老版工位看板（图1）** + **当前简版仪表盘（图4）**，生成综合工业 KPI 大屏。

### 布局草图（栅格）

```
[TopBar] Logo | 系统名 | 班次选择 | 线别选择 | 搜索 | 主题切换 | 用户菜单
[Content Grid]
  Row1: KPI Cards (5~6个) 今日产量 / 工单数 / 达成率 / 不良率 / 在制WIP / 今日出货额
  Row2: 左=每小时产量柱状图; 右=异常环形图 (设备/物料/人员/其他/正常)
  Row3: 左=最近工单表; 右=今日待办（审批、补料、停线、质检）
  Row4: 全宽=工位实时状态跑马灯（头像+工位+工单+达成条）
```

### KPI 建议指标
- 今日总产量 (pcs)
- 今日工单数 / 待处理工单
- 达成率（实际 / 计划）
- 不良率（不良数 / 总数）
- 在制 WIP 数
- 库存预警（低于安全库存的物料数）

### 自动刷新
- 默认 30s（仪表盘）  
- 工位实时：10s  
- 用户可配置。

---

## 6. 工序SOP 模块

参考截图（图2菜单）。

### 功能
| 功能 | 描述 | 用户角色 |
|------|------|----------|
| SOP 列表 | 按产品/工序/版本过滤；分页 | 工艺员、工程师 |
| SOP 编辑 / 新建 | 富文本+步骤排序+图片/视频上传+标准工时 | 工艺工程师 |
| SOP 接收 | 员工扫码确认已阅（工位/班次记录） | 一线员工、班组长 |
| SOP 播放 | 全屏逐步播放，语音、定时滚动 | 培训/首件作业 |

### 数据模型（概要）
```ts
interface Sop { id:string; product_code:string; process_code:string; version:string; title:string;
  steps:SopStep[]; std_time_sec:number; tools:string[]; qc_points:string[]; safety_points:string[];
  attachments:SopAttachment[]; updated_at:string; updated_by:string; enabled:boolean; }
interface SopStep { seq:number; text:string; image?:string; video?:string; timer_sec?:number; }
interface SopAttachment { type:'image'|'video'|'pdf'|'other'; url:string; desc?:string; }
interface SopAck { sop_id:string; user_id:string; station_id?:string; version:string; ack_time:string; }
```

---

## 7. 绩效模块

整合计件、工时、品质扣款，生成绩效工资。

### 页面清单
- **今日业绩**（班组看板：人均产出、计划 vs 实际）
- **工时汇报**（人工、机台、加班；批量导入）
- **计件明细**（工序级计件；单价可配置）
- **品质异常扣分**（关联 QA 模块）
- **绩效工资核算**（公式 = 基础 + 计件 + 加班 - 扣款）

---

## 8. 考勤管理模块

### 功能点
- 打卡记录（刷卡、指纹、人脸、门禁、APP）
- 缺卡、迟到、早退、加班自动识别
- 补卡申请 → 审批流
- 排班表（日历视图 / 甘特视图）
- 月报导出（Excel）

### 数据草模
```ts
interface AttendanceRecord { emp_id:string; name:string; date:string; in_time?:string; out_time?:string; shift?:string; status:'normal'|'late'|'missing'|'leave'|'ot'; }
interface Shift { id:string; name:string; start:string; end:string; break_min?:number; }
```

---

## 9. 品质管理模块（建议）

- 品质异常（工位、产品、批次、类型、数量、图片）
- 抽检录入（AQL；判定放行/返工）
- 返修跟踪
- 合格率趋势图（按日/班/线）
- 不良 Pareto 图

---

## 10. 设备与点检 / OEE（建议）

- 设备主档（编号、型号、线别、状态）
- 点检计划（周期、点检项、责任人）
- 故障停机记录（开始、结束、原因、时长）
- OEE 分解：开动率、性能、良率
- MTTR / MTBF 报表

---

## 11. 仓储 / 物料管理（建议）

- 库存总览（可视化热区：低库存高亮）
- 收料入库、发料出库、移库
- 批次/条码追溯
- 安全库存 & 补货建议
- 批量导入（Excel）

---

## 12. Andon 异常呼叫 & 消息中心

**Andon 异常类型**：设备故障、物料缺失、人员缺勤、品质异常、其他。  
**消息中心**：订阅式（WebSocket）推送 → 顶栏红点提醒 → 待办列表。

---

## 13. 报表中心 & 导出

- 任意列表页：导出 CSV / Excel / PDF（服务端分页导出）
- 定时报表：每日班组产量邮件
- 图表截图导出 PNG（ECharts API）

---

## 14. API 规范与封装

### 通用返回结构
```ts
interface ApiResp<T = any> {
  code: number;         // 0=成功
  msg: string;
  data: T;
  traceId?: string;
}
```

### Axios 封装要点
- baseURL 来自环境变量
- 请求头自动附 token
- code ≠ 0 → 全局错误提示
- 401 → 刷新 token → 重试（一次）
- 可配置 showLoading、silent、mock

---

## 15. 权限模型

### 菜单 & 路由
```ts
interface MenuItem {
  id: string;
  parent_id?: string;
  path: string;          // '/dashboard'
  name: string;          // 'Dashboard'
  icon?: string;
  component?: string;    // 动态 import 路径
  hidden?: boolean;
  children?: MenuItem[];
  perms?: string[];      // ['dash:view']
  sort?: number;
}
```

### 权限指令
```vue
<el-button v-perm="'sop:edit'">编辑SOP</el-button>
```

---

## 16. 样式与主题规范

提供 3 套主题：**light / dark / factory**。

| 变量 | light | dark | factory(大屏) |
|------|-------|------|---------------|
| --color-primary | #409EFF | #3A84FF | #00D8FF |
| --color-success | #67C23A | #67C23A | #67C23A |
| --bg-body | #F5F7FA | #1E1E1E | #001B2E |
| --bg-card | #FFFFFF | #2B2B2B | rgba(0,27,46,.6) |
| --text-primary | #303133 | #E5EAF3 | #FFFFFF |
| 字号缩放 | 1x | 1x | 1.25x |

---

## 17. 组件库与复用约定

| 组件名 | 用途 | 说明 |
|--------|------|------|
| `<KpiCard>` | 数字卡片 | 支持增量动画、图标、同比 |
| `<HourlyBarChart>` | 每小时产量 | 可切班次 |
| `<AbnormalDonut>` | 异常分布 | 环形图 + legend |
| `<RecentWorkOrders>` | 最近工单列表 | 快捷跳转 |
| `<TodoPanel>` | 待办列表 | 优先级标识 |
| `<WorkstationTicker>` | 工位跑马灯 | 头像+工位+进度条 |
| `<ThemeSwitch>` | 主题切换 | light/dark/factory |
| `<FullscreenPanel>` | 全屏容器 | 大屏播放 |

---

## 18. 性能优化（工业现场适配）

- 仪表盘数据缓存（stale-while-revalidate）
- WebSocket 心跳断线重连
- 离线缓存 SOP（IndexedDB）
- 表格虚拟滚动 + 服务端分页
- 图表延迟渲染（进入视窗再加载）
- 扫码输入节流（<100ms）

---

## 19. 安全合规

- JWT + 刷新 token
- 用户登出清 token
- 接口签名（可选：timestamp + hmac）
- 数据导出权限分级（财务/人事/生产）
- 操作审计：写操作记录 user_id, ip, action, data_id

---

## 20. 项目目录建议

```text
├─ src/
│  ├─ api/                 # axios 封装 & 模块接口
│  ├─ assets/              # 静态资源
│  ├─ components/          # 通用组件(KpiCard/Charts/Perms)
│  ├─ composables/         # hooks (useTheme/usePaginatedTable/useWebsocket)
│  ├─ layouts/             # 基础布局（顶部/侧栏/标签页）
│  ├─ modules/
│  │   ├─ dashboard/
│  │   ├─ sop/
│  │   ├─ production/
│  │   ├─ performance/
│  │   ├─ attendance/
│  │   ├─ quality/
│  │   ├─ equipment/
│  │   ├─ inventory/
│  │   ├─ andon/
│  │   └─ system/
│  ├─ router/
│  │   ├─ index.ts         # 基础路由 + 动态注入
│  ├─ store/
│  │   ├─ user.ts
│  │   ├─ menu.ts
│  │   ├─ theme.ts
│  │   └─ cache.ts
│  ├─ styles/
│  │   ├─ variables.scss   # 主题变量
│  │   ├─ themes/
│  │   │   ├─ light.scss
│  │   │   ├─ dark.scss
│  │   │   └─ factory.scss
│  ├─ types/               # 全局 TS 类型
│  ├─ utils/
│  ├─ views/               # 页面（或 modules/*/views）
│  ├─ main.ts
│  └─ App.vue
├─ public/
├─ mock/                   # 本地 mock 数据
├─ env/
└─ vite.config.ts
```

---

## 21. 分阶段实施计划

### 阶段 A：项目骨架
- 环境变量、Axios、Pinia、路由、权限、主题切换
- 登录态接入 → 动态菜单

### 阶段 B：酷炫仪表盘
- KPI 卡片 + 产量柱状图 + 异常环形图 + 工单/待办 + 工位跑马灯
- 自动刷新 & 响应式布局

### 阶段 C：工序 SOP
- 列表 → 详情 → 编辑器 → 上传 → 接收 → 播放

### 阶段 D：绩效
- 工时汇报 + 计件 + 今日业绩 + 绩效工资（汇总）

### 阶段 E：考勤
- 打卡记录 + 排班 + 异常审批 + 导出

### 阶段 F：扩展模块（品质 / 设备 / 仓储 / Andon / 报表 / 消息中心）

---

## 22. 类型定义草稿

> 这些类型在 /src/types/ 下拆分管理；生成时代码需要导出。

```ts
/** KPI */
export interface DashboardKpis {
  date: string;
  total_output: number;
  order_count: number;
  pass_rate: number;   // 0-1
  defect_rate: number; // 0-1
  wip: number;
  shipment_amount?: number;
}

/** 每小时产量 */
export interface HourlyOutputPoint {
  hour: string;  // '08:00'
  qty: number;
}

/** 异常分类 */
export interface AbnormalItem {
  type: string;  // '设备故障'
  value: number;
}

/** 最近工单 */
export interface WorkOrderSummary {
  id: string;
  product_name: string;
  start_time: string;
  plan_qty: number;
  done_qty: number;
  pass_qty?: number;
  status?: string; // planned | running | done
}

/** 待办 */
export interface TodoItem {
  id: string;
  type: 'approve' | 'material' | 'andon' | 'qa' | 'other';
  title: string;
  priority: 'high' | 'medium' | 'low';
  created_at: string;
  link?: string;
}

/** 工位跑马灯 */
export interface WorkstationStatus {
  station_id: string;
  station_name: string;
  emp_name?: string;
  avatar?: string;
  workorder_id?: string;
  current_qty?: number;
  target_qty?: number;
  status?: 'running'|'idle'|'downtime';
}

/** SOP */
export interface Sop {
  id: string;
  product_code: string;
  process_code: string;
  version: string;
  title: string;
  steps: SopStep[];
  std_time_sec: number;
  tools: string[];
  qc_points: string[];
  safety_points: string[];
  attachments: SopAttachment[];
  updated_at: string;
  updated_by: string;
  enabled: boolean;
}

export interface SopStep {
  seq: number;
  text: string;
  image?: string;
  video?: string;
  timer_sec?: number;
}

export interface SopAttachment {
  type: 'image' | 'video' | 'pdf' | 'other';
  url: string;
  desc?: string;
}

export interface SopAck {
  sop_id: string;
  user_id: string;
  station_id?: string;
  version: string;
  ack_time: string;
}

/** 绩效 */
export interface PerfTimeReport {
  id: string;
  emp_id: string;
  emp_name: string;
  shift: string;
  start: string;
  end: string;
  type: 'normal' | 'ot' | 'leave';
  hours: number;
}

export interface PerfPiece {
  id: string;
  emp_id: string;
  emp_name: string;
  workorder_id: string;
  process_code: string;
  qty: number;
  unit_price: number;
  amount: number;
  date: string;
}

export interface PerfSalary {
  emp_id: string;
  emp_name: string;
  base: number;
  piece_amt: number;
  overtime_amt: number;
  penalty: number;
  total: number;
  month: string;
}

/** 考勤 */
export interface AttendanceRecord {
  emp_id: string;
  name: string;
  date: string;
  in_time?: string;
  out_time?: string;
  shift?: string;
  status: 'normal'|'late'|'missing'|'leave'|'ot';
}

export interface Shift {
  id: string;
  name: string;
  start: string;
  end: string;
  break_min?: number;
}
```

---

## 23. Mock 数据示例

```ts
// mock/dashboard.ts
export const mockDashboard = {
  date: '2025-07-17',
  kpis: {
    total_output: 270,
    order_count: 68,
    pass_rate: 0.985,
    defect_rate: 0.015,
    wip: 1234,
    shipment_amount: 284567.89,
  },
  hourly_output: [
    { hour: '08:00', qty: 25 },
    { hour: '09:00', qty: 32 },
    { hour: '10:00', qty: 18 },
    { hour: '11:00', qty: 35 },
    { hour: '12:00', qty: 50 },
    { hour: '13:00', qty: 42 },
    { hour: '14:00', qty: 28 },
    { hour: '15:00', qty: 33 },
    { hour: '16:00', qty: 12 },
    { hour: '17:00', qty: 15 },
  ],
  abnormal: [
    { type: '设备故障', value: 35 },
    { type: '物料缺失', value: 20 },
    { type: '人员缺勤', value: 12 },
    { type: '其他原因', value: 10 },
    { type: '正常生产', value: 193 },
  ],
  recent_workorders: [
    { id:'XSDD1710005', product_name:'拓浦智能IH电饭煲3L', start_time:'2017-10-10 17:46:08', plan_qty:20, done_qty:20, pass_qty:20, status:'done' },
    { id:'XSDD1710004', product_name:'拓浦智能IH电饭煲3L', start_time:'2017-10-11 13:46:09', plan_qty:50, done_qty:50, pass_qty:50, status:'done' },
  ],
  todos: [
    { id:'T001', type:'material', title:'缺料提醒-线1', priority:'high', created_at:'2025-07-17T09:00:00Z' },
    { id:'T002', type:'approve', title:'补卡申请-张三', priority:'medium', created_at:'2025-07-17T10:00:00Z' },
  ],
  workstations: [
    { station_id:'S-01', station_name:'除水', emp_name:'陈林燕', avatar:'/img/emp1.png', workorder_id:'XSDD1710005', current_qty:18, target_qty:20, status:'running' },
    { station_id:'S-02', station_name:'装配', emp_name:'李四', avatar:'/img/emp2.png', workorder_id:'XSDD1710006', current_qty:5, target_qty:40, status:'downtime' },
  ],
};
```

---

## 24. 待确认问题（AI 第一步输出）

当你（AI）开始执行时，请先**输出以下问题列表**供我确认：

1. 当前项目技术栈（Vue？React？已有 Element Plus？）
2. 登录后已有的布局文件路径？
3. 是否已有权限 / 菜单接口？格式？
4. API Base URL？
5. 是否需要国际化？
6. 是否启用 WebSocket？
7. 是否使用真实头像/员工图像？没有则用占位。
8. 是否需要多工厂 / 多线别切换？
9. 是否需要大屏轮播模式（电视展示）？
10. 优先实现哪些模块？（默认：仪表盘 -> SOP -> 绩效 -> 考勤）

---

## 25. 下一步操作指令

> 把下面几句按阶段复制给 Cursor，驱动它逐步生成代码。

### 指令 A：需求确认
```
基于《志友ERP 前端开发超级提示词》，请先输出“待确认问题”列表，等待我逐一回答，不要直接写代码。
```

### 指令 B：生成项目骨架
```
使用 Vue3 + Vite + TypeScript + Element Plus 生成项目骨架：
1. 建立目录结构（见文档第20节）
2. 配置路由/Pinia
3. Axios 封装 + token 拦截
4. 主题切换 light/dark/factory (CSS vars)
5. 登录成功后加载动态菜单（假数据）
输出关键文件内容。
```

### 指令 C：生成仪表盘
```
为志友ERP生成酷炫工业仪表盘组件：KpiCard、HourlyBarChart(ECharts)、AbnormalDonut(ECharts)、RecentWorkOrders(Table)、TodoPanel、WorkstationTicker(滚动)，并组合成 Dashboard.vue。使用 mock/dashboard.ts 数据。
```

### 指令 D：生成工序SOP模块
```
生成 SOP 模块：列表、编辑、接收、播放。请输出路由、页面骨架、示例API、组件分拆建议。
```

（依此类推：绩效、考勤、品质、设备……）

---

## 附录：路由 JSON 草案

> 可由 AI 自动生成真正的路由及懒加载组件映射。

```json
[
  {
    "id": "dash",
    "path": "/dashboard",
    "name": "仪表盘",
    "icon": "ep:data-analysis",
    "component": "layouts/AdminLayout",
    "children": [
      { "id": "dash-home", "path": "home", "name": "概览", "icon": "ep:home-filled", "component": "modules/dashboard/views/DashboardHome.vue", "perms": ["dash:view"] },
      { "id": "dash-station", "path": "workstation", "name": "工位看板", "icon": "ep:monitor", "component": "modules/dashboard/views/WorkstationBoard.vue", "perms": ["dash:workstation"] },
      { "id": "dash-line", "path": "line", "name": "产线总览", "icon": "ep:cpu", "component": "modules/dashboard/views/LineOverview.vue", "perms": ["dash:line"] }
    ]
  },
  {
    "id": "sop",
    "path": "/sop",
    "name": "工序SOP",
    "icon": "ep:list",
    "component": "layouts/AdminLayout",
    "children": [
      { "id": "sop-list", "path": "list", "name": "工序SOP", "icon": "ep:document", "component": "modules/sop/views/SopList.vue", "perms": ["sop:view"] },
      { "id": "sop-ack", "path": "ack", "name": "SOP接收", "icon": "ep:check", "component": "modules/sop/views/SopAck.vue", "perms": ["sop:ack"] },
      { "id": "sop-play", "path": "play", "name": "SOP播放", "icon": "ep:video-play", "component": "modules/sop/views/SopPlay.vue", "perms": ["sop:play"] }
    ]
  },
  {
    "id": "performance",
    "path": "/performance",
    "name": "绩效",
    "icon": "ep:trophy",
    "component": "layouts/AdminLayout",
    "children": [
      { "id": "perf-today", "path": "today", "name": "今日业绩", "icon": "ep:trend-charts", "component": "modules/performance/views/PerfToday.vue", "perms": ["perf:today"] },
      { "id": "perf-time", "path": "time", "name": "工时汇报", "icon": "ep:timer", "component": "modules/performance/views/PerfTime.vue", "perms": ["perf:time"] },
      { "id": "perf-piece", "path": "piece", "name": "计件明细", "icon": "ep:coin", "component": "modules/performance/views/PerfPiece.vue", "perms": ["perf:piece"] },
      { "id": "perf-salary", "path": "salary", "name": "绩效工资", "icon": "ep:wallet", "component": "modules/performance/views/PerfSalary.vue", "perms": ["perf:salary"] }
    ]
  },
  {
    "id": "attendance",
    "path": "/attendance",
    "name": "考勤管理",
    "icon": "ep:calendar",
    "component": "layouts/AdminLayout",
    "children": [
      { "id": "att-record", "path": "records", "name": "打卡记录", "icon": "ep:date", "component": "modules/attendance/views/AttRecords.vue", "perms": ["att:record"] },
      { "id": "att-schedule", "path": "schedule", "name": "排班表", "icon": "ep:calendar", "component": "modules/attendance/views/AttSchedule.vue", "perms": ["att:schedule"] },
      { "id": "att-approve", "path": "approval", "name": "异常审批", "icon": "ep:circle-check", "component": "modules/attendance/views/AttApproval.vue", "perms": ["att:approve"] }
    ]
  },
  {
    "id": "quality",
    "path": "/quality",
    "name": "品质管理",
    "icon": "ep:checklist",
    "component": "layouts/AdminLayout",
    "children": [
      { "id": "qa-defect", "path": "defect", "name": "品质异常", "icon": "ep:warning", "component": "modules/quality/views/QaDefect.vue", "perms": ["qa:defect"] },
      { "id": "qa-inspect", "path": "inspect", "name": "抽检录入", "icon": "ep:finished", "component": "modules/quality/views/QaInspect.vue", "perms": ["qa:inspect"] },
      { "id": "qa-rework", "path": "rework", "name": "返修追溯", "icon": "ep:refresh-right", "component": "modules/quality/views/QaRework.vue", "perms": ["qa:rework"] }
    ]
  },
  {
    "id": "equipment",
    "path": "/equipment",
    "name": "设备点检",
    "icon": "ep:cpu",
    "component": "layouts/AdminLayout",
    "children": [
      { "id": "eqp-list", "path": "list", "name": "设备列表", "icon": "ep:setting", "component": "modules/equipment/views/EqpList.vue", "perms": ["eqp:list"] },
      { "id": "eqp-check", "path": "check", "name": "点检计划", "icon": "ep:tools", "component": "modules/equipment/views/EqpCheck.vue", "perms": ["eqp:check"] },
      { "id": "eqp-oee", "path": "oee", "name": "OEE分析", "icon": "ep:data-line", "component": "modules/equipment/views/EqpOee.vue", "perms": ["eqp:oee"] }
    ]
  },
  {
    "id": "inventory",
    "path": "/inventory",
    "name": "仓储",
    "icon": "ep:box",
    "component": "layouts/AdminLayout",
    "children": [
      { "id": "inv-stock", "path": "stock", "name": "库存总览", "icon": "ep:box", "component": "modules/inventory/views/InvStock.vue", "perms": ["inv:stock"] },
      { "id": "inv-io", "path": "io", "name": "收发记录", "icon": "ep:goods", "component": "modules/inventory/views/InvIO.vue", "perms": ["inv:io"] }
    ]
  },
  {
    "id": "msg",
    "path": "/msg",
    "name": "消息中心",
    "icon": "ep:bell",
    "component": "layouts/AdminLayout",
    "children": [
      { "id": "msg-todo", "path": "todo", "name": "待办事项", "icon": "ep:document-checked", "component": "modules/msg/views/MsgTodo.vue", "perms": ["msg:todo"] },
      { "id": "msg-sys", "path": "system", "name": "系统通知", "icon": "ep:chat-dot-square", "component": "modules/msg/views/MsgSystem.vue", "perms": ["msg:sys"] }
    ]
  },
  {
    "id": "system",
    "path": "/system",
    "name": "系统管理",
    "icon": "ep:setting",
    "component": "layouts/AdminLayout",
    "children": [
      { "id": "sys-user", "path": "user", "name": "用户角色", "icon": "ep:user", "component": "modules/system/views/SysUser.vue", "perms": ["sys:user"] },
      { "id": "sys-menu", "path": "menu", "name": "菜单权限", "icon": "ep:menu", "component": "modules/system/views/SysMenu.vue", "perms": ["sys:menu"] },
      { "id": "sys-param", "path": "param", "name": "参数配置", "icon": "ep:operation", "component": "modules/system/views/SysParam.vue", "perms": ["sys:param"] },
      { "id": "sys-log", "path": "log", "name": "审计日志", "icon": "ep:document-copy", "component": "modules/system/views/SysLog.vue", "perms": ["sys:log"] }
    ]
  }
]
```

---

# 使用流程（复制以下片段开始驱动 Cursor）

## 第一步：需求确认
```
基于《志友ERP 前端开发超级提示词》，请先输出“待确认问题”列表，等待我逐一回答，不要直接写代码。
```

## 第二步：生成项目骨架
```
请用 Vue3 + Vite + TS + Element Plus 生成志友ERP前端项目骨架，遵循文档中第20节目录结构与第16节主题规范，并实现：
- 登录 & token 存储
- Axios 封装 & 刷新
- 动态菜单加载（使用文档附录路由 JSON 作为 mock）
- 顶栏主题切换(light/dark/factory)
- 空仪表盘页路由占位
输出所有关键文件内容。
```

## 第三步：酷炫仪表盘实现
```
请基于文档第5节为仪表盘生成以下组件并组合成页面：
KpiCard, HourlyBarChart(ECharts), AbnormalDonut(ECharts), RecentWorkOrders(Table), TodoPanel, WorkstationTicker(滚动).
使用 mock/dashboard.ts 数据。
```

## 第四步：工序SOP模块
```
生成 SOP 模块：列表、编辑、接收、播放；含类型、API、组件分拆。上传图片/视频字段留接口占位。
```

---

**提示**：如果需要我（AI）帮你先把占位符按真实 API、真实技术栈替换，请告诉我。

**祝开发顺利！🚀** 
