<template>
  <div class="sop-ack-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">✅ SOP接收确认</h1>
        <p class="page-subtitle">Standard Operating Procedures Acknowledgment</p>
      </div>
      <div class="header-right">
        <div class="header-actions">
          <el-button @click="refreshData" :loading="loading">
            <el-icon>
              <Refresh />
            </el-icon>
            刷新
          </el-button>
          <el-button type="primary" @click="ackAllUpdates" :disabled="!hasUpdates">
            <el-icon>
              <CircleCheck />
            </el-icon>
            全部确认
          </el-button>
        </div>
      </div>
    </div>

    <!-- 待接收提醒 -->
    <div v-if="hasUpdates" class="alert-section">
      <el-alert type="warning" show-icon closable>
        <template #default>
          您有 {{ pendingUpdates.length }} 个SOP需要重新接收确认，请及时处理！
        </template>
      </el-alert>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-section">
      <el-row :gutter="20">
        <el-col :span="6" :sm="12" :xs="24">
          <div class="stat-card industrial-card">
            <div class="stat-icon" style="color: #18a058;">
              <el-icon size="32">
                <CircleCheck />
              </el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ acknowledgedCount }}</div>
              <div class="stat-label">已确认</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6" :sm="12" :xs="24">
          <div class="stat-card industrial-card">
            <div class="stat-icon" style="color: #f0a020;">
              <el-icon size="32">
                <Clock />
              </el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ pendingUpdates.length }}</div>
              <div class="stat-label">待确认</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6" :sm="12" :xs="24">
          <div class="stat-card industrial-card">
            <div class="stat-icon" style="color: #2080f0;">
              <el-icon size="32">
                <Document />
              </el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ totalSops }}</div>
              <div class="stat-label">总SOP数</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6" :sm="12" :xs="24">
          <div class="stat-card industrial-card">
            <div class="stat-icon" style="color: #722ed1;">
              <el-icon size="32">
                <TrendCharts />
              </el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ ackRate }}%</div>
              <div class="stat-label">确认率</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 待确认SOP列表 -->
    <div v-if="hasUpdates" class="pending-section">
      <el-card shadow="never">
        <template #header>
          <span>📋 待确认SOP列表</span>
        </template>
        <div class="pending-list">
          <div 
            v-for="update in pendingUpdates" 
            :key="update.sop_id"
            class="pending-item"
          >
            <div class="pending-info">
              <h4 class="sop-title">{{ update.title }}</h4>
              <div class="sop-meta">
                <el-tag type="info" size="small">{{ update.sop_id }}</el-tag>
                <el-tag type="warning" size="small">
                  {{ update.user_version }} → {{ update.current_version }}
                </el-tag>
                <span class="update-time">
                  {{ new Date(update.updated_at).toLocaleString('zh-CN') }}
                </span>
              </div>
            </div>
            <div class="pending-actions">
              <div class="action-buttons">
                <el-button size="small" @click="viewSopDetail(update.sop_id)">
                  <el-icon>
                    <View />
                  </el-icon>
                  查看详情
                </el-button>
                <el-button 
                  type="primary" 
                  size="small" 
                  @click="acknowledgeSop(update.sop_id)"
                >
                  <el-icon>
                    <Check />
                  </el-icon>
                  确认接收
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 已确认SOP历史 -->
    <div class="history-section">
      <el-card shadow="never">
        <template #header>
          <span>📜 接收历史</span>
        </template>
        <el-table
          :data="ackHistory"
          v-loading="loading"
          size="small"
          stripe
        >
          <el-table-column prop="sop_id" label="SOP编号" width="120" />
          <el-table-column label="版本" width="80">
            <template #default="{ row }">
              <el-tag type="info" size="small">{{ row.version }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="station_id" label="工位" width="100" />
          <el-table-column label="确认时间" width="160">
            <template #default="{ row }">
              {{ new Date(row.ack_time).toLocaleString('zh-CN') }}
            </template>
          </el-table-column>
          <el-table-column label="状态" width="80">
            <template #default>
              <el-tag type="success" size="small">已确认</el-tag>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>

    <!-- SOP详情弹窗 -->
    <el-dialog 
      v-model="showSopDetail" 
      title="SOP详情"
      width="90%" 
      :close-on-click-modal="false"
    >
      <SopDetailModal 
        v-if="selectedSop" 
        :sop="selectedSop" 
        @close="showSopDetail = false"
        @edit="() => {}"
      />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  Refresh,
  CircleCheck,
  Clock,
  Document,
  TrendCharts,
  View,
  Check
} from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import { checkSopUpdates, getUserSopAcks, mockSops } from '@/mock/sop'
import type { Sop } from '@/types'
import SopDetailModal from '@/components/SopDetailModal.vue'

const authStore = useAuthStore()

// 响应式数据
const loading = ref(false)
const pendingUpdates = ref<any[]>([])
const ackHistory = ref<any[]>([])
const selectedSop = ref<Sop | null>(null)
const showSopDetail = ref(false)

