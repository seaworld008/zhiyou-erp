<template>
  <div class="perf-time-container">
    <!-- 筛选区域 -->
    <div class="filter-section">
      <el-card shadow="never">
        <el-form
          :model="{ filterDate, filterStatus, filterType, filterKeyword }"
          :inline="true"
          class="filter-form"
        >
          <el-form-item label="日期范围">
            <el-date-picker
              v-model="filterDate"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              @change="applyFilters"
              style="width: 240px;"
            />
          </el-form-item>
          
          <el-form-item label="状态">
            <el-select
              v-model="filterStatus"
              placeholder="选择状态"
              clearable
              @change="applyFilters"
              style="width: 120px;"
            >
              <el-option
                v-for="option in statusOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
          </el-form-item>
          
          <el-form-item label="类型">
            <el-select
              v-model="filterType"
              placeholder="工时类型"
              clearable
              @change="applyFilters"
              style="width: 120px;"
            >
              <el-option
                v-for="option in typeOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
          </el-form-item>
          
          <el-form-item label="搜索">
            <el-input
              v-model="filterKeyword"
              placeholder="员工姓名/部门"
              @input="applyFilters"
              clearable
              style="width: 160px;"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </el-form-item>
          
          <el-form-item>
            <el-button type="primary" @click="showAddModal = true">
              <el-icon><Plus /></el-icon>
              新增工时
            </el-button>
            <el-button @click="handleExport">
              <el-icon><Download /></el-icon>
              导出数据
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-section">
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon" style="color: #18a058;">
              <el-icon size="24">
                <Clock />
              </el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ timeStats.totalHours }}h</div>
              <div class="stat-label">总工时</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon" style="color: #2080f0;">
              <el-icon size="24">
                <User />
              </el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ timeStats.totalPeople }}</div>
              <div class="stat-label">总人数</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon" style="color: #f0a020;">
              <el-icon size="24">
                <TrendCharts />
              </el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ timeStats.overtimeHours }}h</div>
              <div class="stat-label">加班工时</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-icon" style="color: #18a058;">
              <el-icon size="24">
                <CircleCheck />
              </el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ timeStats.approvedCount }}</div>
              <div class="stat-label">已审批</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 数据表格 -->
    <div class="table-section">
      <el-card shadow="never">
        <template #header>
          <div class="card-header">
            <span>📊 工时汇报明细</span>
            <div class="header-info">
              <span class="total-info">共 {{ filteredData.length }} 条记录</span>
            </div>
          </div>
        </template>
        
        <el-table
          :data="paginatedData"
          v-loading="loading"
          size="default"
          stripe
          style="width: 100%"
          max-height="600px"
        >
          <el-table-column type="index" label="序号" width="60" />
          <el-table-column prop="emp_name" label="员工姓名" width="100" fixed="left" />
          <el-table-column prop="department" label="部门" width="100" />
          <el-table-column prop="workstation" label="工位" width="120" />
          <el-table-column prop="date" label="日期" width="100" />
          <el-table-column prop="shift" label="班次" width="80" />
          <el-table-column label="时间段" width="140">
            <template #default="{ row }">
              <span class="time-range">{{ row.start }} - {{ row.end }}</span>
            </template>
          </el-table-column>
          <el-table-column label="工时类型" width="100">
            <template #default="{ row }">
              <el-tag 
                :style="getTypeStyle(row.type)"
                effect="plain"
                size="small"
                class="work-type-tag"
              >
                {{ getTypeLabel(row.type) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="总工时" width="80" align="center">
            <template #default="{ row }">
              <span class="hours-badge">{{ row.hours }}h</span>
            </template>
          </el-table-column>
          <el-table-column label="实际工时" width="90" align="center">
            <template #default="{ row }">
              <span class="hours-badge actual">{{ row.actualHours }}h</span>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="100" align="center">
            <template #default="{ row }">
              <el-tag 
                :type="getStatusType(row.status)"
                size="small"
              >
                {{ getStatusLabel(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="description" label="工作内容" min-width="150" show-overflow-tooltip />
          <el-table-column label="操作" width="140" fixed="right" align="center">
            <template #default="{ row }">
              <div class="action-buttons">
                <el-button size="small" type="primary" link @click="handleEdit(row)">
                  <el-icon><Edit /></el-icon>
                  编辑
                </el-button>
                <el-button size="small" type="danger" link @click="handleDelete(row.id)">
                  <el-icon><Delete /></el-icon>
                  删除
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
        
        <div class="pagination-container">
          <el-pagination
            v-model:current-page="pagination.page"
            v-model:page-size="pagination.pageSize"
            :page-sizes="pagination.pageSizes"
            :total="filteredData.length"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handlePageSizeChange"
            @current-change="handlePageChange"
          />
        </div>
      </el-card>
    </div>

    <!-- 新增/编辑工时模态框 -->
    <el-dialog
      v-model="showAddModal"
      :title="editingId ? '编辑工时' : '新增工时'"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="80px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="员工" prop="emp_id">
              <el-select
                v-model="formData.emp_id"
                placeholder="选择员工"
                filterable
                style="width: 100%"
                @change="handleEmployeeChange"
              >
                <el-option
                  v-for="option in employeeOptions"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          
          <el-col :span="12">
            <el-form-item label="日期" prop="date">
              <el-date-picker
                v-model="formData.date"
                type="date"
                placeholder="选择日期"
                style="width: 100%"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="开始时间" prop="start">
              <el-time-picker
                v-model="formData.start"
                placeholder="选择开始时间"
                style="width: 100%"
                format="HH:mm"
                value-format="HH:mm"
              />
            </el-form-item>
          </el-col>
          
          <el-col :span="12">
            <el-form-item label="结束时间" prop="end">
              <el-time-picker
                v-model="formData.end"
                placeholder="选择结束时间"
                style="width: 100%"
                format="HH:mm"
                value-format="HH:mm"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="工时类型" prop="type">
              <el-select
                v-model="formData.type"
                placeholder="选择工时类型"
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
            <el-form-item label="班次" prop="shift">
              <el-input v-model="formData.shift" placeholder="请输入班次" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="16">
          <el-col :span="8">
            <el-form-item label="总工时" prop="hours">
              <el-input-number
                v-model="formData.hours"
                placeholder="总工时"
                :precision="1"
                :min="0"
                :max="24"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          
          <el-col :span="8">
            <el-form-item label="休息时间" prop="breakTime">
              <el-input-number
                v-model="formData.breakTime"
                placeholder="休息时间"
                :precision="1"
                :min="0"
                :max="8"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          
          <el-col :span="8">
            <el-form-item label="实际工时" prop="actualHours">
              <el-input-number
                v-model="formData.actualHours"
                placeholder="实际工时"
                :precision="1"
                :min="0"
                :max="24"
                style="width: 100%"
                readonly
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="工作内容" prop="description">
          <el-input
            v-model="formData.description"
            placeholder="请描述工作内容"
            type="textarea"
            :rows="3"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showAddModal = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitLoading">
            {{ editingId ? '更新' : '提交' }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance } from 'element-plus'
import {
  Clock,
  User,
  TrendCharts,
  CircleCheck,
  Search,
  Plus,
  Download,
  Edit,
  Delete
} from '@element-plus/icons-vue'
import { mockTimeReports } from '@/mock/performance'
import type { PerfTimeReport } from '@/types'

// 数据状态
const loading = ref(false)
const timeReports = ref<PerfTimeReport[]>([])
const filteredData = ref<PerfTimeReport[]>([])

// 筛选状态
const filterDate = ref<[Date, Date] | null>(null)
const filterStatus = ref<string | null>(null)
const filterType = ref<string | null>(null)
const filterKeyword = ref('')

// 模态框状态
const showAddModal = ref(false)
const editingId = ref<string | null>(null)
const submitLoading = ref(false)

// 表单
const formRef = ref<FormInstance | null>(null)
const formData = reactive({
  emp_id: '',
  emp_name: '',
  department: '',
  position: '',
  workstation: '',
  date: null as string | null,
  shift: '',
  start: null as string | null,
  end: null as string | null,
  type: 'normal' as string,
  hours: 0,
  breakTime: 0,
  actualHours: 0,
  description: ''
})

// 统计数据
const timeStats = computed(() => {
  const data = filteredData.value
  return {
    totalHours: data.reduce((sum, item) => sum + item.actualHours, 0).toFixed(1),
    totalPeople: new Set(data.map(item => item.emp_id)).size,
    overtimeHours: data.filter(item => item.type === 'ot').reduce((sum, item) => sum + item.actualHours, 0).toFixed(1),
    approvedCount: data.filter(item => item.status === 'approved').length
  }
})

// 分页数据
const pagination = reactive({
  page: 1,
  pageSize: 10,
  pageSizes: [10, 20, 30, 50]
})

const paginatedData = computed(() => {
  const start = (pagination.page - 1) * pagination.pageSize
  const end = start + pagination.pageSize
  return filteredData.value.slice(start, end)
})

// 选项配置
const statusOptions = [
  { label: '草稿', value: 'draft' },
  { label: '已提交', value: 'submitted' },
  { label: '已审批', value: 'approved' },
  { label: '已拒绝', value: 'rejected' }
]

const typeOptions = [
  { label: '正常工作', value: 'normal' },
  { label: '加班', value: 'ot' },
  { label: '请假', value: 'leave' },
  { label: '病假', value: 'sick' },
  { label: '事假', value: 'personal' }
]

const employeeOptions = [
  { label: '陈林燕', value: 'EMP001' },
  { label: '李明华', value: 'EMP002' },
  { label: '王小红', value: 'EMP003' },
  { label: '张伟强', value: 'EMP004' },
  { label: '刘建国', value: 'EMP005' },
  { label: '周小丽', value: 'EMP006' },
  { label: '赵大伟', value: 'EMP007' },
  { label: '孙美玲', value: 'EMP008' },
  { label: '马志强', value: 'EMP009' }
]

// 表单验证规则
const formRules = {
  emp_id: {
    required: true,
    message: '请选择员工'
  },
  date: {
    required: true,
    message: '请选择日期'
  },
  start: {
    required: true,
    message: '请选择开始时间'
  },
  end: {
    required: true,
    message: '请选择结束时间'
  },
  type: {
    required: true,
    message: '请选择工时类型'
  },
  hours: {
    required: true,
    type: 'number',
    message: '请输入总工时'
  }
}

// 工具函数
const getTypeColor = (type: string) => {
  const colorMap = {
    normal: '#18a058',
    ot: '#f0a020',
    leave: '#2080f0',
    sick: '#d03050',
    personal: '#7c3aed'
  }
  return colorMap[type as keyof typeof colorMap] || '#666'
}

const getTypeStyle = (type: string) => {
  const styleMap = {
    normal: {
      backgroundColor: '#f0f9ff',
      color: '#18a058',
      border: '1px solid #18a058',
      fontWeight: '500'
    },
    ot: {
      backgroundColor: '#fffbf0',
      color: '#f0a020',
      border: '1px solid #f0a020',
      fontWeight: '500'
    },
    leave: {
      backgroundColor: '#f0f8ff',
      color: '#2080f0',
      border: '1px solid #2080f0',
      fontWeight: '500'
    },
    sick: {
      backgroundColor: '#fef2f2',
      color: '#d03050',
      border: '1px solid #d03050',
      fontWeight: '500'
    },
    personal: {
      backgroundColor: '#faf5ff',
      color: '#7c3aed',
      border: '1px solid #7c3aed',
      fontWeight: '500'
    }
  }
  return styleMap[type as keyof typeof styleMap] || {
    backgroundColor: '#f5f5f5',
    color: '#666',
    border: '1px solid #666',
    fontWeight: '500'
  }
}

const getTypeLabel = (type: string) => {
  const labelMap = {
    normal: '正常工作',
    ot: '加班',
    leave: '请假',
    sick: '病假',
    personal: '事假'
  }
  return labelMap[type as keyof typeof labelMap] || type
}

const getStatusColor = (status: string) => {
  const colorMap = {
    draft: '#999',
    submitted: '#2080f0',
    approved: '#18a058',
    rejected: '#d03050'
  }
  return colorMap[status as keyof typeof colorMap] || '#666'
}

const getStatusLabel = (status: string) => {
  const labelMap = {
    draft: '草稿',
    submitted: '已提交',
    approved: '已审批',
    rejected: '已拒绝'
  }
  return labelMap[status as keyof typeof labelMap] || status
}

const getStatusType = (status: string) => {
  const typeMap = {
    draft: 'info',
    submitted: 'warning',
    approved: 'success',
    rejected: 'danger'
  }
  return typeMap[status as keyof typeof typeMap] || 'info'
}

// 监听工时变化，自动计算实际工时
watch([() => formData.hours, () => formData.breakTime], () => {
  formData.actualHours = Math.max(0, formData.hours - formData.breakTime)
})

// 方法
const loadData = async () => {
  loading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))
    timeReports.value = [...mockTimeReports]
    applyFilters()
  } catch (error) {
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

const applyFilters = () => {
  let data = [...timeReports.value]

  // 日期筛选
  if (filterDate.value) {
    const [startDate, endDate] = filterDate.value
    data = data.filter(item => {
      const itemDate = new Date(item.date)
      return itemDate >= new Date(startDate) && itemDate <= new Date(endDate)
    })
  }

  // 状态筛选
  if (filterStatus.value) {
    data = data.filter(item => item.status === filterStatus.value)
  }

  // 类型筛选
  if (filterType.value) {
    data = data.filter(item => item.type === filterType.value)
  }

  // 关键词搜索
  if (filterKeyword.value) {
    const keyword = filterKeyword.value.toLowerCase()
    data = data.filter(item => 
      item.emp_name.toLowerCase().includes(keyword) ||
      item.department.toLowerCase().includes(keyword)
    )
  }

  filteredData.value = data
  pagination.page = 1 // 重置到第一页
}

const handleFilterChange = () => {
  applyFilters()
}

const handlePageChange = (page: number) => {
  pagination.page = page
}

const handlePageSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.page = 1
}

const handleEmployeeChange = (empId: string) => {
  const employee = employeeOptions.find(emp => emp.value === empId)
  if (employee) {
    formData.emp_name = employee.label
    // 这里可以根据员工ID获取更多信息
    formData.department = '生产部'
    formData.position = '操作员'
    formData.workstation = '工位-01'
  }
}

const resetForm = () => {
  Object.assign(formData, {
    emp_id: '',
    emp_name: '',
    department: '',
    position: '',
    workstation: '',
    date: null,
    shift: '',
    start: null,
    end: null,
    type: 'normal',
    hours: 0,
    breakTime: 0,
    actualHours: 0,
    description: ''
  })
  editingId.value = null
}

const handleEdit = (row: PerfTimeReport) => {
  editingId.value = row.id
  Object.assign(formData, {
    emp_id: row.emp_id,
    emp_name: row.emp_name,
    department: row.department,
    position: row.position,
    workstation: row.workstation,
    date: row.date,
    shift: row.shift,
    start: row.start,
    end: row.end,
    type: row.type,
    hours: row.hours,
    breakTime: row.breakTime,
    actualHours: row.actualHours,
    description: row.description || ''
  })
  showAddModal.value = true
}

const handleDelete = (id: string) => {
  // 这里应该调用删除API
  const index = timeReports.value.findIndex(item => item.id === id)
  if (index !== -1) {
    timeReports.value.splice(index, 1)
    applyFilters()
    ElMessage.success('删除成功')
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    submitLoading.value = true

    const submitData = {
      ...formData,
      date: formData.date!,
      start: formData.start!,
      end: formData.end!,
      type: formData.type as "normal" | "ot" | "leave" | "sick" | "personal",
      status: 'submitted' as any,
      submittedAt: new Date().toISOString()
    }

    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))

    if (editingId.value) {
      // 更新
      const index = timeReports.value.findIndex(item => item.id === editingId.value)
      if (index !== -1) {
        timeReports.value[index] = { ...timeReports.value[index], ...submitData }
        ElMessage.success('更新成功')
      }
    } else {
      // 新增
      const newReport: PerfTimeReport = {
        id: `TR${Date.now()}`,
        ...submitData
      }
      timeReports.value.unshift(newReport)
      ElMessage.success('提交成功')
    }

    applyFilters()
    showAddModal.value = false
    resetForm()
  } catch (error) {
    ElMessage.error('操作失败')
  } finally {
    submitLoading.value = false
  }
}

const handleExport = () => {
  ElMessage.success('工时数据导出成功')
}

// 监听模态框关闭
watch(showAddModal, (show) => {
  if (!show) {
    resetForm()
  }
})

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.perf-time-container {
  padding: 16px;
}

.filter-section {
  margin-bottom: 16px;
}

.filter-form {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}

.stats-section {
  margin-bottom: 16px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 15px;
  border-radius: 8px;
  background-color: #f5f7fa;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #e6f7ff; /* Light blue background */
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #333;
}

.stat-label {
  font-size: 14px;
  color: #666;
  margin-top: 4px;
}

.table-section {
  /* 表格样式已经很好看了 */
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.header-info {
  font-size: 14px;
  color: #999;
}

.total-info {
  font-weight: bold;
  color: #555;
}

.time-range {
  font-size: 14px;
  color: #333;
}

.hours-badge {
  font-size: 14px;
  font-weight: bold;
  color: #333;
  background-color: #e0f2f7;
  padding: 4px 8px;
  border-radius: 6px;
}

.hours-badge.actual {
  background-color: #fde2e2;
  color: #d03050;
}

.action-buttons {
  display: flex;
  gap: 8px;
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
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.table-section :deep(.el-table__header) {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

.table-section :deep(.el-table__row:hover) {
  background-color: #f0f9ff;
  transition: background-color 0.3s ease;
}

.filter-form :deep(.el-form-item) {
  margin-bottom: 0;
}

.filter-form :deep(.el-form-item__label) {
  font-weight: 500;
  color: #333;
}

.card-header {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .filter-form {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filters {
    justify-content: space-between;
  }
  
  .actions {
    justify-content: center;
  }
  
  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .stats-cards {
    grid-template-columns: 1fr;
  }
  
  .filters {
    flex-direction: column;
  }
}

/* 工时类型标签样式优化 */
.work-type-tag {
  border-radius: 6px !important;
  padding: 4px 8px !important;
  font-size: 12px !important;
  line-height: 1.2 !important;
  transition: all 0.2s ease !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
}

.work-type-tag:hover {
  transform: translateY(-1px) !important;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15) !important;
}
</style>