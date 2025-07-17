<template>
  <div class="perf-today-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">🏆 今日业绩</h1>
        <p class="page-subtitle">Today's Performance | {{ currentDate }}</p>
      </div>
      <div class="header-right">
        <div class="header-actions">
          <el-button @click="refreshData" :loading="loading">
            <el-icon>
              <Refresh />
            </el-icon>
            刷新数据
          </el-button>
          <el-button type="primary" @click="exportData">
            <el-icon>
              <Download />
            </el-icon>
            导出报表
          </el-button>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-section">
      <el-row :gutter="20">
        <el-col :span="4" :sm="8" :xs="12">
          <div class="stat-card industrial-card">
            <div class="stat-icon" style="color: #18a058;">
              <el-icon size="32">
                <User />
              </el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ activeEmployees }}</div>
              <div class="stat-label">在岗人数</div>
            </div>
          </div>
        </el-col>
        <el-col :span="4" :sm="8" :xs="12">
          <div class="stat-card industrial-card">
            <div class="stat-icon" style="color: #2080f0;">
              <el-icon size="32">
                <Clock />
              </el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ totalHours.toFixed(1) }}</div>
              <div class="stat-label">总工时</div>
            </div>
          </div>
        </el-col>
        <el-col :span="4" :sm="8" :xs="12">
          <div class="stat-card industrial-card">
            <div class="stat-icon" style="color: #f0a020;">
              <el-icon size="32">
                <Box />
              </el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ totalPieces }}</div>
              <div class="stat-label">总产量</div>
            </div>
          </div>
        </el-col>
        <el-col :span="4" :sm="8" :xs="12">
          <div class="stat-card industrial-card">
            <div class="stat-icon" style="color: #722ed1;">
              <el-icon size="32">
                <Money />
              </el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ totalAmount.toFixed(0) }}</div>
              <div class="stat-label">计件金额</div>
            </div>
          </div>
        </el-col>
        <el-col :span="4" :sm="8" :xs="12">
          <div class="stat-card industrial-card">
            <div class="stat-icon" style="color: #d03050;">
              <el-icon size="32">
                <Odometer />
              </el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ avgEfficiency }}</div>
              <div class="stat-label">平均效率</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 员工业绩排行 -->
    <div class="ranking-section">
      <el-card shadow="never">
        <template #header>
          <div class="card-header">
            <span>📊 员工业绩排行榜</span>
            <el-radio-group v-model="rankingType" size="small">
              <el-radio-button value="piece_amount">计件金额</el-radio-button>
              <el-radio-button value="piece_qty">产量数量</el-radio-button>
              <el-radio-button value="total_hours">工作时长</el-radio-button>
            </el-radio-group>
          </div>
        </template>

        <div class="ranking-list">
          <div 
            v-for="(emp, index) in sortedEmployees" 
            :key="emp.emp_id"
            class="ranking-item"
            :class="getRankingClass(index)"
          >
            <div class="ranking-badge">
              <span class="rank-number">{{ index + 1 }}</span>
              <el-icon v-if="index < 3" size="20" :color="getRankColor(index)">
                <Trophy />
              </el-icon>
            </div>
            
            <div class="emp-info">
              <div class="emp-avatar">
                <el-avatar size="default">
                  {{ emp.emp_name.charAt(0) }}
                </el-avatar>
              </div>
              <div class="emp-details">
                <h4 class="emp-name">{{ emp.emp_name }}</h4>
                <p class="emp-id">{{ emp.emp_id }}</p>
              </div>
            </div>

            <div class="perf-metrics">
              <div class="metric">
                <span class="metric-label">工时</span>
                <span class="metric-value">{{ emp.total_hours }}h</span>
              </div>
              <div class="metric">
                <span class="metric-label">产量</span>
                <span class="metric-value">{{ emp.piece_qty }}</span>
              </div>
              <div class="metric">
                <span class="metric-label">金额</span>
                <span class="metric-value">¥{{ emp.piece_amount }}</span>
              </div>
            </div>

            <div class="perf-score">
              <div class="score-value" :style="{ color: getRankColor(index) }">
                {{ getRankingValue(emp) }}
              </div>
              <div class="score-label">{{ getRankingLabel() }}</div>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 详细数据表格 -->
    <div class="table-section">
      <el-card shadow="never">
        <template #header>
          <span>📋 详细业绩数据</span>
        </template>
        <el-table
          :data="paginatedEmployees"
          v-loading="loading"
          size="default"
          stripe
        >
          <el-table-column label="排名" width="80">
            <template #default="{ $index }">
              {{ $index + 1 }}
            </template>
          </el-table-column>
          <el-table-column prop="emp_name" label="员工姓名" width="120" />
          <el-table-column prop="emp_id" label="员工编号" width="120" />
          <el-table-column label="总工时" width="100">
            <template #default="{ row }">
              {{ row.total_hours }}小时
            </template>
          </el-table-column>
          <el-table-column label="正常工时" width="100">
            <template #default="{ row }">
              {{ row.normal_hours }}小时
            </template>
          </el-table-column>
          <el-table-column label="加班工时" width="100">
            <template #default="{ row }">
              {{ row.ot_hours }}小时
            </template>
          </el-table-column>
          <el-table-column label="计件数量" width="100">
            <template #default="{ row }">
              {{ row.piece_qty }}件
            </template>
          </el-table-column>
          <el-table-column label="计件金额" width="120">
            <template #default="{ row }">
              <span style="color: #18a058; font-weight: bold;">
                ¥{{ row.piece_amount.toFixed(2) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="工作效率" width="120">
            <template #default="{ row }">
              <el-progress
                :percentage="getEfficiencyPercentage(row)"
                :status="getEfficiencyStatus(row)"
                :show-text="false"
                style="width: 80px;"
              />
            </template>
          </el-table-column>
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <el-tag 
                :type="row.total_hours > 0 ? 'success' : 'info'"
                size="small"
              >
                {{ row.total_hours > 0 ? '在岗' : '离岗' }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
        <div class="pagination-container">
          <el-pagination
            v-model:current-page="pagination.page"
            v-model:page-size="pagination.pageSize"
            :page-sizes="pagination.pageSizes"
            layout="total, sizes, prev, pager, next"
            :total="pagination.total"
            @size-change="handlePageSizeChange"
            @current-change="handlePageChange"
          />
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  Refresh,
  Download,
  User,
  Clock,
  Box,
  Money,
  Odometer,
  Trophy
} from '@element-plus/icons-vue'
import { getTodayPerformance } from '@/mock/performance'

// 响应式数据
const loading = ref(false)
const employeeList = ref<any[]>([])
const rankingType = ref<'piece_amount' | 'piece_qty' | 'total_hours'>('piece_amount')
const currentDate = ref('')

// 分页配置
const pagination = reactive({
  page: 1,
  pageSize: 10,
  pageSizes: [10, 20, 30, 50],
  total: 0
})

// 计算属性
const activeEmployees = computed(() => employeeList.value.length)
const totalHours = computed(() => 
  employeeList.value.reduce((sum, emp) => sum + emp.total_hours, 0)
)
const totalPieces = computed(() => 
  employeeList.value.reduce((sum, emp) => sum + emp.piece_qty, 0)
)
const totalAmount = computed(() => 
  employeeList.value.reduce((sum, emp) => sum + emp.piece_amount, 0)
)
const avgEfficiency = computed(() => {
  if (totalHours.value === 0) return '0%'
  const efficiency = (totalPieces.value / totalHours.value) * 10 // 假设效率算法
  return Math.round(efficiency) + '%'
})

const sortedEmployees = computed(() => {
  const sorted = [...employeeList.value].sort((a, b) => {
    return b[rankingType.value] - a[rankingType.value]
  })
  // 只显示前5名用于排行榜
  return sorted.slice(0, 5)
})

// 分页数据
const paginatedEmployees = computed(() => {
  const sorted = [...employeeList.value].sort((a, b) => {
    return b[rankingType.value] - a[rankingType.value]
  })
  const start = (pagination.page - 1) * pagination.pageSize
  const end = start + pagination.pageSize
  pagination.total = sorted.length
  return sorted.slice(start, end)
})

// 工具函数
const updateCurrentDate = () => {
  currentDate.value = new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  })
}

