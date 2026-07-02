<template>
  <n-modal
    v-model:show="visible"
    preset="card"
    :title="isEdit ? '编辑成就档案' : '录入新成就勋章'"
    class="w-[90vw] max-w-[620px]"
  >
    <n-form
      ref="formRef"
      :model="formModel"
      :rules="rules"
      label-placement="top"
      class="text-left"
    >
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <n-form-item label="成就标题" path="title" class="sm:col-span-2">
          <n-input v-model:value="formModel.title" placeholder="如：顺利发表第一篇 SCI 论文" />
        </n-form-item>

        <n-form-item label="成就类别" path="category">
          <n-select v-model:value="formModel.category" :options="categoryOptions" :render-label="renderLabel" />
        </n-form-item>

        <n-form-item label="重要评级" path="level">
          <n-select v-model:value="formModel.level" :options="levelOptions" :render-label="renderLabel" />
        </n-form-item>

        <n-form-item label="徽章图标 (前台别针图标)" path="icon">
          <n-select v-model:value="formModel.icon" :options="iconOptions" :render-label="renderLabel" />
        </n-form-item>

        <n-form-item label="达成日期" path="achieveDateVal">
          <n-date-picker
            v-model:value="formModel.achieveDateVal"
            type="datetime"
            placeholder="选择达成时间"
            class="w-full"
          />
        </n-form-item>

        <n-form-item label="成就配图/证书 (可上传或填路径)" path="cover" class="sm:col-span-2">
          <div class="flex flex-col gap-2 w-full">
            <div class="flex gap-2 w-full items-center">
              <n-input
                v-model:value="formModel.cover"
                placeholder="可输入外部图片 URL，或点击上传"
                class="flex-1"
              />
              <n-upload
                action="/api/blogs/upload?type=achieve"
                :headers="uploadHeaders"
                :show-file-list="false"
                @finish="handleUploadFinish"
                @error="handleUploadError"
                @before-upload="beforeUpload"
                accept="image/*"
                class="w-auto shrink-0"
              >
                <n-button type="primary" secondary>
                  <template #icon>
                    <span class="i-mdi-upload"></span>
                  </template>
                  上传图片
                </n-button>
              </n-upload>
            </div>
            <p class="text-[10px] tone-muted m-0">支持 JPG/PNG/WEBP 等常见图片，重大里程碑建议上传证书大图。</p>
          </div>
        </n-form-item>
      </div>

      <n-form-item label="成就故事 (背后经历)" path="description">
        <n-input
          v-model:value="formModel.description"
          type="textarea"
          :rows="5"
          placeholder="写下这个成就背后的故事：付出的汗水、咬牙坚持的瞬间、或收获的善意和感激..."
        />
      </n-form-item>

      <div class="flex justify-end gap-3 pt-4 border-t border-(--archive-border)/50 mt-4">
        <n-button secondary @click="visible = false">取消</n-button>
        <n-button type="primary" :loading="submitting" @click="handleSave">
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
  NDatePicker,
  NUpload,
  NModal,
  NForm,
  NFormItem,
  NButton,
  useMessage
} from 'naive-ui'

const props = defineProps<{
  showModal: boolean
  isEdit: boolean
  submitting: boolean
  formModel: any
  categoryOptions: any[]
  levelOptions: any[]
  iconOptions: any[]
  rules: any
  uploadHeaders: any
}>()

const emit = defineEmits<{
  (e: 'update:showModal', visible: boolean): void
  (e: 'update:formModel', model: any): void
  (e: 'save'): void
}>()

const message = useMessage()
const formRef = ref<any>(null)

const visible = computed({
  get: () => props.showModal,
  set: (val) => emit('update:showModal', val)
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

// 图片上传相关的回调
const beforeUpload = (data: { file: { file: File | null } }) => {
  const file = data.file.file
  if (file) {
    const isLt5M = file.size / 1024 / 1024 < 5
    if (!isLt5M) {
      message.error('配图大小不能超过 5MB！')
      return false
    }
  }
  return true
}

const handleUploadFinish = ({ event }: { event?: ProgressEvent }) => {
  const target = event?.target as XMLHttpRequest
  if (target && target.status === 200) {
    const response = JSON.parse(target.response)
    if (response.code === 200) {
      const model = { ...props.formModel, cover: response.data }
      emit('update:formModel', model)
      message.success('配图上传成功！')
    } else {
      message.error('配图上传失败：' + (response.msg || '未知错误'))
    }
  } else {
    message.error('网络上传失败，请检查后端状态')
  }
}

const handleUploadError = () => {
  message.error('配图上传出错，已自动切换为手动文本输入链接。')
}
</script>
