<template>
  <div class="flex flex-col gap-4">
    <section class="archive-card p-4 sm:p-5">
      <h3 class="m-0 text-lg font-760 text-(--archive-text) flex items-center gap-1.5">
        <span class="i-mdi-image-filter-hdr text-xl tone-accent"></span>
        恋爱开屏背景配置
      </h3>
      <p class="tone-muted text-xs mt-1">这里可以自定义博客前台“恋爱纪实”页面最顶部的开屏大图或氛围视频背景。</p>
    </section>

    <section class="archive-card p-5 sm:p-6">
      <n-form label-placement="top" class="w-full">
        <!-- 氛围切换列表配置 -->
        <div class="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <span class="text-xs tone-muted">您可以配置多个背景视频或图片氛围，前台可以通过切换按钮依次展示。</span>
          <n-space>
            <n-button size="small" type="warning" dashed @click="handleResetDefaultAtmospheres">
              重置为系统默认
            </n-button>
            <n-button size="small" type="primary" dashed @click="openAddAtmosphereModal">
              添加氛围背景
            </n-button>
          </n-space>
        </div>

        <n-table :bordered="false" :single-line="false" class="w-full mb-6">
          <thead>
            <tr>
              <th width="25%">氛围显示名称</th>
              <th width="15%">类别</th>
              <th width="40%">资源路径 / URL</th>
              <th width="20%" class="text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, idx) in loveAtmospheres" :key="item.id || idx">
              <td class="font-700 text-(--archive-text)">
                <div class="flex items-center gap-1.5">
                  <span>{{ item.name }}</span>
                  <n-tag v-if="idx === 0" size="tiny" type="primary" round>默认开屏</n-tag>
                </div>
              </td>
              <td>
                <n-tag :type="item.type === 'video' ? 'info' : 'success'" size="small" round>
                  {{ item.type === 'video' ? '视频' : '图片' }}
                </n-tag>
              </td>
              <td class="font-mono text-xs truncate max-w-[240px]">
                {{ item.src }}
              </td>
              <td class="text-right">
                <n-space justify="end" size="small">
                  <n-button v-if="idx > 0" size="tiny" type="primary" secondary @click="handleSetDefaultAtmosphere(idx)">设为默认</n-button>
                  <n-button size="tiny" secondary @click="openEditAtmosphereModal(item, idx)">编辑</n-button>
                  <n-button size="tiny" secondary type="error" @click="handleDeleteAtmosphere(idx)">删除</n-button>
                </n-space>
              </td>
            </tr>
            <tr v-if="loveAtmospheres.length === 0">
              <td colspan="4" class="text-center tone-muted py-6">暂无任何氛围配置（保存后前台将回退使用樱落/海风/雪杉）。</td>
            </tr>
          </tbody>
        </n-table>

        <div class="border-t border-(--archive-border)/40 pt-4 mt-6 flex justify-end">
          <n-button type="primary" :loading="savingLoveHero" @click="handleSaveLoveHero">
            <template #icon><span class="i-mdi-content-save-outline"></span></template>
            应用开屏配置
          </n-button>
        </div>
      </n-form>
    </section>

    <!-- 添加/编辑氛围项模态框 -->
    <n-modal
      v-model:show="showAtmosphereModal"
      preset="card"
      :title="isEditAtmosphere ? '编辑氛围背景项' : '添加氛围背景项'"
      style="width: 500px; max-width: 95vw; border-radius: 16px;"
      :bordered="false"
      size="medium"
    >
      <n-form ref="atmosphereFormRef" :model="atmosphereForm" :rules="atmosphereFormRules" label-placement="top">
        <n-form-item label="氛围显示名称" path="name">
          <n-input v-model:value="atmosphereForm.name" placeholder="例如：日落晚风" />
        </n-form-item>
        
        <n-form-item label="背景资源类型" path="type">
          <n-select v-model:value="atmosphereForm.type" :options="atmosphereTypeOptions" />
        </n-form-item>

        <n-form-item label="资源路径 / URL" path="src">
          <n-input v-model:value="atmosphereForm.src" placeholder="输入外部图片/视频 URL，或从下方上传/点选..." class="font-mono" clearable />
        </n-form-item>

        <div class="grid grid-cols-2 gap-2 mb-6">
          <n-upload
            action="/api/blogs/upload?type=love"
            :headers="uploadHeaders"
            :show-file-list="false"
            @finish="handleAtmosphereUploadFinish"
            @error="handleLoveHeroUploadError"
            @before-upload="beforeLoveHeroUpload"
            class="w-full"
          >
            <n-button dashed class="w-full flex items-center justify-center gap-1">
              <span class="i-mdi-upload text-sm"></span>
              <span>上传视频/图片</span>
            </n-button>
          </n-upload>
          <n-button dashed @click="openAtmosphereGallery" class="w-full flex items-center justify-center gap-1">
            <span class="i-mdi-image-multiple text-sm"></span>
            <span>从照片墙选择</span>
          </n-button>
        </div>

        <!-- 预览区域 -->
        <n-form-item label="效果预览">
          <div v-if="atmosphereForm.src" class="relative w-full aspect-[16/9] border border-(--archive-border) rounded-xl overflow-hidden shadow-sm bg-black/10 flex items-center justify-center">
            <video 
              v-if="atmosphereForm.type === 'video'" 
              :src="atmosphereForm.src" 
              muted 
              autoplay 
              loop 
              playsinline 
              class="w-full h-full object-cover"
            />
            <img 
              v-else 
              :src="atmosphereForm.src" 
              class="w-full h-full object-cover"
            />
          </div>
          <div v-else class="w-full aspect-[16/9] border-2 border-dashed border-(--archive-border) rounded-xl flex flex-col items-center justify-center text-(--archive-text)/20 p-2 text-center">
            <span class="i-mdi-video-outline text-3xl mb-1"></span>
            <span class="text-[10px] font-semibold leading-tight">暂无路径，请输入 URL 或上传以预览</span>
          </div>
        </n-form-item>
      </n-form>

      <template #action>
        <div class="flex items-center justify-end gap-3">
          <n-button size="small" round @click="showAtmosphereModal = false">取消</n-button>
          <n-button 
            type="primary" 
            size="small" 
            round 
            @click="handleSaveAtmosphereItem"
          >
            确认保存
          </n-button>
        </div>
      </template>
    </n-modal>

    <!-- 从照片墙选择恋爱背景图片/视频弹窗 -->
    <n-modal
      v-model:show="showLoveHeroGalleryModal"
      preset="card"
      title="从照片墙选择恋爱背景图片/视频"
      style="width: 800px; max-width: 95vw; border-radius: 16px;"
      :bordered="false"
      size="medium"
    >
      <div v-if="loadingLoveHeroGallery" class="py-12 flex flex-col items-center justify-center">
        <n-spin size="large" />
        <span class="text-xs tone-muted mt-3">正在拉取您的精美照片墙...</span>
      </div>
      <div v-else-if="loveHeroGalleryPhotos.length === 0" class="py-12 text-center">
        <span class="i-mdi-image-off-outline text-5xl tone-muted opacity-60"></span>
        <p class="text-xs tone-muted mt-2">您的相册库空空如也，请先在「照片墙」管理中添加照片。</p>
      </div>
      <div v-else class="space-y-4">
        <p class="text-xs tone-muted leading-relaxed">
          点击选择下方图册中的照片，点击「确认选择」后即可将其应用为恋爱主页的背景图/视频。
        </p>
        
        <!-- 照片网格列表 -->
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[50vh] overflow-y-auto pr-1">
          <div 
            v-for="photo in loveHeroGalleryPhotos" 
            :key="photo.id"
            class="group relative aspect-[3/2] rounded-xl overflow-hidden border transition-all cursor-pointer bg-black/5"
            :class="[
              selectedLoveHeroPhotoUrl === photo.src 
                ? 'border-(--archive-accent) ring-2 ring-(--archive-accent) ring-offset-2 dark:ring-offset-neutral-900' 
                : 'border-(--archive-border)/40 hover:border-(--archive-accent)/60'
            ]"
            @click="selectedLoveHeroPhotoUrl = photo.src"
          >
            <video 
              v-if="photo.type === 'video'" 
              :src="photo.src" 
              class="w-full h-full object-cover" 
              preload="metadata"
              muted
            />
            <img 
              v-else
              :src="photo.src" 
              :alt="photo.title" 
              class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
            />
            <!-- 视频标识图标 -->
            <div v-if="photo.type === 'video'" class="absolute right-2 top-2 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm pointer-events-none">
              <span class="i-mdi-video text-xs"></span>
            </div>
            <!-- 选中遮罩 -->
            <div 
              v-if="selectedLoveHeroPhotoUrl === photo.src" 
              class="absolute inset-0 bg-[color-mix(in_srgb,var(--archive-accent)_15%,transparent)] flex items-center justify-center"
            >
              <span class="i-mdi-check-circle text-2xl text-(--archive-accent) drop-shadow-md"></span>
            </div>
            <!-- 照片简短参数悬浮遮罩 -->
            <div class="absolute bottom-0 left-0 right-0 p-1.5 bg-gradient-to-t from-black/70 to-transparent text-[8px] text-white opacity-0 group-hover:opacity-100 transition-opacity">
              <p class="m-0 truncate font-semibold">{{ photo.title }}</p>
              <p class="m-0 mt-0.5 opacity-80 truncate">{{ photo.camera }} / {{ photo.filmStock }}</p>
            </div>
          </div>
        </div>
      </div>

      <template #action>
        <div class="flex items-center justify-end gap-3">
          <n-button size="small" round @click="showLoveHeroGalleryModal = false">取消</n-button>
          <n-button 
            type="primary" 
            size="small" 
            round 
            :disabled="!selectedLoveHeroPhotoUrl"
            @click="confirmLoveHeroGallerySelect"
          >
            确认选择
          </n-button>
        </div>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useMessage, NForm, NFormItem, NInput, NUpload, NButton, NModal, NSpin, NSpace, NTable, NTag } from 'naive-ui'
