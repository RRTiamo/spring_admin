<template>
  <div class="flex flex-col gap-4">
    <section class="archive-card p-4 sm:p-5">
      <div class="flex items-center justify-between">
        <h3 class="m-0 text-lg font-760 text-(--archive-text) flex items-center gap-1.5">
          <span class="i-mdi-email-open-outline text-xl tone-accent"></span>
          岁月时间信札管理
        </h3>
        <n-button type="primary" @click="openCreateLetter">
          <template #icon><span class="i-mdi-plus"></span></template>
          寄信给未来
        </n-button>
      </div>
    </section>

    <!-- 岁月信件列表 -->
    <section class="archive-card p-4 sm:p-5">
      <n-table :bordered="false" :single-line="false" class="w-full">
        <thead>
          <tr>
            <th width="25%">信件主题</th>
            <th width="20%">开启日期 (targetDate)</th>
            <th width="15%">解密秘钥 (bypassCode)</th>
            <th width="30%">胶囊预告提示</th>
            <th width="10%">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in letters" :key="item.id">
            <td class="font-700 text-(--archive-text)">
              <span class="flex items-center gap-1">
                <span v-if="isLetterLocked(item.targetDate)" class="i-mdi-lock-outline text-amber-500"></span>
                <span v-else class="i-mdi-lock-open-variant-outline text-green-500"></span>
                {{ item.title }}
              </span>
            </td>
            <td>
              <span :class="{ 'text-amber-500 font-600': isLetterLocked(item.targetDate) }">
                {{ formatDateTime(item.targetDate) }}
              </span>
            </td>
            <td>
              <code v-if="item.bypassCode" class="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 text-xs">
                {{ item.bypassCode }}
              </code>
              <span v-else class="tone-muted">-</span>
            </td>
            <td class="tone-muted text-xs max-w-[200px] truncate" :title="item.prompt">
              {{ item.prompt || '暂无预告提示' }}
            </td>
            <td>
              <n-space>
                <n-button size="tiny" secondary @click="openEditLetter(item)">编辑</n-button>
                <n-button size="tiny" secondary type="error" @click="handleDeleteLetter(item.id)">删除</n-button>
              </n-space>
            </td>
          </tr>
          <tr v-if="letters.length === 0">
            <td colspan="5" class="text-center tone-muted py-6">岁月信箱空空如也，写一封信存放在这里吧。</td>
          </tr>
        </tbody>
      </n-table>
    </section>

    <!-- 岁月信件编辑模态框 -->
    <n-modal
      v-model:show="showLetterModal"
      preset="card"
      :title="isEditLetter ? '编辑未来信札' : '寄信给未来'"
      class="w-[90vw] max-w-[500px]"
    >
      <n-form ref="letterFormRef" :model="letterForm" label-placement="top">
        <n-form-item label="信件主题" path="title" required>
          <n-input v-model:value="letterForm.title" placeholder="如：写给一年后的时光胶囊" />
        </n-form-item>
        <div class="grid grid-cols-2 gap-4">
          <n-form-item label="开启日期 (锁定至此日)" path="targetDate" required>
            <n-date-picker v-model:value="targetDateTimeStamp" type="datetime" placeholder="请选择开启日期和时间" class="w-full" />
          </n-form-item>
          <n-form-item label="解密秘钥 (用于提前开启)" path="bypassCode">
            <n-input v-model:value="letterForm.bypassCode" :allow-input="onlyAllowNumber" placeholder="时空密钥/非必填" />
          </n-form-item>
        </div>
        <n-form-item label="胶囊预告提示" path="prompt">
          <n-input v-model:value="letterForm.prompt" type="textarea" :rows="2" placeholder="用于在倒计时未结束前展示给访客的提示说明..." />
        </n-form-item>
        <!-- 关联时光照片 -->
        <n-form-item label="关联时光照片">
          <div class="flex flex-col gap-3 w-full">
            <div class="grid grid-cols-3 gap-2">
              <div v-for="(img, idx) in letterImagesList" :key="idx" class="relative group aspect-[4/3] rounded-lg overflow-hidden border border-(--archive-border)/40 bg-black/5 flex items-center justify-center">
                <img :src="img" class="w-full h-full object-cover" />
                <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <n-button type="error" size="tiny" circle @click="removeImage(idx)">
                    <template #icon>
                      <span class="i-mdi-delete-outline"></span>
                    </template>
                  </n-button>
                </div>
              </div>
              
              <n-upload
                v-if="letterImagesList.length < 2"
                action="/api/blogs/upload?type=letter"
                :headers="uploadHeaders"
                :show-file-list="false"
                @finish="handleUploadFinish"
                @error="handleUploadError"
                accept="image/*"
                class="aspect-[4/3] border border-dashed border-(--archive-border) rounded-lg flex flex-center items-center justify-center cursor-pointer hover:border-(--archive-accent)"
              >
                <div class="flex flex-col items-center justify-center text-xs tone-muted gap-1">
                  <span class="i-mdi-image-plus text-lg"></span>
                  <span>上传照片</span>
                </div>
              </n-upload>

              <!-- 选择照片墙图片 -->
              <div
                v-if="letterImagesList.length < 2"
                @click="openGallerySelector"
                class="aspect-[4/3] border border-dashed border-(--archive-border) rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-(--archive-accent)"
              >
                <div class="flex flex-col items-center justify-center text-xs tone-muted gap-1">
                  <span class="i-mdi-image-multiple-outline text-lg"></span>
                  <span>选择照片墙</span>
                </div>
              </div>
            </div>
            <p class="text-[10px] tone-muted m-0">支持上传或从照片墙选择最多 2 张时光回忆照片，这些照片将在前台以拍立得效果呈现在信纸侧边。</p>
          </div>
        </n-form-item>
        <n-form-item label="信件密封正文内容" path="content" required>
          <n-input v-model:value="letterForm.content" type="textarea" :rows="6" placeholder="写下你想对未来自己说的话，未到期前页面上将物理无法查看..." />
        </n-form-item>
        <div class="flex justify-end gap-3 mt-4 pt-3 border-t border-(--archive-border)/40">
          <n-button size="small" @click="showLetterModal = false">取消</n-button>
          <n-button size="small" type="primary" @click="handleSaveLetter">封装并封存</n-button>
        </div>
      </n-form>
    </n-modal>

    <!-- 图册选择弹窗 -->
    <GallerySelectModal
      v-model:showGallerySelectModal="showGallerySelectModal"
      :gallery-list="galleryList"
      :gallery-loading="galleryLoading"
      @select="handleSelectGalleryPhoto"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useMessage, useDialog, NButton, NTable, NSpace, NModal, NForm, NFormItem, NInput, NUpload, NDatePicker } from 'naive-ui'
