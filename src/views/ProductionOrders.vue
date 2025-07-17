<template>
  <div class="production-orders-page">
    <!-- 顶部统计卡片 -->
    <div class="stats-overview">
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="stat-card total">
            <div class="stat-icon">
              <el-icon><Document /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ orderStats.total }}</div>
              <div class="stat-label">工单总数</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card running">
            <div class="stat-icon">
              <el-icon><VideoPlay /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ orderStats.running }}</div>
              <div class="stat-label">进行中</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card completed">
            <div class="stat-icon">
              <el-icon><CircleCheck /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ orderStats.completed }}</div>
              <div class="stat-label">已完成</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card efficiency">
            <div class="stat-icon">
              <el-icon><TrendCharts /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ orderStats.efficiency }}%</div>
              <div class="stat-label">完成率</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 功能选项卡 -->
    <div class="function-tabs">
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="工单管理" name="orders">
          <!-- 操作栏 -->
          <div class="action-bar">
            <div class="filters">
              <el-input
                v-model="searchText"
                placeholder="搜索工单号/产品名称"
                style="width: 200px"
                :prefix-icon="Search"
                clearable
              />
              <el-select v-model="selectedStatus" placeholder="工单状态" clearable style="width: 120px">
                <el-option label="计划中" value="planned" />
                <el-option label="已派工" value="assigned" />
                <el-option label="进行中" value="running" />
                <el-option label="已完成" value="completed" />
                <el-option label="已暂停" value="paused" />
              </el-select>
              <el-select v-model="selectedLine" placeholder="生产线" clearable style="width: 120px">
                <el-option
                  v-for="line in productionLines"
                  :key="line.id"
                  :label="line.name"
                  :value="line.id"
                />
              </el-select>
              <el-select v-model="selectedPriority" placeholder="优先级" clearable style="width: 120px">
                <el-option label="紧急" value="urgent" />
                <el-option label="高" value="high" />
                <el-option label="普通" value="normal" />
                <el-option label="低" value="low" />
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
              <el-button @click="handleCreateOrder" type="primary" :icon="Plus">新建工单</el-button>
              <el-button @click="handleBatchAssign" type="success" :icon="User" :disabled="!selectedItems.length">
                批量派工
              </el-button>
              <el-button @click="handleExport" :icon="Download">导出</el-button>
            </div>
          </div>

          <!-- 工单列表 -->
          <div class="orders-table">
            <el-table
              :data="ordersList"
              v-loading="loading"
              @selection-change="handleSelectionChange"
              row-key="id"
              stripe
              border
              height="500"
            >
              <el-table-column type="selection" width="55" />
              <el-table-column prop="order_no" label="工单号" width="150" fixed="left">
                <template #default="scope">
                  <el-link @click="handleViewDetail(scope.row)" type="primary">
                    {{ scope.row.order_no }}
                  </el-link>
                </template>
              </el-table-column>
              <el-table-column prop="product_name" label="产品名称" width="200" />
              <el-table-column prop="plan_qty" label="计划数量" width="100" align="center" />
              <el-table-column prop="completed_qty" label="完成数量" width="100" align="center" />
              <el-table-column label="完成进度" width="150">
                <template #default="scope">
                  <el-progress
                    :percentage="Math.round((scope.row.completed_qty / scope.row.plan_qty) * 100)"
                    :color="getProgressColor(scope.row.completed_qty / scope.row.plan_qty)"
                  />
                </template>
              </el-table-column>
              <el-table-column prop="priority" label="优先级" width="100">
                <template #default="scope">
                  <el-tag :type="getPriorityTag(scope.row.priority)">
                    {{ getPriorityName(scope.row.priority) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="status" label="状态" width="100">
                <template #default="scope">
                  <el-tag :type="getStatusTag(scope.row.status)">
                    {{ getStatusName(scope.row.status) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="line_name" label="生产线" width="100" />
              <el-table-column prop="assignee_name" label="负责人" width="100" />
              <el-table-column prop="plan_start_date" label="计划开始" width="120" />
              <el-table-column prop="plan_end_date" label="计划完成" width="120">
                <template #default="scope">
                  <span :class="getDeadlineClass(scope.row.plan_end_date, scope.row.status)">
                    {{ scope.row.plan_end_date }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="200" fixed="right">
                <template #default="scope">
                  <el-button
                    v-if="scope.row.status === 'planned'"
                    @click="handleAssignOrder(scope.row)"
                    type="primary"
                    size="small"
                    :icon="User"
                  >
                    派工
                  </el-button>
                  <el-button
                    v-if="scope.row.status === 'assigned'"
                    @click="handleStartOrder(scope.row)"
                    type="success"
                    size="small"
                    :icon="VideoPlay"
                  >
                    开工
                  </el-button>
                  <el-button
                    v-if="scope.row.status === 'running'"
                    @click="handleReportProgress(scope.row)"
                    type="warning"
                    size="small"
                    :icon="Edit"
                  >
                    报工
                  </el-button>
                  <el-dropdown @command="(cmd: string) => handleMoreAction(cmd, scope.row)">
                    <el-button size="small" :icon="More" />
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item command="complete" v-if="scope.row.status === 'running'">完工</el-dropdown-item>
                        <el-dropdown-item command="pause" v-if="scope.row.status === 'running'">暂停</el-dropdown-item>
                        <el-dropdown-item command="resume" v-if="scope.row.status === 'paused'">恢复</el-dropdown-item>
                        <el-dropdown-item command="cancel" divided>取消工单</el-dropdown-item>
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

        <el-tab-pane label="派工计划" name="assignment">
          <!-- 派工看板 -->
          <div class="assignment-board">
            <el-row :gutter="20">
              <el-col :span="8" v-for="line in productionLines" :key="line.id">
                <div class="line-card">
                  <div class="line-header">
                    <h3>{{ line.name }}</h3>
                    <el-tag :type="line.status === 'running' ? 'success' : 'info'">
                      {{ line.status === 'running' ? '运行中' : '待机' }}
                    </el-tag>
                  </div>
                  <div class="line-content">
                    <div class="current-order" v-if="line.currentOrder">
                      <h4>当前工单</h4>
                      <p><strong>工单号：</strong>{{ line.currentOrder.order_no }}</p>
                      <p><strong>产品：</strong>{{ line.currentOrder.product_name }}</p>
                      <p><strong>进度：</strong>{{ line.currentOrder.completed_qty }}/{{ line.currentOrder.plan_qty }}</p>
                      <el-progress
                        :percentage="Math.round((line.currentOrder.completed_qty / line.currentOrder.plan_qty) * 100)"
                        :stroke-width="8"
                      />
                    </div>
                    <div class="pending-orders">
                      <h4>待派工单</h4>
                      <div v-if="line.pendingOrders.length === 0" class="no-orders">
                        暂无待派工单
                      </div>
                      <div v-else class="order-item" v-for="order in line.pendingOrders" :key="order.id">
                        <div class="order-info">
                          <span class="order-no">{{ order.order_no }}</span>
                          <span class="product-name">{{ order.product_name }}</span>
                        </div>
                        <el-button @click="handleQuickAssign(order, line)" size="small" type="primary">
                          派工
                        </el-button>
                      </div>
                    </div>
                  </div>
                </div>
              </el-col>
            </el-row>
          </div>
        </el-tab-pane>

        <el-tab-pane label="完工报告" name="completion">
          <!-- 完工统计 -->
          <div class="completion-stats">
            <el-row :gutter="20">
              <el-col :span="12">
                <div class="chart-card">
                  <h3>本月完工趋势</h3>
                  <div ref="completionTrendChart" class="chart-container"></div>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="chart-card">
                  <h3>产线完工对比</h3>
                  <div ref="lineComparisonChart" class="chart-container"></div>
                </div>
              </el-col>
            </el-row>
          </div>

          <!-- 完工记录 -->
          <div class="completion-records" style="margin-top: 20px;">
            <h3>完工记录</h3>
            <el-table :data="completionRecords" border stripe>
              <el-table-column prop="order_no" label="工单号" width="150" />
              <el-table-column prop="product_name" label="产品名称" width="200" />
              <el-table-column prop="completed_qty" label="完工数量" width="100" align="center" />
              <el-table-column prop="good_qty" label="合格数量" width="100" align="center" />
              <el-table-column prop="defect_qty" label="不良数量" width="100" align="center" />
              <el-table-column label="合格率" width="100" align="center">
                <template #default="scope">
                  <span :class="getQualityClass(scope.row.good_qty / scope.row.completed_qty)">
                    {{ ((scope.row.good_qty / scope.row.completed_qty) * 100).toFixed(1) }}%
                  </span>
                </template>
              </el-table-column>
              <el-table-column prop="completion_time" label="完工时间" width="160" />
              <el-table-column prop="operator_name" label="操作员" width="100" />
            </el-table>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 工单详情弹窗 -->
    <el-dialog
      v-model="detailDialogVisible"
      :title="'工单详情 - ' + currentOrder?.order_no"
      width="80%"
      top="5vh"
    >
      <div v-if="currentOrder" class="order-detail">
        <!-- 基本信息 -->
        <el-descriptions :column="3" border>
          <el-descriptions-item label="工单号">{{ currentOrder.order_no }}</el-descriptions-item>
          <el-descriptions-item label="产品名称">{{ currentOrder.product_name }}</el-descriptions-item>
          <el-descriptions-item label="产品规格">{{ currentOrder.product_spec || '-' }}</el-descriptions-item>
          <el-descriptions-item label="计划数量">{{ currentOrder.plan_qty }}</el-descriptions-item>
          <el-descriptions-item label="完成数量">{{ currentOrder.completed_qty }}</el-descriptions-item>
          <el-descriptions-item label="不良数量">{{ currentOrder.defect_qty || 0 }}</el-descriptions-item>
          <el-descriptions-item label="优先级">{{ getPriorityName(currentOrder.priority) }}</el-descriptions-item>
          <el-descriptions-item label="状态">{{ getStatusName(currentOrder.status) }}</el-descriptions-item>
          <el-descriptions-item label="生产线">{{ currentOrder.line_name }}</el-descriptions-item>
          <el-descriptions-item label="负责人">{{ currentOrder.assignee_name }}</el-descriptions-item>
          <el-descriptions-item label="计划开始">{{ currentOrder.plan_start_date }}</el-descriptions-item>
          <el-descriptions-item label="计划完成">{{ currentOrder.plan_end_date }}</el-descriptions-item>
        </el-descriptions>

        <!-- 生产进度 -->
        <div style="margin-top: 20px">
          <h4>生产进度</h4>
          <el-steps :active="getOrderStep(currentOrder.status)" align-center>
            <el-step title="工单创建" description="工单下达" />
            <el-step title="派工分配" description="指派生产线" />
            <el-step title="生产开工" description="开始生产" />
            <el-step title="进度报工" description="定期报告进度" />
            <el-step title="完工确认" description="生产完成" />
          </el-steps>
        </div>

        <!-- 报工记录 -->
        <div style="margin-top: 20px">
          <h4>报工记录</h4>
          <el-table :data="workReports" border size="small">
            <el-table-column prop="report_time" label="报工时间" width="150" />
            <el-table-column prop="operator" label="操作员" width="100" />
            <el-table-column prop="completed_qty" label="完成数量" width="100" align="center" />
            <el-table-column prop="good_qty" label="合格数量" width="100" align="center" />
            <el-table-column prop="defect_qty" label="不良数量" width="100" align="center" />
            <el-table-column prop="efficiency" label="效率" width="80" align="center" />
            <el-table-column prop="remark" label="备注" />
          </el-table>
        </div>
      </div>
    </el-dialog>

    <!-- 新建工单弹窗 -->
    <el-dialog v-model="createDialogVisible" title="新建工单" width="600px">
      <el-form :model="newOrder" :rules="orderRules" ref="orderFormRef" label-width="100px">
        <el-form-item label="产品" prop="product_id">
          <el-select v-model="newOrder.product_id" placeholder="选择产品" filterable>
            <el-option
              v-for="product in productList"
              :key="product.id"
              :label="product.name"
              :value="product.id"
            />
          </el-select>
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="计划数量" prop="plan_qty">
              <el-input-number v-model="newOrder.plan_qty" :min="1" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="优先级" prop="priority">
              <el-select v-model="newOrder.priority" placeholder="选择优先级">
                <el-option label="紧急" value="urgent" />
                <el-option label="高" value="high" />
                <el-option label="普通" value="normal" />
                <el-option label="低" value="low" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="计划开始" prop="plan_start_date">
              <el-date-picker
                v-model="newOrder.plan_start_date"
                type="date"
                placeholder="选择日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="计划完成" prop="plan_end_date">
              <el-date-picker
                v-model="newOrder.plan_end_date"
                type="date"
                placeholder="选择日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="备注">
          <el-input v-model="newOrder.remark" type="textarea" :rows="3" placeholder="填写备注..." />
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
import { ref, reactive, nextTick, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as echarts from 'echarts'
import {
  Document, VideoPlay, CircleCheck, TrendCharts, Search, Refresh, Plus, User, Download,
  Edit, More
} from '@element-plus/icons-vue'

// 响应式数据
const loading = ref(false)
const activeTab = ref('orders')
const searchText = ref('')
const selectedStatus = ref('')
const selectedLine = ref('')
const selectedPriority = ref('')
const dateRange = ref<string[]>([])
const selectedItems = ref<any[]>([])
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)

const detailDialogVisible = ref(false)
const createDialogVisible = ref(false)
const submitting = ref(false)
const currentOrder = ref<any>(null)

// 图表实例
const completionTrendChart = ref()
const lineComparisonChart = ref()

// 统计数据
const orderStats = reactive({
  total: 128,
  running: 24,
  completed: 89,
  efficiency: 85.2
})

// 生产线列表
const productionLines = ref([
  {
    id: 'LINE001',
    name: '生产线1',
    status: 'running',
    currentOrder: {
      order_no: 'WO20240115001',
      product_name: '拓浦智能IH电饭煲3L',
      plan_qty: 100,
      completed_qty: 75
    },
    pendingOrders: [
      { id: 'O001', order_no: 'WO20240115005', product_name: '拓浦智能压力锅4L' }
    ]
  },
  {
    id: 'LINE002',
    name: '生产线2',
    status: 'idle',
    currentOrder: null,
    pendingOrders: [
      { id: 'O002', order_no: 'WO20240115006', product_name: '拓浦破壁机1.5L' },
      { id: 'O003', order_no: 'WO20240115007', product_name: '拓浦智能IH电饭煲3L' }
    ]
  },
  {
    id: 'LINE003',
    name: '生产线3',
    status: 'running',
    currentOrder: {
      order_no: 'WO20240115002',
      product_name: '拓浦破壁机1.5L',
      plan_qty: 50,
      completed_qty: 30
    },
    pendingOrders: []
  }
])

// 产品列表
const productList = ref([
  { id: 'P001', name: '拓浦智能IH电饭煲3L' },
  { id: 'P002', name: '拓浦智能压力锅4L' },
  { id: 'P003', name: '拓浦破壁机1.5L' }
])

// 工单列表
const ordersList = ref([
  {
    id: 'O001',
    order_no: 'WO20240115001',
    product_name: '拓浦智能IH电饭煲3L',
    plan_qty: 100,
    completed_qty: 75,
    defect_qty: 2,
    priority: 'high',
    status: 'running',
    line_name: '生产线1',
    assignee_name: '张班长',
    plan_start_date: '2024-01-15',
    plan_end_date: '2024-01-17'
  },
  {
    id: 'O002',
    order_no: 'WO20240115002',
    product_name: '拓浦智能压力锅4L',
    plan_qty: 80,
    completed_qty: 80,
    defect_qty: 1,
    priority: 'normal',
    status: 'completed',
    line_name: '生产线2',
    assignee_name: '李班长',
    plan_start_date: '2024-01-14',
    plan_end_date: '2024-01-16'
  },
  {
    id: 'O003',
    order_no: 'WO20240115003',
    product_name: '拓浦破壁机1.5L',
    plan_qty: 60,
    completed_qty: 0,
    defect_qty: 0,
    priority: 'urgent',
    status: 'planned',
    line_name: '',
    assignee_name: '',
    plan_start_date: '2024-01-16',
    plan_end_date: '2024-01-18'
  }
])

// 完工记录
const completionRecords = ref([
  {
    order_no: 'WO20240114001',
    product_name: '拓浦智能IH电饭煲3L',
    completed_qty: 100,
    good_qty: 98,
    defect_qty: 2,
    completion_time: '2024-01-14 18:30:00',
    operator_name: '张操作员'
  },
  {
    order_no: 'WO20240114002',
    product_name: '拓浦智能压力锅4L',
    completed_qty: 80,
    good_qty: 79,
    defect_qty: 1,
    completion_time: '2024-01-14 17:45:00',
    operator_name: '李操作员'
  }
])

// 报工记录
const workReports = ref([
  {
    report_time: '2024-01-15 10:00:00',
    operator: '张操作员',
    completed_qty: 25,
    good_qty: 25,
    defect_qty: 0,
    efficiency: '100%',
    remark: '正常生产'
  },
  {
    report_time: '2024-01-15 14:00:00',
    operator: '张操作员',
    completed_qty: 50,
    good_qty: 48,
    defect_qty: 2,
    efficiency: '96%',
    remark: '发现外观缺陷'
  }
])

// 新建工单表单
const newOrder = reactive({
  product_id: '',
  plan_qty: 100,
  priority: 'normal',
  plan_start_date: '',
  plan_end_date: '',
  remark: ''
})

// 表单验证规则
const orderRules = {
  product_id: [{ required: true, message: '请选择产品', trigger: 'change' }],
  plan_qty: [{ required: true, message: '请输入计划数量', trigger: 'blur' }],
  priority: [{ required: true, message: '请选择优先级', trigger: 'change' }],
  plan_start_date: [{ required: true, message: '请选择计划开始日期', trigger: 'change' }],
  plan_end_date: [{ required: true, message: '请选择计划完成日期', trigger: 'change' }]
}

const orderFormRef = ref()

// 方法
const getProgressColor = (progress: number) => {
  if (progress >= 0.9) return '#67c23a'
  if (progress >= 0.7) return '#e6a23c'
  return '#f56c6c'
}

const getPriorityTag = (priority: string) => {
  const map: any = {
    urgent: 'danger',
    high: 'warning',
    normal: '',
    low: 'info'
  }
  return map[priority] || ''
}

const getPriorityName = (priority: string) => {
  const map: any = {
    urgent: '紧急',
    high: '高',
    normal: '普通',
    low: '低'
  }
  return map[priority] || priority
}

const getStatusTag = (status: string) => {
  const map: any = {
    planned: 'info',
    assigned: 'warning',
    running: 'primary',
    completed: 'success',
    paused: 'danger'
  }
  return map[status] || ''
}

const getStatusName = (status: string) => {
  const map: any = {
    planned: '计划中',
    assigned: '已派工',
    running: '进行中',
    completed: '已完成',
    paused: '已暂停'
  }
  return map[status] || status
}

const getDeadlineClass = (deadline: string, status: string) => {
  if (status === 'completed') return ''
  const today = new Date()
  const deadlineDate = new Date(deadline)
  const diffDays = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  
  if (diffDays < 0) return 'deadline-overdue'
  if (diffDays <= 1) return 'deadline-urgent'
  return ''
}

const getOrderStep = (status: string) => {
  const map: any = {
    planned: 0,
    assigned: 1,
    running: 2,
    completed: 4,
    paused: 2
  }
  return map[status] || 0
}

const getQualityClass = (rate: number) => {
  if (rate >= 0.98) return 'quality-excellent'
  if (rate >= 0.95) return 'quality-good'
  if (rate >= 0.90) return 'quality-fair'
  return 'quality-poor'
}

const handleTabChange = (tabName: string) => {
  if (tabName === 'completion') {
    nextTick(() => {
      initCompletionCharts()
    })
  }
}

const handleSearch = () => {
  loadOrdersList()
}

const handleReset = () => {
  searchText.value = ''
  selectedStatus.value = ''
  selectedLine.value = ''
  selectedPriority.value = ''
  dateRange.value = []
  loadOrdersList()
}

const handleCreateOrder = () => {
  createDialogVisible.value = true
}

const handleBatchAssign = () => {
  ElMessageBox.confirm('确定要批量派工选中的工单吗？', '确认', {
    type: 'warning'
  }).then(() => {
    ElMessage.success('批量派工成功')
    selectedItems.value = []
    loadOrdersList()
  })
}

const handleExport = () => {
  ElMessage.success('导出功能开发中...')
}

const handleSelectionChange = (items: any[]) => {
  selectedItems.value = items
}

const handleViewDetail = (row: any) => {
  currentOrder.value = row
  detailDialogVisible.value = true
}

const handleAssignOrder = (row: any) => {
  ElMessage.info('派工功能开发中...')
}

const handleStartOrder = (row: any) => {
  ElMessageBox.confirm('确定要开始生产这个工单吗？', '确认', {
    type: 'warning'
  }).then(() => {
    ElMessage.success('工单已开工')
    loadOrdersList()
  })
}

const handleReportProgress = (row: any) => {
  ElMessage.info('报工功能开发中...')
}

const handleMoreAction = (command: string, row: any) => {
  switch (command) {
    case 'complete':
      ElMessageBox.confirm('确定要完工这个工单吗？', '确认', {
        type: 'warning'
      }).then(() => {
        ElMessage.success('工单已完工')
        loadOrdersList()
      })
      break
    case 'pause':
      ElMessageBox.confirm('确定要暂停这个工单吗？', '确认', {
        type: 'warning'
      }).then(() => {
        ElMessage.success('工单已暂停')
        loadOrdersList()
      })
      break
    case 'resume':
      ElMessageBox.confirm('确定要恢复这个工单吗？', '确认', {
        type: 'warning'
      }).then(() => {
        ElMessage.success('工单已恢复')
        loadOrdersList()
      })
      break
    case 'cancel':
      ElMessageBox.confirm('确定要取消这个工单吗？', '确认', {
        type: 'warning'
      }).then(() => {
        ElMessage.success('工单已取消')
        loadOrdersList()
      })
      break
  }
}

const handleQuickAssign = (order: any, line: any) => {
  ElMessage.success(`工单 ${order.order_no} 已派工到 ${line.name}`)
  // 刷新派工看板
}

const handleCreateSubmit = () => {
  orderFormRef.value?.validate((valid: boolean) => {
    if (valid) {
      submitting.value = true
      setTimeout(() => {
        submitting.value = false
        createDialogVisible.value = false
        ElMessage.success('创建成功')
        loadOrdersList()
        resetCreateForm()
      }, 1000)
    }
  })
}

const resetCreateForm = () => {
  Object.assign(newOrder, {
    product_id: '',
    plan_qty: 100,
    priority: 'normal',
    plan_start_date: '',
    plan_end_date: '',
    remark: ''
  })
}

const loadOrdersList = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    total.value = ordersList.value.length
  }, 500)
}

const handleSizeChange = (size: number) => {
  pageSize.value = size
  loadOrdersList()
}

const handleCurrentChange = (page: number) => {
  currentPage.value = page
  loadOrdersList()
}

// 初始化完工图表
const initCompletionCharts = () => {
  initCompletionTrendChart()
  initLineComparisonChart()
}

const initCompletionTrendChart = () => {
  const chartInstance = echarts.init(completionTrendChart.value)
  
  const option = {
    title: {
      text: '本月完工趋势',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['计划完工', '实际完工']
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
        name: '计划完工',
        type: 'line',
        data: [10, 12, 15, 18, 20, 22, 25],
        itemStyle: { color: '#409eff' }
      },
      {
        name: '实际完工',
        type: 'line',
        data: [8, 11, 14, 16, 19, 21, 23],
        itemStyle: { color: '#67c23a' }
      }
    ]
  }
  
  chartInstance.setOption(option)
}

const initLineComparisonChart = () => {
  const chartInstance = echarts.init(lineComparisonChart.value)
  
  const option = {
    title: {
      text: '产线完工对比',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['本月完工', '上月完工']
    },
    xAxis: {
      type: 'category',
      data: ['生产线1', '生产线2', '生产线3']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '本月完工',
        type: 'bar',
        data: [45, 38, 42],
        itemStyle: { color: '#67c23a' }
      },
      {
        name: '上月完工',
        type: 'bar',
        data: [42, 35, 38],
        itemStyle: { color: '#e6a23c' }
      }
    ]
  }
  
  chartInstance.setOption(option)
}

