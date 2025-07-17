<template>
  <div class="inventory-io-page">
    <!-- 顶部统计卡片 -->
    <div class="stats-overview">
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="stat-card inbound">
            <div class="stat-icon">
              <el-icon><Upload /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ ioStats.todayInbound }}</div>
              <div class="stat-label">今日入库</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card outbound">
            <div class="stat-icon">
              <el-icon><Download /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ ioStats.todayOutbound }}</div>
              <div class="stat-label">今日出库</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card transfer">
            <div class="stat-icon">
              <el-icon><Switch /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ ioStats.todayTransfer }}</div>
              <div class="stat-label">今日调拨</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card pending">
            <div class="stat-icon">
              <el-icon><Clock /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ ioStats.pendingTasks }}</div>
              <div class="stat-label">待处理</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 功能选项卡 -->
    <div class="function-tabs">
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="收发记录" name="records">
          <!-- 操作栏 -->
          <div class="action-bar">
            <div class="filters">
              <el-input
                v-model="searchText"
                placeholder="搜索单据号/物料名称"
                style="width: 200px"
                :prefix-icon="Search"
                clearable
              />
              <el-select v-model="selectedType" placeholder="业务类型" clearable style="width: 120px">
                <el-option label="入库" value="inbound" />
                <el-option label="出库" value="outbound" />
                <el-option label="调拨" value="transfer" />
                <el-option label="盘点" value="count" />
              </el-select>
              <el-select v-model="selectedWarehouse" placeholder="仓库" clearable style="width: 150px">
                <el-option
                  v-for="warehouse in warehouseList"
                  :key="warehouse.id"
                  :label="warehouse.name"
                  :value="warehouse.id"
                />
              </el-select>
              <el-date-picker
                v-model="dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                style="width: 300px"
              />
              <el-button @click="handleSearch" type="primary" :icon="Search">查询</el-button>
              <el-button @click="handleReset" :icon="Refresh">重置</el-button>
            </div>
            <div class="actions">
              <el-dropdown @command="handleQuickAction">
                <el-button type="primary" :icon="Plus">
                  快速操作<el-icon class="el-icon--right"><arrow-down /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="inbound">创建入库单</el-dropdown-item>
                    <el-dropdown-item command="outbound">创建出库单</el-dropdown-item>
                    <el-dropdown-item command="transfer">创建调拨单</el-dropdown-item>
                    <el-dropdown-item command="count">创建盘点单</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
              <el-button @click="handleBatchProcess" type="success" :icon="Check" :disabled="!selectedItems.length">
                批量审核
              </el-button>
              <el-button @click="handleExport" :icon="Download">导出</el-button>
            </div>
          </div>

          <!-- 记录列表 -->
          <div class="records-table">
            <el-table
              :data="recordsList"
              v-loading="loading"
              @selection-change="handleSelectionChange"
              row-key="id"
              stripe
              border
              height="500"
            >
              <el-table-column type="selection" width="55" />
              <el-table-column prop="doc_no" label="单据号" width="150" fixed="left" />
              <el-table-column prop="type" label="业务类型" width="100">
                <template #default="scope">
                  <el-tag :type="getTypeTag(scope.row.type)">
                    {{ getTypeName(scope.row.type) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="material_name" label="物料名称" width="200" />
              <el-table-column prop="batch_no" label="批次号" width="130" />
              <el-table-column prop="quantity" label="数量" width="100" align="center">
                <template #default="scope">
                  <span :class="getQuantityClass(scope.row.type)">
                    {{ formatQuantity(scope.row.quantity, scope.row.type) }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column prop="unit" label="单位" width="80" align="center" />
              <el-table-column prop="warehouse_name" label="仓库" width="120" />
              <el-table-column prop="location" label="库位" width="100" />
              <el-table-column prop="operator_name" label="操作人" width="100" />
              <el-table-column prop="operation_time" label="操作时间" width="160" />
              <el-table-column prop="status" label="状态" width="100">
                <template #default="scope">
                  <el-tag :type="getStatusTag(scope.row.status)">
                    {{ getStatusName(scope.row.status) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="180" fixed="right">
                <template #default="scope">
                  <el-button
                    v-if="scope.row.status === 'pending'"
                    @click="handleApprove(scope.row)"
                    type="primary"
                    size="small"
                    :icon="Check"
                  >
                    审核
                  </el-button>
                  <el-button
                    @click="handleViewDetail(scope.row)"
                    size="small"
                    :icon="View"
                  >
                    详情
                  </el-button>
                  <el-dropdown @command="(cmd: string) => handleMoreAction(cmd, scope.row)">
                    <el-button size="small" :icon="More" />
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item command="trace">批次追溯</el-dropdown-item>
                        <el-dropdown-item command="print">打印标签</el-dropdown-item>
                        <el-dropdown-item command="cancel" v-if="scope.row.status === 'pending'">撤销</el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </template>
              </el-table-column>
            </el-table>

            <!-- 分页 -->
            <div class="pagination">
              <el-pagination
                v-model:current-page="currentPage"
                v-model:page-size="pageSize"
                :page-sizes="[10, 20, 50, 100]"
                :total="total"
                layout="total, sizes, prev, pager, next, jumper"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
              />
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="批次追溯" name="trace">
          <!-- 追溯查询 -->
          <div class="trace-search">
            <el-row :gutter="20">
              <el-col :span="8">
                <el-input
                  v-model="traceQuery.batchNo"
                  placeholder="输入批次号"
                  :prefix-icon="Search"
                />
              </el-col>
              <el-col :span="8">
                <el-input
                  v-model="traceQuery.materialCode"
                  placeholder="输入物料编码"
                  :prefix-icon="Box"
                />
              </el-col>
              <el-col :span="4">
                <el-button @click="handleTrace" type="primary" style="width: 100%">
                  开始追溯
                </el-button>
              </el-col>
              <el-col :span="4">
                <el-button @click="handleResetTrace" style="width: 100%">
                  重置
                </el-button>
              </el-col>
            </el-row>
          </div>

          <!-- 追溯结果 -->
          <div v-if="traceResult" class="trace-result">
            <!-- 基本信息 -->
            <div class="trace-info">
              <el-descriptions title="批次信息" :column="4" border>
                <el-descriptions-item label="批次号">{{ traceResult.batch_no }}</el-descriptions-item>
                <el-descriptions-item label="物料名称">{{ traceResult.material_name }}</el-descriptions-item>
                <el-descriptions-item label="供应商">{{ traceResult.supplier }}</el-descriptions-item>
                <el-descriptions-item label="生产日期">{{ traceResult.production_date }}</el-descriptions-item>
                <el-descriptions-item label="有效期至">{{ traceResult.expire_date }}</el-descriptions-item>
                <el-descriptions-item label="当前库存">{{ traceResult.current_stock }}</el-descriptions-item>
                <el-descriptions-item label="已使用">{{ traceResult.used_qty }}</el-descriptions-item>
                <el-descriptions-item label="状态">
                  <el-tag :type="traceResult.status === 'active' ? 'success' : 'warning'">
                    {{ traceResult.status === 'active' ? '正常' : '异常' }}
                  </el-tag>
                </el-descriptions-item>
              </el-descriptions>
            </div>

            <!-- 流转记录 -->
            <div class="trace-flow" style="margin-top: 20px;">
              <h3>流转记录</h3>
              <el-timeline>
                <el-timeline-item
                  v-for="(item, index) in traceResult.flow_records"
                  :key="index"
                  :timestamp="item.timestamp"
                  :type="getFlowType(item.operation)"
                >
                  <el-card>
                    <div class="flow-item">
                      <div class="flow-header">
                        <h4>{{ item.operation }}</h4>
                        <el-tag size="small">{{ item.doc_no }}</el-tag>
                      </div>
                      <div class="flow-content">
                        <el-row :gutter="20">
                          <el-col :span="6">
                            <strong>数量：</strong>{{ item.quantity }} {{ item.unit }}
                          </el-col>
                          <el-col :span="6">
                            <strong>仓库：</strong>{{ item.warehouse }}
                          </el-col>
                          <el-col :span="6">
                            <strong>操作人：</strong>{{ item.operator }}
                          </el-col>
                          <el-col :span="6">
                            <strong>库存余额：</strong>{{ item.balance }} {{ item.unit }}
                          </el-col>
                        </el-row>
                        <div v-if="item.remark" style="margin-top: 10px;">
                          <strong>备注：</strong>{{ item.remark }}
                        </div>
                      </div>
                    </div>
                  </el-card>
                </el-timeline-item>
              </el-timeline>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="统计分析" name="analysis">
          <!-- 图表分析 -->
          <div class="analysis-charts">
            <el-row :gutter="20">
              <el-col :span="12">
                <div class="chart-card">
                  <h3>本月收发趋势</h3>
                  <div ref="trendChart" class="chart-container"></div>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="chart-card">
                  <h3>业务类型分布</h3>
                  <div ref="typeChart" class="chart-container"></div>
                </div>
              </el-col>
            </el-row>
            <el-row :gutter="20" style="margin-top: 20px">
              <el-col :span="24">
                <div class="chart-card">
                  <h3>仓库活跃度分析</h3>
                  <div ref="warehouseChart" class="chart-container"></div>
                </div>
              </el-col>
            </el-row>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 详情弹窗 -->
    <el-dialog
      v-model="detailDialogVisible"
      :title="'单据详情 - ' + currentRecord?.doc_no"
      width="70%"
    >
      <div v-if="currentRecord" class="record-detail">
        <el-descriptions :column="3" border>
          <el-descriptions-item label="单据号">{{ currentRecord.doc_no }}</el-descriptions-item>
          <el-descriptions-item label="业务类型">{{ getTypeName(currentRecord.type) }}</el-descriptions-item>
          <el-descriptions-item label="状态">{{ getStatusName(currentRecord.status) }}</el-descriptions-item>
          <el-descriptions-item label="物料名称">{{ currentRecord.material_name }}</el-descriptions-item>
          <el-descriptions-item label="批次号">{{ currentRecord.batch_no }}</el-descriptions-item>
          <el-descriptions-item label="数量">{{ currentRecord.quantity }} {{ currentRecord.unit }}</el-descriptions-item>
          <el-descriptions-item label="仓库">{{ currentRecord.warehouse_name }}</el-descriptions-item>
          <el-descriptions-item label="库位">{{ currentRecord.location }}</el-descriptions-item>
          <el-descriptions-item label="操作人">{{ currentRecord.operator_name }}</el-descriptions-item>
        </el-descriptions>

        <div style="margin-top: 20px" v-if="currentRecord.remark">
          <h4>备注信息</h4>
          <p>{{ currentRecord.remark }}</p>
        </div>
      </div>
    </el-dialog>

    <!-- 创建单据弹窗 -->
    <el-dialog v-model="createDialogVisible" :title="createDialogTitle" width="600px">
      <el-form :model="newRecord" :rules="recordRules" ref="recordFormRef" label-width="100px">
        <el-form-item label="业务类型" prop="type">
          <el-select v-model="newRecord.type" placeholder="选择类型" disabled>
            <el-option label="入库" value="inbound" />
            <el-option label="出库" value="outbound" />
            <el-option label="调拨" value="transfer" />
            <el-option label="盘点" value="count" />
          </el-select>
        </el-form-item>
        <el-form-item label="物料" prop="material_id">
          <el-select v-model="newRecord.material_id" placeholder="选择物料" filterable>
            <el-option
              v-for="material in materialList"
              :key="material.id"
              :label="`${material.code} - ${material.name}`"
              :value="material.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="批次号" prop="batch_no">
          <el-input v-model="newRecord.batch_no" placeholder="输入批次号" />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="数量" prop="quantity">
              <el-input-number v-model="newRecord.quantity" :min="0.01" :precision="2" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="单位" prop="unit">
              <el-select v-model="newRecord.unit" placeholder="选择单位">
                <el-option label="个" value="pcs" />
                <el-option label="kg" value="kg" />
                <el-option label="米" value="m" />
                <el-option label="箱" value="box" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="仓库" prop="warehouse_id">
              <el-select v-model="newRecord.warehouse_id" placeholder="选择仓库">
                <el-option
                  v-for="warehouse in warehouseList"
                  :key="warehouse.id"
                  :label="warehouse.name"
                  :value="warehouse.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="库位" prop="location">
              <el-input v-model="newRecord.location" placeholder="输入库位" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="备注">
          <el-input v-model="newRecord.remark" type="textarea" :rows="3" placeholder="填写备注..." />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="createDialogVisible = false">取消</el-button>
          <el-button @click="handleCreateSubmit" type="primary" :loading="submitting">
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, nextTick, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as echarts from 'echarts'
import {
  Upload, Download, Switch, Clock, Search, Refresh, Plus, Check, View, More, Box, ArrowDown
} from '@element-plus/icons-vue'

// 响应式数据
const loading = ref(false)
const activeTab = ref('records')
const searchText = ref('')
const selectedType = ref('')
const selectedWarehouse = ref('')
const dateRange = ref<string[]>([])
const selectedItems = ref<any[]>([])
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)

const detailDialogVisible = ref(false)
const createDialogVisible = ref(false)
const submitting = ref(false)
const currentRecord = ref<any>(null)

// 图表实例
const trendChart = ref()
const typeChart = ref()
const warehouseChart = ref()

// 统计数据
const ioStats = reactive({
  todayInbound: 128,
  todayOutbound: 95,
  todayTransfer: 23,
  pendingTasks: 12
})

// 追溯查询
const traceQuery = reactive({
  batchNo: '',
  materialCode: ''
})

// 追溯结果
const traceResult = ref<any>(null)

// 仓库列表
const warehouseList = ref([
  { id: 'WH001', name: '原料仓' },
  { id: 'WH002', name: '成品仓' },
  { id: 'WH003', name: '半成品仓' },
  { id: 'WH004', name: '不良品仓' }
])

// 物料列表
const materialList = ref([
  { id: 'M001', code: 'MAT001', name: '不锈钢板材' },
  { id: 'M002', code: 'MAT002', name: '电子元件' },
  { id: 'M003', code: 'MAT003', name: '包装材料' }
])

// 收发记录列表
const recordsList = ref([
  {
    id: 'IO001',
    doc_no: 'IN20240115001',
    type: 'inbound',
    material_name: '不锈钢板材',
    batch_no: 'B20240115001',
    quantity: 100,
    unit: 'kg',
    warehouse_name: '原料仓',
    location: 'A01-01',
    operator_name: '张入库',
    operation_time: '2024-01-15 09:00:00',
    status: 'approved',
    remark: '质检合格入库'
  },
  {
    id: 'IO002',
    doc_no: 'OUT20240115001',
    type: 'outbound',
    material_name: '电子元件',
    batch_no: 'B20240114002',
    quantity: 50,
    unit: 'pcs',
    warehouse_name: '原料仓',
    location: 'B02-03',
    operator_name: '李出库',
    operation_time: '2024-01-15 10:30:00',
    status: 'approved',
    remark: '生产领料'
  },
  {
    id: 'IO003',
    doc_no: 'TF20240115001',
    type: 'transfer',
    material_name: '包装材料',
    batch_no: 'B20240115003',
    quantity: 200,
    unit: 'pcs',
    warehouse_name: '半成品仓',
    location: 'C03-05',
    operator_name: '王调拨',
    operation_time: '2024-01-15 14:20:00',
    status: 'pending',
    remark: '仓库间调拨'
  }
])

// 新建记录表单
const newRecord = reactive({
  type: '',
  material_id: '',
  batch_no: '',
  quantity: 1,
  unit: 'pcs',
  warehouse_id: '',
  location: '',
  remark: ''
})

// 表单验证规则
const recordRules = {
  type: [{ required: true, message: '请选择业务类型', trigger: 'change' }],
  material_id: [{ required: true, message: '请选择物料', trigger: 'change' }],
  batch_no: [{ required: true, message: '请输入批次号', trigger: 'blur' }],
  quantity: [{ required: true, message: '请输入数量', trigger: 'blur' }],
  unit: [{ required: true, message: '请选择单位', trigger: 'change' }],
  warehouse_id: [{ required: true, message: '请选择仓库', trigger: 'change' }],
  location: [{ required: true, message: '请输入库位', trigger: 'blur' }]
}

const recordFormRef = ref()

// 计算属性
const createDialogTitle = computed(() => {
  const typeMap: any = {
    inbound: '创建入库单',
    outbound: '创建出库单',
    transfer: '创建调拨单',
    count: '创建盘点单'
  }
  return typeMap[newRecord.type] || '创建单据'
})

// 方法
const getTypeTag = (type: string) => {
  const map: any = {
    inbound: 'success',
    outbound: 'warning',
    transfer: 'primary',
    count: 'info'
  }
  return map[type] || ''
}

const getTypeName = (type: string) => {
  const map: any = {
    inbound: '入库',
    outbound: '出库',
    transfer: '调拨',
    count: '盘点'
  }
  return map[type] || type
}

const getQuantityClass = (type: string) => {
  const map: any = {
    inbound: 'quantity-in',
    outbound: 'quantity-out',
    transfer: 'quantity-transfer'
  }
  return map[type] || ''
}

const formatQuantity = (quantity: number, type: string) => {
  const prefix = type === 'outbound' ? '-' : '+'
  return type === 'transfer' ? quantity.toString() : prefix + quantity
}

const getStatusTag = (status: string) => {
  const map: any = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger'
  }
  return map[status] || ''
}

const getStatusName = (status: string) => {
  const map: any = {
    pending: '待审核',
    approved: '已审核',
    rejected: '已拒绝'
  }
  return map[status] || status
}

const getFlowType = (operation: string) => {
  if (operation.includes('入库')) return 'success'
  if (operation.includes('出库')) return 'warning'
  if (operation.includes('调拨')) return 'primary'
  return 'info'
}

const handleTabChange = (tabName: string) => {
  if (tabName === 'analysis') {
    nextTick(() => {
      initAnalysisCharts()
    })
  }
}

const handleSearch = () => {
  if (activeTab.value === 'records') {
    loadRecordsList()
  }
}

const handleReset = () => {
  searchText.value = ''
  selectedType.value = ''
  selectedWarehouse.value = ''
  dateRange.value = []
  if (activeTab.value === 'records') {
    loadRecordsList()
  }
}

const handleQuickAction = (command: string) => {
  newRecord.type = command
  createDialogVisible.value = true
}

const handleBatchProcess = () => {
  ElMessageBox.confirm('确定要批量审核选中的单据吗？', '确认', {
    type: 'warning'
  }).then(() => {
    ElMessage.success('批量审核成功')
    selectedItems.value = []
    loadRecordsList()
  })
}

const handleExport = () => {
  ElMessage.success('导出功能开发中...')
}

const handleSelectionChange = (items: any[]) => {
  selectedItems.value = items
}

const handleApprove = (row: any) => {
  ElMessageBox.confirm('确定要审核通过这个单据吗？', '确认', {
    type: 'warning'
  }).then(() => {
    ElMessage.success('审核成功')
    loadRecordsList()
  })
}

const handleViewDetail = (row: any) => {
  currentRecord.value = row
  detailDialogVisible.value = true
}

const handleMoreAction = (command: string, row: any) => {
  switch (command) {
    case 'trace':
      traceQuery.batchNo = row.batch_no
      activeTab.value = 'trace'
      handleTrace()
      break
    case 'print':
      ElMessage.success('打印标签功能开发中...')
      break
    case 'cancel':
      ElMessageBox.confirm('确定要撤销这个单据吗？', '确认', {
        type: 'warning'
      }).then(() => {
        ElMessage.success('撤销成功')
        loadRecordsList()
      })
      break
  }
}

const handleTrace = () => {
  if (!traceQuery.batchNo && !traceQuery.materialCode) {
    ElMessage.warning('请输入批次号或物料编码')
    return
  }

  // 模拟追溯结果
  traceResult.value = {
    batch_no: traceQuery.batchNo || 'B20240115001',
    material_name: '不锈钢板材',
    supplier: '上海钢材有限公司',
    production_date: '2024-01-10',
    expire_date: '2025-01-10',
    current_stock: 75,
    used_qty: 25,
    status: 'active',
    flow_records: [
      {
        timestamp: '2024-01-15 09:00:00',
        operation: '采购入库',
        doc_no: 'PO20240115001',
        quantity: 100,
        unit: 'kg',
        warehouse: '原料仓',
        operator: '张入库',
        balance: 100,
        remark: '质检合格入库'
      },
      {
        timestamp: '2024-01-15 14:30:00',
        operation: '生产出库',
        doc_no: 'MO20240115001',
        quantity: 25,
        unit: 'kg',
        warehouse: '原料仓',
        operator: '李生产',
        balance: 75,
        remark: '生产线1领料'
      }
    ]
  }
}

const handleResetTrace = () => {
  traceQuery.batchNo = ''
  traceQuery.materialCode = ''
  traceResult.value = null
}

const handleCreateSubmit = () => {
  recordFormRef.value?.validate((valid: boolean) => {
    if (valid) {
      submitting.value = true
      setTimeout(() => {
        submitting.value = false
        createDialogVisible.value = false
        ElMessage.success('创建成功')
        loadRecordsList()
        resetCreateForm()
      }, 1000)
    }
  })
}

const resetCreateForm = () => {
  Object.assign(newRecord, {
    type: '',
    material_id: '',
    batch_no: '',
    quantity: 1,
    unit: 'pcs',
    warehouse_id: '',
    location: '',
    remark: ''
  })
}

const loadRecordsList = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    total.value = recordsList.value.length
  }, 500)
}

