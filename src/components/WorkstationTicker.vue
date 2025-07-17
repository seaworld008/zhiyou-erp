<template>
  <div class="workstation-ticker">
    <div class="ticker-container">
      <div class="ticker-content" ref="tickerRef">
        <div 
          v-for="station in data" 
          :key="station.station_id" 
          class="station-item"
          :class="getStatusClass(station.status)"
        >
          <div class="station-info">
            <span class="status-indicator" :class="`status-${station.status}`"></span>
            <span class="station-name">{{ station.station_name }}</span>
            <span class="emp-name">{{ station.emp_name || '空闲' }}</span>
          </div>
          <div class="station-progress" v-if="station.current_qty !== undefined">
            <span class="progress-text">
              {{ station.current_qty }}/{{ station.target_qty }}
            </span>
            <div class="progress-bar">
              <div 
                class="progress-fill" 
                :style="{ 
                  width: `${getProgress(station)}%`,
                  backgroundColor: getProgressColor(station.status)
                }"
              ></div>
            </div>
          </div>
        </div>
        
        <!-- 重复内容以实现无缝滚动 -->
        <div 
          v-for="station in data" 
          :key="`repeat-${station.station_id}`" 
          class="station-item"
          :class="getStatusClass(station.status)"
        >
          <div class="station-info">
            <span class="status-indicator" :class="`status-${station.status}`"></span>
            <span class="station-name">{{ station.station_name }}</span>
            <span class="emp-name">{{ station.emp_name || '空闲' }}</span>
          </div>
          <div class="station-progress" v-if="station.current_qty !== undefined">
            <span class="progress-text">
              {{ station.current_qty }}/{{ station.target_qty }}
            </span>
            <div class="progress-bar">
              <div 
                class="progress-fill" 
                :style="{ 
                  width: `${getProgress(station)}%`,
                  backgroundColor: getProgressColor(station.status)
                }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { WorkstationStatus } from '@/types'

interface Props {
  data: WorkstationStatus[]
}

const props = defineProps<Props>()

const tickerRef = ref<HTMLElement>()

const getStatusClass = (status?: string) => {
  return `station-status-${status || 'unknown'}`
}

const getProgress = (station: WorkstationStatus) => {
  if (!station.current_qty || !station.target_qty) return 0
  return Math.min((station.current_qty / station.target_qty) * 100, 100)
}

const getProgressColor = (status?: string) => {
  switch (status) {
    case 'running': return '#18a058'
    case 'idle': return '#f0a020'
    case 'downtime': return '#d03050'
    default: return '#ccc'
  }
}

onMounted(() => {
  // 启动跑马灯动画
  if (tickerRef.value) {
    tickerRef.value.style.animationDuration = `${props.data.length * 5}s`
  }
})
</script>

<style scoped>
.workstation-ticker {
  width: 100%;
  height: 80px;
  background: var(--bg-card);
  border-radius: 8px;
  border: 1px solid var(--border-color);
  overflow: hidden;
  position: relative;
}

[data-theme="factory"] .workstation-ticker {
  background: linear-gradient(135deg, rgba(0, 216, 255, 0.1) 0%, rgba(0, 27, 46, 0.8) 100%);
  border-color: rgba(0, 216, 255, 0.3);
}

.ticker-container {
  height: 100%;
  overflow: hidden;
  position: relative;
}

.ticker-content {
  display: flex;
  height: 100%;
  animation: marquee 30s linear infinite;
  gap: 24px;
}

.station-item {
  flex-shrink: 0;
  min-width: 280px;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  border-left: 3px solid var(--color-primary);
  transition: all 0.3s ease;
}

.station-status-running {
  border-left-color: #18a058;
}

.station-status-idle {
  border-left-color: #f0a020;
}

.station-status-downtime {
  border-left-color: #d03050;
}

[data-theme="factory"] .station-item {
  background: rgba(0, 216, 255, 0.1);
  backdrop-filter: blur(5px);
}

.station-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.station-name {
  font-weight: bold;
  color: var(--text-primary);
  font-size: 14px;
}

.emp-name {
  color: var(--text-secondary);
  font-size: 12px;
}

.station-progress {
  display: flex;
  align-items: center;
  gap: 8px;
}

.progress-text {
  font-size: 12px;
  color: var(--text-primary);
  font-weight: bold;
  min-width: 60px;
}

.progress-bar {
  flex: 1;
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 2px;
  transition: all 0.3s ease;
}

/* 状态指示器样式已在全局CSS中定义 */

@keyframes marquee {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

/* 悬停暂停动画 */
.workstation-ticker:hover .ticker-content {
  animation-play-state: paused;
}

/* Factory主题特效 */
[data-theme="factory"] .station-item {
  box-shadow: 0 2px 8px rgba(0, 216, 255, 0.2);
}

[data-theme="factory"] .station-name {
  text-shadow: 0 0 5px currentColor;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .workstation-ticker {
    height: 60px;
  }
  
  .station-item {
    min-width: 220px;
    padding: 8px 12px;
  }
  
  .station-name {
    font-size: 12px;
  }
  
  .emp-name {
    font-size: 10px;
  }
}
</style> 