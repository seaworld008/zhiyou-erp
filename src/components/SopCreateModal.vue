<template>
  <n-card title="新建SOP" :bordered="false" size="huge">
    <template #header-extra>
      <n-button quaternary circle @click="$emit('close')">
        <template #icon>
          <n-icon><CloseOutline /></n-icon>
        </template>
      </n-button>
    </template>

    <div class="create-form">
      <n-form ref="formRef" :model="formData" label-placement="top">
        <n-grid :cols="2" :x-gap="16">
          <n-grid-item>
            <n-form-item label="产品代码" path="product_code">
              <n-input v-model:value="formData.product_code" placeholder="如: TIP-IH-3L" />
            </n-form-item>
          </n-grid-item>
          <n-grid-item>
            <n-form-item label="工序代码" path="process_code">
              <n-input v-model:value="formData.process_code" placeholder="如: ASM-001" />
            </n-form-item>
          </n-grid-item>
          <n-grid-item>
            <n-form-item label="版本" path="version">
              <n-input v-model:value="formData.version" placeholder="如: v1.0" />
            </n-form-item>
          </n-grid-item>
          <n-grid-item>
            <n-form-item label="标准工时(秒)" path="std_time_sec">
              <n-input-number 
                v-model:value="formData.std_time_sec" 
                placeholder="标准工时（秒）"
                :min="1"
                style="width: 100%"
              />
            </n-form-item>
          </n-grid-item>
        </n-grid>

        <n-form-item label="作业标题" path="title">
          <n-input v-model:value="formData.title" placeholder="输入SOP标题" />
        </n-form-item>

        <n-form-item label="更新人" path="updated_by">
          <n-input v-model:value="formData.updated_by" placeholder="更新人" />
        </n-form-item>

        <n-form-item label="状态" path="enabled">
          <n-switch v-model:value="formData.enabled">
            <template #checked>启用</template>
            <template #unchecked>禁用</template>
          </n-switch>
        </n-form-item>
      </n-form>

      <div class="form-actions">
        <n-space>
          <n-button @click="$emit('close')">取消</n-button>
          <n-button type="primary" @click="handleCreate">创建</n-button>
        </n-space>
      </div>
    </div>
  </n-card>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { CloseOutline } from '@vicons/ionicons5'
import type { Sop } from '@/types'

const emit = defineEmits<{
  close: []
  create: [sop: Omit<Sop, 'id'>]
}>()

const formRef = ref()
const formData = reactive<Omit<Sop, 'id'>>({
  product_code: '',
  process_code: '',
  version: 'v1.0',
  title: '',
  steps: [
    {
      seq: 1,
      text: '第一步：准备工作',
      timer_sec: 60
    }
  ],
  std_time_sec: 60,
  tools: [],
  qc_points: [],
  safety_points: [],
  attachments: [],
  updated_at: new Date().toISOString(),
  updated_by: '',
  enabled: true
})

const handleCreate = () => {
  // 验证必填字段
  if (!formData.product_code || !formData.process_code || !formData.title) {
    return
  }

  // 更新时间
  formData.updated_at = new Date().toISOString()
  
  // 发送创建事件
  emit('create', { ...formData })
}
</script>

<style scoped>
.create-form {
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