const getRankingClass = (index: number) => {
  if (index === 0) return 'rank-first'
  if (index === 1) return 'rank-second'
  if (index === 2) return 'rank-third'
  return 'rank-normal'
}

const getRankColor = (index: number) => {
  if (index === 0) return '#FFD700' // 金色
  if (index === 1) return '#C0C0C0' // 银色
  if (index === 2) return '#CD7F32' // 铜色
  return '#666'
}

const getRankingValue = (emp: any) => {
  switch (rankingType.value) {
    case 'piece_amount':
      return `¥${emp.piece_amount}`
    case 'piece_qty':
      return `${emp.piece_qty}件`
    case 'total_hours':
      return `${emp.total_hours}h`
    default:
      return emp.piece_amount
  }
}

const getRankingLabel = () => {
  switch (rankingType.value) {
    case 'piece_amount':
      return '计件金额'
    case 'piece_qty':
      return '产量数量'
    case 'total_hours':
      return '工作时长'
    default:
      return '计件金额'
  }
}

const getEfficiencyPercentage = (row: any) => {
  const efficiency = row.total_hours > 0 ? 
    Math.round((row.piece_qty / row.total_hours) * 10) : 0
  return Math.min(efficiency, 100)
}

const getEfficiencyStatus = (row: any) => {
  const efficiency = getEfficiencyPercentage(row)
  if (efficiency >= 80) return 'success'
  if (efficiency >= 60) return 'warning'
  return 'exception'
}

