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
      <!-- SOP基本信息 -->
      <div v-if="!isPlaying" class="sop-info-panel">
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
        <!-- 步骤内容 -->
        <div class="step-content">
          <!-- 步骤标题 -->
          <div class="step-header">
            <h2>步骤 {{ currentStepIndex + 1 }} / {{ currentSop?.steps.length }}</h2>
            <div class="step-progress">
              <el-progress
                :percentage="stepProgress"
                :show-text="false"
                color="#18a058"
              />
            </div>
          </div>

          <!-- 步骤详情 -->
          <div class="step-detail">
            <div class="step-text">
              <p>{{ currentStep?.text }}</p>
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

            <!-- 步骤定时器 -->
            <div v-if="currentStep?.timer_sec" class="step-timer">
              <el-progress
                type="circle"
                :percentage="timerProgress"
                :width="120"
                :stroke-width="8"
                color="#f0a020"
              >
                <div class="timer-content">
                  <div class="timer-value">{{ remainingTime }}</div>
                  <div class="timer-label">秒</div>
                </div>
              </el-progress>
            </div>
          </div>
        </div>

        <!-- 播放控制栏 -->
        <div class="play-controls">
          <div class="control-buttons">
            <el-button @click="previousStep" :disabled="currentStepIndex === 0">
              <el-icon>
                <DArrowLeft />
              </el-icon>
              上一步
            </el-button>

            <el-button @click="toggleAutoPlay" :type="isAutoPlay ? 'warning' : 'primary'">
              <el-icon>
                <component :is="isAutoPlay ? 'VideoPause' : 'VideoPlay'" />
              </el-icon>
              {{ isAutoPlay ? '暂停' : '播放' }}
            </el-button>

            <el-button @click="nextStep" :disabled="currentStepIndex === (currentSop?.steps.length || 0) - 1">
              <el-icon>
                <DArrowRight />
              </el-icon>
              下一步
            </el-button>
          </div>

          <div class="playback-speed">
            <span>播放速度：</span>
            <el-radio-group v-model="playbackSpeed" size="small">
              <el-radio-button value="0.5">0.5x</el-radio-button>
              <el-radio-button value="1">1x</el-radio-button>
              <el-radio-button value="1.5">1.5x</el-radio-button>
              <el-radio-button value="2">2x</el-radio-button>
            </el-radio-group>
          </div>
        </div>

        <!-- 步骤缩略图导航 -->
        <div class="step-navigation">
          <div class="nav-title">步骤导航</div>
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

    <!-- 工具提示面板 -->
    <div v-if="isPlaying && currentSop?.tools.length" class="tools-panel">
      <div class="panel-title">
        <el-icon>
          <Tools />
        </el-icon>
        所需工具
      </div>
      <div class="tools-list">
        <el-tag v-for="tool in currentSop.tools" :key="tool" size="small">
          {{ tool }}
        </el-tag>
      </div>
    </div>

    <!-- 安全提示面板 -->
    <div v-if="isPlaying && currentSop?.safety_points.length" class="safety-panel">
      <div class="panel-title">
        <el-icon>
          <Warning />
        </el-icon>
        安全注意事项
      </div>
      <div class="safety-list">
        <div v-for="point in currentSop.safety_points" :key="point" class="safety-item">
          <el-icon>
            <WarnTriangleFilled />
          </el-icon>
          {{ point }}
        </div>
      </div>
    </div>
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
  WarnTriangleFilled
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
  } else {
    ElMessage.error('SOP not found')
    goBack()
  }
}

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
    ElMessage.error('未指定SOP ID')
    goBack()
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
</script>

<style scoped>
.sop-play-container {
  height: 100vh;
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  color: white;
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
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
}

.sop-header h1 {
  font-size: 36px;
  margin-bottom: 16px;
  background: linear-gradient(45deg, #00d8ff, #18a058);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
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
  grid-template-columns: 1fr 300px;
  gap: 24px;
  height: 100%;
}

.step-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.step-header h2 {
  font-size: 28px;
  margin-bottom: 12px;
}

.step-detail {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 24px;
  align-items: start;
}

.step-text p {
  font-size: 20px;
  line-height: 1.6;
  background: rgba(255, 255, 255, 0.1);
  padding: 24px;
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.step-media {
  max-width: 400px;
}

.video-container video,
.image-container img {
  width: 100%;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.step-timer {
  grid-column: 1 / -1;
  display: flex;
  justify-content: center;
  margin-top: 24px;
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  margin-top: auto;
}

.control-buttons {
  display: flex;
  gap: 12px;
}

.playback-speed {
  display: flex;
  align-items: center;
  gap: 12px;
}

.step-navigation {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  padding: 16px;
  backdrop-filter: blur(10px);
}

.nav-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 16px;
  text-align: center;
}

.nav-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 400px;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.05);
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.nav-item.active {
  background: rgba(24, 160, 88, 0.3);
  border: 1px solid #18a058;
}

.nav-item.completed {
  background: rgba(24, 160, 88, 0.1);
}

.nav-number {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  flex-shrink: 0;
}

.nav-text {
  font-size: 12px;
  opacity: 0.9;
}

.complete-content {
  text-align: center;
  padding: 24px 0;
}

.complete-content h3 {
  margin: 16px 0;
  font-size: 24px;
  color: #18a058;
}

.complete-stats {
  margin-top: 24px;
  display: flex;
  justify-content: space-around;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-item .label {
  font-size: 14px;
  opacity: 0.7;
}

.stat-item .value {
  font-size: 18px;
  font-weight: bold;
  color: #18a058;
}

.tools-panel,
.safety-panel {
  position: fixed;
  right: 24px;
  background: rgba(0, 0, 0, 0.8);
  border-radius: 12px;
  padding: 16px;
  max-width: 300px;
  backdrop-filter: blur(10px);
}

.tools-panel {
  top: 120px;
}

.safety-panel {
  bottom: 24px;
}

.panel-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: bold;
  margin-bottom: 12px;
}

.tools-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.safety-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.safety-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .step-play-area {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr auto;
  }
  
  .step-navigation {
    order: -1;
  }
  
  .nav-items {
    flex-direction: row;
    overflow-x: auto;
    max-height: none;
  }
  
  .nav-item {
    flex-shrink: 0;
    min-width: 150px;
  }
}

@media (max-width: 768px) {
  .control-bar {
    padding: 12px 16px;
  }
  
  .play-area {
    padding: 16px;
  }
  
  .play-controls {
    flex-direction: column;
    gap: 16px;
  }
  
  .tools-panel,
  .safety-panel {
    position: relative;
    right: auto;
    margin-bottom: 16px;
  }
}
</style>