<template>
  <div class="space-y-6">
    <div class="archive-card p-5 sm:p-6 bg-(--archive-bg-card) border border-(--archive-border) rounded-2xl text-left">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="m-0 text-base font-bold text-(--archive-text) flex items-center gap-2">
            <span class="i-mdi-flower text-lg text-(--archive-accent) animate-pulse"></span>
            全站品牌与开屏配置 (Brand & Welcome Hero)
          </h3>
          <p class="tone-muted text-xs mt-1 leading-relaxed">
            自定义全站 LOGO 图标、文字标识、浏览器 Favicon 标签图标、网页标题文案，以及主页开屏的微缩微粒文本和背景大图/视频。
          </p>
        </div>
        <n-button secondary size="small" type="warning" @click="handleResetDefault">
          恢复系统默认
        </n-button>
      </div>

      <n-form label-placement="top" class="mt-6 space-y-5">
        <!-- 1. 网站标识配置 -->
        <div class="space-y-4">
          <p class="m-0 text-xs font-bold border-b border-(--archive-border)/40 pb-2 mb-3 text-(--archive-text)">全站导航 LOGO & 品牌文字</p>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <n-form-item label="Logo 旁边展示文字 (Logo Text)" required class="m-0">
              <n-input v-model:value="brand.logoText" placeholder="例如: RRTiamo" class="archive-input w-full" />
            </n-form-item>

            <n-form-item label="Logo 图标图片 (Logo URL - 留空默认使用 SVG 齿轮)" class="m-0">
              <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full overflow-hidden">
                <n-input v-model:value="brand.logoUrl" placeholder="图片 URL..." class="font-mono flex-1 archive-input" clearable />
                <div class="flex items-center gap-2 shrink-0 justify-end sm:justify-start">
                  <n-button secondary size="small" class="shrink-0" @click="openGallerySelect('logoUrl')">相册选择</n-button>
                  <n-upload
                    action="/api/blogs/upload?type=brand"
                    :headers="uploadHeaders"
                    :show-file-list="false"
                    class="flex shrink-0"
                    @finish="(res) => handleUploadFinish('logoUrl', res)"
                    @error="handleUploadError"
                  >
                    <n-button secondary size="small" type="primary">
                      上传
                    </n-button>
                  </n-upload>
                  <!-- Logo 预览 -->
                  <div v-if="brand.logoUrl" class="h-8 w-8 rounded-lg border border-(--archive-border)/40 bg-black/5 overflow-hidden flex items-center justify-center shrink-0">
                    <img :src="brand.logoUrl" class="w-full h-full object-contain" />
                  </div>
                </div>
              </div>
            </n-form-item>
          </div>
        </div>

        <!-- 2. 标签页与 SEO 配置 -->
        <div class="space-y-4 pt-3">
          <p class="m-0 text-xs font-bold border-b border-(--archive-border)/40 pb-2 mb-3 text-(--archive-text)">浏览器标签 Favicon & 网页标题 (SEO)</p>
          
          <n-form-item label="浏览器 Favicon 标签图标 (Favicon URL - 留空默认使用彩色小花)">
            <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full overflow-hidden">
              <n-input v-model:value="brand.faviconUrl" placeholder="图片 URL..." class="font-mono flex-1 archive-input" clearable />
              <div class="flex items-center gap-2 shrink-0 justify-end sm:justify-start">
                <n-button secondary size="small" class="shrink-0" @click="openGallerySelect('faviconUrl')">相册选择</n-button>
                <n-upload
                  action="/api/blogs/upload?type=brand"
                  :headers="uploadHeaders"
                  :show-file-list="false"
                  class="flex shrink-0"
                  @finish="(res) => handleUploadFinish('faviconUrl', res)"
                  @error="handleUploadError"
                >
                  <n-button secondary size="small" type="primary">
                    上传
                  </n-button>
                </n-upload>
                <!-- Favicon 预览 -->
                <div v-if="brand.faviconUrl" class="h-8 w-8 rounded-lg border border-(--archive-border)/40 bg-black/5 overflow-hidden flex items-center justify-center shrink-0">
                  <img :src="brand.faviconUrl" class="w-full h-full object-contain" />
                </div>
              </div>
            </div>
          </n-form-item>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
            <n-form-item label="全站默认浏览器标签标题 (Default Title)" required>
              <n-input v-model:value="brand.titleDefault" placeholder="例如: 此间主人 | RRTiamo" class="archive-input" />
            </n-form-item>
            <n-form-item label="关于作者页面专属浏览器标签标题 (About Page Title)" required>
              <n-input v-model:value="brand.titleAbout" placeholder="例如: 春风不解别离意，今日方知我是春。" class="archive-input" />
            </n-form-item>
          </div>
        </div>

        <!-- 3. 主页开屏定制 -->
        <div class="space-y-4 pt-3">
          <p class="m-0 text-xs font-bold border-b border-(--archive-border)/40 pb-2 mb-3 text-(--archive-text)">主页开屏文本与定制媒体背景 (Welcome Hero)</p>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <n-form-item label="开屏品牌英文/拼音大字 (Welcome Large Text)" required>
              <n-input v-model:value="brand.welcomeText" placeholder="例如: spring" class="archive-input font-mono" />
            </n-form-item>
            <n-form-item label="开屏打字机底部小字 (Welcome Subtitle)" required>
              <n-input v-model:value="brand.welcomeSubtitle" placeholder="例如: 此间主人" class="archive-input" />
            </n-form-item>
          </div>

          <n-form-item label="开屏背景展示媒体 (大图/视频 URL)">
            <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full overflow-hidden">
              <n-input v-model:value="brand.heroBgUrl" placeholder="输入外部图片或视频链接..." class="font-mono flex-1 archive-input" clearable />
              <div class="flex items-center gap-2 shrink-0 justify-end sm:justify-start">
                <n-button secondary size="small" class="shrink-0" @click="openGallerySelect('heroBgUrl')">相册选择</n-button>
                <n-upload
                  action="/api/blogs/upload?type=brand"
                  :headers="uploadHeaders"
                  :show-file-list="false"
                  class="flex shrink-0"
                  @finish="(res) => handleUploadFinish('heroBgUrl', res)"
                  @error="handleUploadError"
                >
                  <n-button secondary size="small" type="primary">
                    上传
                  </n-button>
                </n-upload>
                <!-- 开屏背景预览 -->
                <div v-if="brand.heroBgUrl" class="h-8 w-12 rounded-lg border border-(--archive-border)/40 bg-black/10 overflow-hidden flex items-center justify-center shrink-0">
                  <video v-if="isMediaVideo(brand.heroBgUrl)" :src="brand.heroBgUrl" autoplay muted loop playsinline class="w-full h-full object-cover"></video>
                  <img v-else :src="brand.heroBgUrl" class="w-full h-full object-cover" />
                </div>
              </div>
            </div>
          </n-form-item>
        </div>

        <!-- 提交控制 -->
        <div class="border-t border-(--archive-border)/40 pt-4 mt-4 flex justify-end">
          <n-button type="primary" :loading="saving" @click="handleSave">
            <template #icon><span class="i-mdi-content-save-outline"></span></template>
            应用品牌与开屏配置
          </n-button>
        </div>
      </n-form>
    </div>

    <!-- 从照片墙图册选择弹窗 -->
    <n-modal
      v-model:show="showGallerySelectModal"
      preset="card"
      title="从相册选择媒体文件"
      class="w-[95vw] max-w-[700px] rounded-2xl"
    >
      <div v-if="loadingGallery" class="py-12 flex justify-center">
        <n-spin size="medium" />
      </div>
      <div v-else-if="galleryPhotos.length === 0" class="py-12 text-center">
        <span class="i-mdi-image-off-outline text-5xl tone-muted opacity-60"></span>
        <p class="text-xs tone-muted mt-2">您的相册库空空如应，请先在「照片墙」管理中添加照片。</p>
      </div>
      <div v-else class="space-y-4">
        <p class="text-xs tone-muted leading-relaxed">
          点击选择下方图册中的照片或视频，点击「确认选择」后即可应用到对应配置项。
        </p>
        
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[50vh] overflow-y-auto pr-1">
          <div 
            v-for="photo in galleryPhotos" 
            :key="photo.id"
            class="group relative aspect-[3/2] rounded-xl overflow-hidden border transition-all cursor-pointer bg-black/5"
            :class="[
              selectedPhotoUrl === photo.src 
                ? 'border-(--archive-accent) ring-2 ring-(--archive-accent) ring-offset-2 dark:ring-offset-neutral-900' 
                : 'border-(--archive-border)/40 hover:border-(--archive-accent)/60'
            ]"
            @click="selectedPhotoUrl = photo.src"
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
            <div v-if="photo.type === 'video'" class="absolute right-2 top-2 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm pointer-events-none">
              <span class="i-mdi-video text-xs"></span>
            </div>
            <div v-if="selectedPhotoUrl === photo.src" class="absolute inset-0 bg-[color-mix(in_srgb,var(--archive-accent)_15%,transparent)] flex items-center justify-center">
              <span class="i-mdi-check-circle text-2xl text-(--archive-accent) drop-shadow-md"></span>
            </div>
          </div>
        </div>
      </div>

      <template #action>
        <div class="flex items-center justify-end gap-3">
          <n-button size="small" round @click="showGallerySelectModal = false">取消</n-button>
          <n-button type="primary" size="small" round :disabled="!selectedPhotoUrl" @click="confirmGallerySelect">确认选择</n-button>
        </div>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useMessage, NForm, NFormItem, NInput, NUpload, NButton, NModal, NSpin } from 'naive-ui'
