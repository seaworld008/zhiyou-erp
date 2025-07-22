<template>
  <div class="attendance-approval">
    <!-- 筛选栏 -->
    <el-card class="filter-card" shadow="never">
      <div class="filter-row">
        <div class="filters">
          <el-select
            v-model="filterForm.status"
            placeholder="审批状态"
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
          <el-select
            v-model="filterForm.type"
            placeholder="申请类型"
            clearable
            style="width: 150px"
          >
            <el-option
              v-for="option in typeOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
          <el-date-picker
            v-model="filterForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            clearable
          />
          <el-input
            v-model="filterForm.keyword"
            placeholder="搜索员工姓名"
            clearable
            style="width: 200px"
          />
          <el-button type="primary" @click="handleSearch">
            <el-icon>
              <Search />
            </el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">重置</el-button>
        </div>
        
        <div class="actions">
          <el-button type="primary" @click="showCreateModal = true">
            <el-icon>
              <Plus />
            </el-icon>
            新建申请
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 审批列表 -->
    <el-card shadow="never">
      <el-table
        :data="paginatedApprovals"
        v-loading="loading"
        stripe
        border
        style="width: 100%"
      >
        <el-table-column prop="employeeName" label="员工" width="100" />
        <el-table-column prop="department" label="部门" width="100" />
        <el-table-column label="申请类型" width="100">
          <template #default="{ row }">
            {{ getTypeLabel(row.type) }}
          </template>
        </el-table-column>
        <el-table-column prop="reason" label="申请原因" width="120" />
        <el-table-column prop="startDate" label="开始日期" width="120" />
        <el-table-column prop="endDate" label="结束日期" width="120" />
        <el-table-column label="时长" width="80">
          <template #default="{ row }">
            {{ row.duration }}天
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)" size="small">
              <el-icon style="margin-right: 4px;">
                <component :is="getStatusIcon(row.status)" />
              </el-icon>
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="提交时间" width="160">
          <template #default="{ row }">
            {{ formatDateTime(row.submittedAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <div style="display: flex; gap: 8px;">
              <el-button size="small" type="primary" @click="handleViewDetail(row)">
                查看
              </el-button>
              <el-button 
                v-if="row.status === 'pending'"
                size="small" 
                type="success" 
                @click="handleShowApproval(row)"
              >
                审批
              </el-button>
            </div>
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

    <!-- 创建申请模态框 -->
    <el-dialog
      v-model="showCreateModal"
      title="新建申请"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form ref="createFormRef" :model="createForm" :rules="createRules" label-width="80px">
        <el-form-item label="申请类型" prop="type">
          <el-select
            v-model="createForm.type"
            placeholder="选择申请类型"
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
        
        <el-form-item label="开始日期" prop="startDate">
          <el-date-picker
            v-model="createForm.startDate"
            type="date"
            placeholder="选择开始日期"
            style="width: 100%"
          />
        </el-form-item>
        
        <el-form-item label="结束日期" prop="endDate">
          <el-date-picker
            v-model="createForm.endDate"
            type="date"
            placeholder="选择结束日期"
            style="width: 100%"
          />
        </el-form-item>
        
        <el-form-item label="申请原因" prop="reason">
          <el-input
            v-model="createForm.reason"
            placeholder="请输入申请原因"
          />
        </el-form-item>
        
        <el-form-item label="详细说明" prop="description">
          <el-input
            v-model="createForm.description"
            type="textarea"
            placeholder="请输入详细说明"
            :rows="3"
          />
        </el-form-item>
        
        <el-form-item label="附件">
          <el-upload
            v-model:file-list="createForm.attachments"
            :limit="3"
            list-type="text"
            accept=".pdf,.doc,.docx,.jpg,.png"
          >
            <el-button>上传附件</el-button>
          </el-upload>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showCreateModal = false">取消</el-button>
          <el-button type="primary" @click="handleSubmitApplication">提交申请</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 审批处理模态框 -->
    <el-dialog
      v-model="showApprovalModal"
      title="审批处理"
      width="600px"
      :close-on-click-modal="false"
      class="approval-dialog"
    >
      <div class="approval-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="员工">{{ currentApproval?.employeeName }}</el-descriptions-item>
          <el-descriptions-item label="部门">{{ currentApproval?.department }}</el-descriptions-item>
          <el-descriptions-item label="申请类型">{{ getTypeLabel(currentApproval?.type) }}</el-descriptions-item>
          <el-descriptions-item label="申请原因">{{ currentApproval?.reason }}</el-descriptions-item>
          <el-descriptions-item label="开始日期">{{ currentApproval?.startDate }}</el-descriptions-item>
          <el-descriptions-item label="结束日期">{{ currentApproval?.endDate }}</el-descriptions-item>
          <el-descriptions-item label="时长">{{ currentApproval?.duration }}天</el-descriptions-item>
          <el-descriptions-item label="提交时间">{{ formatDateTime(currentApproval?.submittedAt) }}</el-descriptions-item>
        </el-descriptions>
        
        <el-divider>详细说明</el-divider>
        <div class="description">{{ currentApproval?.description }}</div>
        
        <el-divider v-if="currentApproval?.attachments?.length">附件</el-divider>
        <div v-if="currentApproval?.attachments?.length" class="attachments">
          <el-tag v-for="file in currentApproval.attachments" :key="file" type="info">
            {{ file }}
          </el-tag>
        </div>
        
        <el-divider>审批意见</el-divider>
        <el-form>
          <el-form-item label="处理结果">
            <el-radio-group v-model="approvalForm.action">
              <el-radio value="approve">同意</el-radio>
              <el-radio value="reject">拒绝</el-radio>
            </el-radio-group>
          </el-form-item>
          
          <el-form-item label="审批意见">
            <el-input
              v-model="approvalForm.comment"
              type="textarea"
              placeholder="请输入审批意见"
              :rows="3"
            />
          </el-form-item>
        </el-form>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showApprovalModal = false">取消</el-button>
          <el-button type="primary" @click="handleApprove">确认审批</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Plus, CircleCheck, CircleClose, Clock } from '@element-plus/icons-vue'
import { getAttendanceApprovals, submitAttendanceApproval, approveAttendance } from '@/mock/attendance'
import type { AttendanceApproval } from '@/types'

// 数据
const approvals = ref<AttendanceApproval[]>([])
const loading = ref(false)

// 模态框
const showCreateModal = ref(false)
const showApprovalModal = ref(false)
const currentApproval = ref<AttendanceApproval | null>(null)

// 筛选表单
const filterForm = reactive({
  status: null as string | null,
  type: null as string | null,
  dateRange: null as [Date, Date] | null,
  keyword: ''
})

// 创建表单
const createForm = reactive({
  type: '',
  startDate: null as Date | null,
  endDate: null as Date | null,
  reason: '',
  description: '',
  attachments: [] as any[]
})

// 审批表单
const approvalForm = reactive({
  action: 'approve',
  comment: ''
})

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 10,
  itemCount: 0,
  pageSizes: [10, 20, 50]
})