import { getTimeLetterList, createTimeLetter, updateTimeLetter, deleteTimeLetter } from '@/api/letter'
import GallerySelectModal from '../articles/components/GallerySelectModal.vue'
import { getFileList } from '@/api/files'

interface TimeLetter {
  id: number
  title: string
  targetDate: string
  bypassCode: string
  prompt: string
  content: string
  images?: string
}

const message = useMessage()
const dialog = useDialog()
const letters = ref<TimeLetter[]>([])
const showLetterModal = ref(false)
const isEditLetter = ref(false)

const letterForm = ref({
  id: 0,
  title: '',
  targetDate: '',
  bypassCode: '',
  prompt: '',
  content: '',
  images: ''
})

const fetchLetters = async () => {
  try {
    const response = await getTimeLetterList()
    if (response.data?.code !== 200) return
    letters.value = response.data.data
  } catch (err) {
    console.error('Failed to load letters', err)
  }
}

const isLetterLocked = (targetDateStr: string) => {
  if (!targetDateStr) return false
  try {
    const dateOnly = targetDateStr.split(' ')[0].split('T')[0]
    const openDate = new Date(dateOnly)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return today < openDate
  } catch (e) {
    return false
  }
}

const formatDateTime = (dateStr: string) => {
  if (!dateStr) return '-'
  return dateStr.replace('T', ' ')
}

const targetDateTimeStamp = ref<number | null>(null)

watch(targetDateTimeStamp, (newVal) => {
  if (newVal) {
    const date = new Date(newVal)
    const Y = date.getFullYear()
    const M = String(date.getMonth() + 1).padStart(2, '0')
    const D = String(date.getDate()).padStart(2, '0')
    const h = String(date.getHours()).padStart(2, '0')
    const m = String(date.getMinutes()).padStart(2, '0')
    const s = String(date.getSeconds()).padStart(2, '0')
    letterForm.value.targetDate = `${Y}-${M}-${D}T${h}:${m}:${s}`
  } else {
    letterForm.value.targetDate = ''
  }
})

