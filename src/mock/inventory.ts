// 仓储管理模块Mock数据
import type { InventoryItem, InventoryStats } from '@/types'

export const inventoryItems: InventoryItem[] = [
  {
    id: 'INV001',
    code: 'MAT-001',
    name: '钢材板材',
    category: '原材料',
    specification: 'Q235B 10mm*1500mm*6000mm',
    unit: '张',
    currentStock: 85,
    minStock: 50,
    maxStock: 200,
    location: 'A区-001',
    supplier: '宝钢集团',
    unitPrice: 1250.00,
    totalValue: 106250.00,
    lastInDate: '2024-01-10',
    lastOutDate: '2024-01-14',
    status: 'normal'
  },
  {
    id: 'INV002',
    code: 'PART-001',
    name: '标准螺栓',
    category: '标准件',
    specification: 'M12*40 304不锈钢',
    unit: '个',
    currentStock: 25,
    minStock: 100,
    maxStock: 1000,
    location: 'B区-015',
    supplier: '标准件厂',
    unitPrice: 2.50,
    totalValue: 62.50,
    lastInDate: '2024-01-05',
    lastOutDate: '2024-01-15',
    status: 'low_stock'
  },
  {
    id: 'INV003',
    code: 'TOOL-001',
    name: '铣刀',
    category: '刀具',
    specification: 'HSS φ20mm 4刃',
    unit: '支',
    currentStock: 0,
    minStock: 10,
    maxStock: 50,
    location: 'C区-008',
    supplier: '刀具公司',
    unitPrice: 85.00,
    totalValue: 0,
    lastInDate: '2023-12-20',
    lastOutDate: '2024-01-12',
    status: 'out_of_stock'
  },
  {
    id: 'INV004',
    code: 'MAT-002',
    name: '铝合金型材',
    category: '原材料',
    specification: '6061-T6 40*40*3mm',
    unit: '米',
    currentStock: 1500,
    minStock: 500,
    maxStock: 2000,
    location: 'A区-002',
    supplier: '中铝集团',
    unitPrice: 45.80,
    totalValue: 68700.00,
    lastInDate: '2024-01-12',
    lastOutDate: '2024-01-15',
    status: 'normal'
  },
  {
    id: 'INV005',
    code: 'PART-002',
    name: '轴承',
    category: '标准件',
    specification: '6204-2RS 深沟球轴承',
    unit: '个',
    currentStock: 48,
    minStock: 20,
    maxStock: 100,
    location: 'B区-008',
    supplier: 'SKF轴承',
    unitPrice: 125.00,
    totalValue: 6000.00,
    lastInDate: '2024-01-08',
    lastOutDate: '2024-01-13',
    status: 'normal'
  },
  {
    id: 'INV006',
    code: 'ELEC-001',
    name: '变频器',
    category: '电气元件',
    specification: '三菱FR-E740 0.75KW',
    unit: '台',
    currentStock: 8,
    minStock: 5,
    maxStock: 20,
    location: 'D区-001',
    supplier: '三菱电机',
    unitPrice: 1850.00,
    totalValue: 14800.00,
    lastInDate: '2024-01-06',
    lastOutDate: '2024-01-11',
    status: 'normal'
  },
  {
    id: 'INV007',
    code: 'CHEM-001',
    name: '切削液',
    category: '化工用品',
    specification: '金属加工用半合成切削液',
    unit: '桶',
    currentStock: 2,
    minStock: 5,
    maxStock: 30,
    location: 'E区-003',
    supplier: '嘉实多',
    unitPrice: 380.00,
    totalValue: 760.00,
    lastInDate: '2023-12-28',
    lastOutDate: '2024-01-14',
    status: 'low_stock'
  },
  {
    id: 'INV008',
    code: 'PACK-001',
    name: '包装材料',
    category: '包装用品',
    specification: '瓦楞纸箱 500*400*300mm',
    unit: '个',
    currentStock: 2500,
    minStock: 500,
    maxStock: 1000,
    location: 'F区-001',
    supplier: '包装公司',
    unitPrice: 3.20,
    totalValue: 8000.00,
    lastInDate: '2024-01-09',
    lastOutDate: '2024-01-15',
    status: 'overstock'
  }
]