// 计算属性
const paginatedApprovals = computed(() => {
  const start = (pagination.page - 1) * pagination.pageSize
  const end = start + pagination.pageSize
  return approvals.value.slice(start, end)
})

// 选项
const statusOptions = [
  { label: '待审批', value: 'pending' },
  { label: '已同意', value: 'approved' },
  { label: '已拒绝', value: 'rejected' }
]

const typeOptions = [
  { label: '请假', value: 'leave' },
  { label: '加班', value: 'overtime' },
  { label: '出差', value: 'business_trip' },
  { label: '个人事务', value: 'personal' },
  { label: '病假', value: 'sick' }
]

// 表单验证规则
const createRules = {
  type: { required: true, message: '请选择申请类型' },
  startDate: { required: true, message: '请选择开始日期' },
  endDate: { required: true, message: '请选择结束日期' },
  reason: { required: true, message: '请输入申请原因' }
}

// 工具函数
function getTypeLabel(type?: string): string {
  const typeMap: Record<string, string> = {
    leave: '请假',
    overtime: '加班',
    business_trip: '出差',
    personal: '个人事务',
    sick: '病假'
  }
  return typeMap[type || ''] || type || ''
}

function getStatusLabel(status: string): string {
  const statusMap: Record<string, string> = {
    pending: '待审批',
    approved: '已同意',
    rejected: '已拒绝'
  }
  return statusMap[status] || status
}

