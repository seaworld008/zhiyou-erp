<template>
  <div class="inventory-stock">
    <!-- 库存统计卡片 -->
    <div class="stats-grid">
      <el-card class="stat-card total" shadow="hover">
        <div class="stat-content">
          <div class="stat-icon">
            <el-icon size="28">
              <Box />
            </el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.totalItems }}</div>
            <div class="stat-label">物料总数</div>
          </div>
        </div>
      </el-card>
      
      <el-card class="stat-card value" shadow="hover">
        <div class="stat-content">
          <div class="stat-icon">
            <el-icon size="28">
              <Money />
            </el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">¥{{ formatMoney(stats.totalValue) }}</div>
            <div class="stat-label">库存总值</div>
          </div>
        </div>
      </el-card>
      
      <el-card class="stat-card alert" shadow="hover">
        <div class="stat-content">
          <div class="stat-icon">
            <el-icon size="28">
              <Warning />
            </el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.lowStockItems + stats.outOfStockItems }}</div>
            <div class="stat-label">库存预警</div>
          </div>
        </div>
      </el-card>
      
      <el-card class="stat-card turnover" shadow="hover">
        <div class="stat-content">
          <div class="stat-icon">
            <el-icon size="28">
              <Refresh />
            </el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.turnoverRate }}%</div>
            <div class="stat-label">周转率</div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 操作栏 -->
    <el-card class="action-bar" shadow="never">
      <div class="action-row">
        <div class="filters">
          <el-select
            v-model="filterForm.category"
            placeholder="物料分类"
            clearable
            style="width: 120px"
          >
            <el-option
              v-for="option in categoryOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
          <el-select
            v-model="filterForm.status"
            placeholder="库存状态"
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
            placeholder="搜索物料名称/编码"
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
          <el-button type="primary" @click="showStockInModal = true">
            <el-icon>
              <Plus />
            </el-icon>
            入库
          </el-button>
          <el-button type="info" @click="showStockOutModal = true">
            <el-icon>
              <Minus />
            </el-icon>
            出库
          </el-button>
          <el-button @click="showAlertsModal = true">
            <el-icon>
              <Bell />
            </el-icon>
            库存预警
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 主要内容区域 -->
    <el-row :gutter="16">
      <!-- 库存列表 -->
      <el-col :span="16">
        <el-card title="库存列表" shadow="never">
          <el-table
            :data="paginatedInventory"
            v-loading="loading"
            stripe
            border
            style="width: 100%"
          >
            <el-table-column prop="code" label="物料编码" width="120" />
            <el-table-column prop="name" label="物料名称" width="150" />
            <el-table-column prop="category" label="分类" width="100" />
            <el-table-column label="当前库存" width="100">
              <template #default="{ row }">
                {{ row.currentStock }} {{ row.unit }}
              </template>
            </el-table-column>
            <el-table-column label="库存状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStockStatusTagType(row.status)">
                  {{ getStockStatusLabel(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="库存预警" width="100">
              <template #default="{ row }">
                <el-icon v-if="row.currentStock <= row.minStock" color="#f0a020" size="20">
                  <Warning />
                </el-icon>
                <span v-else>--</span>
              </template>
            </el-table-column>
            <el-table-column label="单价" width="100">
              <template #default="{ row }">
                ¥{{ row.unitPrice.toFixed(2) }}
              </template>
            </el-table-column>
            <el-table-column label="库存总值" width="120">
              <template #default="{ row }">
                ¥{{ row.totalValue.toFixed(2) }}
              </template>
            </el-table-column>
            <el-table-column prop="location" label="位置" width="100" />
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
      </el-col>
      
      <!-- 侧边栏 -->
      <el-col :span="8">
        <!-- 库存预警 -->
        <el-card title="库存预警" class="sidebar-card" shadow="never">
          <div class="alert-list">
            <div v-for="alert in alerts" :key="alert.id" class="alert-item">
              <div class="alert-header">
                <el-tag :type="getAlertTagType(alert.severity)" size="small">
                  {{ getAlertLabel(alert.severity) }}
                </el-tag>
                <span class="alert-time">{{ formatTime(alert.createdAt) }}</span>
              </div>
              <div class="alert-content">
                <div class="alert-title">{{ alert.itemName }}</div>
                <div class="alert-message">{{ alert.message }}</div>
                <div class="alert-stock">
                  当前库存: {{ alert.currentStock }} / 最低库存: {{ alert.minStock }}
                </div>
              </div>
            </div>
          </div>
        </el-card>
        
        <!-- 最近出入库 -->
        <el-card title="最近出入库" class="sidebar-card" shadow="never">
          <div class="movement-list">
            <div v-for="movement in recentMovements" :key="movement.id" class="movement-item">
              <div class="movement-type">
                <el-tag :type="movement.type === 'in' ? 'success' : 'warning'" size="small">
                  {{ movement.type === 'in' ? '入库' : '出库' }}
                </el-tag>
              </div>
              <div class="movement-content">
                <div class="movement-item-name">{{ movement.itemName }}</div>
                <div class="movement-details">
                  数量: {{ movement.quantity }}{{ movement.unit }} | {{ movement.operator }}
                </div>
                <div class="movement-time">{{ formatTime(movement.date) }}</div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 入库模态框 -->
    <el-dialog
      v-model="showStockInModal"
      title="物料入库"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form ref="stockInFormRef" :model="stockInForm" :rules="stockInRules" label-width="100px">
        <el-form-item label="物料" prop="itemId">
          <el-select
            v-model="stockInForm.itemId"
            placeholder="选择物料"
            filterable
            style="width: 100%"
          >
            <el-option
              v-for="option in inventoryOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="入库数量" prop="quantity">
          <el-input-number v-model="stockInForm.quantity" :min="1" placeholder="入库数量" />
        </el-form-item>
        
        <el-form-item label="入库原因" prop="reason">
          <el-select
            v-model="stockInForm.reason"
            placeholder="选择入库原因"
            style="width: 100%"
          >
            <el-option
              v-for="option in inReasonOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="供应商" prop="supplier">
          <el-input v-model="stockInForm.supplier" placeholder="请输入供应商" />
        </el-form-item>
        
        <el-form-item label="采购单号" prop="orderNo">
          <el-input v-model="stockInForm.orderNo" placeholder="请输入采购单号" />
        </el-form-item>
        
        <el-form-item label="备注">
          <el-input
            v-model="stockInForm.remark"
            type="textarea"
            placeholder="请输入备注信息"
            :rows="3"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showStockInModal = false">取消</el-button>
          <el-button type="primary" @click="handleStockIn">确认入库</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 出库模态框 -->
    <el-dialog
      v-model="showStockOutModal"
      title="物料出库"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form ref="stockOutFormRef" :model="stockOutForm" :rules="stockOutRules" label-width="100px">
        <el-form-item label="物料" prop="itemId">
          <el-select
            v-model="stockOutForm.itemId"
            placeholder="选择物料"
            filterable
            style="width: 100%"
          >
            <el-option
              v-for="option in inventoryOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="出库数量" prop="quantity">
          <el-input-number v-model="stockOutForm.quantity" :min="1" placeholder="出库数量" />
        </el-form-item>
        
        <el-form-item label="出库原因" prop="reason">
          <el-select
            v-model="stockOutForm.reason"
            placeholder="选择出库原因"
            style="width: 100%"
          >
            <el-option
              v-for="option in outReasonOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="领用部门" prop="department">
          <el-input v-model="stockOutForm.department" placeholder="请输入领用部门" />
        </el-form-item>
        
        <el-form-item label="工单号" prop="workOrder">
          <el-input v-model="stockOutForm.workOrder" placeholder="请输入工单号" />
        </el-form-item>
        
        <el-form-item label="备注">
          <el-input
            v-model="stockOutForm.remark"
            type="textarea"
            placeholder="请输入备注信息"
            :rows="3"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showStockOutModal = false">取消</el-button>
          <el-button type="primary" @click="handleStockOut">确认出库</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 库存预警模态框 -->
    <el-dialog v-model="showAlertsModal" title="库存预警详情" width="800px">
      <el-table
        :data="alerts"
        max-height="400"
        border
        stripe
      >
        <el-table-column prop="itemName" label="物料名称" width="150" />
        <el-table-column prop="currentStock" label="当前库存" width="100" />
        <el-table-column prop="minStock" label="最低库存" width="100" />
        <el-table-column label="严重程度" width="100">
          <template #default="{ row }">
            <el-tag :type="getAlertTagType(row.severity)">
              {{ getAlertLabel(row.severity) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="message" label="预警信息" width="200" />
        <el-table-column label="时间" width="150">
          <template #default="{ row }">
            {{ formatTime(row.createdAt) }}
          </template>
        </el-table-column>
      </el-table>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showAlertsModal = false">关闭</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 库存详情模态框 -->
    <el-dialog
      v-model="showDetailModal"
      title="库存详情"
      width="700px"
      :close-on-click-modal="false"
    >
      <div v-if="currentItem" class="inventory-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="物料编码">{{ currentItem.code }}</el-descriptions-item>
          <el-descriptions-item label="物料名称">{{ currentItem.name }}</el-descriptions-item>
          <el-descriptions-item label="物料分类">{{ currentItem.category }}</el-descriptions-item>
          <el-descriptions-item label="规格型号">{{ currentItem.specification }}</el-descriptions-item>
          <el-descriptions-item label="计量单位">{{ currentItem.unit }}</el-descriptions-item>
          <el-descriptions-item label="存储位置">{{ currentItem.location }}</el-descriptions-item>
          <el-descriptions-item label="当前库存">{{ currentItem.currentStock }}</el-descriptions-item>
          <el-descriptions-item label="最低库存">{{ currentItem.minStock }}</el-descriptions-item>
          <el-descriptions-item label="最高库存">{{ currentItem.maxStock }}</el-descriptions-item>
          <el-descriptions-item label="库存状态">
            <el-tag :type="getStockStatusTagType(currentItem.status)">
              {{ getStockStatusLabel(currentItem.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="单价">¥{{ currentItem.unitPrice.toFixed(2) }}</el-descriptions-item>
          <el-descriptions-item label="库存总值">¥{{ currentItem.totalValue.toFixed(2) }}</el-descriptions-item>
          <el-descriptions-item label="供应商">{{ currentItem.supplier }}</el-descriptions-item>
          <el-descriptions-item label="最后入库">{{ currentItem.lastInDate }}</el-descriptions-item>
          <el-descriptions-item label="最后出库">{{ currentItem.lastOutDate }}</el-descriptions-item>
        </el-descriptions>
        
        <el-divider>库存调整</el-divider>
        <el-form :model="currentItem" label-width="100px">
          <el-form-item label="库存调整">
            <el-input-number v-model="adjustQuantity" placeholder="调整数量（正数增加，负数减少）" />
          </el-form-item>
          
          <el-form-item label="调整原因">
            <el-input v-model="adjustReason" placeholder="请输入调整原因" />
          </el-form-item>
        </el-form>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showDetailModal = false">关闭</el-button>
          <el-button type="primary" @click="handleAdjustStock">库存调整</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  Box, Money, Warning, Refresh, Search, Plus, Minus, Bell,
  View
} from '@element-plus/icons-vue'
import { 
  getInventoryItems, getInventoryStats, getStockAlerts, getStockMovements,
  updateInventoryItem, createStockMovement
} from '@/mock/inventory'
import type { InventoryItem, InventoryStats } from '@/types'

// 数据
const inventoryData = ref<InventoryItem[]>([])
const stats = ref<InventoryStats>({
  totalItems: 0,
  totalValue: 0,
  lowStockItems: 0,
  outOfStockItems: 0,
  overstockItems: 0,
  turnoverRate: 0
})
const alerts = ref<any[]>([])
const recentMovements = ref<any[]>([])
const loading = ref(false)

// 模态框
const showDetailModal = ref(false)
const showStockInModal = ref(false)
const showStockOutModal = ref(false)
const showAlertsModal = ref(false)
const currentItem = ref<InventoryItem | null>(null)

// 筛选表单
const filterForm = reactive({
  category: null as string | null,
  status: null as string | null,
  keyword: ''
})

// 入库表单
const stockInForm = reactive({
  itemId: '',
  quantity: 1,
  reason: '',
  supplier: '',
  orderNo: '',
  remark: ''
})

// 出库表单
const stockOutForm = reactive({
  itemId: '',
  quantity: 1,
  reason: '',
  department: '',
  workOrder: '',
  remark: ''
})

// 库存调整
const adjustQuantity = ref(0)
const adjustReason = ref('')

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 10,
  itemCount: 0,
  pageSizes: [10, 20, 50]
})

// 计算属性
const paginatedInventory = computed(() => {
  const start = (pagination.page - 1) * pagination.pageSize
  const end = start + pagination.pageSize
  return inventoryData.value.slice(start, end)
})

const inventoryOptions = computed(() => {
  return inventoryData.value.map(item => ({
    label: `${item.code} - ${item.name}`,
    value: item.id
  }))
})

// 选项
const categoryOptions = [
  { label: '原材料', value: '原材料' },
  { label: '标准件', value: '标准件' },
  { label: '刀具', value: '刀具' },
  { label: '电气元件', value: '电气元件' },
  { label: '化工用品', value: '化工用品' },
  { label: '包装用品', value: '包装用品' }
]

const statusOptions = [
  { label: '正常', value: 'normal' },
  { label: '库存不足', value: 'low_stock' },
  { label: '库存超量', value: 'overstock' },
  { label: '缺货', value: 'out_of_stock' }
]

const inReasonOptions = [
  { label: '采购入库', value: '采购入库' },
  { label: '退货入库', value: '退货入库' },
  { label: '调拨入库', value: '调拨入库' },
  { label: '盘盈入库', value: '盘盈入库' }
]

const outReasonOptions = [
  { label: '生产领料', value: '生产领料' },
  { label: '工具领用', value: '工具领用' },
  { label: '维修领料', value: '维修领料' },
  { label: '调拨出库', value: '调拨出库' },
  { label: '报废出库', value: '报废出库' }
]

// 表单验证规则
const stockInRules = {
  itemId: { required: true, message: '请选择物料' },
  quantity: { required: true, message: '请输入入库数量' },
  reason: { required: true, message: '请选择入库原因' }
}

const stockOutRules = {
  itemId: { required: true, message: '请选择物料' },
  quantity: { required: true, message: '请输入出库数量' },
  reason: { required: true, message: '请选择出库原因' }
}

// 工具函数
function getStockStatusTagType(status: string): string {
  const typeMap: Record<string, string> = {
    normal: 'success',
    low_stock: 'warning',
    overstock: 'info',
    out_of_stock: 'danger'
  }
  return typeMap[status] || 'info'
}

function getStockStatusLabel(status: string): string {
  const labelMap: Record<string, string> = {
    normal: '正常',
    low_stock: '库存不足',
    overstock: '库存超量',
    out_of_stock: '缺货'
  }
  return labelMap[status] || status
}

function getAlertTagType(severity: string): string {
  const typeMap: Record<string, string> = {
    low: 'info',
    medium: 'warning',
    high: 'danger',
    critical: 'danger'
  }
  return typeMap[severity] || 'info'
}

function getAlertLabel(severity: string): string {
  const labelMap: Record<string, string> = {
    low: '低',
    medium: '中',
    high: '高',
    critical: '紧急'
  }
  return labelMap[severity] || severity
}

function formatMoney(value: number): string {
  return value.toLocaleString()
}

function formatTime(dateTimeStr: string): string {
  return new Date(dateTimeStr).toLocaleString('zh-CN')
}

// 方法
async function loadInventoryData() {
  loading.value = true
  try {
    const result = await getInventoryItems({
      page: pagination.page,
      pageSize: pagination.pageSize,
      ...filterForm
    }) as any
    
    if (result.code === 200) {
      inventoryData.value = result.data.list
      pagination.itemCount = result.data.total
    }
  } catch (error) {
    console.error('加载库存数据失败:', error)
    ElMessage.error('加载库存数据失败')
  } finally {
    loading.value = false
  }
}

async function loadStats() {
  try {
    const result = await getInventoryStats() as any
    if (result.code === 200) {
      stats.value = result.data
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

async function loadAlerts() {
  try {
    const result = await getStockAlerts() as any
    if (result.code === 200) {
      alerts.value = result.data
    }
  } catch (error) {
    console.error('加载预警数据失败:', error)
  }
}

async function loadRecentMovements() {
  try {
    const result = await getStockMovements() as any
    if (result.code === 200) {
      recentMovements.value = result.data.list.slice(0, 5)
    }
  } catch (error) {
    console.error('加载出入库记录失败:', error)
  }
}

function handleSearch() {
  pagination.page = 1
  loadInventoryData()
}

function handleReset() {
  Object.keys(filterForm).forEach(key => {
    ;(filterForm as any)[key] = key === 'keyword' ? '' : null
  })
  pagination.page = 1
  loadInventoryData()
}

function handleViewDetail(row: InventoryItem) {
  currentItem.value = { ...row }
  adjustQuantity.value = 0
  adjustReason.value = ''
  showDetailModal.value = true
}

async function handleStockIn() {
  try {
    const result = await createStockMovement({
      ...stockInForm,
      type: 'in',
      operator: '当前用户'
    }) as any
    
    if (result.code === 200) {
      ElMessage.success('入库成功')
      showStockInModal.value = false
      // 重置表单
      Object.keys(stockInForm).forEach(key => {
        if (key === 'quantity') {
          ;(stockInForm as any)[key] = 1
        } else {
          ;(stockInForm as any)[key] = ''
        }
      })
      loadInventoryData()
      loadStats()
    }
  } catch (error) {
    console.error('入库失败:', error)
    ElMessage.error('入库失败')
  }
}

async function handleStockOut() {
  try {
    const result = await createStockMovement({
      ...stockOutForm,
      type: 'out',
      operator: '当前用户'
    }) as any
    
    if (result.code === 200) {
      ElMessage.success('出库成功')
      showStockOutModal.value = false
      // 重置表单
      Object.keys(stockOutForm).forEach(key => {
        if (key === 'quantity') {
          ;(stockOutForm as any)[key] = 1
        } else {
          ;(stockOutForm as any)[key] = ''
        }
      })
      loadInventoryData()
      loadStats()
    }
  } catch (error) {
    console.error('出库失败:', error)
    ElMessage.error('出库失败')
  }
}

async function handleAdjustStock() {
  if (!currentItem.value || !adjustQuantity.value || !adjustReason.value) {
    ElMessage.warning('请填写调整数量和原因')
    return
  }
  
  try {
    const result = await updateInventoryItem(currentItem.value.id, {
      adjustQuantity: adjustQuantity.value,
      adjustReason: adjustReason.value
    }) as any
    
    if (result.code === 200) {
      ElMessage.success('库存调整成功')
      showDetailModal.value = false
      loadInventoryData()
      loadStats()
    }
  } catch (error) {
    console.error('库存调整失败:', error)
    ElMessage.error('库存调整失败')
  }
}

function handlePageChange(page: number) {
  pagination.page = page
  loadInventoryData()
}

function handlePageSizeChange(pageSize: number) {
  pagination.pageSize = pageSize
  pagination.page = 1
  loadInventoryData()
}

onMounted(() => {
  loadStats()
  loadInventoryData()
  loadAlerts()
  loadRecentMovements()
})
</script>

<style scoped>
.inventory-stock {
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

.stat-card.value :deep(.el-card__body) {
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border: 1px solid #22c55e;
}

.stat-card.alert :deep(.el-card__body) {
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  border: 1px solid #ef4444;
}

.stat-card.turnover :deep(.el-card__body) {
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

.sidebar-card {
  margin-bottom: 16px;
}

.alert-list, .movement-list {
  max-height: 300px;
  overflow-y: auto;
}

.alert-item, .movement-item {
  padding: 12px;
  border-bottom: 1px solid var(--el-border-color);
  transition: background-color 0.3s ease;
}

.alert-item:hover, .movement-item:hover {
  background-color: var(--el-color-info-light-9);
}

.alert-item:last-child, .movement-item:last-child {
  border-bottom: none;
}

.alert-header, .movement-type {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.alert-time, .movement-time {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}

.alert-title, .movement-item-name {
  font-weight: 500;
  color: var(--el-text-color-primary);
  margin-bottom: 4px;
}

.alert-message, .movement-details {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  margin-bottom: 4px;
}

.alert-stock {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}

.movement-item {
  display: flex;
  gap: 12px;
}

.movement-content {
  flex: 1;
}

.inventory-detail {
  margin-bottom: 16px;
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

[data-theme="factory"] .alert-item:hover,
[data-theme="factory"] .movement-item:hover {
  background-color: rgba(0, 212, 255, 0.05);
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .action-row {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filters,
  .actions {
    justify-content: center;
  }
}
</style> 