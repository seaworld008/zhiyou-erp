import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/Login.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/',
      component: () => import('@/layouts/MainLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          redirect: '/dashboard'
        },
        {
          path: '/dashboard',
          name: 'Dashboard',
          component: () => import('@/views/Dashboard.vue')
        },
        {
          path: '/workstation',
          name: 'WorkstationBoard',
          component: () => import('@/views/WorkstationBoard.vue')
        },
        // SOP模块
        {
          path: '/sop/list',
          name: 'SopList',
          component: () => import('@/views/SopList.vue')
        },
        {
          path: '/sop/play',
          name: 'SopPlay',
          component: () => import('@/views/SopPlay.vue')
        },
        {
          path: '/sop/ack',
          name: 'SopAck',
          component: () => import('@/views/SopAck.vue')
        },
        // 绩效模块
        {
          path: '/performance/today',
          name: 'PerfToday',
          component: () => import('@/views/PerfToday.vue')
        },
        {
          path: '/performance/time',
          name: 'PerfTime',
          component: () => import('@/views/PerfTime.vue')
        },
        // 考勤模块
        {
          path: '/attendance/records',
          name: 'AttendanceRecords',
          component: () => import('@/views/AttendanceRecord.vue')
        },
        {
          path: '/attendance/schedule',
          name: 'AttendanceSchedule',
          component: () => import('@/views/AttendanceSchedule.vue')
        },
        {
          path: '/attendance/approval',
          name: 'AttendanceApproval',
          component: () => import('@/views/AttendanceApproval.vue')
        },
        // 设备管理
        {
          path: '/equipment/list',
          name: 'EquipmentList',
          component: () => import('@/views/EquipmentList.vue')
        },
        {
          path: '/equipment/check',
          name: 'EquipmentCheck',
          component: () => import('@/views/EquipmentCheck.vue')
        },
        {
          path: '/equipment/oee',
          name: 'EquipmentOee',
          component: () => import('@/views/EquipmentOee.vue')
        },
        // 品质管理
        {
          path: '/quality/defect',
          name: 'QualityDefect',
          component: () => import('@/views/QualityDefect.vue')
        },
        {
          path: '/quality/inspect',
          name: 'QualityInspect',
          component: () => import('@/views/QualityInspect.vue')
        },
        {
          path: '/quality/rework',
          name: 'QualityRework',
          component: () => import('@/views/QualityRework.vue')
        },
        // 仓储管理
        {
          path: '/inventory/stock',
          name: 'InventoryStock',
          component: () => import('@/views/InventoryStock.vue')
        },
        {
          path: '/inventory/io',
          name: 'InventoryIO',
          component: () => import('@/views/InventoryIO.vue')
        },
        // 生产管理
        {
          path: '/production/orders',
          name: 'ProductionOrders',
          component: () => import('@/views/ProductionOrders.vue')
        },
        {
          path: '/production/piece',
          name: 'ProductionPiece',
          component: () => import('@/views/ProductionPiece.vue')
        },
        // 消息中心
        {
          path: '/message/center',
          name: 'MessageCenter',
          component: () => import('@/views/MessageCenter.vue')
        },
        // Andon系统
        {
          path: '/andon/system',
          name: 'AndonSystem',
          component: () => import('@/views/AndonSystem.vue')
        },
        // 系统管理
        {
          path: '/system/param',
          name: 'SystemParam',
          component: () => import('@/views/SystemParam.vue')
        },
        {
          path: '/system/log',
          name: 'SystemLog',
          component: () => import('@/views/SystemLog.vue')
        },
        // 报表中心
        {
          path: '/reports/center',
          name: 'ReportsCenter',
          component: () => import('@/views/ReportsCenter.vue')
        },
        {
          path: '/users',
          name: 'UserManagement',
          component: () => import('@/views/UserManagement.vue')
        }
      ]
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/'
    }
  ]
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // 确保认证状态已初始化
  authStore.initAuth()
  
  // 如果访问的是登录页面
  if (to.path === '/login') {
    if (authStore.isAuthenticated) {
      next('/') // 已登录则跳转到首页
    } else {
      next() // 未登录则正常访问登录页
    }
    return
  }
  
  // 如果访问的是需要认证的页面
  if (to.meta.requiresAuth !== false && !authStore.isAuthenticated) {
    next('/login') // 未登录则跳转到登录页
  } else {
    next() // 已登录或不需要认证则正常访问
  }
})

export default router
