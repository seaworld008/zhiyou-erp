<template>
  <el-card 
    shadow="hover"
    :body-style="{ padding: '0' }"
  >
    <template #header>
      <div class="card-header">
        <span class="title">SOP详情查看</span>
        <div class="header-actions">
          <el-button type="primary" @click="$emit('edit', sop)">
            <el-icon><Edit /></el-icon>
            编辑
          </el-button>
          <el-button circle @click="$emit('close')">
            <el-icon><Close /></el-icon>
          </el-button>
        </div>
      </div>
    </template>

    <div class="sop-detail">
      <!-- 基本信息 -->
      <div class="info-section">
        <h3 class="section-title">📋 基本信息</h3>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="SOP编号">{{ sop.id }}</el-descriptions-item>
          <el-descriptions-item label="版本">
            <el-tag type="info">{{ sop.version }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="产品代码">{{ sop.product_code }}</el-descriptions-item>
          <el-descriptions-item label="工序代码">{{ sop.process_code }}</el-descriptions-item>
          <el-descriptions-item label="标准工时">{{ formatTime(sop.std_time_sec) }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="sop.enabled ? 'success' : 'danger'">
              {{ sop.enabled ? '启用' : '禁用' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="更新时间">
            {{ new Date(sop.updated_at).toLocaleString('zh-CN') }}
          </el-descriptions-item>
          <el-descriptions-item label="更新人">{{ sop.updated_by }}</el-descriptions-item>
        </el-descriptions>
        
        <div class="title-section">
          <h4>作业标题</h4>
          <p class="sop-title">{{ sop.title }}</p>
        </div>
      </div>

      <!-- 作业步骤 -->
      <div class="steps-section">
        <h3 class="section-title">📝 作业步骤</h3>
        <div class="steps-list">
          <div 
            v-for="(step, index) in sop.steps" 
            :key="index"
            class="step-item"
          >
            <div class="step-header">
              <el-tag type="primary" size="small" round>步骤{{ step.seq }}</el-tag>
              <el-tag v-if="step.timer_sec" type="warning" size="small">
                <el-icon><Timer /></el-icon>
                {{ formatTime(step.timer_sec) }}
              </el-tag>
            </div>
            <div class="step-content">
              <p class="step-text">{{ step.text }}</p>
              <!-- 图片预览 -->
              <div v-if="step.image" class="step-media">
                <el-image 
                  :src="step.image" 
                  fit="cover"
                  :preview-src-list="[step.image]"
                  class="step-image"
                />
              </div>
              <!-- 视频预览 -->
              <div v-if="step.video" class="step-media">
                <video 
                  :src="step.video" 
                  controls 
                  class="step-video"
                  preload="metadata"
                >
                  您的浏览器不支持视频播放
                </video>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 工具清单 -->
      <div v-if="sop.tools && sop.tools.length" class="tools-section">
        <h3 class="section-title">🔧 工具清单</h3>
        <div class="tools-list">
          <el-tag 
            v-for="(tool, index) in sop.tools" 
            :key="index"
            class="tool-tag"
          >
            <el-icon><Tools /></el-icon>
            {{ tool }}
          </el-tag>
        </div>
      </div>

      <!-- 质检要点 -->
      <div v-if="sop.qc_points && sop.qc_points.length" class="qc-section">
        <h3 class="section-title">✅ 质检要点</h3>
        <div class="qc-list">
          <div 
            v-for="(point, index) in sop.qc_points" 
            :key="index"
            class="qc-item"
          >
            <el-icon class="qc-icon"><SuccessFilled /></el-icon>
            <span>{{ point }}</span>
          </div>
        </div>
      </div>

      <!-- 安全注意事项 -->
      <div v-if="sop.safety_points && sop.safety_points.length" class="safety-section">
        <h3 class="section-title">⚠️ 安全注意事项</h3>
        <div class="safety-list">
          <div 
            v-for="(point, index) in sop.safety_points" 
            :key="index"
            class="safety-item"
          >
            <el-icon class="safety-icon"><WarningFilled /></el-icon>
            <span>{{ point }}</span>
          </div>
        </div>
      </div>

      <!-- 附件列表 -->
      <div v-if="sop.attachments && sop.attachments.length" class="attachments-section">
        <h3 class="section-title">📎 相关附件</h3>
        <div class="attachments-list">
          <div 
            v-for="(attachment, index) in sop.attachments" 
            :key="index"
            class="attachment-item"
          >
            <el-icon class="attachment-icon">
              <Document v-if="attachment.type === 'pdf'" />
              <Picture v-else-if="attachment.type === 'image'" />
              <VideoPlay v-else-if="attachment.type === 'video'" />
              <Paperclip v-else />
            </el-icon>
            <a :href="attachment.url" target="_blank" class="attachment-link">
              {{ attachment.desc || '附件' + (index + 1) }}
            </a>
          </div>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { 
  Close,
  Edit,
  Timer,
  Tools,
  SuccessFilled,
  WarningFilled,
  Document,
  Picture,
  VideoPlay,
  Paperclip
} from '@element-plus/icons-vue'
import type { Sop } from '@/types'

interface Props {
  sop: Sop
  visible?: boolean
}

const props = defineProps<Props>()

defineEmits<{
  close: []
  edit: [sop: Sop]
}>()

// 格式化时间显示
const formatTime = (seconds: number): string => {
  if (seconds < 60) {
    return `${seconds}秒`
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return remainingSeconds > 0 ? `${minutes}分${remainingSeconds}秒` : `${minutes}分`
  } else {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return minutes > 0 ? `${hours}小时${minutes}分` : `${hours}小时`
  }
}
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.header-actions {
  display: flex;
  gap: 8px;
}

.sop-detail {
  padding: 20px;
  max-height: 80vh;
  overflow-y: auto;
}

.section-title {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--el-color-primary);
  border-bottom: 2px solid var(--el-color-primary-light-7);
  padding-bottom: 8px;
}

.info-section {
  margin-bottom: 24px;
}

.title-section {
  margin-top: 16px;
}

.title-section h4 {
  margin: 0 0 8px 0;
  color: var(--el-text-color-regular);
}

.sop-title {
  margin: 0;
  padding: 12px;
  background: var(--el-bg-color-page);
  border-radius: 6px;
  color: var(--el-text-color-primary);
  font-weight: 500;
}

.steps-section {
  margin-bottom: 24px;
}

.step-item {
  margin-bottom: 16px;
  padding: 16px;
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  background: var(--el-bg-color);
}

.step-header {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.step-text {
  margin: 0 0 12px 0;
  line-height: 1.6;
  color: var(--el-text-color-primary);
}

.step-media {
  margin-top: 12px;
}

.step-image {
  max-width: 200px;
  border-radius: 6px;
}

.step-video {
  max-width: 300px;
  border-radius: 6px;
}

.tools-section,
.qc-section,
.safety-section,
.attachments-section {
  margin-bottom: 24px;
}

.tools-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tool-tag {
  display: flex;
  align-items: center;
  gap: 4px;
}

.qc-list,
.safety-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.qc-item,
.safety-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border-radius: 4px;
  background: var(--el-bg-color-page);
}

.qc-icon {
  color: var(--el-color-success);
}

.safety-icon {
  color: var(--el-color-warning);
}

.attachments-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.attachment-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border-radius: 4px;
  background: var(--el-bg-color-page);
}

.attachment-icon {
  color: var(--el-color-info);
}

.attachment-link {
  color: var(--el-color-primary);
  text-decoration: none;
}

.attachment-link:hover {
  text-decoration: underline;
}
</style> 