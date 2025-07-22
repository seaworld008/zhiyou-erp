<template>
  <div 
    :class="[
      'responsive-card',
      `responsive-card--${variant}`,
      {
        'responsive-card--hoverable': hoverable,
        'responsive-card--loading': loading,
        'responsive-card--bordered': bordered
      }
    ]"
    :style="cardStyle"
  >
    <!-- 卡片头部 -->
    <div v-if="$slots.header || title" class="responsive-card__header">
      <slot name="header">
        <div class="responsive-card__title">
          <el-icon v-if="icon" class="responsive-card__icon">
            <component :is="icon" />
          </el-icon>
          <span class="responsive-card__title-text">{{ title }}</span>
          <el-tag v-if="tag" :type="tagType" size="small" class="responsive-card__tag">
            {{ tag }}
          </el-tag>
        </div>
        <div v-if="$slots.extra" class="responsive-card__extra">
          <slot name="extra" />
        </div>
      </slot>
    </div>

    <!-- 卡片内容 -->
    <div class="responsive-card__body">
      <el-skeleton v-if="loading" :rows="skeletonRows" animated />
      <slot v-else />
    </div>

    <!-- 卡片底部 -->
    <div v-if="$slots.footer" class="responsive-card__footer">
      <slot name="footer" />
    </div>

    <!-- 加载遮罩 -->
    <div v-if="loading" class="responsive-card__loading-mask">
      <el-icon class="is-loading">
        <Loading />
      </el-icon>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Loading } from '@element-plus/icons-vue'

interface Props {
  title?: string
  icon?: any
  tag?: string
  tagType?: 'success' | 'info' | 'warning' | 'danger'
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'
  hoverable?: boolean
  loading?: boolean
  bordered?: boolean
  shadow?: 'always' | 'hover' | 'never'
  size?: 'small' | 'default' | 'large'
  skeletonRows?: number
  minHeight?: string | number
  maxHeight?: string | number
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  tagType: 'info',
  hoverable: true,
  loading: false,
  bordered: true,
  shadow: 'hover',
  size: 'default',
  skeletonRows: 3
})

const cardStyle = computed(() => {
  const style: Record<string, any> = {}
  
  if (props.minHeight) {
    style.minHeight = typeof props.minHeight === 'number' 
      ? `${props.minHeight}px` 
      : props.minHeight
  }
  
  if (props.maxHeight) {
    style.maxHeight = typeof props.maxHeight === 'number' 
      ? `${props.maxHeight}px` 
      : props.maxHeight
  }
  
  return style
})
</script>

<style scoped lang="scss">
@import '@/styles/responsive.scss';

.responsive-card {
  background: var(--el-bg-color);
  border-radius: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  
  @include respond-to(md) {
    border-radius: 12px;
  }
  
  @include respond-to(lg) {
    border-radius: 16px;
  }
  
  // 变体样式
  &--default {
    border: 1px solid var(--el-border-color-light);
  }
  
  &--primary {
    border: 1px solid var(--el-color-primary-light-7);
    background: linear-gradient(135deg, var(--el-color-primary-light-9) 0%, var(--el-bg-color) 100%);
  }
  
  &--success {
    border: 1px solid var(--el-color-success-light-7);
    background: linear-gradient(135deg, var(--el-color-success-light-9) 0%, var(--el-bg-color) 100%);
  }
  
  &--warning {
    border: 1px solid var(--el-color-warning-light-7);
    background: linear-gradient(135deg, var(--el-color-warning-light-9) 0%, var(--el-bg-color) 100%);
  }
  
  &--danger {
    border: 1px solid var(--el-color-danger-light-7);
    background: linear-gradient(135deg, var(--el-color-danger-light-9) 0%, var(--el-bg-color) 100%);
  }
  
  &--info {
    border: 1px solid var(--el-color-info-light-7);
    background: linear-gradient(135deg, var(--el-color-info-light-9) 0%, var(--el-bg-color) 100%);
  }
  
  // 边框样式
  &--bordered {
    border-width: 1px;
    border-style: solid;
  }
  
  // 悬停效果
  &--hoverable {
    cursor: pointer;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
      
      @include respond-to(lg) {
        transform: translateY(-4px);
        box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
      }
    }
  }
  
  // 阴影样式
  &[data-shadow="always"] {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  &[data-shadow="hover"]:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  }
  
  // 尺寸变体
  &[data-size="small"] {
    .responsive-card__header {
      padding: 12px 16px;
    }
    
    .responsive-card__body {
      padding: 12px 16px;
    }
    
    .responsive-card__footer {
      padding: 12px 16px;
    }
  }
  
  &[data-size="large"] {
    .responsive-card__header {
      padding: 24px 32px;
      
      @include respond-to(lg) {
        padding: 32px 40px;
      }
    }
    
    .responsive-card__body {
      padding: 24px 32px;
      
      @include respond-to(lg) {
        padding: 32px 40px;
      }
    }
    
    .responsive-card__footer {
      padding: 24px 32px;
      
      @include respond-to(lg) {
        padding: 32px 40px;
      }
    }
  }
  
  // 头部样式
  &__header {
    padding: 16px 20px;
    border-bottom: 1px solid var(--el-border-color-lighter);
    display: flex;
    align-items: center;
    justify-content: space-between;
    
    @include respond-to(md) {
      padding: 18px 24px;
    }
    
    @include respond-to(lg) {
      padding: 20px 28px;
    }
  }
  
  &__title {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1;
    
    @include respond-to(lg) {
      gap: 12px;
    }
  }
  
  &__icon {
    font-size: 18px;
    color: var(--el-color-primary);
    
    @include respond-to(lg) {
      font-size: 20px;
    }
  }
  
  &__title-text {
    font-size: 16px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    
    @include respond-to(lg) {
      font-size: 18px;
    }
  }
  
  &__tag {
    margin-left: auto;
  }
  
  &__extra {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  // 内容样式
  &__body {
    padding: 16px 20px;
    
    @include respond-to(md) {
      padding: 18px 24px;
    }
    
    @include respond-to(lg) {
      padding: 20px 28px;
    }
  }
  
  // 底部样式
  &__footer {
    padding: 16px 20px;
    border-top: 1px solid var(--el-border-color-lighter);
    background: var(--el-bg-color-page);
    
    @include respond-to(md) {
      padding: 18px 24px;
    }
    
    @include respond-to(lg) {
      padding: 20px 28px;
    }
  }
  
  // 加载状态
  &--loading {
    pointer-events: none;
  }
  
  &__loading-mask {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
    
    .el-icon {
      font-size: 24px;
      color: var(--el-color-primary);
    }
  }
}

// 工厂主题优化
[data-theme="factory"] {
  .responsive-card {
    background: linear-gradient(135deg, rgba(0, 216, 255, 0.1) 0%, rgba(0, 27, 46, 0.8) 100%);
    border-color: rgba(0, 216, 255, 0.3);
    backdrop-filter: blur(10px);
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: linear-gradient(90deg, transparent, var(--industrial-blue), transparent);
      animation: scanline 3s infinite;
    }
    
    &--hoverable:hover {
      box-shadow: 0 8px 32px rgba(0, 216, 255, 0.3);
    }
  }
}

// 暗黑主题优化
[data-theme="dark"] {
  .responsive-card {
    background: var(--el-bg-color-overlay);
    border-color: var(--el-border-color-darker);
    
    &__loading-mask {
      background: rgba(0, 0, 0, 0.6);
    }
  }
}

@keyframes scanline {
  0% { opacity: 0; }
  50% { opacity: 1; }
  100% { opacity: 0; }
}
</style>