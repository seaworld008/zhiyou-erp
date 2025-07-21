import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@/types'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('token'))

  const isAuthenticated = computed(() => !!token.value)

  const login = async (username: string, password: string) => {
    // 模拟登录API调用
    if (username === 'erp' && password === '123456') {
      const mockUser: User = {
        id: '1',
        username: 'erp',
        email: 'admin@zhiyou.com',
        realName: '系统管理员',
        phone: '13800138000',
        department: 'IT部',
        position: '系统管理员',
        role: 'admin',
        avatar: undefined, // 使用文字头像而非URL
        permissions: ['*'],
        status: 'active',
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        loginCount: 1
      }
      
      user.value = mockUser
      token.value = 'mock-jwt-token'
      localStorage.setItem('token', token.value)
      localStorage.setItem('user', JSON.stringify(mockUser))
      
      return { success: true, message: '登录成功' }
    } else {
      return { success: false, message: '用户名或密码错误' }
    }
  }

  const logout = () => {
    user.value = null
    token.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  const initAuth = () => {
    const savedUser = localStorage.getItem('user')
    const savedToken = localStorage.getItem('token')
    
    console.log('🔍 Auth Init - Saved user:', savedUser)
    console.log('🔍 Auth Init - Saved token:', savedToken)
    
    if (savedUser && savedToken) {
      try {
        user.value = JSON.parse(savedUser)
        token.value = savedToken
        console.log('✅ Auth Init - User restored:', user.value)
      } catch (error) {
        console.error('❌ Auth Init - Error parsing user data:', error)
        localStorage.removeItem('user')
        localStorage.removeItem('token')
      }
    } else {
      console.log('ℹ️ Auth Init - No saved credentials found')
    }
  }

  // 初始化认证状态
  initAuth()

  return {
    user,
    token,
    isAuthenticated,
    login,
    logout,
    initAuth
  }
}) 