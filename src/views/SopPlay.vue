<template>
  <div class="sop-play-container" :class="{ 'fullscreen': isFullscreen }">
    <!-- 顶部控制栏 -->
    <div class="control-bar" :class="{ 'hidden': isFullscreen && isAutoPlay }">
      <div class="left-controls">
        <el-button @click="goBack" size="small">
          <el-icon>
            <ArrowLeft />
          </el-icon>
          返回
        </el-button>
        
        <div class="sop-info">
          <span class="sop-title">{{ currentSop?.title }}</span>
          <span class="sop-meta">{{ currentSop?.product_code }} | {{ currentSop?.process_code }}</span>
        </div>
      </div>
      
      <div class="center-progress" v-if="isPlaying">
        <div class="overall-progress">
          <span class="progress-text">总进度: {{ currentStepIndex + 1 }} / {{ currentSop?.steps.length }}</span>
          <el-progress
            :percentage="stepProgress"
            :show-text="false"
            color="#007bff"
            :stroke-width="6"
          />
        </div>
      </div>
      
      <div class="right-controls">
        <el-button @click="toggleFullscreen" size="small" type="primary" plain>
          <el-icon>
            <component :is="isFullscreen ? FullScreen : FullScreen" />
          </el-icon>
          {{ isFullscreen ? '退出全屏' : '全屏播放' }}
        </el-button>
      </div>
    </div>

    <!-- 主播放区域 -->
    <div class="play-area">
      <!-- SOP选择器 -->
      <div v-if="showSopSelector" class="sop-selector">
        <div class="selector-header">
          <h2>选择要播放的SOP</h2>
          <p>请从下列可用的SOP中选择一个进行播放</p>
        </div>
        
        <div class="sop-grid">
          <div 
            v-for="sop in availableSops" 
            :key="sop.id"
            class="sop-card"
            :class="{ 'selected': selectedSopId === sop.id }"
            @click="selectedSopId = sop.id"
          >
            <div class="sop-card-header">
              <el-tooltip :content="sop.title" placement="top" :disabled="sop.title.length <= 20">
                <h3>{{ sop.title }}</h3>
              </el-tooltip>
              <el-tag :type="sop.enabled ? 'success' : 'danger'">
                {{ sop.enabled ? '启用' : '禁用' }}
              </el-tag>
            </div>
            <div class="sop-card-content">
              <div class="sop-card-info">
                <p><strong>产品代码:</strong> {{ sop.product_code }}</p>
                <p><strong>工序代码:</strong> {{ sop.process_code }}</p>
                <p><strong>版本:</strong> {{ sop.version }}</p>
                <p><strong>步骤数:</strong> {{ sop.steps.length }}</p>
                <p><strong>标准时间:</strong> {{ formatTime(sop.std_time_sec) }}</p>
              </div>
              
              <div class="sop-actions">
                <el-button 
                  @click.stop="playDirectly(sop.id)"
                  type="primary"
                  size="small"
                  class="play-direct-btn"
                >
                  <el-icon><VideoPlay /></el-icon>
                  立即播放
                </el-button>
              </div>
            </div>
          </div>
        </div>
        
        <div class="selector-actions">
          <el-button @click="goBack" size="large">返回</el-button>
          <el-button 
            type="primary" 
            @click="selectSop" 
            size="large"
            :disabled="!selectedSopId"
          >
            开始播放
          </el-button>
        </div>
      </div>

      <!-- SOP基本信息 -->
      <div v-else-if="!isPlaying" class="sop-info-panel">
        <div class="sop-header">
          <h1>{{ currentSop?.title }}</h1>
          <div class="sop-details">
            <el-tag type="info">{{ currentSop?.product_code }}</el-tag>
            <el-tag type="success">{{ currentSop?.process_code }}</el-tag>
            <el-tag type="warning">版本: {{ currentSop?.version }}</el-tag>
          </div>
        </div>

        <div class="sop-summary">
          <el-row :gutter="16">
            <el-col :span="6">
              <el-statistic title="总步骤数" :value="currentSop?.steps.length || 0" />
            </el-col>
            <el-col :span="6">
              <el-statistic title="标准工时" :value="formatTime(currentSop?.std_time_sec || 0)" />
            </el-col>
            <el-col :span="6">
              <el-statistic title="工具数量" :value="currentSop?.tools.length || 0" />
            </el-col>
            <el-col :span="6">
              <el-statistic title="检查点" :value="currentSop?.qc_points.length || 0" />
            </el-col>
          </el-row>
        </div>

        <!-- 开始播放按钮 -->
        <div class="start-controls">
          <el-button type="primary" size="large" @click="startPlay">
            <el-icon size="20">
              <VideoPlay />
            </el-icon>
            开始播放
          </el-button>
          
          <el-checkbox v-model="isAutoPlayEnabled">
            自动播放 ({{ autoPlayInterval }}秒/步)
          </el-checkbox>
          
          <el-checkbox v-model="isVoiceEnabled">
            语音提示
          </el-checkbox>
        </div>
      </div>

      <!-- 步骤播放区域 -->
      <div v-else class="step-play-area">
        <!-- 左侧：步骤导航 -->
        <div class="left-sidebar">
          <div class="step-navigation">
            <div class="nav-title">
              <el-icon><List /></el-icon>
              步骤导航
            </div>
            <div class="nav-items">
              <div
                v-for="(step, index) in currentSop?.steps"
                :key="index"
                class="nav-item"
                :class="{ 
                  'active': index === currentStepIndex,
                  'completed': index < currentStepIndex 
                }"
                @click="goToStep(index)"
              >
                <div class="nav-number">{{ index + 1 }}</div>
                <div class="nav-text">{{ (step.text || step.title || step.description || '').substring(0, 20) }}...</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 中间：主要内容区域 -->
        <div class="main-content">
          <!-- 步骤内容 -->
          <div class="step-content">
            <div class="step-header">
              <h3 class="step-title">步骤 {{ currentStepIndex + 1 }}: {{ currentStep?.title || currentStep?.text?.substring(0, 30) || '无标题' }}</h3>
              <div class="step-timer-inline" v-if="currentStep?.timer_sec">
                <el-progress
                  type="circle"
                  :percentage="timerProgress"
                  :width="60"
                  :stroke-width="4"
                  color="#f0a020"
                >
                  <span class="timer-text">{{ remainingTime }}s</span>
                </el-progress>
              </div>
            </div>
            
            <div class="step-body">
              <div class="step-description-text">
                {{ currentStep?.text }}
              </div>
              
              <!-- 步骤媒体 -->
              <div class="step-media" v-if="currentStep?.image || currentStep?.video">
                <div v-if="currentStep?.video" class="video-container">
                  <video
                    ref="videoRef"
                    :src="currentStep.video"
                    controls
                    @ended="onVideoEnded"
                    @loadeddata="onVideoLoaded"
                  >
                    您的浏览器不支持视频播放。
                  </video>
                </div>
                
                <div v-else-if="currentStep?.image" class="image-container">
                  <img :src="currentStep.image" :alt="`步骤${currentStepIndex + 1}图片`" />
                </div>
              </div>
            </div>
          </div>
          
          <!-- 播放控制栏 -->
          <div class="play-controls">
            <!-- 主要控制按钮 -->
            <div class="main-controls">
              <el-button 
                @click="previousStep" 
                :disabled="currentStepIndex === 0"
                size="large"
                class="control-btn"
              >
                <el-icon><DArrowLeft /></el-icon>
                上一步
              </el-button>

              <el-button 
                @click="toggleAutoPlay" 
                :type="isAutoPlay ? 'warning' : 'primary'"
                size="large"
                class="play-button"
              >
                <el-icon size="20">
                  <component :is="isAutoPlay ? 'VideoPause' : 'VideoPlay'" />
                </el-icon>
                {{ isAutoPlay ? '暂停' : '播放' }}
              </el-button>

              <el-button 
                @click="nextStep" 
                :disabled="currentStepIndex === (currentSop?.steps.length || 0) - 1"
                size="large"
                class="control-btn"
              >
                下一步
                <el-icon><DArrowRight /></el-icon>
              </el-button>
            </div>

            <!-- 辅助控制 -->
            <div class="secondary-controls">
              <div class="playback-speed">
                <span class="speed-label">播放速度</span>
                <el-radio-group v-model="playbackSpeed" size="small" class="speed-buttons">
                  <el-radio-button value="0.5">0.5x</el-radio-button>
                  <el-radio-button value="1">1x</el-radio-button>
                  <el-radio-button value="1.5">1.5x</el-radio-button>
                  <el-radio-button value="2">2x</el-radio-button>
                </el-radio-group>
              </div>
              
              <div class="control-options">
                <el-checkbox v-model="isAutoPlayEnabled" size="small">
                  自动播放
                </el-checkbox>
                <el-checkbox v-model="isVoiceEnabled" size="small">
                  语音提示
                </el-checkbox>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧：工具和安全提示 -->
        <div class="right-sidebar">
          <!-- 工具提示 -->
          <div v-if="currentSop?.tools.length" class="info-panel tools-panel">
            <div class="panel-title">
              <el-icon><Tools /></el-icon>
              所需工具
            </div>
            <div class="tools-list">
              <el-tag v-for="tool in currentSop.tools" :key="tool" size="small">
                {{ tool }}
              </el-tag>
            </div>
          </div>

          <!-- 安全提示 -->
          <div v-if="currentSop?.safety_points.length" class="info-panel safety-panel">
            <div class="panel-title">
              <el-icon><Warning /></el-icon>
              安全注意事项
            </div>
            <div class="safety-list">
              <div v-for="point in currentSop.safety_points" :key="point" class="safety-item">
                <el-icon><WarnTriangleFilled /></el-icon>
                {{ point }}
              </div>
            </div>
          </div>
          
          <!-- 统计信息 -->
          <div class="info-panel stats-panel">
            <div class="panel-title">
              <el-icon><DataAnalysis /></el-icon>
              播放统计
            </div>
            <div class="stats-content">
              <div class="stat-row">
                <span class="stat-label">当前步骤:</span>
                <span class="stat-value">{{ currentStepIndex + 1 }} / {{ currentSop?.steps.length }}</span>
              </div>
              <div class="stat-row">
                <span class="stat-label">已用时间:</span>
                <span class="stat-value">{{ formatDuration(currentTotalPlayTime) }}</span>
              </div>
              <div class="stat-row">
                <span class="stat-label">标准工时:</span>
                <span class="stat-value">{{ formatTime(currentSop?.std_time_sec || 0) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 完成播放提示 -->
    <el-dialog v-model="showCompleteModal" title="播放完成" width="500px" :close-on-click-modal="false">
      <div class="complete-content">
        <el-icon size="64" color="#18a058">
          <SuccessFilled />
        </el-icon>
        <h3>SOP播放完成！</h3>
        <p>您已完成《{{ currentSop?.title }}》的学习</p>
        
        <div class="complete-stats">
          <div class="stat-item">
            <span class="label">总用时：</span>
            <span class="value">{{ formatDuration(totalPlayTime) }}</span>
          </div>
          <div class="stat-item">
            <span class="label">标准工时：</span>
            <span class="value">{{ formatTime(currentSop?.std_time_sec || 0) }}</span>
          </div>
        </div>
      </div>
      
      <template #footer>
        <div style="display: flex; justify-content: flex-end; gap: 12px;">
          <el-button @click="restartPlay">重新播放</el-button>
          <el-button type="primary" @click="finishPlay">完成学习</el-button>
        </div>
      </template>
    </el-dialog>


  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  ArrowLeft,
  FullScreen,
  VideoPlay,
  VideoPause,
  DArrowLeft,
  DArrowRight,
  SuccessFilled,
  Tools,
  Warning,
  WarnTriangleFilled,
  List,
  DataAnalysis
} from '@element-plus/icons-vue'
import { mockSops } from '@/mock/sop'
import type { Sop, SopStep } from '@/types'

const router = useRouter()
const route = useRoute()

// 数据状态
const currentSop = ref<Sop | null>(null)
const isPlaying = ref(false)
const isFullscreen = ref(false)
const currentStepIndex = ref(0)
const isAutoPlay = ref(false)
const isAutoPlayEnabled = ref(true)
const isVoiceEnabled = ref(true)
const autoPlayInterval = ref(30) // 秒
const playbackSpeed = ref('1')
const totalPlayTime = ref(0)
const stepStartTime = ref(0)
const showCompleteModal = ref(false)
const showSopSelector = ref(false)
const availableSops = ref<Sop[]>([])
const selectedSopId = ref('')

// 定时器相关
const autoPlayTimer = ref<number | null>(null)
const stepTimer = ref<number | null>(null)
const remainingTime = ref(0)
const timerInterval = ref<number | null>(null)

// 视频引用
const videoRef = ref<HTMLVideoElement | null>(null)

// 计算属性
const currentStep = computed(() => {
  if (!currentSop.value || currentStepIndex.value >= currentSop.value.steps.length) {
    return null
  }
  return currentSop.value.steps[currentStepIndex.value]
})

const stepProgress = computed(() => {
  if (!currentSop.value) return 0
  return ((currentStepIndex.value + 1) / currentSop.value.steps.length) * 100
})

const timerProgress = computed(() => {
  if (!currentStep.value?.timer_sec) return 0
  return ((currentStep.value.timer_sec - remainingTime.value) / currentStep.value.timer_sec) * 100
})

// 方法
const loadSop = (sopId: string) => {
  const sop = mockSops.find(s => s.id === sopId)
  if (sop) {
    currentSop.value = sop
    showSopSelector.value = false
  } else {
    ElMessage.error('SOP not found')
    goBack()
  }
}

const loadAvailableSops = () => {
  availableSops.value = mockSops.filter(sop => sop.enabled)
}

const selectSop = () => {
  if (!selectedSopId.value) {
    ElMessage.warning('请选择一个SOP')
    return
  }
  loadSop(selectedSopId.value)
}

// 直接播放SOP（从列表点击播放按钮）
const playDirectly = (sopId: string) => {
  loadSop(sopId)
  nextTick(() => {
    startPlay()
  })
}

// 导出playDirectly方法供模板使用
defineExpose({
  playDirectly
})

const formatTime = (seconds: number) => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  if (hours > 0) {
    return `${hours}小时${minutes}分钟`
  }
  return `${minutes}分钟`
}

