<template>
  <div class="production-piece">
    <!-- Header Section -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">
          <el-icon><Money /></el-icon>
          计件录入
        </h1>
        <p class="page-desc">计件统计、单价管理、绩效计算</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" :icon="Plus" @click="showAddDialog = true">
          新增计件
        </el-button>
        <el-button :icon="Download" @click="exportData">
          导出数据
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
            <el-icon><Coin /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.todayPieces }}</div>
            <div class="stat-label">今日计件</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon success">
            <el-icon><Money /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">¥{{ stats.todayAmount.toFixed(2) }}</div>
            <div class="stat-label">今日计件金额</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon warning">
            <el-icon><User /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.activeWorkers }}</div>
            <div class="stat-label">计件人员</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon info">
            <el-icon><TrendCharts /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.avgEfficiency }}%</div>
            <div class="stat-label">平均效率</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters and Search -->
    <div class="filter-section">
      <el-form :model="filters" inline class="filter-form">
        <el-form-item label="日期范围">
          <el-date-picker
            v-model="filters.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="员工">
          <el-select v-model="filters.empId" placeholder="选择员工" clearable filterable>
            <el-option
              v-for="emp in employees"
              :key="emp.id"
              :label="emp.name"
              :value="emp.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="工序">
          <el-select v-model="filters.processCode" placeholder="选择工序" clearable>
            <el-option
              v-for="process in processes"
              :key="process.code"
              :label="process.name"
              :value="process.code"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="工单号">
          <el-input
            v-model="filters.workorderId"
            placeholder="输入工单号"
            clearable
          />
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
        <el-table-column prop="date" label="日期" width="120" sortable />
        <el-table-column prop="emp_name" label="员工" width="100" />
        <el-table-column prop="workorder_id" label="工单号" width="140" />
        <el-table-column prop="process_name" label="工序" width="120" />
        <el-table-column prop="qty" label="数量" width="100" align="right" sortable>
          <template #default="{ row }">
            <span class="qty-value">{{ row.qty }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="unit_price" label="单价(元)" width="100" align="right" sortable>
          <template #default="{ row }">
            <span class="price-value">¥{{ row.unit_price.toFixed(3) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="金额(元)" width="120" align="right" sortable>
          <template #default="{ row }">
            <span class="amount-value">¥{{ row.amount.toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="efficiency" label="效率" width="100" align="center">
          <template #default="{ row }">
            <el-tag
              :type="row.efficiency >= 100 ? 'success' : row.efficiency >= 80 ? 'warning' : 'danger'"
            >
              {{ row.efficiency }}%
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="录入时间" width="160" />
        <el-table-column prop="created_by" label="录入人" width="100" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              :icon="Edit"
              @click="editPiece(row)"
            >
              编辑
            </el-button>
            <el-button
              type="danger"
              size="small"
              :icon="Delete"
              @click="deletePiece(row)"
            >
              删除
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

    <!-- Add/Edit Dialog -->
    <el-dialog
      v-model="showAddDialog"
      :title="editingPiece ? '编辑计件' : '新增计件'"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="formRules"
        label-width="100px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="员工" prop="emp_id">
              <el-select v-model="form.emp_id" placeholder="选择员工" filterable>
                <el-option
                  v-for="emp in employees"
                  :key="emp.id"
                  :label="emp.name"
                  :value="emp.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="工单号" prop="workorder_id">
              <el-select v-model="form.workorder_id" placeholder="选择工单" filterable>
                <el-option
                  v-for="order in workOrders"
                  :key="order.id"
                  :label="order.id"
                  :value="order.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="工序" prop="process_code">
              <el-select v-model="form.process_code" placeholder="选择工序">
                <el-option
                  v-for="process in processes"
                  :key="process.code"
                  :label="process.name"
                  :value="process.code"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="数量" prop="qty">
              <el-input-number
                v-model="form.qty"
                :min="1"
                :max="10000"
                placeholder="输入数量"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="单价(元)" prop="unit_price">
              <el-input-number
                v-model="form.unit_price"
                :min="0"
                :precision="3"
                :step="0.001"
                placeholder="输入单价"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="日期" prop="date">
              <el-date-picker
                v-model="form.date"
                type="date"
                placeholder="选择日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="备注">
              <el-input
                v-model="form.remark"
                type="textarea"
                :rows="3"
                placeholder="输入备注信息"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="submitForm" :loading="submitting">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import {
  Plus, Download, Refresh, Search, Edit, Delete,
  Money, Coin, User, TrendCharts
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import dayjs from 'dayjs'

// Interfaces
interface PieceRecord {
  id: string
  emp_id: string
  emp_name: string
  workorder_id: string
  process_code: string
  process_name: string
  qty: number
  unit_price: number
  amount: number
  efficiency: number
  date: string
  created_at: string
  created_by: string
  remark?: string
}

interface Employee {
  id: string
  name: string
  dept: string
}

interface Process {
  code: string
  name: string
  std_time: number
  std_price: number
}

interface WorkOrder {
  id: string
  product_name: string
  plan_qty: number
}

// Reactive data
const loading = ref(false)
const submitting = ref(false)
const showAddDialog = ref(false)
const editingPiece = ref<PieceRecord | null>(null)
const selectedRows = ref<PieceRecord[]>([])

const stats = reactive({
  todayPieces: 1458,
  todayAmount: 2847.65,
  activeWorkers: 28,
  avgEfficiency: 96.2
})

const filters = reactive({
  dateRange: [dayjs().format('YYYY-MM-DD'), dayjs().format('YYYY-MM-DD')],
  empId: '',
  processCode: '',
  workorderId: ''
})

const pagination = reactive({
  page: 1,
  size: 20,
  total: 0
})

const form = reactive({
  emp_id: '',
  workorder_id: '',
  process_code: '',
  qty: 1,
  unit_price: 0,
  date: dayjs().format('YYYY-MM-DD'),
  remark: ''
})

const formRef = ref<FormInstance>()

const formRules: FormRules = {
  emp_id: [{ required: true, message: '请选择员工', trigger: 'change' }],
  workorder_id: [{ required: true, message: '请选择工单', trigger: 'change' }],
  process_code: [{ required: true, message: '请选择工序', trigger: 'change' }],
  qty: [{ required: true, message: '请输入数量', trigger: 'blur' }],
  unit_price: [{ required: true, message: '请输入单价', trigger: 'blur' }],
  date: [{ required: true, message: '请选择日期', trigger: 'change' }]
}

// Mock data
const tableData = ref<PieceRecord[]>([
  {
    id: 'P001',
    emp_id: 'E001',
    emp_name: '张三',
    workorder_id: 'WO2025001',
    process_code: 'OP001',
    process_name: '装配',
    qty: 85,
    unit_price: 0.125,
    amount: 10.625,
    efficiency: 102,
    date: '2025-01-17',
    created_at: '2025-01-17 14:30:00',
    created_by: '李主管'
  },
  {
    id: 'P002',
    emp_id: 'E002',
    emp_name: '李四',
    workorder_id: 'WO2025002',
    process_code: 'OP002',
    process_name: '焊接',
    qty: 76,
    unit_price: 0.158,
    amount: 12.008,
    efficiency: 95,
    date: '2025-01-17',
    created_at: '2025-01-17 14:25:00',
    created_by: '王班长'
  },
  {
    id: 'P003',
    emp_id: 'E003',
    emp_name: '王五',
    workorder_id: 'WO2025003',
    process_code: 'OP003',
    process_name: '包装',
    qty: 120,
    unit_price: 0.089,
    amount: 10.68,
    efficiency: 108,
    date: '2025-01-17',
    created_at: '2025-01-17 14:20:00',
    created_by: '赵组长'
  },
  {
    id: 'P004',
    emp_id: 'E004',
    emp_name: '赵六',
    workorder_id: 'WO2025001',
    process_code: 'OP004',
    process_name: '检测',
    qty: 65,
    unit_price: 0.145,
    amount: 9.425,
    efficiency: 88,
    date: '2025-01-17',
    created_at: '2025-01-17 14:15:00',
    created_by: '李主管'
  }
])

const employees = ref<Employee[]>([
  { id: 'E001', name: '张三', dept: '生产一部' },
  { id: 'E002', name: '李四', dept: '生产一部' },
  { id: 'E003', name: '王五', dept: '生产二部' },
  { id: 'E004', name: '赵六', dept: '品质部' },
  { id: 'E005', name: '钱七', dept: '生产一部' }
])

const processes = ref<Process[]>([
  { code: 'OP001', name: '装配', std_time: 8.5, std_price: 0.125 },
  { code: 'OP002', name: '焊接', std_time: 12.0, std_price: 0.158 },
  { code: 'OP003', name: '包装', std_time: 6.2, std_price: 0.089 },
  { code: 'OP004', name: '检测', std_time: 10.5, std_price: 0.145 },
  { code: 'OP005', name: '调试', std_time: 15.0, std_price: 0.185 }
])

const workOrders = ref<WorkOrder[]>([
  { id: 'WO2025001', product_name: '智能电饭煲3L', plan_qty: 200 },
  { id: 'WO2025002', product_name: '电磁炉2200W', plan_qty: 150 },
  { id: 'WO2025003', product_name: '榨汁机600W', plan_qty: 100 },
  { id: 'WO2025004', product_name: '电热水壶1.8L', plan_qty: 300 }
])

// Computed
const computedAmount = computed(() => {
  return (form.qty * form.unit_price).toFixed(2)
})

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
      item.date >= filters.dateRange[0] && item.date <= filters.dateRange[1]
    )
  }
  
  if (filters.empId) {
    filteredData = filteredData.filter(item => item.emp_id === filters.empId)
  }
  
  if (filters.processCode) {
    filteredData = filteredData.filter(item => item.process_code === filters.processCode)
  }
  
  if (filters.workorderId) {
    filteredData = filteredData.filter(item => 
      item.workorder_id.includes(filters.workorderId)
    )
  }
  
  // Update pagination
  pagination.total = filteredData.length
}

const resetFilters = () => {
  filters.dateRange = [dayjs().format('YYYY-MM-DD'), dayjs().format('YYYY-MM-DD')]
  filters.empId = ''
  filters.processCode = ''
  filters.workorderId = ''
  handleSearch()
}

const handleSelectionChange = (rows: PieceRecord[]) => {
  selectedRows.value = rows
}

const editPiece = (row: PieceRecord) => {
  editingPiece.value = row
  Object.assign(form, {
    emp_id: row.emp_id,
    workorder_id: row.workorder_id,
    process_code: row.process_code,
    qty: row.qty,
    unit_price: row.unit_price,
    date: row.date,
    remark: row.remark || ''
  })
  showAddDialog.value = true
}

const deletePiece = async (row: PieceRecord) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除员工 ${row.emp_name} 的计件记录吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // Simulate API call
    const index = tableData.value.findIndex(item => item.id === row.id)
    if (index > -1) {
      tableData.value.splice(index, 1)
      ElMessage.success('删除成功')
      handleSearch()
    }
  } catch {
    // User cancelled
  }
}

const submitForm = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    submitting.value = true
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const emp = employees.value.find(e => e.id === form.emp_id)
    const process = processes.value.find(p => p.code === form.process_code)
    
    if (editingPiece.value) {
      // Update existing record
      const index = tableData.value.findIndex(item => item.id === editingPiece.value!.id)
      if (index > -1) {
        tableData.value[index] = {
          ...tableData.value[index],
          emp_id: form.emp_id,
          emp_name: emp?.name || '',
          workorder_id: form.workorder_id,
          process_code: form.process_code,
          process_name: process?.name || '',
          qty: form.qty,
          unit_price: form.unit_price,
          amount: form.qty * form.unit_price,
          date: form.date,
          remark: form.remark
        }
      }
      ElMessage.success('更新成功')
    } else {
      // Add new record
      const newRecord: PieceRecord = {
        id: `P${Date.now()}`,
        emp_id: form.emp_id,
        emp_name: emp?.name || '',
        workorder_id: form.workorder_id,
        process_code: form.process_code,
        process_name: process?.name || '',
        qty: form.qty,
        unit_price: form.unit_price,
        amount: form.qty * form.unit_price,
        efficiency: Math.floor(Math.random() * 20) + 85, // Random efficiency
        date: form.date,
        created_at: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        created_by: '当前用户',
        remark: form.remark
      }
      tableData.value.unshift(newRecord)
      ElMessage.success('添加成功')
    }
    
    showAddDialog.value = false
    resetForm()
    handleSearch()
  } catch (error) {
    console.error('提交失败:', error)
  } finally {
    submitting.value = false
  }
}

