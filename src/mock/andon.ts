import type { AndonCall, AndonStats } from '@/types'

// Andon异常呼叫记录
export const mockAndonCalls: AndonCall[] = [
  {
    id: 'ANDON001',
    callNumber: 'AD20250117001',
    type: 'equipment',
    priority: 'urgent',
    title: '设备故障 - 注塑机停机',
    description: '注塑机主轴异响，已紧急停机，需要维修人员立即检查',
    location: '生产车间A区',
    workstation: '注塑工位-01',
    line: '生产线A',
    reportedBy: '陈林燕',
    reportedAt: '2025-01-17T14:30:00Z',
    status: 'in_progress',
    assignedTo: '维修工程师-张师傅',
    acknowledgedAt: '2025-01-17T14:32:00Z',
    responseTime: 2,
    images: ['/images/andon/equipment_001.jpg'],
    escalated: false
  },
  {
    id: 'ANDON002',
    callNumber: 'AD20250117002',
    type: 'material',
    priority: 'high',
    title: '原料短缺 - 塑料颗粒不足',
    description: 'PP原料仓库存量低于安全库存，影响生产计划',
    location: '原料仓库',
    workstation: '投料工位-02',
    line: '生产线A',
    reportedBy: '李明华',
    reportedAt: '2025-01-17T13:45:00Z',
    status: 'resolved',
    assignedTo: '物料管理员-王主管',
    acknowledgedAt: '2025-01-17T13:47:00Z',
    resolvedAt: '2025-01-17T14:15:00Z',
    responseTime: 2,
    resolutionTime: 30,
    resolutionNote: '已联系供应商紧急补货，预计明日上午到货',
    escalated: false
  },
  {
    id: 'ANDON003',
    callNumber: 'AD20250117003',
    type: 'quality',
    priority: 'high',
    title: '品质异常 - 产品尺寸超差',
    description: '最近3批产品检测发现尺寸超出公差范围，需要调整工艺参数',
    location: '品质检验区',
    workstation: '检验台-01',
    line: '生产线B',
    reportedBy: '王小红',
    reportedAt: '2025-01-17T12:20:00Z',
    status: 'closed',
    assignedTo: '工艺工程师-刘工',
    acknowledgedAt: '2025-01-17T12:22:00Z',
    resolvedAt: '2025-01-17T13:10:00Z',
    closedAt: '2025-01-17T13:15:00Z',
    responseTime: 2,
    resolutionTime: 50,
    resolutionNote: '已调整设备参数，重新校准模具，产品合格率恢复正常',
    images: ['/images/andon/quality_001.jpg', '/images/andon/quality_002.jpg']
  },
  {
    id: 'ANDON004',
    callNumber: 'AD20250117004',
    type: 'safety',
    priority: 'urgent',
    title: '安全事故 - 人员轻微受伤',
    description: '操作员操作时手部被划伤，已做初步处理，需要安全主管确认',
    location: '包装车间',
    workstation: '包装工位-05',
    line: '包装线C',
    reportedBy: '张伟强',
    reportedAt: '2025-01-17T11:10:00Z',
    status: 'closed',
    assignedTo: '安全主管-赵主管',
    acknowledgedAt: '2025-01-17T11:11:00Z',
    resolvedAt: '2025-01-17T11:45:00Z',
    closedAt: '2025-01-17T12:00:00Z',
    responseTime: 1,
    resolutionTime: 35,
    resolutionNote: '已送医院处理，无大碍。加强安全培训，更换防护设备',
    escalated: true,
    escalatedAt: '2025-01-17T11:15:00Z',
    escalatedTo: '安全总监'
  },
  {
    id: 'ANDON005',
    callNumber: 'AD20250117005',
    type: 'other',
    priority: 'medium',
    title: '环境异常 - 车间温度过高',
    description: '车间温度达到35°C，影响员工舒适度和产品质量',
    location: '生产车间B区',
    workstation: '全车间',
    line: '生产线B',
    reportedBy: '刘建国',
    reportedAt: '2025-01-17T10:30:00Z',
    status: 'resolved',
    assignedTo: '设施管理员-孙师傅',
    acknowledgedAt: '2025-01-17T10:35:00Z',
    resolvedAt: '2025-01-17T11:20:00Z',
    responseTime: 5,
    resolutionTime: 50,
    resolutionNote: '检查空调系统，清洁过滤网，增加通风设备',
    escalated: false
  },
  {
    id: 'ANDON006',
    callNumber: 'AD20250117006',
    type: 'equipment',
    priority: 'medium',
    title: '设备保养 - 传送带异响',
    description: '传送带运行时有异响，可能需要润滑或更换部件',
    location: '生产车间A区',
    workstation: '传送带-03',
    line: '生产线A',
    reportedBy: '周小丽',
    reportedAt: '2025-01-17T09:15:00Z',
    status: 'acknowledged',
    assignedTo: '维修工-马师傅',
    acknowledgedAt: '2025-01-17T09:20:00Z',
    responseTime: 5,
    escalated: false
  },
  {
    id: 'ANDON007',
    callNumber: 'AD20250117007',
    type: 'material',
    priority: 'low',
    title: '辅料申请 - 标签纸即将用完',
    description: '产品标签纸库存不足，需要及时补充',
    location: '包装车间',
    workstation: '贴标工位-02',
    line: '包装线B',
    reportedBy: '赵大伟',
    reportedAt: '2025-01-17T08:45:00Z',
    status: 'pending',
    escalated: false
  },
  {
    id: 'ANDON008',
    callNumber: 'AD20250117008',
    type: 'quality',
    priority: 'medium',
    title: '检验异常 - 测试设备故障',
    description: '产品硬度测试仪显示异常，需要校准或维修',
    location: '品质检验室',
    workstation: '硬度测试台',
    line: '品质线',
    reportedBy: '孙美玲',
    reportedAt: '2025-01-17T08:00:00Z',
    status: 'in_progress',
    assignedTo: '设备工程师-李工',
    acknowledgedAt: '2025-01-17T08:05:00Z',
    responseTime: 5,
    escalated: false
  }
]

