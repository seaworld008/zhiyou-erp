<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Loading } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'

const authStore = useAuthStore()
const themeStore = useThemeStore()
const isLoading = ref(true)
const hasError = ref(false)

const handleRefresh = () => {
  window.location.reload()
}

onMounted(async () => {
  try {
    console.log('🚀 志友ERP系统启动中...')
    
    // 初始化主题
    await themeStore.initTheme()
    
    // 初始化认证状态
    authStore.initAuth()
    
    console.log('✅ 志友ERP系统启动完成')
  } catch (error) {
    console.error('❌ 系统启动失败:', error)
    hasError.value = true
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div id="app" :class="themeStore.currentTheme">
    <!-- 加载状态 -->
    <div v-if="isLoading" class="loading-container">
      <div class="loading-spinner">
        <el-icon class="is-loading" size="40">
          <Loading />
        </el-icon>
      </div>
      <p>志友ERP系统加载中...</p>
    </div>
    
    <!-- 错误状态 -->
    <div v-else-if="hasError" class="error-container">
      <el-result 
        icon="error" 
        title="系统启动失败"
        sub-title="请刷新页面重试或联系管理员"
      >
        <template #extra>
          <el-button type="primary" @click="handleRefresh">
            刷新页面
          </el-button>
        </template>
      </el-result>
    </div>
    
    <!-- 正常应用 -->
    <router-view v-else />
  </div>
</template>

<style>
@import '@/styles/global.css';

#app {
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  transition: all 0.3s ease;
}

.loading-container, .error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
}

.loading-spinner {
  margin-bottom: 16px;
  color: var(--el-color-primary);
}

.loading-container p {
  color: var(--el-text-color-regular);
  font-size: 14px;
}

/* 主题相关样式 */
.light {
  background-color: var(--el-bg-color-page);
  color: var(--el-text-color-primary);
}

.dark {
  background-color: var(--el-bg-color-page);
  color: var(--el-text-color-primary);
}

.factory {
  background: linear-gradient(135deg, #001B2E 0%, #003B5C 100%);
  color: #FFFFFF;
}
</style>
