<template>
  <div class="sop-list-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">📋 标准作业程序 (SOP)</h1>
        <p class="page-subtitle">Standard Operating Procedures</p>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="showCreateModal = true">
          <el-icon><Plus /></el-icon>
          新建SOP
        </el-button>
      </div>
    </div>

    <!-- 搜索筛选区 -->
    <div class="search-section">
      <el-card>
        <el-form 
          inline 
          :model="searchForm"
          @submit.prevent="handleSearch"
        >
          <el-form-item label="产品代码">
            <el-input 
              v-model="searchForm.product_code" 
              placeholder="输入产品代码"
              clearable
              style="width: 200px"
            />
          </el-form-item>
          <el-form-item label="工序代码">
            <el-input 
              v-model="searchForm.process_code" 
              placeholder="输入工序代码"
              clearable
              style="width: 200px"
            />
          </el-form-item>
          <el-form-item label="状态">
            <el-select
              v-model="searchForm.enabled"
              placeholder="选择状态"
              clearable
              style="width: 120px"
            >
              <el-option 
                v-for="option in statusOptions" 
                :key="option.value" 
                :label="option.label" 
                :value="option.value" 
              />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">
              <el-icon><Search /></el-icon>
              搜索
            </el-button>
            <el-button @click="handleReset">
              <el-icon><Refresh /></el-icon>
              重置
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>

    <!-- 数据列表 -->
    <div class="table-section">
      <el-card>
        <template #header>
          <div class="table-header">
            <span>SOP列表</span>
            <div class="table-actions">
              <el-button @click="loadSopData">
                <el-icon><Refresh /></el-icon>
                刷新
              </el-button>
            </div>
          </div>
        </template>

        <el-table 
          :data="sopList" 
          v-loading="loading"
          stripe 
          style="width: 100%"
        >
          <el-table-column prop="id" label="SOP编号" width="120" />
          <el-table-column prop="product_code" label="产品代码" width="120" />
          <el-table-column prop="process_code" label="工序代码" width="120" />
          <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />
          <el-table-column prop="version" label="版本" width="80" />
          <el-table-column label="标准工时" width="100">
            <template #default="{ row }">
              {{ formatTime(row.std_time_sec) }}
            </template>
          </el-table-column>
          <el-table-column label="状态" width="80">
            <template #default="{ row }">
              <el-tag :type="row.enabled ? 'success' : 'danger'">
                {{ row.enabled ? '启用' : '禁用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="updated_by" label="更新人" width="100" />
          <el-table-column label="更新时间" width="150">
            <template #default="{ row }">
              {{ new Date(row.updated_at).toLocaleString('zh-CN') }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <el-button size="small" @click="viewSop(row)">
                <el-icon><View /></el-icon>
                查看
              </el-button>
              <el-button size="small" type="primary" @click="editSop(row)">
                <el-icon><Edit /></el-icon>
                编辑
              </el-button>
              <el-button size="small" type="success" @click="playSop(row)">
                <el-icon><VideoPlay /></el-icon>
                播放
              </el-button>
              <el-popconfirm
                title="确定要删除这个SOP吗？"
                @confirm="deleteSop(row)"
              >
                <template #reference>
                  <el-button size="small" type="danger">
                    <el-icon><Delete /></el-icon>
                    删除
                  </el-button>
                </template>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>

        <div class="pagination-container">
          <el-pagination
            v-model:current-page="pagination.page"
            v-model:page-size="pagination.pageSize"
            :page-sizes="[10, 20, 50, 100]"
            :total="sopList.length"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </el-card>
    </div>

    <!-- SOP详情查看弹窗 -->
    <el-dialog
      v-model="showDetailModal"
      title="SOP详情"
      width="80%"
      :before-close="handleDetailClose"
    >
      <SopDetailModal
        v-if="selectedSop"
        :sop="selectedSop"
        @close="showDetailModal = false"
        @edit="handleEditFromDetail"
      />
    </el-dialog>

    <!-- SOP编辑弹窗 -->
    <el-dialog
      v-model="showEditModal"
      title="编辑SOP"
      width="90%"
      :before-close="handleEditClose"
    >
      <SopEditModal
        v-if="selectedSop"
        :sop="selectedSop"
        @close="showEditModal = false"
        @save="handleSaveFromEdit"
      />
    </el-dialog>

    <!-- 新建SOP弹窗 -->
    <el-dialog
      v-model="showCreateModal"
      title="新建SOP"
      width="90%"
      :before-close="handleCreateClose"
    >
      <SopEditModal
        v-if="showCreateModal"
        @close="showCreateModal = false"
        @save="handleSaveFromCreate"
      />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Plus,
  Search, 
  Refresh,
  View,
  Edit,
  Delete,
  VideoPlay
} from '@element-plus/icons-vue'
import type { Sop } from '@/types'
import { getSopList } from '@/mock/sop'
import SopDetailModal from '@/components/SopDetailModal.vue'
import SopEditModal from '@/components/SopEditModal.vue'

// 响应式数据
const loading = ref(false)
const sopList = ref<Sop[]>([])
const selectedSop = ref<Sop | null>(null)

// 弹窗控制
const showDetailModal = ref(false)
const showEditModal = ref(false)
const showCreateModal = ref(false)

// 搜索表单
const searchForm = reactive({
  product_code: '',
  process_code: '',
  enabled: null as boolean | null
})

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 20
})

