<template>
  <n-modal
    v-model:show="visible"
    preset="card"
    :title="isMetaEdit ? '编辑参数配置' : '添加参数配置'"
    class="w-[90vw] max-w-[480px]"
  >
    <n-form
      ref="formRef"
      :model="metaFormModel"
      :rules="metaRules"
      label-placement="top"
      class="text-left"
    >
      <n-form-item label="配置类型" path="type">
        <n-input :value="metaFormModel.type === 'category' ? '成就类别 (Category)' : '重要级别 (Level)'" disabled />
      </n-form-item>

      <n-form-item label="配置展示名称" path="name">
        <n-input v-model:value="metaFormModel.name" placeholder="如：重大里程碑、史诗 (Gold)" />
      </n-form-item>

      <n-form-item label="标识代码 (Code)" path="code">
        <n-input v-model:value="metaFormModel.code" :disabled="isMetaEdit" placeholder="英文标识，如 milestone、gold" />
      </n-form-item>

      <n-form-item label="系统对应图标" path="icon">
        <n-select v-model:value="metaFormModel.icon" :options="metaIconOptions" :render-label="renderLabel" />
      </n-form-item>

      <div class="flex justify-end gap-3 pt-4 border-t border-(--archive-border)/50 mt-4">
        <n-button secondary @click="visible = false">取消</n-button>
        <n-button type="primary" :loading="metaSubmitting" @click="handleSave">
          <template #icon>
            <span class="i-mdi-content-save-outline"></span>
          </template>
          确认保存
        </n-button>
      </div>
    </n-form>
  </n-modal>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue'
import {
  NInput,
  NSelect,
  NModal,
  NForm,
  NFormItem,
  NButton
} from 'naive-ui'

const props = defineProps<{
  showMetaModal: boolean
  isMetaEdit: boolean
  metaSubmitting: boolean
  metaFormModel: any
  metaIconOptions: any[]
  metaRules: any
}>()

const emit = defineEmits<{
  (e: 'update:showMetaModal', visible: boolean): void
  (e: 'update:metaFormModel', model: any): void
  (e: 'save'): void
}>()

const formRef = ref<any>(null)

const visible = computed({
  get: () => props.showMetaModal,
  set: (val) => emit('update:showMetaModal', val)
})

const renderLabel = (option: any) => {
  return h(
    'div',
    { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
    [
      h('span', { class: option.icon, style: { fontSize: '15px' } }),
      h('span', option.label)
    ]
  )
}

const handleSave = () => {
  formRef.value?.validate((errors: any) => {
    if (errors) return
    emit('save')
  })
}
</script>
