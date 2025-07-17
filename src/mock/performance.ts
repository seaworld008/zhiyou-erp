import type { 
  PerfTimeReport, 
  PerfPiece, 
  PerfSalary, 
  TodayPerformance, 
  DepartmentPerformance, 
  ShiftPerformance, 
  TodayTrend 
} from '@/types'

// 工时汇报数据
export const mockTimeReports: PerfTimeReport[] = [
  {
    id: 'TR001',
    emp_id: 'EMP001',
    emp_name: '陈林燕',
    department: '生产部',
    position: '操作员',
    workstation: '工位-01',
    shift: '白班',
    date: '2025-01-17',
    start: '08:00',
    end: '17:00',
    type: 'normal',
    hours: 9,
    breakTime: 1,
    actualHours: 8,
    status: 'approved',
    submittedAt: '2025-01-17T17:30:00Z',
    approvedAt: '2025-01-17T18:00:00Z',
    approver: '班组长',
    description: '正常工作'
  },
  {
    id: 'TR002',
    emp_id: 'EMP001',
    emp_name: '陈林燕',
    department: '生产部',
    position: '操作员',
    workstation: '工位-01',
    shift: '加班',
    date: '2025-01-17',
    start: '17:00',
    end: '19:00',
    type: 'ot',
    hours: 2,
    breakTime: 0,
    actualHours: 2,
    status: 'approved',
    submittedAt: '2025-01-17T19:30:00Z',
    approvedAt: '2025-01-17T20:00:00Z',
    approver: '班组长',
    description: '加班赶工期'
  },
  {
    id: 'TR003',
    emp_id: 'EMP002',
    emp_name: '李明华',
    department: '生产部',
    position: '技术员',
    workstation: '工位-02',
    shift: '白班',
    date: '2025-01-17',
    start: '08:00',
    end: '17:00',
    type: 'normal',
    hours: 9,
    breakTime: 1,
    actualHours: 8,
    status: 'submitted',
    submittedAt: '2025-01-17T17:30:00Z',
    description: '设备调试'
  },
  {
    id: 'TR004',
    emp_id: 'EMP003',
    emp_name: '王小红',
    department: '品质部',
    position: '检验员',
    workstation: '检验台-01',
    shift: '白班',
    date: '2025-01-17',
    start: '08:00',
    end: '12:00',
    type: 'leave',
    hours: 4,
    breakTime: 0,
    actualHours: 4,
    status: 'approved',
    submittedAt: '2025-01-17T12:30:00Z',
    approvedAt: '2025-01-17T13:00:00Z',
    approver: '部门主管',
    description: '事假半天'
  },
  {
    id: 'TR005',
    emp_id: 'EMP004',
    emp_name: '张伟强',
    department: '生产部',
    position: '操作员',
    workstation: '工位-03',
    shift: '夜班',
    date: '2025-01-16',
    start: '20:00',
    end: '06:00',
    type: 'normal',
    hours: 10,
    breakTime: 1,
    actualHours: 9,
    status: 'approved',
    submittedAt: '2025-01-17T06:30:00Z',
    approvedAt: '2025-01-17T07:00:00Z',
    approver: '班组长',
    description: '夜班正常工作'
  },
  {
    id: 'TR006',
    emp_id: 'EMP005',
    emp_name: '刘建国',
    department: '技术部',
    position: '工程师',
    workstation: '设计室',
    shift: '白班',
    date: '2025-01-17',
    start: '08:30',
    end: '17:30',
    type: 'normal',
    hours: 9,
    breakTime: 1,
    actualHours: 8,
    status: 'draft',
    description: '产品设计'
  },
  {
    id: 'TR007',
    emp_id: 'EMP006',
    emp_name: '周小丽',
    department: '品质部',
    position: '主管',
    workstation: '质检室',
    shift: '白班',
    date: '2025-01-17',
    start: '08:00',
    end: '17:00',
    type: 'normal',
    hours: 9,
    breakTime: 1,
    actualHours: 8,
    status: 'submitted',
    submittedAt: '2025-01-17T17:30:00Z',
    description: '品质检验指导'
  },
  {
    id: 'TR008',
    emp_id: 'EMP007',
    emp_name: '赵大伟',
    department: '维修部',
    position: '维修工',
    workstation: '维修车间',
    shift: '白班',
    date: '2025-01-17',
    start: '08:00',
    end: '15:00',
    type: 'sick',
    hours: 7,
    breakTime: 1,
    actualHours: 6,
    status: 'approved',
    submittedAt: '2025-01-17T15:30:00Z',
    approvedAt: '2025-01-17T16:00:00Z',
    approver: '部门主管',
    description: '身体不适，提前下班'
  },
  {
    id: 'TR009',
    emp_id: 'EMP008',
    emp_name: '孙美玲',
    department: '仓储部',
    position: '仓管员',
    workstation: '原料仓',
    shift: '白班',
    date: '2025-01-17',
    start: '08:00',
    end: '20:00',
    type: 'ot',
    hours: 12,
    breakTime: 2,
    actualHours: 10,
    status: 'submitted',
    submittedAt: '2025-01-17T20:30:00Z',
    description: '盘点库存，加班4小时'
  },
  {
    id: 'TR010',
    emp_id: 'EMP009',
    emp_name: '马志强',
    department: '生产部',
    position: '班组长',
    workstation: '生产线A',
    shift: '白班',
    date: '2025-01-17',
    start: '07:30',
    end: '17:30',
    type: 'normal',
    hours: 10,
    breakTime: 1,
    actualHours: 9,
    status: 'approved',
    submittedAt: '2025-01-17T17:45:00Z',
    approvedAt: '2025-01-17T18:00:00Z',
    approver: '生产主管',
    description: '班组管理，提前半小时到岗'
  }
]

