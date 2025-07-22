<template>
  <div 
    :class="[
      'responsive-button-group',
      `responsive-button-group--${direction}`,
      `responsive-button-group--${size}`,
      {
        'responsive-button-group--wrap': wrap,
        'responsive-button-group--stretch': stretch
      }
    ]"
  >
    <template v-for="(button, index) in buttons" :key="button.key || index">
      <!-- 分隔符 -->
      <div 
        v-if="button.type === 'divider'" 
        class="button-divider"
      />
      
      <!-- 下拉按钮组 -->
      <el-dropdown 
        v-else-if="button.type === 'dropdown'"
        :trigger="button.trigger || 'click'"
        :placement="button.placement || 'bottom'"
        :disabled="button.disabled"
        @command="(command) => handleDropdownCommand(button, command)"
      >
        <el-button
          :type="button.buttonType || 'default'"
          :size="button.size || size"
          :icon="button.icon"
          :loading="button.loading"
          :disabled="button.disabled"
          :plain="button.plain"
          :round="button.round"
          :circle="button.circle"
        >
          {{ button.text }}
          <el-icon class="el-icon--right">
            <ArrowDown />
          </el-icon>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item
              v-for="item in button.items"
              :key="item.key || item.command"
              :command="item.command"
              :disabled="item.disabled"
              :divided="item.divided"
              :icon="item.icon"
            >
              {{ item.text }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      
      <!-- 普通按钮 -->
      <el-button
        v-else
        :type="button.type || 'default'"
        :size="button.size || size"
        :icon="button.icon"
        :loading="button.loading"
        :disabled="button.disabled"
        :plain="button.plain"
        :round="button.round"
        :circle="button.circle"
        :color="button.color"
        :dark="button.dark"
        :link="button.link"
        :text="button.text && !button.circle"
        @click="() => handleButtonClick(button, index)"
      >
        <template v-if="button.circle && button.icon">
          <el-icon>
            <component :is="button.icon" />
          </el-icon>
        </template>
        <template v-else>
          {{ button.text }}
        </template>
      </el-button>
    </template>
    
    <!-- 更多按钮（响应式折叠） -->
    <el-dropdown 
      v-if="showMoreButton && collapsedButtons.length > 0"
      trigger="click"
      placement="bottom-end"
    >
      <el-button 
        :size="size"
        :icon="MoreFilled"
        circle
      />
      <template #dropdown>
        <el-dropdown-menu>
          <template v-for="(button, index) in collapsedButtons" :key="button.key || index">
            <el-dropdown-item
              v-if="button.type !== 'divider'"
              :disabled="button.disabled"
              :divided="index === 0"
              @click="() => handleButtonClick(button, index)"
            >
              <el-icon v-if="button.icon" class="dropdown-icon">
                <component :is="button.icon" />
              </el-icon>
              {{ button.text }}
            </el-dropdown-item>
          </template>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { ArrowDown, MoreFilled } from '@element-plus/icons-vue'

interface DropdownItem {
  key?: string
  command: string
  text: string
  icon?: any
  disabled?: boolean
  divided?: boolean
}

interface Button {
  key?: string
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'text' | 'default' | 'dropdown' | 'divider'
  buttonType?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'text' | 'default'
  text?: string
  icon?: any
  size?: 'large' | 'default' | 'small'
  loading?: boolean
  disabled?: boolean
  plain?: boolean
  round?: boolean
  circle?: boolean
  color?: string
  dark?: boolean
  link?: boolean
  command?: string
  trigger?: 'hover' | 'click' | 'contextmenu'
  placement?: string
  items?: DropdownItem[]
  onClick?: (button: Button, index: number) => void
  priority?: number // 优先级，数字越小越重要，用于响应式折叠
}

interface Props {
  buttons: Button[]
  direction?: 'horizontal' | 'vertical'
  size?: 'large' | 'default' | 'small'
  wrap?: boolean
  stretch?: boolean
  responsive?: boolean
  maxVisibleButtons?: number
  gap?: string | number
}

const props = withDefaults(defineProps<Props>(), {
  direction: 'horizontal',
  size: 'default',
  wrap: false,
  stretch: false,
  responsive: true,
  maxVisibleButtons: 5
})

const emit = defineEmits(['button-click', 'dropdown-command'])

const containerRef = ref<HTMLElement>()
const containerWidth = ref(0)
const showMoreButton = ref(false)

// 计算可见按钮和折叠按钮
const visibleButtons = computed(() => {
  if (!props.responsive) return props.buttons
  
  const sortedButtons = [...props.buttons].sort((a, b) => {
    const priorityA = a.priority ?? 999
    const priorityB = b.priority ?? 999
    return priorityA - priorityB
  })
  
  if (showMoreButton.value && sortedButtons.length > props.maxVisibleButtons) {
    return sortedButtons.slice(0, props.maxVisibleButtons)
  }
  
  return sortedButtons
})

const collapsedButtons = computed(() => {
  if (!props.responsive || !showMoreButton.value) return []
  
  const sortedButtons = [...props.buttons].sort((a, b) => {
    const priorityA = a.priority ?? 999
    const priorityB = b.priority ?? 999
    return priorityA - priorityB
  })
  
  return sortedButtons.slice(props.maxVisibleButtons)
})

// 事件处理
const handleButtonClick = (button: Button, index: number) => {
  if (button.onClick) {
    button.onClick(button, index)
  }
  emit('button-click', button, index)
}

const handleDropdownCommand = (button: Button, command: string) => {
  emit('dropdown-command', button, command)
}

// 响应式处理
const updateLayout = () => {
  if (!props.responsive || !containerRef.value) return
  
  const container = containerRef.value
  const containerRect = container.getBoundingClientRect()
  containerWidth.value = containerRect.width
  
  // 简单的响应式逻辑：当容器宽度小于一定值时显示更多按钮
  const breakpoint = 600 // 可以根据需要调整
  showMoreButton.value = containerWidth.value < breakpoint && props.buttons.length > props.maxVisibleButtons
}

let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  if (props.responsive && containerRef.value) {
    resizeObserver = new ResizeObserver(updateLayout)
    resizeObserver.observe(containerRef.value)
    updateLayout()
  }
})

