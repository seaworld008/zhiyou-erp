// 设备管理模块Mock数据
import type { Equipment, EquipmentStats } from '@/types'

// 设备数据
export const equipmentList: Equipment[] = [
  {
    id: 'EQ001',
    code: 'CNC-001',
    name: 'CNC加工中心1号',
    type: '加工设备',
    model: 'VMC850',
    manufacturer: '大连机床',
    location: '车间A-001',
    status: 'running',
    installDate: '2023-01-15',
    lastMaintenanceDate: '2024-01-10',
    nextMaintenanceDate: '2024-04-10',
    operationHours: 2850,
    efficiency: 95.5,
    operator: '张师傅',
    description: '主要用于发动机缸体加工'
  },
  {
    id: 'EQ002',
    code: 'CNC-002',
    name: 'CNC加工中心2号',
    type: '加工设备',
    model: 'VMC650',
    manufacturer: '沈阳机床',
    location: '车间A-002',
    status: 'maintenance',
    installDate: '2023-03-20',
    lastMaintenanceDate: '2024-01-15',
    nextMaintenanceDate: '2024-04-15',
    operationHours: 2650,
    efficiency: 88.2,
    operator: '李师傅',
    description: '主要用于传动件加工'
  },
  {
    id: 'EQ003',
    code: 'WELD-001',
    name: '焊接机器人1号',
    type: '焊接设备',
    model: 'IRB1600',
    manufacturer: 'ABB',
    location: '车间B-001',
    status: 'running',
    installDate: '2023-06-10',
    lastMaintenanceDate: '2024-01-08',
    nextMaintenanceDate: '2024-07-08',
    operationHours: 1920,
    efficiency: 92.8,
    operator: '王师傅',
    description: '自动焊接生产线'
  },
  {
    id: 'EQ004',
    code: 'PRESS-001',
    name: '液压机1号',
    type: '冲压设备',
    model: 'YW32-315',
    manufacturer: '济南二机床',
    location: '车间C-001',
    status: 'fault',
    installDate: '2022-08-15',
    lastMaintenanceDate: '2023-12-20',
    nextMaintenanceDate: '2024-03-20',
    operationHours: 4200,
    efficiency: 0,
    operator: '赵师傅',
    description: '故障：液压系统泄漏'
  },
  {
    id: 'EQ005',
    code: 'CONV-001',
    name: '输送线1号',
    type: '输送设备',
    model: 'BL-100',
    manufacturer: '本地制造',
    location: '总装车间',
    status: 'stopped',
    installDate: '2023-09-01',
    lastMaintenanceDate: '2024-01-05',
    nextMaintenanceDate: '2024-04-05',
    operationHours: 1580,
    efficiency: 96.3,
    operator: '刘师傅',
    description: '暂停：等待上游工序'
  }
]

// 设备统计数据
export const equipmentStats: EquipmentStats = {
  totalEquipment: 24,
  runningEquipment: 18,
  stoppedEquipment: 3,
  maintenanceEquipment: 2,
  faultEquipment: 1,
  overallEfficiency: 89.6,
  avgOperationHours: 2640
}

// Mock API函数
export function getEquipmentList(params?: any) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        data: {
          list: equipmentList,
          total: equipmentList.length
        }
      })
    }, 300)
  })
}

export function getEquipmentStats() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        data: equipmentStats
      })
    }, 300)
  })
}

export function updateEquipment(id: string, data: any) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        message: '设备信息更新成功'
      })
    }, 500)
  })
}

export function createMaintenance(data: any) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        message: '维护记录创建成功'
      })
    }, 500)
  })
} 