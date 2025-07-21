<template>
  <div class="login-container">
    <div class="login-wrapper">
      <!-- 左侧装饰区域 -->
      <div class="login-left">
        <div class="decoration">
          <div class="logo-section">
            <div class="logo-icon">
              <el-icon :size="60" color="#fff">
                <component :is="BusinessOutline" />
              </el-icon>
            </div>
            <h1 class="system-title">志友ERP</h1>
            <p class="system-subtitle">企业资源规划管理系统</p>
          </div>
          
          <div class="features">
            <div class="feature-item">
              <el-icon :size="24" color="#fff">
                <component :is="CheckmarkCircleOutline" />
              </el-icon>
              <span>智能化管理</span>
            </div>
            <div class="feature-item">
              <el-icon :size="24" color="#fff">
                <component :is="TrendingUpOutline" />
              </el-icon>
              <span>数据可视化</span>
            </div>
            <div class="feature-item">
              <el-icon :size="24" color="#fff">
                <component :is="ShieldCheckmarkOutline" />
              </el-icon>
              <span>安全可靠</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 右侧登录表单 -->
      <div class="login-right">
        <div class="login-form">
          <div class="form-header">
            <h2>欢迎登录</h2>
            <p>请输入您的账号信息</p>
          </div>
          
          <el-form 
            ref="loginFormRef" 
            :model="loginForm" 
            :rules="loginRules"
            size="large"
            @submit.prevent="handleLogin"
          >
            <el-form-item prop="username">
              <el-input
                v-model="loginForm.username"
                placeholder="请输入用户名"
                clearable
                @keyup.enter="handleLogin"
              >
                <template #prefix>
                  <el-icon>
                    <component :is="PersonOutline" />
                  </el-icon>
                </template>
              </el-input>
            </el-form-item>
            
            <el-form-item prop="password">
              <el-input
                v-model="loginForm.password"
                type="password"
                placeholder="请输入密码"
                show-password
                clearable
                @keyup.enter="handleLogin"
              >
                <template #prefix>
                  <el-icon>
                    <component :is="LockClosedOutline" />
                  </el-icon>
                </template>
              </el-input>
            </el-form-item>
            
            <el-form-item>
              <el-button
                type="primary"
                size="large"
                style="width: 100%"
                :loading="loading"
                @click="handleLogin"
              >
                <el-icon style="margin-right: 8px;">
                  <component :is="LogInOutline" />
                </el-icon>
                登录
              </el-button>
            </el-form-item>
          </el-form>
          
          <div class="login-tips">
            <el-alert
              title="系统提示"
              type="info"
              :closable="false"
              show-icon
            >
              <template #default>
                <div style="display: flex; align-items: center;">
                  <el-icon style="margin-right: 8px;">
                    <component :is="InformationCircleOutline" />
                  </el-icon>
                                     <span>默认账号：erp / 123456</span>
                </div>
              </template>
            </el-alert>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { 
  PersonOutline, 
  LockClosedOutline,
  BusinessOutline,
  CheckmarkCircleOutline,
  TrendingUpOutline,
  ShieldCheckmarkOutline,
  LogInOutline,
  InformationCircleOutline
} from '@vicons/ionicons5'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// 表单引用
const loginFormRef = ref<FormInstance>()

// 登录状态
const loading = ref(false)

// 登录表单数据
const loginForm = reactive({
  username: '',
  password: ''
})

// 表单验证规则
const loginRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6位', trigger: 'blur' }
  ]
}

// 登录处理
const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  try {
    await loginFormRef.value.validate()
    loading.value = true
    
    const result = await authStore.login(loginForm.username, loginForm.password)
    
    if (result.success) {
      ElMessage.success(result.message)
      router.push('/dashboard')
    } else {
      ElMessage.error(result.message)
    }
  } catch (error) {
    console.error('登录失败:', error)
    ElMessage.error('登录过程中发生错误')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.login-wrapper {
  display: flex;
  background: white;
  border-radius: 20px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  max-width: 1000px;
  width: 100%;
  min-height: 600px;
}

.login-left {
  flex: 1;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: white;
}

.decoration {
  text-align: center;
}

.logo-section {
  margin-bottom: 40px;
}

.logo-icon {
  margin-bottom: 20px;
}

.system-title {
  font-size: 36px;
  font-weight: bold;
  margin: 0 0 10px 0;
  color: #fff;
}

.system-subtitle {
  font-size: 16px;
  margin: 0;
  opacity: 0.9;
}

.features {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 16px;
}

.login-right {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.login-form {
  width: 100%;
  max-width: 400px;
}

.form-header {
  text-align: center;
  margin-bottom: 40px;
}

.form-header h2 {
  font-size: 28px;
  font-weight: bold;
  color: #333;
  margin: 0 0 10px 0;
}

.form-header p {
  color: #666;
  margin: 0;
}

.login-tips {
  margin-top: 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .login-wrapper {
    flex-direction: column;
    margin: 10px;
  }
  
  .login-left {
    padding: 30px 20px;
  }
  
  .login-right {
    padding: 30px 20px;
  }
  
  .system-title {
    font-size: 28px;
  }
  
  .features {
    flex-direction: row;
    justify-content: space-around;
    flex-wrap: wrap;
  }
  
  .feature-item {
    flex-direction: column;
    text-align: center;
    gap: 8px;
  }
}
</style> 