const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${minutes}分${secs}秒`
}

const goBack = () => {
  if (isFullscreen.value) {
    exitFullscreen()
  }
  router.back()
}

const toggleFullscreen = async () => {
  if (isFullscreen.value) {
    await exitFullscreen()
  } else {
    await enterFullscreen()
  }
}

const enterFullscreen = async () => {
  try {
    await document.documentElement.requestFullscreen()
    isFullscreen.value = true
  } catch (error) {
    console.error('Failed to enter fullscreen:', error)
  }
}

const exitFullscreen = async () => {
  try {
    if (document.fullscreenElement) {
      await document.exitFullscreen()
    }
    isFullscreen.value = false
  } catch (error) {
    console.error('Failed to exit fullscreen:', error)
  }
}

const startPlay = () => {
  isPlaying.value = true
  currentStepIndex.value = 0
  stepStartTime.value = Date.now()
  totalPlayTime.value = 0
  
  // 启动播放时间跟踪
  startPlayTimeTracking()
  
  if (isAutoPlayEnabled.value) {
    startAutoPlay()
  }
  
  startStepTimer()
  speakText(`开始播放${currentSop.value?.title}`)
}

const toggleAutoPlay = () => {
  isAutoPlay.value = !isAutoPlay.value
  
  if (isAutoPlay.value) {
    startAutoPlay()
  } else {
    stopAutoPlay()
  }
}

const startAutoPlay = () => {
  isAutoPlay.value = true
  if (autoPlayTimer.value) {
    clearTimeout(autoPlayTimer.value)
  }
  
  const interval = autoPlayInterval.value * 1000 / parseFloat(playbackSpeed.value)
  autoPlayTimer.value = setTimeout(() => {
    nextStep()
  }, interval)
}

const stopAutoPlay = () => {
  isAutoPlay.value = false
  if (autoPlayTimer.value) {
    clearTimeout(autoPlayTimer.value)
    autoPlayTimer.value = null
  }
  
  // 停止播放时间跟踪
  stopPlayTimeTracking()
}

const nextStep = () => {
  if (!currentSop.value || currentStepIndex.value >= currentSop.value.steps.length - 1) {
    finishPlayback()
    return
  }
  
  totalPlayTime.value += Math.floor((Date.now() - stepStartTime.value) / 1000)
  currentStepIndex.value++
  stepStartTime.value = Date.now()
  
  startStepTimer()
  speakText(currentStep.value?.text || '')
  
  if (isAutoPlay.value) {
    startAutoPlay()
  }
}

const previousStep = () => {
  if (currentStepIndex.value <= 0) return
  
  stopAutoPlay()
  currentStepIndex.value--
  stepStartTime.value = Date.now()
  startStepTimer()
  speakText(currentStep.value?.text || '')
}

const goToStep = (index: number) => {
  if (index < 0 || index >= (currentSop.value?.steps.length || 0)) return
  
  stopAutoPlay()
  currentStepIndex.value = index
  stepStartTime.value = Date.now()
  startStepTimer()
  speakText(currentStep.value?.text || '')
}

const startStepTimer = () => {
  if (stepTimer.value) {
    clearTimeout(stepTimer.value)
  }
  
  if (timerInterval.value) {
    clearInterval(timerInterval.value)
  }
  
  const timer = currentStep.value?.timer_sec
  if (timer) {
    remainingTime.value = timer
    
    timerInterval.value = setInterval(() => {
      remainingTime.value--
      if (remainingTime.value <= 0) {
        clearInterval(timerInterval.value!)
        if (isAutoPlay.value) {
          nextStep()
        }
      }
    }, 1000)
  }
}

const speakText = (text: string) => {
  if (!isVoiceEnabled.value || !text) return
  
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'zh-CN'
    utterance.rate = parseFloat(playbackSpeed.value)
    speechSynthesis.speak(utterance)
  }
}

const onVideoEnded = () => {
  if (isAutoPlay.value) {
    nextStep()
  }
}

const onVideoLoaded = () => {
  if (videoRef.value) {
    videoRef.value.playbackRate = parseFloat(playbackSpeed.value)
  }
}

const finishPlayback = () => {
  totalPlayTime.value += Math.floor((Date.now() - stepStartTime.value) / 1000)
  stopAutoPlay()
  showCompleteModal.value = true
  speakText('SOP播放完成')
}

const restartPlay = () => {
  showCompleteModal.value = false
  startPlay()
}

const finishPlay = () => {
  showCompleteModal.value = false
  goBack()
}

// 生命周期
onMounted(() => {
  const sopId = route.query.id as string
  if (sopId) {
    loadSop(sopId)
  } else {
    // 如果没有指定SOP ID，显示SOP选择界面
    loadAvailableSops()
    showSopSelector.value = true
  }
  
  // 监听全屏变化
  document.addEventListener('fullscreenchange', () => {
    isFullscreen.value = !!document.fullscreenElement
  })
  
  // 监听键盘事件
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  stopAutoPlay()
  if (stepTimer.value) {
    clearTimeout(stepTimer.value)
  }
  if (timerInterval.value) {
    clearInterval(timerInterval.value)
  }
  // 清理播放时间跟踪定时器
  stopPlayTimeTracking()
  
  document.removeEventListener('keydown', handleKeydown)
})

const handleKeydown = (event: KeyboardEvent) => {
  if (!isPlaying.value) return
  
  switch (event.code) {
    case 'Space':
      event.preventDefault()
      toggleAutoPlay()
      break
    case 'ArrowLeft':
      event.preventDefault()
      previousStep()
      break
    case 'ArrowRight':
      event.preventDefault()
      nextStep()
      break
    case 'Escape':
      if (isFullscreen.value) {
        exitFullscreen()
      }
      break
    case 'KeyF':
      event.preventDefault()
      toggleFullscreen()
      break
  }
}

// 监听播放速度变化
watch(playbackSpeed, (newSpeed) => {
  if (videoRef.value) {
    videoRef.value.playbackRate = parseFloat(newSpeed)
  }
})

// 监听步骤变化，更新总播放时间
watch(currentStepIndex, () => {
  if (stepStartTime.value > 0) {
    totalPlayTime.value += Math.floor((Date.now() - stepStartTime.value) / 1000)
  }
  stepStartTime.value = Date.now()
})

// 实时更新播放时间
const updatePlayTime = () => {
  if (isPlaying.value && stepStartTime.value > 0) {
    // 每秒更新一次播放时间，触发响应式更新
    const currentTime = Math.floor((Date.now() - stepStartTime.value) / 1000)
    // 这里不直接修改totalPlayTime，而是在组件中计算当前总时间
  }
}

// 启动播放时间更新定时器
let playTimeTimer: number | null = null

const startPlayTimeTracking = () => {
  if (playTimeTimer) {
    clearInterval(playTimeTimer)
  }
  playTimeTimer = setInterval(updatePlayTime, 1000)
}

const stopPlayTimeTracking = () => {
  if (playTimeTimer) {
    clearInterval(playTimeTimer)
    playTimeTimer = null
  }
}

// 计算当前总播放时间
const currentTotalPlayTime = computed(() => {
  if (!isPlaying.value || stepStartTime.value === 0) {
    return totalPlayTime.value
  }
  const currentStepTime = Math.floor((Date.now() - stepStartTime.value) / 1000)
  return totalPlayTime.value + currentStepTime
})
</script>

<style scoped>
.sop-play-container {
  height: 100vh;
  background: #ffffff;
  color: #2c3e50;
  overflow: hidden;
  position: relative;
}



.sop-play-container.fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999;
}

.control-bar {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  align-items: center;
  padding: 12px 24px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  min-height: 60px;
}

.center-progress {
  display: flex;
  justify-content: center;
  align-items: center;
}

.overall-progress {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  min-width: 300px;
}

.progress-text {
  font-size: 14px;
  font-weight: 500;
  color: #2c3e50;
}

.control-bar.hidden {
  opacity: 0;
  transform: translateY(-100%);
}

.left-controls {
  display: flex;
  align-items: center;
  gap: 16px;
}

.sop-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.sop-title {
  font-size: 18px;
  font-weight: bold;
}

.sop-meta {
  font-size: 14px;
  opacity: 0.8;
}

.play-area {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  height: calc(100vh - 80px);
}

.sop-info-panel {
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.sop-header h1 {
  font-size: 36px;
  margin-bottom: 16px;
  color: #2c3e50;
}

.sop-details {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 32px;
}

.sop-summary {
  margin-bottom: 48px;
}

.start-controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

.step-play-area {
  display: grid;
  grid-template-columns: 280px 1fr 300px;
  gap: 20px;
  height: calc(100vh - 140px);
  max-width: 1600px;
  margin: 0 auto;
  padding: 0;
}

.left-sidebar {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.main-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 0;
}

.right-sidebar {
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
}

.step-content {
  background: #ffffff;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

.step-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.step-timer-inline {
  display: flex;
  align-items: center;
}

.timer-text {
  font-size: 12px;
  font-weight: 600;
  color: #f0a020;
}

.step-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;
  overflow-y: auto;
}

.step-description-text {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  font-size: 16px;
  line-height: 1.6;
  color: #495057;
  margin-bottom: 16px;
}

.step-title {
  font-size: 20px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.step-description {
  font-size: 16px;
  line-height: 1.6;
  color: #495057;
  margin: 0;
}

.step-timer {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 12px;
}

.step-media {
  max-width: 100%;
  display: flex;
  justify-content: center;
}

.video-container video,
.image-container img {
  max-width: 500px;
  width: 100%;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #e9ecef;
}



.timer-content {
  text-align: center;
}

.timer-value {
  font-size: 24px;
  font-weight: bold;
}

.timer-label {
  font-size: 14px;
  opacity: 0.8;
}

.play-controls {
  background: #ffffff;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.main-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.play-button {
  min-width: 120px !important;
  height: 48px !important;
}

.secondary-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}

.playback-speed {
  display: flex;
  align-items: center;
  gap: 12px;
}

.speed-label {
  font-size: 14px;
  color: #6c757d;
  font-weight: 500;
}

.speed-buttons {
  border-radius: 8px;
  overflow: hidden;
}

.control-options {
  display: flex;
  gap: 16px;
}

.step-navigation {
  background: #ffffff;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.nav-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  text-align: center;
  color: #2c3e50;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.nav-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  overflow-y: auto;
}

.nav-items::-webkit-scrollbar {
  width: 4px;
}

.nav-items::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 2px;
}

.nav-items::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 2px;
}

.nav-items::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #f8f9fa;
  border: 1px solid transparent;
  color: #495057;
  width: 100%;
  flex-shrink: 0;
}

.nav-item:hover {
  background: #e9ecef;
  border-color: #dee2e6;
}

.nav-item.active {
  background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
  border-color: #007bff;
  color: white;
  box-shadow: 0 2px 8px rgba(0, 123, 255, 0.25);
}

.nav-item.completed {
  background: #d4edda;
  border-color: #c3e6cb;
  color: #155724;
}

.nav-number {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 600;
  flex-shrink: 0;
  border: 1px solid #dee2e6;
  color: #6c757d;
}

.nav-item.active .nav-number {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
  color: white;
}

.nav-item.completed .nav-number {
  background: #28a745;
  border-color: #28a745;
  color: white;
}

.nav-text {
  font-size: 12px;
  line-height: 1.2;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.complete-content {
  text-align: center;
  padding: 48px 40px;
  background: #ffffff;
  border-radius: 20px;
  border: 1px solid #e9ecef;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  margin: 0 auto;
}

.complete-content h3 {
  margin: 16px 0;
  font-size: 28px;
  font-weight: 600;
  color: #28a745;
}

.complete-stats {
  margin-top: 32px;
  display: flex;
  justify-content: space-around;
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e9ecef;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  text-align: center;
}

.stat-item .label {
  font-size: 14px;
  color: #6c757d;
  font-weight: 500;
}

.stat-item .value {
  font-size: 20px;
  font-weight: bold;
  color: #007bff;
}

.side-info {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-panel {
  background: #ffffff;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #e9ecef;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.panel-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #2c3e50;
  font-size: 14px;
  padding-bottom: 6px;
  border-bottom: 1px solid #f0f0f0;
}

.tools-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tools-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tools-list .el-tag {
  background: #f8f9fa !important;
  border: 1px solid #dee2e6 !important;
  color: #495057 !important;
  font-size: 11px;
  padding: 2px 6px;
}

.safety-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.safety-item {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  font-size: 12px;
  line-height: 1.3;
  padding: 6px 8px;
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 6px;
  color: #856404;
}

/* 统计面板样式 */
.stats-panel {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
}

.stats-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #e9ecef;
}

.stat-row:last-child {
  border-bottom: none;
}

.stat-label {
  font-size: 13px;
  color: #6c757d;
  font-weight: 500;
}

.stat-value {
  font-size: 14px;
  font-weight: 600;
  color: #007bff;
}

/* 控制按钮样式 */
.control-btn {
  min-width: 100px;
}

.play-button {
  min-width: 120px !important;
  height: 48px !important;
}

/* SOP选择器样式 */
.sop-selector {
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
  background: #ffffff;
  border: 1px solid #e9ecef;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
}

.selector-header {
  margin-bottom: 40px;
}

.selector-header h2 {
  font-size: 28px;
  margin-bottom: 16px;
  color: #2c3e50;
  font-weight: 600;
}

.selector-header p {
  font-size: 16px;
  color: #6c757d;
  line-height: 1.5;
}

.sop-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
  align-items: stretch;
}

@media (max-width: 768px) {
  .sop-grid {
    grid-template-columns: 1fr;
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .sop-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1025px) {
  .sop-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.sop-card {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 16px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  min-height: 200px;
  display: flex;
  flex-direction: column;
}

.sop-card:hover {
  background: #ffffff;
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  border-color: #007bff;
}

.sop-card.selected {
  border-color: #007bff;
  background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
  box-shadow: 0 8px 32px rgba(0, 123, 255, 0.25);
  color: white;
}

.sop-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.sop-card-header h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: #2c3e50;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
  line-height: 1.4;
}

.sop-card.selected .sop-card-header h3 {
  color: white;
}

.sop-card-content {
  text-align: left;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.sop-card-info {
  flex: 1;
}

.sop-card-content p {
  margin: 8px 0;
  font-size: 14px;
  color: #6c757d;
  line-height: 1.6;
}

.sop-card.selected .sop-card-content p {
  color: rgba(255, 255, 255, 0.9);
}

.sop-actions {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e9ecef;
  display: flex;
  justify-content: center;
}

.sop-card.selected .sop-actions {
  border-top-color: rgba(255, 255, 255, 0.2);
}

.play-direct-btn {
  width: 100%;
  background: linear-gradient(135deg, #28a745, #20c997) !important;
  border: none !important;
  color: white !important;
  font-weight: 500;
}

.play-direct-btn:hover {
  background: linear-gradient(135deg, #20c997, #17a2b8) !important;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3) !important;
}

.sop-card.selected .play-direct-btn {
  background: rgba(255, 255, 255, 0.2) !important;
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
  backdrop-filter: blur(10px);
}

.sop-card.selected .play-direct-btn:hover {
  background: rgba(255, 255, 255, 0.3) !important;
  border-color: rgba(255, 255, 255, 0.5) !important;
}

.selector-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
}

/* 响应式设计 */
@media (max-width: 1400px) {
  .step-play-area {
    grid-template-columns: 260px 1fr 280px;
  }
}

@media (max-width: 1200px) {
  .step-play-area {
    grid-template-columns: 240px 1fr 260px;
    gap: 16px;
  }
  
  .control-bar {
    grid-template-columns: 1fr 1fr 1fr;
  }
}

@media (max-width: 1024px) {
  .step-play-area {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr auto;
    height: calc(100vh - 120px);
  }
  
  .left-sidebar {
    order: 1;
  }
  
  .main-content {
    order: 2;
  }
  
  .right-sidebar {
    order: 3;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 16px;
  }
  
  .control-bar {
    grid-template-columns: 1fr;
    text-align: center;
  }
  
  .center-progress {
    order: 2;
    margin: 8px 0;
  }
}

@media (max-width: 768px) {
  .control-bar {
    padding: 8px 16px;
  }
  
  .play-area {
    padding: 12px;
  }
  
  .main-controls {
    flex-direction: column;
    gap: 12px;
  }
  
  .secondary-controls {
    flex-direction: column;
    gap: 12px;
  }
  
  .right-sidebar {
    grid-template-columns: 1fr;
  }
  
  .step-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .step-play-area {
    gap: 12px;
  }
}
/* 按钮增强样式 */
.el-button {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1)) !important;
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease !important;
}

.el-button:hover {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.2)) !important;
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(255, 255, 255, 0.2) !important;
}

.el-button--primary {
  background: linear-gradient(135deg, #007bff, #0056b3) !important;
  border: none !important;
  color: white !important;
}

.el-button--primary:hover {
  background: linear-gradient(135deg, #0056b3, #004085) !important;
  box-shadow: 0 4px 20px rgba(0, 123, 255, 0.3) !important;
}

.el-button--success {
  background: linear-gradient(135deg, #28a745, #1e7e34) !important;
  border: none !important;
  color: white !important;
}

.el-button--success:hover {
  background: linear-gradient(135deg, #1e7e34, #155724) !important;
  box-shadow: 0 4px 20px rgba(40, 167, 69, 0.3) !important;
}

/* 进度条增强 */
.el-progress-bar__outer {
  background: rgba(255, 255, 255, 0.2) !important;
  border-radius: 10px !important;
}

.el-progress-bar__inner {
  background: linear-gradient(90deg, #007bff, #28a745) !important;
  border-radius: 10px !important;
  box-shadow: 0 2px 10px rgba(0, 123, 255, 0.2) !important;
}

/* 圆形进度条增强 */
.el-progress-circle {
  filter: drop-shadow(0 4px 20px rgba(0, 123, 255, 0.2));
}

/* 标签增强 */
.el-tag {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1)) !important;
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1) !important;
}

.el-tag--success {
  background: #28a745 !important;
  border-color: #28a745 !important;
  color: white !important;
}

.el-tag--danger {
  background: #dc3545 !important;
  border-color: #dc3545 !important;
  color: white !important;
}

.el-tag--warning {
  background: linear-gradient(135deg, rgba(255, 193, 7, 0.3), rgba(255, 152, 0, 0.2)) !important;
  border-color: rgba(255, 193, 7, 0.5) !important;
}

/* 卡片增强 */
.el-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.05)) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  backdrop-filter: blur(20px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1) !important;
}

/* 统计数字增强 */
.el-statistic__content {
  color: #007bff !important;
  font-weight: 600 !important;
}

/* 移除粒子效果 */
</style>