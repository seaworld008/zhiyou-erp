<template>
  <div class="kpi-card industrial-card">
    <div class="kpi-header">
      <div class="kpi-icon" :style="{ color: color }">
        <el-icon :size="24">
          <Box v-if="icon === 'cube'" />
          <Document v-else-if="icon === 'document'" />
          <CircleCheck v-else-if="icon === 'checkmark'" />
          <Warning v-else-if="icon === 'warning'" />
          <CopyDocument v-else-if="icon === 'layers'" />
          <Money v-else-if="icon === 'cash'" />
          <TrendCharts v-else />
        </el-icon>
      </div>
      <div class="kpi-trend" :class="trendClass">
        <el-icon :size="16">
          <TrendCharts v-if="trend > 0" />
          <Bottom v-else />
        </el-icon>
        <span>{{ Math.abs(trend) }}%</span>
      </div>
    </div>
    
    <div class="kpi-content">
      <h3 class="kpi-title">{{ title }}</h3>
      <div class="kpi-value-wrapper">
        <span class="kpi-value animated-number" :style="{ color: color }">
          {{ formattedValue }}
        </span>
        <span class="kpi-unit">{{ unit }}</span>
      </div>
    </div>
    
    <!-- 工厂主题下的装饰线条 -->
    <div v-if="themeStore.isFactory" class="decoration-line"></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { 
  Box, 
  Document, 
  CircleCheck, 
  Warning,
  Money,
  TrendCharts,
  Bottom,
  CopyDocument
} from '@element-plus/icons-vue'
import { useThemeStore } from '@/stores/theme'

interface Props {
  title: string
  value: number
  unit?: string
  icon?: string
  color?: string
  trend?: number
}

const props = withDefaults(defineProps<Props>(), {
  unit: '',
  icon: 'stats',
  color: '#18a058',
  trend: 0
})

const themeStore = useThemeStore()

const formattedValue = computed(() => {
  if (props.value >= 10000) {
    return (props.value / 10000).toFixed(1) + 'w'
  } else if (props.value >= 1000) {
    return (props.value / 1000).toFixed(1) + 'k'
  }
  return props.value.toString()
})

const trendClass = computed(() => {
  return props.trend > 0 ? 'trend-up' : 'trend-down'
})
</script>

<style scoped>
.kpi-card {
  position: relative;
  background: var(--bg-card);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid var(--border-color);
  transition: all 0.3s ease;
  overflow: hidden;
}

.kpi-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

[data-theme="factory"] .kpi-card {
  background: linear-gradient(135deg, rgba(0, 216, 255, 0.15) 0%, rgba(0, 27, 46, 0.9) 100%);
  border: 1px solid rgba(0, 216, 255, 0.3);
  box-shadow: 0 8px 32px rgba(0, 216, 255, 0.2);
}

.kpi-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.kpi-icon {
  padding: 8px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
}

[data-theme="factory"] .kpi-icon {
  background: rgba(0, 216, 255, 0.2);
}

.kpi-trend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: bold;
  padding: 4px 8px;
  border-radius: 4px;
}

.trend-up {
  color: #18a058;
  background: rgba(24, 160, 88, 0.1);
}

.trend-down {
  color: #d03050;
  background: rgba(208, 48, 80, 0.1);
}

.kpi-content {
  text-align: left;
}

.kpi-title {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0 0 8px 0;
  font-weight: normal;
}

.kpi-value-wrapper {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.kpi-value {
  font-size: 32px;
  font-weight: bold;
  font-family: 'Courier New', monospace;
  line-height: 1;
}

[data-theme="factory"] .kpi-value {
  text-shadow: 0 0 10px currentColor;
  animation: pulse 2s ease-in-out infinite;
}

.kpi-unit {
  font-size: 14px;
  color: var(--text-secondary);
  font-weight: normal;
}

.decoration-line {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--industrial-blue), transparent);
  animation: scanline 3s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}

@keyframes scanline {
  0% { opacity: 0; }
  50% { opacity: 1; }
  100% { opacity: 0; }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .kpi-card {
    padding: 16px;
  }
  
  .kpi-value {
    font-size: 24px;
  }
}
</style> 