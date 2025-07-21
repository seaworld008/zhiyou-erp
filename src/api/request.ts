import axios from 'axios'
import type { AxiosRequestConfig, AxiosResponse } from 'axios'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import type { ApiResp } from '@/types'

// 创建axios实例
const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json;charset=UTF-8'
  }
})

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore()
    
    // 添加token到请求头
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  (response: AxiosResponse<ApiResp>) => {
    const { code, msg, data } = response.data

    // 业务成功
    if (code === 200 || code === 0) {
      return response
    }

    // 业务失败
    ElMessage.error(msg || '请求失败')
    return Promise.reject(new Error(msg || '请求失败'))
  },
  (error) => {
    const authStore = useAuthStore()
    
    if (error.response) {
      const { status, data } = error.response
      
      switch (status) {
        case 401:
          ElMessage.error('登录已过期，请重新登录')
          authStore.logout()
          window.location.href = '/login'
          break
        case 403:
          ElMessage.error('没有权限访问该资源')
          break
        case 404:
          ElMessage.error('请求的资源不存在')
          break
        case 500:
          ElMessage.error('服务器内部错误')
          break
        default:
          ElMessage.error(data?.msg || `请求失败(${status})`)
      }
    } else if (error.code === 'ECONNABORTED') {
      ElMessage.error('请求超时，请稍后重试')
    } else {
      ElMessage.error('网络连接异常，请检查网络')
    }
    
    return Promise.reject(error)
  }
)

// 封装请求方法
export const http = {
  async get<T = any>(url: string, params?: any, config?: AxiosRequestConfig): Promise<ApiResp<T>> {
    const response = await request.get(url, { params, ...config })
    return response.data
  },

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResp<T>> {
    const response = await request.post(url, data, config)
    return response.data
  },

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResp<T>> {
    const response = await request.put(url, data, config)
    return response.data
  },

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResp<T>> {
    const response = await request.delete(url, config)
    return response.data
  },

  async upload<T = any>(url: string, formData: FormData, config?: AxiosRequestConfig): Promise<ApiResp<T>> {
    const response = await request.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      ...config
    })
    return response.data
  }
}

export default request 