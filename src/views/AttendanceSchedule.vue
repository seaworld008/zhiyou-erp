<template>
  <div class="attendance-schedule">
    <!-- 操作栏 -->
    <el-card class="action-bar" shadow="never">
      <div class="action-row">
        <div class="filters">
          <el-date-picker
            v-model="currentWeek"
            type="week"
            placeholder="选择周次"
            @change="handleWeekChange"
          />
          <el-select
            v-model="selectedDepartment"
            placeholder="选择部门"
            clearable
            style="width: 150px"
            @change="loadSchedules"
          >
            <el-option
              v-for="option in departmentOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
          <el-input
            v-model="searchKeyword"
            placeholder="搜索员工"
            clearable
            style="width: 200px"
          />
        </div>
        
        <div class="actions">
          <el-button type="primary" @click="handleBatchEdit">
            <el-icon>
              <Edit />
            </el-icon>
            批量排班
          </el-button>
          <el-button type="primary" @click="handleExport">
            <el-icon>
              <Download />
            </el-icon>
            导出排班表
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 排班表格 -->
    <el-card shadow="never">
      <el-table
        :data="paginatedSchedules"
        v-loading="loading"
        stripe
        border
        style="width: 100%"
      >
        <el-table-column prop="employeeId" label="员工工号" width="100" />
        <el-table-column prop="employeeName" label="姓名" width="100" />
        <el-table-column prop="department" label="部门" width="100" />
        <el-table-column prop="week" label="周次" width="100" />
        <el-table-column
          v-for="day in weekDays"
          :key="day.key"
          :label="day.label"
          width="80"
        >
          <template #default="{ row }">
            <el-tag
              v-if="row.shifts[day.key]"
              :type="getShiftTagType(row.shifts[day.key].color)"
              size="small"
            >
              {{ row.shifts[day.key].name }}
            </el-tag>
            <span v-else>--</span>
          </template>
        </el-table-column>
        <el-table-column label="总工时" width="80">
          <template #default="{ row }">
            {{ row.totalHours }}h
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" @click="handleEdit(row)">
              编辑
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

    <!-- 编辑排班模态框 -->
    <el-dialog
      v-model="showEditModal"
      title="编辑排班"
      width="800px"
      :close-on-click-modal="false"
    >
      <el-form ref="editFormRef" :model="editForm" :rules="editRules" label-width="80px">
        <el-form-item label="员工" prop="employeeName">
          <el-input v-model="editForm.employeeName" readonly />
        </el-form-item>
        
        <el-form-item label="周次" prop="week">
          <el-input v-model="editForm.week" readonly />
        </el-form-item>
        
        <el-divider>班次安排</el-divider>
        
        <div class="schedule-grid">
          <div v-for="day in weekDays" :key="day.key" class="day-schedule">
            <div class="day-label">{{ day.label }}</div>
            <el-select
              v-model="(editForm.shifts as any)[day.key]"
              placeholder="选择班次"
              clearable
              @change="calculateTotalHours"
            >
              <el-option
                v-for="option in shiftOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
          </div>
        </div>
        
        <el-form-item label="总工时" prop="totalHours">
          <el-input-number v-model="editForm.totalHours" readonly :min="0" :step="8" />
          <span style="margin-left: 8px;">小时</span>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showEditModal = false">取消</el-button>
          <el-button type="primary" @click="handleSaveSchedule">保存</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 批量排班模态框 -->
    <el-dialog
      v-model="showBatchModal"
      title="批量排班"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form ref="batchFormRef" :model="batchForm" :rules="batchRules" label-width="80px">
        <el-form-item label="周次" prop="week">
          <el-date-picker 
            v-model="batchForm.week" 
            type="week" 
            placeholder="选择周次" 
            style="width: 100%"
          />
        </el-form-item>
        
        <el-form-item label="部门" prop="department">
          <el-select
            v-model="batchForm.department"
            placeholder="选择部门"
            style="width: 100%"
          >
            <el-option
              v-for="option in departmentOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="排班模板" prop="template">
          <el-select
            v-model="batchForm.template"
            placeholder="选择排班模板"
            style="width: 100%"
            @change="applyTemplate"
          >
            <el-option
              v-for="option in templateOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
        
        <el-divider>班次安排</el-divider>
        
        <div class="schedule-grid">
          <div v-for="day in weekDays" :key="day.key" class="day-schedule">
            <div class="day-label">{{ day.label }}</div>
            <el-select
              v-model="(batchForm.shifts as any)[day.key]"
              placeholder="选择班次"
              clearable
            >
              <el-option
                v-for="option in shiftOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
          </div>
        </div>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showBatchModal = false">取消</el-button>
          <el-button type="primary" @click="handleSaveBatch">应用</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Edit, Download } from '@element-plus/icons-vue'
