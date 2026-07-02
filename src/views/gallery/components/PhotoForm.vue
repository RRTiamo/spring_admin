<template>
  <div class="editor-view-anim archive-card p-5 sm:p-7 flex flex-col gap-5 text-left">
    <div class="flex items-center justify-between border-b border-(--archive-border)/50 pb-4 mb-1">
      <div class="flex items-center gap-3">
        <n-button secondary size="small" @click="emit('close')">
          <template #icon>
            <span class="i-mdi-arrow-left"></span>
          </template>
          返回列表
        </n-button>
        <h2 class="m-0 text-xl font-760 text-(--archive-text)">
          {{ isEdit ? '编辑影像' : '添加影像' }}
        </h2>
      </div>
    </div>

    <n-form ref="formRef" :model="formModel" :rules="formRules" label-placement="top">
      <div class="grid gap-4 grid-cols-1 sm:grid-cols-4">
        <n-form-item label="影像标题" path="title">
          <n-input v-model:value="formModel.title" placeholder="请输入影像标题" />
        </n-form-item>
        <n-form-item label="唯一 Slug (若为空则自动生成)" path="slug">
          <n-input v-model:value="formModel.slug" placeholder="如: sidewalk-night" />
        </n-form-item>
        <n-form-item label="媒体类型" path="type">
          <n-select v-model:value="formModel.type" :options="typeOptions" />
        </n-form-item>
        <n-form-item label="足迹类别" path="footprintType">
          <n-select v-model:value="formModel.footprintType" :options="footprintTypeOptions" />
        </n-form-item>
      </div>

      <div class="grid gap-4 grid-cols-1 sm:grid-cols-4">
        <n-form-item label="拍摄日期" path="dateTimestamp">
          <n-date-picker 
            v-model:value="formModel.dateTimestamp" 
            type="datetime" 
            placeholder="选择拍摄时间" 
            class="w-full"
          />
        </n-form-item>
        <n-form-item label="照相机" path="camera">
          <n-input v-model:value="formModel.camera" placeholder="如：Contax T2" />
        </n-form-item>
        <n-form-item label="镜头" path="lens">
          <n-input v-model:value="formModel.lens" placeholder="如：Sonnar 38mm f/2.8" />
        </n-form-item>
        <n-form-item label="胶卷 / 介质" path="filmStock">
          <n-input v-model:value="formModel.filmStock" placeholder="如：Fujifilm Superia 400" />
        </n-form-item>
      </div>

      <div class="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <n-form-item label="曝光设置 (快门/光圈)" path="settings">
          <n-input v-model:value="formModel.settings" placeholder="如：f/2.8, 1/30s" />
        </n-form-item>
        <n-form-item label="拍摄地点" path="location">
          <div class="flex gap-2 w-full">
            <n-input v-model:value="formModel.location" placeholder="如：Kyoto Temple" class="flex-1" />
            <n-button secondary @click="emit('open-map')">
              <template #icon><span class="i-mdi-map-marker-radius-outline"></span></template>
              选点
            </n-button>
            <n-button secondary @click="emit('gps')">
              <template #icon><span class="i-mdi-crosshairs-gps"></span></template>
              GPS
            </n-button>
          </div>
        </n-form-item>
        <n-form-item label="经度 (Longitude)" path="longitude">
          <n-input-number v-model:value="formModel.longitude" placeholder="如: 121.4737" :show-button="false" class="w-full" clearable />
        </n-form-item>
        <n-form-item label="纬度 (Latitude)" path="latitude">
          <n-input-number v-model:value="formModel.latitude" placeholder="如: 31.2304" :show-button="false" class="w-full" clearable />
        </n-form-item>
        <n-form-item label="媒体资源 (路径 或 上传)" path="src" class="sm:col-span-2">
          <div class="flex flex-col gap-2 w-full">
            <div class="flex gap-2 w-full items-center">
              <n-input 
                v-model:value="formModel.src" 
                placeholder="可直接输入路径/URL，或点击右侧上传" 
                class="flex-1" 
              />
              
              <n-upload
                action="/api/blogs/upload?type=gallery"
                :headers="uploadHeaders"
                :show-file-list="false"
                @finish="handleUploadFinish"
                @error="handleUploadError"
                @before-upload="beforeUpload"
                accept="image/*,video/*"
                class="w-auto shrink-0"
              >
                <n-button type="primary" secondary>
                  <template #icon>
                    <span class="i-mdi-upload"></span>
                  </template>
                  上传媒体
                </n-button>
              </n-upload>
            </div>
            <p class="text-[10px] tone-muted m-0">支持直接上传图片或视频，上传后将自动识别类型并填充路径。</p>
          </div>
        </n-form-item>
      </div>

      <n-form-item label="影像故事 / 描述" path="description">
        <n-input
          v-model:value="formModel.description"
          type="textarea"
          :rows="4"
          placeholder="关于这张照片，有什么背后的回忆或创作灵感？"
        />
      </n-form-item>

      <div class="flex justify-end gap-3 border-t border-(--archive-border)/40 pt-4 mt-2">
        <n-button secondary @click="emit('close')">取消</n-button>
        <n-button type="primary" :loading="submitting" @click="handleSave">
          <template #icon>
            <span class="i-mdi-content-save-outline"></span>
          </template>
          保存影像
        </n-button>
      </div>
    </n-form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { NButton, NForm, NFormItem, NInput, NSelect, NDatePicker, NUpload, NInputNumber, useMessage } from 'naive-ui'

const props = defineProps<{
  isEdit: boolean
  submitting: boolean
  formModel: any
  typeOptions: any[]
  footprintTypeOptions: any[]
  formRules: any
  uploadHeaders: any
}>()

const emit = defineEmits<{
  (e: 'update:formModel', model: any): void
  (e: 'close'): void
  (e: 'save'): void
  (e: 'gps'): void
  (e: 'open-map'): void
}>()

const message = useMessage()
const formRef = ref<any>(null)

const handleSave = () => {
  formRef.value?.validate((errors: any) => {
    if (errors) return
    emit('save')
  })
}

// 媒体上传的回调
const beforeUpload = (data: { file: { file: File | null } }) => {
  const file = data.file.file
  if (file) {
    const isImageOrVideo = file.type.startsWith('image/') || file.type.startsWith('video/')
    if (!isImageOrVideo) {
      message.error('只能上传图片或视频文件！')
      return false
    }
    const isLt50M = file.size / 1024 / 1024 < 50
    if (!isLt50M) {
      message.error('文件大小不能超过 50MB！')
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
      const type = response.data.endsWith('.mp4') || response.data.endsWith('.mov') ? 'video' : 'image'
      const model = { ...props.formModel, src: response.data, type }
      emit('update:formModel', model)
      message.success('媒体上传并识别完成！')
    } else {
      message.error('媒体上传失败：' + (response.msg || '未知错误'))
    }
  } else {
    message.error('网络上传失败，请检查后端状态')
  }
}

const handleUploadError = () => {
  message.error('文件上传失败，请检查网络或后端服务。')
}
</script>
