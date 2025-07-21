<template>
  <div class="attendance-record">
    <!-- 统计卡片 -->
    <div class="stats-grid">
      <el-card class="stat-card present" shadow="hover">
        <div class="stat-content">
          <div class="stat-icon">
            <el-icon size="28">
              <Check />
            </el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.presentToday }}</div>
            <div class="stat-label">今日出勤</div>
          </div>
        </div>
      </el-card>
      
      <el-card class="stat-card absent" shadow="hover">
        <div class="stat-content">
          <div class="stat-icon">
            <el-icon size="28">
              <Close />
            </el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.absentToday }}</div>
            <div class="stat-label">今日缺勤</div>
          </div>
        </div>
      </el-card>
      
      <el-card class="stat-card late" shadow="hover">
        <div class="stat-content">
          <div class="stat-icon">
            <el-icon size="28">
              <Clock />
            </el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.lateToday }}</div>
            <div class="stat-label">今日迟到</div>
          </div>
        </div>
      </el-card>
      
      <el-card class="stat-card overtime" shadow="hover">
        <div class="stat-content">
          <div class="stat-icon">
            <el-icon size="28">
              <TrendCharts />
            </el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.overtimeToday }}</div>
            <div class="stat-label">今日加班</div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 搜索和操作栏 -->
    <el-card class="search-card" shadow="never">
      <div class="search-row">
        <div class="search-controls">
          <el-date-picker 
            v-model="searchForm.date" 
            type="date" 
            placeholder="选择日期"
            value-format="YYYY-MM-DD"
          />
          <el-select
            v-model="searchForm.department"
            placeholder="选择部门"
            clearable
            style="width: 150px"
          >
            <el-option
              v-for="option in departmentOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
          <el-select
            v-model="searchForm.status"
            placeholder="考勤状态"
            clearable
            style="width: 150px"
          >
            <el-option
              v-for="option in statusOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
          <el-input
            v-model="searchForm.keyword"
            placeholder="搜索员工姓名"
            clearable
            style="width: 200px"
          />
          <el-button type="primary" :icon="Search" @click="handleSearch">
            搜索
          </el-button>
          <el-button @click="handleReset">重置</el-button>
        </div>
        
        <div class="action-controls">
          <el-button type="primary" :icon="Download" @click="handleExport">
            导出记录
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 考勤记录表格 -->
    <el-card shadow="never">
      <el-table
        :data="records"
        v-loading="loading"
        stripe
        border
                  max-height="600px"
      >
        <el-table-column
          prop="employeeId"
          label="员工工号"
          width="100"
        />
        <el-table-column
          prop="employeeName"
          label="姓名"
          width="100"
        />
        <el-table-column
          prop="department"
          label="部门"
          width="100"
        />
        <el-table-column
          prop="position"
          label="职位"
          width="100"
        />
        <el-table-column
          prop="date"
          label="日期"
          width="120"
        />
        <el-table-column
          label="班次"
          width="100"
        >
          <template #default="{ row }">
            <el-tag 
              :type="getShiftTagType(row.shiftType.color)"
              size="small"
            >
              {{ row.shiftType.name }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="上班打卡"
          width="120"
        >
          <template #default="{ row }">
            {{ row.checkInTime || '--' }}
          </template>
        </el-table-column>
        <el-table-column
          label="下班打卡"
          width="120"
        >
          <template #default="{ row }">
            {{ row.checkOutTime || '--' }}
          </template>
        </el-table-column>
        <el-table-column
          label="实际工时"
          width="100"
        >
          <template #default="{ row }">
            {{ row.actualHours.toFixed(2) }}h
          </template>
        </el-table-column>
        <el-table-column
          label="加班时长"
          width="100"
        >
          <template #default="{ row }">
            {{ row.overtime > 0 ? row.overtime.toFixed(2) + 'h' : '--' }}
          </template>
        </el-table-column>
        <el-table-column
          label="状态"
          width="100"
        >
          <template #default="{ row }">
            <el-tag 
              :type="getStatusTagType(row.status)"
              size="small"
            >
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :page-sizes="pagination.pageSizes"
          :total="pagination.itemCount"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handlePageSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  Check, Close, Clock, TrendCharts, Search, Download
} from '@element-plus/icons-vue'
import { getAttendanceRecords, getAttendanceStats } from '@/mock/attendance'
import type { AttendanceRecord, AttendanceStats } from '@/types'

// 统计数据
const stats = ref<AttendanceStats>({
  totalEmployees: 0,
  presentToday: 0,
  absentToday: 0,
  lateToday: 0,
  overtimeToday: 0,
  monthlyAvgAttendance: 0,
  monthlyTotalHours: 0,
  monthlyOvertimeHours: 0
})

