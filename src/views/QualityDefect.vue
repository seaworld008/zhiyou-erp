<template>
  <div class="quality-defect">
    <!-- 统计卡片 -->
    <div class="stats-grid">
      <el-card class="stat-card total" shadow="hover">
        <div class="stat-content">
          <div class="stat-icon">
            <el-icon size="28">
              <WarningFilled />
            </el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.totalDefects }}</div>
            <div class="stat-label">总异常数</div>
          </div>
        </div>
      </el-card>
      
      <el-card class="stat-card open" shadow="hover">
        <div class="stat-content">
          <div class="stat-icon">
            <el-icon size="28">
              <Warning />
            </el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.openDefects }}</div>
            <div class="stat-label">待处理</div>
          </div>
        </div>
      </el-card>
      
      <el-card class="stat-card resolved" shadow="hover">
        <div class="stat-content">
          <div class="stat-icon">
            <el-icon size="28">
              <CircleCheck />
            </el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.resolvedDefects }}</div>
            <div class="stat-label">已解决</div>
          </div>
        </div>
      </el-card>
      
      <el-card class="stat-card rate" shadow="hover">
        <div class="stat-content">
          <div class="stat-icon">
            <el-icon size="28">
              <TrendCharts />
            </el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.dailyDefectRate }}%</div>
            <div class="stat-label">日缺陷率</div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 筛选和操作栏 -->
    <el-card class="filter-card" shadow="never">
      <div class="filter-row">
        <div class="filters">
          <el-select
            v-model="filterForm.severity"
            placeholder="严重程度"
            clearable
            style="width: 120px"
          >
            <el-option
              v-for="option in severityOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
          <el-select
            v-model="filterForm.status"
            placeholder="处理状态"
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
            placeholder="搜索产品/批次"
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
            新建异常
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 异常列表 -->
    <el-card shadow="never">
      <el-table
        :data="paginatedDefects"
        v-loading="loading"
        stripe
        border
        style="width: 100%"
      >
        <el-table-column prop="id" label="异常编号" width="120" />
        <el-table-column prop="productName" label="产品" width="120" />
        <el-table-column prop="defectType" label="异常类型" width="100" />
        <el-table-column label="严重程度" width="100">
          <template #default="{ row }">
            <el-tag :type="getSeverityTagType(row.severity)">
              {{ getSeverityLabel(row.severity) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="quantity" label="数量" width="80" />
        <el-table-column prop="workstation" label="工位" width="100" />
        <el-table-column prop="batchNo" label="批次号" width="120" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="reportedBy" label="报告人" width="100" />
        <el-table-column label="报告时间" width="160">
          <template #default="{ row }">
            {{ formatDateTime(row.reportedAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" @click="handleViewDetail(row)">
              <el-icon>
                <View />
              </el-icon>
              查看
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

    <!-- 创建异常模态框 -->
    <el-dialog
      v-model="showCreateModal"
      title="新建质量异常"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form ref="createFormRef" :model="createForm" :rules="createRules" label-width="100px">
        <el-form-item label="产品编码" prop="productCode">
          <el-input v-model="createForm.productCode" placeholder="请输入产品编码" />
        </el-form-item>
        
        <el-form-item label="产品名称" prop="productName">
          <el-input v-model="createForm.productName" placeholder="请输入产品名称" />
        </el-form-item>
        
        <el-form-item label="异常类型" prop="defectType">
          <el-select
            v-model="createForm.defectType"
            placeholder="选择异常类型"
            style="width: 100%"
          >
            <el-option
              v-for="option in defectTypeOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="严重程度" prop="severity">
          <el-select
            v-model="createForm.severity"
            placeholder="选择严重程度"
            style="width: 100%"
          >
            <el-option
              v-for="option in severityOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="工位" prop="workstation">
          <el-input v-model="createForm.workstation" placeholder="请输入工位编号" />
        </el-form-item>
        
        <el-form-item label="批次号" prop="batchNo">
          <el-input v-model="createForm.batchNo" placeholder="请输入批次号" />
        </el-form-item>
        
        <el-form-item label="数量" prop="quantity">
          <el-input-number v-model="createForm.quantity" :min="1" placeholder="异常数量" />
        </el-form-item>
        
        <el-form-item label="异常描述" prop="description">
          <el-input
            v-model="createForm.description"
            type="textarea"
            placeholder="请详细描述异常情况"
            :rows="3"
          />
        </el-form-item>
        
        <el-form-item label="异常图片">
          <el-upload
            v-model:file-list="createForm.images"
            :limit="5"
            list-type="picture-card"
            accept="image/*"
          >
            <el-icon>
              <Plus />
            </el-icon>
          </el-upload>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showCreateModal = false">取消</el-button>
          <el-button type="primary" @click="handleCreateDefect">提交</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 异常详情模态框 -->
    <el-dialog
      v-model="showDetailModal"
      title="异常详情"
      width="800px"
      :close-on-click-modal="false"
    >
      <div v-if="currentDefect" class="defect-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="异常编号">{{ currentDefect.id }}</el-descriptions-item>
          <el-descriptions-item label="产品编码">{{ currentDefect.productCode }}</el-descriptions-item>
          <el-descriptions-item label="产品名称">{{ currentDefect.productName }}</el-descriptions-item>
          <el-descriptions-item label="异常类型">{{ currentDefect.defectType }}</el-descriptions-item>
          <el-descriptions-item label="严重程度">
            <el-tag :type="getSeverityTagType(currentDefect.severity)">
              {{ getSeverityLabel(currentDefect.severity) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusTagType(currentDefect.status)">
              {{ getStatusLabel(currentDefect.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="工位">{{ currentDefect.workstation }}</el-descriptions-item>
          <el-descriptions-item label="批次号">{{ currentDefect.batchNo }}</el-descriptions-item>
          <el-descriptions-item label="异常数量">{{ currentDefect.quantity }}</el-descriptions-item>
          <el-descriptions-item label="报告人">{{ currentDefect.reportedBy }}</el-descriptions-item>
          <el-descriptions-item label="报告时间">{{ formatDateTime(currentDefect.reportedAt) }}</el-descriptions-item>
          <el-descriptions-item label="负责人">{{ currentDefect.assignedTo }}</el-descriptions-item>
        </el-descriptions>
        
        <el-divider>异常描述</el-divider>
        <div class="description">{{ currentDefect.description }}</div>
        
        <el-divider v-if="currentDefect.images?.length">异常图片</el-divider>
        <div v-if="currentDefect.images?.length" class="images">
          <el-image
            v-for="image in currentDefect.images"
            :key="image"
            :src="`/images/${image}`"
            fit="cover"
            style="width: 100px; height: 100px; margin-right: 8px; margin-bottom: 8px; border-radius: 4px;"
                         :preview-src-list="currentDefect.images.map((img: string) => `/images/${img}`)"
          />
        </div>
        
        <el-divider>根因分析与改善措施</el-divider>
        <el-form :model="currentDefect" label-width="100px">
          <el-form-item label="根本原因">
            <el-input
              v-model="currentDefect.rootCause"
              type="textarea"
              placeholder="请输入根本原因分析"
              :rows="2"
            />
          </el-form-item>
          
          <el-form-item label="纠正措施">
            <el-input
              v-model="currentDefect.correctiveAction"
              type="textarea"
              placeholder="请输入纠正措施"
              :rows="2"
            />
          </el-form-item>
          
          <el-form-item label="预防措施">
            <el-input
              v-model="currentDefect.preventiveAction"
              type="textarea"
              placeholder="请输入预防措施"
              :rows="2"
            />
          </el-form-item>
        </el-form>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showDetailModal = false">关闭</el-button>
          <el-button v-if="currentDefect?.status !== 'closed'" type="primary" @click="handleUpdateDefect">保存更新</el-button>
          <el-button v-if="currentDefect?.status !== 'closed'" type="success" @click="handleCloseDefect">关闭异常</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  WarningFilled, Warning, CircleCheck, TrendCharts,
  Search, Plus, View
} from '@element-plus/icons-vue'
import { getQualityDefects, getQualityStats, createQualityDefect, updateQualityDefect } from '@/mock/quality'
import type { QualityDefect, QualityStats } from '@/types'

// 数据
const defects = ref<QualityDefect[]>([])
const stats = ref<QualityStats>({
  dailyDefectRate: 0,
  weeklyDefectRate: 0,
  monthlyDefectRate: 0,
  totalDefects: 0,
  openDefects: 0,
  resolvedDefects: 0,
  inspectionCount: 0,
  passedInspections: 0,
  overallPassRate: 0,
  topDefectTypes: []
})
const loading = ref(false)

// 模态框
const showCreateModal = ref(false)
const showDetailModal = ref(false)
const currentDefect = ref<QualityDefect | null>(null)

// 筛选表单
const filterForm = reactive({
  severity: null as string | null,
  status: null as string | null,
  keyword: ''
})

// 创建表单
const createForm = reactive({
  productCode: '',
  productName: '',
  defectType: '',
  severity: '',
  workstation: '',
  batchNo: '',
  quantity: 1,
  description: '',
  images: [] as any[]
})

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 10,
  itemCount: 0,
  pageSizes: [10, 20, 50]
})

// 计算属性
const paginatedDefects = computed(() => {
  const start = (pagination.page - 1) * pagination.pageSize
  const end = start + pagination.pageSize
  return defects.value.slice(start, end)
})

// 选项
const severityOptions = [
  { label: '轻微', value: 'minor' },
  { label: '重要', value: 'major' },
  { label: '严重', value: 'critical' }
]

const statusOptions = [
  { label: '待处理', value: 'open' },
  { label: '调查中', value: 'investigating' },
  { label: '已关闭', value: 'closed' }
]

const defectTypeOptions = [
  { label: '尺寸不符', value: '尺寸不符' },
  { label: '表面缺陷', value: '表面缺陷' },
  { label: '材料问题', value: '材料问题' },
  { label: '装配错误', value: '装配错误' },
  { label: '功能失效', value: '功能失效' },
  { label: '其他', value: '其他' }
]

// 表单验证规则
const createRules = {
  productCode: { required: true, message: '请输入产品编码' },
  productName: { required: true, message: '请输入产品名称' },
  defectType: { required: true, message: '请选择异常类型' },
  severity: { required: true, message: '请选择严重程度' },
  workstation: { required: true, message: '请输入工位' },
  batchNo: { required: true, message: '请输入批次号' },
  quantity: { required: true, message: '请输入数量' },
  description: { required: true, message: '请输入异常描述' }
}

// 工具函数
function getSeverityTagType(severity: string): string {
  const typeMap: Record<string, string> = {
    minor: 'info',
    major: 'warning',
    critical: 'danger'
  }
  return typeMap[severity] || 'info'
}

function getSeverityLabel(severity: string): string {
  const labelMap: Record<string, string> = {
    minor: '轻微',
    major: '重要',
    critical: '严重'
  }
  return labelMap[severity] || severity
}

function getStatusTagType(status: string): string {
  const typeMap: Record<string, string> = {
    open: 'danger',
    investigating: 'warning',
    closed: 'success'
  }
  return typeMap[status] || 'info'
}

function getStatusLabel(status: string): string {
  const labelMap: Record<string, string> = {
    open: '待处理',
    investigating: '调查中',
    closed: '已关闭'
  }
  return labelMap[status] || status
}

function formatDateTime(dateTimeStr: string): string {
  return new Date(dateTimeStr).toLocaleString('zh-CN')
}

// 方法
async function loadDefects() {
  loading.value = true
  try {
    const result = await getQualityDefects({
      page: pagination.page,
      pageSize: pagination.pageSize,
      ...filterForm
    }) as any
    
    if (result.code === 200) {
      defects.value = result.data.list
      pagination.itemCount = result.data.total
    }
  } catch (error) {
    console.error('加载质量异常失败:', error)
    ElMessage.error('加载质量异常失败')
  } finally {
    loading.value = false
  }
}

async function loadStats() {
  try {
    const result = await getQualityStats() as any
    if (result.code === 200) {
      stats.value = result.data
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

function handleSearch() {
  pagination.page = 1
  loadDefects()
}

function handleReset() {
  Object.keys(filterForm).forEach(key => {
    ;(filterForm as any)[key] = key === 'keyword' ? '' : null
  })
  pagination.page = 1
  loadDefects()
}

function handleViewDetail(row: QualityDefect) {
  currentDefect.value = { ...row }
  showDetailModal.value = true
}

async function handleCreateDefect() {
  try {
    const result = await createQualityDefect(createForm) as any
    if (result.code === 200) {
      ElMessage.success('质量异常创建成功')
      showCreateModal.value = false
      // 重置表单
      Object.keys(createForm).forEach(key => {
        if (key === 'images') {
          ;(createForm as any)[key] = []
        } else if (key === 'quantity') {
          ;(createForm as any)[key] = 1
        } else {
          ;(createForm as any)[key] = ''
        }
      })
      loadDefects()
    }
  } catch (error) {
    console.error('创建质量异常失败:', error)
    ElMessage.error('创建质量异常失败')
  }
}

async function handleUpdateDefect() {
  if (!currentDefect.value) return
  
  try {
    const result = await updateQualityDefect(currentDefect.value.id, currentDefect.value) as any
    if (result.code === 200) {
      ElMessage.success('异常信息更新成功')
      loadDefects()
    }
  } catch (error) {
    console.error('更新异常信息失败:', error)
    ElMessage.error('更新异常信息失败')
  }
}

async function handleCloseDefect() {
  if (!currentDefect.value) return
  
  currentDefect.value.status = 'closed'
  await handleUpdateDefect()
  showDetailModal.value = false
}

function handlePageChange(page: number) {
  pagination.page = page
  loadDefects()
}

function handlePageSizeChange(pageSize: number) {
  pagination.pageSize = pageSize
  pagination.page = 1
  loadDefects()
}

onMounted(() => {
  loadStats()
  loadDefects()
})
</script>

<style scoped>
.quality-defect {
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

.stat-card.open :deep(.el-card__body) {
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  border: 1px solid #ef4444;
}

.stat-card.resolved :deep(.el-card__body) {
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border: 1px solid #22c55e;
}

.stat-card.rate :deep(.el-card__body) {
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
  border: 1px solid #f59e0b;
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

.defect-detail {
  margin-bottom: 16px;
}

.description {
  padding: 12px;
  background: var(--el-color-info-light-9);
  border-radius: 6px;
  color: var(--el-text-color-primary);
  line-height: 1.6;
}

.images {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
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