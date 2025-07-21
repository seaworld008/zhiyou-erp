// 消息中心模块Mock数据
import type { Message, MessageStats } from '@/types'

export const messages: Message[] = [
  {
    id: 'MSG001',
    type: 'alert',
    title: '设备异常告警',
    content: 'CNC加工中心1号出现液压系统故障，请立即处理。设备状态：停机，影响生产线：A线，预计影响产量：50件/小时。',
    priority: 'urgent',
    sender: 'system',
    recipient: '维修部',
    createdAt: '2024-01-15T14:30:00',
    isRead: false,
    category: '设备告警'
  },
  {
    id: 'MSG002',
    type: 'system',
    title: '生产计划变更通知',
    content: '由于客户需求变更，产品P20240115001的生产数量调整为1000件，交期提前至2024-01-20。请相关部门及时调整生产安排。',
    priority: 'high',
    sender: '生产计划部',
    recipient: '生产部',
    createdAt: '2024-01-15T13:45:00',
    isRead: false,
    category: '生产通知'
  },
  {
    id: 'MSG003',
    type: 'notification',
    title: '库存预警提醒',
    content: '以下物料库存不足，请及时补充：标准螺栓M12*40(当前库存25个，最低库存100个)，铣刀φ20mm(当前库存0支，最低库存10支)。',
    priority: 'medium',
    sender: '仓库管理系统',
    recipient: '采购部',
    createdAt: '2024-01-15T12:00:00',
    isRead: true,
    readAt: '2024-01-15T12:30:00',
    category: '库存管理'
  },
  {
    id: 'MSG004',
    type: 'reminder',
    title: '设备维护提醒',
    content: '焊接机器人1号预计维护时间为2024-01-18，请提前安排生产计划，避免影响正常生产。维护预计耗时：4小时。',
    priority: 'medium',
    sender: '设备管理系统',
    recipient: '生产部',
    createdAt: '2024-01-15T11:30:00',
    isRead: true,
    readAt: '2024-01-15T11:45:00',
    category: '设备维护'
  },
  {
    id: 'MSG005',
    type: 'notification',
    title: '质量异常通报',
    content: '发动机缸体批次B240115-01检测发现尺寸超差问题，已暂停该批次生产。质量工程师正在分析原因，预计2小时内给出处理方案。',
    priority: 'high',
    sender: '质检部',
    recipient: '生产部',
    createdAt: '2024-01-15T10:15:00',
    isRead: true,
    readAt: '2024-01-15T10:20:00',
    category: '质量管理'
  },
  {
    id: 'MSG006',
    type: 'system',
    title: '考勤异常提醒',
    content: '员工张三今日未正常打卡，请确认是否请假或出差。如有特殊情况，请及时补办相关手续。',
    priority: 'low',
    sender: '人事管理系统',
    recipient: '人事部',
    createdAt: '2024-01-15T09:30:00',
    isRead: true,
    readAt: '2024-01-15T09:45:00',
    category: '人事管理'
  },
  {
    id: 'MSG007',
    type: 'alert',
    title: '安全事件报告',
    content: '车间B发生轻微安全事件，员工李四操作时未佩戴防护眼镜。已进行安全教育，无人员受伤。请加强安全监督。',
    priority: 'medium',
    sender: '安全部',
    recipient: '车间主任',
    createdAt: '2024-01-15T08:45:00',
    isRead: false,
    category: '安全管理'
  },
  {
    id: 'MSG008',
    type: 'notification',
    title: '订单交付提醒',
    content: '订单SO20240110001预计交付时间为2024-01-17，当前生产进度85%，请确保按时交付。如有延期风险，请及时上报。',
    priority: 'medium',
    sender: '销售部',
    recipient: '生产部',
    createdAt: '2024-01-15T08:00:00',
    isRead: true,
    readAt: '2024-01-15T08:15:00',
    category: '订单管理'
  },
  {
    id: 'MSG009',
    type: 'system',
    title: '系统维护通知',
    content: 'ERP系统将于2024-01-16 02:00-04:00进行系统维护升级，期间系统将暂停服务。请提前做好数据备份工作。',
    priority: 'low',
    sender: 'IT部',
    recipient: '全体用户',
    createdAt: '2024-01-14T17:00:00',
    isRead: true,
    readAt: '2024-01-14T17:30:00',
    category: '系统通知'
  },
  {
    id: 'MSG010',
    type: 'reminder',
    title: '月度总结提醒',
    content: '请各部门在2024-01-20前提交1月份工作总结和2月份工作计划。总结内容包括：完成情况、问题分析、改进措施。',
    priority: 'low',
    sender: '办公室',
    recipient: '各部门',
    createdAt: '2024-01-14T16:00:00',
    isRead: false,
    category: '行政管理'
  }
]

