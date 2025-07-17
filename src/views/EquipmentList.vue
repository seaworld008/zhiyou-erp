<template>
  <div class="equipment-list">
    <!-- 设备统计卡片 -->
    <div class="stats-grid">
      <el-card class="stat-card total" shadow="hover">
        <div class="stat-content">
          <div class="stat-icon">
            <el-icon size="28">
              <Setting />
            </el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.totalEquipment }}</div>
            <div class="stat-label">设备总数</div>
          </div>
        </div>
      </el-card>
      
      <el-card class="stat-card running" shadow="hover">
        <div class="stat-content">
          <div class="stat-icon">
            <el-icon size="28">
              <VideoPlay />
            </el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.runningEquipment }}</div>
            <div class="stat-label">运行中</div>
          </div>
        </div>
      </el-card>
      
      <el-card class="stat-card maintenance" shadow="hover">
        <div class="stat-content">
          <div class="stat-icon">
            <el-icon size="28">
              <Tools />
            </el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.maintenanceEquipment }}</div>
            <div class="stat-label">维护中</div>
          </div>
        </div>
      </el-card>
      
      <el-card class="stat-card efficiency" shadow="hover">
        <div class="stat-content">
          <div class="stat-icon">
            <el-icon size="28">
              <TrendCharts />
            </el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.overallEfficiency }}%</div>
            <div class="stat-label">整体效率</div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 筛选栏 -->
    <el-card class="filter-card" shadow="never">
      <div class="filter-row">
        <div class="filters">
          <el-select
            v-model="filterForm.type"
            placeholder="设备类型"
            clearable
            style="width: 120px"
          >
            <el-option
              v-for="option in typeOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
          <el-select
            v-model="filterForm.status"
            placeholder="设备状态"
            clearable
            style="width: 120px"
          >
            <el-option
              v-for="option in statusOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
          <el-input
            v-model="filterForm.keyword"
            placeholder="搜索设备名称/编号"
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
          <el-button type="primary" @click="showMaintenanceModal = true">
            <el-icon>
              <Tools />
            </el-icon>
            维护计划
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 设备列表 -->
    <el-card shadow="never">
      <el-table
        :data="paginatedEquipment"
        v-loading="loading"
        stripe
        border
        style="width: 100%"
      >
        <el-table-column prop="code" label="设备编号" width="120" />
        <el-table-column prop="name" label="设备名称" width="150" />
        <el-table-column prop="type" label="类型" width="100" />
        <el-table-column prop="location" label="位置" width="120" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)">
              <el-icon style="margin-right: 4px;">
                <component :is="getStatusIcon(row.status)" />
              </el-icon>
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="效率" width="80">
          <template #default="{ row }">
            {{ row.efficiency }}%
          </template>
        </el-table-column>
        <el-table-column label="运行时长" width="100">
          <template #default="{ row }">
            {{ row.operationHours }}h
          </template>
        </el-table-column>
        <el-table-column prop="operator" label="操作员" width="100" />
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" @click="handleViewDetail(row)">
              <el-icon>
                <View />
              </el-icon>
              详情
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

    <!-- 设备详情模态框 -->
    <el-dialog
      v-model="showDetailModal"
      title="设备详情"
      width="700px"
      :close-on-click-modal="false"
    >
      <div v-if="currentEquipment" class="equipment-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="设备编号">{{ currentEquipment.code }}</el-descriptions-item>
          <el-descriptions-item label="设备名称">{{ currentEquipment.name }}</el-descriptions-item>
          <el-descriptions-item label="设备类型">{{ currentEquipment.type }}</el-descriptions-item>
          <el-descriptions-item label="型号规格">{{ currentEquipment.model }}</el-descriptions-item>
          <el-descriptions-item label="制造商">{{ currentEquipment.manufacturer }}</el-descriptions-item>
          <el-descriptions-item label="安装位置">{{ currentEquipment.location }}</el-descriptions-item>
          <el-descriptions-item label="安装日期">{{ currentEquipment.installDate }}</el-descriptions-item>
          <el-descriptions-item label="运行状态">
            <el-tag :type="getStatusTagType(currentEquipment.status)">
              {{ getStatusLabel(currentEquipment.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="运行时长">{{ currentEquipment.operationHours }}小时</el-descriptions-item>
          <el-descriptions-item label="设备效率">{{ currentEquipment.efficiency }}%</el-descriptions-item>
          <el-descriptions-item label="操作员">{{ currentEquipment.operator }}</el-descriptions-item>
          <el-descriptions-item label="上次维护">{{ currentEquipment.lastMaintenanceDate }}</el-descriptions-item>
          <el-descriptions-item label="下次维护">{{ currentEquipment.nextMaintenanceDate }}</el-descriptions-item>
        </el-descriptions>
        
        <el-divider>设备描述</el-divider>
        <div class="description">{{ currentEquipment.description }}</div>
        
        <el-divider>操作记录</el-divider>
        <el-form :model="currentEquipment" label-width="100px">
          <el-form-item label="状态更新">
            <el-select
              v-model="currentEquipment.status"
              @change="handleStatusChange"
            >
              <el-option
                v-for="option in statusOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
          </el-form-item>
          
          <el-form-item label="操作员">
            <el-input v-model="currentEquipment.operator" placeholder="请输入操作员姓名" />
          </el-form-item>
          
          <el-form-item label="备注信息">
            <el-input
              v-model="currentEquipment.description"
              type="textarea"
              placeholder="请输入备注信息"
              :rows="3"
            />
          </el-form-item>
        </el-form>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showDetailModal = false">关闭</el-button>
          <el-button type="primary" @click="handleUpdateEquipment">保存更新</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 维护计划模态框 -->
    <el-dialog
      v-model="showMaintenanceModal"
      title="创建维护计划"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form ref="maintenanceFormRef" :model="maintenanceForm" :rules="maintenanceRules" label-width="100px">
        <el-form-item label="设备" prop="equipmentId">
          <el-select
            v-model="maintenanceForm.equipmentId"
            placeholder="选择设备"
            style="width: 100%"
          >
            <el-option
              v-for="option in equipmentOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="维护类型" prop="type">
          <el-select
            v-model="maintenanceForm.type"
            placeholder="选择维护类型"
            style="width: 100%"
          >
            <el-option
              v-for="option in maintenanceTypeOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="计划日期" prop="scheduledDate">
          <el-date-picker
            v-model="maintenanceForm.scheduledDate"
            type="date"
            placeholder="选择维护日期"
            style="width: 100%"
          />
        </el-form-item>
        
        <el-form-item label="维护内容" prop="content">
          <el-input
            v-model="maintenanceForm.content"
            type="textarea"
            placeholder="请输入维护内容"
            :rows="3"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showMaintenanceModal = false">取消</el-button>
          <el-button type="primary" @click="handleCreateMaintenance">创建</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  Setting, VideoPlay, Tools, TrendCharts, Search, View, 
  VideoPause, Warning
} from '@element-plus/icons-vue'
import { getEquipmentList, getEquipmentStats, updateEquipment, createMaintenance } from '@/mock/equipment'
import type { Equipment, EquipmentStats } from '@/types'

// 数据
const equipmentData = ref<Equipment[]>([])
const stats = ref<EquipmentStats>({
  totalEquipment: 0,
  runningEquipment: 0,
  stoppedEquipment: 0,
  maintenanceEquipment: 0,
  faultEquipment: 0,
  overallEfficiency: 0,
  avgOperationHours: 0
})
const loading = ref(false)

// 模态框
const showDetailModal = ref(false)
const showMaintenanceModal = ref(false)
const currentEquipment = ref<Equipment | null>(null)

// 筛选表单
const filterForm = reactive({
  type: null as string | null,
  status: null as string | null,
  keyword: ''
})

// 维护表单
const maintenanceForm = reactive({
  equipmentId: '',
  type: '',
  scheduledDate: null as Date | null,
  content: ''
})

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 10,
  itemCount: 0,
  pageSizes: [10, 20, 50]
})

