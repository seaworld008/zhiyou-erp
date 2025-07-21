<template>
  <div class="system-log">
    <!-- Header Section -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">
          <el-icon><Document /></el-icon>
          审计日志
        </h1>
        <p class="page-desc">操作记录、日志查询、安全审计</p>
      </div>
      <div class="header-actions">
        <el-button :icon="Download" @click="exportLogs">
          导出日志
        </el-button>
        <el-button :icon="Delete" @click="clearLogs" :disabled="selectedRows.length === 0">
          清理日志
        </el-button>
        <el-button :icon="Refresh" @click="refreshData" :loading="loading">
          刷新
        </el-button>
      </div>
    </div>

    <!-- Statistics Cards -->
    <div class="stats-section">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon primary">
            <el-icon><DocumentCopy /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.totalLogs }}</div>
            <div class="stat-label">总日志数</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon success">
            <el-icon><SuccessFilled /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.todaySuccess }}</div>
            <div class="stat-label">今日成功操作</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon danger">
            <el-icon><WarningFilled /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.todayFailed }}</div>
            <div class="stat-label">今日失败操作</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon warning">
            <el-icon><User /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.activeUsers }}</div>
            <div class="stat-label">活跃用户数</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filter Section -->
    <div class="filter-section">
      <el-form :model="filters" inline class="filter-form">
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="filters.dateRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>
        <el-form-item label="用户">
          <el-select v-model="filters.userId" placeholder="选择用户" clearable filterable>
            <el-option
              v-for="user in users"
              :key="user.id"
              :label="user.name"
              :value="user.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="操作类型">
          <el-select v-model="filters.actionType" placeholder="选择操作类型" clearable>
            <el-option label="登录" value="login" />
            <el-option label="登出" value="logout" />
            <el-option label="创建" value="create" />
            <el-option label="更新" value="update" />
            <el-option label="删除" value="delete" />
            <el-option label="查询" value="query" />
            <el-option label="导出" value="export" />
            <el-option label="配置" value="config" />
          </el-select>
        </el-form-item>
        <el-form-item label="模块">
          <el-select v-model="filters.module" placeholder="选择模块" clearable>
            <el-option label="用户管理" value="user" />
            <el-option label="生产管理" value="production" />
            <el-option label="品质管理" value="quality" />
            <el-option label="设备管理" value="equipment" />
            <el-option label="库存管理" value="inventory" />
            <el-option label="系统设置" value="system" />
          </el-select>
        </el-form-item>
        <el-form-item label="IP地址">
          <el-input
            v-model="filters.ipAddress"
            placeholder="输入IP地址"
            clearable
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filters.status" placeholder="选择状态" clearable>
            <el-option label="成功" value="success" />
            <el-option label="失败" value="failed" />
            <el-option label="异常" value="error" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">
            搜索
          </el-button>
          <el-button :icon="Refresh" @click="resetFilters">
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- Data Table -->
    <div class="table-section">
      <el-table
        v-loading="loading"
        :data="tableData"
        stripe
        border
        height="500"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="created_at" label="时间" width="160" sortable />
        <el-table-column prop="user_name" label="用户" width="100" />
        <el-table-column prop="action_type" label="操作类型" width="100">
          <template #default="{ row }">
            <el-tag :type="getActionTypeColor(row.action_type)">
              {{ getActionTypeText(row.action_type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="module" label="模块" width="100">
          <template #default="{ row }">
            <el-tag type="info" size="small">
              {{ getModuleText(row.module) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="操作描述" min-width="200" show-overflow-tooltip />
        <el-table-column prop="ip_address" label="IP地址" width="120" />
        <el-table-column prop="user_agent" label="客户端" width="120" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag
              :type="row.status === 'success' ? 'success' : row.status === 'failed' ? 'danger' : 'warning'"
              size="small"
            >
              {{ row.status === 'success' ? '成功' : row.status === 'failed' ? '失败' : '异常' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="duration" label="耗时(ms)" width="100" align="right" />
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              :icon="View"
              @click="viewDetail(row)"
            >
              详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- Pagination -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.size"
          :total="pagination.total"
          :page-sizes="[20, 50, 100, 200]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSearch"
          @current-change="handleSearch"
        />
      </div>
    </div>

    <!-- Detail Dialog -->
    <el-dialog
      v-model="showDetailDialog"
      title="日志详情"
      width="700px"
      :close-on-click-modal="false"
    >
      <div class="log-detail" v-if="currentLog">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="操作时间">
            {{ currentLog.created_at }}
          </el-descriptions-item>
          <el-descriptions-item label="用户">
            {{ currentLog.user_name }}
          </el-descriptions-item>
          <el-descriptions-item label="操作类型">
            <el-tag :type="getActionTypeColor(currentLog.action_type)">
              {{ getActionTypeText(currentLog.action_type) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="模块">
            <el-tag type="info">{{ getModuleText(currentLog.module) }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="IP地址">
            {{ currentLog.ip_address }}
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag
              :type="currentLog.status === 'success' ? 'success' : currentLog.status === 'failed' ? 'danger' : 'warning'"
            >
              {{ currentLog.status === 'success' ? '成功' : currentLog.status === 'failed' ? '失败' : '异常' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="耗时">
            {{ currentLog.duration }}ms
          </el-descriptions-item>
          <el-descriptions-item label="请求ID">
            {{ currentLog.request_id }}
          </el-descriptions-item>
        </el-descriptions>

        <div class="detail-section">
          <h4>操作描述</h4>
          <div class="description-text">{{ currentLog.description }}</div>
        </div>

        <div class="detail-section">
          <h4>客户端信息</h4>
          <div class="user-agent-text">{{ currentLog.user_agent }}</div>
        </div>

        <div class="detail-section" v-if="currentLog.request_data">
          <h4>请求参数</h4>
          <pre class="json-data">{{ formatJSON(currentLog.request_data) }}</pre>
        </div>

        <div class="detail-section" v-if="currentLog.response_data">
          <h4>响应数据</h4>
          <pre class="json-data">{{ formatJSON(currentLog.response_data) }}</pre>
        </div>

        <div class="detail-section" v-if="currentLog.error_message">
          <h4>错误信息</h4>
          <div class="error-text">{{ currentLog.error_message }}</div>
        </div>
      </div>
      <template #footer>
        <el-button @click="showDetailDialog = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import {
  Document, Download, Delete, Refresh, Search, View,
  DocumentCopy, SuccessFilled, WarningFilled, User
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import dayjs from 'dayjs'

// Interfaces
interface LogRecord {
  id: string
  user_id: string
  user_name: string
  action_type: string
  module: string
  description: string
  ip_address: string
  user_agent: string
  status: 'success' | 'failed' | 'error'
  duration: number
  request_id: string
  created_at: string
  request_data?: any
  response_data?: any
  error_message?: string
}

interface User {
  id: string
  name: string
}

// Reactive data
const loading = ref(false)
const showDetailDialog = ref(false)
const selectedRows = ref<LogRecord[]>([])
const currentLog = ref<LogRecord | null>(null)

const stats = reactive({
  totalLogs: 15847,
  todaySuccess: 1256,
  todayFailed: 23,
  activeUsers: 45
})

const filters = reactive({
  dateRange: [
    dayjs().subtract(7, 'day').format('YYYY-MM-DD HH:mm:ss'),
    dayjs().format('YYYY-MM-DD HH:mm:ss')
  ],
  userId: '',
  actionType: '',
  module: '',
  ipAddress: '',
  status: ''
})

const pagination = reactive({
  page: 1,
  size: 20,
  total: 0
})

// Mock data
const tableData = ref<LogRecord[]>([
  {
    id: 'LOG001',
    user_id: 'U001',
    user_name: '张三',
    action_type: 'login',
    module: 'system',
    description: '用户登录系统',
    ip_address: '192.168.1.100',
    user_agent: 'Chrome/120.0.0.0 Windows NT 10.0',
    status: 'success',
    duration: 245,
    request_id: 'REQ_' + Date.now(),
    created_at: '2025-01-17 09:15:23'
  },
  {
    id: 'LOG002',
    user_id: 'U002',
    user_name: '李四',
    action_type: 'create',
    module: 'production',
    description: '创建工单WO2025001',
    ip_address: '192.168.1.101',
    user_agent: 'Chrome/120.0.0.0 Windows NT 10.0',
    status: 'success',
    duration: 156,
    request_id: 'REQ_' + (Date.now() - 1000),
    created_at: '2025-01-17 09:12:45',
    request_data: { workorder_id: 'WO2025001', product_code: 'P001', plan_qty: 100 }
  },
  {
    id: 'LOG003',
    user_id: 'U003',
    user_name: '王五',
    action_type: 'update',
    module: 'quality',
    description: '更新质检记录QC001',
    ip_address: '192.168.1.102',
    user_agent: 'Chrome/120.0.0.0 Windows NT 10.0',
    status: 'failed',
    duration: 89,
    request_id: 'REQ_' + (Date.now() - 2000),
    created_at: '2025-01-17 09:08:12',
    error_message: '权限不足，无法更新质检记录'
  },
  {
    id: 'LOG004',
    user_id: 'U001',
    user_name: '张三',
    action_type: 'export',
    module: 'inventory',
    description: '导出库存数据',
    ip_address: '192.168.1.100',
    user_agent: 'Chrome/120.0.0.0 Windows NT 10.0',
    status: 'success',
    duration: 2340,
    request_id: 'REQ_' + (Date.now() - 3000),
    created_at: '2025-01-17 09:05:33'
  },
  {
    id: 'LOG005',
    user_id: 'U004',
    user_name: '赵六',
    action_type: 'delete',
    module: 'equipment',
    description: '删除设备维护记录',
    ip_address: '192.168.1.103',
    user_agent: 'Chrome/120.0.0.0 Windows NT 10.0',
    status: 'success',
    duration: 67,
    request_id: 'REQ_' + (Date.now() - 4000),
    created_at: '2025-01-17 09:02:15'
  }
])

const users = ref<User[]>([
  { id: 'U001', name: '张三' },
  { id: 'U002', name: '李四' },
  { id: 'U003', name: '王五' },
  { id: 'U004', name: '赵六' },
  { id: 'U005', name: '钱七' }
])

// Methods
const refreshData = async () => {
  loading.value = true
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    pagination.total = tableData.value.length
    ElMessage.success('数据刷新成功')
  } catch (error) {
    ElMessage.error('刷新失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  // Apply filters
  let filteredData = [...tableData.value]
  
  if (filters.dateRange && filters.dateRange.length === 2) {
    filteredData = filteredData.filter(item => 
      item.created_at >= filters.dateRange[0] && item.created_at <= filters.dateRange[1]
    )
  }
  
  if (filters.userId) {
    filteredData = filteredData.filter(item => item.user_id === filters.userId)
  }
  
  if (filters.actionType) {
    filteredData = filteredData.filter(item => item.action_type === filters.actionType)
  }
  
  if (filters.module) {
    filteredData = filteredData.filter(item => item.module === filters.module)
  }
  
  if (filters.ipAddress) {
    filteredData = filteredData.filter(item => 
      item.ip_address.includes(filters.ipAddress)
    )
  }
  
  if (filters.status) {
    filteredData = filteredData.filter(item => item.status === filters.status)
  }
  
  // Update pagination
  pagination.total = filteredData.length
}

const resetFilters = () => {
  filters.dateRange = [
    dayjs().subtract(7, 'day').format('YYYY-MM-DD HH:mm:ss'),
    dayjs().format('YYYY-MM-DD HH:mm:ss')
  ]
  filters.userId = ''
  filters.actionType = ''
  filters.module = ''
  filters.ipAddress = ''
  filters.status = ''
  handleSearch()
}

const handleSelectionChange = (rows: LogRecord[]) => {
  selectedRows.value = rows
}

const viewDetail = (row: LogRecord) => {
  currentLog.value = row
  showDetailDialog.value = true
}

const getActionTypeColor = (type: string) => {
  const colorMap: Record<string, string> = {
    login: 'success',
    logout: 'info',
    create: 'primary',
    update: 'warning',
    delete: 'danger',
    query: 'info',
    export: 'success',
    config: 'warning'
  }
  return colorMap[type] || 'info'
}

const getActionTypeText = (type: string) => {
  const textMap: Record<string, string> = {
    login: '登录',
    logout: '登出',
    create: '创建',
    update: '更新',
    delete: '删除',
    query: '查询',
    export: '导出',
    config: '配置'
  }
  return textMap[type] || type
}

const getModuleText = (module: string) => {
  const textMap: Record<string, string> = {
    user: '用户管理',
    production: '生产管理',
    quality: '品质管理',
    equipment: '设备管理',
    inventory: '库存管理',
    system: '系统设置'
  }
  return textMap[module] || module
}

const formatJSON = (data: any) => {
  try {
    return JSON.stringify(data, null, 2)
  } catch {
    return data
  }
}

const exportLogs = () => {
  ElMessage.success('导出日志功能开发中...')
}

const clearLogs = async () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请选择要清理的日志')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要清理选中的 ${selectedRows.value.length} 条日志吗？此操作不可恢复！`,
      '清理确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // Simulate API call
    const idsToDelete = selectedRows.value.map(row => row.id)
    tableData.value = tableData.value.filter(item => !idsToDelete.includes(item.id))
    
    ElMessage.success('清理成功')
    handleSearch()
  } catch {
    // User cancelled
  }
}

// Lifecycle
onMounted(() => {
  refreshData()
})

// Auto refresh every 30 seconds
setInterval(() => {
  if (!showDetailDialog.value) {
    refreshData()
  }
}, 30000)
</script>

<style scoped lang="scss">
.system-log {
  padding: 20px;
  background: var(--el-bg-color-page);
  min-height: 100vh;

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding: 20px;
    background: var(--el-bg-color);
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

    .header-left {
      .page-title {
        font-size: 24px;
        font-weight: 600;
        margin: 0 0 8px 0;
        color: var(--el-text-color-primary);
        display: flex;
        align-items: center;
        gap: 8px;

        .el-icon {
          color: var(--el-color-primary);
        }
      }

      .page-desc {
        margin: 0;
        color: var(--el-text-color-regular);
        font-size: 14px;
      }
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }
  }

  .stats-section {
    margin-bottom: 20px;

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;

      .stat-card {
        background: var(--el-bg-color);
        border-radius: 8px;
        padding: 20px;
        display: flex;
        align-items: center;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        transition: transform 0.2s ease;

        &:hover {
          transform: translateY(-2px);
        }

        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 16px;
          font-size: 24px;

          &.primary { background: rgba(64, 158, 255, 0.1); color: #409EFF; }
          &.success { background: rgba(103, 194, 58, 0.1); color: #67C23A; }
          &.danger { background: rgba(245, 108, 108, 0.1); color: #F56C6C; }
          &.warning { background: rgba(230, 162, 60, 0.1); color: #E6A23C; }
        }

        .stat-content {
          .stat-value {
            font-size: 28px;
            font-weight: 600;
            color: var(--el-text-color-primary);
            line-height: 1;
          }

          .stat-label {
            font-size: 14px;
            color: var(--el-text-color-regular);
            margin-top: 4px;
          }
        }
      }
    }
  }

  .filter-section {
    background: var(--el-bg-color);
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 20px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

    .filter-form {
      .el-form-item {
        margin-right: 20px;
        margin-bottom: 0;
      }
    }
  }

  .table-section {
    background: var(--el-bg-color);
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

    .pagination-wrapper {
      padding: 20px;
      display: flex;
      justify-content: center;
    }
  }

  .log-detail {
    .detail-section {
      margin-top: 20px;

      h4 {
        font-size: 14px;
        font-weight: 600;
        color: var(--el-text-color-primary);
        margin: 0 0 10px 0;
      }

      .description-text,
      .user-agent-text,
      .error-text {
        padding: 10px;
        background: var(--el-bg-color-page);
        border-radius: 4px;
        font-size: 13px;
        line-height: 1.5;
      }

      .error-text {
        background: rgba(245, 108, 108, 0.1);
        color: var(--el-color-danger);
      }

      .json-data {
        background: var(--el-bg-color-page);
        padding: 12px;
        border-radius: 4px;
        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        font-size: 12px;
        line-height: 1.4;
        overflow-x: auto;
        white-space: pre-wrap;
        word-break: break-all;
      }
    }
  }
}

// Factory theme enhancements
[data-theme="factory"] {
  .system-log {
    .page-header {
      background: rgba(0, 27, 46, 0.6);
      border: 1px solid rgba(0, 216, 255, 0.3);
      box-shadow: 0 0 20px rgba(0, 216, 255, 0.1);

      .page-title {
        color: #00D8FF;
        text-shadow: 0 0 10px rgba(0, 216, 255, 0.5);
      }
    }

    .stat-card {
      background: rgba(0, 27, 46, 0.6);
      border: 1px solid rgba(0, 216, 255, 0.2);
      box-shadow: 0 0 15px rgba(0, 216, 255, 0.1);

      &:hover {
        border-color: rgba(0, 216, 255, 0.5);
        box-shadow: 0 0 25px rgba(0, 216, 255, 0.2);
      }

      .stat-value {
        color: #00D8FF;
        text-shadow: 0 0 8px rgba(0, 216, 255, 0.5);
      }
    }

    .filter-section,
    .table-section {
      background: rgba(0, 27, 46, 0.6);
      border: 1px solid rgba(0, 216, 255, 0.2);
      box-shadow: 0 0 15px rgba(0, 216, 255, 0.1);
    }
  }
}

// Dark theme
[data-theme="dark"] {
  .system-log {
    .page-header,
    .filter-section,
    .table-section,
    .stat-card {
      background: var(--el-bg-color-overlay);
      border: 1px solid var(--el-border-color-darker);
    }

    .log-detail {
      .detail-section {
        .description-text,
        .user-agent-text,
        .json-data {
          background: var(--el-bg-color);
        }

        .error-text {
          background: rgba(245, 108, 108, 0.2);
        }
      }
    }
  }
}
</style> 