// 分页事件处理
const handlePageChange = (page: number) => {
  pagination.page = page
}

const handlePageSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.page = 1
}

// 事件处理
const refreshData = async () => {
  await loadData()
}

const exportData = () => {
  // 模拟导出功能
  ElMessage.success('业绩报表导出成功')
}

const loadData = async () => {
  loading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const response = getTodayPerformance()
    employeeList.value = response.data
    
  } catch (error) {
    ElMessage.error('加载数据失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

// 组件挂载
onMounted(() => {
  updateCurrentDate()
  loadData()
})
</script>

<style scoped>
.perf-today-page {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 24px;
  background: var(--el-bg-color);
  border-radius: 12px;
  border: 1px solid var(--el-border-color);
}

[data-theme="factory"] .page-header {
  background: linear-gradient(135deg, rgba(0, 216, 255, 0.1) 0%, rgba(0, 27, 46, 0.9) 100%);
  border-color: rgba(0, 216, 255, 0.3);
}

.page-title {
  font-size: 24px;
  font-weight: bold;
  color: var(--el-text-color-primary);
  margin: 0 0 4px 0;
}

[data-theme="factory"] .page-title {
  color: var(--industrial-blue);
}

.page-subtitle {
  color: var(--el-text-color-regular);
  margin: 0;
  font-size: 14px;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.stats-section {
  margin-bottom: 24px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  padding: 12px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.1);
}

[data-theme="factory"] .stat-icon {
  background: rgba(0, 216, 255, 0.2);
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: var(--el-text-color-primary);
  font-family: 'Courier New', monospace;
  line-height: 1;
}

[data-theme="factory"] .stat-value {
  text-shadow: 0 0 10px currentColor;
}

.stat-label {
  font-size: 14px;
  color: var(--el-text-color-regular);
  margin-top: 4px;
}

.ranking-section,
.table-section {
  margin-bottom: 24px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.ranking-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.ranking-item {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px;
  background: var(--el-bg-color-page);
  border-radius: 12px;
  border-left: 4px solid var(--el-border-color);
  transition: all 0.3s ease;
}

.ranking-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.rank-first {
  border-left-color: #FFD700;
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, var(--el-bg-color-page) 100%);
}

.rank-second {
  border-left-color: #C0C0C0;
  background: linear-gradient(135deg, rgba(192, 192, 192, 0.1) 0%, var(--el-bg-color-page) 100%);
}

.rank-third {
  border-left-color: #CD7F32;
  background: linear-gradient(135deg, rgba(205, 127, 50, 0.1) 0%, var(--el-bg-color-page) 100%);
}

[data-theme="factory"] .ranking-item {
  background: rgba(0, 216, 255, 0.05);
  border-left-color: var(--industrial-blue);
}

.ranking-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  min-width: 50px;
}

.rank-number {
  font-size: 24px;
  font-weight: bold;
  color: var(--el-text-color-primary);
  font-family: 'Courier New', monospace;
}

.emp-info {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 150px;
}

.emp-name {
  margin: 0 0 4px 0;
  color: var(--el-text-color-primary);
  font-size: 16px;
  font-weight: 500;
}

.emp-id {
  margin: 0;
  color: var(--el-text-color-regular);
  font-size: 12px;
}

.perf-metrics {
  display: flex;
  gap: 24px;
  flex: 1;
}

.metric {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.metric-label {
  font-size: 12px;
  color: var(--el-text-color-regular);
}

.metric-value {
  font-size: 16px;
  font-weight: bold;
  color: var(--el-text-color-primary);
}

.perf-score {
  text-align: center;
  min-width: 100px;
}

.score-value {
  font-size: 20px;
  font-weight: bold;
  font-family: 'Courier New', monospace;
}

.score-label {
  font-size: 12px;
  color: var(--el-text-color-regular);
  margin-top: 4px;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  padding: 16px;
  background-color: #fafbfc;
  border-radius: 8px;
}

.table-section :deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;
}

.table-section :deep(.el-table__header) {
  background-color: #f8f9fa;
}

.table-section :deep(.el-table__row:hover) {
  background-color: #f0f9ff;
}

/* 响应式设计 */
@media (max-width: 1400px) {
  .stats-section :deep(.el-row) {
    gap: 12px;
  }
}

@media (max-width: 768px) {
  .perf-today-page {
    padding: 12px;
  }
  
  .page-header {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }
  
  .page-title {
    font-size: 20px;
  }
  
  .card-header {
    flex-direction: column;
    gap: 12px;
  }
  
  .ranking-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .perf-metrics {
    justify-content: space-around;
    width: 100%;
  }
}

@media (max-width: 480px) {
  .header-actions {
    flex-direction: column;
    width: 100%;
  }
}
</style> 