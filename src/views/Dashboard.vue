<template>
  <div class="industrial-dashboard">
    <!-- 顶部操作栏 -->
    <div class="dashboard-header">
      <div class="header-left">
        <h1 class="dashboard-title glow-effect">📊 生产管控中心</h1>
        <p class="dashboard-subtitle">{{ currentDate }} | {{ currentTime }}</p>
      </div>
      <div class="header-right">
        <div class="header-controls">
          <el-select
            v-model="selectedShift"
            placeholder="选择班次"
            style="width: 120px"
          >
            <el-option
              v-for="item in shiftOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
          <el-select
            v-model="selectedLine"
            placeholder="选择产线"
            style="width: 120px"
          >
            <el-option
              v-for="item in lineOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
          <el-button 
            type="primary" 
            :loading="loading" 
            @click="refreshData"
            circle
            :icon="Refresh"
          />
        </div>
      </div>
    </div>

    <!-- KPI 卡片区域 -->
    <div class="kpi-section">
      <el-row :gutter="20">
        <el-col :span="4">
          <KpiCard
            title="今日产量"
            :value="dashboardData.kpis.total_output"
            unit="pcs"
            icon="cube"
            color="#18a058"
            :trend="5.2"
          />
        </el-col>
        <el-col :span="4">
          <KpiCard
            title="工单数量"
            :value="dashboardData.kpis.order_count"
            unit="单"
            icon="document"
            color="#2080f0"
            :trend="12.5"
          />
        </el-col>
        <el-col :span="4">
          <KpiCard
            title="达成率"
            :value="Math.round(dashboardData.kpis.pass_rate * 1000) / 10"
            unit="%"
            icon="checkmark"
            color="#f0a020"
            :trend="2.1"
          />
        </el-col>
        <el-col :span="4">
          <KpiCard
            title="不良率"
            :value="Math.round(dashboardData.kpis.defect_rate * 10000) / 100"
            unit="%"
            icon="warning"
            color="#d03050"
            :trend="-0.5"
          />
        </el-col>
        <el-col :span="4">
          <KpiCard
            title="在制WIP"
            :value="dashboardData.kpis.wip"
            unit="件"
            icon="layers"
            color="#722ed1"
            :trend="8.3"
          />
        </el-col>
        <el-col :span="4">
          <KpiCard
            title="出货金额"
            :value="Math.round((dashboardData.kpis.shipment_amount || 0) / 1000) / 10"
            unit="万元"
            icon="cash"
            color="#13c2c2"
            :trend="15.7"
          />
        </el-col>
      </el-row>
    </div>

    <!-- 图表区域 -->
    <div class="charts-section">
      <el-row :gutter="20">
        <el-col :span="12">
          <div class="chart-card industrial-card">
            <div class="chart-header">
              <h3>📈 每小时产量趋势</h3>
              <el-tag type="info" size="small">实时更新</el-tag>
            </div>
            <HourlyOutputChart 
              :data="dashboardData.hourly_output" 
              :height="300"
            />
          </div>
        </el-col>
        <el-col :span="12">
          <div class="chart-card industrial-card">
            <div class="chart-header">
              <h3>🔄 异常分布统计</h3>
              <el-tag type="warning" size="small">需关注</el-tag>
            </div>
            <AbnormalDonutChart 
              :data="dashboardData.abnormal" 
              :height="300"
            />
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 数据列表区域 -->
    <div class="data-section">
      <el-row :gutter="20">
        <el-col :span="12">
          <div class="data-card industrial-card">
            <div class="card-header">
              <h3>📋 最近工单</h3>
              <el-button text type="primary" size="small">查看全部</el-button>
            </div>
            <RecentWorkOrders :data="dashboardData.recent_workorders" />
          </div>
        </el-col>
        <el-col :span="12">
          <div class="data-card industrial-card">
            <div class="card-header">
              <h3>✅ 今日待办</h3>
              <el-badge :value="dashboardData.todos.length" type="danger">
                <el-button text type="primary" size="small">处理</el-button>
              </el-badge>
            </div>
            <TodoPanel :data="dashboardData.todos" />
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 工位跑马灯 -->
    <div class="workstation-section">
      <div class="workstation-card industrial-card">
        <div class="card-header">
          <h3>🏭 工位实时状态</h3>
          <div class="status-legend">
            <el-tag type="success" size="small">
              <span class="status-indicator status-running"></span>
              运行中
            </el-tag>
            <el-tag type="warning" size="small">
              <span class="status-indicator status-idle"></span>
              空闲
            </el-tag>
            <el-tag type="danger" size="small">
              <span class="status-indicator status-downtime"></span>
              停机
            </el-tag>
          </div>
        </div>
        <WorkstationTicker :data="dashboardData.workstations" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { Refresh } from '@element-plus/icons-vue'
import { useThemeStore } from '@/stores/theme'
import { mockDashboard, generateRealtimeData } from '@/mock/dashboard'
import KpiCard from '@/components/KpiCard.vue'
import HourlyOutputChart from '@/components/HourlyOutputChart.vue'
import AbnormalDonutChart from '@/components/AbnormalDonutChart.vue'
import RecentWorkOrders from '@/components/RecentWorkOrders.vue'
import TodoPanel from '@/components/TodoPanel.vue'
import WorkstationTicker from '@/components/WorkstationTicker.vue'