import { getConfigList, updateConfigBatch } from '@/api/config'
import { getFileList } from '@/api/files'

const message = useMessage()
const saving = ref(false)

const defaultBrand = {
  logoUrl: '',
  logoText: 'RRTiamo',
  faviconUrl: '',
  titleDefault: '此间主人 | RRTiamo',
  titleAbout: '春风不解别离意，今日方知我是春。',
  welcomeText: 'spring',
  welcomeSubtitle: '此间主人',
  heroBgUrl: '/assets/bg-video.mp4'
}

const brand = ref({ ...defaultBrand })

// 照片墙弹窗相关
const showGallerySelectModal = ref(false)
const loadingGallery = ref(false)
const galleryPhotos = ref<any[]>([])
const selectedPhotoUrl = ref('')
const gallerySelectTarget = ref<'logoUrl' | 'faviconUrl' | 'heroBgUrl'>('logoUrl')

const uploadHeaders = computed(() => ({
  satoken: localStorage.getItem('satoken') || ''
}))

const isMediaVideo = (url: string) => {
  if (!url) return false
  return /\.(mp4|webm|ogg|mov|m4v)($|\?)/i.test(url)
}

const fetchConfigs = async () => {
  try {
    const response = await getConfigList()
    if (response.data && response.data.code === 200) {
      const list = response.data.data || []
      const getValue = (key: string, def: string) => {
        const item = list.find((c: any) => c.configKey === key)
        return item ? item.configValue : def
      }

      brand.value.logoUrl = getValue('site.logo.url', '')
      brand.value.logoText = getValue('site.logo.text', 'RRTiamo')
      brand.value.faviconUrl = getValue('site.favicon.url', '')
      brand.value.titleDefault = getValue('site.title.default', '此间主人 | RRTiamo')
      brand.value.titleAbout = getValue('site.title.about', '春风不解别离意，今日方知我是春。')
      brand.value.welcomeText = getValue('page.home.welcomeText', 'spring')
      brand.value.welcomeSubtitle = getValue('page.home.welcomeSubtitle', '此间主人')
      brand.value.heroBgUrl = getValue('page.home.heroBgUrl', '/assets/bg-video.mp4')
    }
  } catch (err) {
    console.error('Failed to load brand config', err)
  }
}

