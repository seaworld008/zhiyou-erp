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
          <el-sub-menu index="9">
            <template #title>
              <el-icon><Bell /></el-icon>
              <span>消息中心</span>
            </template>
            <el-menu-item index="/message/center" route="/message/center">
              <el-icon><Bell /></el-icon>
              <span>消息列表</span>
            </el-menu-item>
          </el-sub-menu>

          <!-- Andon系统 -->
          <el-sub-menu index="10">
            <template #title>
              <el-icon><Warning /></el-icon>
              <span>Andon系统</span>
            </template>
            <el-menu-item index="/andon/system" route="/andon/system">
              <el-icon><Warning /></el-icon>
              <span>异常看板</span>
            </el-menu-item>
          </el-sub-menu>

          <!-- 报表中心 -->
          <el-sub-menu index="11">
            <template #title>
              <el-icon><TrendCharts /></el-icon>
              <span>报表中心</span>
            </template>
            <el-menu-item index="/reports/center" route="/reports/center">
              <el-icon><TrendCharts /></el-icon>
              <span>数据报表</span>
            </el-menu-item>
          </el-sub-menu>

          <!-- 系统管理 -->
          <el-sub-menu index="12">
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
@import '@/styles/responsive.scss';

.main-layout {
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  .layout-container {
    height: 100%;
    display: flex;
    flex: 1;
    min-height: 0;
  }

  .sidebar {
    background: var(--el-bg-color);
    border-right: 1px solid var(--el-border-color-light);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    flex-shrink: 0;
    position: relative;
    z-index: 100;
    
    @include respond-to(lg) {
      box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
    }
    
    @include respond-to(xl) {
      box-shadow: 4px 0 12px rgba(0, 0, 0, 0.08);
    }

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
      
      // 一级菜单项样式
      > .el-menu-item,
      > .el-sub-menu > .el-sub-menu__title {
        height: 48px;
        line-height: 48px;
        display: flex;
        align-items: center;
        padding: 0 20px;
        position: relative;
        transition: all 0.3s ease;
        
        &:hover {
          background-color: rgba(64, 158, 255, 0.08);
        }
        
        .el-icon {
          margin-right: 12px;
          width: 18px;
          height: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
        }
        
        span {
          flex: 1;
          font-weight: 500;
        }
      }
      
      // 一级菜单激活状态
      > .el-menu-item.is-active {
        background-color: rgba(64, 158, 255, 0.15);
        border-right: 4px solid var(--el-color-primary);
        color: var(--el-color-primary);
        font-weight: 600;
      }
      
      // 展开的子菜单容器
      .el-sub-menu.is-opened > .el-sub-menu__title {
        background-color: rgba(64, 158, 255, 0.12);
        color: var(--el-color-primary);
        font-weight: 600;
        
        span {
           background: linear-gradient(90deg, transparent, rgba(64, 158, 255, 0.1), transparent);
           padding: 2px 4px;
           border-radius: 3px;
         }
      }
      
      // 二级菜单项样式
      .el-sub-menu .el-menu {
        background-color: rgba(0, 0, 0, 0.02);
        
        .el-menu-item {
          height: 44px;
          line-height: 44px;
          padding-left: 52px; // 增加缩进
          padding-right: 20px;
          position: relative;
          transition: all 0.3s ease;
          
          &:hover {
            color: var(--el-text-color-primary);
          }
          
          .el-icon {
            margin-right: 10px;
            width: 16px;
            height: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            opacity: 0.8;
          }
          
          span {
            font-size: 14px;
            font-weight: 400;
          }
        }
        
        // 二级菜单激活状态
        .el-menu-item.is-active {
          background-color: rgba(64, 158, 255, 0.1);
          border-right: 3px solid var(--el-color-primary);
          color: var(--el-color-primary);
          font-weight: 600;
          
          .el-icon {
            opacity: 1;
            color: var(--el-color-primary);
          }
        }
      }
    }
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 20px;
    background: var(--el-bg-color);
    border-bottom: 1px solid var(--el-border-color-light);
    box-shadow: 0 2px 8px rgba(0, 21, 41, 0.06);
    height: 60px;
    flex-shrink: 0;
    position: relative;
    z-index: 99;
    backdrop-filter: blur(8px);
    
    @include respond-to(md) {
      padding: 0 24px;
      height: 64px;
    }
    
    @include respond-to(lg) {
      padding: 0 32px;
      height: 68px;
      box-shadow: 0 4px 12px rgba(0, 21, 41, 0.08);
    }
    
    @include respond-to(xl) {
      padding: 0 40px;
      height: 72px;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;
      
      @include respond-to(md) {
        gap: 16px;
      }
      
      @include respond-to(lg) {
        gap: 20px;
      }
      
      .collapse-btn {
        transition: all 0.3s ease;
        
        &:hover {
          transform: scale(1.1);
        }
      }
      
      .breadcrumb {
        @include respond-below(md) {
          display: none;
        }
      }
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 12px;
      
      @include respond-to(md) {
        gap: 16px;
      }
      
      @include respond-to(lg) {
        gap: 20px;
      }

      .message-badge {
        :deep(.el-badge__content) {
          top: 8px;
          right: 8px;
        }
        
        .el-button {
          transition: all 0.3s ease;
          
          &:hover {
            transform: translateY(-1px);
          }
        }
      }

      .user-info {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        border-radius: 8px;
        transition: all 0.3s ease;
        cursor: pointer;
        
        @include respond-to(lg) {
          padding: 10px 16px;
          border-radius: 12px;
        }
        
        &:hover {
          background: var(--el-bg-color-overlay);
          transform: translateY(-1px);
        }

        .username {
          font-size: 14px;
          color: var(--el-text-color-primary);
          font-weight: 500;
          
          @include respond-to(lg) {
            font-size: 15px;
          }
        }
      }
    }
  }

  .main-content {
    background: var(--el-bg-color-page);
    overflow-y: auto;
    overflow-x: hidden;
    padding: 0;
    flex: 1;
    min-height: 0;
    position: relative;
    
    // 自定义滚动条
    &::-webkit-scrollbar {
      width: 6px;
    }
    
    &::-webkit-scrollbar-track {
      background: transparent;
    }
    
    &::-webkit-scrollbar-thumb {
      background: rgba(0, 0, 0, 0.1);
      border-radius: 3px;
      transition: background 0.3s ease;
    }
    
    &::-webkit-scrollbar-thumb:hover {
      background: rgba(0, 0, 0, 0.2);
    }
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

        // 工厂主题一级菜单
        > .el-menu-item,
        > .el-sub-menu > .el-sub-menu__title {
          color: #ffffff;
          
          &:hover {
            background-color: rgba(0, 216, 255, 0.08);
            color: #00D8FF;
          }
        }
        
        > .el-menu-item.is-active {
          background-color: rgba(0, 216, 255, 0.2);
          border-right: 4px solid #00D8FF;
          color: #00D8FF;
        }
        
        .el-sub-menu.is-opened > .el-sub-menu__title {
          background-color: rgba(0, 216, 255, 0.15);
          color: #00D8FF;
          
          span {
             background: linear-gradient(90deg, transparent, rgba(0, 216, 255, 0.15), transparent);
             padding: 2px 4px;
             border-radius: 3px;
           }
        }
        
        // 工厂主题二级菜单
        .el-sub-menu .el-menu {
          background-color: rgba(0, 27, 46, 0.3);
          
          .el-menu-item {
            color: rgba(255, 255, 255, 0.9);
            
            &:hover {
              color: #00D8FF;
            }
          }
          
          .el-menu-item.is-active {
            background-color: rgba(0, 216, 255, 0.1);
            border-right: 3px solid #00D8FF;
            color: #00D8FF;
            font-weight: 600;
          }
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
      
      :deep(.el-menu) {
        // 暗黑主题一级菜单
        > .el-menu-item,
        > .el-sub-menu > .el-sub-menu__title {
          color: var(--el-text-color-primary);
          
          &:hover {
            background-color: rgba(64, 158, 255, 0.15);
          }
        }
        
        > .el-menu-item.is-active {
          background-color: rgba(64, 158, 255, 0.25);
          border-right: 4px solid var(--el-color-primary);
          color: var(--el-color-primary);
        }
        
        .el-sub-menu.is-opened > .el-sub-menu__title {
          background-color: rgba(64, 158, 255, 0.2);
          color: var(--el-color-primary);
          
          span {
             background: linear-gradient(90deg, transparent, rgba(64, 158, 255, 0.12), transparent);
             padding: 2px 4px;
             border-radius: 3px;
           }
        }
        
        // 暗黑主题二级菜单
        .el-sub-menu .el-menu {
          background-color: rgba(0, 0, 0, 0.1);
          
          .el-menu-item {
            color: var(--el-text-color-regular);
            
            &:hover {
              color: var(--el-text-color-primary);
            }
          }
          
          .el-menu-item.is-active {
            background-color: rgba(64, 158, 255, 0.15);
            border-right: 3px solid var(--el-color-primary);
            color: var(--el-color-primary);
            font-weight: 600;
          }
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