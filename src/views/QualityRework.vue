<template>
  <div class="quality-rework-page">
    <!-- 顶部统计 -->
    <div class="stats-overview">
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="stat-card pending">
            <div class="stat-icon">
              <el-icon><Tools /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ reworkStats.pending }}</div>
              <div class="stat-label">待返修</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card processing">
            <div class="stat-icon">
              <el-icon><Setting /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ reworkStats.processing }}</div>
              <div class="stat-label">返修中</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card completed">
            <div class="stat-icon">
              <el-icon><CircleCheck /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ reworkStats.completed }}</div>
              <div class="stat-label">已完成</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card rate">
            <div class="stat-icon">
              <el-icon><TrendCharts /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ reworkStats.rate }}%</div>
              <div class="stat-label">返修成功率</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 功能选项卡 -->
    <div class="function-tabs">
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="返修管理" name="rework">
          <!-- 返修列表操作栏 -->
          <div class="action-bar">
            <div class="filters">
              <el-input
                v-model="searchText"
                placeholder="搜索返修单号/产品名称"
                style="width: 200px"
                :prefix-icon="Search"
                clearable
              />
              <el-select v-model="selectedStatus" placeholder="返修状态" clearable style="width: 120px">
                <el-option label="待返修" value="pending" />
                <el-option label="返修中" value="processing" />
                <el-option label="已完成" value="completed" />
                <el-option label="返修失败" value="failed" />
              </el-select>
              <el-select v-model="selectedType" placeholder="不良类型" clearable style="width: 150px">
                <el-option label="外观缺陷" value="appearance" />
                <el-option label="功能异常" value="function" />
                <el-option label="尺寸偏差" value="dimension" />
                <el-option label="其他" value="other" />
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
              <el-button @click="handleCreateRework" type="primary" :icon="Plus">新建返修单</el-button>
              <el-button @click="handleBatchAssign" type="success" :icon="User" :disabled="!selectedItems.length">
                批量分配
              </el-button>
              <el-button @click="handleExport" :icon="Download">导出</el-button>
            </div>
          </div>

          <!-- 返修列表 -->
          <div class="rework-table">
            <el-table
              :data="reworkList"
              v-loading="loading"
              @selection-change="handleSelectionChange"
              row-key="id"
              stripe
              border
              height="500"
            >
              <el-table-column type="selection" width="55" />
              <el-table-column prop="rework_no" label="返修单号" width="150" fixed="left" />
              <el-table-column prop="product_name" label="产品名称" width="200" />
              <el-table-column prop="batch_no" label="批次号" width="130" />
              <el-table-column prop="defect_qty" label="不良数量" width="100" align="center" />
              <el-table-column prop="defect_type" label="不良类型" width="120">
                <template #default="scope">
                  <el-tag :type="getDefectTypeTag(scope.row.defect_type)">
                    {{ getDefectTypeName(scope.row.defect_type) }}
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
              <el-table-column prop="assignee_name" label="负责人" width="100" />
              <el-table-column prop="created_date" label="创建日期" width="120" />
              <el-table-column prop="deadline" label="完成期限" width="120">
                <template #default="scope">
                  <span :class="getDeadlineClass(scope.row.deadline, scope.row.status)">
                    {{ scope.row.deadline }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="200" fixed="right">
                <template #default="scope">
                  <el-button
                    v-if="scope.row.status === 'pending'"
                    @click="handleStartRework(scope.row)"
                    type="primary"
                    size="small"
                    :icon="VideoPlay"
                  >
                    开始返修
                  </el-button>
                  <el-button
                    @click="handleViewDetail(scope.row)"
                    size="small"
                    :icon="View"
                  >
                    查看详情
                  </el-button>
                  <el-dropdown @command="(cmd: string) => handleMoreAction(cmd, scope.row)">
                    <el-button size="small" :icon="More" />
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item command="trace">追溯分析</el-dropdown-item>
                        <el-dropdown-item command="assign">重新分配</el-dropdown-item>
                        <el-dropdown-item command="print">打印标签</el-dropdown-item>
                        <el-dropdown-item command="delete" divided>删除</el-dropdown-item>
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

        <el-tab-pane label="追溯分析" name="trace">
          <!-- 追溯查询 -->
          <div class="trace-search">
            <el-row :gutter="20">
              <el-col :span="6">
                <el-input
                  v-model="traceQuery.keyword"
                  placeholder="产品序列号/批次号"
                  :prefix-icon="Search"
                />
              </el-col>
              <el-col :span="4">
                <el-button @click="handleTrace" type="primary" style="width: 100%">
                  开始追溯
                </el-button>
              </el-col>
            </el-row>
          </div>

          <!-- 追溯结果 -->
          <div v-if="traceResult" class="trace-result">
            <h3>追溯结果</h3>
            <div class="trace-timeline">
              <el-timeline>
                <el-timeline-item
                  v-for="(item, index) in traceResult.timeline"
                  :key="index"
                  :timestamp="item.timestamp"
                  :type="item.type"
                >
                  <el-card>
                    <h4>{{ item.title }}</h4>
                    <p>{{ item.description }}</p>
                    <div v-if="item.details" class="trace-details">
                      <el-descriptions :column="2" size="small">
                        <el-descriptions-item
                          v-for="(detail, key) in item.details"
                          :key="key"
                          :label="key"
                        >
                          {{ detail }}
                        </el-descriptions-item>
                      </el-descriptions>
                    </div>
                  </el-card>
                </el-timeline-item>
              </el-timeline>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="根因分析" name="analysis">
          <!-- 分析工具 -->
          <div class="analysis-tools">
            <el-row :gutter="20">
              <el-col :span="12">
                <div class="chart-card">
                  <h3>不良类型分布</h3>
                  <div ref="defectTypeChart" class="chart-container"></div>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="chart-card">
                  <h3>不良原因Pareto图</h3>
                  <div ref="paretoChart" class="chart-container"></div>
                </div>
              </el-col>
            </el-row>
            <el-row :gutter="20" style="margin-top: 20px">
              <el-col :span="24">
                <div class="chart-card">
                  <h3>不良趋势分析</h3>
                  <div ref="trendChart" class="chart-container"></div>
                </div>
              </el-col>
            </el-row>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 返修详情弹窗 -->
    <el-dialog
      v-model="detailDialogVisible"
      :title="'返修详情 - ' + currentRework?.rework_no"
      width="80%"
      top="5vh"
    >
      <div v-if="currentRework" class="rework-detail">
        <!-- 基本信息 -->
        <el-descriptions :column="3" border>
          <el-descriptions-item label="返修单号">{{ currentRework.rework_no }}</el-descriptions-item>
          <el-descriptions-item label="产品名称">{{ currentRework.product_name }}</el-descriptions-item>
          <el-descriptions-item label="批次号">{{ currentRework.batch_no }}</el-descriptions-item>
          <el-descriptions-item label="不良数量">{{ currentRework.defect_qty }}</el-descriptions-item>
          <el-descriptions-item label="不良类型">{{ getDefectTypeName(currentRework.defect_type) }}</el-descriptions-item>
          <el-descriptions-item label="负责人">{{ currentRework.assignee_name }}</el-descriptions-item>
        </el-descriptions>

        <!-- 返修进度 -->
        <div style="margin-top: 20px">
          <h4>返修进度</h4>
          <el-steps :active="getReworkStep(currentRework.status)" align-center>
            <el-step title="创建返修单" description="记录不良信息" />
            <el-step title="分配负责人" description="指派返修人员" />
            <el-step title="开始返修" description="执行返修作业" />
            <el-step title="质检验证" description="返修质量确认" />
            <el-step title="完成归档" description="记录归档" />
          </el-steps>
        </div>

        <!-- 返修记录 -->
        <div style="margin-top: 20px">
          <h4>返修记录</h4>
          <el-table :data="reworkRecords" border size="small">
            <el-table-column prop="step" label="返修步骤" width="120" />
            <el-table-column prop="operator" label="操作人员" width="100" />
            <el-table-column prop="operation" label="操作内容" />
            <el-table-column prop="result" label="操作结果" width="100" />
            <el-table-column prop="time" label="操作时间" width="150" />
          </el-table>
        </div>
      </div>
    </el-dialog>

    <!-- 新建返修单弹窗 -->
    <el-dialog v-model="createDialogVisible" title="新建返修单" width="600px">
      <el-form :model="newRework" :rules="reworkRules" ref="reworkFormRef" label-width="100px">
        <el-form-item label="产品" prop="product_id">
          <el-select v-model="newRework.product_id" placeholder="选择产品" filterable>
            <el-option
              v-for="product in productList"
              :key="product.id"
              :label="product.name"
              :value="product.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="批次号" prop="batch_no">
          <el-input v-model="newRework.batch_no" placeholder="输入批次号" />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="不良数量" prop="defect_qty">
              <el-input-number v-model="newRework.defect_qty" :min="1" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="不良类型" prop="defect_type">
              <el-select v-model="newRework.defect_type" placeholder="选择类型">
                <el-option label="外观缺陷" value="appearance" />
                <el-option label="功能异常" value="function" />
                <el-option label="尺寸偏差" value="dimension" />
                <el-option label="其他" value="other" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="负责人" prop="assignee_id">
          <el-select v-model="newRework.assignee_id" placeholder="选择负责人">
            <el-option
              v-for="user in userList"
              :key="user.id"
              :label="user.name"
              :value="user.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="完成期限" prop="deadline">
          <el-date-picker
            v-model="newRework.deadline"
            type="date"
            placeholder="选择日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="问题描述" prop="description">
          <el-input
            v-model="newRework.description"
            type="textarea"
            :rows="3"
            placeholder="详细描述不良问题..."
          />
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
import { ref, reactive, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as echarts from 'echarts'
import {
  Tools, Setting, CircleCheck, TrendCharts, Search, Refresh, Plus, User, Download,
  VideoPlay, View, More
} from '@element-plus/icons-vue'

// 响应式数据
const loading = ref(false)
const activeTab = ref('rework')
const searchText = ref('')
const selectedStatus = ref('')
const selectedType = ref('')
const dateRange = ref<string[]>([])
const selectedItems = ref<any[]>([])
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)

const detailDialogVisible = ref(false)
const createDialogVisible = ref(false)
const submitting = ref(false)
const currentRework = ref<any>(null)

// 图表DOM引用
const defectTypeChart = ref()
const paretoChart = ref()
const trendChart = ref()

// 图表实例引用
let defectTypeChartInstance: any = null
let paretoChartInstance: any = null
let trendChartInstance: any = null

// 统计数据
const reworkStats = reactive({
  pending: 15,
  processing: 8,
  completed: 42,
  rate: 85.7
})

// 追溯查询
const traceQuery = reactive({
  keyword: ''
})

// 追溯结果
const traceResult = ref<any>(null)

// 产品列表
const productList = ref([
  { id: 'P001', name: '拓浦智能IH电饭煲3L' },
  { id: 'P002', name: '拓浦智能压力锅4L' },
  { id: 'P003', name: '拓浦破壁机1.5L' }
])

// 用户列表
const userList = ref([
  { id: 'U001', name: '张返修' },
  { id: 'U002', name: '李维修' },
  { id: 'U003', name: '王技工' }
])

// 返修列表
const reworkList = ref([
  {
    id: 'RW001',
    rework_no: 'RW20240115001',
    product_name: '拓浦智能IH电饭煲3L',
    batch_no: 'B20240115001',
    defect_qty: 5,
    defect_type: 'appearance',
    status: 'completed',
    assignee_name: '张返修',
    created_date: '2024-01-15',
    deadline: '2024-01-18'
  },
  {
    id: 'RW002',
    rework_no: 'RW20240115002',
    product_name: '拓浦智能压力锅4L',
    batch_no: 'B20240115002',
    defect_qty: 3,
    defect_type: 'function',
    status: 'processing',
    assignee_name: '李维修',
    created_date: '2024-01-15',
    deadline: '2024-01-17'
  },
  {
    id: 'RW003',
    rework_no: 'RW20240116001',
    product_name: '拓浦破壁机1.5L',
    batch_no: 'B20240116001',
    defect_qty: 8,
    defect_type: 'dimension',
    status: 'pending',
    assignee_name: '王技工',
    created_date: '2024-01-16',
    deadline: '2024-01-19'
  }
])

// 返修记录
const reworkRecords = ref([
  {
    step: '不良确认',
    operator: '张检验',
    operation: '确认外观划痕缺陷',
    result: '确认',
    time: '2024-01-15 09:00:00'
  },
  {
    step: '返修作业',
    operator: '张返修',
    operation: '重新抛光表面',
    result: '完成',
    time: '2024-01-15 10:30:00'
  },
  {
    step: '质检验证',
    operator: '李质检',
    operation: '外观质量复检',
    result: '合格',
    time: '2024-01-15 11:00:00'
  }
])

// 新建返修表单
const newRework = reactive({
  product_id: '',
  batch_no: '',
  defect_qty: 1,
  defect_type: '',
  assignee_id: '',
  deadline: '',
  description: ''
})

// 表单验证规则
const reworkRules = {
  product_id: [{ required: true, message: '请选择产品', trigger: 'change' }],
  batch_no: [{ required: true, message: '请输入批次号', trigger: 'blur' }],
  defect_qty: [{ required: true, message: '请输入不良数量', trigger: 'blur' }],
  defect_type: [{ required: true, message: '请选择不良类型', trigger: 'change' }],
  assignee_id: [{ required: true, message: '请选择负责人', trigger: 'change' }],
  deadline: [{ required: true, message: '请选择完成期限', trigger: 'change' }],
  description: [{ required: true, message: '请填写问题描述', trigger: 'blur' }]
}

const reworkFormRef = ref()

// 方法
const getDefectTypeTag = (type: string) => {
  const map: any = {
    appearance: 'warning',
    function: 'danger',
    dimension: 'info',
    other: ''
  }
  return map[type] || ''
}

const getDefectTypeName = (type: string) => {
  const map: any = {
    appearance: '外观缺陷',
    function: '功能异常',
    dimension: '尺寸偏差',
    other: '其他'
  }
  return map[type] || type
}

const getStatusTag = (status: string) => {
  const map: any = {
    pending: 'warning',
    processing: 'primary',
    completed: 'success',
    failed: 'danger'
  }
  return map[status] || ''
}

const getStatusName = (status: string) => {
  const map: any = {
    pending: '待返修',
    processing: '返修中',
    completed: '已完成',
    failed: '返修失败'
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

const getReworkStep = (status: string) => {
  const map: any = {
    pending: 1,
    processing: 2,
    completed: 4,
    failed: 2
  }
  return map[status] || 0
}

const handleTabChange = (tabName: string) => {
  if (tabName === 'analysis') {
    nextTick(() => {
      initAnalysisCharts()
    })
  }
}

const handleSearch = () => {
  if (activeTab.value === 'rework') {
    loadReworkList()
  }
}

const handleReset = () => {
  searchText.value = ''
  selectedStatus.value = ''
  selectedType.value = ''
  dateRange.value = []
  if (activeTab.value === 'rework') {
    loadReworkList()
  }
}

const handleCreateRework = () => {
  createDialogVisible.value = true
}

const handleBatchAssign = () => {
  ElMessageBox.confirm('确定要批量分配选中的返修单吗？', '确认', {
    type: 'warning'
  }).then(() => {
    ElMessage.success('批量分配成功')
    selectedItems.value = []
    loadReworkList()
  })
}

const handleExport = () => {
  ElMessage.success('导出功能开发中...')
}

const handleSelectionChange = (items: any[]) => {
  selectedItems.value = items
}

const handleStartRework = (row: any) => {
  ElMessageBox.confirm('确定要开始返修这个产品吗？', '确认', {
    type: 'warning'
  }).then(() => {
    ElMessage.success('返修已开始')
    loadReworkList()
  })
}

const handleViewDetail = (row: any) => {
  currentRework.value = row
  detailDialogVisible.value = true
}

const handleMoreAction = (command: string, row: any) => {
  switch (command) {
    case 'trace':
      traceQuery.keyword = row.batch_no
      activeTab.value = 'trace'
      handleTrace()
      break
    case 'assign':
      ElMessage.info('重新分配功能开发中...')
      break
    case 'print':
      ElMessage.success('打印标签功能开发中...')
      break
    case 'delete':
      ElMessageBox.confirm('确定要删除这个返修单吗？', '确认', {
        type: 'warning'
      }).then(() => {
        ElMessage.success('删除成功')
        loadReworkList()
      })
      break
  }
}

const handleTrace = () => {
  if (!traceQuery.keyword) {
    ElMessage.warning('请输入要追溯的产品序列号或批次号')
    return
  }

  // 模拟追溯结果
  traceResult.value = {
    timeline: [
      {
        timestamp: '2024-01-10 08:00:00',
        type: 'primary',
        title: '原材料入库',
        description: '原材料检验合格，批次号：M20240110001',
        details: {
          '供应商': '上海钢材有限公司',
          '检验员': '张三',
          '合格证号': 'QC20240110001'
        }
      },
      {
        timestamp: '2024-01-12 10:30:00',
        type: 'success',
        title: '生产投产',
        description: '开始生产，工单号：WO20240112001',
        details: {
          '生产线': '生产线1',
          '操作员': '李四',
          '班次': '白班'
        }
      },
      {
        timestamp: '2024-01-14 14:20:00',
        type: 'warning',
        title: '质检发现问题',
        description: '发现外观缺陷，需要返修',
        details: {
          '检验员': '王五',
          '不良类型': '外观划痕',
          '不良数量': '5件'
        }
      },
      {
        timestamp: '2024-01-15 09:00:00',
        type: 'info',
        title: '返修开始',
        description: '分配返修任务，开始返修作业',
        details: {
          '返修员': '张返修',
          '返修方案': '重新抛光',
          '预计完成': '2024-01-15 17:00:00'
        }
      }
    ]
  }
}

const handleCreateSubmit = () => {
  reworkFormRef.value?.validate((valid: boolean) => {
    if (valid) {
      submitting.value = true
      setTimeout(() => {
        submitting.value = false
        createDialogVisible.value = false
        ElMessage.success('创建成功')
        loadReworkList()
        resetCreateForm()
      }, 1000)
    }
  })
}

const resetCreateForm = () => {
  Object.assign(newRework, {
    product_id: '',
    batch_no: '',
    defect_qty: 1,
    defect_type: '',
    assignee_id: '',
    deadline: '',
    description: ''
  })
}

const loadReworkList = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    total.value = reworkList.value.length
  }, 500)
}

