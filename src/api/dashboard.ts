import { http } from './request'
import type { DashboardKpis, HourlyOutputPoint, AbnormalItem, WorkOrderSummary, TodoItem, WorkstationStatus } from '@/types'

// 仪表盘数据类型
export interface DashboardData {
  date: string
  kpis: DashboardKpis
  hourly_output: HourlyOutputPoint[]
  abnormal: AbnormalItem[]
  recent_workorders: WorkOrderSummary[]
  todos: TodoItem[]
  workstations: WorkstationStatus[]
}

// 获取仪表盘数据
export const getDashboardData = (params?: {
  date?: string
  shift?: string
  line?: string
}) => {
  return http.get<DashboardData>('/dashboard/overview', params)
}

// 获取KPI数据
export const getKpiData = (params?: {
  date?: string
  dateRange?: [string, string]
}) => {
  return http.get<DashboardKpis>('/dashboard/kpis', params)
}

// 获取每小时产量数据
export const getHourlyOutput = (params?: {
  date?: string
  line?: string
  shift?: string
}) => {
  return http.get<HourlyOutputPoint[]>('/dashboard/hourly-output', params)
}

// 获取异常分布数据
export const getAbnormalData = (params?: {
  date?: string
  line?: string
}) => {
  return http.get<AbnormalItem[]>('/dashboard/abnormal', params)
}

// 获取最近工单
export const getRecentWorkOrders = (params?: {
  limit?: number
  status?: string
}) => {
  return http.get<WorkOrderSummary[]>('/dashboard/recent-workorders', params)
}

// 获取待办事项
export const getTodoList = (params?: {
  priority?: string
  type?: string
}) => {
  return http.get<TodoItem[]>('/dashboard/todos', params)
}

// 获取工位状态
export const getWorkstationStatus = (params?: {
  line?: string
}) => {
  return http.get<WorkstationStatus[]>('/dashboard/workstations', params)
}

// 刷新仪表盘数据
export const refreshDashboard = () => {
  return http.post<null>('/dashboard/refresh')
} 