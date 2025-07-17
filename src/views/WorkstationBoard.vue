<template>
  <div class="workstation-board">
    <!-- 顶部标题栏 -->
    <div class="board-header">
      <div class="header-left">
        <h1 class="board-title">
          <el-icon class="title-icon"><Monitor /></el-icon>
          生产工位看板
        </h1>
        <p class="board-subtitle">实时监控 · 数据驱动 · 智能制造</p>
      </div>
      <div class="header-right">
        <div class="live-indicator">
          <span class="live-dot"></span>
          <span class="live-text">LIVE</span>
        </div>
        <div class="current-time">{{ currentTime }}</div>
        <el-button 
          class="refresh-btn" 
          circle 
          size="small" 
          @click="refreshData"
          :loading="isRefreshing"
        >
          <el-icon><Refresh /></el-icon>
        </el-button>
      </div>
    </div>

    <!-- KPI 概览区域 -->
    <div class="overview-section">
      <div class="overview-grid">
        <div class="overview-card running" @click="filterByStatus('running')">
          <div class="card-icon">
            <el-icon :size="28"><VideoPlay /></el-icon>
          </div>
          <div class="card-content">
            <div class="card-value">{{ runningStations }}</div>
            <div class="card-label">运行工位</div>
          </div>
          <div class="card-trend up">
            <el-icon><CaretTop /></el-icon>
          </div>
        </div>

        <div class="overview-card idle" @click="filterByStatus('idle')">
          <div class="card-icon">
            <el-icon :size="28"><VideoPause /></el-icon>
          </div>
          <div class="card-content">
            <div class="card-value">{{ idleStations }}</div>
            <div class="card-label">空闲工位</div>
          </div>
          <div class="card-trend stable">
            <el-icon><Minus /></el-icon>
          </div>
        </div>

        <div class="overview-card downtime" @click="filterByStatus('downtime')">
          <div class="card-icon">
            <el-icon :size="28"><Warning /></el-icon>
          </div>
          <div class="card-content">
            <div class="card-value">{{ downtimeStations }}</div>
            <div class="card-label">停机工位</div>
          </div>
          <div class="card-trend down">
            <el-icon><CaretBottom /></el-icon>
          </div>
        </div>

        <div class="overview-card efficiency">
          <div class="card-icon">
            <el-icon :size="28"><TrendCharts /></el-icon>
          </div>
          <div class="card-content">
            <div class="card-value">{{ overallEfficiency }}%</div>
            <div class="card-label">整体效率</div>
          </div>
          <div class="efficiency-ring">
            <el-progress
              type="circle"
              :percentage="overallEfficiency"
              :width="40"
              :stroke-width="4"
              :show-text="false"
              color="#00D8FF"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 筛选和控制区域 -->
    <div class="control-section">
      <div class="filter-tabs">
        <el-button-group>
          <el-button 
            :type="statusFilter === 'all' ? 'primary' : ''"
            @click="setStatusFilter('all')"
            size="small"
          >
            全部 ({{ workstations.length }})
          </el-button>
          <el-button 
            :type="statusFilter === 'running' ? 'primary' : ''"
            @click="setStatusFilter('running')"
            size="small"
          >
            运行中 ({{ runningStations }})
          </el-button>
          <el-button 
            :type="statusFilter === 'idle' ? 'primary' : ''"
            @click="setStatusFilter('idle')"
            size="small"
          >
            空闲 ({{ idleStations }})
          </el-button>
          <el-button 
            :type="statusFilter === 'downtime' ? 'primary' : ''"
            @click="setStatusFilter('downtime')"
            size="small"
          >
            停机 ({{ downtimeStations }})
          </el-button>
        </el-button-group>
      </div>
      
      <div class="view-options">
        <el-radio-group v-model="viewMode" size="small">
          <el-radio value="grid">网格视图</el-radio>
          <el-radio value="list">列表视图</el-radio>
        </el-radio-group>
      </div>
    </div>

    <!-- 工位详情区域 -->
    <div class="stations-section" :class="viewMode">
      <transition-group name="station" tag="div" class="stations-container">
        <div 
          v-for="station in filteredStations" 
          :key="station.station_id"
          class="station-card"
          :class="[
            `status-${station.status}`,
            { 'selected': selectedStation === station.station_id }
          ]"
          @click="selectStation(station)"
        >
          <!-- 状态指示条 -->
          <div class="status-bar" :class="`status-${station.status}`"></div>
          
          <!-- 工位标题区 -->
          <div class="station-title">
            <div class="title-left">
              <h3 class="station-name">{{ station.station_name }}</h3>
              <span class="station-code">{{ station.station_id }}</span>
            </div>
            <div class="title-right">
              <div class="status-badge" :class="`status-${station.status}`">
                <span class="status-dot"></span>
                <span class="status-text">{{ getStatusText(station.status) }}</span>
              </div>
            </div>
          </div>

          <!-- 操作员区域 -->
          <div class="operator-section">
            <div class="operator-info">
              <div class="operator-avatar">
                <div class="avatar-container">
                  <el-icon v-if="!station.emp_name" :size="24" class="placeholder-icon">
                    <User />
                  </el-icon>
                  <span v-else class="avatar-text">
                    {{ getAvatarText(station.emp_name) }}
                  </span>
                </div>
              </div>
              <div class="operator-details">
                <div class="operator-name">
                  {{ station.emp_name || '无人员' }}
                </div>
                <div class="operator-role">
                  {{ station.emp_name ? '操作员' : '待分配' }}
                </div>
              </div>
            </div>
            <div class="operator-status">
              <el-icon v-if="station.emp_name" class="online-icon" color="#67C23A">
                <CircleCheckFilled />
              </el-icon>
            </div>
          </div>

          <!-- 生产信息区域 -->
          <div class="production-section" v-if="station.workorder_id">
            <div class="production-header">
              <span class="workorder-label">工单号</span>
              <span class="workorder-value">{{ station.workorder_id }}</span>
            </div>
            
            <div class="progress-section">
              <div class="progress-info">
                <div class="progress-numbers">
                  <span class="current">{{ station.current_qty || 0 }}</span>
                  <span class="divider">/</span>
                  <span class="target">{{ station.target_qty || 0 }}</span>
                  <span class="unit">PCS</span>
                </div>
                <div class="progress-percent">
                  {{ getProgressPercentage(station) }}%
                </div>
              </div>
              
              <div class="progress-bar">
                <el-progress
                  :percentage="getProgressPercentage(station)"
                  :status="getProgressStatus(station.status)"
                  :stroke-width="6"
                  :show-text="false"
                  :color="getProgressColor(station.status)"
                />
              </div>
            </div>
          </div>

          <!-- 空白状态 -->
          <div v-else class="empty-production">
            <el-icon class="empty-icon"><DocumentRemove /></el-icon>
            <span class="empty-text">暂无生产任务</span>
          </div>

          <!-- 性能指标区域 -->
          <div class="metrics-section">
            <div class="metric-item">
              <span class="metric-label">效率</span>
              <span class="metric-value" :class="getEfficiencyClass(station)">
                {{ getStationEfficiency(station) }}%
              </span>
            </div>
            <div class="metric-item">
              <span class="metric-label">运行时长</span>
              <span class="metric-value">{{ getRunningTime(station) }}</span>
            </div>
            <div class="metric-item">
              <span class="metric-label">最后更新</span>
              <span class="metric-value">{{ getLastUpdate() }}</span>
            </div>
          </div>

          <!-- 快速操作区域 -->
          <div class="actions-section">
            <el-button-group size="small">
              <el-button @click.stop="viewDetails(station)">
                <el-icon><View /></el-icon>
                详情
              </el-button>
              <el-button @click.stop="editStation(station)" v-if="station.status !== 'running'">
                <el-icon><Edit /></el-icon>
                编辑
              </el-button>
              <el-button 
                @click.stop="toggleStation(station)" 
                :type="station.status === 'running' ? 'warning' : 'success'"
              >
                <el-icon><SwitchButton /></el-icon>
                {{ station.status === 'running' ? '停止' : '启动' }}
              </el-button>
            </el-button-group>
          </div>
        </div>
      </transition-group>
    </div>

    <!-- 空状态 -->
    <el-empty 
      v-if="filteredStations.length === 0" 
      description="没有找到符合条件的工位"
      :image-size="120"
    >
      <el-button type="primary" @click="resetFilters">重置筛选</el-button>
    </el-empty>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  Monitor,
  Refresh,
  VideoPlay, 
  VideoPause, 
  Warning,
  TrendCharts,
  CaretTop,
  CaretBottom,
  Minus,
  User,
  CircleCheckFilled,
  DocumentRemove,
  View,
  Edit,
  SwitchButton
} from '@element-plus/icons-vue'
import { useThemeStore } from '@/stores/theme'
import { mockDashboard } from '@/mock/dashboard'
import type { WorkstationStatus } from '@/types'

