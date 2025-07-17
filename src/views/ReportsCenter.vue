<template>
  <div class="reports-center">
    <!-- Header Section -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">
          <el-icon><TrendCharts /></el-icon>
          报表中心
        </h1>
        <p class="page-desc">报表生成、数据导出、定时报告</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" :icon="Plus" @click="showCreateDialog = true">
          创建报表
        </el-button>
        <el-button :icon="Setting" @click="showScheduleDialog = true">
          定时任务
        </el-button>
        <el-button :icon="Refresh" @click="refreshData" :loading="loading">
          刷新
        </el-button>
      </div>
    </div>

    <!-- Quick Stats -->
    <div class="stats-section">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon primary">
            <el-icon><Document /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.totalReports }}</div>
            <div class="stat-label">总报表数</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon success">
            <el-icon><Download /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.todayExports }}</div>
            <div class="stat-label">今日导出次数</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon warning">
            <el-icon><Clock /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.scheduledTasks }}</div>
            <div class="stat-label">定时任务</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon info">
            <el-icon><User /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.activeUsers }}</div>
            <div class="stat-label">活跃用户</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Report Categories -->
    <div class="categories-section">
      <el-tabs v-model="activeCategory" @tab-change="handleCategoryChange">
        <el-tab-pane label="生产报表" name="production">
          <div class="reports-grid">
            <div 
              v-for="report in productionReports" 
              :key="report.id"
              class="report-card"
              @click="generateReport(report)"
            >
              <div class="report-icon">
                <el-icon><component :is="report.icon" /></el-icon>
              </div>
              <div class="report-info">
                <h4>{{ report.name }}</h4>
                <p>{{ report.description }}</p>
                <div class="report-meta">
                  <el-tag size="small">{{ report.category }}</el-tag>
                  <span class="export-count">{{ report.exportCount }}次导出</span>
                </div>
              </div>
              <div class="report-actions">
                <el-button size="small" type="primary" :icon="View">
                  预览
                </el-button>
                <el-dropdown trigger="click">
                  <el-button size="small" :icon="Download">
                    导出<el-icon class="el-icon--right"><ArrowDown /></el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item @click="exportReport(report, 'excel')">
                        Excel格式
                      </el-dropdown-item>
                      <el-dropdown-item @click="exportReport(report, 'pdf')">
                        PDF格式
                      </el-dropdown-item>
                      <el-dropdown-item @click="exportReport(report, 'csv')">
                        CSV格式
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="品质报表" name="quality">
          <div class="reports-grid">
            <div 
              v-for="report in qualityReports" 
              :key="report.id"
              class="report-card"
              @click="generateReport(report)"
            >
              <div class="report-icon">
                <el-icon><component :is="report.icon" /></el-icon>
              </div>
              <div class="report-info">
                <h4>{{ report.name }}</h4>
                <p>{{ report.description }}</p>
                <div class="report-meta">
                  <el-tag size="small" type="success">{{ report.category }}</el-tag>
                  <span class="export-count">{{ report.exportCount }}次导出</span>
                </div>
              </div>
              <div class="report-actions">
                <el-button size="small" type="primary" :icon="View">
                  预览
                </el-button>
                <el-dropdown trigger="click">
                  <el-button size="small" :icon="Download">
                    导出<el-icon class="el-icon--right"><ArrowDown /></el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item @click="exportReport(report, 'excel')">
                        Excel格式
                      </el-dropdown-item>
                      <el-dropdown-item @click="exportReport(report, 'pdf')">
                        PDF格式
                      </el-dropdown-item>
                      <el-dropdown-item @click="exportReport(report, 'csv')">
                        CSV格式
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="设备报表" name="equipment">
          <div class="reports-grid">
            <div 
              v-for="report in equipmentReports" 
              :key="report.id"
              class="report-card"
              @click="generateReport(report)"
            >
              <div class="report-icon">
                <el-icon><component :is="report.icon" /></el-icon>
              </div>
              <div class="report-info">
                <h4>{{ report.name }}</h4>
                <p>{{ report.description }}</p>
                <div class="report-meta">
                  <el-tag size="small" type="warning">{{ report.category }}</el-tag>
                  <span class="export-count">{{ report.exportCount }}次导出</span>
                </div>
              </div>
              <div class="report-actions">
                <el-button size="small" type="primary" :icon="View">
                  预览
                </el-button>
                <el-dropdown trigger="click">
                  <el-button size="small" :icon="Download">
                    导出<el-icon class="el-icon--right"><ArrowDown /></el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item @click="exportReport(report, 'excel')">
                        Excel格式
                      </el-dropdown-item>
                      <el-dropdown-item @click="exportReport(report, 'pdf')">
                        PDF格式
                      </el-dropdown-item>
                      <el-dropdown-item @click="exportReport(report, 'csv')">
                        CSV格式
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="自定义报表" name="custom">
          <div class="custom-reports">
            <div class="empty-state" v-if="customReports.length === 0">
              <el-icon class="empty-icon"><DocumentAdd /></el-icon>
              <p>暂无自定义报表</p>
              <el-button type="primary" @click="showCreateDialog = true">
                创建第一个报表
              </el-button>
            </div>
            <div class="reports-grid" v-else>
              <div 
                v-for="report in customReports" 
                :key="report.id"
                class="report-card"
                @click="generateReport(report)"
              >
                <div class="report-icon">
                  <el-icon><component :is="report.icon" /></el-icon>
                </div>
                <div class="report-info">
                  <h4>{{ report.name }}</h4>
                  <p>{{ report.description }}</p>
                  <div class="report-meta">
                    <el-tag size="small" type="info">{{ report.category }}</el-tag>
                    <span class="export-count">{{ report.exportCount }}次导出</span>
                  </div>
                </div>
                <div class="report-actions">
                  <el-button size="small" type="primary" :icon="View">
                    预览
                  </el-button>
                  <el-button size="small" :icon="Edit" @click.stop="editReport(report)">
                    编辑
                  </el-button>
                  <el-dropdown trigger="click">
                    <el-button size="small" :icon="Download">
                      导出<el-icon class="el-icon--right"><ArrowDown /></el-icon>
                    </el-button>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item @click="exportReport(report, 'excel')">
                          Excel格式
                        </el-dropdown-item>
                        <el-dropdown-item @click="exportReport(report, 'pdf')">
                          PDF格式
                        </el-dropdown-item>
                        <el-dropdown-item @click="exportReport(report, 'csv')">
                          CSV格式
                        </el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- Create Report Dialog -->
    <el-dialog
      v-model="showCreateDialog"
      title="创建自定义报表"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="createFormRef"
        :model="createForm"
        :rules="createRules"
        label-width="100px"
      >
        <el-form-item label="报表名称" prop="name">
          <el-input v-model="createForm.name" placeholder="输入报表名称" />
        </el-form-item>
        <el-form-item label="报表描述" prop="description">
          <el-input
            v-model="createForm.description"
            type="textarea"
            :rows="3"
            placeholder="输入报表描述"
          />
        </el-form-item>
        <el-form-item label="数据源" prop="dataSource">
          <el-select v-model="createForm.dataSource" placeholder="选择数据源" style="width: 100%">
            <el-option label="生产数据" value="production" />
            <el-option label="品质数据" value="quality" />
            <el-option label="设备数据" value="equipment" />
            <el-option label="库存数据" value="inventory" />
            <el-option label="人员数据" value="employee" />
          </el-select>
        </el-form-item>
        <el-form-item label="报表类型" prop="reportType">
          <el-select v-model="createForm.reportType" placeholder="选择报表类型" style="width: 100%">
            <el-option label="汇总报表" value="summary" />
            <el-option label="明细报表" value="detail" />
            <el-option label="趋势分析" value="trend" />
            <el-option label="对比分析" value="comparison" />
          </el-select>
        </el-form-item>
        <el-form-item label="更新频率" prop="frequency">
          <el-select v-model="createForm.frequency" placeholder="选择更新频率" style="width: 100%">
            <el-option label="实时" value="realtime" />
            <el-option label="每小时" value="hourly" />
            <el-option label="每日" value="daily" />
            <el-option label="每周" value="weekly" />
            <el-option label="每月" value="monthly" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="submitCreate" :loading="submitting">
          创建
        </el-button>
      </template>
    </el-dialog>

    <!-- Schedule Dialog -->
    <el-dialog
      v-model="showScheduleDialog"
      title="定时任务管理"
      width="800px"
      :close-on-click-modal="false"
    >
      <div class="schedule-content">
        <div class="schedule-toolbar">
          <el-button type="primary" :icon="Plus" @click="addSchedule">
            添加任务
          </el-button>
        </div>
        
        <el-table :data="schedules" stripe border>
          <el-table-column prop="name" label="任务名称" />
          <el-table-column prop="reportName" label="报表名称" />
          <el-table-column prop="frequency" label="执行频率" width="100">
            <template #default="{ row }">
              <el-tag size="small">{{ getFrequencyText(row.frequency) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="nextRun" label="下次执行" width="160" />
          <el-table-column prop="recipients" label="接收人" width="200" show-overflow-tooltip />
          <el-table-column prop="status" label="状态" width="80" align="center">
            <template #default="{ row }">
              <el-switch 
                v-model="row.enabled" 
                @change="toggleSchedule(row)"
              />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120">
            <template #default="{ row }">
              <el-button
                type="primary"
                size="small"
                :icon="Edit"
                @click="editSchedule(row)"
              >
                编辑
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-dialog>

    <!-- Export Progress Dialog -->
    <el-dialog
      v-model="showExportDialog"
      title="导出进度"
      width="400px"
      :close-on-click-modal="false"
      :show-close="false"
    >
      <div class="export-progress">
        <div class="progress-info">
          <p>正在导出报表：{{ currentExportReport?.name }}</p>
          <el-progress 
            :percentage="exportProgress" 
            :status="exportProgress === 100 ? 'success' : undefined"
          />
        </div>
        <div class="progress-steps">
          <div class="step" :class="{ active: currentStep >= 1, completed: currentStep > 1 }">
            <el-icon><Loading /></el-icon>
            <span>数据查询中...</span>
          </div>
          <div class="step" :class="{ active: currentStep >= 2, completed: currentStep > 2 }">
            <el-icon><Edit /></el-icon>
            <span>格式化数据...</span>
          </div>
          <div class="step" :class="{ active: currentStep >= 3, completed: currentStep > 3 }">
            <el-icon><Download /></el-icon>
            <span>生成文件...</span>
          </div>
        </div>
      </div>
      <template #footer v-if="exportProgress === 100">
        <el-button type="primary" @click="showExportDialog = false">
          完成
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import {
  TrendCharts, Plus, Setting, Refresh, Document, Download, Clock, User,
  View, Edit, ArrowDown, DocumentAdd, Loading, Check
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'

// Interfaces
interface Report {
  id: string
  name: string
  description: string
  category: string
  icon: string
  exportCount: number
}

interface Schedule {
  id: string
  name: string
  reportName: string
  frequency: string
  nextRun: string
  recipients: string
  enabled: boolean
}

// Reactive data
const loading = ref(false)
const submitting = ref(false)
const showCreateDialog = ref(false)
const showScheduleDialog = ref(false)
const showExportDialog = ref(false)
const activeCategory = ref('production')
const exportProgress = ref(0)
const currentStep = ref(0)
const currentExportReport = ref<Report | null>(null)

const stats = reactive({
  totalReports: 28,
  todayExports: 15,
  scheduledTasks: 6,
  activeUsers: 12
})

const createForm = reactive({
  name: '',
  description: '',
  dataSource: '',
  reportType: '',
  frequency: ''
})

const createFormRef = ref<FormInstance>()

const createRules: FormRules = {
  name: [{ required: true, message: '请输入报表名称', trigger: 'blur' }],
  description: [{ required: true, message: '请输入报表描述', trigger: 'blur' }],
  dataSource: [{ required: true, message: '请选择数据源', trigger: 'change' }],
  reportType: [{ required: true, message: '请选择报表类型', trigger: 'change' }],
  frequency: [{ required: true, message: '请选择更新频率', trigger: 'change' }]
}

// Mock data
const productionReports = ref<Report[]>([
  {
    id: 'PR001',
    name: '日产量统计报表',
    description: '按日期、产线、产品统计生产数量',
    category: '生产',
    icon: 'BarChart',
    exportCount: 156
  },
  {
    id: 'PR002',
    name: '工单完成情况',
    description: '工单计划vs实际完成对比分析',
    category: '生产',
    icon: 'DataLine',
    exportCount: 89
  },
  {
    id: 'PR003',
    name: '设备稼动率分析',
    description: '设备运行时间与停机时间统计',
    category: '生产',
    icon: 'PieChart',
    exportCount: 67
  },
  {
    id: 'PR004',
    name: '人员效率报表',
    description: '员工产量与标准工时对比',
    category: '生产',
    icon: 'TrendCharts',
    exportCount: 134
  }
])

const qualityReports = ref<Report[]>([
  {
    id: 'QR001',
    name: '不良率趋势分析',
    description: '按时间维度分析产品不良率变化',
    category: '品质',
    icon: 'LineChart',
    exportCount: 78
  },
  {
    id: 'QR002',
    name: 'Pareto不良分析',
    description: '按不良类型统计占比分析',
    category: '品质',
    icon: 'BarChart',
    exportCount: 92
  },
  {
    id: 'QR003',
    name: '检验合格率报表',
    description: '首检、巡检、终检合格率统计',
    category: '品质',
    icon: 'DataAnalysis',
    exportCount: 45
  },
  {
    id: 'QR004',
    name: '返修记录统计',
    description: '返修原因、数量、成本分析',
    category: '品质',
    icon: 'Document',
    exportCount: 23
  }
])

const equipmentReports = ref<Report[]>([
  {
    id: 'ER001',
    name: '设备OEE报表',
    description: '设备综合效率分析报告',
    category: '设备',
    icon: 'DataBoard',
    exportCount: 112
  },
  {
    id: 'ER002',
    name: '故障统计分析',
    description: '设备故障类型、频次、影响分析',
    category: '设备',
    icon: 'Warning',
    exportCount: 87
  },
  {
    id: 'ER003',
    name: '保养计划执行',
    description: '计划保养vs实际执行对比',
    category: '设备',
    icon: 'Tools',
    exportCount: 34
  },
  {
    id: 'ER004',
    name: '备件消耗统计',
    description: '备件使用量与成本分析',
    category: '设备',
    icon: 'Box',
    exportCount: 56
  }
])

const customReports = ref<Report[]>([])

const schedules = ref<Schedule[]>([
  {
    id: 'S001',
    name: '日产量日报',
    reportName: '日产量统计报表',
    frequency: 'daily',
    nextRun: '2025-01-18 08:00:00',
    recipients: '生产部经理, 品质主管',
    enabled: true
  },
  {
    id: 'S002',
    name: '周品质汇报',
    reportName: '不良率趋势分析',
    frequency: 'weekly',
    nextRun: '2025-01-20 09:00:00',
    recipients: '品质部, 生产部',
    enabled: true
  },
  {
    id: 'S003',
    name: '月度OEE报告',
    reportName: '设备OEE报表',
    frequency: 'monthly',
    nextRun: '2025-02-01 10:00:00',
    recipients: '设备部, 生产总监',
    enabled: false
  }
])

// Methods
const refreshData = async () => {
  loading.value = true
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    ElMessage.success('数据刷新成功')
  } catch (error) {
    ElMessage.error('刷新失败')
  } finally {
    loading.value = false
  }
}

const handleCategoryChange = (category: string) => {
  console.log('切换分类:', category)
}

const generateReport = (report: Report) => {
  ElMessage.success(`正在生成报表：${report.name}`)
}

const exportReport = async (report: Report, format: string) => {
  currentExportReport.value = report
  showExportDialog.value = true
  exportProgress.value = 0
  currentStep.value = 1

  // Simulate export process
  const steps = [
    { progress: 30, step: 1, delay: 1000 },
    { progress: 60, step: 2, delay: 1500 },
    { progress: 90, step: 3, delay: 1000 },
    { progress: 100, step: 3, delay: 500 }
  ]

  for (const step of steps) {
    await new Promise(resolve => setTimeout(resolve, step.delay))
    exportProgress.value = step.progress
    currentStep.value = step.step
  }

  ElMessage.success(`报表已导出为${format.toUpperCase()}格式`)
  report.exportCount++
}

const editReport = (report: Report) => {
  ElMessage.info(`编辑报表：${report.name}`)
}

const submitCreate = async () => {
  if (!createFormRef.value) return

  try {
    await createFormRef.value.validate()
    submitting.value = true

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))

    const newReport: Report = {
      id: `CR${Date.now()}`,
      name: createForm.name,
      description: createForm.description,
      category: '自定义',
      icon: 'Document',
      exportCount: 0
    }

    customReports.value.push(newReport)
    showCreateDialog.value = false
    resetCreateForm()
    
    ElMessage.success('报表创建成功')
  } catch (error) {
    console.error('创建失败:', error)
  } finally {
    submitting.value = false
  }
}

