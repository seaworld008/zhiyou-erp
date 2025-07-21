/** 通用API返回结构 */
export interface ApiResp<T = any> {
  code: number;         // 0=成功
  msg: string;
  data: T;
  traceId?: string;
}

/** 用户信息 */
export interface User {
  id: string;
  username: string;
  email: string;
  realName: string;
  phone: string;
  department: string;
  position: string;
  role: string;
  avatar?: string;
  permissions?: string[];
  status: 'active' | 'inactive' | 'locked';
  createdAt: string;
  lastLoginAt?: string;
  loginCount: number;
}

export interface Role {
  id: string;
  name: string;
  code: string;
  description: string;
  permissions: string[];
  isSystem: boolean;
  createdAt: string;
}

export interface Permission {
  id: string;
  name: string;
  code: string;
  type: 'menu' | 'button' | 'api';
  parentId?: string;
  children?: Permission[];
}

/** 菜单项 */
export interface MenuItem {
  id: string;
  parent_id?: string;
  path: string;          // '/dashboard'
  name: string;          // 'Dashboard'
  icon?: string;
  component?: string;    // 动态 import 路径
  hidden?: boolean;
  children?: MenuItem[];
  perms?: string[];      // ['dash:view']
  sort?: number;
}

/** KPI数据 */
export interface DashboardKpis {
  date: string;
  total_output: number;
  order_count: number;
  pass_rate: number;   // 0-1
  defect_rate: number; // 0-1
  wip: number;
  shipment_amount?: number;
}

/** 每小时产量 */
export interface HourlyOutputPoint {
  hour: string;  // '08:00'
  qty: number;
}

/** 异常分类 */
export interface AbnormalItem {
  type: string;  // '设备故障'
  value: number;
}

/** 最近工单 */
export interface WorkOrderSummary {
  id: string;
  product_name: string;
  start_time: string;
  plan_qty: number;
  done_qty: number;
  pass_qty?: number;
  status?: string; // planned | running | done
}

/** 待办 */
export interface TodoItem {
  id: string;
  type: 'approve' | 'material' | 'andon' | 'qa' | 'other';
  title: string;
  priority: 'high' | 'medium' | 'low';
  created_at: string;
  link?: string;
}

/** 工位跑马灯 */
export interface WorkstationStatus {
  station_id: string;
  station_name: string;
  emp_name?: string;
  avatar?: string;
  workorder_id?: string;
  current_qty?: number;
  target_qty?: number;
  status?: 'running'|'idle'|'downtime';
}

/** SOP */
export interface Sop {
  id: string;
  product_code: string;
  process_code: string;
  version: string;
  title: string;
  steps: SopStep[];
  std_time_sec: number;
  tools: string[];
  qc_points: string[];
  safety_points: string[];
  attachments: SopAttachment[];
  updated_at: string;
  updated_by: string;
  enabled: boolean;
}

export interface SopStep {
  seq: number;
  text?: string;
  title?: string;
  description?: string;
  image?: string;
  video?: string;
  timer_sec?: number;
  key_points?: string[];
  warnings?: string[];
}

export interface SopAttachment {
  type: 'image' | 'video' | 'pdf' | 'other';
  url: string;
  desc?: string;
}

export interface SopAck {
  sop_id: string;
  user_id: string;
  station_id?: string;
  version: string;
  ack_time: string;
}

/** 绩效 */
export interface PerfTimeReport {
  id: string;
  emp_id: string;
  emp_name: string;
  department: string;
  position: string;
  workstation: string;
  shift: string;
  date: string;
  start: string;
  end: string;
  type: 'normal' | 'ot' | 'leave' | 'sick' | 'personal';
  hours: number;
  breakTime: number;
  actualHours: number;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  submittedAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
  approver?: string;
  rejectReason?: string;
  description?: string;
}

export interface PerfPiece {
  id: string;
  emp_id: string;
  emp_name: string;
  workorder_id: string;
  process_code: string;
  qty: number;
  unit_price: number;
  amount: number;
  date: string;
}

export interface PerfSalary {
  emp_id: string;
  emp_name: string;
  base: number;
  piece_amt: number;
  overtime_amt: number;
  penalty: number;
  total: number;
  month: string;
}

/** 今日业绩 */
export interface TodayPerformance {
  emp_id: string;
  emp_name: string;
  department: string;
  position: string;
  workstation: string;
  shift: string;
  total_hours: number;
  normal_hours: number;
  ot_hours: number;
  piece_qty: number;
  piece_amount: number;
  target_qty: number;
  achievement_rate: number;
  efficiency_score: number;
  quality_score: number;
  attendance_status: string;
  last_update: string;
}

/** 部门业绩统计 */
export interface DepartmentPerformance {
  dept_name: string;
  emp_count: number;
  total_hours: number;
  total_pieces: number;
  total_amount: number;
  avg_efficiency: number;
  target_achievement: number;
  quality_score: number;
}

/** 班次业绩对比 */
export interface ShiftPerformance {
  shift: string;
  emp_count: number;
  total_hours: number;
  total_pieces: number;
  total_amount: number;
  avg_efficiency: number;
  target_achievement: number;
  quality_score: number;
}

/** 今日业绩趋势 */
export interface TodayTrend {
  hour: string;
  pieces: number;
  efficiency: number;
}

/** 考勤 */
export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  position: string;
  date: string;
  shiftType: ShiftType;
  checkInTime?: string;
  checkOutTime?: string;
  actualHours: number;
  plannedHours: number;
  overtime: number;
  isLate: boolean;
  isEarlyLeave: boolean;
  status: 'normal'|'late'|'early_leave'|'absent'|'leave'|'overtime';
}

