// API统一导出入口
export * from './request'
export * from './dashboard'

// 重新导出常用的http方法
export { http } from './request'

// 为了兼容现有的mock API调用，创建一个适配函数
export const useMockApi = <T>(mockFunction: () => Promise<any>, realApiCall?: () => Promise<T>) => {
  // 开发环境使用mock，生产环境使用真实API
  const isDev = import.meta.env.DEV
  const useMock = import.meta.env.VITE_USE_MOCK === 'true'
  
  if ((isDev && useMock) || !realApiCall) {
    return mockFunction()
  }
  
  return realApiCall()
} 