const themeStore = useThemeStore()

// 响应式数据
const loading = ref(false)
const selectedShift = ref('白班')
const selectedLine = ref('产线1')
const currentDate = ref('')
const currentTime = ref('')
const dashboardData = reactive(mockDashboard)

// 选项数据
const shiftOptions = [
  { label: '白班', value: '白班' },
  { label: '夜班', value: '夜班' },
  { label: '全部', value: '全部' }
]

const lineOptions = [
  { label: '产线1', value: '产线1' },
  { label: '产线2', value: '产线2' },
  { label: '产线3', value: '产线3' },
  { label: '全部', value: '全部' }
]

// 定时器
let timeInterval: number | null = null
let dataInterval: number | null = null

// 更新时间
const updateTime = () => {
  const now = new Date()
  currentDate.value = now.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  })
  currentTime.value = now.toLocaleTimeString('zh-CN', { hour12: false })
}

// 刷新数据
const refreshData = async () => {
  loading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 更新数据
    const newData = generateRealtimeData()
    Object.assign(dashboardData, newData)
    
    console.log('仪表盘数据已刷新')
  } catch (error) {
    console.error('刷新数据失败:', error)
  } finally {
    loading.value = false
  }
}

// 自动刷新数据
const startAutoRefresh = () => {
  // 每30秒刷新一次数据
  dataInterval = window.setInterval(() => {
    const newData = generateRealtimeData()
    Object.assign(dashboardData, newData)
  }, 30000)
}

// 组件挂载
onMounted(() => {
  updateTime()
  // 每秒更新时间
  timeInterval = window.setInterval(updateTime, 1000)
  // 启动自动刷新
  startAutoRefresh()
})

// 组件卸载
onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
  if (dataInterval) {
    clearInterval(dataInterval)
  }
})
</script>

<style scoped>
.industrial-dashboard {
  min-height: 100vh;
  padding: 20px;
  background: var(--bg-body);
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding: 20px;
  background: var(--bg-card);
  border-radius: 12px;
  border: 1px solid var(--border-color);
}

.header-left .dashboard-title {
  font-size: 28px;
  font-weight: bold;
  color: var(--text-primary);
  margin: 0 0 8px 0;
}

[data-theme="factory"] .dashboard-title {
  color: var(--industrial-blue);
}

.dashboard-subtitle {
  color: var(--text-secondary);
  margin: 0;
  font-size: 14px;
}

.kpi-section {
  margin-bottom: 30px;
}

.charts-section {
  margin-bottom: 30px;
}

.chart-card,
.data-card,
.workstation-card {
  padding: 24px;
  height: 100%;
}

.chart-header,
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-color);
}

.chart-header h3,
.card-header h3 {
  margin: 0;
  font-size: 16px;
  color: var(--text-primary);
}

[data-theme="factory"] .chart-header h3,
[data-theme="factory"] .card-header h3 {
  color: var(--industrial-blue);
}

.data-section {
  margin-bottom: 30px;
}

.workstation-section {
  margin-bottom: 20px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .kpi-section :deep(.n-grid) {
    grid-template-columns: repeat(3, 1fr) !important;
  }
}

@media (max-width: 768px) {
  .industrial-dashboard {
    padding: 12px;
  }
  
  .dashboard-header {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }
  
  .header-left .dashboard-title {
    font-size: 24px;
  }
  
  .kpi-section :deep(.n-grid) {
    grid-template-columns: repeat(2, 1fr) !important;
  }
  
  .charts-section :deep(.n-grid),
  .data-section :deep(.n-grid) {
    grid-template-columns: 1fr !important;
  }
}

@media (max-width: 480px) {
  .kpi-section :deep(.n-grid) {
    grid-template-columns: 1fr !important;
  }
}

/* Factory主题特效 */
[data-theme="factory"] .dashboard-header {
  background: linear-gradient(135deg, rgba(0, 216, 255, 0.1) 0%, rgba(0, 27, 46, 0.9) 100%);
  border-color: rgba(0, 216, 255, 0.3);
  backdrop-filter: blur(10px);
}

/* 动画效果 */
.industrial-dashboard {
  animation: fadeIn 0.6s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 卡片悬停效果 */
.industrial-card {
  transition: all 0.3s ease;
}

.industrial-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

[data-theme="factory"] .industrial-card:hover {
  box-shadow: 0 8px 32px rgba(0, 216, 255, 0.3);
}

/* Element Plus 组件样式调整 */
.header-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.status-legend {
  display: flex;
  align-items: center;
  gap: 12px;
}

.status-indicator {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 4px;
}

.status-running {
  background-color: #67c23a;
}

.status-idle {
  background-color: #e6a23c;
}

.status-downtime {
  background-color: #f56c6c;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .kpi-section .el-col {
    margin-bottom: 20px;
  }
}

@media (max-width: 768px) {
  .header-controls {
    flex-direction: column;
    gap: 8px;
  }
  
  .status-legend {
    flex-wrap: wrap;
    gap: 8px;
  }
}
</style> 