import { getSchedulePlans, getShiftTypes, updateSchedule } from '@/mock/attendance'
import type { SchedulePlan, ShiftType } from '@/types'

// 数据
const schedules = ref<SchedulePlan[]>([])
const shiftTypes = ref<ShiftType[]>([])
const loading = ref(false)
const currentWeek = ref<Date>(new Date())
const selectedDepartment = ref<string | null>(null)
const searchKeyword = ref('')

// 模态框
const showEditModal = ref(false)
const showBatchModal = ref(false)

// 表单
const editForm = reactive({
  id: '',
  employeeId: '',
  employeeName: '',
  department: '',
  week: '',
  shifts: {
    monday: null as string | null,
    tuesday: null as string | null,
    wednesday: null as string | null,
    thursday: null as string | null,
    friday: null as string | null,
    saturday: null as string | null,
    sunday: null as string | null
  },
  totalHours: 0
})

const batchForm = reactive({
  week: null as Date | null,
  department: '',
  template: '',
  shifts: {
    monday: null as string | null,
    tuesday: null as string | null,
    wednesday: null as string | null,
    thursday: null as string | null,
    friday: null as string | null,
    saturday: null as string | null,
    sunday: null as string | null
  }
})

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 10,
  itemCount: 0,
  pageSizes: [10, 20, 50]
})

// 工作日
const weekDays = [
  { key: 'monday', label: '周一' },
  { key: 'tuesday', label: '周二' },
  { key: 'wednesday', label: '周三' },
  { key: 'thursday', label: '周四' },
  { key: 'friday', label: '周五' },
  { key: 'saturday', label: '周六' },
  { key: 'sunday', label: '周日' }
]

// 选项
const departmentOptions = [
  { label: '生产部', value: '生产部' },
  { label: '质检部', value: '质检部' },
  { label: '维修部', value: '维修部' },
  { label: '仓储部', value: '仓储部' }
]

const templateOptions = [
  { label: '标准工作日(5天)', value: 'standard' },
  { label: '双班制', value: 'double_shift' },
  { label: '三班制', value: 'triple_shift' },
  { label: '自定义', value: 'custom' }
]

// 计算属性
const filteredSchedules = computed(() => {
  let result = schedules.value
  
  if (selectedDepartment.value) {
    result = result.filter(s => s.department === selectedDepartment.value)
  }
  
  if (searchKeyword.value) {
    result = result.filter(s => 
      s.employeeName.includes(searchKeyword.value) ||
      s.employeeId.includes(searchKeyword.value)
    )
  }
  
  return result
})

const paginatedSchedules = computed(() => {
  const start = (pagination.page - 1) * pagination.pageSize
  const end = start + pagination.pageSize
  return filteredSchedules.value.slice(start, end)
})

const shiftOptions = computed(() => {
  return shiftTypes.value.map(shift => ({
    label: shift.name,
    value: shift.id
  }))
})

// 工具函数
const getShiftTagType = (color: string) => {
  const colorMap: Record<string, string> = {
    '#409EFF': 'primary',
    '#67C23A': 'success',
    '#E6A23C': 'warning',
    '#F56C6C': 'danger'
  }
  return colorMap[color] || 'primary'
}

// 表单验证规则
const editRules = {
  employeeName: { required: true, message: '请输入员工姓名' },
  week: { required: true, message: '请选择周次' }
}

const batchRules = {
  week: { required: true, message: '请选择周次' },
  department: { required: true, message: '请选择部门' }
}

// 方法
async function loadSchedules() {
  loading.value = true
  try {
    const result = await getSchedulePlans() as any
    if (result.code === 200) {
      schedules.value = result.data.list
      pagination.itemCount = result.data.total
    }
  } catch (error) {
    console.error('加载排班计划失败:', error)
    ElMessage.error('加载排班计划失败')
  } finally {
    loading.value = false
  }
}