export interface ShiftType {
  id: string;
  name: string;
  code: string;
  startTime: string;
  endTime: string;
  breakTime: number;
  isDefault: boolean;
  color: string;
}

export interface SchedulePlan {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  week: string;
  shifts: {
    monday?: ShiftType | null;
    tuesday?: ShiftType | null;
    wednesday?: ShiftType | null;
    thursday?: ShiftType | null;
    friday?: ShiftType | null;
    saturday?: ShiftType | null;
    sunday?: ShiftType | null;
  };
  totalHours: number;
}

export interface AttendanceApproval {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  type: 'leave' | 'overtime' | 'business_trip' | 'personal' | 'sick';
  reason: string;
  startDate: string;
  endDate: string;
  duration: number;
  description: string;
  attachments: string[];
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  approver: string;
  approverName: string;
  approvedAt?: string;
  rejectedAt?: string;
  rejectReason?: string;
}

export interface AttendanceStats {
  totalEmployees: number;
  presentToday: number;
  absentToday: number;
  lateToday: number;
  overtimeToday: number;
  monthlyAvgAttendance: number;
  monthlyTotalHours: number;
  monthlyOvertimeHours: number;
}

// 兼容旧类型
export interface Shift {
  id: string;
  name: string;
  start: string;
  end: string;
  break_min?: number;
}

/** 品质管理 */
export interface QualityDefect {
  id: string;
  productCode: string;
  productName: string;
  defectType: string;
  severity: 'minor' | 'major' | 'critical';
  description: string;
  reportedBy: string;
  reportedAt: string;
  workstation: string;
  batchNo: string;
  quantity: number;
  status: 'open' | 'investigating' | 'closed';
  images: string[];
  assignedTo: string;
  rootCause: string;
  correctiveAction: string;
  preventiveAction: string;
}

/** Andon异常呼叫 */
export interface AndonCall {
  id: string;
  callNumber: string;
  type: 'equipment' | 'material' | 'quality' | 'safety' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  description: string;
  location: string;
  workstation: string;
  line: string;
  reportedBy: string;
  reportedAt: string;
  status: 'pending' | 'acknowledged' | 'in_progress' | 'resolved' | 'closed';
  assignedTo?: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  closedAt?: string;
  resolutionTime?: number; // 解决用时（分钟）
  responseTime?: number; // 响应用时（分钟）
  resolutionNote?: string;
  images?: string[];
  escalated?: boolean;
  escalatedAt?: string;
  escalatedTo?: string;
}

export interface AndonStats {
  totalCalls: number;
  pendingCalls: number;
  inProgressCalls: number;
  resolvedToday: number;
  avgResponseTime: number; // 平均响应时间（分钟）
  avgResolutionTime: number; // 平均解决时间（分钟）
  callsByType: {
    equipment: number;
    material: number;
    quality: number;
    safety: number;
    other: number;
  };
  callsByPriority: {
    low: number;
    medium: number;
    high: number;
    urgent: number;
  };
}

export interface QualityInspection {
  id: string;
  productCode: string;
  productName: string;
  batchNo: string;
  inspectionType: 'incoming' | 'process' | 'final' | 'outgoing';
  inspector: string;
  inspectedAt: string;
  samplingQty: number;
  defectQty: number;
  passRate: number;
  result: 'pass' | 'reject' | 'conditional';
  remarks: string;
  checkItems: {
    item: string;
    standard: string;
    measured: string;
    result: 'pass' | 'fail';
  }[];
}

export interface QualityStats {
  dailyDefectRate: number;
  weeklyDefectRate: number;
  monthlyDefectRate: number;
  totalDefects: number;
  openDefects: number;
  resolvedDefects: number;
  inspectionCount: number;
  passedInspections: number;
  overallPassRate: number;
  topDefectTypes: {
    type: string;
    count: number;
    percentage: number;
  }[];
}

/** 设备管理 */
export interface Equipment {
  id: string;
  code: string;
  name: string;
  type: string;
  model: string;
  manufacturer: string;
  location: string;
  status: 'running' | 'stopped' | 'maintenance' | 'fault';
  installDate: string;
  lastMaintenanceDate: string;
  nextMaintenanceDate: string;
  operationHours: number;
  efficiency: number;
  operator: string;
  description: string;
}

export interface EquipmentStats {
  totalEquipment: number;
  runningEquipment: number;
  stoppedEquipment: number;
  maintenanceEquipment: number;
  faultEquipment: number;
  overallEfficiency: number;
  avgOperationHours: number;
}

/** 仓储管理 */
export interface InventoryItem {
  id: string;
  code: string;
  name: string;
  category: string;
  specification: string;
  unit: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  location: string;
  supplier: string;
  unitPrice: number;
  totalValue: number;
  lastInDate: string;
  lastOutDate: string;
  status: 'normal' | 'low_stock' | 'overstock' | 'out_of_stock';
}

export interface InventoryStats {
  totalItems: number;
  totalValue: number;
  lowStockItems: number;
  outOfStockItems: number;
  overstockItems: number;
  turnoverRate: number;
}

/** 消息中心 */
export interface Message {
  id: string;
  type: 'system' | 'alert' | 'notification' | 'reminder';
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  sender: string;
  recipient: string;
  createdAt: string;
  readAt?: string;
  isRead: boolean;
  category: string;
}

export interface MessageStats {
  totalMessages: number;
  unreadMessages: number;
  systemMessages: number;
  alertMessages: number;
  todayMessages: number;
}