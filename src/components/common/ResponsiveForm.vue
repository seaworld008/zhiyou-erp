<template>
  <div class="responsive-form" :class="formClasses">
    <!-- 表单头部 -->
    <div v-if="showHeader" class="form-header">
      <div class="form-title-section">
        <h3 v-if="title" class="form-title">{{ title }}</h3>
        <p v-if="description" class="form-description">{{ description }}</p>
      </div>
      <div v-if="showHeaderActions" class="form-header-actions">
        <slot name="header-actions">
          <ResponsiveButtonGroup
            v-if="headerButtons.length"
            :buttons="headerButtons"
            size="small"
            @button-click="handleHeaderAction"
          />
        </slot>
      </div>
    </div>

    <!-- 表单内容 -->
    <n-form
      ref="formRef"
      :model="modelValue"
      :rules="rules"
      :label-placement="labelPlacement"
      :label-width="labelWidth"
      :size="size"
      :disabled="disabled"
      :show-feedback="showFeedback"
      :show-label="showLabel"
      :show-require-mark="showRequireMark"
      :require-mark-placement="requireMarkPlacement"
      :inline="inline"
      class="form-content"
      @submit="handleSubmit"
      @validate="handleValidate"
    >
      <!-- 表单项网格布局 -->
      <div class="form-grid" :class="gridClasses">
        <template v-for="(item, index) in formItems" :key="item.key || index">
          <!-- 分组标题 -->
          <div 
            v-if="item.type === 'group'"
            class="form-group-title"
            :class="{ 'col-span-full': true }"
          >
            <n-divider title-placement="left">
              <span class="group-title">{{ item.title }}</span>
            </n-divider>
          </div>

          <!-- 表单项 -->
          <n-form-item
            v-else
            :path="item.path"
            :label="item.label"
            :rule="item.rule"
            :show-feedback="item.showFeedback ?? showFeedback"
            :show-label="item.showLabel ?? showLabel"
            :show-require-mark="item.showRequireMark ?? showRequireMark"
            :require-mark-placement="item.requireMarkPlacement ?? requireMarkPlacement"
            :label-style="item.labelStyle"
            :label-props="item.labelProps"
            :feedback="item.feedback"
            :validation-status="item.validationStatus"
            :ignore-path-change="item.ignorePathChange"
            :class="getItemClasses(item)"
          >
            <!-- 动态表单控件 -->
            <component
              :is="getFormComponent(item.type)"
              v-model:value="getFieldValue(item.path)"
              v-bind="getComponentProps(item)"
              @update:value="updateFieldValue(item.path, $event)"
              @change="handleFieldChange(item, $event)"
              @blur="handleFieldBlur(item, $event)"
              @focus="handleFieldFocus(item, $event)"
            >
              <!-- 选项渲染 -->
              <template v-if="hasOptions(item.type)">
                <component
                  :is="getOptionComponent(item.type)"
                  v-for="option in item.options"
                  :key="option.value"
                  :value="option.value"
                  :label="option.label"
                  :disabled="option.disabled"
                >
                  {{ option.label }}
                </component>
              </template>
            </component>

            <!-- 表单项后缀 -->
            <template v-if="item.suffix" #suffix>
              <span class="form-item-suffix">{{ item.suffix }}</span>
            </template>

            <!-- 表单项帮助文本 -->
            <template v-if="item.help" #feedback>
              <span class="form-item-help">{{ item.help }}</span>
            </template>
          </n-form-item>
        </template>
      </div>
    </n-form>

    <!-- 表单底部操作 -->
    <div v-if="showFooter" class="form-footer">
      <slot name="footer">
        <ResponsiveButtonGroup
          :buttons="footerButtons"
          :justify="footerJustify"
          @button-click="handleFooterAction"
        />
      </slot>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { 
  NForm, 
  NFormItem, 
  NInput, 
  NInputNumber, 
  NSelect, 
  NSelectOption,
  NRadio,
  NRadioGroup,
  NCheckbox,
  NCheckboxGroup,
  NSwitch,
  NDatePicker,
  NTimePicker,
  NSlider,
  NRate,
  NUpload,
  NAutoComplete,
  NCascader,
  NTreeSelect,
  NColorPicker,
  NDivider
} from 'naive-ui'
import ResponsiveButtonGroup from './ResponsiveButtonGroup.vue'