// 计件数据
export const mockPieceReports: PerfPiece[] = [
  {
    id: 'PC001',
    emp_id: 'EMP001',
    emp_name: '陈林燕',
    workorder_id: 'XSDD1710005',
    process_code: 'ASM-001',
    qty: 150,
    unit_price: 0.8,
    amount: 120,
    date: '2025-01-17'
  },
  {
    id: 'PC002',
    emp_id: 'EMP001',
    emp_name: '陈林燕',
    workorder_id: 'XSDD1710006',
    process_code: 'ASM-001',
    qty: 85,
    unit_price: 0.8,
    amount: 68,
    date: '2025-01-17'
  },
  {
    id: 'PC003',
    emp_id: 'EMP002',
    emp_name: '李明华',
    workorder_id: 'XSDD1710006',
    process_code: 'ASM-002',
    qty: 95,
    unit_price: 1.2,
    amount: 114,
    date: '2025-01-17'
  },
  {
    id: 'PC004',
    emp_id: 'EMP002',
    emp_name: '李明华',
    workorder_id: 'XSDD1710007',
    process_code: 'ASM-002',
    qty: 60,
    unit_price: 1.2,
    amount: 72,
    date: '2025-01-17'
  },
  {
    id: 'PC005',
    emp_id: 'EMP004',
    emp_name: '张伟强',
    workorder_id: 'XSDD1710008',
    process_code: 'PCK-001',
    qty: 280,
    unit_price: 0.3,
    amount: 84,
    date: '2025-01-17'
  },
  {
    id: 'PC006',
    emp_id: 'EMP005',
    emp_name: '刘晓敏',
    workorder_id: 'XSDD1710005',
    process_code: 'TEST-001',
    qty: 45,
    unit_price: 1.8,
    amount: 81,
    date: '2025-01-17'
  }
]

