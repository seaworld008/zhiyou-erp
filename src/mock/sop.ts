import type { Sop, SopAck } from '@/types'

export const mockSops: Sop[] = [
  {
    id: 'SOP-001',
    product_code: 'TIP-IH-3L',
    process_code: 'ASM-001',
    version: 'v2.3',
    title: '拓浦智能IH电饭煲3L - 内胆装配工序',
    steps: [
      {
        seq: 1,
        text: '准备工作：检查内胆是否有划痕、变形等缺陷',
        image: '',
        timer_sec: 30
      },
      {
        seq: 2,
        text: '清洁内胆：使用无尘布擦拭内胆内外表面',
        image: '',
        timer_sec: 45
      },
      {
        seq: 3,
        text: '安装温度传感器：将传感器插入指定孔位，确保接触良好',
        image: '',
        video: '',
        timer_sec: 120
      },
      {
        seq: 4,
        text: '密封圈安装：将密封圈按压到位，检查无气泡无翘起',
        image: '',
        timer_sec: 60
      },
      {
        seq: 5,
        text: '功能测试：连接测试设备，检测加热和温控功能',
        video: '',
        timer_sec: 180
      },
      {
        seq: 6,
        text: '质量检查：目视检查装配质量，填写检查清单',
        image: '',
        timer_sec: 90
      }
    ],
    std_time_sec: 525, // 8分45秒
    tools: ['电动螺丝刀', '扭力扳手', '测试夹具', '万用表'],
    qc_points: [
      '内胆表面无划痕',
      '传感器接触电阻<5Ω',
      '密封圈安装到位',
      '加热功能正常',
      '温控精度±2°C'
    ],
    safety_points: [
      '佩戴防静电手套',
      '注意尖锐边缘',
      '测试时注意高温',
      '使用防护眼镜'
    ],
    attachments: [
      {
        type: 'pdf',
        url: '',
        desc: '详细作业指导书'
      },
      {
        type: 'image',
        url: '',
        desc: '工具摆放示意图'
      }
    ],
    updated_at: '2025-01-15T10:30:00Z',
    updated_by: '工艺工程师-张伟',
    enabled: true
  },
  {
    id: 'SOP-002',
    product_code: 'XSDD1710006',
    process_code: 'GXXX-002',
    title: '面板装配作业指导书',
    version: 'v1.8',
    steps: [
      {
        seq: 1,
        title: '材料准备',
        description: '准备面板装配所需材料',
        image: '',  // 移除不存在的图片URL
        key_points: ['面板数量确认', '螺丝规格检查'],
        warnings: ['检查面板表面质量']
      },
      {
        seq: 2,
        title: '面板安装',
        description: '按照标准流程安装面板',
        image: '',  // 移除不存在的图片URL
        video: '',  // 移除不存在的视频URL
        key_points: ['位置对齐', '固定牢靠'],
        warnings: ['避免划伤面板']
      },
      {
        seq: 3,
        title: '门体安装',
        description: '安装门体组件',
        image: '',  // 移除不存在的图片URL
        key_points: ['门体水平度', '开关顺畅'],
        warnings: ['注意手部安全']
      },
      {
        seq: 4,
        title: '整体检查',
        description: '最终质量检查',
        video: '',  // 移除不存在的视频URL
        key_points: ['外观检查', '功能测试'],
        warnings: ['确保所有螺丝紧固']
      }
    ],
    std_time_sec: 480, // 8分钟
    tools: [
      '电动螺丝刀',
      '水平仪',
      '卷尺'
    ],
    qc_points: [
      '面板安装平整',
      '螺丝紧固到位',
      '门体开关顺畅'
    ],
    safety_points: [
      '佩戴安全眼镜',
      '注意锐利边缘'
    ],
    attachments: [],
    updated_at: '2025-01-15T14:20:00Z',
    updated_by: '班组长-李四',
    enabled: true
  },
  {
    id: 'SOP-003',
    product_code: 'XSDD1710007',
    process_code: 'GXXX-003',
    title: '电路板测试作业指导书',
    version: 'v3.1',
    steps: [
      {
        seq: 1,
        title: '测试准备',
        description: '准备测试设备和环境',
        key_points: ['设备校准', '环境温湿度检查'],
        warnings: ['确保测试设备正常']
      },
      {
        seq: 2,
        title: '外观检查',
        description: '检查电路板外观是否有缺陷',
        key_points: ['焊点质量', '元件位置', '标识清晰'],
        warnings: ['注意静电防护']
      },
      {
        seq: 3,
        title: '功能测试',
        description: '进行电路板功能测试',
        key_points: ['测试所有功能点', '记录测试数据'],
        warnings: ['按照测试序列进行']
      },
      {
        seq: 4,
        title: '安全测试',
        description: '进行电气安全测试',
        video: '',  // 移除不存在的视频URL
        key_points: ['绝缘电阻测试', '耐压测试'],
        warnings: ['严格按照安全规程操作']
      },
      {
        seq: 5,
        title: '结果记录',
        description: '记录测试结果并处理',
        key_points: ['填写测试报告', '不合格品标识'],
        warnings: ['确保记录准确']
      }
    ],
    std_time_sec: 900, // 15分钟
    tools: [
      '万用表',
      '示波器',
      '电源',
      '测试治具'
    ],
    qc_points: [
      '焊点质量合格',
      '功能测试通过',
      '安全测试达标',
      '测试记录完整'
    ],
    safety_points: [
      '遵守电气安全规范',
      '佩戴防静电设备',
      '注意高压危险'
    ],
    attachments: [],
    updated_at: '2025-01-16T11:45:00Z',
    updated_by: '质检员-王五',
    enabled: true
  },
  {
    id: 'SOP-004',
    product_code: 'XSDD1710008',
    process_code: 'GXXX-004',
    title: '产品包装作业指导书',
    version: 'v2.0',
    steps: [
      {
        seq: 1,
        title: '包装准备',
        description: '准备包装材料和工具',
        image: '',  // 移除不存在的图片URL
        key_points: ['包装盒检查', '填充物准备', '标签打印'],
        warnings: ['确保包装材料无损坏']
      },
      {
        seq: 2,
        title: '产品装箱',
        description: '按照标准将产品装入包装盒',
        key_points: ['产品清洁', '防护到位', '摆放整齐'],
        warnings: ['避免产品碰撞']
      },
      {
        seq: 3,
        title: '标签贴附',
        description: '贴附产品标签和包装标签',
        key_points: ['标签位置准确', '信息核对', '贴附牢固'],
        warnings: ['确保标签内容正确']
      },
      {
        seq: 4,
        title: '封箱检查',
        description: '最终封箱和质量检查',
        key_points: ['封箱牢固', '外观整洁', '重量核对'],
        warnings: ['检查包装完整性']
      }
    ],
    std_time_sec: 360, // 6分钟
    tools: [
      '包装盒',
      '胶带',
      '标签打印机',
      '电子秤'
    ],
    qc_points: [
      '包装完整无损',
      '标签信息正确',
      '重量符合要求',
      '外观整洁美观'
    ],
    safety_points: [
      '小心包装刀具',
      '注意搬运姿势'
    ],
    attachments: [
      {
        type: 'image',
        url: '',  // 移除不存在的图片URL
        desc: '包装标准示例'
      }
    ],
    updated_at: '2025-01-08T16:45:00Z',
    updated_by: '包装主管-陈丽',
    enabled: false // 此SOP暂停使用
  }
]

