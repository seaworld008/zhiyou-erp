<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <h1 class="dashboard-title">📊 生产管控中心</h1>
      <div class="dashboard-date">{{ currentDate }}</div>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="16" class="stats-row">
      <el-col :xs="12" :sm="8" :md="4">
        <div class="stat-card">
          <div class="stat-trend positive">5.2%</div>
          <div class="stat-label">今日产量</div>
          <div class="stat-value">2.9k <span class="stat-unit">PCS</span></div>
        </div>
      </el-col>

      <el-col :xs="12" :sm="8" :md="4">
        <div class="stat-card">
          <div class="stat-trend positive">12.5%</div>
          <div class="stat-label">工单数量</div>
          <div class="stat-value">68 <span class="stat-unit">单</span></div>
        </div>
      </el-col>

      <el-col :xs="12" :sm="8" :md="4">
        <div class="stat-card">
          <div class="stat-trend positive">2.1%</div>
          <div class="stat-label">达成率</div>
          <div class="stat-value">98.5 <span class="stat-unit">%</span></div>
        </div>
      </el-col>

      <el-col :xs="12" :sm="8" :md="4">
        <div class="stat-card">
          <div class="stat-trend negative">0.5%</div>
          <div class="stat-label">不良率</div>
          <div class="stat-value">1.5 <span class="stat-unit">%</span></div>
        </div>
      </el-col>

      <el-col :xs="12" :sm="8" :md="4">
        <div class="stat-card">
          <div class="stat-trend positive">8.3%</div>
          <div class="stat-label">在制WIP</div>
          <div class="stat-value">1.2k <span class="stat-unit">件</span></div>
        </div>
      </el-col>

      <el-col :xs="12" :sm="8" :md="4">
        <div class="stat-card">
          <div class="stat-trend positive">15.7%</div>
          <div class="stat-label">出货金额</div>
          <div class="stat-value">28.5 <span class="stat-unit">万元</span></div>
        </div>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="16" class="charts-row">
      <el-col :xs="24" :md="12">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <div class="chart-header">
              <span>📊 每小时产量趋势</span>
              <span class="chart-subtitle">实时监控</span>
            </div>
          </template>
          <div class="chart-container">
            <div class="chart-placeholder">
              <div class="chart-bars">
                <div class="bar" style="height: 60%"><span>250</span></div>
                <div class="bar" style="height: 80%"><span>320</span></div>
                <div class="bar" style="height: 45%"><span>180</span></div>
                <div class="bar" style="height: 90%"><span>360</span></div>
                <div class="bar" style="height: 85%"><span>340</span></div>
                <div class="bar" style="height: 75%"><span>300</span></div>
                <div class="bar" style="height: 95%"><span>380</span></div>
                <div class="bar" style="height: 70%"><span>280</span></div>
                <div class="bar" style="height: 65%"><span>260</span></div>
                <div class="bar" style="height: 85%"><span>340</span></div>
              </div>
              <div class="chart-labels">
                <span>08:00</span>
                <span>09:00</span>
                <span>10:00</span>
                <span>11:00</span>
                <span>12:00</span>
                <span>13:00</span>
                <span>14:00</span>
                <span>15:00</span>
                <span>16:00</span>
                <span>17:00</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :md="12">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <div class="chart-header">
              <span>🍩 异常分布统计</span>
              <span class="chart-subtitle">数据分析</span>
            </div>
          </template>
          <div class="chart-container">
             <div class="pie-chart">
               <div class="pie-center">
                 <div class="pie-total">{{ totalExceptions }}</div>
                 <div class="pie-subtitle">总异常数</div>
               </div>
             </div>
             <div class="pie-legend">
               <div v-for="item in exceptionData" :key="item.name" class="legend-item">
                 <span class="legend-color" :style="{ background: item.color }"></span>
                 <span class="legend-text">{{ item.name }}</span>
                 <span class="legend-value">{{ item.count }}次 ({{ item.percentage }}%)</span>
               </div>
             </div>
           </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 动态信息区域 -->
    <el-row :gutter="16" class="dynamic-row">
      <el-col :xs="24" :md="12">
        <el-card shadow="hover" class="dynamic-card">
          <template #header>
            <div class="card-header">
              <span class="header-icon">📋</span>
              <span class="header-title">最近订单</span>
              <span class="header-badge">{{ recentOrders.length }}</span>
            </div>
          </template>
          <div class="order-list">
            <div v-for="order in recentOrders" :key="order.id" class="order-item">
              <div class="order-left">
                <div class="order-avatar">
                  <span>{{ order.customer.charAt(0) }}</span>
                </div>
                <div class="order-info">
                  <div class="order-title">{{ order.orderNo }}</div>
                  <div class="order-desc">{{ order.customer }} • ¥{{ formatNumber(order.amount) }}</div>
                </div>
              </div>
              <div class="order-right">
                <el-tag :type="getOrderStatusType(order.status)" size="small">
                  {{ getOrderStatusText(order.status) }}
                </el-tag>
                <div class="order-time">{{ order.time }}</div>
              </div>
            </div>
          </div>
          <div class="card-footer">
            <el-button type="primary" link size="small" @click="goToOrders">查看全部订单 →</el-button>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :md="12">
        <el-card shadow="hover" class="dynamic-card">
          <template #header>
            <div class="card-header">
              <span class="header-icon">✅</span>
              <span class="header-title">待办事项</span>
              <span class="header-badge urgent">{{ urgentTodos }}</span>
            </div>
          </template>
          <div class="todo-list">
            <div v-for="todo in todoList" :key="todo.id" class="todo-item">
              <div class="todo-left">
                <div class="todo-priority" :class="todo.priority">
                  <span v-if="todo.priority === 'high'">🔴</span>
                  <span v-else-if="todo.priority === 'medium'">🟡</span>
                  <span v-else>🟢</span>
                </div>
                <div class="todo-info">
                  <div class="todo-title">{{ todo.title }}</div>
                  <div class="todo-desc">{{ todo.description }}</div>
                </div>
              </div>
              <div class="todo-right">
                <el-button size="small" type="primary" @click="completeTodo(todo.id)">
                  完成
                </el-button>
                <div class="todo-deadline">{{ todo.deadline }}</div>
              </div>
            </div>
          </div>
          <div class="card-footer">
            <el-button type="primary" link size="small" @click="goToTasks">查看全部任务 →</el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'

