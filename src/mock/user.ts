// 用户管理模块Mock数据
import type { User, Role, Permission } from '@/types'

// 权限数据
export const permissions: Permission[] = [
  {
    id: 'dashboard',
    name: '仪表盘',
    code: 'dashboard:view',
    type: 'menu'
  },
  {
    id: 'sop',
    name: 'SOP管理',
    code: 'sop',
    type: 'menu',
    children: [
      { id: 'sop:list', name: 'SOP列表', code: 'sop:list', type: 'menu' },
      { id: 'sop:create', name: '创建SOP', code: 'sop:create', type: 'button' },
      { id: 'sop:edit', name: '编辑SOP', code: 'sop:edit', type: 'button' },
      { id: 'sop:delete', name: '删除SOP', code: 'sop:delete', type: 'button' }
    ]
  },
  {
    id: 'performance',
    name: '绩效管理',
    code: 'performance',
    type: 'menu',
    children: [
      { id: 'perf:view', name: '查看绩效', code: 'perf:view', type: 'menu' },
      { id: 'perf:export', name: '导出数据', code: 'perf:export', type: 'button' }
    ]
  },
  {
    id: 'attendance',
    name: '考勤管理',
    code: 'attendance',
    type: 'menu',
    children: [
      { id: 'att:record', name: '考勤记录', code: 'att:record', type: 'menu' },
      { id: 'att:schedule', name: '排班管理', code: 'att:schedule', type: 'menu' },
      { id: 'att:approval', name: '考勤审批', code: 'att:approval', type: 'menu' }
    ]
  },
  {
    id: 'quality',
    name: '品质管理',
    code: 'quality',
    type: 'menu',
    children: [
      { id: 'quality:defect', name: '品质异常', code: 'quality:defect', type: 'menu' }
    ]
  },
  {
    id: 'equipment',
    name: '设备管理',
    code: 'equipment',
    type: 'menu',
    children: [
      { id: 'equipment:list', name: '设备列表', code: 'equipment:list', type: 'menu' }
    ]
  },
  {
    id: 'inventory',
    name: '仓储管理',
    code: 'inventory',
    type: 'menu',
    children: [
      { id: 'inventory:stock', name: '库存总览', code: 'inventory:stock', type: 'menu' }
    ]
  },
  {
    id: 'message',
    name: '消息中心',
    code: 'message',
    type: 'menu',
    children: [
      { id: 'message:center', name: '消息中心', code: 'message:center', type: 'menu' }
    ]
  },
  {
    id: 'user',
    name: '用户管理',
    code: 'user',
    type: 'menu',
    children: [
      { id: 'user:list', name: '用户列表', code: 'user:list', type: 'menu' },
      { id: 'user:create', name: '创建用户', code: 'user:create', type: 'button' },
      { id: 'user:edit', name: '编辑用户', code: 'user:edit', type: 'button' },
      { id: 'user:delete', name: '删除用户', code: 'user:delete', type: 'button' },
      { id: 'user:reset', name: '重置密码', code: 'user:reset', type: 'button' }
    ]
  }
]

// 角色数据
export const roles: Role[] = [
  {
    id: 'admin',
    name: '系统管理员',
    code: 'admin',
    description: '拥有系统所有权限',
    permissions: permissions.flatMap(p => [p.code, ...(p.children?.map(c => c.code) || [])]),
    isSystem: true,
    createdAt: '2024-01-01T00:00:00'
  },
  {
    id: 'manager',
    name: '部门经理',
    code: 'manager',
    description: '部门管理权限，可查看和管理本部门数据',
    permissions: [
      'dashboard:view', 'sop:list', 'sop:create', 'sop:edit',
      'perf:view', 'att:record', 'att:schedule', 'quality:defect',
      'equipment:list', 'inventory:stock', 'message:center'
    ],
    isSystem: false,
    createdAt: '2024-01-01T00:00:00'
  },
  {
    id: 'operator',
    name: '操作员',
    code: 'operator',
    description: '基本操作权限，可查看相关数据',
    permissions: [
      'dashboard:view', 'sop:list', 'perf:view', 'att:record',
      'quality:defect', 'equipment:list', 'message:center'
    ],
    isSystem: false,
    createdAt: '2024-01-01T00:00:00'
  },
  {
    id: 'viewer',
    name: '访客',
    code: 'viewer',
    description: '只读权限，仅可查看基础数据',
    permissions: [
      'dashboard:view', 'sop:list', 'perf:view', 'message:center'
    ],
    isSystem: false,
    createdAt: '2024-01-01T00:00:00'
  }
]