import { updateConfigBatch, getConfigList } from '@/api/config'
import { getFileList } from '@/api/files'

const message = useMessage()

// ==================== 恋爱开屏背景配置逻辑 ====================
interface AtmosphereItem {
  id: string
  name: string
  src: string
  type: 'video' | 'image'
}

const loveAtmospheres = ref<AtmosphereItem[]>([])
const showAtmosphereModal = ref(false)
const isEditAtmosphere = ref(false)
const editAtmosphereIndex = ref(-1)

const atmosphereForm = ref<AtmosphereItem>({
  id: '',
  name: '',
  src: '',
  type: 'video'
})

const atmosphereFormRules = {
  name: [{ required: true, message: '请输入氛围名称', trigger: 'blur' }],
  src: [{ required: true, message: '请输入或选择资源路径', trigger: 'change' }]
}

const atmosphereTypeOptions = [
  { label: '视频', value: 'video' },
  { label: '图片', value: 'image' }
]

// 重置默认氛围
const handleResetDefaultAtmospheres = () => {
  loveAtmospheres.value = [
    { id: 'cherry', name: '樱落', src: '/assets/【哲风壁纸】樱花-樱花飘落.mp4', type: 'video' },
    { id: 'island', name: '海风', src: '/assets/【哲风壁纸】户外-树枝-海岛.mp4', type: 'video' },
    { id: 'snow', name: '雪杉', src: '/assets/【哲风壁纸】mc-下雪-云杉树.mp4', type: 'video' }
  ]
  message.info('已重置默认氛围列表，应用后生效')
}