async function loadShiftTypes() {
  try {
    const result = await getShiftTypes() as any
    if (result.code === 200) {
      shiftTypes.value = result.data
    }
  } catch (error) {
    console.error('加载班次类型失败:', error)
  }
}

function handleWeekChange() {
  loadSchedules()
}

function handleEdit(row: SchedulePlan) {
  editForm.id = row.id
  editForm.employeeId = row.employeeId
  editForm.employeeName = row.employeeName
  editForm.department = row.department
  editForm.week = row.week
  editForm.totalHours = row.totalHours
  
  // 设置班次
  Object.keys(editForm.shifts).forEach(day => {
    const shift = row.shifts[day as keyof typeof row.shifts]
    ;(editForm.shifts as any)[day] = shift?.id || null
  })
  
  showEditModal.value = true
}

function calculateTotalHours() {
  let total = 0
  Object.values(editForm.shifts).forEach(shiftId => {
    if (shiftId) {
      const shift = shiftTypes.value.find(s => s.id === shiftId)
      if (shift) {
        // 计算班次小时数（简化计算，实际应考虑跨天等情况）
        const start = parseTime(shift.startTime)
        const end = parseTime(shift.endTime)
        const hours = end > start ? end - start : (24 - start + end)
        total += Math.max(0, hours - shift.breakTime / 60)
      }
    }
  })
  editForm.totalHours = Math.round(total * 100) / 100
}

function parseTime(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number)
  return hours + minutes / 60
}

async function handleSaveSchedule() {
  try {
    const result = await updateSchedule({
      ...editForm,
      shifts: Object.keys(editForm.shifts).reduce((acc, day) => {
        const shiftId = (editForm.shifts as any)[day]
        acc[day] = shiftId ? shiftTypes.value.find(s => s.id === shiftId) : null
        return acc
      }, {} as any)
    }) as any
    
    if (result.code === 200) {
      ElMessage.success('排班更新成功')
      showEditModal.value = false
      loadSchedules()
    }
  } catch (error) {
    console.error('保存排班失败:', error)
    ElMessage.error('保存排班失败')
  }
}

function handleBatchEdit() {
  showBatchModal.value = true
}

function applyTemplate(template: string) {
  const templates = {
    standard: {
      monday: '1',
      tuesday: '1',
      wednesday: '1',
      thursday: '1',
      friday: '1',
      saturday: null,
      sunday: null
    },
    double_shift: {
      monday: '1',
      tuesday: '2',
      wednesday: '1',
      thursday: '2',
      friday: '1',
      saturday: '2',
      sunday: null
    },
    triple_shift: {
      monday: '1',
      tuesday: '2',
      wednesday: '3',
      thursday: '1',
      friday: '2',
      saturday: '3',
      sunday: '1'
    }
  }
  
  if (template && template !== 'custom') {
    Object.assign(batchForm.shifts, templates[template as keyof typeof templates])
  }
}

async function handleSaveBatch() {
  try {
    // 模拟批量更新
    ElMessage.success('批量排班应用成功')
    showBatchModal.value = false
    loadSchedules()
  } catch (error) {
    console.error('批量排班失败:', error)
    ElMessage.error('批量排班失败')
  }
}

function handleExport() {
  ElMessage.info('导出功能开发中...')
}

function handlePageChange(page: number) {
  pagination.page = page
}

function handlePageSizeChange(pageSize: number) {
  pagination.pageSize = pageSize
  pagination.page = 1
}

onMounted(() => {
  loadShiftTypes()
  loadSchedules()
})
</script>

<style scoped>
.attendance-schedule {
  padding: 16px;
}

.action-bar {
  margin-bottom: 16px;
}

.action-row {
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

.schedule-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 16px;
  margin: 16px 0;
}

.day-schedule {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.day-label {
  font-weight: 500;
  color: var(--el-text-color-primary);
  text-align: center;
  padding: 4px 0;
  background: var(--el-color-primary-light-9);
  border-radius: 4px;
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

/* 工厂主题特效 */
[data-theme="factory"] .day-label {
  background: rgba(0, 212, 255, 0.1);
  border: 1px solid rgba(0, 212, 255, 0.3);
  color: #00d4ff;
  text-shadow: 0 0 5px rgba(0, 212, 255, 0.5);
}

@media (max-width: 768px) {
  .action-row {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filters,
  .actions {
    justify-content: center;
  }
  
  .schedule-grid {
    grid-template-columns: 1fr;
  }
}
</style> 