// 计算属性
const paginatedEquipment = computed(() => {
  const start = (pagination.page - 1) * pagination.pageSize
  const end = start + pagination.pageSize
  return equipmentData.value.slice(start, end)
})

const equipmentOptions = computed(() => {
  return equipmentData.value.map(eq => ({
    label: `${eq.code} - ${eq.name}`,
    value: eq.id
  }))
})

// 选项
const typeOptions = [
  { label: '加工设备', value: '加工设备' },
  { label: '焊接设备', value: '焊接设备' },
  { label: '冲压设备', value: '冲压设备' },
  { label: '输送设备', value: '输送设备' },
  { label: '检测设备', value: '检测设备' }
]

const statusOptions = [
  { label: '运行中', value: 'running' },
  { label: '已停止', value: 'stopped' },
  { label: '维护中', value: 'maintenance' },
  { label: '故障', value: 'fault' }
]

const maintenanceTypeOptions = [
  { label: '日常保养', value: '日常保养' },
  { label: '预防性维护', value: '预防性维护' },
  { label: '大修', value: '大修' },
  { label: '应急维修', value: '应急维修' }
]

// 表单验证规则
const maintenanceRules = {
  equipmentId: { required: true, message: '请选择设备' },
  type: { required: true, message: '请选择维护类型' },
  scheduledDate: { required: true, message: '请选择维护日期' },
  content: { required: true, message: '请输入维护内容' }
}

