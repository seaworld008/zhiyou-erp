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
        image: '/api/sop/images/step1.jpg',
        timer_sec: 30
      },
      {
        seq: 2,
        text: '清洁内胆：使用无尘布擦拭内胆内外表面',
        image: '/api/sop/images/step2.jpg',
        timer_sec: 45
      },
      {
        seq: 3,
        text: '安装温度传感器：将传感器插入指定孔位，确保接触良好',
        image: '/api/sop/images/step3.jpg',
        video: '/api/sop/videos/sensor_install.mp4',
        timer_sec: 120
      },
      {
        seq: 4,
        text: '密封圈安装：将密封圈按压到位，检查无气泡无翘起',
        image: '/api/sop/images/step4.jpg',
        timer_sec: 60
      },
      {
        seq: 5,
        text: '功能测试：连接测试设备，检测加热和温控功能',
        video: '/api/sop/videos/function_test.mp4',
        timer_sec: 180
      },
      {
        seq: 6,
        text: '质量检查：目视检查装配质量，填写检查清单',
        image: '/api/sop/images/step6.jpg',
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
        url: '/api/sop/docs/asm001_manual.pdf',
        desc: '详细作业指导书'
      },
      {
        type: 'image',
        url: '/api/sop/images/tools_layout.jpg',
        desc: '工具摆放示意图'
      }
    ],
    updated_at: '2025-01-15T10:30:00Z',
    updated_by: '工艺工程师-张伟',
    enabled: true
  },
  {
    id: 'SOP-002',
    product_code: 'TIP-AF-5L',
    process_code: 'ASM-002',
    version: 'v1.8',
    title: '智能空气炸锅5L - 外壳组装工序',
    steps: [
      {
        seq: 1,
        text: '检查外壳件：确认外壳无裂纹、色差、变形',
        image: '/api/sop/images/af_step1.jpg',
        timer_sec: 45
      },
      {
        seq: 2,
        text: '安装控制面板：对准定位孔，轻压到位听到咔嚓声',
        image: '/api/sop/images/af_step2.jpg',
        video: '/api/sop/videos/panel_install.mp4',
        timer_sec: 90
      },
      {
        seq: 3,
        text: '连接线束：按颜色对应插接线束，确保插接牢固',
        image: '/api/sop/images/af_step3.jpg',
        timer_sec: 120
      },
      {
        seq: 4,
        text: '安装门体：调整门体间隙，确保开合顺畅',
        video: '/api/sop/videos/door_install.mp4',
        timer_sec: 150
      },
      {
        seq: 5,
        text: '功能测试：开机测试显示、按键、门锁功能',
        timer_sec: 180
      }
    ],
    std_time_sec: 585, // 9分45秒
    tools: ['十字螺丝刀', '一字螺丝刀', '测试治具'],
    qc_points: [
      '外壳外观无缺陷',
      '面板按键回弹正常',
      '线束插接牢固',
      '门体间隙≤1.5mm',
      '功能测试全部通过'
    ],
    safety_points: [
      '轻拿轻放外壳件',
      '注意线束不要用力拉扯',
      '测试时注意触电'
    ],
    attachments: [
      {
        type: 'pdf',
        url: '/api/sop/docs/asm002_manual.pdf',
        desc: '组装作业指导书'
      }
    ],
    updated_at: '2025-01-12T14:20:00Z',
    updated_by: '工艺工程师-李明',
    enabled: true
  },
  {
    id: 'SOP-003',
    product_code: 'TIP-BM-2L',
    process_code: 'TEST-001',
    version: 'v3.1',
    title: '多功能破壁机2L - 最终测试工序',
    steps: [
      {
        seq: 1,
        text: '外观检查：检查产品外观，确认无划痕、污渍',
        timer_sec: 60
      },
      {
        seq: 2,
        text: '安全测试：进行漏电流、绝缘阻抗测试',
        video: '/api/sop/videos/safety_test.mp4',
        timer_sec: 240
      },
      {
        seq: 3,
        text: '功能测试：测试各档位运行，检查噪音',
        timer_sec: 300
      },
      {
        seq: 4,
        text: '包装准备：清洁产品，准备包装材料',
        timer_sec: 90
      }
    ],
    std_time_sec: 690, // 11分30秒
    tools: ['安规测试仪', '噪音计', '计时器'],
    qc_points: [
      '外观无缺陷',
      '漏电流<0.25mA',
      '绝缘阻抗>5MΩ',
      '噪音<65dB',
      '各档位功能正常'
    ],
    safety_points: [
      '测试时注意高压',
      '佩戴防护用品',
      '测试区域禁止饮食'
    ],
    attachments: [],
    updated_at: '2025-01-10T09:15:00Z',
    updated_by: '测试工程师-王芳',
    enabled: true
  },
  {
    id: 'SOP-004',
    product_code: 'TIP-EG-001',
    process_code: 'PCK-001',
    version: 'v2.0',
    title: '智能蒸蛋器 - 包装工序',
    steps: [
      {
        seq: 1,
        text: '准备包装材料：检查包装盒、说明书、配件完整性',
        timer_sec: 45
      },
      {
        seq: 2,
        text: '产品装盒：按照包装示意图放置产品和配件',
        image: '/api/sop/images/pack_layout.jpg',
        timer_sec: 90
      },
      {
        seq: 3,
        text: '封箱贴标：封胶带，贴产品标签和条形码',
        timer_sec: 60
      }
    ],
    std_time_sec: 195, // 3分15秒
    tools: ['胶带机', '标签打印机', '称重秤'],
    qc_points: [
      '配件齐全',
      '包装牢固',
      '标签信息正确',
      '重量符合要求'
    ],
    safety_points: [
      '小心包装刀具',
      '注意搬运姿势'
    ],
    attachments: [
      {
        type: 'image',
        url: '/api/sop/images/pack_standard.jpg',
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