export const mockSopAcks: SopAck[] = [
  {
    sop_id: 'SOP-001',
    user_id: 'EMP001',
    station_id: 'S-01',
    version: 'v2.3',
    ack_time: '2025-01-17T08:30:00Z'
  },
  {
    sop_id: 'SOP-002',
    user_id: 'EMP002',
    station_id: 'S-02',
    version: 'v1.8',
    ack_time: '2025-01-17T09:15:00Z'
  },
  {
    sop_id: 'SOP-001',
    user_id: 'EMP003',
    station_id: 'S-03',
    version: 'v2.2', // 旧版本，需要重新接收
    ack_time: '2025-01-15T14:20:00Z'
  },
  {
    sop_id: 'SOP-003',
    user_id: 'EMP004',
    station_id: 'S-05',
    version: 'v3.1',
    ack_time: '2025-01-17T10:45:00Z'
  }
]

// 获取SOP列表的API模拟
export const getSopList = (filters?: {
  product_code?: string
  process_code?: string
  enabled?: boolean
}) => {
  let result = [...mockSops]
  
  if (filters?.product_code) {
    result = result.filter(sop => 
      sop.product_code.includes(filters.product_code!)
    )
  }
  
  if (filters?.process_code) {
    result = result.filter(sop => 
      sop.process_code.includes(filters.process_code!)
    )
  }
  
  if (filters?.enabled !== undefined) {
    result = result.filter(sop => sop.enabled === filters.enabled)
  }
  
  return {
    code: 0,
    msg: 'success',
    data: {
      list: result,
      total: result.length
    }
  }
}

// 获取用户SOP接收状态
export const getUserSopAcks = (user_id: string) => {
  const userAcks = mockSopAcks.filter(ack => ack.user_id === user_id)
  
  return {
    code: 0,
    msg: 'success',
    data: userAcks
  }
}

// 检查是否需要重新接收SOP
export const checkSopUpdates = (user_id: string) => {
  const userAcks = mockSopAcks.filter(ack => ack.user_id === user_id)
  const needUpdateSops = []
  
  for (const sop of mockSops) {
    if (!sop.enabled) continue
    
    const userAck = userAcks.find(ack => ack.sop_id === sop.id)
    if (!userAck || userAck.version !== sop.version) {
      needUpdateSops.push({
        sop_id: sop.id,
        title: sop.title,
        current_version: sop.version,
        user_version: userAck?.version || '未接收',
        updated_at: sop.updated_at
      })
    }
  }
  
  return {
    code: 0,
    msg: 'success',
    data: needUpdateSops
  }
}