// 工具函数
function getStatusTagType(status: string): string {
  const typeMap: Record<string, string> = {
    running: 'success',
    stopped: 'warning',
    maintenance: 'info',
    fault: 'danger'
  }
  return typeMap[status] || 'info'
}

function getStatusLabel(status: string): string {
  const labelMap: Record<string, string> = {
    running: '运行中',
    stopped: '已停止',
    maintenance: '维护中',
    fault: '故障'
  }
  return labelMap[status] || status
}

function getStatusIcon(status: string) {
  const iconMap: Record<string, any> = {
    running: VideoPlay,
    stopped: VideoPause,
    maintenance: Tools,
    fault: Warning
  }
  return iconMap[status] || VideoPlay
}

// 方法
async function loadEquipmentData() {
  loading.value = true
  try {
    const result = await getEquipmentList({
      page: pagination.page,
      pageSize: pagination.pageSize,
      ...filterForm
    }) as any
    
    if (result.code === 200) {
      equipmentData.value = result.data.list
      pagination.itemCount = result.data.total
    }
  } catch (error) {
    console.error('加载设备数据失败:', error)
    ElMessage.error('加载设备数据失败')
  } finally {
    loading.value = false
  }
}

async function loadStats() {
  try {
    const result = await getEquipmentStats() as any
    if (result.code === 200) {
      stats.value = result.data
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

function handleSearch() {
  pagination.page = 1
  loadEquipmentData()
}

function handleReset() {
  Object.keys(filterForm).forEach(key => {
    ;(filterForm as any)[key] = key === 'keyword' ? '' : null
  })
  pagination.page = 1
  loadEquipmentData()
}

function handleViewDetail(row: Equipment) {
  currentEquipment.value = { ...row }
  showDetailModal.value = true
}

function handleStatusChange() {
  // 状态变更逻辑
}

async function handleUpdateEquipment() {
  if (!currentEquipment.value) return
  
  try {
    const result = await updateEquipment(currentEquipment.value.id, currentEquipment.value) as any
    if (result.code === 200) {
      ElMessage.success('设备信息更新成功')
      showDetailModal.value = false
      loadEquipmentData()
    }
  } catch (error) {
    console.error('更新设备信息失败:', error)
    ElMessage.error('更新设备信息失败')
  }
}

async function handleCreateMaintenance() {
  try {
    const result = await createMaintenance(maintenanceForm) as any
    if (result.code === 200) {
      ElMessage.success('维护计划创建成功')
      showMaintenanceModal.value = false
      // 重置表单
      Object.keys(maintenanceForm).forEach(key => {
        ;(maintenanceForm as any)[key] = key === 'scheduledDate' ? null : ''
      })
    }
  } catch (error) {
    console.error('创建维护计划失败:', error)
    ElMessage.error('创建维护计划失败')
  }
}

function handlePageChange(page: number) {
  pagination.page = page
  loadEquipmentData()
}

function handlePageSizeChange(pageSize: number) {
  pagination.pageSize = pageSize
  pagination.page = 1
  loadEquipmentData()
}

onMounted(() => {
  loadStats()
  loadEquipmentData()
})
</script>

<style scoped>
.equipment-list {
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
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.stat-card.total :deep(.el-card__body) {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border: 1px solid #0ea5e9;
}

.stat-card.running :deep(.el-card__body) {
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border: 1px solid #22c55e;
}

.stat-card.maintenance :deep(.el-card__body) {
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
  border: 1px solid #f59e0b;
}

.stat-card.efficiency :deep(.el-card__body) {
  background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%);
  border: 1px solid #a855f7;
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
  color: var(--el-text-color-secondary);
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

.equipment-detail {
  margin-bottom: 16px;
}

.description {
  padding: 12px;
  background: var(--el-color-info-light-9);
  border-radius: 6px;
  color: var(--el-text-color-primary);
  line-height: 1.6;
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
[data-theme="factory"] .stat-card :deep(.el-card__body) {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border: 1px solid #0f3460;
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

[data-theme="factory"] .description {
  background: rgba(0, 212, 255, 0.05);
  border: 1px solid rgba(0, 212, 255, 0.2);
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
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