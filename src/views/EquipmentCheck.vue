<template>
  <div class="equipment-check-page">
    <!-- 顶部统计卡片 -->
    <div class="stats-cards">
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="stat-card pending">
            <div class="stat-icon">
              <el-icon><Timer /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ checkStats.pending }}</div>
              <div class="stat-label">待点检</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card completed">
            <div class="stat-icon">
              <el-icon><CircleCheck /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ checkStats.completed }}</div>
              <div class="stat-label">已完成</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card overdue">
            <div class="stat-icon">
              <el-icon><Warning /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ checkStats.overdue }}</div>
              <div class="stat-label">已逾期</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card maintenance">
            <div class="stat-icon">
              <el-icon><Tools /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ checkStats.maintenance }}</div>
              <div class="stat-label">需维护</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 操作栏 -->
    <div class="action-bar">
      <div class="filters">
        <el-select v-model="selectedLineId" placeholder="选择产线" clearable style="width: 150px">
          <el-option
            v-for="line in productionLines"
            :key="line.id"
            :label="line.name"
            :value="line.id"
          />
        </el-select>
        <el-select v-model="selectedStatus" placeholder="点检状态" clearable style="width: 150px">
          <el-option label="待点检" value="pending" />
          <el-option label="进行中" value="in_progress" />
          <el-option label="已完成" value="completed" />
          <el-option label="已逾期" value="overdue" />
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
        <el-button @click="handleCreatePlan" type="primary" :icon="Plus">新建点检计划</el-button>
        <el-button @click="handleBatchCheck" type="success" :icon="Check" :disabled="!selectedItems.length">
          批量点检
        </el-button>
        <el-button @click="handleExport" :icon="Download">导出</el-button>
      </div>
    </div>

    <!-- 点检列表 -->
    <div class="check-table">
      <el-table
        :data="checkList"
        v-loading="loading"
        @selection-change="handleSelectionChange"
        row-key="id"
        stripe
        border
                  max-height="600px"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="equipment_code" label="设备编号" width="120" fixed="left" />
        <el-table-column prop="equipment_name" label="设备名称" width="150" />
        <el-table-column prop="line_name" label="产线" width="100" />
        <el-table-column prop="check_type" label="点检类型" width="100">
          <template #default="scope">
            <el-tag :type="getCheckTypeTag(scope.row.check_type)">
              {{ getCheckTypeName(scope.row.check_type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="plan_date" label="计划日期" width="120" />
        <el-table-column prop="check_items_count" label="点检项数" width="100" align="center" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusTag(scope.row.status)">
              {{ getStatusName(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="checker_name" label="点检员" width="100" />
        <el-table-column prop="check_time" label="点检时间" width="160" />
        <el-table-column prop="score" label="得分" width="80" align="center">
          <template #default="scope">
            <span v-if="scope.row.score !== null" :class="getScoreClass(scope.row.score)">
              {{ scope.row.score }}
            </span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button
              v-if="scope.row.status === 'pending'"
              @click="handleStartCheck(scope.row)"
              type="primary"
              size="small"
              :icon="VideoPlay"
            >
              开始点检
            </el-button>
            <el-button
              v-if="scope.row.status === 'in_progress'"
              @click="handleContinueCheck(scope.row)"
              type="warning"
              size="small"
              :icon="Edit"
            >
              继续点检
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
                  <el-dropdown-item command="copy">复制计划</el-dropdown-item>
                  <el-dropdown-item command="maintenance" v-if="scope.row.score < 80">安排维护</el-dropdown-item>
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

    <!-- 点检执行弹窗 -->
    <el-dialog
      v-model="checkDialogVisible"
      :title="currentCheck ? '设备点检 - ' + currentCheck.equipment_name : '设备点检'"
      width="90%"
      top="5vh"
      @close="handleCloseCheckDialog"
    >
      <div v-if="currentCheck" class="check-dialog-content">
        <!-- 设备信息 -->
        <div class="equipment-info">
          <el-descriptions :column="4" border>
            <el-descriptions-item label="设备编号">{{ currentCheck.equipment_code }}</el-descriptions-item>
            <el-descriptions-item label="设备名称">{{ currentCheck.equipment_name }}</el-descriptions-item>
            <el-descriptions-item label="所属产线">{{ currentCheck.line_name }}</el-descriptions-item>
            <el-descriptions-item label="点检类型">{{ getCheckTypeName(currentCheck.check_type) }}</el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 点检项列表 -->
        <div class="check-items" style="margin-top: 20px;">
          <h3>点检项目</h3>
          <el-table :data="checkItems" border>
            <el-table-column prop="item_name" label="点检项目" width="200" />
            <el-table-column prop="check_method" label="检查方法" width="150" />
            <el-table-column prop="standard" label="标准要求" width="200" />
            <el-table-column label="检查结果" width="150">
              <template #default="scope">
                <el-select v-model="scope.row.result" placeholder="选择结果">
                  <el-option label="正常" value="normal" />
                  <el-option label="异常" value="abnormal" />
                  <el-option label="待维修" value="repair" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="实测值" width="120">
              <template #default="scope">
                <el-input v-model="scope.row.actual_value" placeholder="实测值" />
              </template>
            </el-table-column>
            <el-table-column label="备注" min-width="200">
              <template #default="scope">
                <el-input v-model="scope.row.remark" placeholder="填写备注" />
              </template>
            </el-table-column>
            <el-table-column label="拍照" width="100">
              <template #default="scope">
                <el-button @click="handleTakePhoto(scope.row)" size="small" :icon="Camera">
                  拍照
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <!-- 点检总结 -->
          <div class="check-summary" style="margin-top: 20px;">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="整体评分">
                  <el-rate v-model="checkSummary.rating" :max="5" show-score />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="点检结论">
                  <el-select v-model="checkSummary.conclusion" placeholder="选择结论">
                    <el-option label="正常" value="normal" />
                    <el-option label="需要维护" value="maintenance" />
                    <el-option label="需要维修" value="repair" />
                    <el-option label="停机检修" value="shutdown" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="总体备注">
              <el-input
                v-model="checkSummary.remark"
                type="textarea"
                :rows="3"
                placeholder="填写点检总结和建议..."
              />
            </el-form-item>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleSaveProgress">保存进度</el-button>
          <el-button @click="checkDialogVisible = false">取消</el-button>
          <el-button @click="handleCompleteCheck" type="primary" :disabled="!canComplete">
            完成点检
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 新建计划弹窗 -->
    <el-dialog v-model="planDialogVisible" title="新建点检计划" width="800px">
      <el-form :model="newPlan" :rules="planRules" ref="planFormRef" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="设备" prop="equipment_id">
              <el-select v-model="newPlan.equipment_id" placeholder="选择设备" filterable>
                <el-option
                  v-for="equipment in equipmentList"
                  :key="equipment.id"
                  :label="`${equipment.code} - ${equipment.name}`"
                  :value="equipment.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="点检类型" prop="check_type">
              <el-select v-model="newPlan.check_type" placeholder="选择类型">
                <el-option label="日检" value="daily" />
                <el-option label="周检" value="weekly" />
                <el-option label="月检" value="monthly" />
                <el-option label="年检" value="yearly" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="计划日期" prop="plan_date">
              <el-date-picker
                v-model="newPlan.plan_date"
                type="date"
                placeholder="选择日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="负责人" prop="checker_id">
              <el-select v-model="newPlan.checker_id" placeholder="选择负责人">
                <el-option
                  v-for="user in userList"
                  :key="user.id"
                  :label="user.name"
                  :value="user.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="备注">
          <el-input v-model="newPlan.remark" type="textarea" :rows="3" placeholder="填写备注..." />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="planDialogVisible = false">取消</el-button>
          <el-button @click="handleCreatePlanSubmit" type="primary" :loading="submitting">
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Timer, CircleCheck, Warning, Tools, Search, Refresh, Plus, Check, Download,
  VideoPlay, Edit, View, More, Camera
} from '@element-plus/icons-vue'

// 响应式数据
const loading = ref(false)
const selectedLineId = ref('')
const selectedStatus = ref('')
const dateRange = ref<string[]>([])
const selectedItems = ref<any[]>([])
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)

const checkDialogVisible = ref(false)
const planDialogVisible = ref(false)
const submitting = ref(false)
const currentCheck = ref<any>(null)

// 统计数据
const checkStats = reactive({
  pending: 15,
  completed: 42,
  overdue: 3,
  maintenance: 8
})

// 产线列表
const productionLines = ref([
  { id: 'LINE001', name: '生产线1' },
  { id: 'LINE002', name: '生产线2' },
  { id: 'LINE003', name: '生产线3' }
])

// 设备列表
const equipmentList = ref([
  { id: 'EQ001', code: 'CNC-001', name: 'CNC加工中心1号' },
  { id: 'EQ002', code: 'CNC-002', name: 'CNC加工中心2号' },
  { id: 'EQ003', code: 'PRESS-001', name: '冲压机1号' }
])

// 用户列表
const userList = ref([
  { id: 'U001', name: '张三' },
  { id: 'U002', name: '李四' },
  { id: 'U003', name: '王五' }
])

// 点检列表
const checkList = ref([
  {
    id: 'CHK001',
    equipment_code: 'CNC-001',
    equipment_name: 'CNC加工中心1号',
    line_name: '生产线1',
    check_type: 'daily',
    plan_date: '2024-01-15',
    check_items_count: 12,
    status: 'pending',
    checker_name: '张三',
    check_time: null,
    score: null
  },
  {
    id: 'CHK002',
    equipment_code: 'CNC-002',
    equipment_name: 'CNC加工中心2号',
    line_name: '生产线1',
    check_type: 'weekly',
    plan_date: '2024-01-14',
    check_items_count: 18,
    status: 'completed',
    checker_name: '李四',
    check_time: '2024-01-14 10:30:00',
    score: 95
  },
  {
    id: 'CHK003',
    equipment_code: 'PRESS-001',
    equipment_name: '冲压机1号',
    line_name: '生产线2',
    check_type: 'daily',
    plan_date: '2024-01-13',
    check_items_count: 8,
    status: 'overdue',
    checker_name: '王五',
    check_time: null,
    score: null
  }
])

// 点检项
const checkItems = ref([
  {
    id: 'ITEM001',
    item_name: '主轴润滑',
    check_method: '目视检查',
    standard: '无异响，润滑良好',
    result: '',
    actual_value: '',
    remark: ''
  },
  {
    id: 'ITEM002',
    item_name: '冷却液液位',
    check_method: '液位计读数',
    standard: '≥80%',
    result: '',
    actual_value: '',
    remark: ''
  }
])

// 点检总结
const checkSummary = reactive({
  rating: 0,
  conclusion: '',
  remark: ''
})

// 新建计划表单
const newPlan = reactive({
  equipment_id: '',
  check_type: '',
  plan_date: '',
  checker_id: '',
  remark: ''
})

// 表单验证规则
const planRules = {
  equipment_id: [{ required: true, message: '请选择设备', trigger: 'change' }],
  check_type: [{ required: true, message: '请选择点检类型', trigger: 'change' }],
  plan_date: [{ required: true, message: '请选择计划日期', trigger: 'change' }],
  checker_id: [{ required: true, message: '请选择负责人', trigger: 'change' }]
}

const planFormRef = ref()

// 计算属性
const canComplete = computed(() => {
  return checkItems.value.every(item => item.result) && checkSummary.conclusion
})

// 方法
const getCheckTypeTag = (type: string) => {
  const map: any = {
    daily: '',
    weekly: 'success',
    monthly: 'warning',
    yearly: 'danger'
  }
  return map[type] || ''
}

const getCheckTypeName = (type: string) => {
  const map: any = {
    daily: '日检',
    weekly: '周检',
    monthly: '月检',
    yearly: '年检'
  }
  return map[type] || type
}

const getStatusTag = (status: string) => {
  const map: any = {
    pending: 'warning',
    in_progress: 'primary',
    completed: 'success',
    overdue: 'danger'
  }
  return map[status] || ''
}

const getStatusName = (status: string) => {
  const map: any = {
    pending: '待点检',
    in_progress: '进行中',
    completed: '已完成',
    overdue: '已逾期'
  }
  return map[status] || status
}

const getScoreClass = (score: number) => {
  if (score >= 90) return 'score-excellent'
  if (score >= 80) return 'score-good'
  if (score >= 60) return 'score-fair'
  return 'score-poor'
}

const handleSearch = () => {
  loadCheckList()
}

const handleReset = () => {
  selectedLineId.value = ''
  selectedStatus.value = ''
  dateRange.value = []
  loadCheckList()
}

const handleCreatePlan = () => {
  planDialogVisible.value = true
}

const handleBatchCheck = () => {
  ElMessageBox.confirm('确定要批量开始选中的点检计划吗？', '确认', {
    type: 'warning'
  }).then(() => {
    // 实际应该调用API
    ElMessage.success('批量操作成功')
    selectedItems.value = []
    loadCheckList()
  })
}

const handleExport = () => {
  ElMessage.success('导出功能开发中...')
}

const handleSelectionChange = (items: any[]) => {
  selectedItems.value = items
}

const handleStartCheck = (row: any) => {
  currentCheck.value = row
  checkDialogVisible.value = true
  // 加载点检项
  loadCheckItems(row.id)
}

const handleContinueCheck = (row: any) => {
  currentCheck.value = row
  checkDialogVisible.value = true
  // 加载已保存的点检进度
  loadCheckProgress(row.id)
}

const handleViewDetail = (row: any) => {
  ElMessage.info('查看详情功能开发中...')
}

const handleMoreAction = (command: string, row: any) => {
  switch (command) {
    case 'copy':
      ElMessage.success('复制计划成功')
      break
    case 'maintenance':
      ElMessage.success('已安排维护')
      break
    case 'delete':
      ElMessageBox.confirm('确定要删除这个点检计划吗？', '确认', {
        type: 'warning'
      }).then(() => {
        ElMessage.success('删除成功')
        loadCheckList()
      })
      break
  }
}

const handleCloseCheckDialog = () => {
  currentCheck.value = null
  checkItems.value.forEach(item => {
    item.result = ''
    item.actual_value = ''
    item.remark = ''
  })
  checkSummary.rating = 0
  checkSummary.conclusion = ''
  checkSummary.remark = ''
}

const handleTakePhoto = (item: any) => {
  ElMessage.info('拍照功能开发中...')
}

const handleSaveProgress = () => {
  ElMessage.success('进度已保存')
}

const handleCompleteCheck = () => {
  ElMessageBox.confirm('确定要完成这次点检吗？', '确认', {
    type: 'warning'
  }).then(() => {
    // 实际应该调用API保存点检结果
    ElMessage.success('点检完成')
    checkDialogVisible.value = false
    loadCheckList()
  })
}

const handleCreatePlanSubmit = () => {
  planFormRef.value?.validate((valid: boolean) => {
    if (valid) {
      submitting.value = true
      // 模拟API调用
      setTimeout(() => {
        submitting.value = false
        planDialogVisible.value = false
        ElMessage.success('创建成功')
        loadCheckList()
        resetPlanForm()
      }, 1000)
    }
  })
}

const resetPlanForm = () => {
  Object.assign(newPlan, {
    equipment_id: '',
    check_type: '',
    plan_date: '',
    checker_id: '',
    remark: ''
  })
}

const loadCheckList = () => {
  loading.value = true
  // 模拟API调用
  setTimeout(() => {
    loading.value = false
    total.value = checkList.value.length
  }, 500)
}

const loadCheckItems = (checkId: string) => {
  // 模拟加载点检项
}

const loadCheckProgress = (checkId: string) => {
  // 模拟加载已保存的点检进度
}

const handleSizeChange = (size: number) => {
  pageSize.value = size
  loadCheckList()
}

const handleCurrentChange = (page: number) => {
  currentPage.value = page
  loadCheckList()
}

// 生命周期
onMounted(() => {
  loadCheckList()
})
</script>

<style scoped lang="scss">
.equipment-check-page {
  padding: 20px;
  background: var(--el-bg-color-page);
  min-height: 100vh;

  .stats-cards {
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

      &.completed {
        .stat-icon {
          background: linear-gradient(135deg, #27ae60, #2ecc71);
        }
        .stat-number {
          color: #27ae60;
        }
      }

      &.overdue {
        .stat-icon {
          background: linear-gradient(135deg, #e74c3c, #c0392b);
        }
        .stat-number {
          color: #e74c3c;
        }
      }

      &.maintenance {
        .stat-icon {
          background: linear-gradient(135deg, #8e44ad, #9b59b6);
        }
        .stat-number {
          color: #8e44ad;
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
    }

    .actions {
      display: flex;
      gap: 10px;
    }
  }

  .check-table {
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

  .check-dialog-content {
    .equipment-info {
      margin-bottom: 20px;
    }

    .check-items {
      h3 {
        margin-bottom: 15px;
        color: var(--el-text-color-primary);
      }
    }

    .check-summary {
      background: var(--el-bg-color-soft);
      padding: 20px;
      border-radius: 8px;
    }
  }

  :deep(.score-excellent) {
    color: #67c23a;
    font-weight: bold;
  }

  :deep(.score-good) {
    color: #409eff;
    font-weight: bold;
  }

  :deep(.score-fair) {
    color: #e6a23c;
    font-weight: bold;
  }

  :deep(.score-poor) {
    color: #f56c6c;
    font-weight: bold;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .equipment-check-page {
    padding: 10px;

    .action-bar {
      flex-direction: column;
      gap: 15px;

      .filters,
      .actions {
        width: 100%;
        justify-content: flex-start;
        flex-wrap: wrap;
      }
    }

    .stats-cards {
      :deep(.el-col) {
        margin-bottom: 15px;
      }
    }
  }
}
</style> 