const resetCreateForm = () => {
  Object.assign(createForm, {
    name: '',
    description: '',
    dataSource: '',
    reportType: '',
    frequency: ''
  })
  createFormRef.value?.resetFields()
}

const addSchedule = () => {
  ElMessage.info('添加定时任务功能开发中...')
}

const editSchedule = (schedule: Schedule) => {
  ElMessage.info(`编辑定时任务：${schedule.name}`)
}

const toggleSchedule = (schedule: Schedule) => {
  const status = schedule.enabled ? '启用' : '禁用'
  ElMessage.success(`定时任务已${status}`)
}

const getFrequencyText = (frequency: string) => {
  const textMap: Record<string, string> = {
    daily: '每日',
    weekly: '每周',
    monthly: '每月',
    hourly: '每小时'
  }
  return textMap[frequency] || frequency
}

// Lifecycle
onMounted(() => {
  refreshData()
})
</script>

<style scoped lang="scss">
.reports-center {
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

  .categories-section {
    background: var(--el-bg-color);
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

    :deep(.el-tabs__content) {
      padding: 20px;
    }

    .reports-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 20px;

      .report-card {
        background: var(--el-bg-color-overlay);
        border: 1px solid var(--el-border-color-light);
        border-radius: 8px;
        padding: 20px;
        cursor: pointer;
        transition: all 0.2s ease;

        &:hover {
          border-color: var(--el-color-primary);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          transform: translateY(-2px);
        }

        .report-icon {
          width: 48px;
          height: 48px;
          border-radius: 8px;
          background: rgba(64, 158, 255, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;

          .el-icon {
            font-size: 24px;
            color: var(--el-color-primary);
          }
        }

        .report-info {
          margin-bottom: 16px;

          h4 {
            font-size: 16px;
            font-weight: 600;
            color: var(--el-text-color-primary);
            margin: 0 0 8px 0;
          }

          p {
            font-size: 14px;
            color: var(--el-text-color-regular);
            margin: 0 0 12px 0;
            line-height: 1.4;
          }

          .report-meta {
            display: flex;
            justify-content: space-between;
            align-items: center;

            .export-count {
              font-size: 12px;
              color: var(--el-text-color-secondary);
            }
          }
        }

        .report-actions {
          display: flex;
          gap: 8px;
        }
      }
    }

    .custom-reports {
      .empty-state {
        text-align: center;
        padding: 60px 20px;

        .empty-icon {
          font-size: 64px;
          color: var(--el-text-color-placeholder);
          margin-bottom: 16px;
        }

        p {
          font-size: 16px;
          color: var(--el-text-color-regular);
          margin: 0 0 24px 0;
        }
      }
    }
  }

  .schedule-content {
    .schedule-toolbar {
      margin-bottom: 16px;
      display: flex;
      justify-content: flex-start;
    }
  }

  .export-progress {
    .progress-info {
      margin-bottom: 24px;

      p {
        margin: 0 0 16px 0;
        font-size: 14px;
        color: var(--el-text-color-primary);
      }
    }

    .progress-steps {
      .step {
        display: flex;
        align-items: center;
        padding: 12px 0;
        color: var(--el-text-color-placeholder);
        transition: color 0.2s ease;

        &.active {
          color: var(--el-color-primary);

          .el-icon {
            animation: spin 2s linear infinite;
          }
        }

        &.completed {
          color: var(--el-color-success);

          .el-icon {
            animation: none;
          }
        }

        .el-icon {
          margin-right: 12px;
          font-size: 16px;
        }

        span {
          font-size: 14px;
        }
      }
    }
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

// Factory theme enhancements
[data-theme="factory"] {
  .reports-center {
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

    .categories-section {
      background: rgba(0, 27, 46, 0.6);
      border: 1px solid rgba(0, 216, 255, 0.2);
      box-shadow: 0 0 15px rgba(0, 216, 255, 0.1);

      .report-card {
        background: rgba(0, 27, 46, 0.8);
        border: 1px solid rgba(0, 216, 255, 0.3);

        &:hover {
          border-color: rgba(0, 216, 255, 0.6);
          box-shadow: 0 0 20px rgba(0, 216, 255, 0.2);
        }
      }
    }
  }
}

// Dark theme
[data-theme="dark"] {
  .reports-center {
    .page-header,
    .categories-section,
    .stat-card {
      background: var(--el-bg-color-overlay);
      border: 1px solid var(--el-border-color-darker);
    }

    .report-card {
      background: var(--el-bg-color);
      border: 1px solid var(--el-border-color);
    }
  }
}
</style> 