// 弹窗相关方法
const openAddAtmosphereModal = () => {
  isEditAtmosphere.value = false
  editAtmosphereIndex.value = -1
  atmosphereForm.value = {
    id: Date.now().toString(),
    name: '',
    src: '',
    type: 'video'
  }
  showAtmosphereModal.value = true
}

const openEditAtmosphereModal = (item: AtmosphereItem, index: number) => {
  isEditAtmosphere.value = true
  editAtmosphereIndex.value = index
  atmosphereForm.value = { ...item }
  showAtmosphereModal.value = true
}

const handleDeleteAtmosphere = (index: number) => {
  loveAtmospheres.value.splice(index, 1)
  message.warning('已移除该氛围，应用后生效')
}

const handleSaveAtmosphereItem = () => {
  if (!atmosphereForm.value.name.trim()) {
    message.error('氛围显示名称不能为空')
    return
  }
  if (!atmosphereForm.value.src.trim()) {
    message.error('资源路径不能为空')
    return
  }
  
  if (isEditAtmosphere.value && editAtmosphereIndex.value > -1) {
    loveAtmospheres.value[editAtmosphereIndex.value] = { ...atmosphereForm.value }
  } else {
    loveAtmospheres.value.push({ ...atmosphereForm.value })
  }
  showAtmosphereModal.value = false
  message.success('已更新氛围项，应用后生效')
}

