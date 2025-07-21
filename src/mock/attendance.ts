// 考勤模块Mock数据
import type { AttendanceRecord, SchedulePlan, AttendanceApproval, ShiftType, AttendanceStats } from '@/types'

// 班次类型
export const shiftTypes: ShiftType[] = [
  {
    id: '1',
    name: '早班',
    code: 'MORNING',
    startTime: '08:00',
    endTime: '16:00',
    breakTime: 60, // 分钟
    isDefault: true,
    color: '#18a058'
  },
  {
    id: '2',
    name: '中班',
    code: 'AFTERNOON',
    startTime: '16:00',
    endTime: '00:00',
    breakTime: 60,
    isDefault: false,
    color: '#f0a020'
  },
  {
    id: '3',
    name: '夜班',
    code: 'NIGHT',
    startTime: '00:00',
    endTime: '08:00',
    breakTime: 60,
    isDefault: false,
    color: '#d03050'
  }
]

// 考勤记录
export const attendanceRecords: AttendanceRecord[] = [
  {
    id: '1',
    employeeId: 'EMP001',
    employeeName: '张三',
    department: '生产部',
    position: '操作员',
    date: '2024-01-15',
    shiftType: shiftTypes[0],
    checkInTime: '07:58',
    checkOutTime: '16:05',
    actualHours: 8.12,
    plannedHours: 8,
    overtime: 0.12,
    isLate: false,
    isEarlyLeave: false,
    status: 'normal'
  },
  {
    id: '2',
    employeeId: 'EMP002',
    employeeName: '李四',
    department: '生产部',
    position: '技术员',
    date: '2024-01-15',
    shiftType: shiftTypes[0],
    checkInTime: '08:15',
    checkOutTime: '16:00',
    actualHours: 7.75,
    plannedHours: 8,
    overtime: 0,
    isLate: true,
    isEarlyLeave: false,
    status: 'late'
  },
  {
    id: '3',
    employeeId: 'EMP003',
    employeeName: '王五',
    department: '质检部',
    position: '质检员',
    date: '2024-01-15',
    shiftType: shiftTypes[1],
    checkInTime: '15:55',
    checkOutTime: '23:50',
    actualHours: 7.92,
    plannedHours: 8,
    overtime: 0,
    isLate: false,
    isEarlyLeave: true,
    status: 'early_leave'
  },
  {
    id: '4',
    employeeId: 'EMP004',
    employeeName: '赵六',
    department: '维修部',
    position: '维修工',
    date: '2024-01-15',
    shiftType: shiftTypes[2],
    checkInTime: undefined,
    checkOutTime: undefined,
    actualHours: 0,
    plannedHours: 8,
    overtime: 0,
    isLate: false,
    isEarlyLeave: false,
    status: 'absent'
  }
]

// 排班计划
export const schedulePlans: SchedulePlan[] = [
  {
    id: '1',
    employeeId: 'EMP001',
    employeeName: '张三',
    department: '生产部',
    week: '2024-W03',
    shifts: {
      monday: shiftTypes[0],
      tuesday: shiftTypes[0],
      wednesday: shiftTypes[0],
      thursday: shiftTypes[0],
      friday: shiftTypes[0],
      saturday: null,
      sunday: null
    },
    totalHours: 40
  },
  {
    id: '2',
    employeeId: 'EMP002',
    employeeName: '李四',
    department: '生产部',
    week: '2024-W03',
    shifts: {
      monday: shiftTypes[0],
      tuesday: shiftTypes[0],
      wednesday: shiftTypes[0],
      thursday: shiftTypes[0],
      friday: shiftTypes[0],
      saturday: shiftTypes[0],
      sunday: null
    },
    totalHours: 48
  },
  {
    id: '3',
    employeeId: 'EMP003',
    employeeName: '王五',
    department: '质检部',
    week: '2024-W03',
    shifts: {
      monday: shiftTypes[1],
      tuesday: shiftTypes[1],
      wednesday: shiftTypes[1],
      thursday: shiftTypes[1],
      friday: shiftTypes[1],
      saturday: null,
      sunday: null
    },
    totalHours: 40
  }
]

// 考勤审批
export const attendanceApprovals: AttendanceApproval[] = [
  {
    id: '1',
    employeeId: 'EMP001',
    employeeName: '张三',
    department: '生产部',
    type: 'leave',
    reason: '病假',
    startDate: '2024-01-16',
    endDate: '2024-01-16',
    duration: 1,
    description: '发烧感冒需要休息',
    attachments: ['医院证明.pdf'],
    status: 'pending',
    submittedAt: '2024-01-15T10:30:00',
    approver: 'MGR001',
    approverName: '王经理'
  },
  {
    id: '2',
    employeeId: 'EMP002',
    employeeName: '李四',
    department: '生产部',
    type: 'overtime',
    reason: '加班申请',
    startDate: '2024-01-15',
    endDate: '2024-01-15',
    duration: 2,
    description: '紧急订单需要加班完成',
    attachments: [],
    status: 'approved',
    submittedAt: '2024-01-14T16:00:00',
    approver: 'MGR001',
    approverName: '王经理',
    approvedAt: '2024-01-14T17:30:00'
  },
  {
    id: '3',
    employeeId: 'EMP003',
    employeeName: '王五',
    department: '质检部',
    type: 'business_trip',
    reason: '出差',
    startDate: '2024-01-18',
    endDate: '2024-01-20',
    duration: 3,
    description: '客户现场质量检查',
    attachments: ['出差申请单.pdf'],
    status: 'rejected',
    submittedAt: '2024-01-12T09:00:00',
    approver: 'MGR002',
    approverName: '李经理',
    rejectedAt: '2024-01-13T10:00:00',
    rejectReason: '档期冲突，建议延后'
  }
]

// 考勤统计
export const attendanceStats: AttendanceStats = {
  totalEmployees: 156,
  presentToday: 142,
  absentToday: 8,
  lateToday: 6,
  overtimeToday: 23,
  monthlyAvgAttendance: 95.2,
  monthlyTotalHours: 12480,
  monthlyOvertimeHours: 892
}

// Mock API函数
export function getAttendanceRecords(params?: any) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        data: {
          list: attendanceRecords,
          total: attendanceRecords.length
        }
      })
    }, 300)
  })
}

export function getSchedulePlans(params?: any) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        data: {
          list: schedulePlans,
          total: schedulePlans.length
        }
      })
    }, 300)
  })
}

export function getAttendanceApprovals(params?: any) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        data: {
          list: attendanceApprovals,
          total: attendanceApprovals.length
        }
      })
    }, 300)
  })
}

export function getAttendanceStats() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        data: attendanceStats
      })
    }, 300)
  })
}

export function getShiftTypes() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        data: shiftTypes
      })
    }, 300)
  })
}

export function submitAttendanceApproval(data: any) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        message: '申请提交成功'
      })
    }, 500)
  })
}

export function approveAttendance(id: string, action: 'approve' | 'reject', reason?: string) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        message: action === 'approve' ? '审批通过' : '审批拒绝'
      })
    }, 500)
  })
}

export function updateSchedule(data: any) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        message: '排班更新成功'
      })
    }, 500)
  })
} 