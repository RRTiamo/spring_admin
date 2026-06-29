<template>
  <div class="editor-view-anim archive-card p-5 sm:p-7 flex flex-col gap-5 text-left">
    <!-- 写作面板头部操作栏 -->
    <div class="flex items-center justify-between border-b border-(--archive-border)/50 pb-4 mb-1">
      <div class="flex items-center gap-3">
        <n-button secondary size="small" @click="emit('close')">
          <template #icon>
            <span class="i-mdi-arrow-left"></span>
          </template>
          返回列表
        </n-button>
        <h2 class="m-0 text-xl font-760 text-(--archive-text)">
          {{ isEdit ? '编辑文章' : '新建文章' }}
        </h2>
      </div>

      <div class="flex items-center gap-2">
        <n-button size="small" secondary type="warning" @click="triggerFileInput">
          <template #icon>
            <span class="i-mdi-file-import-outline"></span>
          </template>
          导入 Markdown (.md)
        </n-button>
        <input 
          type="file" 
          ref="fileInputRef" 
          accept=".md" 
          style="display: none" 
          @change="handleImportMarkdown" 
        />
      </div>
    </div>

    <!-- 导言提醒 -->
    <p class="m-0 text-xs tone-muted">
      在这里可以享受宽广的随笔写作空间。支持直接使用 Markdown 格式输入正文，或者通过右上角按钮直接导入本地 Markdown 随笔文件。
    </p>

    <n-form ref="formRef" :model="formModel" :rules="formRules" label-placement="top">
      <div class="grid gap-4 grid-cols-1 sm:grid-cols-2">
        <n-form-item label="文章标题" path="title">
          <n-input v-model:value="formModel.title" placeholder="请输入文章标题" />
        </n-form-item>
        <n-form-item label="自定义路由 Slug (若为空则自动生成)" path="slug">
          <n-input v-model:value="formModel.slug" placeholder="例如: tokyo-rainy-night" />
        </n-form-item>
      </div>

      <div class="grid gap-4 grid-cols-1 sm:grid-cols-4">
        <n-form-item label="文章分类" path="categoryId">
          <n-cascader v-model:value="formModel.categoryId" :options="categoryTreeOptions" check-strategy="all" placeholder="选择分类" clearable />
        </n-form-item>
        <n-form-item label="写作心情" path="mood">
          <n-select v-model:value="formModel.mood" :options="moodOptions" />
        </n-form-item>
        <n-form-item label="可见性" path="visibility">
          <n-select v-model:value="formModel.visibility" :options="visibilityOptions" />
        </n-form-item>
        <n-form-item label="文章标签" path="tags">
          <n-dynamic-tags v-model:value="formModel.tags" />
        </n-form-item>
      </div>

      <n-form-item label="封面图片" path="cover">
        <div class="flex flex-col sm:flex-row items-start gap-4 w-full">
          <!-- 封面图实时预览 -->
          <div class="relative w-32 h-20 rounded-2xl overflow-hidden border border-(--archive-border)/40 bg-black/5 shrink-0 flex items-center justify-center">
            <img 
              v-if="formModel.cover" 
              :src="formModel.cover" 
              alt="封面预览" 
              class="w-full h-full object-cover" 
            />
            <span v-else class="text-[10px] tone-muted">无封面图</span>
          </div>

          <div class="flex-1 space-y-2.5 w-full">
            <!-- 上传与输入组合 -->
            <div class="flex items-center gap-2 w-full">
              <n-input v-model:value="formModel.cover" placeholder="输入路径（如 /assets/writing-tokyo.png）或上传图片" class="flex-1" />
              
              <n-button type="info" secondary round @click="emit('open-gallery')" class="shrink-0">
                <template #icon>
                  <span class="i-mdi-image-multiple-outline"></span>
                </template>
                图册选择
              </n-button>

              <n-upload
                action="http://localhost:8080/api/blogs/upload?type=blog"
                :headers="uploadHeaders"
                :show-file-list="false"
                @finish="handleUploadFinish"
                @error="handleUploadError"
                @before-upload="beforeUpload"
                accept="image/*"
                class="w-auto shrink-0"
              >
                <n-button type="primary" secondary round>
                  <template #icon>
                    <span class="i-mdi-upload"></span>
                  </template>
                  上传封面
                </n-button>
              </n-upload>
            </div>
            <p class="text-[10px] tone-muted m-0">支持直接输入相对路径、外部网络 URL，或点击按钮上传本地图片作为文章封面。</p>
          </div>
        </div>
      </n-form-item>

      <n-form-item label="文章简介 / 导言" path="summary">
        <div class="flex flex-col gap-2 w-full">
          <div class="flex gap-2 w-full items-start">
            <n-input
              v-model:value="formModel.summary"
              type="textarea"
              :autosize="{ minRows: 2, maxRows: 3 }"
              placeholder="请输入简短的随笔摘要，作为导言引用，或点击右侧 AI 生成"
              class="flex-1"
            />
            <n-button 
              type="primary" 
              secondary 
              :loading="generatingSummary"
              @click="emit('ai-summary')"
              class="shrink-0"
            >
              <template #icon>
                <span class="i-mdi-creation"></span>
              </template>
              AI 生成
            </n-button>
          </div>
          <p class="text-[10px] tone-muted m-0">支持提取随笔正文中的核心观点，由 DeepSeek 智能缩写为温暖、文艺风格的导言。</p>
        </div>
      </n-form-item>

      <n-form-item label="随笔正文 (支持 Markdown)" path="content">
        <n-input
          v-model:value="formModel.content"
          type="textarea"
          :autosize="{ minRows: 16, maxRows: 32 }"
          placeholder="在此倾注您的文字思考与情感体验，直接以 Markdown 编写。全屏大文本输入框让创作体验更稳定..."
          class="font-mono text-sm leading-relaxed"
        />
      </n-form-item>
    </n-form>

    <!-- 操作底部栏 -->
    <div class="flex justify-end gap-3 border-t border-(--archive-border)/50 pt-4 mt-2">
      <n-button @click="emit('close')">取消</n-button>
      <n-button type="primary" :loading="submitting" @click="handleSave">保存文章</n-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { NButton, NForm, NFormItem, NInput, NSelect, NCascader, NDynamicTags, NUpload, useMessage } from 'naive-ui'