// 工资数据
export const mockSalaryReports: PerfSalary[] = [
  {
    emp_id: 'EMP001',
    emp_name: '陈林燕',
    base: 4500,
    piece_amt: 2880,
    overtime_amt: 320,
    penalty: 0,
    total: 7700,
    month: '2025-01'
  },
  {
    emp_id: 'EMP002',
    emp_name: '李明华',
    base: 4800,
    piece_amt: 3420,
    overtime_amt: 180,
    penalty: -50,
    total: 8350,
    month: '2025-01'
  },
  {
    emp_id: 'EMP003',
    emp_name: '王小红',
    base: 4200,
    piece_amt: 2150,
    overtime_amt: 0,
    penalty: -100,
    total: 6250,
    month: '2025-01'
  },
  {
    emp_id: 'EMP004',
    emp_name: '张伟强',
    base: 4000,
    piece_amt: 2680,
    overtime_amt: 450,
    penalty: 0,
    total: 7130,
    month: '2025-01'
  },
  {
    emp_id: 'EMP005',
    emp_name: '刘晓敏',
    base: 5200,
    piece_amt: 3850,
    overtime_amt: 120,
    penalty: 0,
    total: 9170,
    month: '2025-01'
  },
  {
    emp_id: 'EMP006',
    emp_name: '赵建国',
    base: 4600,
    piece_amt: 3200,
    overtime_amt: 380,
    penalty: -80,
    total: 8100,
    month: '2025-01'
  }
]

