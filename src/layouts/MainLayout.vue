<template>
  <div class="main-layout" :data-theme="themeStore.currentTheme">
    <el-container class="layout-container">
      <el-aside :width="isCollapse ? '64px' : '240px'" class="sidebar">
        <div class="logo">
          <el-icon size="32" :color="themeStore.currentTheme === 'factory' ? '#00D8FF' : '#409EFF'">
            <Shop />
          </el-icon>
          <span v-if="!isCollapse" class="logo-text">志友ERP</span>
        </div>
        
        <el-menu
          :default-active="activeIndex"
          :collapse="isCollapse"
          :background-color="menuBackgroundColor"
          :text-color="menuTextColor"
          :active-text-color="menuActiveTextColor"
          @select="handleSelect"
          router
        >
          <!-- 仪表盘 -->
          <el-sub-menu index="1">
            <template #title>
              <el-icon><DataAnalysis /></el-icon>
              <span>仪表盘</span>
            </template>
            <el-menu-item index="/" route="/">
              <el-icon><Odometer /></el-icon>
              <span>总览</span>
            </el-menu-item>
            <el-menu-item index="/workstation" route="/workstation">
              <el-icon><Monitor /></el-icon>
              <span>工位看板</span>
            </el-menu-item>
          </el-sub-menu>

          <!-- 工序SOP -->
          <el-sub-menu index="2">
            <template #title>
              <el-icon><Document /></el-icon>
              <span>工序SOP</span>
            </template>
            <el-menu-item index="/sop/list" route="/sop/list">
              <el-icon><List /></el-icon>
              <span>SOP列表</span>
            </el-menu-item>
            <el-menu-item index="/sop/play" route="/sop/play">
              <el-icon><VideoPlay /></el-icon>
              <span>SOP播放</span>
            </el-menu-item>
            <el-menu-item index="/sop/ack" route="/sop/ack">
              <el-icon><Check /></el-icon>
              <span>SOP接收</span>
            </el-menu-item>
          </el-sub-menu>

          <!-- 生产管理 -->
          <el-sub-menu index="3">
            <template #title>
              <el-icon><Operation /></el-icon>
              <span>生产管理</span>
            </template>
            <el-menu-item index="/production/orders" route="/production/orders">
              <el-icon><DocumentCopy /></el-icon>
              <span>派工单</span>
            </el-menu-item>
            <el-menu-item index="/production/piece" route="/production/piece">
              <el-icon><Coin /></el-icon>
              <span>计件录入</span>
            </el-menu-item>
          </el-sub-menu>

          <!-- 绩效模块 -->
          <el-sub-menu index="4">
            <template #title>
              <el-icon><TrendCharts /></el-icon>
              <span>绩效</span>
            </template>
            <el-menu-item index="/performance/today" route="/performance/today">
              <el-icon><Calendar /></el-icon>
              <span>今日业绩</span>
            </el-menu-item>
            <el-menu-item index="/performance/time" route="/performance/time">
              <el-icon><Timer /></el-icon>
              <span>工时汇报</span>
            </el-menu-item>
          </el-sub-menu>

          <!-- 考勤管理 -->
          <el-sub-menu index="5">
            <template #title>
              <el-icon><Clock /></el-icon>
              <span>考勤管理</span>
            </template>
            <el-menu-item index="/attendance/records" route="/attendance/records">
              <el-icon><Calendar /></el-icon>
              <span>打卡记录</span>
            </el-menu-item>
            <el-menu-item index="/attendance/schedule" route="/attendance/schedule">
              <el-icon><Clock /></el-icon>
              <span>排班表</span>
            </el-menu-item>
            <el-menu-item index="/attendance/approval" route="/attendance/approval">
              <el-icon><CircleCheck /></el-icon>
              <span>异常审批</span>
            </el-menu-item>
          </el-sub-menu>

          <!-- 设备管理 -->
          <el-sub-menu index="6">
            <template #title>
              <el-icon><Tools /></el-icon>
              <span>设备管理</span>
            </template>
            <el-menu-item index="/equipment/list" route="/equipment/list">
              <el-icon><Setting /></el-icon>
              <span>设备列表</span>
            </el-menu-item>
            <el-menu-item index="/equipment/check" route="/equipment/check">
              <el-icon><Tools /></el-icon>
              <span>设备点检</span>
            </el-menu-item>
            <el-menu-item index="/equipment/oee" route="/equipment/oee">
              <el-icon><DataBoard /></el-icon>
              <span>OEE分析</span>
            </el-menu-item>
          </el-sub-menu>

          <!-- 品质管理 -->
          <el-sub-menu index="7">
            <template #title>
              <el-icon><Star /></el-icon>
              <span>品质管理</span>
            </template>
            <el-menu-item index="/quality/defect" route="/quality/defect">
              <el-icon><Warning /></el-icon>
              <span>品质异常</span>
            </el-menu-item>
            <el-menu-item index="/quality/inspect" route="/quality/inspect">
              <el-icon><View /></el-icon>
              <span>抽检录入</span>
            </el-menu-item>
            <el-menu-item index="/quality/rework" route="/quality/rework">
              <el-icon><RefreshRight /></el-icon>
              <span>返修追溯</span>
            </el-menu-item>
          </el-sub-menu>

          <!-- 仓储管理 -->
          <el-sub-menu index="8">
            <template #title>
              <el-icon><Box /></el-icon>
              <span>仓储管理</span>
            </template>
            <el-menu-item index="/inventory/stock" route="/inventory/stock">
              <el-icon><Box /></el-icon>
              <span>库存总览</span>
            </el-menu-item>
            <el-menu-item index="/inventory/io" route="/inventory/io">
              <el-icon><Goods /></el-icon>
              <span>收发记录</span>
            </el-menu-item>
          </el-sub-menu>

          <!-- 消息中心 -->
          <el-menu-item index="/message/center" route="/message/center">
            <el-icon><Bell /></el-icon>
            <span>消息中心</span>
          </el-menu-item>

          <!-- Andon系统 -->
          <el-menu-item index="/andon/system" route="/andon/system">
            <el-icon><Warning /></el-icon>
            <span>Andon系统</span>
          </el-menu-item>

          <!-- 报表中心 -->
          <el-menu-item index="/reports/center" route="/reports/center">
            <el-icon><TrendCharts /></el-icon>
            <span>报表中心</span>
          </el-menu-item>

          <!-- 系统管理 -->
          <el-sub-menu index="9">
            <template #title>
              <el-icon><Setting /></el-icon>
              <span>系统管理</span>
            </template>
            <el-menu-item index="/users" route="/users">
              <el-icon><User /></el-icon>
              <span>用户管理</span>
            </el-menu-item>
            <el-menu-item index="/system/param" route="/system/param">
              <el-icon><Operation /></el-icon>
              <span>系统参数</span>
            </el-menu-item>
            <el-menu-item index="/system/log" route="/system/log">
              <el-icon><DocumentCopy /></el-icon>
              <span>审计日志</span>
            </el-menu-item>
          </el-sub-menu>
        </el-menu>
      </el-aside>

      <el-container>
        <el-header class="header">
          <div class="header-left">
            <el-button
              :icon="isCollapse ? Expand : Fold"
              @click="toggleCollapse"
              text
            />
            <el-breadcrumb separator="/">
              <el-breadcrumb-item
                v-for="item in breadcrumbs"
                :key="item.path"
                :to="{ path: item.path }"
              >
                {{ item.title }}
              </el-breadcrumb-item>
            </el-breadcrumb>
          </div>
          
          <div class="header-right">
            <!-- 主题切换 -->
            <el-dropdown @command="handleThemeChange">
              <el-button circle>
                <el-icon><Sunny /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="light">明亮主题</el-dropdown-item>
                  <el-dropdown-item command="dark">暗黑主题</el-dropdown-item>
                  <el-dropdown-item command="factory">工厂大屏</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>

            <!-- 消息通知 -->
            <el-badge :value="messageCount" :max="99" class="message-badge">
              <el-button circle @click="goToMessages">
                <el-icon><Bell /></el-icon>
              </el-button>
            </el-badge>

            <!-- 用户菜单 -->
                         <el-dropdown @command="handleUserAction">
               <el-button text class="user-info">
                 <el-avatar size="small" :src="userStore.user?.avatar">
                   {{ userStore.user?.username?.charAt(0) }}
                 </el-avatar>
                 <span class="username">{{ userStore.user?.username }}</span>
                 <el-icon><ArrowDown /></el-icon>
               </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="profile">个人资料</el-dropdown-item>
                  <el-dropdown-item command="settings">系统设置</el-dropdown-item>
                  <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </el-header>

        <el-main class="main-content">
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useThemeStore } from '@/stores/theme'
import { useAuthStore } from '@/stores/auth'
import {
  Shop, DataAnalysis, Odometer, Monitor, Document, List, VideoPlay, Check,
  Operation, DocumentCopy, Coin, TrendCharts, Calendar, Timer, Clock,
  CircleCheck, Tools, Setting, DataBoard, Star, Warning, View, RefreshRight,
  Box, Goods, Bell, User, Sunny, ArrowDown, Expand, Fold
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const themeStore = useThemeStore()
const userStore = useAuthStore()

const isCollapse = ref(false)
const messageCount = ref(5)

const activeIndex = computed(() => route.path)

const breadcrumbs = computed(() => {
  const matched = route.matched.filter(item => item.meta && item.meta.title)
  const first = matched[0]
  
  if (!first || first.name !== 'Dashboard') {
    matched.unshift({ path: '/', meta: { title: '首页' } } as any)
  }
  
  return matched.map(item => ({
    path: item.path,
    title: item.meta?.title || '未知页面'
  }))
})

const menuBackgroundColor = computed(() => {
  switch (themeStore.currentTheme) {
    case 'dark':
      return '#2b2b2b'
    case 'factory':
      return 'rgba(0, 27, 46, 0.9)'
    default:
      return '#ffffff'
  }
})

const menuTextColor = computed(() => {
  switch (themeStore.currentTheme) {
    case 'dark':
      return '#e5eaf3'
    case 'factory':
      return '#ffffff'
    default:
      return '#303133'
  }
})

const menuActiveTextColor = computed(() => {
  switch (themeStore.currentTheme) {
    case 'dark':
      return '#409eff'
    case 'factory':
      return '#00d8ff'
    default:
      return '#409eff'
  }
})

const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
}