// 状态选项
const statusOptions = [
  { label: '启用', value: true },
  { label: '禁用', value: false }
]

// 工具函数
const formatTime = (seconds: number): string => {
  if (seconds < 60) {
    return `${seconds}秒`
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return remainingSeconds > 0 ? `${minutes}分${remainingSeconds}秒` : `${minutes}分`
  } else {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return minutes > 0 ? `${hours}小时${minutes}分` : `${hours}小时`
  }
}

// 数据加载
const loadSopData = async () => {
  loading.value = true
  try {
    const response = await getSopList()
    sopList.value = Array.isArray(response) ? response : response.data.list
    ElMessage.success(`加载了 ${sopList.value.length} 条SOP数据`)
  } catch (error) {
    ElMessage.error('加载SOP数据失败')
    console.error('加载SOP数据失败:', error)
  } finally {
    loading.value = false
  }
}

// 搜索处理
const handleSearch = () => {
  // 这里应该调用API进行搜索
  ElMessage.info('搜索功能开发中...')
}

const handleReset = () => {
  searchForm.product_code = ''
  searchForm.process_code = ''
  searchForm.enabled = null
  handleSearch()
}

// 分页处理
const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.page = 1
}

const handleCurrentChange = (page: number) => {
  pagination.page = page
}

// SOP操作
const viewSop = (sop: Sop) => {
  selectedSop.value = sop
  showDetailModal.value = true
}

const editSop = (sop: Sop) => {
  selectedSop.value = sop
  showEditModal.value = true
}

const playSop = (sop: Sop) => {
  ElMessage.info(`播放SOP: ${sop.title}`)
  // 这里应该跳转到SOP播放页面
}

const deleteSop = async (sop: Sop) => {
  try {
    ElMessage.success(`删除SOP: ${sop.title}`)
    // 这里应该调用删除API
    await loadSopData()
  } catch (error) {
    ElMessage.error('删除SOP失败')
  }
}

// 弹窗关闭处理
const handleDetailClose = (done: () => void) => {
  done()
}

const handleEditClose = (done: () => void) => {
  ElMessageBox.confirm('确认关闭编辑？未保存的更改将丢失。', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => done())
    .catch(() => {})
}

const handleCreateClose = (done: () => void) => {
  ElMessageBox.confirm('确认关闭新建？未保存的更改将丢失。', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => done())
    .catch(() => {})
}

// 编辑相关处理
const handleEditFromDetail = (sop: Sop) => {
  showDetailModal.value = false
  selectedSop.value = sop
  showEditModal.value = true
}

const handleSaveFromEdit = async (sop: Sop) => {
  try {
    ElMessage.success('保存SOP成功')
    showEditModal.value = false
    await loadSopData()
  } catch (error) {
    ElMessage.error('保存SOP失败')
  }
}

const handleSaveFromCreate = async (sop: Sop) => {
  try {
    ElMessage.success('创建SOP成功')
    showCreateModal.value = false
    await loadSopData()
  } catch (error) {
    ElMessage.error('创建SOP失败')
  }
}

// 组件挂载
onMounted(() => {
  loadSopData()
})
</script>

<style scoped>
.sop-list-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 20px;
  background: var(--el-bg-color);
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.header-left .page-title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.header-left .page-subtitle {
  margin: 4px 0 0 0;
  font-size: 14px;
  color: var(--el-text-color-regular);
}

.search-section {
  margin-bottom: 20px;
}

.table-section {
  margin-bottom: 20px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table-actions {
  display: flex;
  gap: 8px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

/* Element Plus 样式定制 */
:deep(.el-card) {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

:deep(.el-table) {
  font-size: 14px;
}

:deep(.el-table .el-button) {
  margin-right: 8px;
}

:deep(.el-table .el-button:last-child) {
  margin-right: 0;
}

:deep(.el-form--inline .el-form-item) {
  margin-right: 16px;
}
</style> 