// 今日业绩统计
export const getTodayPerformance = () => {
  const today = new Date().toISOString().split('T')[0]
  
  // 扩展的员工今日业绩数据
  const todayPerformanceData = [
    {
      emp_id: 'EMP001',
      emp_name: '陈林燕',
      department: '生产一部',
      position: '装配工',
      workstation: '工位-01',
      shift: '白班',
      total_hours: 10.5,
      normal_hours: 8.5,
      ot_hours: 2.0,
      piece_qty: 235,
      piece_amount: 188.0,
      target_qty: 200,
      achievement_rate: 117.5,
      efficiency_score: 95.2,
      quality_score: 98.5,
      attendance_status: '在岗',
      last_update: '2025-01-17T16:30:00Z'
    },
    {
      emp_id: 'EMP002',
      emp_name: '李明华',
      department: '生产一部',
      position: '技术员',
      workstation: '工位-02',
      shift: '白班',
      total_hours: 9.0,
      normal_hours: 8.0,
      ot_hours: 1.0,
      piece_qty: 186,
      piece_amount: 223.2,
      target_qty: 180,
      achievement_rate: 103.3,
      efficiency_score: 88.7,
      quality_score: 96.8,
      attendance_status: '在岗',
      last_update: '2025-01-17T16:25:00Z'
    },
    {
      emp_id: 'EMP003',
      emp_name: '王小红',
      department: '生产一部',
      position: '操作员',
      workstation: '工位-03',
      shift: '白班',
      total_hours: 8.0,
      normal_hours: 8.0,
      ot_hours: 0.0,
      piece_qty: 142,
      piece_amount: 113.6,
      target_qty: 150,
      achievement_rate: 94.7,
      efficiency_score: 82.3,
      quality_score: 94.2,
      attendance_status: '在岗',
      last_update: '2025-01-17T16:20:00Z'
    },
    {
      emp_id: 'EMP004',
      emp_name: '张伟强',
      department: '生产二部',
      position: '包装工',
      workstation: '工位-04',
      shift: '白班',
      total_hours: 8.5,
      normal_hours: 8.0,
      ot_hours: 0.5,
      piece_qty: 340,
      piece_amount: 102.0,
      target_qty: 320,
      achievement_rate: 106.3,
      efficiency_score: 91.8,
      quality_score: 99.1,
      attendance_status: '在岗',
      last_update: '2025-01-17T16:35:00Z'
    },
    {
      emp_id: 'EMP005',
      emp_name: '刘晓敏',
      department: '生产二部',
      position: '检验员',
      workstation: '工位-05',
      shift: '白班',
      total_hours: 9.5,
      normal_hours: 8.0,
      ot_hours: 1.5,
      piece_qty: 125,
      piece_amount: 225.0,
      target_qty: 120,
      achievement_rate: 104.2,
      efficiency_score: 93.7,
      quality_score: 99.8,
      attendance_status: '在岗',
      last_update: '2025-01-17T16:40:00Z'
    },
    {
      emp_id: 'EMP006',
      emp_name: '赵建国',
      department: '生产二部',
      position: '班组长',
      workstation: '工位-06',
      shift: '白班',
      total_hours: 9.0,
      normal_hours: 8.0,
      ot_hours: 1.0,
      piece_qty: 165,
      piece_amount: 198.0,
      target_qty: 160,
      achievement_rate: 103.1,
      efficiency_score: 89.5,
      quality_score: 97.3,
      attendance_status: '在岗',
      last_update: '2025-01-17T16:30:00Z'
    },
    {
      emp_id: 'EMP007',
      emp_name: '孙丽华',
      department: '生产三部',
      position: '焊接工',
      workstation: '工位-07',
      shift: '白班',
      total_hours: 8.0,
      normal_hours: 8.0,
      ot_hours: 0.0,
      piece_qty: 95,
      piece_amount: 152.0,
      target_qty: 100,
      achievement_rate: 95.0,
      efficiency_score: 85.2,
      quality_score: 95.8,
      attendance_status: '在岗',
      last_update: '2025-01-17T16:15:00Z'
    },
    {
      emp_id: 'EMP008',
      emp_name: '马志强',
      department: '生产三部',
      position: '机械工',
      workstation: '工位-08',
      shift: '白班',
      total_hours: 10.0,
      normal_hours: 8.0,
      ot_hours: 2.0,
      piece_qty: 78,
      piece_amount: 156.0,
      target_qty: 80,
      achievement_rate: 97.5,
      efficiency_score: 87.9,
      quality_score: 98.2,
      attendance_status: '在岗',
      last_update: '2025-01-17T16:45:00Z'
    },
    {
      emp_id: 'EMP009',
      emp_name: '周晓琳',
      department: '生产三部',
      position: '质检员',
      workstation: '工位-09',
      shift: '白班',
      total_hours: 8.5,
      normal_hours: 8.0,
      ot_hours: 0.5,
      piece_qty: 156,
      piece_amount: 124.8,
      target_qty: 140,
      achievement_rate: 111.4,
      efficiency_score: 92.8,
      quality_score: 99.5,
      attendance_status: '在岗',
      last_update: '2025-01-17T16:25:00Z'
    },
    {
      emp_id: 'EMP010',
      emp_name: '吴国庆',
      department: '生产四部',
      position: '调试员',
      workstation: '工位-10',
      shift: '白班',
      total_hours: 9.5,
      normal_hours: 8.0,
      ot_hours: 1.5,
      piece_qty: 68,
      piece_amount: 136.0,
      target_qty: 70,
      achievement_rate: 97.1,
      efficiency_score: 84.6,
      quality_score: 96.7,
      attendance_status: '在岗',
      last_update: '2025-01-17T16:50:00Z'
    },
    {
      emp_id: 'EMP011',
      emp_name: '胡美丽',
      department: '生产四部',
      position: '操作员',
      workstation: '工位-11',
      shift: '夜班',
      total_hours: 8.0,
      normal_hours: 8.0,
      ot_hours: 0.0,
      piece_qty: 198,
      piece_amount: 158.4,
      target_qty: 180,
      achievement_rate: 110.0,
      efficiency_score: 94.5,
      quality_score: 97.8,
      attendance_status: '在岗',
      last_update: '2025-01-17T22:30:00Z'
    },
    {
      emp_id: 'EMP012',
      emp_name: '何志伟',
      department: '生产四部',
      position: '维修工',
      workstation: '工位-12',
      shift: '夜班',
      total_hours: 8.5,
      normal_hours: 8.0,
      ot_hours: 0.5,
      piece_qty: 45,
      piece_amount: 90.0,
      target_qty: 50,
      achievement_rate: 90.0,
      efficiency_score: 78.3,
      quality_score: 98.9,
      attendance_status: '在岗',
      last_update: '2025-01-17T22:45:00Z'
    },
    {
      emp_id: 'EMP013',
      emp_name: '谢小艳',
      department: '生产五部',
      position: '装配工',
      workstation: '工位-13',
      shift: '夜班',
      total_hours: 7.5,
      normal_hours: 7.5,
      ot_hours: 0.0,
      piece_qty: 212,
      piece_amount: 169.6,
      target_qty: 200,
      achievement_rate: 106.0,
      efficiency_score: 90.2,
      quality_score: 96.1,
      attendance_status: '在岗',
      last_update: '2025-01-17T22:15:00Z'
    },
    {
      emp_id: 'EMP014',
      emp_name: '林大明',
      department: '生产五部',
      position: '电工',
      workstation: '工位-14',
      shift: '夜班',
      total_hours: 8.0,
      normal_hours: 8.0,
      ot_hours: 0.0,
      piece_qty: 32,
      piece_amount: 96.0,
      target_qty: 35,
      achievement_rate: 91.4,
      efficiency_score: 81.7,
      quality_score: 99.2,
      attendance_status: '在岗',
      last_update: '2025-01-17T22:20:00Z'
    },
    {
      emp_id: 'EMP015',
      emp_name: '罗佳丽',
      department: '生产五部',
      position: '包装组长',
      workstation: '工位-15',
      shift: '夜班',
      total_hours: 8.5,
      normal_hours: 8.0,
      ot_hours: 0.5,
      piece_qty: 285,
      piece_amount: 114.0,
      target_qty: 280,
      achievement_rate: 101.8,
      efficiency_score: 93.1,
      quality_score: 98.7,
      attendance_status: '在岗',
      last_update: '2025-01-17T22:35:00Z'
    }
  ]
  
  return {
    code: 0,
    msg: 'success',
    data: todayPerformanceData
  }
}