onUnmounted(() => {
  if (resizeObserver) {
    resizeObserver.disconnect()
  }
})
</script>

<style scoped lang="scss">
@import '@/styles/responsive.scss';

.responsive-button-group {
  display: flex;
  align-items: center;
  
  // 方向
  &--horizontal {
    flex-direction: row;
    gap: 8px;
    
    @include respond-to(md) {
      gap: 12px;
    }
    
    @include respond-to(lg) {
      gap: 16px;
    }
  }
  
  &--vertical {
    flex-direction: column;
    gap: 8px;
    
    @include respond-to(md) {
      gap: 12px;
    }
  }
  
  // 尺寸
  &--small {
    gap: 6px;
    
    @include respond-to(md) {
      gap: 8px;
    }
  }
  
  &--large {
    gap: 12px;
    
    @include respond-to(md) {
      gap: 16px;
    }
    
    @include respond-to(lg) {
      gap: 20px;
    }
  }
  
  // 换行
  &--wrap {
    flex-wrap: wrap;
  }
  
  // 拉伸
  &--stretch {
    width: 100%;
    
    .el-button {
      flex: 1;
    }
  }
  
  // 分隔符
  .button-divider {
    width: 1px;
    height: 20px;
    background: var(--el-border-color-light);
    margin: 0 4px;
    
    @include respond-to(md) {
      margin: 0 8px;
    }
    
    .responsive-button-group--vertical & {
      width: 20px;
      height: 1px;
      margin: 4px 0;
      
      @include respond-to(md) {
        margin: 8px 0;
      }
    }
  }
  
  // 按钮样式增强
  .el-button {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    
    &:hover {
      transform: translateY(-1px);
      
      @include respond-to(lg) {
        transform: translateY(-2px);
      }
    }
    
    &:active {
      transform: translateY(0);
    }
    
    // 圆形按钮优化
    &.is-circle {
      &:hover {
        transform: scale(1.1);
      }
    }
  }
  
  // 下拉菜单图标
  .dropdown-icon {
    margin-right: 8px;
    font-size: 14px;
  }
}

// 响应式隐藏
@include respond-below(sm) {
  .responsive-button-group {
    &--horizontal {
      .el-button:not(.is-circle) {
        min-width: auto;
        padding: 8px 12px;
        
        span {
          @include respond-below(xs) {
            display: none;
          }
        }
      }
    }
  }
}

// 工厂主题优化
[data-theme="factory"] {
  .responsive-button-group {
    .el-button {
      &:not(.el-button--text):not(.el-button--link) {
        background: linear-gradient(135deg, rgba(0, 216, 255, 0.1) 0%, rgba(0, 27, 46, 0.8) 100%);
        border-color: rgba(0, 216, 255, 0.3);
        color: var(--industrial-blue);
        
        &:hover {
          background: linear-gradient(135deg, rgba(0, 216, 255, 0.2) 0%, rgba(0, 27, 46, 0.9) 100%);
          border-color: rgba(0, 216, 255, 0.5);
          box-shadow: 0 4px 12px rgba(0, 216, 255, 0.3);
        }
      }
      
      &.el-button--primary {
        background: linear-gradient(135deg, var(--industrial-blue) 0%, rgba(0, 150, 200, 1) 100%);
        border-color: var(--industrial-blue);
        
        &:hover {
          background: linear-gradient(135deg, rgba(0, 216, 255, 0.9) 0%, rgba(0, 150, 200, 0.9) 100%);
          box-shadow: 0 6px 16px rgba(0, 216, 255, 0.4);
        }
      }
    }
    
    .button-divider {
      background: rgba(0, 216, 255, 0.3);
    }
  }
}

// 暗黑主题优化
[data-theme="dark"] {
  .responsive-button-group {
    .el-button {
      &:not(.el-button--text):not(.el-button--link) {
        background: var(--el-bg-color-overlay);
        border-color: var(--el-border-color-darker);
        
        &:hover {
          background: var(--el-bg-color);
          border-color: var(--el-border-color);
        }
      }
    }
    
    .button-divider {
      background: var(--el-border-color-darker);
    }
  }
}

// 打印样式
@media print {
  .responsive-button-group {
    display: none !important;
  }
}
</style>