const handleSelect = (index: string) => {
  console.log('Selected menu:', index)
}

const handleThemeChange = (theme: string) => {
  themeStore.setTheme(theme as 'light' | 'dark' | 'factory')
  ElMessage.success(`已切换到${theme === 'light' ? '明亮' : theme === 'dark' ? '暗黑' : '工厂'}主题`)
}

const goToMessages = () => {
  router.push('/message/center')
}

const handleUserAction = (command: string) => {
  switch (command) {
    case 'profile':
      ElMessage.info('个人资料功能开发中...')
      break
    case 'settings':
      router.push('/system/param')
      break
    case 'logout':
      userStore.logout()
      router.push('/login')
      break
  }
}

// Watch for route changes to update breadcrumbs
watch(route, () => {
  // Update any reactive data based on route changes
}, { immediate: true })
</script>

<style scoped lang="scss">
.main-layout {
  height: 100vh;
  overflow: hidden;

  .layout-container {
    height: 100%;
  }

  .sidebar {
    background: var(--el-bg-color);
    border-right: 1px solid var(--el-border-color-light);
    transition: width 0.3s ease;

    .logo {
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 16px;
      border-bottom: 1px solid var(--el-border-color-light);

      .logo-text {
        margin-left: 12px;
        font-size: 18px;
        font-weight: 600;
        color: var(--el-text-color-primary);
        white-space: nowrap;
      }
    }

    :deep(.el-menu) {
      border-right: none;
      
      .el-sub-menu__title,
      .el-menu-item {
        height: 48px;
        line-height: 48px;
        
        &:hover {
          background-color: rgba(64, 158, 255, 0.1);
        }
      }

      .el-menu-item.is-active {
        background-color: rgba(64, 158, 255, 0.1);
        border-right: 3px solid var(--el-color-primary);
      }
    }
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 24px;
    background: var(--el-bg-color);
    border-bottom: 1px solid var(--el-border-color-light);
    box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);

    .header-left {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 16px;

      .message-badge {
        :deep(.el-badge__content) {
          top: 8px;
          right: 8px;
        }
      }

      .user-info {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;

        .username {
          font-size: 14px;
          color: var(--el-text-color-primary);
        }
      }
    }
  }

  .main-content {
    background: var(--el-bg-color-page);
    overflow-y: auto;
    padding: 0;
  }
}