const themeStore = useThemeStore()

// 响应式数据
const currentTime = ref('')
const workstations = ref<WorkstationStatus[]>([
  {
    station_id: 'WS-001',
    station_name: '装配工位A',
    emp_name: '张三',
    workorder_id: 'WO-20250117-001',
    current_qty: 85,
    target_qty: 100,
    status: 'running'
  },
  {
    station_id: 'WS-002', 
    station_name: '检测工位B',
    emp_name: '李四',
    workorder_id: 'WO-20250117-002',
    current_qty: 45,
    target_qty: 80,
    status: 'running'
  },
  {
    station_id: 'WS-003',
    station_name: '包装工位C', 
    emp_name: '',
    workorder_id: '',
    current_qty: 0,
    target_qty: 0,
    status: 'idle'
  },
  {
    station_id: 'WS-004',
    station_name: '测试工位D',
    emp_name: '王五',
    workorder_id: 'WO-20250117-003',
    current_qty: 20,
    target_qty: 60,
    status: 'downtime'
  },
  {
    station_id: 'WS-005',
    station_name: '焊接工位E',
    emp_name: '赵六',
    workorder_id: 'WO-20250117-004',
    current_qty: 92,
    target_qty: 100,
    status: 'running'
  },
  {
    station_id: 'WS-006',
    station_name: '喷涂工位F',
    emp_name: '',
    workorder_id: '',
    current_qty: 0,
    target_qty: 0,
    status: 'idle'
  }
])

