import type { 
  DashboardKpis, 
  HourlyOutputPoint, 
  AbnormalItem, 
  WorkOrderSummary, 
  TodoItem, 
  WorkstationStatus 
} from '@/types'

export const mockDashboard = {
  date: '2025-01-17',
  kpis: {
    total_output: 2870,
    order_count: 68,
    pass_rate: 0.985,
    defect_rate: 0.015,
    wip: 1234,
    shipment_amount: 284567.89,
  } as DashboardKpis,
  
  hourly_output: [
    { hour: '08:00', qty: 245 },
    { hour: '09:00', qty: 320 },
    { hour: '10:00', qty: 180 },
    { hour: '11:00', qty: 350 },
    { hour: '12:00', qty: 50 },  // 午休时间
    { hour: '13:00', qty: 420 },
    { hour: '14:00', qty: 380 },
    { hour: '15:00', qty: 330 },
    { hour: '16:00', qty: 280 },
    { hour: '17:00', qty: 315 },
  ] as HourlyOutputPoint[],
  
  abnormal: [
    { type: '设备故障', value: 35 },
    { type: '物料缺失', value: 20 },
    { type: '人员缺勤', value: 12 },
    { type: '品质异常', value: 8 },
    { type: '其他原因', value: 5 },
    { type: '正常生产', value: 1920 },
  ] as AbnormalItem[],
  
  recent_workorders: [
    { 
      id: 'XSDD1710005', 
      product_name: '拓浦智能IH电饭煲3L', 
      start_time: '2025-01-17 08:46:08', 
      plan_qty: 200, 
      done_qty: 200, 
      pass_qty: 198, 
      status: 'done' 
    },
    { 
      id: 'XSDD1710006', 
      product_name: '智能空气炸锅5L', 
      start_time: '2025-01-17 09:15:20', 
      plan_qty: 150, 
      done_qty: 145, 
      pass_qty: 143, 
      status: 'running' 
    },
    { 
      id: 'XSDD1710007', 
      product_name: '多功能破壁机2L', 
      start_time: '2025-01-17 10:30:15', 
      plan_qty: 100, 
      done_qty: 85, 
      pass_qty: 85, 
      status: 'running' 
    },
    { 
      id: 'XSDD1710008', 
      product_name: '智能蒸蛋器', 
      start_time: '2025-01-17 13:20:00', 
      plan_qty: 300, 
      done_qty: 125, 
      pass_qty: 123, 
      status: 'running' 
    },
  ] as WorkOrderSummary[],
  
  todos: [
    { 
      id: 'T001', 
      type: 'material', 
      title: '缺料提醒-线1塑料外壳', 
      priority: 'high', 
      created_at: '2025-01-17T09:15:00Z' 
    },
    { 
      id: 'T002', 
      type: 'approve', 
      title: '补卡申请-张三(1月16日)', 
      priority: 'medium', 
      created_at: '2025-01-17T10:20:00Z' 
    },
    { 
      id: 'T003', 
      type: 'qa', 
      title: '品质异常-XSDD1710005批次', 
      priority: 'high', 
      created_at: '2025-01-17T11:05:00Z' 
    },
    { 
      id: 'T004', 
      type: 'andon', 
      title: '设备故障-注塑机#3', 
      priority: 'high', 
      created_at: '2025-01-17T14:30:00Z' 
    },
    { 
      id: 'T005', 
      type: 'approve', 
      title: '加班申请-李四(今日)', 
      priority: 'low', 
      created_at: '2025-01-17T15:45:00Z' 
    },
  ] as TodoItem[],
  
  workstations: [
    { 
      station_id: 'S-01', 
      station_name: '外壳注塑', 
      emp_name: '陈林燕', 
      avatar: undefined, // 移除placeholder URL，使用文字头像
      workorder_id: 'XSDD1710005', 
      current_qty: 198, 
      target_qty: 200, 
      status: 'running' 
    },
    { 
      station_id: 'S-02', 
      station_name: '电路装配', 
      emp_name: '李明华', 
      avatar: undefined, // 移除placeholder URL，使用文字头像
      workorder_id: 'XSDD1710006', 
      current_qty: 145, 
      target_qty: 150, 
      status: 'running' 
    },
    { 
      station_id: 'S-03', 
      station_name: '功能测试', 
      emp_name: '王小红', 
      avatar: undefined, // 移除placeholder URL，使用文字头像
      workorder_id: 'XSDD1710007', 
      current_qty: 85, 
      target_qty: 100, 
      status: 'idle' 
    },
    { 
      station_id: 'S-04', 
      station_name: '包装封装', 
      emp_name: '张伟强', 
      avatar: undefined, // 移除placeholder URL，使用文字头像
      workorder_id: 'XSDD1710008', 
      current_qty: 125, 
      target_qty: 300, 
      status: 'running' 
    },
    { 
      station_id: 'S-05', 
      station_name: '质检验收', 
      emp_name: '刘晓敏', 
      avatar: undefined, // 移除placeholder URL，使用文字头像
      workorder_id: 'XSDD1710005', 
      current_qty: 0, 
      target_qty: 50, 
      status: 'downtime' 
    },
    { 
      station_id: 'S-06', 
      station_name: '贴标打码', 
      emp_name: '赵建国', 
      avatar: undefined, // 移除placeholder URL，使用文字头像
      workorder_id: 'XSDD1710006', 
      current_qty: 142, 
      target_qty: 150, 
      status: 'running' 
    },
  ] as WorkstationStatus[],
};

// 模拟实时数据更新
export const generateRealtimeData = () => {
  const data = JSON.parse(JSON.stringify(mockDashboard));
  
  // 随机更新KPI数据
  data.kpis.total_output += Math.floor(Math.random() * 10);
  
  // 更新工位状态
  data.workstations.forEach((station: WorkstationStatus) => {
    if (station.status === 'running' && station.current_qty && station.target_qty) {
      station.current_qty = Math.min(
        station.current_qty + Math.floor(Math.random() * 3),
        station.target_qty
      );
    }
  });
  
  return data;
}; 