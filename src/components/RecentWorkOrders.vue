<template>
  <div class="work-orders">
    <n-list>
      <n-list-item v-for="order in data" :key="order.id">
        <n-thing>
          <template #header>
            <div class="order-header">
              <span class="order-id">{{ order.id }}</span>
              <n-tag 
                :type="getStatusType(order.status)" 
                size="small"
              >
                {{ getStatusText(order.status) }}
              </n-tag>
            </div>
          </template>
          <template #description>
            <div class="order-info">
              <p class="product-name">{{ order.product_name }}</p>
              <p class="order-progress">
                进度: {{ order.done_qty }}/{{ order.plan_qty }} 
                <span v-if="order.pass_qty !== undefined">
                  (合格: {{ order.pass_qty }})
                </span>
              </p>
            </div>
          </template>
          <template #footer>
            <div class="order-footer">
              <n-time :time="new Date(order.start_time)" format="MM-dd HH:mm" />
              <div class="progress-bar">
                <n-progress 
                  :percentage="(order.done_qty / order.plan_qty) * 100" 
                  :status="order.status === 'done' ? 'success' : 'info'"
                  :show-indicator="false"
                  :height="4"
                />
              </div>
            </div>
          </template>
        </n-thing>
      </n-list-item>
    </n-list>
  </div>
</template>

<script setup lang="ts">
import type { WorkOrderSummary } from '@/types'

interface Props {
  data: WorkOrderSummary[]
}

defineProps<Props>()

const getStatusType = (status?: string) => {
  switch (status) {
    case 'done': return 'success'
    case 'running': return 'info'
    case 'planned': return 'warning'
    default: return 'default'
  }
}

const getStatusText = (status?: string) => {
  switch (status) {
    case 'done': return '已完成'
    case 'running': return '进行中'
    case 'planned': return '已计划'
    default: return '未知'
  }
}
</script>

<style scoped>
.work-orders {
  max-height: 300px;
  overflow-y: auto;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.order-id {
  font-weight: bold;
  color: var(--color-primary);
}

.order-info {
  margin: 8px 0;
}

.product-name {
  font-weight: 500;
  margin: 0 0 4px 0;
  color: var(--text-primary);
}

.order-progress {
  font-size: 12px;
  color: var(--text-secondary);
  margin: 0;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-top: 8px;
}

.progress-bar {
  flex: 1;
  margin-left: 12px;
}

:deep(.n-list-item) {
  padding: 12px 0;
}

:deep(.n-thing-header) {
  margin-bottom: 8px;
}
</style> 