export const messageStats: MessageStats = {
  totalMessages: 45,
  unreadMessages: 8,
  systemMessages: 12,
  alertMessages: 15,
  todayMessages: 10
}

// 消息分类
export const messageCategories = [
  { label: '全部', value: '' },
  { label: '设备告警', value: '设备告警' },
  { label: '生产通知', value: '生产通知' },
  { label: '库存管理', value: '库存管理' },
  { label: '设备维护', value: '设备维护' },
  { label: '质量管理', value: '质量管理' },
  { label: '人事管理', value: '人事管理' },
  { label: '安全管理', value: '安全管理' },
  { label: '订单管理', value: '订单管理' },
  { label: '系统通知', value: '系统通知' },
  { label: '行政管理', value: '行政管理' }
]

// Mock API函数
export function getMessages(params?: any) {
  return new Promise((resolve) => {
    setTimeout(() => {
      let filteredMessages = [...messages]
      
      if (params?.type) {
        filteredMessages = filteredMessages.filter(msg => msg.type === params.type)
      }
      
      if (params?.priority) {
        filteredMessages = filteredMessages.filter(msg => msg.priority === params.priority)
      }
      
      if (params?.category) {
        filteredMessages = filteredMessages.filter(msg => msg.category === params.category)
      }
      
      if (params?.isRead !== undefined) {
        filteredMessages = filteredMessages.filter(msg => msg.isRead === params.isRead)
      }
      
      if (params?.keyword) {
        filteredMessages = filteredMessages.filter(msg => 
          msg.title.includes(params.keyword) || 
          msg.content.includes(params.keyword)
        )
      }
      
      // 按时间倒序排列
      filteredMessages.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      
      resolve({
        code: 200,
        data: {
          list: filteredMessages,
          total: filteredMessages.length
        }
      })
    }, 300)
  })
}

export function getMessageStats() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        data: messageStats
      })
    }, 300)
  })
}

export function markMessageAsRead(id: string) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const message = messages.find(msg => msg.id === id)
      if (message) {
        message.isRead = true
        message.readAt = new Date().toISOString()
        messageStats.unreadMessages = Math.max(0, messageStats.unreadMessages - 1)
      }
      resolve({
        code: 200,
        message: '消息已标记为已读'
      })
    }, 200)
  })
}

export function markAllAsRead(category?: string) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const now = new Date().toISOString()
      let count = 0
      
      messages.forEach(msg => {
        if (!msg.isRead && (!category || msg.category === category)) {
          msg.isRead = true
          msg.readAt = now
          count++
        }
      })
      
      messageStats.unreadMessages = Math.max(0, messageStats.unreadMessages - count)
      
      resolve({
        code: 200,
        message: `已标记${count}条消息为已读`
      })
    }, 300)
  })
}

export function deleteMessage(id: string) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = messages.findIndex(msg => msg.id === id)
      if (index > -1) {
        const message = messages[index]
        messages.splice(index, 1)
        messageStats.totalMessages--
        if (!message.isRead) {
          messageStats.unreadMessages--
        }
      }
      resolve({
        code: 200,
        message: '消息删除成功'
      })
    }, 300)
  })
}

export function sendMessage(data: any) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newMessage: Message = {
        id: 'MSG' + (messages.length + 1).toString().padStart(3, '0'),
        type: data.type || 'notification',
        title: data.title,
        content: data.content,
        priority: data.priority || 'medium',
        sender: data.sender || '当前用户',
        recipient: data.recipient,
        createdAt: new Date().toISOString(),
        isRead: false,
        category: data.category || '其他'
      }
      
      messages.unshift(newMessage)
      messageStats.totalMessages++
      messageStats.unreadMessages++
      messageStats.todayMessages++
      
      resolve({
        code: 200,
        message: '消息发送成功'
      })
    }, 300)
  })
} 