<template>
  <n-card title="编辑SOP" :bordered="false" size="huge">
    <template #header-extra>
      <n-button quaternary circle @click="$emit('close')">
        <template #icon>
          <n-icon><CloseOutline /></n-icon>
        </template>
      </n-button>
    </template>

    <div class="edit-form">
      <n-form ref="formRef" :model="formData" label-placement="top">
        <n-grid :cols="2" :x-gap="16">
          <n-grid-item>
            <n-form-item label="SOP编号" path="id">
              <n-input v-model:value="formData.id" disabled />
            </n-form-item>
          </n-grid-item>
          <n-grid-item>
            <n-form-item label="版本" path="version">
              <n-input v-model:value="formData.version" placeholder="如: v2.3" />
            </n-form-item>
          </n-grid-item>
          <n-grid-item>
            <n-form-item label="产品代码" path="product_code">
              <n-input v-model:value="formData.product_code" placeholder="产品代码" />
            </n-form-item>
          </n-grid-item>
          <n-grid-item>
            <n-form-item label="工序代码" path="process_code">
              <n-input v-model:value="formData.process_code" placeholder="工序代码" />
            </n-form-item>
          </n-grid-item>
        </n-grid>

        <n-form-item label="作业标题" path="title">
          <n-input v-model:value="formData.title" placeholder="输入SOP标题" />
        </n-form-item>

        <n-form-item label="标准工时(秒)" path="std_time_sec">
          <n-input-number 
            v-model:value="formData.std_time_sec" 
            placeholder="标准工时（秒）"
            :min="1"
            style="width: 200px"
          />
        </n-form-item>

        <n-form-item label="状态" path="enabled">
          <n-switch v-model:value="formData.enabled">
            <template #checked>启用</template>
            <template #unchecked>禁用</template>
          </n-switch>
        </n-form-item>

        <n-form-item label="更新人" path="updated_by">
          <n-input v-model:value="formData.updated_by" placeholder="更新人" />
        </n-form-item>
      </n-form>

      <div class="form-actions">
        <n-space>
          <n-button @click="$emit('close')">取消</n-button>
          <n-button type="primary" @click="handleSave">保存</n-button>
        </n-space>
      </div>
    </div>
  </n-card>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { CloseOutline } from '@vicons/ionicons5'
import type { Sop } from '@/types'

interface Props {
  sop?: Sop
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  save: [sop: Sop]
}>()

const formRef = ref()
const createEmptySop = (): Sop => ({
  id: '',
  product_code: '',
  process_code: '',
  version: '1.0',
  title: '',
  steps: [],
  std_time_sec: 0,
  tools: [],
  qc_points: [],
  safety_points: [],
  attachments: [],
  updated_at: '',
  updated_by: '',
  enabled: true
})
const formData = reactive<Sop>({ ...(props.sop || createEmptySop()) })

// 监听props变化
watch(() => props.sop, (newSop) => {
  if (newSop) {
    Object.assign(formData, newSop)
  }
}, { deep: true })

const handleSave = () => {
  // 更新时间
  formData.updated_at = new Date().toISOString()
  
  // 发送保存事件
  emit('save', { ...formData })
}
</script>

<style scoped>
.edit-form {
  max-height: 70vh;
  overflow-y: auto;
}

.form-actions {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid var(--border-color);
  text-align: right;
}

[data-theme="factory"] .form-actions {
  border-top-color: rgba(0, 216, 255, 0.3);
}
</style> 