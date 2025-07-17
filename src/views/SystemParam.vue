<template>
  <div class="system-param">
    <!-- Header Section -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">
          <el-icon><Setting /></el-icon>
          系统参数
        </h1>
        <p class="page-desc">参数配置、工厂日历、基础设置</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" :icon="Edit" @click="enterEditMode" v-if="!editMode">
          编辑配置
        </el-button>
        <el-button type="success" :icon="Check" @click="saveChanges" v-if="editMode" :loading="saving">
          保存更改
        </el-button>
        <el-button :icon="Close" @click="cancelEdit" v-if="editMode">
          取消
        </el-button>
        <el-button :icon="Refresh" @click="refreshData" :loading="loading">
          刷新
        </el-button>
      </div>
    </div>

    <!-- Configuration Tabs -->
    <div class="config-section">
      <el-tabs v-model="activeTab" type="border-card">
        <!-- System Basic Settings -->
        <el-tab-pane label="基础设置" name="basic">
          <div class="tab-content">
            <div class="config-group">
              <h3 class="group-title">系统信息</h3>
              <el-form :model="basicConfig" label-width="150px" class="config-form">
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="系统名称">
                      <el-input 
                        v-model="basicConfig.systemName" 
                        :disabled="!editMode"
                        placeholder="输入系统名称"
                      />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="公司名称">
                      <el-input 
                        v-model="basicConfig.companyName" 
                        :disabled="!editMode"
                        placeholder="输入公司名称"
                      />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="系统版本">
                      <el-input 
                        v-model="basicConfig.version" 
                        :disabled="!editMode"
                        placeholder="输入系统版本"
                      />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="时区设置">
                      <el-select 
                        v-model="basicConfig.timezone" 
                        :disabled="!editMode"
                        placeholder="选择时区"
                        style="width: 100%"
                      >
                        <el-option label="北京时间 (UTC+8)" value="Asia/Shanghai" />
                        <el-option label="东京时间 (UTC+9)" value="Asia/Tokyo" />
                        <el-option label="首尔时间 (UTC+9)" value="Asia/Seoul" />
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="默认语言">
                      <el-select 
                        v-model="basicConfig.language" 
                        :disabled="!editMode"
                        placeholder="选择语言"
                        style="width: 100%"
                      >
                        <el-option label="简体中文" value="zh-CN" />
                        <el-option label="English" value="en-US" />
                        <el-option label="日本語" value="ja-JP" />
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="默认主题">
                      <el-select 
                        v-model="basicConfig.defaultTheme" 
                        :disabled="!editMode"
                        placeholder="选择主题"
                        style="width: 100%"
                      >
                        <el-option label="明亮主题" value="light" />
                        <el-option label="暗黑主题" value="dark" />
                        <el-option label="工厂大屏" value="factory" />
                      </el-select>
                    </el-form-item>
                  </el-col>
                </el-row>
              </el-form>
            </div>

            <div class="config-group">
              <h3 class="group-title">安全设置</h3>
              <el-form :model="basicConfig" label-width="150px" class="config-form">
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="会话超时(分钟)">
                      <el-input-number 
                        v-model="basicConfig.sessionTimeout" 
                        :disabled="!editMode"
                        :min="5"
                        :max="1440"
                        style="width: 100%"
                      />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="密码最小长度">
                      <el-input-number 
                        v-model="basicConfig.minPasswordLength" 
                        :disabled="!editMode"
                        :min="6"
                        :max="20"
                        style="width: 100%"
                      />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="启用验证码">
                      <el-switch 
                        v-model="basicConfig.enableCaptcha" 
                        :disabled="!editMode"
                      />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="启用操作日志">
                      <el-switch 
                        v-model="basicConfig.enableAuditLog" 
                        :disabled="!editMode"
                      />
                    </el-form-item>
                  </el-col>
                </el-row>
              </el-form>
            </div>
          </div>
        </el-tab-pane>

        <!-- Production Settings -->
        <el-tab-pane label="生产配置" name="production">
          <div class="tab-content">
            <div class="config-group">
              <h3 class="group-title">工时设置</h3>
              <el-form :model="productionConfig" label-width="150px" class="config-form">
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="标准工作时长(小时)">
                      <el-input-number 
                        v-model="productionConfig.standardWorkHours" 
                        :disabled="!editMode"
                        :min="6"
                        :max="12"
                        :precision="1"
                        style="width: 100%"
                      />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="加班费率">
                      <el-input-number 
                        v-model="productionConfig.overtimeRate" 
                        :disabled="!editMode"
                        :min="1"
                        :max="3"
                        :precision="1"
                        style="width: 100%"
                      />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="休息时间(分钟)">
                      <el-input-number 
                        v-model="productionConfig.breakTime" 
                        :disabled="!editMode"
                        :min="30"
                        :max="120"
                        style="width: 100%"
                      />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="迟到容忍(分钟)">
                      <el-input-number 
                        v-model="productionConfig.lateTolerance" 
                        :disabled="!editMode"
                        :min="0"
                        :max="30"
                        style="width: 100%"
                      />
                    </el-form-item>
                  </el-col>
                </el-row>
              </el-form>
            </div>

            <div class="config-group">
              <h3 class="group-title">质量管控</h3>
              <el-form :model="productionConfig" label-width="150px" class="config-form">
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="默认AQL水平">
                      <el-select 
                        v-model="productionConfig.defaultAQL" 
                        :disabled="!editMode"
                        style="width: 100%"
                      >
                        <el-option label="AQL 0.4" value="0.4" />
                        <el-option label="AQL 0.65" value="0.65" />
                        <el-option label="AQL 1.0" value="1.0" />
                        <el-option label="AQL 1.5" value="1.5" />
                        <el-option label="AQL 2.5" value="2.5" />
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="不良率警戒线(%)">
                      <el-input-number 
                        v-model="productionConfig.defectRateThreshold" 
                        :disabled="!editMode"
                        :min="0.1"
                        :max="10"
                        :precision="1"
                        style="width: 100%"
                      />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="启用首件检验">
                      <el-switch 
                        v-model="productionConfig.enableFirstArticle" 
                        :disabled="!editMode"
                      />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="启用巡检">
                      <el-switch 
                        v-model="productionConfig.enablePatrolInspection" 
                        :disabled="!editMode"
                      />
                    </el-form-item>
                  </el-col>
                </el-row>
              </el-form>
            </div>
          </div>
        </el-tab-pane>

        <!-- Factory Calendar -->
        <el-tab-pane label="工厂日历" name="calendar">
          <div class="tab-content">
            <div class="calendar-toolbar">
              <div class="toolbar-left">
                <el-button type="primary" :icon="Plus" @click="addHoliday" :disabled="!editMode">
                  添加假期
                </el-button>
                <el-button :icon="Download" @click="exportCalendar">
                  导出日历
                </el-button>
              </div>
              <div class="toolbar-right">
                <el-date-picker
                  v-model="calendarYear"
                  type="year"
                  placeholder="选择年份"
                  @change="loadCalendar"
                />
              </div>
            </div>

            <div class="calendar-container">
              <el-calendar v-model="calendarDate" class="factory-calendar">
                <template #date-cell="{ data }">
                  <div class="calendar-cell" :class="getCellClass(data)">
                    <div class="date-number">{{ data.day.split('-').pop() }}</div>
                    <div class="date-info" v-if="getDateInfo(data.day)">
                      {{ getDateInfo(data.day) }}
                    </div>
                  </div>
                </template>
              </el-calendar>
            </div>

            <!-- Holiday List -->
            <div class="holiday-list">
              <h3>假期列表</h3>
              <el-table :data="holidays" stripe border>
                <el-table-column prop="name" label="假期名称" />
                <el-table-column prop="date" label="日期" width="120" />
                <el-table-column prop="type" label="类型" width="100">
                  <template #default="{ row }">
                    <el-tag :type="row.type === 'legal' ? 'success' : 'warning'">
                      {{ row.type === 'legal' ? '法定假日' : '调休' }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="remark" label="备注" />
                <el-table-column label="操作" width="120" v-if="editMode">
                  <template #default="{ row }">
                    <el-button 
                      type="danger" 
                      size="small" 
                      :icon="Delete"
                      @click="deleteHoliday(row)"
                    >
                      删除
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
        </el-tab-pane>

        <!-- Notification Settings -->
        <el-tab-pane label="通知设置" name="notification">
          <div class="tab-content">
            <div class="config-group">
              <h3 class="group-title">系统通知</h3>
              <el-form :model="notificationConfig" label-width="150px" class="config-form">
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="启用邮件通知">
                      <el-switch 
                        v-model="notificationConfig.enableEmail" 
                        :disabled="!editMode"
                      />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="启用短信通知">
                      <el-switch 
                        v-model="notificationConfig.enableSMS" 
                        :disabled="!editMode"
                      />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="启用站内消息">
                      <el-switch 
                        v-model="notificationConfig.enableInApp" 
                        :disabled="!editMode"
                      />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="启用微信通知">
                      <el-switch 
                        v-model="notificationConfig.enableWechat" 
                        :disabled="!editMode"
                      />
                    </el-form-item>
                  </el-col>
                </el-row>
              </el-form>
            </div>

            <div class="config-group">
              <h3 class="group-title">报警设置</h3>
              <el-form :model="notificationConfig" label-width="150px" class="config-form">
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="设备故障报警">
                      <el-switch 
                        v-model="notificationConfig.equipmentAlarm" 
                        :disabled="!editMode"
                      />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="质量异常报警">
                      <el-switch 
                        v-model="notificationConfig.qualityAlarm" 
                        :disabled="!editMode"
                      />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="库存不足报警">
                      <el-switch 
                        v-model="notificationConfig.inventoryAlarm" 
                        :disabled="!editMode"
                      />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="生产异常报警">
                      <el-switch 
                        v-model="notificationConfig.productionAlarm" 
                        :disabled="!editMode"
                      />
                    </el-form-item>
                  </el-col>
                </el-row>
              </el-form>
            </div>

            <div class="config-group">
              <h3 class="group-title">报警接收人</h3>
              <el-table :data="alarmReceivers" stripe border max-height="300">
                <el-table-column prop="name" label="姓名" />
                <el-table-column prop="department" label="部门" />
                <el-table-column prop="phone" label="手机号" />
                <el-table-column prop="email" label="邮箱" />
                <el-table-column label="报警类型" width="200">
                  <template #default="{ row }">
                    <el-tag v-for="type in row.alarmTypes" :key="type" size="small" style="margin-right: 4px;">
                      {{ type }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="120" v-if="editMode">
                  <template #default="{ row }">
                    <el-button 
                      type="primary" 
                      size="small" 
                      :icon="Edit"
                      @click="editReceiver(row)"
                    >
                      编辑
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- Add Holiday Dialog -->
    <el-dialog
      v-model="showHolidayDialog"
      title="添加假期"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="holidayFormRef"
        :model="holidayForm"
        :rules="holidayRules"
        label-width="100px"
      >
        <el-form-item label="假期名称" prop="name">
          <el-input v-model="holidayForm.name" placeholder="输入假期名称" />
        </el-form-item>
        <el-form-item label="日期" prop="date">
          <el-date-picker
            v-model="holidayForm.date"
            type="date"
            placeholder="选择日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select v-model="holidayForm.type" placeholder="选择类型" style="width: 100%">
            <el-option label="法定假日" value="legal" />
            <el-option label="调休" value="compensatory" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="holidayForm.remark"
            type="textarea"
            :rows="3"
            placeholder="输入备注信息"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showHolidayDialog = false">取消</el-button>
        <el-button type="primary" @click="submitHoliday" :loading="submitting">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import {
  Setting, Edit, Check, Close, Refresh, Plus, Download, Delete
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import dayjs from 'dayjs'

// Interfaces
interface Holiday {
  id: string
  name: string
  date: string
  type: 'legal' | 'compensatory'
  remark?: string
}

interface AlarmReceiver {
  id: string
  name: string
  department: string
  phone: string
  email: string
  alarmTypes: string[]
}

// Reactive data
const loading = ref(false)
const saving = ref(false)
const submitting = ref(false)
const editMode = ref(false)
const activeTab = ref('basic')
const showHolidayDialog = ref(false)

const calendarDate = ref(new Date())
const calendarYear = ref(new Date().getFullYear())

// Configuration objects
const basicConfig = reactive({
  systemName: '志友ERP系统',
  companyName: '志友制造有限公司',
  version: 'v2.1.0',
  timezone: 'Asia/Shanghai',
  language: 'zh-CN',
  defaultTheme: 'light',
  sessionTimeout: 120,
  minPasswordLength: 8,
  enableCaptcha: true,
  enableAuditLog: true
})

const productionConfig = reactive({
  standardWorkHours: 8.0,
  overtimeRate: 1.5,
  breakTime: 60,
  lateTolerance: 10,
  defaultAQL: '1.0',
  defectRateThreshold: 2.0,
  enableFirstArticle: true,
  enablePatrolInspection: true
})

const notificationConfig = reactive({
  enableEmail: true,
  enableSMS: false,
  enableInApp: true,
  enableWechat: true,
  equipmentAlarm: true,
  qualityAlarm: true,
  inventoryAlarm: true,
  productionAlarm: true
})

const holidayForm = reactive({
  name: '',
  date: '',
  type: 'legal',
  remark: ''
})

const holidayFormRef = ref<FormInstance>()

const holidayRules: FormRules = {
  name: [{ required: true, message: '请输入假期名称', trigger: 'blur' }],
  date: [{ required: true, message: '请选择日期', trigger: 'change' }],
  type: [{ required: true, message: '请选择类型', trigger: 'change' }]
}

// Mock data
const holidays = ref<Holiday[]>([
  {
    id: 'H001',
    name: '元旦',
    date: '2025-01-01',
    type: 'legal',
    remark: '新年第一天'
  },
  {
    id: 'H002',
    name: '春节',
    date: '2025-01-29',
    type: 'legal',
    remark: '农历新年'
  },
  {
    id: 'H003',
    name: '清明节',
    date: '2025-04-05',
    type: 'legal',
    remark: '扫墓祭祖'
  },
  {
    id: 'H004',
    name: '劳动节',
    date: '2025-05-01',
    type: 'legal',
    remark: '国际劳动节'
  },
  {
    id: 'H005',
    name: '端午节',
    date: '2025-05-31',
    type: 'legal',
    remark: '纪念屈原'
  },
  {
    id: 'H006',
    name: '中秋节',
    date: '2025-10-06',
    type: 'legal',
    remark: '团圆节'
  },
  {
    id: 'H007',
    name: '国庆节',
    date: '2025-10-01',
    type: 'legal',
    remark: '国庆黄金周'
  }
])

const alarmReceivers = ref<AlarmReceiver[]>([
  {
    id: 'R001',
    name: '张主管',
    department: '生产部',
    phone: '13800138001',
    email: 'zhang@company.com',
    alarmTypes: ['设备故障', '生产异常']
  },
  {
    id: 'R002',
    name: '李经理',
    department: '品质部',
    phone: '13800138002',
    email: 'li@company.com',
    alarmTypes: ['质量异常']
  },
  {
    id: 'R003',
    name: '王总监',
    department: '仓储部',
    phone: '13800138003',
    email: 'wang@company.com',
    alarmTypes: ['库存不足']
  }
])

// Original configs for cancel operation
let originalConfigs: any = {}

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

const enterEditMode = () => {
  editMode.value = true
  // Save original configs for cancel operation
  originalConfigs = {
    basic: { ...basicConfig },
    production: { ...productionConfig },
    notification: { ...notificationConfig }
  }
}

const cancelEdit = () => {
  editMode.value = false
  // Restore original configs
  Object.assign(basicConfig, originalConfigs.basic)
  Object.assign(productionConfig, originalConfigs.production)
  Object.assign(notificationConfig, originalConfigs.notification)
}

const saveChanges = async () => {
  saving.value = true
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    editMode.value = false
    ElMessage.success('配置保存成功')
  } catch (error) {
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

const loadCalendar = () => {
  // Load calendar data for the selected year
  console.log('Loading calendar for year:', calendarYear.value)
}

const getCellClass = (data: any) => {
  const date = data.day
  const isWeekend = data.date.getDay() === 0 || data.date.getDay() === 6
  const isHoliday = holidays.value.some(h => h.date === date)
  const isToday = date === dayjs().format('YYYY-MM-DD')
  
  return {
    'weekend': isWeekend,
    'holiday': isHoliday,
    'today': isToday
  }
}

const getDateInfo = (date: string) => {
  const holiday = holidays.value.find(h => h.date === date)
  return holiday?.name || ''
}

const addHoliday = () => {
  showHolidayDialog.value = true
  resetHolidayForm()
}

const resetHolidayForm = () => {
  Object.assign(holidayForm, {
    name: '',
    date: '',
    type: 'legal',
    remark: ''
  })
  holidayFormRef.value?.resetFields()
}

const submitHoliday = async () => {
  if (!holidayFormRef.value) return
  
  try {
    await holidayFormRef.value.validate()
    submitting.value = true
    
    // Check for duplicate dates
    const exists = holidays.value.some(h => h.date === holidayForm.date)
    if (exists) {
      ElMessage.warning('该日期已存在假期安排')
      return
    }
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const newHoliday: Holiday = {
      id: `H${Date.now()}`,
      name: holidayForm.name,
      date: holidayForm.date,
      type: holidayForm.type as 'legal' | 'compensatory',
      remark: holidayForm.remark
    }
    
    holidays.value.push(newHoliday)
    holidays.value.sort((a, b) => a.date.localeCompare(b.date))
    
    showHolidayDialog.value = false
    ElMessage.success('假期添加成功')
  } catch (error) {
    console.error('添加假期失败:', error)
  } finally {
    submitting.value = false
  }
}

const deleteHoliday = async (holiday: Holiday) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除假期"${holiday.name}"吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const index = holidays.value.findIndex(h => h.id === holiday.id)
    if (index > -1) {
      holidays.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
  } catch {
    // User cancelled
  }
}

const editReceiver = (receiver: AlarmReceiver) => {
  ElMessage.info('编辑报警接收人功能开发中...')
}

const exportCalendar = () => {
  ElMessage.success('导出日历功能开发中...')
}

// Lifecycle
onMounted(() => {
  refreshData()
})
</script>

<style scoped lang="scss">
.system-param {
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

  .config-section {
    background: var(--el-bg-color);
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

    :deep(.el-tabs__content) {
      padding: 0;
    }

    .tab-content {
      padding: 20px;

      .config-group {
        margin-bottom: 30px;

        .group-title {
          font-size: 16px;
          font-weight: 600;
          color: var(--el-text-color-primary);
          margin: 0 0 20px 0;
          padding-bottom: 10px;
          border-bottom: 2px solid var(--el-color-primary);
        }

        .config-form {
          .el-form-item {
            margin-bottom: 20px;
          }
        }
      }

      .calendar-toolbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        padding: 15px;
        background: var(--el-bg-color-overlay);
        border-radius: 6px;

        .toolbar-left {
          display: flex;
          gap: 12px;
        }
      }

      .calendar-container {
        margin-bottom: 30px;

        .factory-calendar {
          :deep(.el-calendar__body) {
            padding: 12px;
          }

          .calendar-cell {
            height: 80px;
            padding: 4px;
            position: relative;
            border-radius: 4px;
            transition: all 0.2s ease;

            &.weekend {
              background: rgba(255, 165, 0, 0.1);
            }

            &.holiday {
              background: rgba(255, 0, 0, 0.1);
              color: #ff4757;
            }

            &.today {
              background: var(--el-color-primary);
              color: white;
              
              .date-number {
                color: white;
              }
            }

            .date-number {
              font-size: 16px;
              font-weight: 600;
              color: var(--el-text-color-primary);
            }

            .date-info {
              font-size: 12px;
              color: var(--el-text-color-secondary);
              margin-top: 4px;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }
          }
        }
      }

      .holiday-list {
        h3 {
          font-size: 16px;
          font-weight: 600;
          color: var(--el-text-color-primary);
          margin: 0 0 15px 0;
        }
      }
    }
  }
}

// Factory theme enhancements
[data-theme="factory"] {
  .system-param {
    .page-header {
      background: rgba(0, 27, 46, 0.6);
      border: 1px solid rgba(0, 216, 255, 0.3);
      box-shadow: 0 0 20px rgba(0, 216, 255, 0.1);

      .page-title {
        color: #00D8FF;
        text-shadow: 0 0 10px rgba(0, 216, 255, 0.5);
      }
    }

    .config-section {
      background: rgba(0, 27, 46, 0.6);
      border: 1px solid rgba(0, 216, 255, 0.2);
      box-shadow: 0 0 15px rgba(0, 216, 255, 0.1);

      .config-group {
        .group-title {
          color: #00D8FF;
          border-bottom-color: #00D8FF;
          text-shadow: 0 0 8px rgba(0, 216, 255, 0.5);
        }
      }

      .calendar-toolbar {
        background: rgba(0, 27, 46, 0.8);
        border: 1px solid rgba(0, 216, 255, 0.3);
      }

      .factory-calendar {
        .calendar-cell {
          &.today {
            background: linear-gradient(135deg, #00D8FF, #0099CC);
            box-shadow: 0 0 15px rgba(0, 216, 255, 0.5);
          }

          &.holiday {
            background: rgba(255, 71, 87, 0.2);
            border: 1px solid rgba(255, 71, 87, 0.5);
          }
        }
      }
    }
  }
}

// Dark theme
[data-theme="dark"] {
  .system-param {
    .page-header,
    .config-section {
      background: var(--el-bg-color-overlay);
      border: 1px solid var(--el-border-color-darker);
    }

    .calendar-toolbar {
      background: var(--el-bg-color);
      border: 1px solid var(--el-border-color);
    }
  }
}
</style> 