// Props定义
const props = defineProps({
  // 表单数据
  modelValue: {
    type: Object,
    default: () => ({})
  },
  // 表单项配置
  formItems: {
    type: Array,
    default: () => []
  },
  // 验证规则
  rules: {
    type: Object,
    default: () => ({})
  },
  // 表单标题
  title: {
    type: String,
    default: ''
  },
  // 表单描述
  description: {
    type: String,
    default: ''
  },
  // 表单布局
  layout: {
    type: String,
    default: 'vertical', // vertical, horizontal, inline
    validator: (value) => ['vertical', 'horizontal', 'inline'].includes(value)
  },
  // 网格列数
  columns: {
    type: [Number, Object],
    default: () => ({
      xs: 1,
      sm: 2,
      md: 3,
      lg: 4,
      xl: 4
    })
  },
  // 表单尺寸
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  },
  // 标签位置
  labelPlacement: {
    type: String,
    default: 'top'
  },
  // 标签宽度
  labelWidth: {
    type: [String, Number],
    default: 'auto'
  },
  // 是否禁用
  disabled: {
    type: Boolean,
    default: false
  },
  // 是否显示反馈
  showFeedback: {
    type: Boolean,
    default: true
  },
  // 是否显示标签
  showLabel: {
    type: Boolean,
    default: true
  },
  // 是否显示必填标记
  showRequireMark: {
    type: Boolean,
    default: true
  },
  // 必填标记位置
  requireMarkPlacement: {
    type: String,
    default: 'right'
  },
  // 是否内联
  inline: {
    type: Boolean,
    default: false
  },
  // 是否显示头部
  showHeader: {
    type: Boolean,
    default: true
  },
  // 是否显示头部操作
  showHeaderActions: {
    type: Boolean,
    default: true
  },
  // 头部按钮
  headerButtons: {
    type: Array,
    default: () => []
  },
  // 是否显示底部
  showFooter: {
    type: Boolean,
    default: true
  },
  // 底部按钮
  footerButtons: {
    type: Array,
    default: () => [
      { id: 'cancel', label: '取消', type: 'default' },
      { id: 'submit', label: '提交', type: 'primary' }
    ]
  },
  // 底部对齐方式
  footerJustify: {
    type: String,
    default: 'end'
  },
  // 是否加载中
  loading: {
    type: Boolean,
    default: false
  }
})

// Emits定义
const emit = defineEmits([
  'update:modelValue',
  'submit',
  'validate',
  'field-change',
  'field-blur',
  'field-focus',
  'header-action',
  'footer-action'
])

// 表单引用
const formRef = ref(null)

// 计算属性
const formClasses = computed(() => {
  return {
    [`form-${props.layout}`]: true,
    [`form-${props.size}`]: true,
    'form-loading': props.loading,
    'form-disabled': props.disabled
  }
})

const gridClasses = computed(() => {
  if (typeof props.columns === 'number') {
    return `grid-cols-${props.columns}`
  }
  
  const classes = []
  Object.entries(props.columns).forEach(([breakpoint, cols]) => {
    if (breakpoint === 'xs') {
      classes.push(`grid-cols-${cols}`)
    } else {
      classes.push(`${breakpoint}:grid-cols-${cols}`)
    }
  })
  return classes
})

// 表单组件映射
const componentMap = {
  input: NInput,
  'input-number': NInputNumber,
  select: NSelect,
  radio: NRadioGroup,
  checkbox: NCheckboxGroup,
  switch: NSwitch,
  'date-picker': NDatePicker,
  'time-picker': NTimePicker,
  slider: NSlider,
  rate: NRate,
  upload: NUpload,
  'auto-complete': NAutoComplete,
  cascader: NCascader,
  'tree-select': NTreeSelect,
  'color-picker': NColorPicker
}

// 选项组件映射
const optionComponentMap = {
  select: NSelectOption,
  radio: NRadio,
  checkbox: NCheckbox
}