// 计算属性
const hasUpdates = computed(() => pendingUpdates.value.length > 0)
const acknowledgedCount = computed(() => ackHistory.value.length)
const totalSops = computed(() => mockSops.filter(sop => sop.enabled).length)
const ackRate = computed(() => {
  if (totalSops.value === 0) return 0
  return Math.round((acknowledgedCount.value / totalSops.value) * 100)
})

// 事件处理
const refreshData = async () => {
  await loadData()
}

const loadData = async () => {
  loading.value = true
  try {
    // 模拟当前用户ID
    const userId = 'EMP001'
    
    // 检查待更新的SOP
    const updatesResponse = checkSopUpdates(userId)
    pendingUpdates.value = updatesResponse.data
    
    // 获取确认历史
    const historyResponse = getUserSopAcks(userId)
    ackHistory.value = historyResponse.data
    
  } catch (error) {
    ElMessage.error('加载数据失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

const acknowledgeSop = async (sopId: string) => {
  try {
    // 模拟确认接收
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 移除待确认列表中的项目
    const index = pendingUpdates.value.findIndex(item => item.sop_id === sopId)
    if (index !== -1) {
      const acknowledgedItem = pendingUpdates.value.splice(index, 1)[0]
      
      // 添加到历史记录
      ackHistory.value.unshift({
        sop_id: sopId,
        user_id: 'EMP001',
        station_id: 'S-01',
        version: acknowledgedItem.current_version,
        ack_time: new Date().toISOString()
      })
    }
    
    ElMessage.success('SOP确认成功')
  } catch (error) {
    ElMessage.error('确认失败')
    console.error(error)
  }
}

const ackAllUpdates = async () => {
  if (!hasUpdates.value) return
  
  try {
    loading.value = true
    
    // 模拟批量确认
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 移动所有待确认项目到历史记录
    for (const update of pendingUpdates.value) {
      ackHistory.value.unshift({
        sop_id: update.sop_id,
        user_id: 'EMP001',
        station_id: 'S-01',
        version: update.current_version,
        ack_time: new Date().toISOString()
      })
    }
    
    pendingUpdates.value = []
    ElMessage.success('全部SOP确认成功')
  } catch (error) {
    ElMessage.error('批量确认失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

const viewSopDetail = (sopId: string) => {
  const sop = mockSops.find(s => s.id === sopId)
  if (sop) {
    selectedSop.value = sop
    showSopDetail.value = true
  }
}

// 组件挂载
onMounted(() => {
  loadData()
})
</script>

<style scoped>
.sop-ack-page {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 24px;
  background: var(--el-bg-color);
  border-radius: 12px;
  border: 1px solid var(--el-border-color);
}

[data-theme="factory"] .page-header {
  background: linear-gradient(135deg, rgba(0, 216, 255, 0.1) 0%, rgba(0, 27, 46, 0.9) 100%);
  border-color: rgba(0, 216, 255, 0.3);
}

.page-title {
  font-size: 24px;
  font-weight: bold;
  color: var(--el-text-color-primary);
  margin: 0 0 4px 0;
}

[data-theme="factory"] .page-title {
  color: var(--industrial-blue);
}

.page-subtitle {
  color: var(--el-text-color-regular);
  margin: 0;
  font-size: 14px;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.alert-section {
  margin-bottom: 24px;
}

.stats-section {
  margin-bottom: 24px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  padding: 12px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.1);
}

[data-theme="factory"] .stat-icon {
  background: rgba(0, 216, 255, 0.2);
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: var(--el-text-color-primary);
  font-family: 'Courier New', monospace;
  line-height: 1;
}

[data-theme="factory"] .stat-value {
  text-shadow: 0 0 10px currentColor;
}

.stat-label {
  font-size: 14px;
  color: var(--el-text-color-regular);
  margin-top: 4px;
}

.pending-section,
.history-section {
  margin-bottom: 24px;
}

.pending-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.pending-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: var(--el-bg-color-page);
  border-radius: 8px;
  border-left: 4px solid #f0a020;
}

[data-theme="factory"] .pending-item {
  background: rgba(0, 216, 255, 0.05);
  border-left-color: var(--industrial-blue);
}

.sop-title {
  margin: 0 0 8px 0;
  color: var(--el-text-color-primary);
  font-size: 16px;
  font-weight: 500;
}

.sop-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.update-time {
  color: var(--el-text-color-regular);
  font-size: 12px;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .stats-section :deep(.el-row) {
    gap: 12px;
  }
}

@media (max-width: 768px) {
  .sop-ack-page {
    padding: 12px;
  }
  
  .page-header {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }
  
  .page-title {
    font-size: 20px;
  }
  
  .pending-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .pending-actions {
    width: 100%;
  }
  
  .action-buttons {
    justify-content: flex-start;
  }
}
</style> 