const openCreateLetter = () => {
  isEditLetter.value = false
  const defaultDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
  targetDateTimeStamp.value = defaultDate.getTime()
  letterForm.value = {
    id: 0,
    title: '',
    targetDate: defaultDate.toISOString().split('.')[0].substring(0, 16), // 默认一年后
    bypassCode: '',
    prompt: '',
    content: '',
    images: ''
  }
  showLetterModal.value = true
}

const openEditLetter = (item: TimeLetter) => {
  isEditLetter.value = true
  letterForm.value = {
    ...item,
    images: item.images || ''
  }
  if (item.targetDate) {
    const formatted = item.targetDate.replace(' ', 'T')
    const d = new Date(formatted)
    targetDateTimeStamp.value = isNaN(d.getTime()) ? Date.now() : d.getTime()
  } else {
    targetDateTimeStamp.value = null
  }
  showLetterModal.value = true
}

const handleSaveLetter = async () => {
  if (!letterForm.value.title.trim() || !letterForm.value.targetDate.trim() || !letterForm.value.content.trim()) {
    message.warning('请补充完整标题、开启日期及信件内容')
    return
  }
  try {
    const response = isEditLetter.value
      ? await updateTimeLetter(letterForm.value)
      : await createTimeLetter(letterForm.value)
    
    if (response.data?.code !== 200) {
      message.error(response.data?.msg || '操作失败')
      return
    }
    message.success('岁月信件已成功存入数字胶囊')
    showLetterModal.value = false
    fetchLetters()
  } catch (err) {
    message.error('操作失败')
  }
}

// 辅助方法和图片上传
const onlyAllowNumber = (value: string) => !value || /^\d+$/.test(value)

const uploadHeaders = computed(() => ({
  satoken: localStorage.getItem('satoken') || ''
}))

const letterImagesList = computed(() => {
  return letterForm.value.images ? letterForm.value.images.split(',').map(s => s.trim()).filter(Boolean) : []
})

const removeImage = (idx: number) => {
  const list = [...letterImagesList.value]
  list.splice(idx, 1)
  letterForm.value.images = list.join(',')
}

// 照片墙图册选择
const galleryList = ref<any[]>([])
const galleryLoading = ref(false)
const showGallerySelectModal = ref(false)

const openGallerySelector = async () => {
  galleryLoading.value = true
  showGallerySelectModal.value = true
  try {
    const response = await getFileList()
    if (response.data?.code === 200) {
      const allFiles = response.data.data || []
      const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico']
      galleryList.value = allFiles
        .filter((file: any) => {
          const name = file.fileName || ''
          const ext = name.substring(name.lastIndexOf('.') + 1).toLowerCase()
          return imageExtensions.includes(ext)
        })
        .map((file: any) => ({
          id: file.fileName,
          src: file.url
        }))
    }
  } catch (err) {
    console.error('Failed to load files for letter photos selection', err)
  } finally {
    galleryLoading.value = false
  }
}

const handleSelectGalleryPhoto = (src: string) => {
  const list = [...letterImagesList.value]
  if (list.length < 2) {
    list.push(src)
    letterForm.value.images = list.join(',')
    message.success('已关联照片墙照片 🖼️')
  } else {
    message.warning('最多只能关联 2 张时光照片')
  }
}

const handleUploadFinish = ({ event }: { event?: ProgressEvent }) => {
  const target = event?.target as XMLHttpRequest
  if (target && target.status === 200) {
    const response = JSON.parse(target.response)
    if (response.code === 200) {
      const list = [...letterImagesList.value]
      list.push(response.data)
      letterForm.value.images = list.join(',')
      message.success('照片上传成功！')
    } else {
      message.error('照片上传失败：' + (response.msg || '未知错误'))
    }
  } else {
    message.error('网络上传失败，请检查后端状态')
  }
}

const handleUploadError = () => {
  message.error('照片上传失败，请检查网络或后端服务。')
}

const handleDeleteLetter = (id: number) => {
  dialog.warning({
    title: '确认删除',
    content: '确认删除此时光信件吗？一旦损毁将不可恢复！',
    positiveText: '确认销毁',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        const response = await deleteTimeLetter(id)
        if (response.data?.code !== 200) return
        message.success('信札已销毁')
        fetchLetters()
      } catch (err) {
        message.error('删除失败')
      }
    }
  })
}

onMounted(() => {
  fetchLetters()
})
</script>