// Factory theme
[data-theme="factory"] {
  .main-layout {
    .sidebar {
      background: rgba(0, 27, 46, 0.9);
      border-right: 1px solid rgba(0, 216, 255, 0.3);

      .logo {
        border-bottom: 1px solid rgba(0, 216, 255, 0.3);

        .logo-text {
          color: #00D8FF;
          text-shadow: 0 0 10px rgba(0, 216, 255, 0.5);
        }
      }

      :deep(.el-menu) {
        background: transparent;

        .el-sub-menu__title,
        .el-menu-item {
          color: #ffffff;
          
          &:hover {
            background-color: rgba(0, 216, 255, 0.1);
            color: #00D8FF;
          }
        }

        .el-menu-item.is-active {
          background-color: rgba(0, 216, 255, 0.2);
          border-right: 3px solid #00D8FF;
          color: #00D8FF;
          text-shadow: 0 0 8px rgba(0, 216, 255, 0.5);
        }
      }
    }

    .header {
      background: rgba(0, 27, 46, 0.9);
      border-bottom: 1px solid rgba(0, 216, 255, 0.3);
      box-shadow: 0 0 20px rgba(0, 216, 255, 0.1);

      .username {
        color: #00D8FF;
      }
    }

    .main-content {
      background: #001B2E;
    }
  }
}

// Dark theme
[data-theme="dark"] {
  .main-layout {
    .sidebar {
      background: var(--el-bg-color-overlay);
      border-right: 1px solid var(--el-border-color-darker);

      .logo {
        border-bottom: 1px solid var(--el-border-color-darker);

        .logo-text {
          color: var(--el-text-color-primary);
        }
      }
    }

    .header {
      background: var(--el-bg-color-overlay);
      border-bottom: 1px solid var(--el-border-color-darker);

      .username {
        color: var(--el-text-color-primary);
      }
    }
  }
}
</style> 