// 获取部门业绩统计
export const getDepartmentPerformance = () => {
  return {
    code: 0,
    msg: 'success',
    data: [
      {
        dept_name: '生产一部',
        emp_count: 3,
        total_hours: 27.5,
        total_pieces: 563,
        total_amount: 524.8,
        avg_efficiency: 88.7,
        target_achievement: 105.2,
        quality_score: 96.5
      },
      {
        dept_name: '生产二部',
        emp_count: 3,
        total_hours: 27.0,
        total_pieces: 630,
        total_amount: 525.0,
        avg_efficiency: 91.7,
        target_achievement: 104.5,
        quality_score: 98.7
      },
      {
        dept_name: '生产三部',
        emp_count: 3,
        total_hours: 26.5,
        total_pieces: 329,
        total_amount: 432.8,
        avg_efficiency: 88.6,
        target_achievement: 101.3,
        quality_score: 97.8
      },
      {
        dept_name: '生产四部',
        emp_count: 3,
        total_hours: 26.0,
        total_pieces: 311,
        total_amount: 384.4,
        avg_efficiency: 85.8,
        target_achievement: 99.0,
        quality_score: 97.8
      },
      {
        dept_name: '生产五部',
        emp_count: 3,
        total_hours: 24.0,
        total_pieces: 529,
        total_amount: 379.6,
        avg_efficiency: 88.3,
        target_achievement: 99.7,
        quality_score: 98.0
      }
    ]
  }
}

// 获取班次业绩对比
export const getShiftPerformance = () => {
  return {
    code: 0,
    msg: 'success',
    data: [
      {
        shift: '白班',
        emp_count: 10,
        total_hours: 87.5,
        total_pieces: 1534,
        total_amount: 1487.6,
        avg_efficiency: 89.2,
        target_achievement: 102.8,
        quality_score: 97.2
      },
      {
        shift: '夜班',
        emp_count: 5,
        total_hours: 40.5,
        total_pieces: 772,
        total_amount: 628.0,
        avg_efficiency: 87.6,
        target_achievement: 100.3,
        quality_score: 98.1
      }
    ]
  }
}