const savingLoveHero = ref(false)

const handleSetDefaultAtmosphere = (index: number) => {
  if (index <= 0 || index >= loveAtmospheres.value.length) return
  const arr = [...loveAtmospheres.value]
  const item = arr.splice(index, 1)[0]
  arr.unshift(item)
  loveAtmospheres.value = arr
  message.success(`已将氛围“${item.name}”设为默认开屏，应用后生效`)
}

const handleSaveLoveHero = async () => {
  savingLoveHero.value = true

  const payload = [
    { configKey: 'page.love.heroBgUrl', configValue: '', description: '恋爱开屏自定义背景图片/视频URL' },
    { configKey: 'page.love.atmospheres', configValue: JSON.stringify(loveAtmospheres.value), description: '恋爱开屏切换氛围配置列表' }
  ]

  try {
    const response = await updateConfigBatch(payload)
    if (response.data && response.data.code === 200) {
      message.success('恋爱开屏背景及切换列表应用成功 💖')
    } else {
      throw new Error(response.data?.msg || '保存失败')
    }
  } catch (err: any) {
    console.error('Failed to save love hero config', err)
    message.error(`保存失败: ${err.message || '请检查后端接口。'}`)
  } finally {
    savingLoveHero.value = false
  }
}

const uploadHeaders = computed(() => ({
  satoken: localStorage.getItem('satoken') || ''
}))

// 上传恋爱背景控制
const beforeLoveHeroUpload = (data: { file: any }) => {
  const isImgOrVid = data.file.file?.type.startsWith('image/') || data.file.file?.type.startsWith('video/')
  if (!isImgOrVid) {
    message.error('只能上传图片或视频 file 🖼️/🎥')
    return false
  }
  const isLt20M = data.file.file?.size / 1024 / 1024 < 20
  if (!isLt20M) {
    message.error('背景大小不能超过 20MB 📦')
    return false
  }
  return true
}

const handleAtmosphereUploadFinish = ({ event }: any) => {
  try {
    const responseText = (event?.target as any)?.response
    if (responseText) {
      const res = JSON.parse(responseText)
      if (res && res.code === 200 && res.data) {
        atmosphereForm.value.src = res.data
        atmosphereForm.value.type = res.data.match(/\.(mp4|webm|ogg|mov|m4v)($|\?)/i) ? 'video' : 'image'
        message.success('氛围资源上传成功 🎨')
      } else {
        throw new Error(res?.msg || '上传接口返回错误')
      }
    }
  } catch (err: any) {
    message.error(`资源上传失败: ${err.message || '解析错误'}`)
  }
}

const handleLoveHeroUploadError = () => {
  message.error('背景上传失败，请检查网络或后端接口是否在线 ⚠️')
}