const statusFilter = ref('all')
const viewMode = ref('grid')
const selectedStation = ref('')
const isRefreshing = ref(false)

// 定时器
let timeInterval: number | null = null
let dataInterval: number | null = null

// 计算属性
const runningStations = computed(() => 
  workstations.value.filter(s => s.status === 'running').length
)

const idleStations = computed(() => 
  workstations.value.filter(s => s.status === 'idle').length
)

const downtimeStations = computed(() => 
  workstations.value.filter(s => s.status === 'downtime').length
)

const overallEfficiency = computed(() => {
  const totalStations = workstations.value.length
  if (totalStations === 0) return 0
  
  const runningCount = runningStations.value
  return Math.round((runningCount / totalStations) * 100)
})

const filteredStations = computed(() => {
  if (statusFilter.value === 'all') {
    return workstations.value
  }
  return workstations.value.filter(station => station.status === statusFilter.value)
})

// 方法
const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit', 
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

const getStatusText = (status?: string) => {
  const statusMap = {
    running: '运行中',
    idle: '空闲',
    downtime: '停机'
  }
  return statusMap[status as keyof typeof statusMap] || '未知'
}

const getProgressPercentage = (station: WorkstationStatus) => {
  if (!station.current_qty || !station.target_qty) return 0
  return Math.min(Math.round((station.current_qty / station.target_qty) * 100), 100)
}

const getProgressStatus = (status?: string) => {
  if (status === 'running') return 'success'
  if (status === 'downtime') return 'exception'
  return 'normal'
}

const getProgressColor = (status?: string) => {
  if (status === 'running') return '#67C23A'
  if (status === 'downtime') return '#F56C6C'
  return '#E4E7ED'
}

const getStationEfficiency = (station: WorkstationStatus) => {
  if (station.status === 'downtime') return 0
  if (station.status === 'idle') return 0
  return Math.floor(Math.random() * 20) + 80 // 模拟数据
}

const getEfficiencyClass = (station: WorkstationStatus) => {
  const efficiency = getStationEfficiency(station)
  if (efficiency >= 90) return 'excellent'
  if (efficiency >= 75) return 'good'
  if (efficiency >= 60) return 'average'
  return 'poor'
}

const getRunningTime = (station: WorkstationStatus) => {
  if (station.status !== 'running') return '0小时'
  return `${Math.floor(Math.random() * 8) + 1}小时${Math.floor(Math.random() * 60)}分`
}

const getLastUpdate = () => {
  const now = new Date()
  const seconds = Math.floor(Math.random() * 60)
  now.setSeconds(now.getSeconds() - seconds)
  return `${seconds}秒前`
}

const getAvatarText = (name: string) => {
  return name.slice(-1) // 取姓名最后一个字
}

const setStatusFilter = (status: string) => {
  statusFilter.value = status
}

const filterByStatus = (status: string) => {
  setStatusFilter(status)
}

const selectStation = (station: WorkstationStatus) => {
  selectedStation.value = selectedStation.value === station.station_id ? '' : station.station_id
}

