<template>
  <div class="user-management">
    <el-card>
      <template #header>
        <div class="card-header">
          <h3>👥 用户管理</h3>
          <el-button type="primary" @click="showAddModal = true">
            <el-icon><Plus /></el-icon>
            新增用户
          </el-button>
        </div>
      </template>
      
      <el-table
        :data="users"
        v-loading="loading"
        stripe
        style="width: 100%"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="email" label="邮箱" width="200" />
        <el-table-column label="角色" width="100">
          <template #default="{ row }">
            <el-tag :type="getRoleTagType(row.role)">
              {{ getRoleLabel(row.role) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'warning'">
              {{ row.status === 'active' ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="150" />
        <el-table-column prop="lastLogin" label="最后登录" width="150" />
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button size="small" type="primary" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50]"
          :total="users.length"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
    
    <!-- 新增/编辑用户弹窗 -->
    <el-dialog
      v-model="showAddModal"
      title="新增用户"
      width="500px"
      :before-close="handleDialogClose"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="80px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="formData.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="formData.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="formData.role" placeholder="请选择角色">
            <el-option
              v-for="item in roleOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="formData.status" placeholder="请选择状态">
            <el-option
              v-for="item in statusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showAddModal = false">取消</el-button>
          <el-button type="primary" @click="handleSave">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import type { FormInstance } from 'element-plus'

const loading = ref(false)
const showAddModal = ref(false)
const formRef = ref<FormInstance>()

const formData = reactive({
  username: '',
  email: '',
  role: 'user',
  status: 'active'
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
}

const roleOptions = [
  { label: '管理员', value: 'admin' },
  { label: '用户', value: 'user' },
  { label: '访客', value: 'guest' }
]

const statusOptions = [
  { label: '正常', value: 'active' },
  { label: '禁用', value: 'inactive' }
]

const users = ref([
  {
    id: '1',
    username: 'admin',
    email: 'admin@zhiyou.com',
    role: 'admin',
    status: 'active',
    createTime: '2024-01-01 10:00:00',
    lastLogin: '2024-01-15 14:30:00'
  },
  {
    id: '2',
    username: 'user1',
    email: 'user1@zhiyou.com',
    role: 'user',
    status: 'active',
    createTime: '2024-01-02 09:15:00',
    lastLogin: '2024-01-14 16:45:00'
  },
  {
    id: '3',
    username: 'user2',
    email: 'user2@zhiyou.com',
    role: 'user',
    status: 'inactive',
    createTime: '2024-01-03 11:20:00',
    lastLogin: '2024-01-10 13:20:00'
  }
])

const pagination = reactive({
  page: 1,
  pageSize: 10
})

// 工具函数
const getRoleLabel = (role: string): string => {
  const roleMap: Record<string, string> = {
    admin: '管理员',
    user: '用户',
    guest: '访客'
  }
  return roleMap[role] || '未知'
}

const getRoleTagType = (role: string) => {
  const typeMap: Record<string, string> = {
    admin: 'danger',
    user: 'primary',
    guest: 'info'
  }
  return typeMap[role] || 'info'
}

// 事件处理
const handleEdit = (row: any) => {
  ElMessage.info(`编辑用户: ${row.username}`)
}

const handleDelete = (row: any) => {
  ElMessage.warning(`删除用户: ${row.username}`)
}

const handleSave = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    ElMessage.success('保存成功')
    showAddModal.value = false
    // 重置表单
    Object.assign(formData, {
      username: '',
      email: '',
      role: 'user',
      status: 'active'
    })
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

const handleDialogClose = (done: () => void) => {
  ElMessageBox.confirm('确认关闭？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      done()
    })
    .catch(() => {
      // 取消关闭
    })
}

const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.page = 1
}

const handleCurrentChange = (page: number) => {
  pagination.page = page
}
</script>

<style scoped>
.user-management {
  max-width: 1200px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  font-size: 18px;
  color: var(--el-text-color-primary);
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.dialog-footer {
  display: flex;
  gap: 8px;
}

/* Element Plus table 样式定制 */
:deep(.el-table) {
  font-size: 14px;
}

:deep(.el-table th) {
  background-color: var(--el-bg-color-page);
  font-weight: 600;
}

:deep(.el-table td) {
  padding: 12px 16px;
}

:deep(.el-table .el-button) {
  margin-right: 8px;
}

:deep(.el-table .el-button:last-child) {
  margin-right: 0;
}
</style> 