// 用户数据
export const users: User[] = [
  {
    id: 'user001',
    username: 'admin',
    email: 'admin@company.com',
    realName: '系统管理员',
    phone: '13800138000',
    department: 'IT部',
    position: '系统管理员',
    role: 'admin',
    avatar: '/avatars/admin.jpg',
    permissions: roles.find(r => r.code === 'admin')?.permissions || [],
    status: 'active',
    createdAt: '2024-01-01T00:00:00',
    lastLoginAt: '2024-01-15T14:30:00',
    loginCount: 156
  },
  {
    id: 'user002',
    username: 'manager_prod',
    email: 'manager.prod@company.com',
    realName: '王经理',
    phone: '13800138001',
    department: '生产部',
    position: '生产经理',
    role: 'manager',
    avatar: '/avatars/manager.jpg',
    permissions: roles.find(r => r.code === 'manager')?.permissions || [],
    status: 'active',
    createdAt: '2024-01-02T00:00:00',
    lastLoginAt: '2024-01-15T13:45:00',
    loginCount: 89
  },
  {
    id: 'user003',
    username: 'operator_001',
    email: 'operator1@company.com',
    realName: '张师傅',
    phone: '13800138002',
    department: '生产部',
    position: '机床操作员',
    role: 'operator',
    permissions: roles.find(r => r.code === 'operator')?.permissions || [],
    status: 'active',
    createdAt: '2024-01-03T00:00:00',
    lastLoginAt: '2024-01-15T08:00:00',
    loginCount: 245
  },
  {
    id: 'user004',
    username: 'qc_001',
    email: 'qc1@company.com',
    realName: '李检验员',
    phone: '13800138003',
    department: '质检部',
    position: '质量检验员',
    role: 'operator',
    permissions: roles.find(r => r.code === 'operator')?.permissions || [],
    status: 'active',
    createdAt: '2024-01-04T00:00:00',
    lastLoginAt: '2024-01-15T09:30:00',
    loginCount: 167
  },
  {
    id: 'user005',
    username: 'maintenance_001',
    email: 'maintenance1@company.com',
    realName: '赵维修',
    phone: '13800138004',
    department: '维修部',
    position: '设备维修工',
    role: 'operator',
    permissions: roles.find(r => r.code === 'operator')?.permissions || [],
    status: 'active',
    createdAt: '2024-01-05T00:00:00',
    lastLoginAt: '2024-01-14T16:20:00',
    loginCount: 98
  },
  {
    id: 'user006',
    username: 'warehouse_001',
    email: 'warehouse1@company.com',
    realName: '刘仓管',
    phone: '13800138005',
    department: '仓储部',
    position: '仓库管理员',
    role: 'operator',
    permissions: roles.find(r => r.code === 'operator')?.permissions || [],
    status: 'active',
    createdAt: '2024-01-06T00:00:00',
    lastLoginAt: '2024-01-15T07:45:00',
    loginCount: 134
  },
  {
    id: 'user007',
    username: 'temp_user',
    email: 'temp@company.com',
    realName: '临时用户',
    phone: '13800138006',
    department: '办公室',
    position: '临时工',
    role: 'viewer',
    permissions: roles.find(r => r.code === 'viewer')?.permissions || [],
    status: 'inactive',
    createdAt: '2024-01-07T00:00:00',
    lastLoginAt: '2024-01-10T10:00:00',
    loginCount: 5
  },
  {
    id: 'user008',
    username: 'locked_user',
    email: 'locked@company.com',
    realName: '被锁定用户',
    phone: '13800138007',
    department: '生产部',
    position: '操作员',
    role: 'operator',
    permissions: roles.find(r => r.code === 'operator')?.permissions || [],
    status: 'locked',
    createdAt: '2024-01-08T00:00:00',
    lastLoginAt: '2024-01-12T14:30:00',
    loginCount: 23
  }
]

// Mock API函数
export function getUsers(params?: any) {
  return new Promise((resolve) => {
    setTimeout(() => {
      let filteredUsers = [...users]
      
      if (params?.role) {
        filteredUsers = filteredUsers.filter(user => user.role === params.role)
      }
      
      if (params?.status) {
        filteredUsers = filteredUsers.filter(user => user.status === params.status)
      }
      
      if (params?.department) {
        filteredUsers = filteredUsers.filter(user => user.department === params.department)
      }
      
      if (params?.keyword) {
        filteredUsers = filteredUsers.filter(user => 
          user.username.includes(params.keyword) || 
          user.realName.includes(params.keyword) ||
          user.email.includes(params.keyword)
        )
      }
      
      resolve({
        code: 200,
        data: {
          list: filteredUsers,
          total: filteredUsers.length
        }
      })
    }, 300)
  })
}

export function getRoles() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        data: roles
      })
    }, 300)
  })
}

export function getPermissions() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        data: permissions
      })
    }, 300)
  })
}

export function createUser(data: any) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newUser: User = {
        id: 'user' + (users.length + 1).toString().padStart(3, '0'),
        username: data.username,
        email: data.email,
        realName: data.realName,
        phone: data.phone,
        department: data.department,
        position: data.position,
        role: data.role,
        permissions: roles.find(r => r.code === data.role)?.permissions || [],
        status: 'active',
        createdAt: new Date().toISOString(),
        loginCount: 0
      }
      
      users.push(newUser)
      
      resolve({
        code: 200,
        message: '用户创建成功'
      })
    }, 500)
  })
}

export function updateUser(id: string, data: any) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const user = users.find(u => u.id === id)
      if (user) {
        Object.assign(user, data)
        if (data.role) {
          user.permissions = roles.find(r => r.code === data.role)?.permissions || []
        }
      }
      resolve({
        code: 200,
        message: '用户信息更新成功'
      })
    }, 500)
  })
}

export function deleteUser(id: string) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = users.findIndex(u => u.id === id)
      if (index > -1) {
        users.splice(index, 1)
      }
      resolve({
        code: 200,
        message: '用户删除成功'
      })
    }, 500)
  })
}

export function resetPassword(id: string) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        message: '密码重置成功，新密码为：123456'
      })
    }, 500)
  })
}

export function changeUserStatus(id: string, status: string) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const user = users.find(u => u.id === id)
      if (user) {
        user.status = status as any
      }
      resolve({
        code: 200,
        message: '用户状态更新成功'
      })
    }, 500)
  })
} 