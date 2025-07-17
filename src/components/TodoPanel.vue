<template>
  <div class="todo-panel">
    <n-list>
      <n-list-item v-for="todo in data" :key="todo.id">
        <n-thing>
          <template #avatar>
            <div class="todo-icon" :class="getTypeClass(todo.type)">
              <n-icon size="16">
                <CubeOutline v-if="todo.type === 'material'" />
                <CheckmarkCircleOutline v-else-if="todo.type === 'approve'" />
                <FlaskOutline v-else-if="todo.type === 'qa'" />
                <WarningOutline v-else-if="todo.type === 'andon'" />
                <EllipsisHorizontalOutline v-else />
              </n-icon>
            </div>
          </template>
          <template #header>
            <div class="todo-header">
              <span class="todo-title">{{ todo.title }}</span>
              <n-tag 
                :type="getPriorityType(todo.priority)" 
                size="small"
              >
                {{ getPriorityText(todo.priority) }}
              </n-tag>
            </div>
          </template>
          <template #footer>
            <div class="todo-footer">
              <n-time 
                :time="new Date(todo.created_at)" 
                format="MM-dd HH:mm"
                class="todo-time"
              />
              <n-button text type="primary" size="small">
                处理
              </n-button>
            </div>
          </template>
        </n-thing>
      </n-list-item>
    </n-list>
  </div>
</template>

<script setup lang="ts">
import { 
  CubeOutline, 
  CheckmarkCircleOutline, 
  FlaskOutline, 
  WarningOutline,
  EllipsisHorizontalOutline
} from '@vicons/ionicons5'
import type { TodoItem } from '@/types'

interface Props {
  data: TodoItem[]
}

defineProps<Props>()

const getTypeClass = (type: string) => {
  return `todo-type-${type}`
}

const getPriorityType = (priority: string) => {
  switch (priority) {
    case 'high': return 'error'
    case 'medium': return 'warning'
    case 'low': return 'info'
    default: return 'default'
  }
}

const getPriorityText = (priority: string) => {
  switch (priority) {
    case 'high': return '高'
    case 'medium': return '中'
    case 'low': return '低'
    default: return '未知'
  }
}
</script>

<style scoped>
.todo-panel {
  max-height: 300px;
  overflow-y: auto;
}

.todo-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.todo-type-material {
  background: #722ed1;
}

.todo-type-approve {
  background: #2080f0;
}

.todo-type-qa {
  background: #f0a020;
}

.todo-type-andon {
  background: #d03050;
}

.todo-type-other {
  background: #666;
}

.todo-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.todo-title {
  font-weight: 500;
  color: var(--text-primary);
  flex: 1;
  margin-right: 12px;
}

.todo-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-top: 8px;
}

.todo-time {
  font-size: 12px;
  color: var(--text-secondary);
}

:deep(.n-list-item) {
  padding: 12px 0;
}

:deep(.n-thing) {
  width: 100%;
}

:deep(.n-thing-header) {
  margin-bottom: 8px;
}

/* Factory主题下的特效 */
[data-theme="factory"] .todo-icon {
  box-shadow: 0 0 10px currentColor;
}
</style> 