// 搜索表单
const searchForm = reactive({
  date: null as string | null,
  department: null as string | null,
  status: null as string | null,
  keyword: ''
})

// 考勤记录
const records = ref<AttendanceRecord[]>([])
const loading = ref(false)

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 10,
  itemCount: 0,
  pageSizes: [10, 20, 50]
})

// 选项
const departmentOptions = [
  { label: '生产部', value: '生产部' },
  { label: '质检部', value: '质检部' },
  { label: '维修部', value: '维修部' },
  { label: '仓储部', value: '仓储部' }
]

const statusOptions = [
  { label: '正常', value: 'normal' },
  { label: '迟到', value: 'late' },
  { label: '早退', value: 'early_leave' },
  { label: '缺勤', value: 'absent' },
  { label: '请假', value: 'leave' },
  { label: '加班', value: 'overtime' }
]

// 获取班次标签类型
function getShiftTagType(color: string) {
  const colorMap: Record<string, string> = {
    '#409EFF': 'primary',
    '#67C23A': 'success',
    '#E6A23C': 'warning',
    '#F56C6C': 'danger'
  }
  return colorMap[color] || 'primary'
}

// 获取状态标签类型
function getStatusTagType(status: string) {
  const statusMap: Record<string, string> = {
    normal: 'success',
    late: 'warning',
    early_leave: 'warning',
    absent: 'danger',
    leave: 'info',
    overtime: 'primary'
  }
  return statusMap[status] || 'info'
}

// 获取状态标签文本
function getStatusLabel(status: string) {
  const statusMap: Record<string, string> = {
    normal: '正常',
    late: '迟到',
    early_leave: '早退',
    absent: '缺勤',
    leave: '请假',
    overtime: '加班'
  }
  return statusMap[status] || '未知'
}

// 加载统计数据
async function loadStats() {
  try {
    const result = await getAttendanceStats() as any
    if (result.code === 200) {
      stats.value = result.data
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

// 加载考勤记录
async function loadRecords() {
  loading.value = true
  try {
    const result = await getAttendanceRecords({
      page: pagination.page,
      pageSize: pagination.pageSize,
      ...searchForm
    }) as any
    
    if (result.code === 200) {
      records.value = result.data.list
      pagination.itemCount = result.data.total
    }
  } catch (error) {
    console.error('加载考勤记录失败:', error)
    ElMessage.error('加载考勤记录失败')
  } finally {
    loading.value = false
  }
}

// 搜索
function handleSearch() {
  pagination.page = 1
  loadRecords()
}

// 重置
function handleReset() {
  Object.keys(searchForm).forEach(key => {
    ;(searchForm as any)[key] = key === 'keyword' ? '' : null
  })
  pagination.page = 1
  loadRecords()
}

// 导出
function handleExport() {
  ElMessage.info('导出功能开发中...')
}

// 分页变化
function handlePageChange(page: number) {
  pagination.page = page
  loadRecords()
}

function handlePageSizeChange(pageSize: number) {
  pagination.pageSize = pageSize
  pagination.page = 1
  loadRecords()
}

onMounted(() => {
  loadStats()
  loadRecords()
})
</script>

<style scoped>
.attendance-record {
  padding: 16px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

.stat-card {
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-card.present :deep(.el-card__body) {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border: 1px solid #0ea5e9;
}

.stat-card.absent :deep(.el-card__body) {
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  border: 1px solid #ef4444;
}

.stat-card.late :deep(.el-card__body) {
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
  border: 1px solid #f59e0b;
}

.stat-card.overtime :deep(.el-card__body) {
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border: 1px solid #22c55e;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: var(--el-text-color-regular);
}

.search-card {
  margin-bottom: 16px;
}

.search-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.search-controls {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
}

.action-controls {
  display: flex;
  gap: 12px;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

/* 工厂主题特效 */
[data-theme="factory"] .stat-card :deep(.el-card__body) {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%) !important;
  border: 1px solid #0f3460 !important;
  box-shadow: 0 0 20px rgba(0, 212, 255, 0.1);
}

[data-theme="factory"] .stat-card:hover {
  box-shadow: 0 0 30px rgba(0, 212, 255, 0.3);
  transform: translateY(-2px);
}

[data-theme="factory"] .stat-icon {
  background: rgba(0, 212, 255, 0.1);
  border: 1px solid rgba(0, 212, 255, 0.3);
}

[data-theme="factory"] .stat-value {
  color: #00d4ff;
  text-shadow: 0 0 10px rgba(0, 212, 255, 0.5);
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .search-row {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-controls,
  .action-controls {
    justify-content: center;
  }
}
</style> 