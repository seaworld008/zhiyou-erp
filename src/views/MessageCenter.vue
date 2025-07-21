<template>
  <div class="message-center">
    <!-- 消息统计卡片 -->
    <div class="stats-grid">
      <el-card class="stat-card total" shadow="hover">
        <div class="stat-content">
          <div class="stat-icon">
            <el-icon size="28">
              <Message />
            </el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.totalMessages }}</div>
            <div class="stat-label">消息总数</div>
          </div>
        </div>
      </el-card>
      
      <el-card class="stat-card unread" shadow="hover">
        <div class="stat-content">
          <div class="stat-icon">
            <el-icon size="28">
              <ChatDotRound />
            </el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.unreadMessages }}</div>
            <div class="stat-label">未读消息</div>
          </div>
        </div>
      </el-card>
      
      <el-card class="stat-card alert" shadow="hover">
        <div class="stat-content">
          <div class="stat-icon">
            <el-icon size="28">
              <Warning />
            </el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.alertMessages }}</div>
            <div class="stat-label">告警消息</div>
          </div>
        </div>
      </el-card>
      
      <el-card class="stat-card today" shadow="hover">
        <div class="stat-content">
          <div class="stat-icon">
            <el-icon size="28">
              <Calendar />
            </el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.todayMessages }}</div>
            <div class="stat-label">今日消息</div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 操作栏 -->
    <el-card class="action-bar" shadow="never">
      <div class="action-row">
        <div class="filters">
          <el-select
            v-model="filterForm.type"
            placeholder="消息类型"
            clearable
            style="width: 120px"
          >
            <el-option
              v-for="option in typeOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
          <el-select
            v-model="filterForm.priority"
            placeholder="优先级"
            clearable
            style="width: 120px"
          >
            <el-option
              v-for="option in priorityOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
          <el-select
            v-model="filterForm.category"
            placeholder="消息分类"
            clearable
            style="width: 150px"
          >
            <el-option
              v-for="option in categoryOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
          <el-select
            v-model="filterForm.isRead"
            placeholder="阅读状态"
            clearable
            style="width: 120px"
          >
            <el-option
              v-for="option in readStatusOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
          <el-input
            v-model="filterForm.keyword"
            placeholder="搜索消息标题/内容"
            clearable
            style="width: 200px"
          />
          <el-button type="primary" @click="handleSearch">
            <el-icon>
              <Search />
            </el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">重置</el-button>
        </div>
        
        <div class="actions">
          <el-button type="success" @click="handleMarkAllRead">
            <el-icon>
              <CircleCheck />
            </el-icon>
            全部已读
          </el-button>
          <el-button type="primary" @click="showSendModal = true">
            <el-icon>
              <Promotion />
            </el-icon>
            发送消息
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 主要内容区域 -->
    <el-row :gutter="16">
      <!-- 消息列表 -->
      <el-col :span="16">
        <el-card title="消息列表" shadow="never">
          <div class="message-list">
            <div 
              v-for="message in messageData" 
              :key="message.id" 
              class="message-item"
              :class="{ 'unread': !message.isRead, 'urgent': message.priority === 'urgent' }"
              @click="handleViewMessage(message)"
            >
              <div class="message-header">
                <div class="message-meta">
                  <el-tag :type="getTypeTagType(message.type)" size="small">
                    {{ getTypeLabel(message.type) }}
                  </el-tag>
                  <el-tag :type="getPriorityTagType(message.priority)" size="small">
                    {{ getPriorityLabel(message.priority) }}
                  </el-tag>
                  <span class="message-category">{{ message.category }}</span>
                </div>
                <div class="message-actions">
                  <span class="message-time">{{ formatTime(message.createdAt) }}</span>
                  <el-button 
                    size="small" 
                    text 
                    type="danger"
                    @click.stop="handleDeleteMessage(message.id)"
                  >
                    <el-icon>
                      <Delete />
                    </el-icon>
                  </el-button>
                </div>
              </div>
              
              <div class="message-content">
                <div class="message-title">
                  <span v-if="!message.isRead" class="unread-dot"></span>
                  {{ message.title }}
                </div>
                <div class="message-preview">{{ message.content.substring(0, 80) }}...</div>
                <div class="message-sender">
                  发送人: {{ message.sender }} → {{ message.recipient }}
                </div>
              </div>
            </div>
          </div>
          
          <div v-if="pagination.itemCount > pagination.pageSize" class="pagination-wrapper">
            <el-pagination
              v-model:current-page="pagination.page"
              v-model:page-size="pagination.pageSize"
              :page-sizes="pagination.pageSizes"
              :total="pagination.itemCount"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handlePageSizeChange"
              @current-change="handlePageChange"
            />
          </div>
        </el-card>
      </el-col>
      
      <!-- 侧边栏 -->
      <el-col :span="8">
        <!-- 快速筛选 -->
        <el-card title="快速筛选" class="sidebar-card" shadow="never">
          <div class="quick-filters">
            <el-button 
              :type="filterForm.isRead === false ? 'primary' : 'default'"
              @click="handleQuickFilter('unread')"
              style="width: 100%; margin-bottom: 8px"
            >
              <el-icon>
                <ChatDotRound />
              </el-icon>
              未读消息 ({{ stats.unreadMessages }})
            </el-button>
            
            <el-button 
              :type="filterForm.priority === 'urgent' ? 'danger' : 'default'"
              @click="handleQuickFilter('urgent')"
              style="width: 100%; margin-bottom: 8px"
            >
              <el-icon>
                <Lightning />
              </el-icon>
              紧急消息
            </el-button>
            
            <el-button 
              :type="filterForm.type === 'alert' ? 'warning' : 'default'"
              @click="handleQuickFilter('alert')"
              style="width: 100%; margin-bottom: 8px"
            >
              <el-icon>
                <Warning />
              </el-icon>
              告警消息
            </el-button>
            
            <el-button 
              :type="filterForm.type === 'system' ? 'info' : 'default'"
              @click="handleQuickFilter('system')"
              style="width: 100%"
            >
              <el-icon>
                <Setting />
              </el-icon>
              系统消息
            </el-button>
          </div>
        </el-card>
        
        <!-- 消息分类统计 -->
        <el-card title="分类统计" class="sidebar-card" shadow="never">
          <div class="category-stats">
            <div v-for="category in categoryStats" :key="category.name" class="category-item">
              <div class="category-name">{{ category.name }}</div>
              <div class="category-count">{{ category.count }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 消息详情模态框 -->
    <el-dialog v-model="showDetailModal" title="消息详情" width="700px">
      <div v-if="currentMessage" class="message-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="消息标题">{{ currentMessage.title }}</el-descriptions-item>
          <el-descriptions-item label="消息类型">
            <el-tag :type="getTypeTagType(currentMessage.type)" size="small">
              {{ getTypeLabel(currentMessage.type) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="优先级">
            <el-tag :type="getPriorityTagType(currentMessage.priority)" size="small">
              {{ getPriorityLabel(currentMessage.priority) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="分类">{{ currentMessage.category }}</el-descriptions-item>
          <el-descriptions-item label="发送人">{{ currentMessage.sender }}</el-descriptions-item>
          <el-descriptions-item label="接收人">{{ currentMessage.recipient }}</el-descriptions-item>
          <el-descriptions-item label="发送时间">{{ formatTime(currentMessage.createdAt) }}</el-descriptions-item>
          <el-descriptions-item label="阅读状态">
            <el-tag :type="currentMessage.isRead ? 'success' : 'warning'" size="small">
              {{ currentMessage.isRead ? '已读' : '未读' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item v-if="currentMessage.readAt" label="阅读时间">
            {{ formatTime(currentMessage.readAt) }}
          </el-descriptions-item>
        </el-descriptions>
        
        <el-divider>消息内容</el-divider>
        <div class="message-content-detail">{{ currentMessage.content }}</div>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showDetailModal = false">关闭</el-button>
          <el-button v-if="!currentMessage?.isRead" type="primary" @click="handleMarkAsRead">标记已读</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 发送消息模态框 -->
    <el-dialog
      v-model="showSendModal"
      title="发送消息"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form ref="sendFormRef" :model="sendForm" :rules="sendRules" label-width="80px">
        <el-form-item label="消息类型" prop="type">
          <el-select
            v-model="sendForm.type"
            placeholder="选择消息类型"
            style="width: 100%"
          >
            <el-option
              v-for="option in typeOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="优先级" prop="priority">
          <el-select
            v-model="sendForm.priority"
            placeholder="选择优先级"
            style="width: 100%"
          >
            <el-option
              v-for="option in priorityOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="分类" prop="category">
          <el-select
            v-model="sendForm.category"
            placeholder="选择分类"
            style="width: 100%"
          >
            <el-option
              v-for="option in categoryOptions.filter((c: any) => c.value)"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="接收人" prop="recipient">
          <el-input v-model="sendForm.recipient" placeholder="请输入接收人" />
        </el-form-item>
        
        <el-form-item label="消息标题" prop="title">
          <el-input v-model="sendForm.title" placeholder="请输入消息标题" />
        </el-form-item>
        
        <el-form-item label="消息内容" prop="content">
          <el-input
            v-model="sendForm.content"
            type="textarea"
            placeholder="请输入消息内容"
            :rows="5"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showSendModal = false">取消</el-button>
          <el-button type="primary" @click="handleSendMessage">发送</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Message, ChatDotRound, Warning, Calendar, Search, Promotion, CircleCheck, Delete,
  Lightning, Setting
} from '@element-plus/icons-vue'
import { 
  getMessages, getMessageStats, markMessageAsRead, markAllAsRead, 
  deleteMessage, sendMessage, messageCategories
} from '@/mock/message'
import type { Message as MessageType, MessageStats } from '@/types'

// 数据
const messageData = ref<MessageType[]>([])
const stats = ref<MessageStats>({
  totalMessages: 0,
  unreadMessages: 0,
  systemMessages: 0,
  alertMessages: 0,
  todayMessages: 0
})
const loading = ref(false)

// 模态框
const showDetailModal = ref(false)
const showSendModal = ref(false)
const currentMessage = ref<MessageType | null>(null)

// 筛选表单
const filterForm = reactive({
  type: null as string | null,
  priority: null as string | null,
  category: null as string | null,
  isRead: null as boolean | null,
  keyword: ''
})

// 发送表单
const sendForm = reactive({
  type: 'notification',
  priority: 'medium',
  category: '',
  recipient: '',
  title: '',
  content: ''
})

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 10,
  itemCount: 0,
  pageSizes: [10, 20, 50]
})

// 选项
const typeOptions = [
  { label: '系统消息', value: 'system' },
  { label: '告警消息', value: 'alert' },
  { label: '通知消息', value: 'notification' },
  { label: '提醒消息', value: 'reminder' }
]

const priorityOptions = [
  { label: '低', value: 'low' },
  { label: '中', value: 'medium' },
  { label: '高', value: 'high' },
  { label: '紧急', value: 'urgent' }
]

const categoryOptions = messageCategories

const readStatusOptions = [
  { label: '未读', value: false },
  { label: '已读', value: true }
]

// 计算属性
const categoryStats = computed(() => {
  const stats: { [key: string]: number } = {}
  messageData.value.forEach(msg => {
    stats[msg.category] = (stats[msg.category] || 0) + 1
  })
  return Object.entries(stats).map(([name, count]) => ({ name, count }))
})

// 表单验证规则
const sendRules = {
  type: { required: true, message: '请选择消息类型' },
  priority: { required: true, message: '请选择优先级' },
  category: { required: true, message: '请选择分类' },
  recipient: { required: true, message: '请输入接收人' },
  title: { required: true, message: '请输入消息标题' },
  content: { required: true, message: '请输入消息内容' }
}

// 工具函数
function getTypeTagType(type: string): string {
  const tagMap: Record<string, string> = {
    system: 'info',
    alert: 'danger',
    notification: 'success',
    reminder: 'warning'
  }
  return tagMap[type] || 'info'
}

function getTypeLabel(type: string): string {
  const labelMap: Record<string, string> = {
    system: '系统',
    alert: '告警',
    notification: '通知',
    reminder: '提醒'
  }
  return labelMap[type] || type
}

function getPriorityTagType(priority: string): string {
  const tagMap: Record<string, string> = {
    low: 'info',
    medium: 'info',
    high: 'warning',
    urgent: 'danger'
  }
  return tagMap[priority] || 'info'
}

function getPriorityLabel(priority: string): string {
  const labelMap: Record<string, string> = {
    low: '低',
    medium: '中',
    high: '高',
    urgent: '紧急'
  }
  return labelMap[priority] || priority
}

function formatTime(dateTimeStr: string): string {
  return new Date(dateTimeStr).toLocaleString('zh-CN')
}

// 方法
async function loadMessageData() {
  loading.value = true
  try {
    const result = await getMessages({
      page: pagination.page,
      pageSize: pagination.pageSize,
      ...filterForm
    }) as any
    
    if (result.code === 200) {
      messageData.value = result.data.list
      pagination.itemCount = result.data.total
    }
  } catch (error) {
    console.error('加载消息数据失败:', error)
    ElMessage.error('加载消息数据失败')
  } finally {
    loading.value = false
  }
}

async function loadStats() {
  try {
    const result = await getMessageStats() as any
    if (result.code === 200) {
      stats.value = result.data
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

function handleSearch() {
  pagination.page = 1
  loadMessageData()
}

function handleReset() {
  Object.keys(filterForm).forEach(key => {
    ;(filterForm as any)[key] = key === 'keyword' ? '' : null
  })
  pagination.page = 1
  loadMessageData()
}

function handleQuickFilter(type: string) {
  // 重置所有筛选条件
  Object.keys(filterForm).forEach(key => {
    ;(filterForm as any)[key] = key === 'keyword' ? '' : null
  })
  
  // 设置对应的筛选条件
  switch (type) {
    case 'unread':
      filterForm.isRead = false
      break
    case 'urgent':
      filterForm.priority = 'urgent'
      break
    case 'alert':
      filterForm.type = 'alert'
      break
    case 'system':
      filterForm.type = 'system'
      break
  }
  
  pagination.page = 1
  loadMessageData()
}

async function handleViewMessage(msg: MessageType) {
  currentMessage.value = { ...msg }
  showDetailModal.value = true
  
  // 如果是未读消息，标记为已读
  if (!msg.isRead) {
    await markMessageAsRead(msg.id)
    msg.isRead = true
    msg.readAt = new Date().toISOString()
    stats.value.unreadMessages = Math.max(0, stats.value.unreadMessages - 1)
  }
}

async function handleMarkAsRead() {
  if (!currentMessage.value) return
  
  try {
    const result = await markMessageAsRead(currentMessage.value.id) as any
    if (result.code === 200) {
      ElMessage.success('已标记为已读')
      currentMessage.value.isRead = true
      currentMessage.value.readAt = new Date().toISOString()
      showDetailModal.value = false
      loadStats()
      loadMessageData()
    }
  } catch (error) {
    console.error('标记已读失败:', error)
    ElMessage.error('标记已读失败')
  }
}

async function handleMarkAllRead() {
  try {
    await ElMessageBox.confirm('确定要将所有未读消息标记为已读吗？', '确认操作', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const result = await markAllAsRead() as any
    if (result.code === 200) {
      ElMessage.success(result.message)
      loadStats()
      loadMessageData()
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量标记已读失败:', error)
      ElMessage.error('批量标记已读失败')
    }
  }
}

async function handleDeleteMessage(id: string) {
  try {
    await ElMessageBox.confirm('确定要删除这条消息吗？删除后无法恢复。', '确认删除', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const result = await deleteMessage(id) as any
    if (result.code === 200) {
      ElMessage.success('消息删除成功')
      loadStats()
      loadMessageData()
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除消息失败:', error)
      ElMessage.error('删除消息失败')
    }
  }
}

async function handleSendMessage() {
  try {
    const result = await sendMessage(sendForm) as any
    if (result.code === 200) {
      ElMessage.success('消息发送成功')
      showSendModal.value = false
      // 重置表单
      Object.keys(sendForm).forEach(key => {
        if (key === 'type') {
          ;(sendForm as any)[key] = 'notification'
        } else if (key === 'priority') {
          ;(sendForm as any)[key] = 'medium'
        } else {
          ;(sendForm as any)[key] = ''
        }
      })
      loadStats()
      loadMessageData()
    }
  } catch (error) {
    console.error('发送消息失败:', error)
    ElMessage.error('发送消息失败')
  }
}

function handlePageChange(page: number) {
  pagination.page = page
  loadMessageData()
}

function handlePageSizeChange(pageSize: number) {
  pagination.pageSize = pageSize
  pagination.page = 1
  loadMessageData()
}

onMounted(() => {
  loadStats()
  loadMessageData()
})
</script>

<style scoped>
.message-center {
  padding: 16px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

.stat-card {
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.stat-card.total :deep(.el-card__body) {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border: 1px solid #0ea5e9;
}

.stat-card.unread :deep(.el-card__body) {
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  border: 1px solid #ef4444;
}

.stat-card.alert :deep(.el-card__body) {
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
  border: 1px solid #f59e0b;
}

.stat-card.today :deep(.el-card__body) {
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border: 1px solid #22c55e;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: var(--el-text-color-secondary);
}

.action-bar {
  margin-bottom: 16px;
}

.action-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.filters {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.actions {
  display: flex;
  gap: 12px;
}

.sidebar-card {
  margin-bottom: 16px;
}

.quick-filters {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.category-stats {
  max-height: 200px;
  overflow-y: auto;
}

.category-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid var(--el-border-color);
}

.category-item:last-child {
  border-bottom: none;
}

.category-name {
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.category-count {
  color: var(--el-text-color-secondary);
  font-size: 14px;
}

.message-list {
  max-height: 600px;
  overflow-y: auto;
}

.message-item {
  padding: 16px;
  border-bottom: 1px solid var(--el-border-color);
  cursor: pointer;
  transition: all 0.3s ease;
}

.message-item:hover {
  background-color: var(--el-color-info-light-9);
}

.message-item:last-child {
  border-bottom: none;
}

.message-item.unread {
  background-color: var(--el-color-info-light-9);
  border-left: 4px solid var(--el-color-primary);
}

.message-item.urgent {
  border-left: 4px solid #ef4444;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.message-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.message-category {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}

.message-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.message-time {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}

.message-content {
  margin-left: 0;
}

.message-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  color: var(--el-text-color-primary);
  margin-bottom: 4px;
}

.unread-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #f0a020;
  display: inline-block;
}

.message-preview {
  color: var(--el-text-color-secondary);
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 4px;
}

.message-sender {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}

.message-detail {
  margin-bottom: 16px;
}

.message-content-detail {
  padding: 16px;
  background: var(--el-color-info-light-9);
  border-radius: 6px;
  color: var(--el-text-color-primary);
  line-height: 1.6;
  white-space: pre-wrap;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 16px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 工厂主题特效 */
[data-theme="factory"] .stat-card :deep(.el-card__body) {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border: 1px solid #0f3460;
  box-shadow: 0 0 20px rgba(0, 212, 255, 0.1);
}

[data-theme="factory"] .stat-card:hover {
  box-shadow: 0 0 30px rgba(0, 212, 255, 0.3);
  transform: translateY(-2px);
}

[data-theme="factory"] .stat-icon {
  background: rgba(0, 212, 255, 0.1);
  border: 1px solid rgba(0, 212, 255, 0.3);
}

[data-theme="factory"] .stat-value {
  color: #00d4ff;
  text-shadow: 0 0 10px rgba(0, 212, 255, 0.5);
}

[data-theme="factory"] .message-item:hover {
  background-color: rgba(0, 212, 255, 0.05);
}

[data-theme="factory"] .message-content-detail {
  background: rgba(0, 212, 255, 0.05);
  border: 1px solid rgba(0, 212, 255, 0.2);
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .action-row {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filters,
  .actions {
    justify-content: center;
  }
  
  .message-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style> 