const handleSizeChange = (size: number) => {
  pageSize.value = size
  loadRecordsList()
}

const handleCurrentChange = (page: number) => {
  currentPage.value = page
  loadRecordsList()
}

// 初始化分析图表
const initAnalysisCharts = () => {
  initTrendChart()
  initTypeChart()
  initWarehouseChart()
}

const initTrendChart = () => {
  const chartInstance = echarts.init(trendChart.value)
  
  const option = {
    title: {
      text: '本月收发趋势',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['入库', '出库', '调拨']
    },
    xAxis: {
      type: 'category',
      data: ['1/10', '1/11', '1/12', '1/13', '1/14', '1/15', '1/16']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '入库',
        type: 'line',
        data: [120, 132, 101, 134, 90, 230, 210],
        itemStyle: { color: '#67c23a' }
      },
      {
        name: '出库',
        type: 'line',
        data: [220, 182, 191, 234, 290, 330, 310],
        itemStyle: { color: '#e6a23c' }
      },
      {
        name: '调拨',
        type: 'line',
        data: [150, 232, 201, 154, 190, 330, 410],
        itemStyle: { color: '#409eff' }
      }
    ]
  }
  
  chartInstance.setOption(option)
}

const initTypeChart = () => {
  const chartInstance = echarts.init(typeChart.value)
  
  const option = {
    title: {
      text: '业务类型分布',
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: '业务类型',
        type: 'pie',
        radius: '50%',
        data: [
          { value: 45, name: '入库' },
          { value: 35, name: '出库' },
          { value: 15, name: '调拨' },
          { value: 5, name: '盘点' }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }
  
  chartInstance.setOption(option)
}

const initWarehouseChart = () => {
  const chartInstance = echarts.init(warehouseChart.value)
  
  const option = {
    title: {
      text: '仓库活跃度分析',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['入库次数', '出库次数']
    },
    xAxis: {
      type: 'category',
      data: ['原料仓', '成品仓', '半成品仓', '不良品仓']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '入库次数',
        type: 'bar',
        data: [25, 18, 12, 5],
        itemStyle: { color: '#67c23a' }
      },
      {
        name: '出库次数',
        type: 'bar',
        data: [30, 22, 15, 3],
        itemStyle: { color: '#e6a23c' }
      }
    ]
  }
  
  chartInstance.setOption(option)
}

// 生命周期
onMounted(() => {
  loadRecordsList()
})
</script>

<style scoped lang="scss">
.inventory-io-page {
  padding: 20px;
  background: var(--el-bg-color-page);
  min-height: 100vh;

  .stats-overview {
    margin-bottom: 20px;

    .stat-card {
      background: white;
      border-radius: 8px;
      padding: 20px;
      display: flex;
      align-items: center;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transition: transform 0.2s;

      &:hover {
        transform: translateY(-2px);
      }

      .stat-icon {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        color: white;
        margin-right: 15px;
      }

      .stat-content {
        flex: 1;

        .stat-number {
          font-size: 28px;
          font-weight: bold;
          margin-bottom: 5px;
        }

        .stat-label {
          color: var(--el-text-color-regular);
          font-size: 14px;
        }
      }

      &.inbound {
        .stat-icon {
          background: linear-gradient(135deg, #67c23a, #85ce61);
        }
        .stat-number {
          color: #67c23a;
        }
      }

      &.outbound {
        .stat-icon {
          background: linear-gradient(135deg, #e6a23c, #ebb563);
        }
        .stat-number {
          color: #e6a23c;
        }
      }

      &.transfer {
        .stat-icon {
          background: linear-gradient(135deg, #409eff, #66b1ff);
        }
        .stat-number {
          color: #409eff;
        }
      }

      &.pending {
        .stat-icon {
          background: linear-gradient(135deg, #f56c6c, #f78989);
        }
        .stat-number {
          color: #f56c6c;
        }
      }
    }
  }

  .function-tabs {
    background: white;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

    .action-bar {
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .filters {
        display: flex;
        gap: 15px;
        align-items: center;
        flex-wrap: wrap;
      }

      .actions {
        display: flex;
        gap: 10px;
      }
    }

    .records-table {
      .pagination {
        margin-top: 20px;
        display: flex;
        justify-content: center;
      }
    }

    .trace-search {
      margin-bottom: 20px;
    }

    .trace-result {
      .trace-info {
        margin-bottom: 20px;
      }

      .trace-flow {
        h3 {
          margin-bottom: 20px;
          color: var(--el-text-color-primary);
        }

        .flow-item {
          .flow-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;

            h4 {
              margin: 0;
              color: var(--el-text-color-primary);
            }
          }

          .flow-content {
            color: var(--el-text-color-regular);
            font-size: 14px;
          }
        }
      }
    }

    .analysis-charts {
      .chart-card {
        background: var(--el-bg-color-soft);
        border-radius: 8px;
        padding: 20px;

        h3 {
          margin-bottom: 15px;
          color: var(--el-text-color-primary);
          text-align: center;
        }

        .chart-container {
          height: 300px;
        }
      }
    }
  }

  :deep(.quantity-in) {
    color: #67c23a;
    font-weight: bold;
  }

  :deep(.quantity-out) {
    color: #e6a23c;
    font-weight: bold;
  }

  :deep(.quantity-transfer) {
    color: #409eff;
    font-weight: bold;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .inventory-io-page {
    padding: 10px;

    .action-bar {
      flex-direction: column;
      gap: 15px;

      .filters,
      .actions {
        width: 100%;
        justify-content: flex-start;
      }
    }

    .stats-overview {
      :deep(.el-col) {
        margin-bottom: 15px;
      }
    }

    .analysis-charts {
      :deep(.el-col) {
        margin-bottom: 15px;
      }
    }
  }
}
</style> 