const handleSave = async () => {
  saving.value = true

  const payload = [
    { configKey: 'site.logo.url', configValue: brand.value.logoUrl, description: '全站 LOGO 自定义图片链接' },
    { configKey: 'site.logo.text', configValue: brand.value.logoText, description: '网站 LOGO 旁边的展示文字' },
    { configKey: 'site.favicon.url', configValue: brand.value.faviconUrl, description: '浏览器 Tab 标签 Favicon 图片链接' },
    { configKey: 'site.title.default', configValue: brand.value.titleDefault, description: '全站默认网页 Title 标题' },
    { configKey: 'site.title.about', configValue: brand.value.titleAbout, description: '关于作者页专属网页 Title 标题' },
    { configKey: 'page.home.welcomeText', configValue: brand.value.welcomeText, description: '主页开屏大字文案' },
    { configKey: 'page.home.welcomeSubtitle', configValue: brand.value.welcomeSubtitle, description: '主页开屏副标题/打字机小字' },
    { configKey: 'page.home.heroBgUrl', configValue: brand.value.heroBgUrl, description: '主页开屏背景图/视频 URL' }
  ]

  try {
    const response = await updateConfigBatch(payload)
    if (response.data && response.data.code === 200) {
      message.success('全站品牌与开屏配置应用成功，前台已实时生效！')
      window.dispatchEvent(new CustomEvent('atlas-config-changed'))
      await fetchConfigs()
    } else {
      throw new Error(response.data?.msg || '保存配置失败')
    }
  } catch (err: any) {
    message.error(err.message || '网络连接异常，配置提交失败。')
  } finally {
    saving.value = false
  }
}