function getStatusTagType(status: string): string {
  const statusMap: Record<string, string> = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger'
  }
  return statusMap[status] || 'info'
}

function getStatusIcon(status: string) {
  const iconMap: Record<string, any> = {
    pending: Clock,
    approved: CircleCheck,
    rejected: CircleClose
  }
  return iconMap[status] || Clock
}

function formatDateTime(dateTimeStr?: string): string {
  if (!dateTimeStr) return ''
  return new Date(dateTimeStr).toLocaleString('zh-CN')
}

// 方法
async function loadApprovals() {
  loading.value = true
  try {
    const result = await getAttendanceApprovals({
      page: pagination.page,
      pageSize: pagination.pageSize,
      ...filterForm
    }) as any
    
    if (result.code === 200) {
      approvals.value = result.data.list
      pagination.itemCount = result.data.total
    }
  } catch (error) {
    console.error('加载审批列表失败:', error)
    ElMessage.error('加载审批列表失败')
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  pagination.page = 1
  loadApprovals()
}

function handleReset() {
  Object.keys(filterForm).forEach(key => {
    ;(filterForm as any)[key] = key === 'keyword' ? '' : null
  })
  pagination.page = 1
  loadApprovals()
}

function handleViewDetail(row: AttendanceApproval) {
  currentApproval.value = row
  showApprovalModal.value = true
  approvalForm.action = 'approve'
  approvalForm.comment = ''
}

function handleShowApproval(row: AttendanceApproval) {
  handleViewDetail(row)
}

async function handleSubmitApplication() {
  try {
    const result = await submitAttendanceApproval(createForm) as any
    if (result.code === 200) {
      ElMessage.success('申请提交成功')
      showCreateModal.value = false
      // 重置表单
      Object.keys(createForm).forEach(key => {
        if (key === 'attachments') {
          ;(createForm as any)[key] = []
        } else {
          ;(createForm as any)[key] = ''
        }
      })
      loadApprovals()
    }
  } catch (error) {
    console.error('提交申请失败:', error)
    ElMessage.error('提交申请失败')
  }
}

async function handleApprove() {
  if (!currentApproval.value) return
  
  try {
    const result = await approveAttendance(
      currentApproval.value.id,
      approvalForm.action as 'approve' | 'reject',
      approvalForm.comment
    ) as any
    
    if (result.code === 200) {
      ElMessage.success(result.message)
      showApprovalModal.value = false
      loadApprovals()
    }
  } catch (error) {
    console.error('审批处理失败:', error)
    ElMessage.error('审批处理失败')
  }
}

function handlePageChange(page: number) {
  pagination.page = page
  loadApprovals()
}

function handlePageSizeChange(pageSize: number) {
  pagination.pageSize = pageSize
  pagination.page = 1
  loadApprovals()
}

onMounted(() => {
  loadApprovals()
})
</script>

<style scoped>
.attendance-approval {
  padding: 16px;
}

.filter-card {
  margin-bottom: 16px;
}

.filter-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.filters {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.actions {
  display: flex;
  gap: 12px;
}

.approval-detail {
  margin-bottom: 16px;
}

.description {
  padding: 12px;
  background: var(--el-color-info-light-9);
  border-radius: 6px;
  color: var(--el-text-color-primary);
  line-height: 1.6;
}

.attachments {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
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

/* 审批对话框样式优化 */
.approval-dialog :deep(.el-dialog__body) {
  max-height: 60vh;
  overflow-y: auto;
  padding: 20px;
}

.approval-dialog :deep(.el-dialog) {
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.approval-dialog :deep(.el-dialog__footer) {
  flex-shrink: 0;
  border-top: 1px solid var(--el-border-color-light);
  padding: 15px 20px;
  margin: 0;
}

/* 工厂主题特效 */
[data-theme="factory"] .description {
  background: rgba(0, 212, 255, 0.05);
  border: 1px solid rgba(0, 212, 255, 0.2);
}

@media (max-width: 768px) {
  .filter-row {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filters,
  .actions {
    justify-content: center;
  }
}
</style>