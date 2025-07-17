<template>
  <div class="quality-inspect-page">
    <!-- 顶部统计卡片 -->
    <div class="stats-overview">
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="stat-card pending">
            <div class="stat-icon">
              <el-icon><Clock /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ inspectStats.pending }}</div>
              <div class="stat-label">待检验</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card passed">
            <div class="stat-icon">
              <el-icon><CircleCheck /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ inspectStats.passed }}</div>
              <div class="stat-label">已通过</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card rejected">
            <div class="stat-icon">
              <el-icon><CircleClose /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ inspectStats.rejected }}</div>
              <div class="stat-label">已拒收</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card rate">
            <div class="stat-icon">
              <el-icon><TrendCharts /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ inspectStats.passRate }}%</div>
              <div class="stat-label">合格率</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 操作栏 -->
    <div class="action-bar">
      <div class="filters">
        <el-input
          v-model="searchText"
          placeholder="搜索批次号/产品名称"
          style="width: 200px"
          :prefix-icon="Search"
          clearable
        />
        <el-select v-model="selectedProduct" placeholder="选择产品" clearable style="width: 180px">
          <el-option
            v-for="product in productList"
            :key="product.id"
            :label="product.name"
            :value="product.id"
          />
        </el-select>
        <el-select v-model="selectedStatus" placeholder="检验状态" clearable style="width: 120px">
          <el-option label="待检验" value="pending" />
          <el-option label="检验中" value="inspecting" />
          <el-option label="已通过" value="passed" />
          <el-option label="已拒收" value="rejected" />
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
        <el-button @click="handleCreateInspect" type="primary" :icon="Plus">新建检验</el-button>
        <el-button @click="handleBatchProcess" type="success" :icon="Check" :disabled="!selectedItems.length">
          批量处理
        </el-button>
        <el-button @click="handleExport" :icon="Download">导出</el-button>
      </div>
    </div>

    <!-- 检验列表 -->
    <div class="inspect-table">
      <el-table
        :data="inspectList"
        v-loading="loading"
        @selection-change="handleSelectionChange"
        row-key="id"
        stripe
        border
                  max-height="600px"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="batch_no" label="批次号" width="150" fixed="left" />
        <el-table-column prop="product_name" label="产品名称" width="200" />
        <el-table-column prop="lot_qty" label="批量" width="100" align="center" />
        <el-table-column prop="sample_size" label="抽样数" width="100" align="center" />
        <el-table-column prop="aql_level" label="AQL水平" width="100" align="center" />
        <el-table-column prop="accept_qty" label="合格判定数" width="110" align="center" />
        <el-table-column prop="reject_qty" label="不合格判定数" width="130" align="center" />
        <el-table-column prop="defect_qty" label="实际不良数" width="120" align="center">
          <template #default="scope">
            <span :class="getDefectClass(scope.row.defect_qty, scope.row.reject_qty)">
              {{ scope.row.defect_qty }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusTag(scope.row.status)">
              {{ getStatusName(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="inspector_name" label="检验员" width="100" />
        <el-table-column prop="inspect_date" label="检验日期" width="120" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button
              v-if="scope.row.status === 'pending'"
              @click="handleStartInspect(scope.row)"
              type="primary"
              size="small"
              :icon="VideoPlay"
            >
              开始检验
            </el-button>
            <el-button
              v-if="scope.row.status === 'inspecting'"
              @click="handleContinueInspect(scope.row)"
              type="warning"
              size="small"
              :icon="Edit"
            >
              继续检验
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
                  <el-dropdown-item command="print">打印报告</el-dropdown-item>
                  <el-dropdown-item command="copy">复制检验</el-dropdown-item>
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

    <!-- 检验执行弹窗 -->
    <el-dialog
      v-model="inspectDialogVisible"
      :title="currentInspect ? 'AQL抽样检验 - ' + currentInspect.product_name : 'AQL抽样检验'"
      width="90%"
      top="5vh"
      @close="handleCloseInspectDialog"
    >
      <div v-if="currentInspect" class="inspect-dialog-content">
        <!-- 基本信息 -->
        <div class="inspect-info">
          <el-descriptions :column="4" border>
            <el-descriptions-item label="批次号">{{ currentInspect.batch_no }}</el-descriptions-item>
            <el-descriptions-item label="产品名称">{{ currentInspect.product_name }}</el-descriptions-item>
            <el-descriptions-item label="批量">{{ currentInspect.lot_qty }}</el-descriptions-item>
            <el-descriptions-item label="AQL水平">{{ currentInspect.aql_level }}</el-descriptions-item>
            <el-descriptions-item label="抽样数">{{ currentInspect.sample_size }}</el-descriptions-item>
            <el-descriptions-item label="合格判定数">{{ currentInspect.accept_qty }}</el-descriptions-item>
            <el-descriptions-item label="不合格判定数">{{ currentInspect.reject_qty }}</el-descriptions-item>
            <el-descriptions-item label="检验标准">{{ currentInspect.standard || 'GB/T 2828.1-2012' }}</el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 检验项目 -->
        <div class="inspect-items" style="margin-top: 20px;">
          <h3>检验项目</h3>
          <el-table :data="inspectItems" border>
            <el-table-column prop="item_name" label="检验项目" width="200" />
            <el-table-column prop="standard" label="技术要求" width="200" />
            <el-table-column prop="method" label="检验方法" width="150" />
            <el-table-column label="检验结果" width="120">
              <template #default="scope">
                <el-select v-model="scope.row.result" placeholder="选择">
                  <el-option label="合格" value="pass" />
                  <el-option label="不合格" value="fail" />
                  <el-option label="免检" value="exempt" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="不良数量" width="120">
              <template #default="scope">
                <el-input-number
                  v-model="scope.row.defect_count"
                  :min="0"
                  :max="currentInspect.sample_size"
                  :disabled="scope.row.result !== 'fail'"
                  size="small"
                />
              </template>
            </el-table-column>
            <el-table-column label="不良类型" width="150">
              <template #default="scope">
                <el-select
                  v-model="scope.row.defect_type"
                  placeholder="选择类型"
                  :disabled="scope.row.result !== 'fail'"
                  size="small"
                >
                  <el-option label="外观缺陷" value="appearance" />
                  <el-option label="尺寸偏差" value="dimension" />
                  <el-option label="功能异常" value="function" />
                  <el-option label="其他" value="other" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="备注" min-width="200">
              <template #default="scope">
                <el-input v-model="scope.row.remark" placeholder="填写备注" size="small" />
              </template>
            </el-table-column>
            <el-table-column label="拍照" width="100">
              <template #default="scope">
                <el-button
                  @click="handleTakePhoto(scope.row)"
                  size="small"
                  :icon="Camera"
                  :disabled="scope.row.result !== 'fail'"
                >
                  拍照
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <!-- 检验结论 -->
          <div class="inspect-conclusion" style="margin-top: 20px;">
            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="总不良数">
                  <el-input v-model="inspectSummary.total_defects" readonly>
                    <template #append>
                      <span>/{{ currentInspect.sample_size }}</span>
                    </template>
                  </el-input>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="判定结果">
                  <el-select v-model="inspectSummary.conclusion" placeholder="选择结论">
                    <el-option label="接收" value="accept" />
                    <el-option label="拒收" value="reject" />
                    <el-option label="复检" value="recheck" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="处置建议">
                  <el-select v-model="inspectSummary.disposition" placeholder="选择处置">
                    <el-option label="正常入库" value="normal" />
                    <el-option label="让步接收" value="concession" />
                    <el-option label="返工返修" value="rework" />
                    <el-option label="报废处理" value="scrap" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="检验备注">
              <el-input
                v-model="inspectSummary.remark"
                type="textarea"
                :rows="3"
                placeholder="填写检验总结和建议..."
              />
            </el-form-item>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleSaveProgress">暂存</el-button>
          <el-button @click="inspectDialogVisible = false">取消</el-button>
          <el-button @click="handleCompleteInspect" type="primary" :disabled="!canComplete">
            完成检验
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 新建检验弹窗 -->
    <el-dialog v-model="createDialogVisible" title="新建检验计划" width="600px">
      <el-form :model="newInspect" :rules="inspectRules" ref="inspectFormRef" label-width="100px">
        <el-form-item label="批次号" prop="batch_no">
          <el-input v-model="newInspect.batch_no" placeholder="输入批次号" />
        </el-form-item>
        <el-form-item label="产品" prop="product_id">
          <el-select v-model="newInspect.product_id" placeholder="选择产品" filterable>
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
            <el-form-item label="批量" prop="lot_qty">
              <el-input-number v-model="newInspect.lot_qty" :min="1" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="AQL水平" prop="aql_level">
              <el-select v-model="newInspect.aql_level" placeholder="选择AQL">
                <el-option label="0.4" value="0.4" />
                <el-option label="0.65" value="0.65" />
                <el-option label="1.0" value="1.0" />
                <el-option label="1.5" value="1.5" />
                <el-option label="2.5" value="2.5" />
                <el-option label="4.0" value="4.0" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="检验员" prop="inspector_id">
          <el-select v-model="newInspect.inspector_id" placeholder="选择检验员">
            <el-option
              v-for="user in inspectorList"
              :key="user.id"
              :label="user.name"
              :value="user.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="newInspect.remark" type="textarea" :rows="3" placeholder="填写备注..." />
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
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Clock, CircleCheck, CircleClose, TrendCharts, Search, Refresh, Plus, Check, Download,
  VideoPlay, Edit, View, More, Camera
} from '@element-plus/icons-vue'

// 响应式数据
const loading = ref(false)
const searchText = ref('')
const selectedProduct = ref('')
const selectedStatus = ref('')
const dateRange = ref<string[]>([])
const selectedItems = ref<any[]>([])
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)

const inspectDialogVisible = ref(false)
const createDialogVisible = ref(false)
const submitting = ref(false)
const currentInspect = ref<any>(null)

// 统计数据
const inspectStats = reactive({
  pending: 12,
  passed: 85,
  rejected: 8,
  passRate: 91.4
})

// 产品列表
const productList = ref([
  { id: 'P001', name: '拓浦智能IH电饭煲3L' },
  { id: 'P002', name: '拓浦智能压力锅4L' },
  { id: 'P003', name: '拓浦破壁机1.5L' }
])

// 检验员列表
const inspectorList = ref([
  { id: 'I001', name: '张检验' },
  { id: 'I002', name: '李质检' },
  { id: 'I003', name: '王品控' }
])

// 检验列表
const inspectList = ref([
  {
    id: 'INS001',
    batch_no: 'B20240115001',
    product_name: '拓浦智能IH电饭煲3L',
    lot_qty: 1000,
    sample_size: 80,
    aql_level: '1.5',
    accept_qty: 3,
    reject_qty: 4,
    defect_qty: 2,
    status: 'passed',
    inspector_name: '张检验',
    inspect_date: '2024-01-15'
  },
  {
    id: 'INS002',
    batch_no: 'B20240115002',
    product_name: '拓浦智能压力锅4L',
    lot_qty: 500,
    sample_size: 50,
    aql_level: '2.5',
    accept_qty: 5,
    reject_qty: 6,
    defect_qty: 8,
    status: 'rejected',
    inspector_name: '李质检',
    inspect_date: '2024-01-15'
  },
  {
    id: 'INS003',
    batch_no: 'B20240116001',
    product_name: '拓浦破壁机1.5L',
    lot_qty: 800,
    sample_size: 80,
    aql_level: '1.0',
    accept_qty: 2,
    reject_qty: 3,
    defect_qty: 0,
    status: 'pending',
    inspector_name: '王品控',
    inspect_date: null
  }
])

// 检验项目
const inspectItems = ref([
  {
    id: 'ITEM001',
    item_name: '外观检查',
    standard: '无划痕、变形、污渍',
    method: '目视检查',
    result: '',
    defect_count: 0,
    defect_type: '',
    remark: ''
  },
  {
    id: 'ITEM002',
    item_name: '尺寸检验',
    standard: '±0.5mm',
    method: '游标卡尺测量',
    result: '',
    defect_count: 0,
    defect_type: '',
    remark: ''
  },
  {
    id: 'ITEM003',
    item_name: '功能测试',
    standard: '正常加热、保温',
    method: '通电测试',
    result: '',
    defect_count: 0,
    defect_type: '',
    remark: ''
  }
])

// 检验总结
const inspectSummary = reactive({
  total_defects: 0,
  conclusion: '',
  disposition: '',
  remark: ''
})

// 新建检验表单
const newInspect = reactive({
  batch_no: '',
  product_id: '',
  lot_qty: 100,
  aql_level: '1.5',
  inspector_id: '',
  remark: ''
})

// 表单验证规则
const inspectRules = {
  batch_no: [{ required: true, message: '请输入批次号', trigger: 'blur' }],
  product_id: [{ required: true, message: '请选择产品', trigger: 'change' }],
  lot_qty: [{ required: true, message: '请输入批量', trigger: 'blur' }],
  aql_level: [{ required: true, message: '请选择AQL水平', trigger: 'change' }],
  inspector_id: [{ required: true, message: '请选择检验员', trigger: 'change' }]
}

const inspectFormRef = ref()

// 计算属性
const canComplete = computed(() => {
  return inspectItems.value.every(item => item.result) && inspectSummary.conclusion
})

// 监听检验项目变化，自动计算总不良数
watch(
  () => inspectItems.value.map(item => item.defect_count),
  (newCounts) => {
    inspectSummary.total_defects = newCounts.reduce((sum, count) => sum + (count || 0), 0)
  },
  { deep: true }
)

// 方法
const getDefectClass = (defectQty: number, rejectQty: number) => {
  if (defectQty > rejectQty) return 'defect-high'
  if (defectQty > 0) return 'defect-medium'
  return 'defect-low'
}

const getStatusTag = (status: string) => {
  const map: any = {
    pending: 'warning',
    inspecting: 'primary',
    passed: 'success',
    rejected: 'danger'
  }
  return map[status] || ''
}

const getStatusName = (status: string) => {
  const map: any = {
    pending: '待检验',
    inspecting: '检验中',
    passed: '已通过',
    rejected: '已拒收'
  }
  return map[status] || status
}

const handleSearch = () => {
  loadInspectList()
}

const handleReset = () => {
  searchText.value = ''
  selectedProduct.value = ''
  selectedStatus.value = ''
  dateRange.value = []
  loadInspectList()
}

const handleCreateInspect = () => {
  createDialogVisible.value = true
}

const handleBatchProcess = () => {
  ElMessageBox.confirm('确定要批量处理选中的检验记录吗？', '确认', {
    type: 'warning'
  }).then(() => {
    ElMessage.success('批量处理成功')
    selectedItems.value = []
    loadInspectList()
  })
}

const handleExport = () => {
  ElMessage.success('导出功能开发中...')
}

const handleSelectionChange = (items: any[]) => {
  selectedItems.value = items
}

const handleStartInspect = (row: any) => {
  currentInspect.value = row
  inspectDialogVisible.value = true
  loadInspectItems(row.id)
}

const handleContinueInspect = (row: any) => {
  currentInspect.value = row
  inspectDialogVisible.value = true
  loadInspectProgress(row.id)
}

const handleViewDetail = (row: any) => {
  ElMessage.info('查看详情功能开发中...')
}

const handleMoreAction = (command: string, row: any) => {
  switch (command) {
    case 'print':
      ElMessage.success('打印报告功能开发中...')
      break
    case 'copy':
      ElMessage.success('复制检验成功')
      break
    case 'delete':
      ElMessageBox.confirm('确定要删除这个检验记录吗？', '确认', {
        type: 'warning'
      }).then(() => {
        ElMessage.success('删除成功')
        loadInspectList()
      })
      break
  }
}

const handleCloseInspectDialog = () => {
  currentInspect.value = null
  inspectItems.value.forEach(item => {
    item.result = ''
    item.defect_count = 0
    item.defect_type = ''
    item.remark = ''
  })
  Object.assign(inspectSummary, {
    total_defects: 0,
    conclusion: '',
    disposition: '',
    remark: ''
  })
}

const handleTakePhoto = (item: any) => {
  ElMessage.info('拍照功能开发中...')
}

const handleSaveProgress = () => {
  ElMessage.success('进度已保存')
}

const handleCompleteInspect = () => {
  ElMessageBox.confirm('确定要完成这次检验吗？', '确认', {
    type: 'warning'
  }).then(() => {
    ElMessage.success('检验完成')
    inspectDialogVisible.value = false
    loadInspectList()
  })
}

const handleCreateSubmit = () => {
  inspectFormRef.value?.validate((valid: boolean) => {
    if (valid) {
      submitting.value = true
      setTimeout(() => {
        submitting.value = false
        createDialogVisible.value = false
        ElMessage.success('创建成功')
        loadInspectList()
        resetCreateForm()
      }, 1000)
    }
  })
}

const resetCreateForm = () => {
  Object.assign(newInspect, {
    batch_no: '',
    product_id: '',
    lot_qty: 100,
    aql_level: '1.5',
    inspector_id: '',
    remark: ''
  })
}

const loadInspectList = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    total.value = inspectList.value.length
  }, 500)
}