// 生命周期
onMounted(() => {
  loadOrdersList()
})
</script>

<style scoped lang="scss">
.production-orders-page {
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

      &.total {
        .stat-icon {
          background: linear-gradient(135deg, #409eff, #66b1ff);
        }
        .stat-number {
          color: #409eff;
        }
      }

      &.running {
        .stat-icon {
          background: linear-gradient(135deg, #67c23a, #85ce61);
        }
        .stat-number {
          color: #67c23a;
        }
      }

      &.completed {
        .stat-icon {
          background: linear-gradient(135deg, #e6a23c, #ebb563);
        }
        .stat-number {
          color: #e6a23c;
        }
      }

      &.efficiency {
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

    .orders-table {
      .pagination {
        margin-top: 20px;
        display: flex;
        justify-content: center;
      }
    }

    .assignment-board {
      .line-card {
        background: var(--el-bg-color-soft);
        border-radius: 8px;
        padding: 20px;
        height: 400px;

        .line-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;

          h3 {
            margin: 0;
            color: var(--el-text-color-primary);
          }
        }

        .line-content {
          .current-order {
            margin-bottom: 20px;
            padding: 15px;
            background: white;
            border-radius: 6px;

            h4 {
              margin: 0 0 10px 0;
              color: var(--el-text-color-primary);
            }

            p {
              margin: 5px 0;
              font-size: 14px;
              color: var(--el-text-color-regular);
            }
          }

          .pending-orders {
            h4 {
              margin: 0 0 15px 0;
              color: var(--el-text-color-primary);
            }

            .no-orders {
              text-align: center;
              color: var(--el-text-color-placeholder);
              padding: 20px;
            }

            .order-item {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 10px;
              background: white;
              border-radius: 4px;
              margin-bottom: 8px;

              .order-info {
                flex: 1;

                .order-no {
                  font-weight: bold;
                  color: var(--el-text-color-primary);
                  margin-right: 10px;
                }

                .product-name {
                  font-size: 12px;
                  color: var(--el-text-color-regular);
                }
              }
            }
          }
        }
      }
    }

    .completion-stats {
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

    .completion-records {
      h3 {
        margin-bottom: 15px;
        color: var(--el-text-color-primary);
      }
    }
  }

  .order-detail {
    .el-steps {
      margin: 20px 0;
    }

    h4 {
      margin: 20px 0 15px 0;
      color: var(--el-text-color-primary);
    }
  }

  :deep(.deadline-overdue) {
    color: #f56c6c;
    font-weight: bold;
  }

  :deep(.deadline-urgent) {
    color: #e6a23c;
    font-weight: bold;
  }

  :deep(.quality-excellent) {
    color: #67c23a;
    font-weight: bold;
  }

  :deep(.quality-good) {
    color: #409eff;
    font-weight: bold;
  }

  :deep(.quality-fair) {
    color: #e6a23c;
    font-weight: bold;
  }

  :deep(.quality-poor) {
    color: #f56c6c;
    font-weight: bold;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .production-orders-page {
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

    .assignment-board {
      :deep(.el-col) {
        margin-bottom: 20px;
      }

      .line-card {
        height: auto;
      }
    }

    .completion-stats {
      :deep(.el-col) {
        margin-bottom: 15px;
      }
    }
  }
}
</style> 