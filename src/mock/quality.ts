// 品质管理模块Mock数据
import type { QualityDefect, QualityInspection, QualityStats } from '@/types'

// 品质异常数据
export const qualityDefects: QualityDefect[] = [
  {
    id: 'QD001',
    productCode: 'P20240115001',
    productName: '发动机缸体',
    defectType: '尺寸不符',
    severity: 'major',
    description: '气缸直径超出公差范围0.02mm',
    reportedBy: '张三',
    reportedAt: '2024-01-15T09:30:00',
    workstation: 'WS-001',
    batchNo: 'B240115-01',
    quantity: 5,
    status: 'open',
    images: ['defect_001.jpg', 'defect_002.jpg'],
    assignedTo: '质量工程师李四',
    rootCause: '',
    correctiveAction: '',
    preventiveAction: ''
  },
  {
    id: 'QD002',
    productCode: 'P20240115002',
    productName: '传动齿轮',
    defectType: '表面缺陷',
    severity: 'minor',
    description: '齿面有轻微划痕',
    reportedBy: '王五',
    reportedAt: '2024-01-15T14:20:00',
    workstation: 'WS-003',
    batchNo: 'B240115-03',
    quantity: 2,
    status: 'investigating',
    images: ['defect_003.jpg'],
    assignedTo: '质量工程师赵六',
    rootCause: '刀具磨损导致',
    correctiveAction: '更换刀具，重新加工',
    preventiveAction: '增加刀具检查频次'
  },
  {
    id: 'QD003',
    productCode: 'P20240114001',
    productName: '活塞组件',
    defectType: '材料问题',
    severity: 'critical',
    description: '材质硬度不达标',
    reportedBy: '刘七',
    reportedAt: '2024-01-14T16:45:00',
    workstation: 'WS-005',
    batchNo: 'B240114-02',
    quantity: 50,
    status: 'closed',
    images: ['defect_004.jpg', 'defect_005.jpg'],
    assignedTo: '质量工程师孙八',
    rootCause: '原材料供应商变更，材料规格不符',
    correctiveAction: '退回不合格批次，重新采购',
    preventiveAction: '加强供应商审核，建立材料入库检验'
  }
]

// 质量检验数据
export const qualityInspections: QualityInspection[] = [
  {
    id: 'QI001',
    productCode: 'P20240115001',
    productName: '发动机缸体',
    batchNo: 'B240115-01',
    inspectionType: 'incoming',
    inspector: '张三',
    inspectedAt: '2024-01-15T08:00:00',
    samplingQty: 10,
    defectQty: 1,
    passRate: 90,
    result: 'reject',
    remarks: '尺寸超差',
    checkItems: [
      {
        item: '外径',
        standard: '100±0.05mm',
        measured: '100.08mm',
        result: 'fail'
      },
      {
        item: '内径',
        standard: '85±0.03mm',
        measured: '85.02mm',
        result: 'pass'
      },
      {
        item: '表面粗糙度',
        standard: 'Ra≤1.6',
        measured: 'Ra1.2',
        result: 'pass'
      }
    ]
  },
  {
    id: 'QI002',
    productCode: 'P20240115002',
    productName: '传动齿轮',
    batchNo: 'B240115-02',
    inspectionType: 'process',
    inspector: '李四',
    inspectedAt: '2024-01-15T10:30:00',
    samplingQty: 5,
    defectQty: 0,
    passRate: 100,
    result: 'pass',
    remarks: '全部合格',
    checkItems: [
      {
        item: '齿距',
        standard: '3.14±0.01mm',
        measured: '3.141mm',
        result: 'pass'
      },
      {
        item: '齿高',
        standard: '2.5±0.02mm',
        measured: '2.499mm',
        result: 'pass'
      }
    ]
  }
]

// 质量统计数据
export const qualityStats: QualityStats = {
  dailyDefectRate: 2.5,
  weeklyDefectRate: 3.2,
  monthlyDefectRate: 2.8,
  totalDefects: 156,
  openDefects: 23,
  resolvedDefects: 133,
  inspectionCount: 1250,
  passedInspections: 1188,
  overallPassRate: 95.04,
  topDefectTypes: [
    { type: '尺寸不符', count: 45, percentage: 28.8 },
    { type: '表面缺陷', count: 32, percentage: 20.5 },
    { type: '材料问题', count: 28, percentage: 17.9 },
    { type: '装配错误', count: 25, percentage: 16.0 },
    { type: '其他', count: 26, percentage: 16.8 }
  ]
}

// Mock API函数
export function getQualityDefects(params?: any) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        data: {
          list: qualityDefects,
          total: qualityDefects.length
        }
      })
    }, 300)
  })
}

export function getQualityInspections(params?: any) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        data: {
          list: qualityInspections,
          total: qualityInspections.length
        }
      })
    }, 300)
  })
}

export function getQualityStats() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        data: qualityStats
      })
    }, 300)
  })
}

export function createQualityDefect(data: any) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        message: '质量异常记录创建成功'
      })
    }, 500)
  })
}

export function updateQualityDefect(id: string, data: any) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        message: '质量异常记录更新成功'
      })
    }, 500)
  })
}

export function createQualityInspection(data: any) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        message: '质量检验记录创建成功'
      })
    }, 500)
  })
} 