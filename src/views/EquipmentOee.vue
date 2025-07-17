<template>
  <div class="equipment-oee-page">
    <!-- 顶部筛选 -->
    <div class="filter-bar">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-select v-model="selectedEquipment" placeholder="选择设备" clearable filterable>
            <el-option
              v-for="equipment in equipmentList"
              :key="equipment.id"
              :label="`${equipment.code} - ${equipment.name}`"
              :value="equipment.id"
            />
          </el-select>
        </el-col>
        <el-col :span="6">
          <el-select v-model="selectedLine" placeholder="选择产线" clearable>
            <el-option
              v-for="line in productionLines"
              :key="line.id"
              :label="line.name"
              :value="line.id"
            />
          </el-select>
        </el-col>
        <el-col :span="8">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-col>
        <el-col :span="4">
          <el-button @click="handleQuery" type="primary" :icon="Search" style="width: 100%">
            查询
          </el-button>
        </el-col>
      </el-row>
    </div>

    <!-- OEE总览卡片 -->
    <div class="oee-overview">
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="oee-card oee-total">
            <div class="card-header">
              <h3>总体OEE</h3>
              <el-icon><TrendCharts /></el-icon>
            </div>
            <div class="card-content">
              <div class="oee-value">{{ (oeeData.availability * oeeData.performance * oeeData.quality).toFixed(1) }}%</div>
              <div class="oee-trend">
                <span :class="oeeData.trend > 0 ? 'trend-up' : 'trend-down'">
                  <el-icon><ArrowUp v-if="oeeData.trend > 0" /><ArrowDown v-else /></el-icon>
                  {{ Math.abs(oeeData.trend) }}%
                </span>
              </div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="oee-card availability">
            <div class="card-header">
              <h3>稼动率</h3>
              <el-icon><Clock /></el-icon>
            </div>
            <div class="card-content">
              <div class="oee-value">{{ oeeData.availability.toFixed(1) }}%</div>
              <div class="oee-detail">计划时间 vs 运行时间</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="oee-card performance">
            <div class="card-header">
              <h3>性能效率</h3>
              <el-icon><Odometer /></el-icon>
            </div>
            <div class="card-content">
              <div class="oee-value">{{ oeeData.performance.toFixed(1) }}%</div>
              <div class="oee-detail">理想产量 vs 实际产量</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="oee-card quality">
            <div class="card-header">
              <h3>质量效率</h3>
              <el-icon><Medal /></el-icon>
            </div>
            <div class="card-content">
              <div class="oee-value">{{ oeeData.quality.toFixed(1) }}%</div>
              <div class="oee-detail">合格品 vs 总产量</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 图表区域 -->
    <div class="charts-section">
      <el-row :gutter="20">
        <!-- OEE趋势图 -->
        <el-col :span="12">
          <div class="chart-card">
            <div class="chart-header">
              <h3>OEE趋势分析</h3>
              <el-button-group>
                <el-button @click="changeTimeRange('day')" :type="timeRange === 'day' ? 'primary' : 'default'" size="small">日</el-button>
                <el-button @click="changeTimeRange('week')" :type="timeRange === 'week' ? 'primary' : 'default'" size="small">周</el-button>
                <el-button @click="changeTimeRange('month')" :type="timeRange === 'month' ? 'primary' : 'default'" size="small">月</el-button>
              </el-button-group>
            </div>
            <div ref="oeeTrendChart" class="chart-container"></div>
          </div>
        </el-col>

        <!-- 损失分析 -->
        <el-col :span="12">
          <div class="chart-card">
            <div class="chart-header">
              <h3>损失时间分析</h3>
              <el-dropdown @command="handleLossCommand">
                <el-button size="small" :icon="More" />
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="export">导出数据</el-dropdown-item>
                    <el-dropdown-item command="detail">查看详情</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
            <div ref="lossAnalysisChart" class="chart-container"></div>
          </div>
        </el-col>
      </el-row>

      <el-row :gutter="20" style="margin-top: 20px">
        <!-- 设备状态时间轴 -->
        <el-col :span="24">
          <div class="chart-card">
            <div class="chart-header">
              <h3>设备状态时间轴</h3>
              <div class="legend">
                <span class="legend-item running"><span class="legend-color"></span>运行</span>
                <span class="legend-item downtime"><span class="legend-color"></span>停机</span>
                <span class="legend-item maintenance"><span class="legend-color"></span>维护</span>
                <span class="legend-item idle"><span class="legend-color"></span>待机</span>
              </div>
            </div>
            <div ref="timelineChart" class="chart-container timeline"></div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 详细数据表 -->
    <div class="data-table">
      <div class="table-header">
        <h3>OEE详细数据</h3>
        <div class="table-actions">
          <el-button @click="handleExport" :icon="Download">导出Excel</el-button>
          <el-button @click="handleRefresh" :icon="Refresh">刷新</el-button>
        </div>
      </div>
      
      <el-table
        :data="oeeDetailData"
        v-loading="loading"
        border
        stripe
        height="300"
      >
        <el-table-column prop="date" label="日期" width="120" />
        <el-table-column prop="shift" label="班次" width="80" />
        <el-table-column prop="equipment_name" label="设备" width="150" />
        <el-table-column prop="planned_time" label="计划时间(h)" width="100" align="center" />
        <el-table-column prop="running_time" label="运行时间(h)" width="100" align="center" />
        <el-table-column prop="downtime" label="停机时间(h)" width="100" align="center" />
        <el-table-column prop="planned_output" label="计划产量" width="100" align="center" />
        <el-table-column prop="actual_output" label="实际产量" width="100" align="center" />
        <el-table-column prop="good_output" label="合格产量" width="100" align="center" />
        <el-table-column prop="availability" label="稼动率(%)" width="100" align="center">
          <template #default="scope">
            <span :class="getPerformanceClass(scope.row.availability)">
              {{ scope.row.availability.toFixed(1) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="performance" label="性能效率(%)" width="110" align="center">
          <template #default="scope">
            <span :class="getPerformanceClass(scope.row.performance)">
              {{ scope.row.performance.toFixed(1) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="quality" label="质量效率(%)" width="110" align="center">
          <template #default="scope">
            <span :class="getPerformanceClass(scope.row.quality)">
              {{ scope.row.quality.toFixed(1) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="总体OEE(%)" width="100" align="center">
          <template #default="scope">
            <span :class="getPerformanceClass(scope.row.oee)" style="font-weight: bold;">
              {{ scope.row.oee.toFixed(1) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="scope">
            <el-button @click="handleViewDetail(scope.row)" size="small" :icon="View">
              详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 详情弹窗 -->
    <el-dialog v-model="detailDialogVisible" :title="'OEE详细分析 - ' + selectedDetailData?.equipment_name" width="80%">
      <div v-if="selectedDetailData" class="detail-content">
        <!-- 基本信息 -->
        <el-descriptions :column="3" border>
          <el-descriptions-item label="设备名称">{{ selectedDetailData.equipment_name }}</el-descriptions-item>
          <el-descriptions-item label="日期">{{ selectedDetailData.date }}</el-descriptions-item>
          <el-descriptions-item label="班次">{{ selectedDetailData.shift }}</el-descriptions-item>
          <el-descriptions-item label="计划时间">{{ selectedDetailData.planned_time }}小时</el-descriptions-item>
          <el-descriptions-item label="运行时间">{{ selectedDetailData.running_time }}小时</el-descriptions-item>
          <el-descriptions-item label="停机时间">{{ selectedDetailData.downtime }}小时</el-descriptions-item>
        </el-descriptions>

        <!-- 停机原因分析 -->
        <div class="downtime-analysis" style="margin-top: 20px">
          <h4>停机原因分析</h4>
          <div ref="downtimeChart" class="detail-chart"></div>
        </div>

        <!-- 产量分析 -->
        <div class="output-analysis" style="margin-top: 20px">
          <h4>产量分析</h4>
          <el-row :gutter="20">
            <el-col :span="8">
              <div class="metric-item">
                <div class="metric-label">计划产量</div>
                <div class="metric-value">{{ selectedDetailData.planned_output }}</div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="metric-item">
                <div class="metric-label">实际产量</div>
                <div class="metric-value">{{ selectedDetailData.actual_output }}</div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="metric-item">
                <div class="metric-label">合格产量</div>
                <div class="metric-value">{{ selectedDetailData.good_output }}</div>
              </div>
            </el-col>
          </el-row>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import {
  Search, TrendCharts, Clock, Odometer, Medal, ArrowUp, ArrowDown,
  More, Download, Refresh, View
} from '@element-plus/icons-vue'

// 响应式数据
const loading = ref(false)
const selectedEquipment = ref('')
const selectedLine = ref('')
const dateRange = ref<string[]>([])
const timeRange = ref('day')
const detailDialogVisible = ref(false)
const selectedDetailData = ref<any>(null)

// 图表实例
const oeeTrendChart = ref()
const lossAnalysisChart = ref()
const timelineChart = ref()
const downtimeChart = ref()
let oeeTrendChartInstance: echarts.ECharts | null = null
let lossAnalysisChartInstance: echarts.ECharts | null = null
let timelineChartInstance: echarts.ECharts | null = null
let downtimeChartInstance: echarts.ECharts | null = null

// 设备列表
const equipmentList = ref([
  { id: 'EQ001', code: 'CNC-001', name: 'CNC加工中心1号' },
  { id: 'EQ002', code: 'CNC-002', name: 'CNC加工中心2号' },
  { id: 'EQ003', code: 'PRESS-001', name: '冲压机1号' }
])

// 产线列表
const productionLines = ref([
  { id: 'LINE001', name: '生产线1' },
  { id: 'LINE002', name: '生产线2' },
  { id: 'LINE003', name: '生产线3' }
])

// OEE数据
const oeeData = reactive({
  availability: 85.2,
  performance: 92.8,
  quality: 96.5,
  trend: 2.3
})

// OEE详细数据
const oeeDetailData = ref([
  {
    date: '2024-01-15',
    shift: '白班',
    equipment_name: 'CNC加工中心1号',
    planned_time: 8,
    running_time: 6.8,
    downtime: 1.2,
    planned_output: 100,
    actual_output: 93,
    good_output: 89,
    availability: 85.0,
    performance: 92.1,
    quality: 95.7,
    oee: 75.1
  },
  {
    date: '2024-01-15',
    shift: '夜班',
    equipment_name: 'CNC加工中心1号',
    planned_time: 8,
    running_time: 7.2,
    downtime: 0.8,
    planned_output: 100,
    actual_output: 96,
    good_output: 94,
    availability: 90.0,
    performance: 96.0,
    quality: 97.9,
    oee: 84.6
  }
])

// 方法
const getPerformanceClass = (value: number) => {
  if (value >= 90) return 'performance-excellent'
  if (value >= 80) return 'performance-good'
  if (value >= 70) return 'performance-fair'
  return 'performance-poor'
}

const handleQuery = () => {
  loading.value = true
  // 模拟API调用
  setTimeout(() => {
    loading.value = false
    ElMessage.success('数据已更新')
    initCharts()
  }, 1000)
}

const changeTimeRange = (range: string) => {
  timeRange.value = range
  initOeeTrendChart()
}

const handleLossCommand = (command: string) => {
  switch (command) {
    case 'export':
      ElMessage.success('导出功能开发中...')
      break
    case 'detail':
      ElMessage.info('详情功能开发中...')
      break
  }
}

const handleExport = () => {
  ElMessage.success('导出功能开发中...')
}

const handleRefresh = () => {
  handleQuery()
}

const handleViewDetail = (row: any) => {
  selectedDetailData.value = row
  detailDialogVisible.value = true
  nextTick(() => {
    initDowntimeChart()
  })
}

// 初始化图表
const initCharts = () => {
  nextTick(() => {
    initOeeTrendChart()
    initLossAnalysisChart()
    initTimelineChart()
  })
}

const initOeeTrendChart = () => {
  if (oeeTrendChartInstance) {
    oeeTrendChartInstance.dispose()
  }
  
  oeeTrendChartInstance = echarts.init(oeeTrendChart.value)
  
  const option = {
    title: {
      text: 'OEE三要素趋势',
      left: 'center',
      textStyle: { fontSize: 14 }
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['稼动率', '性能效率', '质量效率', '总体OEE'],
      bottom: 0
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['1/10', '1/11', '1/12', '1/13', '1/14', '1/15', '1/16']
    },
    yAxis: {
      type: 'value',
      max: 100,
      axisLabel: {
        formatter: '{value}%'
      }
    },
    series: [
      {
        name: '稼动率',
        type: 'line',
        data: [82, 85, 78, 88, 85, 90, 87],
        itemStyle: { color: '#5470c6' }
      },
      {
        name: '性能效率',
        type: 'line',
        data: [88, 92, 85, 95, 92, 96, 94],
        itemStyle: { color: '#91cc75' }
      },
      {
        name: '质量效率',
        type: 'line',
        data: [95, 97, 94, 98, 96, 99, 97],
        itemStyle: { color: '#fac858' }
      },
      {
        name: '总体OEE',
        type: 'line',
        data: [74, 76, 70, 82, 78, 85, 80],
        itemStyle: { color: '#ee6666' },
        lineStyle: { width: 3 }
      }
    ]
  }
  
  oeeTrendChartInstance.setOption(option)
}

const initLossAnalysisChart = () => {
  if (lossAnalysisChartInstance) {
    lossAnalysisChartInstance.dispose()
  }
  
  lossAnalysisChartInstance = echarts.init(lossAnalysisChart.value)
  
  const option = {
    title: {
      text: '损失时间分布',
      left: 'center',
      textStyle: { fontSize: 14 }
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c}小时 ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      data: ['设备故障', '换模调试', '物料等待', '质量问题', '计划停机']
    },
    series: [
      {
        name: '损失时间',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: [
          { value: 2.5, name: '设备故障', itemStyle: { color: '#ff6b6b' } },
          { value: 1.8, name: '换模调试', itemStyle: { color: '#4ecdc4' } },
          { value: 1.2, name: '物料等待', itemStyle: { color: '#45b7d1' } },
          { value: 0.8, name: '质量问题', itemStyle: { color: '#f9ca24' } },
          { value: 0.7, name: '计划停机', itemStyle: { color: '#6c5ce7' } }
        ]
      }
    ]
  }
  
  lossAnalysisChartInstance.setOption(option)
}

const initTimelineChart = () => {
  if (timelineChartInstance) {
    timelineChartInstance.dispose()
  }
  
  timelineChartInstance = echarts.init(timelineChart.value)
  
  const option = {
    title: {
      text: '今日设备状态时间轴',
      left: 'center',
      textStyle: { fontSize: 14 }
    },
    tooltip: {
      formatter: (params: any) => {
        const start = new Date(params.data.value[0]).toLocaleTimeString()
        const end = new Date(params.data.value[1]).toLocaleTimeString()
        return `${params.data.name}<br/>时间: ${start} - ${end}<br/>状态: ${params.seriesName}`
      }
    },
    grid: {
      left: '10%',
      right: '10%',
      top: '15%',
      bottom: '10%'
    },
    xAxis: {
      type: 'time',
      min: new Date().setHours(0, 0, 0, 0),
      max: new Date().setHours(23, 59, 59, 999),
      axisLabel: {
        formatter: (value: number) => {
          return new Date(value).toLocaleTimeString('zh-CN', { hour12: false }).slice(0, 5)
        }
      }
    },
    yAxis: {
      type: 'category',
      data: ['CNC-001', 'CNC-002', 'PRESS-001'],
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        margin: 20
      }
    },
    series: [
      {
        name: '运行',
        type: 'custom',
        renderItem: (params: any, api: any) => {
          const categoryIndex = api.value(2)
          const start = api.coord([api.value(0), categoryIndex])
          const end = api.coord([api.value(1), categoryIndex])
          const height = api.size([0, 1])[1] * 0.6
          
          return {
            type: 'rect',
            shape: {
              x: start[0],
              y: start[1] - height / 2,
              width: end[0] - start[0],
              height: height
            },
            style: {
              fill: '#67c23a'
            }
          }
        },
        data: [
          { value: [new Date().setHours(8, 0, 0, 0), new Date().setHours(10, 30, 0, 0), 0], name: 'CNC-001运行' },
          { value: [new Date().setHours(11, 0, 0, 0), new Date().setHours(16, 0, 0, 0), 0], name: 'CNC-001运行' },
          { value: [new Date().setHours(8, 30, 0, 0), new Date().setHours(15, 45, 0, 0), 1], name: 'CNC-002运行' }
        ]
      },
      {
        name: '停机',
        type: 'custom',
        renderItem: (params: any, api: any) => {
          const categoryIndex = api.value(2)
          const start = api.coord([api.value(0), categoryIndex])
          const end = api.coord([api.value(1), categoryIndex])
          const height = api.size([0, 1])[1] * 0.6
          
          return {
            type: 'rect',
            shape: {
              x: start[0],
              y: start[1] - height / 2,
              width: end[0] - start[0],
              height: height
            },
            style: {
              fill: '#f56c6c'
            }
          }
        },
        data: [
          { value: [new Date().setHours(10, 30, 0, 0), new Date().setHours(11, 0, 0, 0), 0], name: 'CNC-001故障' },
          { value: [new Date().setHours(15, 45, 0, 0), new Date().setHours(16, 30, 0, 0), 1], name: 'CNC-002维护' }
        ]
      }
    ]
  }
  
  timelineChartInstance.setOption(option)
}

const initDowntimeChart = () => {
  if (downtimeChartInstance) {
    downtimeChartInstance.dispose()
  }
  
  downtimeChartInstance = echarts.init(downtimeChart.value)
  
  const option = {
    title: {
      text: '停机原因分析',
      left: 'center',
      textStyle: { fontSize: 14 }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'value'
    },
    yAxis: {
      type: 'category',
      data: ['设备故障', '换模调试', '物料等待', '质量问题', '计划维护']
    },
    series: [
      {
        name: '停机时间',
        type: 'bar',
        data: [45, 25, 18, 12, 8],
        itemStyle: {
          color: (params: any) => {
            const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7']
            return colors[params.dataIndex]
          }
        },
        label: {
          show: true,
          position: 'right',
          formatter: '{c}分钟'
        }
      }
    ]
  }
  
  downtimeChartInstance.setOption(option)
}

// 生命周期
onMounted(() => {
  initCharts()
  
  // 监听窗口大小变化
  window.addEventListener('resize', () => {
    oeeTrendChartInstance?.resize()
    lossAnalysisChartInstance?.resize()
    timelineChartInstance?.resize()
    downtimeChartInstance?.resize()
  })
})
</script>

<style scoped lang="scss">
.equipment-oee-page {
  padding: 20px;
  background: var(--el-bg-color-page);
  min-height: 100vh;

  .filter-bar {
    background: white;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .oee-overview {
    margin-bottom: 20px;

    .oee-card {
      background: white;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      transition: transform 0.2s;

      &:hover {
        transform: translateY(-2px);
      }

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;

        h3 {
          margin: 0;
          font-size: 16px;
          color: var(--el-text-color-primary);
        }

        .el-icon {
          font-size: 24px;
        }
      }

      .card-content {
        .oee-value {
          font-size: 32px;
          font-weight: bold;
          margin-bottom: 8px;
        }

        .oee-detail {
          color: var(--el-text-color-regular);
          font-size: 12px;
        }

        .oee-trend {
          .trend-up {
            color: #67c23a;
          }
          .trend-down {
            color: #f56c6c;
          }
        }
      }

      &.oee-total {
        .card-header .el-icon {
          color: #409eff;
        }
        .oee-value {
          color: #409eff;
        }
      }

      &.availability {
        .card-header .el-icon {
          color: #67c23a;
        }
        .oee-value {
          color: #67c23a;
        }
      }

      &.performance {
        .card-header .el-icon {
          color: #e6a23c;
        }
        .oee-value {
          color: #e6a23c;
        }
      }

      &.quality {
        .card-header .el-icon {
          color: #f56c6c;
        }
        .oee-value {
          color: #f56c6c;
        }
      }
    }
  }

  .charts-section {
    margin-bottom: 20px;

    .chart-card {
      background: white;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

      .chart-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;

        h3 {
          margin: 0;
          font-size: 16px;
          color: var(--el-text-color-primary);
        }

        .legend {
          display: flex;
          gap: 15px;

          .legend-item {
            display: flex;
            align-items: center;
            font-size: 12px;

            .legend-color {
              width: 12px;
              height: 12px;
              border-radius: 2px;
              margin-right: 5px;
            }

            &.running .legend-color {
              background: #67c23a;
            }
            &.downtime .legend-color {
              background: #f56c6c;
            }
            &.maintenance .legend-color {
              background: #e6a23c;
            }
            &.idle .legend-color {
              background: #909399;
            }
          }
        }
      }

      .chart-container {
        height: 300px;

        &.timeline {
          height: 200px;
        }
      }
    }
  }

  .data-table {
    background: white;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;

      h3 {
        margin: 0;
        font-size: 16px;
        color: var(--el-text-color-primary);
      }

      .table-actions {
        display: flex;
        gap: 10px;
      }
    }
  }

  .detail-content {
    .detail-chart {
      height: 300px;
    }

    .metric-item {
      text-align: center;
      padding: 15px;
      background: var(--el-bg-color-soft);
      border-radius: 8px;

      .metric-label {
        font-size: 14px;
        color: var(--el-text-color-regular);
        margin-bottom: 8px;
      }

      .metric-value {
        font-size: 24px;
        font-weight: bold;
        color: var(--el-text-color-primary);
      }
    }
  }

  :deep(.performance-excellent) {
    color: #67c23a;
  }

  :deep(.performance-good) {
    color: #409eff;
  }

  :deep(.performance-fair) {
    color: #e6a23c;
  }

  :deep(.performance-poor) {
    color: #f56c6c;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .equipment-oee-page {
    padding: 10px;

    .oee-overview {
      :deep(.el-col) {
        margin-bottom: 15px;
      }
    }

    .charts-section {
      :deep(.el-col) {
        margin-bottom: 15px;
      }
    }
  }
}
</style> 