const resetForm = () => {
  editingPiece.value = null
  Object.assign(form, {
    emp_id: '',
    workorder_id: '',
    process_code: '',
    qty: 1,
    unit_price: 0,
    date: dayjs().format('YYYY-MM-DD'),
    remark: ''
  })
  formRef.value?.resetFields()
}

const exportData = () => {
  ElMessage.success('导出功能开发中...')
}

// Lifecycle
onMounted(() => {
  refreshData()
})

// Auto refresh every 30 seconds
setInterval(() => {
  if (!showAddDialog.value) {
    refreshData()
  }
}, 30000)
</script>

<style scoped lang="scss">
.production-piece {
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
          &.warning { background: rgba(230, 162, 60, 0.1); color: #E6A23C; }
          &.info { background: rgba(144, 147, 153, 0.1); color: #909399; }
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

    .qty-value {
      font-weight: 600;
      color: var(--el-color-primary);
    }

    .price-value {
      font-weight: 500;
      color: var(--el-color-warning);
    }

    .amount-value {
      font-weight: 600;
      color: var(--el-color-success);
    }

    .pagination-wrapper {
      padding: 20px;
      display: flex;
      justify-content: center;
    }
  }
}

// Factory theme enhancements
[data-theme="factory"] {
  .production-piece {
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
  .production-piece {
    .page-header,
    .filter-section,
    .table-section,
    .stat-card {
      background: var(--el-bg-color-overlay);
      border: 1px solid var(--el-border-color-darker);
    }
  }
}
</style> 