// Andon统计数据
export const mockAndonStats: AndonStats = {
  totalCalls: 156,
  pendingCalls: 3,
  inProgressCalls: 5,
  resolvedToday: 12,
  avgResponseTime: 4.2,
  avgResolutionTime: 38.5,
  callsByType: {
    equipment: 68,
    material: 32,
    quality: 28,
    safety: 15,
    other: 13
  },
  callsByPriority: {
    low: 25,
    medium: 78,
    high: 41,
    urgent: 12
  }
}

// API模拟函数
export const getAndonCalls = async (params?: {
  status?: string
  type?: string
  priority?: string
  dateRange?: [string, string]
  page?: number
  pageSize?: number
}) => {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 300))
  
  let filteredCalls = [...mockAndonCalls]
  
  // 应用筛选条件
  if (params?.status) {
    filteredCalls = filteredCalls.filter(call => call.status === params.status)
  }
  
  if (params?.type) {
    filteredCalls = filteredCalls.filter(call => call.type === params.type)
  }
  
  if (params?.priority) {
    filteredCalls = filteredCalls.filter(call => call.priority === params.priority)
  }
  
  if (params?.dateRange) {
    const [startDate, endDate] = params.dateRange
    filteredCalls = filteredCalls.filter(call => {
      const callDate = call.reportedAt.split('T')[0]
      return callDate >= startDate && callDate <= endDate
    })
  }
  
  // 分页
  const page = params?.page || 1
  const pageSize = params?.pageSize || 10
  const startIndex = (page - 1) * pageSize
  const endIndex = startIndex + pageSize
  
  return {
    data: filteredCalls.slice(startIndex, endIndex),
    total: filteredCalls.length,
    page,
    pageSize
  }
}

export const getAndonStats = async () => {
  await new Promise(resolve => setTimeout(resolve, 200))
  return mockAndonStats
}

export const createAndonCall = async (callData: Partial<AndonCall>) => {
  await new Promise(resolve => setTimeout(resolve, 500))
  
  const newCall: AndonCall = {
    id: `ANDON${Date.now()}`,
    callNumber: `AD${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${String(mockAndonCalls.length + 1).padStart(3, '0')}`,
    type: callData.type || 'other',
    priority: callData.priority || 'medium',
    title: callData.title || '',
    description: callData.description || '',
    location: callData.location || '',
    workstation: callData.workstation || '',
    line: callData.line || '',
    reportedBy: callData.reportedBy || '当前用户',
    reportedAt: new Date().toISOString(),
    status: 'pending',
    escalated: false
  }
  
  mockAndonCalls.unshift(newCall)
  return newCall
}

export const updateAndonCall = async (id: string, updateData: Partial<AndonCall>) => {
  await new Promise(resolve => setTimeout(resolve, 400))
  
  const index = mockAndonCalls.findIndex(call => call.id === id)
  if (index !== -1) {
    mockAndonCalls[index] = { ...mockAndonCalls[index], ...updateData }
    return mockAndonCalls[index]
  }
  throw new Error('Andon call not found')
} 