const refreshData = async () => {
  isRefreshing.value = true
  try {
    // 模拟刷新延迟
    await new Promise(resolve => setTimeout(resolve, 1000))
    // 这里可以调用实际的API刷新数据
    ElMessage.success('数据刷新成功')
  } catch (error) {
    ElMessage.error('数据刷新失败')
  } finally {
    isRefreshing.value = false
  }
}

const viewDetails = (station: WorkstationStatus) => {
  ElMessage.info(`查看工位 ${station.station_name} 详情`)
}

const editStation = (station: WorkstationStatus) => {
  ElMessage.info(`编辑工位 ${station.station_name}`)
}

const toggleStation = (station: WorkstationStatus) => {
  const newStatus = station.status === 'running' ? 'idle' : 'running'
  station.status = newStatus
  ElMessage.success(`工位 ${station.station_name} 已${newStatus === 'running' ? '启动' : '停止'}`)
}

const resetFilters = () => {
  statusFilter.value = 'all'
  selectedStation.value = ''
}

// 生命周期
onMounted(() => {
  updateTime()
  timeInterval = window.setInterval(updateTime, 1000)
  
  // 模拟实时数据更新
  dataInterval = window.setInterval(() => {
    workstations.value.forEach(station => {
      if (station.status === 'running' && station.current_qty && station.target_qty) {
        if (station.current_qty < station.target_qty) {
          station.current_qty += Math.floor(Math.random() * 3)
          if (station.current_qty > station.target_qty) {
            station.current_qty = station.target_qty
          }
        }
      }
    })
  }, 10000) // 每10秒更新一次
})

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
.workstation-board {
  padding: 20px;
  background: var(--bg-body);
  min-height: 100vh;
}

/* 顶部标题栏 */
.board-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 20px;
  background: var(--bg-card);
  border-radius: 12px;
  border: 1px solid var(--border-color);
}

.header-left .board-title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 8px;
}

.title-icon {
  color: var(--color-primary);
}

.board-subtitle {
  margin: 4px 0 0 0;
  font-size: 14px;
  color: var(--text-secondary);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.live-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  background: rgba(103, 194, 58, 0.1);
  border-radius: 4px;
  border: 1px solid rgba(103, 194, 58, 0.3);
}

.live-dot {
  width: 8px;
  height: 8px;
  background: #67C23A;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

.live-text {
  font-size: 12px;
  font-weight: 600;
  color: #67C23A;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.current-time {
  font-family: 'Courier New', monospace;
  font-size: 14px;
  color: var(--text-primary);
  padding: 8px 12px;
  background: rgba(64, 158, 255, 0.1);
  border-radius: 6px;
  border: 1px solid rgba(64, 158, 255, 0.3);
}

.refresh-btn {
  margin-left: 8px;
}

/* KPI概览区域 */
.overview-section {
  margin-bottom: 20px;
}

.overview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.overview-card {
  padding: 20px;
  background: var(--bg-card);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.overview-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.overview-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--card-color, var(--color-primary)), transparent);
}

.overview-card.running {
  --card-color: #67C23A;
}

.overview-card.idle {
  --card-color: #E6A23C;
}

.overview-card.downtime {
  --card-color: #F56C6C;
}