const props = defineProps<{
  isEdit: boolean
  submitting: boolean
  generatingSummary: boolean
  formModel: any
  categoryTreeOptions: any[]
  moodOptions: any[]
  visibilityOptions: any[]
  formRules: any
  uploadHeaders: any
}>()

const emit = defineEmits<{
  (e: 'update:formModel', model: any): void
  (e: 'close'): void
  (e: 'save'): void
  (e: 'open-gallery'): void
  (e: 'import-md', content: string): void
  (e: 'ai-summary'): void
}>()

const message = useMessage()
const formRef = ref<any>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)

const triggerFileInput = () => {
  fileInputRef.value?.click()
}

const handleImportMarkdown = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files || input.files.length === 0) return
  const file = input.files[0]
  const reader = new FileReader()
  reader.onload = (e) => {
    const text = e.target?.result as string
    emit('import-md', text)
    message.success(`本地 Markdown 文件「${file.name}」导入成功！`)
  }
  reader.readAsText(file)
}

const handleSave = () => {
  formRef.value?.validate((errors: any) => {
    if (errors) return
    emit('save')
  })
}

// 封面图片上传的回调
const beforeUpload = (data: { file: { file: File | null } }) => {
  const file = data.file.file
  if (file) {
    const isLt10M = file.size / 1024 / 1024 < 10
    if (!isLt10M) {
      message.error('封面大小不能超过 10MB！')
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
      message.success('封面图片上传成功！')
    } else {
      message.error('封面上传失败：' + (response.msg || '未知错误'))
    }
  } else {
    message.error('网络上传失败，请检查后端状态')
  }
}

const handleUploadError = () => {
  message.error('文件上传失败，请检查网络或后端服务。')
}
</script>