// 方法
const getFormComponent = (type) => {
  return componentMap[type] || NInput
}

const getOptionComponent = (type) => {
  return optionComponentMap[type]
}

const hasOptions = (type) => {
  return ['select', 'radio', 'checkbox'].includes(type)
}

const getComponentProps = (item) => {
  const baseProps = {
    placeholder: item.placeholder,
    disabled: item.disabled ?? props.disabled,
    size: item.size ?? props.size,
    clearable: item.clearable,
    ...item.props
  }

  // 特殊组件的特殊属性
  if (item.type === 'input-number') {
    Object.assign(baseProps, {
      min: item.min,
      max: item.max,
      step: item.step,
      precision: item.precision
    })
  }

  if (item.type === 'select') {
    Object.assign(baseProps, {
      multiple: item.multiple,
      filterable: item.filterable,
      remote: item.remote,
      'remote-method': item.remoteMethod
    })
  }

  return baseProps
}

const getItemClasses = (item) => {
  const classes = []
  
  if (item.span) {
    if (typeof item.span === 'number') {
      classes.push(`col-span-${item.span}`)
    } else {
      Object.entries(item.span).forEach(([breakpoint, span]) => {
        if (breakpoint === 'xs') {
          classes.push(`col-span-${span}`)
        } else {
          classes.push(`${breakpoint}:col-span-${span}`)
        }
      })
    }
  }
  
  if (item.className) {
    classes.push(item.className)
  }
  
  return classes
}

const getFieldValue = (path) => {
  return path.split('.').reduce((obj, key) => obj?.[key], props.modelValue)
}

const updateFieldValue = (path, value) => {
  const keys = path.split('.')
  const newValue = { ...props.modelValue }
  
  let current = newValue
  for (let i = 0; i < keys.length - 1; i++) {
    if (!current[keys[i]]) {
      current[keys[i]] = {}
    }
    current = current[keys[i]]
  }
  
  current[keys[keys.length - 1]] = value
  emit('update:modelValue', newValue)
}

// 事件处理
const handleSubmit = (e) => {
  e.preventDefault()
  formRef.value?.validate((errors) => {
    if (!errors) {
      emit('submit', props.modelValue)
    }
  })
}

const handleValidate = (errors) => {
  emit('validate', errors)
}

const handleFieldChange = (item, value) => {
  emit('field-change', {
    field: item.path,
    value,
    item
  })
}

const handleFieldBlur = (item, e) => {
  emit('field-blur', {
    field: item.path,
    event: e,
    item
  })
}

const handleFieldFocus = (item, e) => {
  emit('field-focus', {
    field: item.path,
    event: e,
    item
  })
}

const handleHeaderAction = (buttonId, value) => {
  emit('header-action', { buttonId, value })
}

const handleFooterAction = (buttonId, value) => {
  if (buttonId === 'submit') {
    handleSubmit({ preventDefault: () => {} })
  } else {
    emit('footer-action', { buttonId, value })
  }
}

// 暴露方法
const validate = () => {
  return formRef.value?.validate()
}

const restoreValidation = () => {
  formRef.value?.restoreValidation()
}

defineExpose({
  validate,
  restoreValidation,
  formRef
})
</script>

<style scoped>
@import '@/styles/responsive.scss';

.responsive-form {
  width: 100%;
  background: var(--card-bg);
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  
  &.form-loading {
    pointer-events: none;
    opacity: 0.7;
  }
}

/* 表单头部 */
.form-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-secondary);
  
  @include mobile {
    flex-direction: column;
    gap: var(--spacing-md);
    padding: var(--spacing-md);
  }
}

.form-title-section {
  flex: 1;
}

.form-title {
  margin: 0 0 var(--spacing-xs) 0;
  font-size: var(--font-size-xl);
  font-weight: 600;
  color: var(--text-primary);
  
  @include mobile {
    font-size: var(--font-size-lg);
  }
}

.form-description {
  margin: 0;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  line-height: 1.5;
}

.form-header-actions {
  @include mobile {
    width: 100%;
  }
}