.overview-card.efficiency {
  --card-color: #409EFF;
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.card-icon {
  color: var(--card-color);
  margin-bottom: 12px;
}

.card-value {
  font-size: 32px;
  font-weight: 700;
  color: var(--text-primary);
  font-family: 'Courier New', monospace;
}

.card-label {
  font-size: 14px;
  color: var(--text-secondary);
}

.card-trend {
  position: absolute;
  top: 16px;
  right: 16px;
  padding: 4px;
  border-radius: 4px;
}

.card-trend.up {
  color: #67C23A;
  background: rgba(103, 194, 58, 0.1);
}

.card-trend.down {
  color: #F56C6C;
  background: rgba(245, 108, 108, 0.1);
}

.card-trend.stable {
  color: #E6A23C;
  background: rgba(230, 162, 60, 0.1);
}

.efficiency-ring {
  position: absolute;
  top: 16px;
  right: 16px;
}

/* 控制区域 */
.control-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 16px 20px;
  background: var(--bg-card);
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.filter-tabs {
  flex: 1;
}

.view-options {
  flex-shrink: 0;
}

/* 工位区域 */
.stations-section {
  min-height: 400px;
}

.stations-container {
  display: grid;
  gap: 20px;
}

.stations-section.grid .stations-container {
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
}

.stations-section.list .stations-container {
  grid-template-columns: 1fr;
}

/* 工位卡片 */
.station-card {
  background: var(--bg-card);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.station-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.station-card.selected {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.status-bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
}

.status-bar.status-running {
  background: linear-gradient(90deg, #67C23A, #85CE61);
}

.status-bar.status-idle {
  background: linear-gradient(90deg, #E6A23C, #EEBE50);
}

.status-bar.status-downtime {
  background: linear-gradient(90deg, #F56C6C, #F78989);
}

/* 工位标题 */
.station-title {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.station-name {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

.station-code {
  font-size: 12px;
  color: var(--text-secondary);
  background: var(--bg-body);
  padding: 2px 6px;
  border-radius: 4px;
  margin-top: 4px;
  display: inline-block;
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.status-running {
  background: rgba(103, 194, 58, 0.1);
  color: #67C23A;
  border: 1px solid rgba(103, 194, 58, 0.3);
}

.status-badge.status-idle {
  background: rgba(230, 162, 60, 0.1);
  color: #E6A23C;
  border: 1px solid rgba(230, 162, 60, 0.3);
}

.status-badge.status-downtime {
  background: rgba(245, 108, 108, 0.1);
  color: #F56C6C;
  border: 1px solid rgba(245, 108, 108, 0.3);
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

/* 操作员区域 */
.operator-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 12px;
  background: var(--bg-body);
  border-radius: 8px;
}

.operator-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar-container {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 14px;
}

.avatar-container .placeholder-icon {
  color: rgba(255, 255, 255, 0.8);
}

.operator-name {
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 2px;
}

.operator-role {
  font-size: 12px;
  color: var(--text-secondary);
}

.online-icon {
  animation: pulse 2s infinite;
}

/* 生产信息区域 */
.production-section {
  margin-bottom: 16px;
}

.production-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}

.workorder-label {
  font-size: 12px;
  color: var(--text-secondary);
}

.workorder-value {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-primary);
  font-family: 'Courier New', monospace;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.progress-numbers {
  display: flex;
  align-items: baseline;
  gap: 4px;
  font-family: 'Courier New', monospace;
}

.current {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-primary);
}

.divider {
  color: var(--text-secondary);
}

.target {
  font-size: 16px;
  color: var(--text-primary);
}

.unit {
  font-size: 12px;
  color: var(--text-secondary);
  margin-left: 4px;
}

.progress-percent {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

/* 空白状态 */
.empty-production {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  color: var(--text-secondary);
  margin-bottom: 16px;
}

.empty-icon {
  font-size: 32px;
  margin-bottom: 8px;
  opacity: 0.5;
}

.empty-text {
  font-size: 14px;
}

/* 性能指标区域 */
.metrics-section {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.metric-item {
  text-align: center;
  padding: 8px;
  background: var(--bg-body);
  border-radius: 6px;
}

.metric-label {
  display: block;
  font-size: 11px;
  color: var(--text-secondary);
  margin-bottom: 4px;
}

.metric-value {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
}

.metric-value.excellent {
  color: #67C23A;
}

.metric-value.good {
  color: #409EFF;
}

.metric-value.average {
  color: #E6A23C;
}

.metric-value.poor {
  color: #F56C6C;
}

/* 操作区域 */
.actions-section {
  text-align: center;
}

/* 动画效果 */
.station-enter-active,
.station-leave-active {
  transition: all 0.3s ease;
}

.station-enter-from,
.station-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .workstation-board {
    padding: 12px;
  }
  
  .board-header {
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }
  
  .header-right {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .overview-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .control-section {
    flex-direction: column;
    gap: 12px;
  }
  
  .stations-section.grid .stations-container {
    grid-template-columns: 1fr;
  }
  
  .metrics-section {
    grid-template-columns: 1fr;
  }
}

/* 工厂主题特殊效果 */
[data-theme="factory"] .workstation-board {
  background: linear-gradient(135deg, #001529 0%, #002140 100%);
}

[data-theme="factory"] .overview-card,
[data-theme="factory"] .station-card,
[data-theme="factory"] .board-header,
[data-theme="factory"] .control-section {
  background: rgba(0, 216, 255, 0.1);
  border-color: rgba(0, 216, 255, 0.3);
  backdrop-filter: blur(10px);
}

[data-theme="factory"] .card-value,
[data-theme="factory"] .station-name {
  text-shadow: 0 0 10px currentColor;
}
</style> 