// 从照片墙选择背景图
const showLoveHeroGalleryModal = ref(false)
const loadingLoveHeroGallery = ref(false)
const loveHeroGalleryPhotos = ref<any[]>([])
const selectedLoveHeroPhotoUrl = ref('')

const openAtmosphereGallery = async () => {
  showLoveHeroGalleryModal.value = true
  loadingLoveHeroGallery.value = true
  selectedLoveHeroPhotoUrl.value = atmosphereForm.value.src || ''
  
  try {
    const response = await getFileList()
    if (response.data && response.data.code === 200) {
      const allFiles = response.data.data || []
      const imageOrVideoExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico', 'mp4', 'mkv', 'avi', 'mov', 'webm']
      loveHeroGalleryPhotos.value = allFiles
        .filter((file: any) => {
          const name = file.fileName || ''
          const ext = name.substring(name.lastIndexOf('.') + 1).toLowerCase()
          return imageOrVideoExtensions.includes(ext)
        })
        .map((file: any) => {
          const name = file.fileName || ''
          const ext = name.substring(name.lastIndexOf('.') + 1).toLowerCase()
          const isVid = ['mp4', 'mkv', 'avi', 'mov', 'webm'].includes(ext)
          return {
            id: file.fileName,
            src: file.url,
            type: isVid ? 'video' : 'image',
            title: file.fileName
          }
        })
    } else {
      throw new Error(response.data?.msg || '获取文件列表失败')
    }
  } catch (err: any) {
    message.error(err.message || '获取文件列表失败，请检查网络。')
  } finally {
    loadingLoveHeroGallery.value = false
  }
}

const confirmLoveHeroGallerySelect = () => {
  atmosphereForm.value.src = selectedLoveHeroPhotoUrl.value
  atmosphereForm.value.type = selectedLoveHeroPhotoUrl.value.match(/\.(mp4|webm|ogg|mov|m4v)($|\?)/i) ? 'video' : 'image'
  message.success('氛围资源已载入并自动设定资源类型')
  showLoveHeroGalleryModal.value = false
}

const fetchHeroConfig = async () => {
  try {
    const response = await getConfigList()
    if (response.data && response.data.code === 200) {
      const list = response.data.data || []
      const getValue = (key: string, def: string) => {
        const item = list.find((c: any) => c.configKey === key)
        return item ? item.configValue : def
      }

      const atmospheresStr = getValue('page.love.atmospheres', '[]')
      try {
        const parsed = JSON.parse(atmospheresStr)
        if (Array.isArray(parsed) && parsed.length > 0) {
          loveAtmospheres.value = parsed
        } else {
          // 初始化默认的三个氛围配置，实现默认绑定到后台
          loveAtmospheres.value = [
            { id: 'cherry', name: '樱落', src: '/assets/【哲风壁纸】樱花-樱花飘落.mp4', type: 'video' },
            { id: 'island', name: '海风', src: '/assets/【哲风壁纸】户外-树枝-海岛.mp4', type: 'video' },
            { id: 'snow', name: '雪杉', src: '/assets/【哲风壁纸】mc-下雪-云杉树.mp4', type: 'video' }
          ]
        }
      } catch (e) {
        loveAtmospheres.value = [
          { id: 'cherry', name: '樱落', src: '/assets/【哲风壁纸】樱花-樱花飘落.mp4', type: 'video' },
          { id: 'island', name: '海风', src: '/assets/【哲风壁纸】户外-树枝-海岛.mp4', type: 'video' },
          { id: 'snow', name: '雪杉', src: '/assets/【哲风壁纸】mc-下雪-云杉树.mp4', type: 'video' }
        ]
      }
    }
  } catch (err) {
    console.error('Failed to fetch love hero config', err)
  }
}

onMounted(() => {
  fetchHeroConfig()
})
</script>

<style scoped>
:deep(.n-upload) {
  width: 100%;
}
:deep(.n-upload-trigger) {
  width: 100%;
  display: block;
}
</style>