const handleSizeChange = (size: number) => {
  pageSize.value = size
  loadReworkList()
}

const handleCurrentChange = (page: number) => {
  currentPage.value = page
  loadReworkList()
}

// 初始化分析图表
const initAnalysisCharts = () => {
  initDefectTypeChart()
  initParetoChart()
  initTrendChart()
}

const initDefectTypeChart = () => {
  if (defectTypeChartInstance) {
    defectTypeChartInstance.dispose()
  }
  defectTypeChartInstance = echarts.init(defectTypeChart.value)
  
  const option = {
    title: {
      text: '不良类型分布',
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
        name: '不良类型',
        type: 'pie',
        radius: '50%',
        data: [
          { value: 35, name: '外观缺陷' },
          { value: 25, name: '功能异常' },
          { value: 20, name: '尺寸偏差' },
          { value: 20, name: '其他' }
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
  
  defectTypeChartInstance.setOption(option)
}

const initParetoChart = () => {
  if (paretoChartInstance) {
    paretoChartInstance.dispose()
  }
  paretoChartInstance = echarts.init(paretoChart.value)
  
  const option = {
    title: {
      text: '不良原因Pareto图',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['数量', '累计比例']
    },
    xAxis: {
      type: 'category',
      data: ['操作不当', '设备故障', '材料缺陷', '环境因素', '设计问题']
    },
    yAxis: [
      {
        type: 'value',
        name: '数量'
      },
      {
        type: 'value',
        name: '比例(%)',
        max: 100
      }
    ],
    series: [
      {
        name: '数量',
        type: 'bar',
        data: [30, 25, 20, 15, 10],
        itemStyle: {
          color: '#5470c6'
        }
      },
      {
        name: '累计比例',
        type: 'line',
        yAxisIndex: 1,
        data: [30, 55, 75, 90, 100],
        itemStyle: {
          color: '#91cc75'
        }
      }
    ]
  }
  
  paretoChartInstance.setOption(option)
}

const initTrendChart = () => {
  if (trendChartInstance) {
    trendChartInstance.dispose()
  }
  trendChartInstance = echarts.init(trendChart.value)
  
  const option = {
    title: {
      text: '不良趋势分析',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['不良数量', '返修成功率']
    },
    xAxis: {
      type: 'category',
      data: ['1/10', '1/11', '1/12', '1/13', '1/14', '1/15', '1/16']
    },
    yAxis: [
      {
        type: 'value',
        name: '数量'
      },
      {
        type: 'value',
        name: '成功率(%)',
        max: 100
      }
    ],
    series: [
      {
        name: '不良数量',
        type: 'bar',
        data: [15, 18, 12, 20, 16, 14, 10],
        itemStyle: {
          color: '#ee6666'
        }
      },
      {
        name: '返修成功率',
        type: 'line',
        yAxisIndex: 1,
        data: [85, 88, 92, 80, 87, 90, 95],
        itemStyle: {
          color: '#73c0de'
        }
      }
    ]
  }
  
  trendChartInstance.setOption(option)
}

// 生命周期
onMounted(() => {
  loadReworkList()
})

onBeforeUnmount(() => {
  // 清理图表实例，防止内存泄漏
  if (defectTypeChartInstance) {
    defectTypeChartInstance.dispose()
    defectTypeChartInstance = null
  }
  if (paretoChartInstance) {
    paretoChartInstance.dispose()
    paretoChartInstance = null
  }
  if (trendChartInstance) {
    trendChartInstance.dispose()
    trendChartInstance = null
  }
})
</script>

<style scoped lang="scss">
.quality-rework-page {
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

      &.pending {
        .stat-icon {
          background: linear-gradient(135deg, #f39c12, #e67e22);
        }
        .stat-number {
          color: #f39c12;
        }
      }

      &.processing {
        .stat-icon {
          background: linear-gradient(135deg, #3498db, #2980b9);
        }
        .stat-number {
          color: #3498db;
        }
      }

      &.completed {
        .stat-icon {
          background: linear-gradient(135deg, #27ae60, #2ecc71);
        }
        .stat-number {
          color: #27ae60;
        }
      }

      &.rate {
        .stat-icon {
          background: linear-gradient(135deg, #9b59b6, #8e44ad);
        }
        .stat-number {
          color: #9b59b6;
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

    .rework-table {
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
      h3 {
        margin-bottom: 20px;
        color: var(--el-text-color-primary);
      }

      .trace-timeline {
        .trace-details {
          margin-top: 10px;
          padding: 10px;
          background: var(--el-bg-color-soft);
          border-radius: 4px;
        }
      }
    }

    .analysis-tools {
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

  .rework-detail {
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
}

// 响应式设计
@media (max-width: 768px) {
  .quality-rework-page {
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

    .analysis-tools {
      :deep(.el-col) {
        margin-bottom: 15px;
      }
    }
  }
}
</style> 