const handleResetDefault = () => {
  brand.value = { ...defaultBrand }
  message.success('已重置为默认品牌配置，请点击右下角应用生效')
}

// 统一本地上传回调
const handleUploadFinish = (target: 'logoUrl' | 'faviconUrl' | 'heroBgUrl', { event }: any) => {
  try {
    const responseText = (event?.target as any)?.response
    if (responseText) {
      const res = JSON.parse(responseText)
      if (res && res.code === 200 && res.data) {
        brand.value[target] = res.data
        message.success('多媒体文件上传成功 🎨')
      } else {
        throw new Error(res?.msg || '上传接口错误')
      }
    }
  } catch (err: any) {
    message.error(`文件上传失败: ${err.message || '解析错误'}`)
  }
}

const handleUploadError = () => {
  message.error('文件上传失败，请确认后端服务连接状态 ⚠️')
}

// 照片墙弹窗选择交互
const openGallerySelect = async (target: 'logoUrl' | 'faviconUrl' | 'heroBgUrl') => {
  gallerySelectTarget.value = target
  showGallerySelectModal.value = true
  loadingGallery.value = true
  selectedPhotoUrl.value = brand.value[target] || ''
  try {
    const response = await getFileList()
    if (response.data && response.data.code === 200) {
      const allFiles = response.data.data || []
      const imageOrVideoExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico', 'mp4', 'mkv', 'avi', 'mov', 'webm']
      const mapped = allFiles
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
      // Logo 和 Favicon 只能选图片，开屏背景可以选图片/视频
      galleryPhotos.value = (target === 'logoUrl' || target === 'faviconUrl')
        ? mapped.filter((p: any) => p.type !== 'video')
        : mapped
    }
  } catch (err) {
    console.error('Failed to load files', err)
  } finally {
    loadingGallery.value = false
  }
}

const confirmGallerySelect = () => {
  brand.value[gallerySelectTarget.value] = selectedPhotoUrl.value
  showGallerySelectModal.value = false
  message.success('已从照片墙选择并应用该文件')
}

onMounted(() => {
  fetchConfigs()
})
</script>