export const inventoryStats: InventoryStats = {
  totalItems: 156,
  totalValue: 2350000,
  lowStockItems: 12,
  outOfStockItems: 3,
  overstockItems: 5,
  turnoverRate: 85.5
}

// 出入库记录
export const stockMovements = [
  {
    id: 'MOV001',
    itemCode: 'MAT-001',
    itemName: '钢材板材',
    type: 'in',
    quantity: 20,
    unit: '张',
    operator: '张三',
    date: '2024-01-10T08:30:00',
    reason: '采购入库',
    supplier: '宝钢集团',
    orderNo: 'PO20240110001'
  },
  {
    id: 'MOV002',
    itemCode: 'MAT-001',
    itemName: '钢材板材',
    type: 'out',
    quantity: 5,
    unit: '张',
    operator: '李四',
    date: '2024-01-14T14:20:00',
    reason: '生产领料',
    workOrder: 'WO20240114001',
    department: '生产部'
  },
  {
    id: 'MOV003',
    itemCode: 'TOOL-001',
    itemName: '铣刀',
    type: 'out',
    quantity: 2,
    unit: '支',
    operator: '王五',
    date: '2024-01-12T09:15:00',
    reason: '工具领用',
    workOrder: 'WO20240112002',
    department: '机加工车间'
  }
]

// 库存预警
export const stockAlerts = [
  {
    id: 'ALERT001',
    itemCode: 'PART-001',
    itemName: '标准螺栓',
    alertType: 'low_stock',
    currentStock: 25,
    minStock: 100,
    severity: 'high',
    message: '库存不足，需要补充',
    createdAt: '2024-01-15T08:00:00'
  },
  {
    id: 'ALERT002',
    itemCode: 'TOOL-001',
    itemName: '铣刀',
    alertType: 'out_of_stock',
    currentStock: 0,
    minStock: 10,
    severity: 'critical',
    message: '库存已用完，急需补货',
    createdAt: '2024-01-12T16:30:00'
  },
  {
    id: 'ALERT003',
    itemCode: 'CHEM-001',
    itemName: '切削液',
    alertType: 'low_stock',
    currentStock: 2,
    minStock: 5,
    severity: 'medium',
    message: '库存偏低，建议补充',
    createdAt: '2024-01-14T10:45:00'
  }
]

export function getInventoryItems(params?: any) {
  return new Promise((resolve) => {
    setTimeout(() => {
      let filteredItems = [...inventoryItems]
      
      if (params?.category) {
        filteredItems = filteredItems.filter(item => item.category === params.category)
      }
      
      if (params?.status) {
        filteredItems = filteredItems.filter(item => item.status === params.status)
      }
      
      if (params?.keyword) {
        filteredItems = filteredItems.filter(item => 
          item.name.includes(params.keyword) || 
          item.code.includes(params.keyword)
        )
      }
      
      resolve({
        code: 200,
        data: {
          list: filteredItems,
          total: filteredItems.length
        }
      })
    }, 300)
  })
}

export function getInventoryStats() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        data: inventoryStats
      })
    }, 300)
  })
}

export function getStockMovements(params?: any) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        data: {
          list: stockMovements,
          total: stockMovements.length
        }
      })
    }, 300)
  })
}

export function getStockAlerts() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        data: stockAlerts
      })
    }, 300)
  })
}

export function updateInventoryItem(id: string, data: any) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        message: '库存信息更新成功'
      })
    }, 500)
  })
}

export function createStockMovement(data: any) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        message: '出入库记录创建成功'
      })
    }, 500)
  })
} 