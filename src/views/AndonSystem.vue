<template>
  <div class="andon-system-container">
    <!-- 顶部统计面板 -->
    <div class="stats-panel">
      <div class="stat-card urgent" :class="{ 'blinking': stats.pendingCalls > 0 }">
        <div class="stat-icon">
          <el-icon size="28">
            <WarningFilled />
          </el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.pendingCalls }}</div>
          <div class="stat-label">待响应</div>
        </div>
      </div>

      <div class="stat-card warning">
        <div class="stat-icon">
          <el-icon size="28">
            <Tools />
          </el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.inProgressCalls }}</div>
          <div class="stat-label">处理中</div>
        </div>
      </div>

      <div class="stat-card success">
        <div class="stat-icon">
          <el-icon size="28">
            <CircleCheck />
          </el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.resolvedToday }}</div>
          <div class="stat-label">今日已解决</div>
        </div>
      </div>

      <div class="stat-card info">
        <div class="stat-icon">
          <el-icon size="28">
            <Timer />
          </el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.avgResponseTime }}分</div>
          <div class="stat-label">平均响应时间</div>
        </div>
      </div>

      <div class="stat-card info">
        <div class="stat-icon">
          <el-icon size="28">
            <Odometer />
          </el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.avgResolutionTime }}分</div>
          <div class="stat-label">平均解决时间</div>
        </div>
      </div>
    </div>

    <!-- 快速操作区 -->
    <div class="quick-actions">
      <el-button type="danger" size="large" @click="showCallModal = true" class="emergency-call">
        <el-icon>
          <Plus />
        </el-icon>
        紧急呼叫
      </el-button>

      <div class="filters">
        <el-select
          v-model="filterStatus"
          placeholder="状态筛选"
          style="width: 120px"
          clearable
          @change="loadCalls"
        >
          <el-option
            v-for="option in statusOptions"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
        
        <el-select
          v-model="filterType"
          placeholder="类型筛选"
          style="width: 120px"
          clearable
          @change="loadCalls"
        >
          <el-option
            v-for="option in typeOptions"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
        
        <el-select
          v-model="filterPriority"
          placeholder="优先级筛选"
          style="width: 120px"
          clearable
          @change="loadCalls"
        >
          <el-option
            v-for="option in priorityOptions"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>

        <el-button @click="loadCalls" type="primary" plain>
          <el-icon>
            <Refresh />
          </el-icon>
          刷新
        </el-button>
      </div>
    </div>

    <!-- 异常呼叫列表 -->
    <div class="calls-section">
      <el-card :border="false" class="calls-card">
        <template #header>
          <div class="section-header">
            <h3>异常呼叫列表</h3>
            <div class="auto-refresh">
              <el-switch 
                v-model="autoRefresh" 
                @change="toggleAutoRefresh"
                active-text="自动刷新开"
                inactive-text="自动刷新关"
              />
              <span v-if="autoRefresh" class="refresh-timer">{{ refreshCountdown }}s</span>
            </div>
          </div>
        </template>

        <el-table
          :data="paginatedCalls"
          v-loading="loading"
          stripe
          border
          style="width: 100%"
          :row-class-name="getRowClassName"
        >
          <el-table-column prop="callNumber" label="呼叫编号" width="130" fixed="left" />
          <el-table-column label="类型" width="100">
            <template #default="{ row }">
              <el-tag :type="getTypeTagType(row.type)">{{ getTypeLabel(row.type) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="优先级" width="80">
            <template #default="{ row }">
              <el-tag :type="getPriorityTagType(row.priority)">{{ getPriorityLabel(row.priority) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="title" label="标题" width="200" show-overflow-tooltip />
          <el-table-column label="位置" width="120">
            <template #default="{ row }">
              {{ row.location }} - {{ row.workstation }}
            </template>
          </el-table-column>
          <el-table-column prop="reportedBy" label="上报人" width="100" />
          <el-table-column label="上报时间" width="140">
            <template #default="{ row }">
              {{ formatDateTime(row.reportedAt) }}
            </template>
          </el-table-column>
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getStatusTagType(row.status)">{{ getStatusLabel(row.status) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="处理人" width="120">
            <template #default="{ row }">
              {{ row.assignedTo || '-' }}
            </template>
          </el-table-column>
          <el-table-column label="响应时间" width="100">
            <template #default="{ row }">
              {{ row.responseTime ? `${row.responseTime}分` : '-' }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120" fixed="right">
            <template #default="{ row }">
              <el-button
                size="small"
                type="primary"
                plain
                @click="handleViewCall(row)"
              >
                <el-icon>
                  <Operation />
                </el-icon>
                响应处理
              </el-button>
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

    <!-- 新增呼叫模态框 -->
    <el-dialog v-model="showCallModal" title="异常呼叫" width="600px" :close-on-click-modal="false">
      <el-form ref="callFormRef" :model="callForm" :rules="callFormRules" label-width="80px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="异常类型" prop="type">
              <el-select
                v-model="callForm.type"
                placeholder="选择异常类型"
                style="width: 100%"
              >
                <el-option
                  v-for="option in typeOptions"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="优先级" prop="priority">
              <el-select
                v-model="callForm.priority"
                placeholder="选择优先级"
                style="width: 100%"
              >
                <el-option
                  v-for="option in priorityOptions"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="标题" prop="title">
          <el-input v-model="callForm.title" placeholder="请输入异常标题" />
        </el-form-item>

        <el-row :gutter="16">
          <el-col :span="8">
            <el-form-item label="所在位置" prop="location">
              <el-input v-model="callForm.location" placeholder="车间/区域" />
            </el-form-item>
          </el-col>

          <el-col :span="8">
            <el-form-item label="工位" prop="workstation">
              <el-input v-model="callForm.workstation" placeholder="具体工位" />
            </el-form-item>
          </el-col>

          <el-col :span="8">
            <el-form-item label="生产线" prop="line">
              <el-input v-model="callForm.line" placeholder="生产线" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="问题描述" prop="description">
          <el-input
            v-model="callForm.description"
            type="textarea"
            :rows="4"
            placeholder="详细描述遇到的问题..."
          />
        </el-form-item>

        <el-form-item label="上传图片">
          <el-upload
            multiple
            :limit="3"
            list-type="picture-card"
            accept="image/*"
            :on-change="handleFileUpload"
          >
            <el-icon>
              <Plus />
            </el-icon>
          </el-upload>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showCallModal = false">取消</el-button>
          <el-button type="primary" @click="handleSubmitCall" :loading="submitting">
            提交呼叫
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 响应处理模态框 -->
    <el-dialog v-model="showResponseModal" title="响应处理" width="700px" :close-on-click-modal="false">
      <div v-if="selectedCall" class="response-content">
        <!-- 呼叫信息 -->
        <div class="call-info">
          <h4>{{ selectedCall.title }}</h4>
          <div class="call-meta">
            <el-tag :type="getTypeTagType(selectedCall.type)">{{ getTypeLabel(selectedCall.type) }}</el-tag>
            <el-tag :type="getPriorityTagType(selectedCall.priority)">{{ getPriorityLabel(selectedCall.priority) }}</el-tag>
            <span>{{ selectedCall.location }} - {{ selectedCall.workstation }}</span>
          </div>
          <p>{{ selectedCall.description }}</p>
        </div>

        <!-- 操作按钮 -->
        <div class="response-actions">
          <el-button
            v-if="selectedCall.status === 'pending'"
            type="info"
            @click="handleAcknowledge"
            :loading="processing"
          >
            <el-icon>
              <Select />
            </el-icon>
            确认接收
          </el-button>

          <el-button
            v-if="selectedCall.status === 'acknowledged'"
            type="warning"
            @click="handleStartProcess"
            :loading="processing"
          >
            <el-icon>
              <VideoPlay />
            </el-icon>
            开始处理
          </el-button>

          <el-button
            v-if="selectedCall.status === 'in_progress'"
            type="success"
            @click="showResolveForm = true"
          >
            <el-icon>
              <Check />
            </el-icon>
            标记解决
          </el-button>

          <el-button
            v-if="selectedCall.status === 'resolved'"
            type="primary"
            @click="handleClose"
            :loading="processing"
          >
            <el-icon>
              <FolderOpened />
            </el-icon>
            关闭工单
          </el-button>

          <el-button
            v-if="!selectedCall.escalated && selectedCall.priority !== 'urgent'"
            type="danger"
            @click="handleEscalate"
            :loading="processing"
          >
            <el-icon>
              <Top />
            </el-icon>
            升级处理
          </el-button>
        </div>

        <!-- 解决方案表单 -->
        <div v-if="showResolveForm" class="resolve-form">
          <el-divider>解决方案</el-divider>
          <el-form ref="resolveFormRef" :model="resolveForm" label-width="100px">
            <el-form-item label="解决说明" prop="resolutionNote">
              <el-input
                v-model="resolveForm.resolutionNote"
                type="textarea"
                :rows="3"
                placeholder="请描述解决过程和结果..."
              />
            </el-form-item>
          </el-form>
          
          <div class="resolve-actions">
            <el-button @click="showResolveForm = false">取消</el-button>
            <el-button type="success" @click="handleResolve" :loading="processing">
              确认解决
            </el-button>
          </div>
        </div>

        <!-- 时间线 -->
        <div class="timeline">
          <el-divider>处理时间线</el-divider>
          <el-timeline>
            <el-timeline-item
              type="primary"
              :timestamp="formatDateTime(selectedCall.reportedAt)"
            >
              异常上报
            </el-timeline-item>
            
            <el-timeline-item
              v-if="selectedCall.acknowledgedAt"
              type="warning"
              :timestamp="formatDateTime(selectedCall.acknowledgedAt)"
            >
              确认接收
            </el-timeline-item>
            
            <el-timeline-item
              v-if="selectedCall.resolvedAt"
              type="success"
              :timestamp="formatDateTime(selectedCall.resolvedAt)"
            >
              问题解决 - {{ selectedCall.resolutionNote || '无备注' }}
            </el-timeline-item>
            
            <el-timeline-item
              v-if="selectedCall.closedAt"
              type="info"
              :timestamp="formatDateTime(selectedCall.closedAt)"
            >
              工单关闭
            </el-timeline-item>
          </el-timeline>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage, type FormInstance } from 'element-plus'
import {
  WarningFilled,
  Tools,
  CircleCheck,
  Timer,
  Odometer,
  Plus,
  Refresh,
  Operation,
  Select,
  VideoPlay,
  Check,
  FolderOpened,
  Top
} from '@element-plus/icons-vue'
import { getAndonCalls, getAndonStats, createAndonCall, updateAndonCall } from '@/mock/andon'
import type { AndonCall, AndonStats } from '@/types'

// 数据状态
const loading = ref(false)
const submitting = ref(false)
const processing = ref(false)
const calls = ref<AndonCall[]>([])
const stats = ref<AndonStats>({
  totalCalls: 0,
  pendingCalls: 0,
  inProgressCalls: 0,
  resolvedToday: 0,
  avgResponseTime: 0,
  avgResolutionTime: 0,
  callsByType: { equipment: 0, material: 0, quality: 0, safety: 0, other: 0 },
  callsByPriority: { low: 0, medium: 0, high: 0, urgent: 0 }
})

// 筛选状态
const filterStatus = ref<string | null>(null)
const filterType = ref<string | null>(null)
const filterPriority = ref<string | null>(null)

// 自动刷新
const autoRefresh = ref(true)
const refreshInterval = ref<number | null>(null)
const refreshCountdown = ref(30)

// 模态框状态
const showCallModal = ref(false)
const showResponseModal = ref(false)
const showResolveForm = ref(false)
const selectedCall = ref<AndonCall | null>(null)

// 表单
const callFormRef = ref<FormInstance | null>(null)
const resolveFormRef = ref<FormInstance | null>(null)
const callForm = reactive({
  type: '' as 'equipment' | 'material' | 'quality' | 'safety' | 'other' | '',
  priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
  title: '',
  description: '',
  location: '',
  workstation: '',
  line: ''
})
const resolveForm = reactive({
  resolutionNote: ''
})

// 选项配置
const statusOptions = [
  { label: '待响应', value: 'pending' },
  { label: '已确认', value: 'acknowledged' },
  { label: '处理中', value: 'in_progress' },
  { label: '已解决', value: 'resolved' },
  { label: '已关闭', value: 'closed' }
]

const typeOptions = [
  { label: '设备故障', value: 'equipment' },
  { label: '物料异常', value: 'material' },
  { label: '品质问题', value: 'quality' },
  { label: '安全事故', value: 'safety' },
  { label: '其他异常', value: 'other' }
]

const priorityOptions = [
  { label: '低', value: 'low' },
  { label: '中', value: 'medium' },
  { label: '高', value: 'high' },
  { label: '紧急', value: 'urgent' }
]

// 分页配置
const pagination = reactive({
  page: 1,
  pageSize: 10,
  itemCount: 0,
  pageSizes: [10, 20, 50]
})

// 计算属性
const paginatedCalls = computed(() => {
  const start = (pagination.page - 1) * pagination.pageSize
  const end = start + pagination.pageSize
  return calls.value.slice(start, end)
})

// 表单验证规则
const callFormRules = {
  type: { required: true, message: '请选择异常类型' },
  priority: { required: true, message: '请选择优先级' },
  title: { required: true, message: '请输入标题' },
  description: { required: true, message: '请输入问题描述' },
  location: { required: true, message: '请输入所在位置' },
  workstation: { required: true, message: '请输入工位' }
}

// 工具函数
const getTypeLabel = (type: string): string => {
  const map: Record<string, string> = {
    equipment: '设备故障',
    material: '物料异常',
    quality: '品质问题',
    safety: '安全事故',
    other: '其他异常'
  }
  return map[type] || type
}

const getTypeTagType = (type: string): string => {
  const map: Record<string, string> = {
    equipment: 'warning',
    material: 'info',
    quality: 'danger',
    safety: 'danger',
    other: 'info'
  }
  return map[type] || 'info'
}

const getPriorityLabel = (priority: string): string => {
  const map: Record<string, string> = {
    low: '低',
    medium: '中',
    high: '高',
    urgent: '紧急'
  }
  return map[priority] || priority
}

const getPriorityTagType = (priority: string): string => {
  const map: Record<string, string> = {
    low: 'info',
    medium: 'info',
    high: 'warning',
    urgent: 'danger'
  }
  return map[priority] || 'info'
}

const getStatusLabel = (status: string): string => {
  const map: Record<string, string> = {
    pending: '待响应',
    acknowledged: '已确认',
    in_progress: '处理中',
    resolved: '已解决',
    closed: '已关闭'
  }
  return map[status] || status
}

const getStatusTagType = (status: string): string => {
  const map: Record<string, string> = {
    pending: 'danger',
    acknowledged: 'warning',
    in_progress: 'info',
    resolved: 'success',
    closed: 'info'
  }
  return map[status] || 'info'
}

const getRowClassName = ({ row }: { row: AndonCall }): string => {
  if (row.priority === 'urgent') return 'urgent-row'
  if (row.status === 'pending') return 'pending-row'
  return ''
}

const formatDateTime = (dateTime: string): string => {
  return new Date(dateTime).toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 方法
const loadCalls = async () => {
  loading.value = true
  try {
    const params = {
      status: filterStatus.value || undefined,
      type: filterType.value || undefined,
      priority: filterPriority.value || undefined,
      page: pagination.page,
      pageSize: pagination.pageSize
    }
    
    const result = await getAndonCalls(params)
    calls.value = result.data
    pagination.itemCount = result.total || result.data.length
  } catch (error) {
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

const loadStats = async () => {
  try {
    stats.value = await getAndonStats()
  } catch (error) {
    ElMessage.error('加载统计数据失败')
  }
}

const handleViewCall = (call: AndonCall) => {
  selectedCall.value = call
  showResponseModal.value = true
  showResolveForm.value = false
  resolveForm.resolutionNote = ''
}

const handleSubmitCall = async () => {
  if (!callFormRef.value) return
  
  try {
    await callFormRef.value.validate()
    submitting.value = true
    
    // 确保类型字段不为空
    const submitData = {
      ...callForm,
      type: callForm.type as 'equipment' | 'material' | 'quality' | 'safety' | 'other'
    }
    
    await createAndonCall(submitData)
    ElMessage.success('异常呼叫提交成功')
    
    showCallModal.value = false
    resetCallForm()
    loadCalls()
    loadStats()
  } catch (error) {
    ElMessage.error('提交失败')
  } finally {
    submitting.value = false
  }
}

const handleAcknowledge = async () => {
  if (!selectedCall.value) return
  
  processing.value = true
  try {
    const updateData = {
      status: 'acknowledged' as const,
      acknowledgedAt: new Date().toISOString(),
      assignedTo: '当前用户', // 实际应该是登录用户
      responseTime: Math.floor((Date.now() - new Date(selectedCall.value.reportedAt).getTime()) / 60000)
    }
    
    await updateAndonCall(selectedCall.value.id, updateData)
    Object.assign(selectedCall.value, updateData)
    
    ElMessage.success('已确认接收')
    loadCalls()
    loadStats()
  } catch (error) {
    ElMessage.error('操作失败')
  } finally {
    processing.value = false
  }
}

const handleStartProcess = async () => {
  if (!selectedCall.value) return
  
  processing.value = true
  try {
    const updateData = {
      status: 'in_progress' as const
    }
    
    await updateAndonCall(selectedCall.value.id, updateData)
    Object.assign(selectedCall.value, updateData)
    
    ElMessage.success('已开始处理')
    loadCalls()
  } catch (error) {
    ElMessage.error('操作失败')
  } finally {
    processing.value = false
  }
}

const handleResolve = async () => {
  if (!selectedCall.value) return
  
  processing.value = true
  try {
    const resolutionTime = Math.floor((Date.now() - new Date(selectedCall.value.reportedAt).getTime()) / 60000)
    const updateData = {
      status: 'resolved' as const,
      resolvedAt: new Date().toISOString(),
      resolutionTime,
      resolutionNote: resolveForm.resolutionNote
    }
    
    await updateAndonCall(selectedCall.value.id, updateData)
    Object.assign(selectedCall.value, updateData)
    
    ElMessage.success('已标记为解决')
    showResolveForm.value = false
    loadCalls()
    loadStats()
  } catch (error) {
    ElMessage.error('操作失败')
  } finally {
    processing.value = false
  }
}

const handleClose = async () => {
  if (!selectedCall.value) return
  
  processing.value = true
  try {
    const updateData = {
      status: 'closed' as const,
      closedAt: new Date().toISOString()
    }
    
    await updateAndonCall(selectedCall.value.id, updateData)
    Object.assign(selectedCall.value, updateData)
    
    ElMessage.success('工单已关闭')
    showResponseModal.value = false
    loadCalls()
    loadStats()
  } catch (error) {
    ElMessage.error('操作失败')
  } finally {
    processing.value = false
  }
}

const handleEscalate = async () => {
  if (!selectedCall.value) return
  
  processing.value = true
  try {
    const updateData = {
      escalated: true,
      escalatedAt: new Date().toISOString(),
      escalatedTo: '上级主管',
      priority: 'urgent' as const
    }
    
    await updateAndonCall(selectedCall.value.id, updateData)
    Object.assign(selectedCall.value, updateData)
    
    ElMessage.warning('已升级至上级处理')
    loadCalls()
    loadStats()
  } catch (error) {
    ElMessage.error('操作失败')
  } finally {
    processing.value = false
  }
}

const handleFileUpload = (file: any) => {
  // 处理文件上传
  console.log('上传文件:', file)
}

const resetCallForm = () => {
  Object.assign(callForm, {
    type: '',
    priority: 'medium',
    title: '',
    description: '',
    location: '',
    workstation: '',
    line: ''
  })
}

const toggleAutoRefresh = (enabled: boolean) => {
  if (enabled) {
    startAutoRefresh()
  } else {
    stopAutoRefresh()
  }
}

const startAutoRefresh = () => {
  refreshInterval.value = window.setInterval(() => {
    refreshCountdown.value--
    if (refreshCountdown.value <= 0) {
      loadCalls()
      loadStats()
      refreshCountdown.value = 30
    }
  }, 1000)
}

const stopAutoRefresh = () => {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value)
    refreshInterval.value = null
  }
}

const handlePageChange = (page: number) => {
  pagination.page = page
  loadCalls()
}

const handlePageSizeChange = (pageSize: number) => {
  pagination.pageSize = pageSize
  pagination.page = 1
  loadCalls()
}

// 生命周期
onMounted(() => {
  loadCalls()
  loadStats()
  if (autoRefresh.value) {
    startAutoRefresh()
  }
})

onUnmounted(() => {
  stopAutoRefresh()
})
</script>

<style scoped>
.andon-system-container {
  padding: 16px;
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  min-height: 100vh;
  color: white;
}

.stats-panel {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.stat-card.urgent {
  background: rgba(255, 0, 0, 0.2);
  border-color: rgba(255, 0, 0, 0.5);
}

.stat-card.warning {
  background: rgba(255, 165, 0, 0.2);
  border-color: rgba(255, 165, 0, 0.5);
}

.stat-card.success {
  background: rgba(0, 255, 0, 0.2);
  border-color: rgba(0, 255, 0, 0.5);
}

.stat-card.info {
  background: rgba(0, 123, 255, 0.2);
  border-color: rgba(0, 123, 255, 0.5);
}

.stat-card.blinking {
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0.7; }
}

.stat-icon {
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  line-height: 1.2;
}

.stat-label {
  font-size: 14px;
  opacity: 0.8;
  margin-top: 4px;
}

.quick-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.emergency-call {
  font-size: 16px;
  padding: 12px 24px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

.filters {
  display: flex;
  gap: 12px;
  align-items: center;
}

.calls-section {
  margin-bottom: 24px;
}

.calls-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
}

.calls-card :deep(.el-card__body) {
  padding: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-header h3 {
  margin: 0;
  color: #333;
}

.auto-refresh {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #666;
}

.refresh-timer {
  font-weight: bold;
  color: #007bff;
}

.response-content {
  max-height: 70vh;
  overflow-y: auto;
}

.call-info h4 {
  margin: 0 0 12px 0;
  color: #333;
}

.call-meta {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 12px;
}

.call-meta span {
  color: #666;
}

.response-actions {
  display: flex;
  gap: 12px;
  margin: 20px 0;
  flex-wrap: wrap;
}

.resolve-form {
  margin-top: 20px;
}

.resolve-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 16px;
}

.timeline {
  margin-top: 24px;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 表格行样式 */
:deep(.urgent-row) {
  background-color: rgba(255, 0, 0, 0.1) !important;
}

:deep(.pending-row) {
  background-color: rgba(255, 165, 0, 0.1) !important;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .andon-system-container {
    padding: 12px;
  }
  
  .stats-panel {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .quick-actions {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filters {
    justify-content: space-between;
  }
  
  .response-actions {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .stats-panel {
    grid-template-columns: 1fr;
  }
  
  .filters {
    flex-direction: column;
  }
}
</style> 