const router = useRouter()

// 统计数据
const stats = ref([
  {
    title: '今日产量',
    value: '2.9k',
    unit: 'PCS',
    change: '+5.2%',
    trend: 'up',
    color: '#67C23A'
  },
  {
    title: '工单数量',
    value: '68',
    unit: '单',
    change: '+12.5%',
    trend: 'up',
    color: '#409EFF'
  },
  {
    title: '设备效率',
    value: '98.5',
    unit: '%',
    change: '+2.1%',
    trend: 'up',
    color: '#E6A23C'
  },
  {
    title: '不良率',
    value: '1.5',
    unit: '%',
    change: '-0.8%',
    trend: 'down',
    color: '#F56C6C'
  },
  {
    title: '在制WIP',
    value: '1.2k',
    unit: '件',
    change: '+8.3%',
    trend: 'up',
    color: '#909399'
  },
  {
    title: '出货数量',
    value: '28.5',
    unit: '万台',
    change: '+16.7%',
    trend: 'up',
    color: '#67C23A'
  }
])

// 当前日期
const currentDate = computed(() => {
  const now = new Date()
  return `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 星期${['日', '一', '二', '三', '四', '五', '六'][now.getDay()]} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
})

// 格式化数字
const formatNumber = (num) => {
  return num.toLocaleString()
}

// 最近订单数据
const recentOrders = ref([
  {
    id: 1,
    orderNo: 'PO-2024-001',
    customer: '华为技术有限公司',
    amount: 285000,
    status: 'processing',
    time: '2小时前'
  },
  {
    id: 2,
    orderNo: 'PO-2024-002',
    customer: '小米科技',
    amount: 156000,
    status: 'completed',
    time: '4小时前'
  },
  {
    id: 3,
    orderNo: 'PO-2024-003',
    customer: 'OPPO广东移动通信',
    amount: 198000,
    status: 'pending',
    time: '6小时前'
  },
  {
    id: 4,
    orderNo: 'PO-2024-004',
    customer: 'vivo通信科技',
    amount: 234000,
    status: 'processing',
    time: '8小时前'
  }
])

// 待办事项数据
const todoList = ref([
  {
    id: 1,
    title: '生产线设备维护',
    description: '对A线设备进行定期保养检查',
    priority: 'high',
    deadline: '今天 18:00'
  },
  {
    id: 2,
    title: '原材料采购审批',
    description: '审批本月原材料采购计划',
    priority: 'medium',
    deadline: '明天 10:00'
  },
  {
    id: 3,
    title: '质量报告提交',
    description: '提交本周质量检测报告',
    priority: 'high',
    deadline: '今天 17:00'
  },
  {
    id: 4,
    title: '员工培训安排',
    description: '安排新员工安全培训课程',
    priority: 'low',
    deadline: '后天 14:00'
  }
])

// 紧急待办数量
const urgentTodos = computed(() => {
  return todoList.value.filter(todo => todo.priority === 'high').length
})

// 获取订单状态类型
const getOrderStatusType = (status) => {
  const statusMap = {
    'pending': 'warning',
    'processing': 'primary',
    'completed': 'success',
    'cancelled': 'danger'
  }
  return statusMap[status] || 'info'
}

// 获取订单状态文本
const getOrderStatusText = (status) => {
  const statusMap = {
    'pending': '待处理',
    'processing': '进行中',
    'completed': '已完成',
    'cancelled': '已取消'
  }
  return statusMap[status] || '未知'
}

// 异常分布统计数据
 const exceptionData = ref([
   {
     name: '设备故障',
     count: 12,
     color: '#ff6b6b',
     percentage: 35.3
   },
   {
     name: '物料短缺',
     count: 8,
     color: '#4ecdc4',
     percentage: 23.5
   },
   {
     name: '人员调配',
     count: 6,
     color: '#45b7d1',
     percentage: 17.6
   },
   {
     name: '品质异常',
     count: 4,
     color: '#96ceb4',
     percentage: 11.8
   },
   {
     name: '其他原因',
     count: 3,
     color: '#feca57',
     percentage: 8.8
   },
   {
     name: '正常生产',
     count: 1,
     color: '#ff9ff3',
     percentage: 2.9
   }
 ])
 
 // 总异常数
 const totalExceptions = computed(() => {
   return exceptionData.value.reduce((total, item) => total + item.count, 0)
 })
 
 // 完成待办事项
 const completeTodo = (todoId) => {
   const index = todoList.value.findIndex(todo => todo.id === todoId)
   if (index !== -1) {
     todoList.value.splice(index, 1)
     ElMessage.success('任务已完成！')
   }
 }

 // 跳转到订单页面
 const goToOrders = () => {
   router.push('/production/orders')
 }

 // 跳转到任务页面
 const goToTasks = () => {
   // 由于系统中暂无专门的任务管理页面，跳转到消息中心
   router.push('/message/center')
   ElMessage.info('任务管理功能正在开发中，已为您跳转到消息中心')
 }
</script>

<style scoped>
.dashboard {
  padding: 20px;
  background: #f5f5f5;
  min-height: 100vh;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.dashboard-title {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  margin: 0;
}

.dashboard-date {
  color: #909399;
  font-size: 14px;
}

.stats-row {
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  position: relative;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.stat-trend {
  position: absolute;
  top: 12px;
  right: 12px;
  font-size: 12px;
  font-weight: 500;
  padding: 2px 6px;
  border-radius: 4px;
}

.stat-trend.positive {
  color: #67C23A;
  background: rgba(103, 194, 58, 0.1);
}

.stat-trend.negative {
  color: #F56C6C;
  background: rgba(245, 108, 108, 0.1);
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
  margin: 8px 0;
}

.stat-unit {
  font-size: 14px;
  color: #909399;
  font-weight: normal;
}

.charts-row {
  margin-bottom: 24px;
}

.chart-card {
   height: 450px;
 }

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-subtitle {
  font-size: 12px;
  color: #909399;
}

.chart-container {
   height: 370px;
   padding: 20px;
 }

.chart-placeholder {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.chart-bars {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  height: 240px;
  margin-bottom: 10px;
}

.bar {
  width: 8%;
  background: linear-gradient(to top, #409EFF, #79bbff);
  border-radius: 4px 4px 0 0;
  position: relative;
  min-height: 20px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.bar span {
  position: absolute;
  top: -20px;
  font-size: 12px;
  color: #606266;
  font-weight: 500;
}

.chart-labels {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #909399;
}

.pie-chart {
   width: 200px;
   height: 200px;
   border-radius: 50%;
   background: conic-gradient(
     #ff6b6b 0deg 127deg,
     #4ecdc4 127deg 212deg,
     #45b7d1 212deg 275deg,
     #96ceb4 275deg 318deg,
     #feca57 318deg 350deg,
     #ff9ff3 350deg 360deg
   );
   margin: 0 auto 20px;
   position: relative;
   display: flex;
   align-items: center;
   justify-content: center;
 }

.pie-chart::before {
  content: '';
  width: 120px;
  height: 120px;
  background: white;
  border-radius: 50%;
  position: absolute;
}

.pie-center {
  position: relative;
  z-index: 1;
  text-align: center;
}

.pie-total {
  font-size: 14px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 4px;
}

.pie-subtitle {
  font-size: 12px;
  color: #909399;
}

.pie-legend {
   display: grid;
   grid-template-columns: 1fr 1fr;
   gap: 8px;
   max-height: 200px;
   overflow-y: auto;
 }

.legend-item {
    display: flex;
    align-items: center;
    font-size: 12px;
    color: #606266;
    padding: 6px 8px;
    border-radius: 4px;
    transition: background-color 0.3s;
    margin-bottom: 2px;
  }
  
  .legend-item:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
  
  .legend-color {
    width: 12px;
    height: 12px;
    border-radius: 2px;
    margin-right: 8px;
    flex-shrink: 0;
  }
  
  .legend-text {
    flex: 1;
    margin-right: 6px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 12px;
  }
  
  .legend-value {
    flex-shrink: 0;
    font-weight: 600;
    color: #303133;
    font-size: 11px;
    white-space: nowrap;
  }

/* 响应式设计 */
@media (max-width: 768px) {
  .dashboard {
    padding: 10px;
  }

  .dashboard-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }

  .stat-card {
    padding: 16px;
  }

  .stat-value {
    font-size: 24px;
  }

  .chart-card {
    height: 350px;
  }

  .chart-container {
    padding: 10px;
  }

  .pie-chart {
    width: 160px;
    height: 160px;
  }

  .pie-chart::before {
    width: 100px;
    height: 100px;
  }
}

/* 动态信息区域样式 */
.dynamic-row {
  margin-bottom: 24px;
}

.dynamic-card {
  height: 400px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-icon {
  font-size: 16px;
}

.header-title {
  font-weight: 600;
  color: #303133;
}

.header-badge {
  background: #409EFF;
  color: white;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 10px;
  min-width: 20px;
  text-align: center;
}

.header-badge.urgent {
  background: #F56C6C;
}

.order-list,
.todo-list {
  max-height: 280px;
  overflow-y: auto;
}

.order-item,
.todo-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.order-item:last-child,
.todo-item:last-child {
  border-bottom: none;
}

.order-left,
.todo-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.order-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #409EFF, #79bbff);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 14px;
}

.todo-priority {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.order-info,
.todo-info {
  flex: 1;
}

.order-title,
.todo-title {
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
  font-size: 14px;
}

.order-desc,
.todo-desc {
  color: #909399;
  font-size: 12px;
}

.order-right,
.todo-right {
  text-align: right;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.order-time,
.todo-deadline {
  color: #C0C4CC;
  font-size: 11px;
}

.card-footer {
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
  text-align: center;
}

/* 响应式适配 */
@media (max-width: 768px) {
  .dynamic-card {
    height: auto;
    margin-bottom: 16px;
  }
  
  .order-list,
  .todo-list {
    max-height: 240px;
  }
  
  .order-item,
  .todo-item {
    padding: 10px 0;
  }
  
  .order-avatar {
    width: 32px;
    height: 32px;
    font-size: 12px;
  }
  
  .order-title,
  .todo-title {
    font-size: 13px;
  }
  
  .order-desc,
  .todo-desc {
    font-size: 11px;
  }
}
</style>