/* 表单内容 */
.form-content {
  padding: var(--spacing-lg);
  
  @include mobile {
    padding: var(--spacing-md);
  }
}

.form-grid {
  display: grid;
  gap: var(--spacing-lg);
  
  @include mobile {
    gap: var(--spacing-md);
  }
  
  @include mobile-small {
    gap: var(--spacing-sm);
  }
}

/* 网格列数类 */
@for $i from 1 through 6 {
  .grid-cols-#{$i} {
    grid-template-columns: repeat(#{$i}, 1fr);
  }
  
  .col-span-#{$i} {
    grid-column: span #{$i};
  }
}

.col-span-full {
  grid-column: 1 / -1;
}

/* 响应式网格 */
@include tablet {
  @for $i from 1 through 6 {
    .sm\:grid-cols-#{$i} {
      grid-template-columns: repeat(#{$i}, 1fr);
    }
    
    .sm\:col-span-#{$i} {
      grid-column: span #{$i};
    }
  }
}

@include desktop {
  @for $i from 1 through 6 {
    .md\:grid-cols-#{$i} {
      grid-template-columns: repeat(#{$i}, 1fr);
    }
    
    .lg\:grid-cols-#{$i} {
      grid-template-columns: repeat(#{$i}, 1fr);
    }
    
    .xl\:grid-cols-#{$i} {
      grid-template-columns: repeat(#{$i}, 1fr);
    }
    
    .md\:col-span-#{$i} {
      grid-column: span #{$i};
    }
    
    .lg\:col-span-#{$i} {
      grid-column: span #{$i};
    }
    
    .xl\:col-span-#{$i} {
      grid-column: span #{$i};
    }
  }
}

/* 分组标题 */
.form-group-title {
  margin: var(--spacing-lg) 0 var(--spacing-md) 0;
  
  &:first-child {
    margin-top: 0;
  }
  
  @include mobile {
    margin: var(--spacing-md) 0 var(--spacing-sm) 0;
  }
}

.group-title {
  font-size: var(--font-size-md);
  font-weight: 500;
  color: var(--text-primary);
}

/* 表单项 */
.form-item-suffix {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}

.form-item-help {
  color: var(--text-tertiary);
  font-size: var(--font-size-xs);
  line-height: 1.4;
}

/* 表单底部 */
.form-footer {
  padding: var(--spacing-lg);
  border-top: 1px solid var(--border-color);
  background: var(--bg-secondary);
  
  @include mobile {
    padding: var(--spacing-md);
  }
}

/* 表单布局 */
.form-horizontal {
  .form-content {
    :deep(.n-form-item-label) {
      text-align: right;
    }
  }
}

.form-inline {
  .form-grid {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    
    @include mobile {
      flex-direction: column;
      align-items: stretch;
    }
  }
  
  .form-content {
    :deep(.n-form-item) {
      margin-right: var(--spacing-md);
      margin-bottom: var(--spacing-sm);
      
      @include mobile {
        margin-right: 0;
        margin-bottom: var(--spacing-md);
      }
    }
  }
}

/* 表单尺寸 */
.form-small {
  .form-title {
    font-size: var(--font-size-lg);
  }
  
  .form-content {
    padding: var(--spacing-md);
  }
  
  .form-footer {
    padding: var(--spacing-md);
  }
}

.form-large {
  .form-title {
    font-size: var(--font-size-2xl);
  }
  
  .form-content {
    padding: var(--spacing-xl);
  }
  
  .form-footer {
    padding: var(--spacing-xl);
  }
}

/* 主题适配 */
.theme-dark {
  .responsive-form {
    background: var(--card-bg-dark);
  }
  
  .form-header,
  .form-footer {
    background: var(--bg-secondary-dark);
    border-color: var(--border-color-dark);
  }
}

.theme-factory {
  .responsive-form {
    background: var(--factory-card-bg);
    border: 1px solid var(--factory-border);
  }
  
  .form-header,
  .form-footer {
    background: var(--factory-bg-secondary);
    border-color: var(--factory-border);
  }
  
  .form-title {
    color: var(--factory-text-primary);
    text-shadow: 0 0 10px var(--factory-glow);
  }
}
</style>