// 获取今日业绩趋势（小时级别）
export const getTodayTrend = () => {
  return {
    code: 0,
    msg: 'success',
    data: [
      { hour: '08:00', pieces: 125, efficiency: 78.5 },
      { hour: '09:00', pieces: 180, efficiency: 85.2 },
      { hour: '10:00', pieces: 195, efficiency: 89.1 },
      { hour: '11:00', pieces: 210, efficiency: 92.8 },
      { hour: '12:00', pieces: 45, efficiency: 68.3 }, // 午餐时间
      { hour: '13:00', pieces: 165, efficiency: 82.7 },
      { hour: '14:00', pieces: 185, efficiency: 88.9 },
      { hour: '15:00', pieces: 220, efficiency: 94.5 },
      { hour: '16:00', pieces: 205, efficiency: 91.2 },
      { hour: '17:00', pieces: 72, efficiency: 85.6 }, // 交班时间
      { hour: '18:00', pieces: 145, efficiency: 79.8 },
      { hour: '19:00', pieces: 168, efficiency: 84.3 },
      { hour: '20:00', pieces: 185, efficiency: 89.7 },
      { hour: '21:00', pieces: 192, efficiency: 92.1 },
      { hour: '22:00', pieces: 180, efficiency: 88.9 },
      { hour: '23:00', pieces: 175, efficiency: 87.2 }
    ]
  }
}

// 获取工时汇报列表
export const getTimeReports = (filters?: {
  emp_id?: string
  date_start?: string
  date_end?: string
  type?: string
}) => {
  let result = [...mockTimeReports]
  
  if (filters?.emp_id) {
    result = result.filter(tr => tr.emp_id === filters.emp_id)
  }
  
  if (filters?.date_start) {
    result = result.filter(tr => tr.start >= filters.date_start!)
  }
  
  if (filters?.date_end) {
    result = result.filter(tr => tr.start <= filters.date_end!)
  }
  
  if (filters?.type) {
    result = result.filter(tr => tr.type === filters.type)
  }
  
  return {
    code: 0,
    msg: 'success',
    data: {
      list: result.sort((a, b) => b.start.localeCompare(a.start)),
      total: result.length
    }
  }
}

// 获取计件汇报列表
export const getPieceReports = (filters?: {
  emp_id?: string
  date_start?: string
  date_end?: string
  workorder_id?: string
}) => {
  let result = [...mockPieceReports]
  
  if (filters?.emp_id) {
    result = result.filter(pr => pr.emp_id === filters.emp_id)
  }
  
  if (filters?.date_start) {
    result = result.filter(pr => pr.date >= filters.date_start!)
  }
  
  if (filters?.date_end) {
    result = result.filter(pr => pr.date <= filters.date_end!)
  }
  
  if (filters?.workorder_id) {
    result = result.filter(pr => pr.workorder_id.includes(filters.workorder_id!))
  }
  
  return {
    code: 0,
    msg: 'success',
    data: {
      list: result.sort((a, b) => b.date.localeCompare(a.date)),
      total: result.length
    }
  }
}

// 获取工资报表
export const getSalaryReports = (filters?: {
  month?: string
  emp_id?: string
}) => {
  let result = [...mockSalaryReports]
  
  if (filters?.month) {
    result = result.filter(sr => sr.month === filters.month)
  }
  
  if (filters?.emp_id) {
    result = result.filter(sr => sr.emp_id === filters.emp_id)
  }
  
  return {
    code: 0,
    msg: 'success',
    data: {
      list: result.sort((a, b) => b.total - a.total),
      total: result.length,
      summary: {
        total_base: result.reduce((sum, sr) => sum + sr.base, 0),
        total_piece: result.reduce((sum, sr) => sum + sr.piece_amt, 0),
        total_ot: result.reduce((sum, sr) => sum + sr.overtime_amt, 0),
        total_penalty: result.reduce((sum, sr) => sum + sr.penalty, 0),
        total_salary: result.reduce((sum, sr) => sum + sr.total, 0)
      }
    }
  }
} 