const loadInspectItems = (inspectId: string) => {
  // 模拟加载检验项目
}

const loadInspectProgress = (inspectId: string) => {
  // 模拟加载已保存的检验进度
}

const handleSizeChange = (size: number) => {
  pageSize.value = size
  loadInspectList()
}

const handleCurrentChange = (page: number) => {
  currentPage.value = page
  loadInspectList()
}

// 生命周期
onMounted(() => {
  loadInspectList()
})
</script>

<style scoped lang="scss">
.quality-inspect-page {
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

      &.passed {
        .stat-icon {
          background: linear-gradient(135deg, #27ae60, #2ecc71);
        }
        .stat-number {
          color: #27ae60;
        }
      }

      &.rejected {
        .stat-icon {
          background: linear-gradient(135deg, #e74c3c, #c0392b);
        }
        .stat-number {
          color: #e74c3c;
        }
      }

      &.rate {
        .stat-icon {
          background: linear-gradient(135deg, #3498db, #2980b9);
        }
        .stat-number {
          color: #3498db;
        }
      }
    }
  }

  .action-bar {
    background: white;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

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

  .inspect-table {
    background: white;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

    .pagination {
      margin-top: 20px;
      display: flex;
      justify-content: center;
    }
  }

  .inspect-dialog-content {
    .inspect-info {
      margin-bottom: 20px;
    }

    .inspect-items {
      h3 {
        margin-bottom: 15px;
        color: var(--el-text-color-primary);
      }
    }

    .inspect-conclusion {
      background: var(--el-bg-color-soft);
      padding: 20px;
      border-radius: 8px;
    }
  }

  :deep(.defect-high) {
    color: #f56c6c;
    font-weight: bold;
    background: rgba(245, 108, 108, 0.1);
    padding: 2px 6px;
    border-radius: 4px;
  }

  :deep(.defect-medium) {
    color: #e6a23c;
    font-weight: bold;
  }

  :deep(.defect-low) {
    color: #67c23a;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .quality-inspect-page {
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
  }
}
</style> 