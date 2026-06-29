<template>
  <div class="space-y-6">
    <div class="archive-card p-5 sm:p-6 bg-(--archive-bg-card) border border-(--archive-border) rounded-2xl">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="m-0 text-base font-760 text-(--archive-text) flex items-center gap-2">
            <span class="i-mdi-palette-outline text-lg tone-accent"></span>
            自定义外观主题与配色系统
          </h3>
          <p class="tone-muted text-xs mt-1">深度定制博主的个人视觉形象（亮色与暗色模式的色彩体系、电影颗粒感及背景）。</p>
        </div>
        <n-button secondary size="small" type="warning" @click="handleResetDefaultTheme">
          重置为系统默认
        </n-button>
      </div>

      <n-form label-placement="top" class="mt-6 space-y-5">
        <div class="flex items-center justify-between py-2 border-b border-(--archive-border)/40">
          <div>
            <p class="m-0 text-sm font-700 text-(--archive-text)">激活自定义外观</p>
            <p class="m-0 mt-0.5 text-xs tone-muted">开启后，前台渲染将物理覆盖默认配置，而强制使用博主下方的色彩定义。</p>
          </div>
          <n-switch v-model:value="theme.enabled" />
        </div>

        <div v-if="theme.enabled" class="space-y-6 pt-3">
          <!-- 设计师预设主题一键应用 -->
          <div class="p-4 bg-(--archive-border)/10 rounded-2xl border border-(--archive-border)/40">
            <p class="m-0 text-xs font-bold text-(--archive-text) mb-3 flex items-center gap-1.5 flex-wrap">
              <span class="i-mdi-palette-swatch-outline text-base tone-accent"></span>
              <span>设计师预设色彩主题 (UI/UX Calibrated Presets)</span>
              <span class="text-[10px] font-normal tone-muted ml-2 flex items-center gap-0.5">
                <span class="i-mdi-alert-circle-outline text-xs text-amber-500"></span>
                <span>建议使用系统配色，防止页面内容被遮挡</span>
              </span>
            </p>
            <div class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
              <div 
                v-for="preset in themePresets" 
                :key="preset.id"
                class="flex flex-col items-center p-2.5 rounded-xl border cursor-pointer transition-all hover:bg-black/5 dark:hover:bg-white/5 active:scale-98"
                :class="[
                  isCurrentPreset(preset)
                    ? 'border-(--archive-accent) bg-(--archive-accent)/5 shadow-sm'
                    : 'border-(--archive-border)/40 bg-white/30 dark:bg-white/5'
                ]"
                @click="applyPreset(preset)"
              >
                <!-- 拼色指示器 -->
                <div class="w-12 h-6 rounded-full overflow-hidden flex border border-black/10 shadow-inner mb-2 shrink-0">
                  <div class="w-1/4 h-full" :style="{ backgroundColor: preset.colors.accentColor }" title="亮色主调"></div>
                  <div class="w-1/4 h-full" :style="{ backgroundColor: preset.colors.bgColor }" title="亮色背景"></div>
                  <div class="w-1/4 h-full" :style="{ backgroundColor: preset.colors.darkAccentColor }" title="暗色主调"></div>
                  <div class="w-1/4 h-full" :style="{ backgroundColor: preset.colors.darkBgColor }" title="暗色背景"></div>
                </div>
                <span class="text-[11px] font-700 text-(--archive-text)">{{ preset.name }}</span>
                <span class="text-[9px] tone-muted mt-0.5 text-center">{{ preset.desc }}</span>
              </div>
            </div>
          </div>

          <!-- 亮色配色体系 -->
          <div>
            <p class="m-0 text-xs font-bold border-b border-(--archive-border)/40 pb-2 mb-4 text-(--archive-text)">亮色模式配色定义 (Light Theme)</p>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <n-form-item label="亮色主调色 (Accent Color)">
                <div class="flex gap-2 w-full">
                  <n-input v-model:value="theme.accentColor" placeholder="#D9865F" class="flex-1" />
                  <input type="color" v-model="theme.accentColor" class="w-10 h-8 rounded border" />
                </div>
              </n-form-item>
              <n-form-item label="亮色辅助柔和色 (Accent Soft Color)">
                <div class="flex gap-2 w-full">
                  <n-input v-model:value="theme.accentSoftColor" placeholder="#F1B894" class="flex-1" />
                  <input type="color" v-model="theme.accentSoftColor" class="w-10 h-8 rounded border" />
                </div>
              </n-form-item>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
              <n-form-item label="亮色背景主色 (Background Color)">
                <div class="flex gap-2 w-full">
                  <n-input v-model:value="theme.bgColor" placeholder="#F7F8F1" class="flex-1" />
                  <input type="color" v-model="theme.bgColor" class="w-10 h-8 rounded border" />
                </div>
              </n-form-item>
              <n-form-item label="亮色背景次色 (Soft Background)">
                <div class="flex gap-2 w-full">
                  <n-input v-model:value="theme.bgSoftColor" placeholder="#EAF0E5" class="flex-1" />
                  <input type="color" v-model="theme.bgSoftColor" class="w-10 h-8 rounded border" />
                </div>
              </n-form-item>
            </div>
          </div>

          <!-- 暗色配色体系 -->
          <div>
            <p class="m-0 text-xs font-bold border-b border-(--archive-border)/40 pb-2 mb-4 text-(--archive-text)">暗色模式配色定义 (Dark Theme)</p>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <n-form-item label="暗色主调色 (Dark Accent Color)">
                <div class="flex gap-2 w-full">
                  <n-input v-model:value="theme.darkAccentColor" placeholder="#F1A77C" class="flex-1" />
                  <input type="color" v-model="theme.darkAccentColor" class="w-10 h-8 rounded border" />
                </div>
              </n-form-item>
              <n-form-item label="暗色辅助柔和色 (Dark Accent Soft)">
                <div class="flex gap-2 w-full">
                  <n-input v-model:value="theme.darkAccentSoftColor" placeholder="#F5C6A8" class="flex-1" />
                  <input type="color" v-model="theme.darkAccentSoftColor" class="w-10 h-8 rounded border" />
                </div>
              </n-form-item>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
              <n-form-item label="暗色背景主色 (Dark Background Color)">
                <div class="flex gap-2 w-full">
                  <n-input v-model:value="theme.darkBgColor" placeholder="#17211B" class="flex-1" />
                  <input type="color" v-model="theme.darkBgColor" class="w-10 h-8 rounded border" />
                </div>
              </n-form-item>
              <n-form-item label="暗色背景次色 (Dark Soft Background)">
                <div class="flex gap-2 w-full">
                  <n-input v-model:value="theme.darkBgSoftColor" placeholder="#203027" class="flex-1" />
                  <input type="color" v-model="theme.darkBgSoftColor" class="w-10 h-8 rounded border" />
                </div>
              </n-form-item>
            </div>
          </div>

          <!-- 全局噪点、氛围灯效与大图 -->
          <div>
            <p class="m-0 text-xs font-bold border-b border-(--archive-border)/40 pb-2 mb-4 text-(--archive-text)">质感微调与多媒体氛围 (Texture & Media)</p>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <n-form-item label="电影胶片噪点噪点不透明度 (%)">
                <n-input-number v-model:value="theme.grainOpacity" :min="0" :max="100" class="w-full" />
              </n-form-item>
              <div class="flex items-center justify-between py-2 border-b border-(--archive-border)/40">
                <div>
                  <p class="m-0 text-sm font-700 text-(--archive-text)">霓虹氛围背景灯效 (Neon Glows)</p>
                  <p class="m-0 mt-0.5 text-xs tone-muted">是否在前台主页及列表渲染多层霓虹流动渐变光照。</p>
                </div>
                <n-switch v-model:value="theme.glowsEnabled" />
              </div>
            </div>

            <!-- 全局背景图片配置 -->
            <div class="grid grid-cols-1 gap-4 mt-4">
              <n-form-item label="自定义全局背景图片 URL (留空使用默认渐变)">
                <div class="flex gap-2 w-full">
                  <n-input v-model:value="theme.bgImageUrl" placeholder="输入外部图片URL，或使用下方本地上传..." class="font-mono flex-1" clearable />
                  <n-button secondary @click="openGallerySelect()">从照片墙选择</n-button>
                </div>
              </n-form-item>
              
              <div class="flex flex-wrap items-center gap-2 mb-2">
                <n-upload
                  action="http://localhost:8080/api/blogs/upload?type=theme"
                  :headers="uploadHeaders"
                  :show-file-list="false"
                  @finish="handleBgUploadFinish"
                  @error="handleBgUploadError"
                >
                  <n-button secondary size="small" type="primary">
                    <template #icon><span class="i-mdi-upload"></span></template>
                    本地上传背景图
                  </n-button>
                </n-upload>
                <n-button v-if="theme.bgImageUrl" secondary size="small" type="error" @click="handleRemoveBgImage">
                  恢复默认背景
                </n-button>
              </div>

              <div v-if="theme.bgImageUrl" class="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 soft-panel rounded-2xl bg-black/5 dark:bg-white/5 border border-(--archive-border)/40">
                <n-form-item label="展示样式 (Style)">
                  <n-select v-model:value="theme.bgImageStyle" :options="[
                    { label: '拉伸平铺 (Cover)', value: 'cover' },
                    { label: '完整居中 (Contain)', value: 'contain' },
                    { label: '平铺瓦片 (Tile)', value: 'tile' }
                  ]" />
                </n-form-item>
                <n-form-item label="背景图毛玻璃模糊 (px)">
                  <n-input-number v-model:value="theme.bgImageBlur" :min="0" :max="40" class="w-full" />
                </n-form-item>
                <n-form-item label="亮色模式透明度 (0-100)">
                  <n-input-number v-model:value="theme.bgImageOpacity" :min="0" :max="100" class="w-full" />
                </n-form-item>
                <n-form-item label="暗色模式透明度 (0-100)">
                  <n-input-number v-model:value="theme.darkBgImageOpacity" :min="0" :max="100" class="w-full" />
                </n-form-item>
              </div>
            </div>


            <!-- 附加自定义 CSS 样式 -->
            <div class="grid grid-cols-1 gap-4 mt-6">
              <n-form-item label="前台附加自定义 CSS 代码 (用于深度重载或样式微调)">
                <n-input v-model:value="theme.customCss" type="textarea" :rows="5" placeholder="如: body { font-variant-numeric: tabular-nums; } .writing-card { border-radius: 12px !important; }" class="font-mono" />
              </n-form-item>
            </div>
          </div>
        </div>

        <div class="border-t border-(--archive-border)/40 pt-4 mt-2 flex justify-end">
          <n-button type="primary" :loading="saving" @click="handleSave">
            <template #icon><span class="i-mdi-content-save-outline"></span></template>
            应用主题外观配置
          </n-button>
        </div>
      </n-form>
    </div>

    <!-- 从照片墙图册选择弹窗 -->
    <n-modal
      v-model:show="showGallerySelectModal"
      preset="card"
      title="从相册选择背景图片"
      class="w-[95vw] max-w-[700px]"
    >
      <div v-if="loadingGallery" class="py-12 flex justify-center">
        <n-spin size="medium" />
      </div>
      <div v-else-if="galleryPhotos.length === 0" class="py-12 text-center">
        <span class="i-mdi-image-off-outline text-5xl tone-muted opacity-60"></span>
        <p class="text-xs tone-muted mt-2">您的相册库空空如也，请先在「照片墙」管理中添加照片。</p>
      </div>
      <div v-else class="space-y-4">
        <p class="text-xs tone-muted leading-relaxed">
          点击选择下方图册中的照片，点击「确认选择」后即可将其应用为背景。
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
            <img :src="photo.src" :alt="photo.title" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
            <div v-if="selectedPhotoUrl === photo.src" class="absolute inset-0 bg-[color-mix(in_srgb,var(--archive-accent)_15%,transparent)] flex items-center justify-center">
              <span class="i-mdi-check-circle text-2xl text-(--archive-accent)"></span>
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
import { useMessage, NForm, NFormItem, NInput, NInputNumber, NSwitch, NUpload, NButton, NModal, NSpin } from 'naive-ui'
import axios from 'axios'

const message = useMessage()
const saving = ref(false)

const defaultTheme = {
  enabled: false,
  accentColor: '#D9865F',
  accentSoftColor: '#F1B894',
  bgColor: '#F7F8F1',
  bgSoftColor: '#EAF0E5',
  darkAccentColor: '#F1A77C',
  darkAccentSoftColor: '#F5C6A8',
  darkBgColor: '#17211B',
  darkBgSoftColor: '#203027',
  grainOpacity: 3.8,
  glowsEnabled: false,
  bgImageUrl: '',
  bgImageStyle: 'cover',
  bgImageBlur: 0,
  bgImageOpacity: 10,
  darkBgImageOpacity: 5,
  customCss: ''
}

const theme = ref(JSON.parse(JSON.stringify(defaultTheme)))

// 照片墙选择弹窗相关
const showGallerySelectModal = ref(false)
const loadingGallery = ref(false)
const galleryPhotos = ref<any[]>([])
const selectedPhotoUrl = ref('')


const uploadHeaders = computed(() => ({
  satoken: localStorage.getItem('satoken') || ''
}))



const fetchConfigs = async () => {
  try {
    const token = localStorage.getItem('satoken')
    const response = await axios.get('http://localhost:8080/api/config/list', {
      headers: { satoken: token }
    })
    
    if (response.data && response.data.code === 200) {
      const list = response.data.data || []
      const getValue = (key: string, def: string) => {
        const item = list.find((c: any) => c.configKey === key)
        return item ? item.configValue : def
      }

      theme.value.enabled = getValue('page.theme.enabled', 'false') === 'true'
      theme.value.accentColor = getValue('page.theme.accentColor', '#D9865F')
      theme.value.accentSoftColor = getValue('page.theme.accentSoftColor', '#F1B894')
      theme.value.bgColor = getValue('page.theme.bgColor', '#F7F8F1')
      theme.value.bgSoftColor = getValue('page.theme.bgSoftColor', '#EAF0E5')
      theme.value.darkAccentColor = getValue('page.theme.darkAccentColor', '#F1A77C')
      theme.value.darkAccentSoftColor = getValue('page.theme.darkAccentSoftColor', '#F5C6A8')
      theme.value.darkBgColor = getValue('page.theme.darkBgColor', '#17211B')
      theme.value.darkBgSoftColor = getValue('page.theme.darkBgSoftColor', '#203027')
      theme.value.grainOpacity = Number(getValue('page.theme.grainOpacity', '3.8'))
      theme.value.glowsEnabled = getValue('page.theme.glowsEnabled', 'false') === 'true'
      theme.value.bgImageUrl = getValue('page.theme.bgImageUrl', '')
      theme.value.bgImageStyle = getValue('page.theme.bgImageStyle', 'cover')
      theme.value.bgImageBlur = Number(getValue('page.theme.bgImageBlur', '0'))
      theme.value.bgImageOpacity = Number(getValue('page.theme.bgImageOpacity', '10'))
      theme.value.darkBgImageOpacity = Number(getValue('page.theme.darkBgImageOpacity', '5'))
      theme.value.customCss = getValue('page.theme.customCss', '')
    }
  } catch (err) {
    console.error('Failed to load theme config', err)
  }
}

const handleSave = async () => {
  saving.value = true
  const token = localStorage.getItem('satoken')

  const payload = [
    { configKey: 'page.theme.enabled', configValue: String(theme.value.enabled), description: '是否启用系统自定义外观主题' },
    { configKey: 'page.theme.accentColor', configValue: theme.value.accentColor, description: '自定义主题-亮色模式主色' },
    { configKey: 'page.theme.accentSoftColor', configValue: theme.value.accentSoftColor, description: '自定义主题-亮色模式柔和主色' },
    { configKey: 'page.theme.bgColor', configValue: theme.value.bgColor, description: '自定义主题-亮色模式背景色' },
    { configKey: 'page.theme.bgSoftColor', configValue: theme.value.bgSoftColor, description: '自定义主题-亮色模式次级背景色' },
    { configKey: 'page.theme.darkAccentColor', configValue: theme.value.darkAccentColor, description: '自定义主题-暗色模式主色' },
    { configKey: 'page.theme.darkAccentSoftColor', configValue: theme.value.darkAccentSoftColor, description: '自定义主题-暗色模式柔和主色' },
    { configKey: 'page.theme.darkBgColor', configValue: theme.value.darkBgColor, description: '自定义主题-暗色模式背景色' },
    { configKey: 'page.theme.darkBgSoftColor', configValue: theme.value.darkBgSoftColor, description: '自定义主题-暗色模式次级背景色' },
    { configKey: 'page.theme.grainOpacity', configValue: String(theme.value.grainOpacity), description: '自定义主题-电影噪点不透明度(0-100)' },
    { configKey: 'page.theme.glowsEnabled', configValue: String(theme.value.glowsEnabled), description: '自定义主题-是否开启霓虹背景灯效' },
    { configKey: 'page.theme.bgImageUrl', configValue: theme.value.bgImageUrl, description: '自定义主题-全局背景图片URL' },
    { configKey: 'page.theme.bgImageStyle', configValue: theme.value.bgImageStyle || 'cover', description: '自定义主题-背景图展示样式(cover/contain/tile)' },
    { configKey: 'page.theme.bgImageBlur', configValue: String(theme.value.bgImageBlur || 0), description: '自定义主题-背景图模糊度(0-40px)' },
    { configKey: 'page.theme.bgImageOpacity', configValue: String(theme.value.bgImageOpacity || 10), description: '自定义主题-亮色模式背景图透明度(0-100)' },
    { configKey: 'page.theme.darkBgImageOpacity', configValue: String(theme.value.darkBgImageOpacity || 5), description: '自定义主题-暗色模式背景图透明度(0-100)' },
    { configKey: 'page.theme.customCss', configValue: theme.value.customCss, description: '自定义主题-附加自定义CSS样式代码' }
  ]

  try {
    const response = await axios.post('http://localhost:8080/api/config/update-batch', payload, {
      headers: { satoken: token }
    })
    
    if (response.data && response.data.code === 200) {
      message.success('外观色彩配置应用成功，刷新后将同步展现！')
      window.dispatchEvent(new CustomEvent('atlas-config-changed'))
      await fetchConfigs()
    } else {
      throw new Error(response.data?.msg || '保存失败')
    }
  } catch (err: any) {
    message.error(err.message || '网络连接失败，外观色彩配置应用失败。')
  } finally {
    saving.value = false
  }
}

const handleBgUploadFinish = ({ event }: any) => {
  try {
    const responseText = (event?.target as any)?.response
    if (responseText) {
      const res = JSON.parse(responseText)
      if (res && res.code === 200 && res.data) {
        theme.value.bgImageUrl = res.data
        message.success('自定义背景图片上传成功 🖼️')
      } else {
        throw new Error(res?.msg || '上传接口返回错误')
      }
    }
  } catch (err: any) {
    message.error(`背景图上传失败: ${err.message || '解析错误'}`)
  }
}

const handleBgUploadError = () => {
  message.error('图片上传失败，请检查网络或后端接口是否在线 ⚠️')
}

const handleRemoveBgImage = () => {
  theme.value.bgImageUrl = ''
  message.success('已恢复默认背景')
}

const openGallerySelect = async () => {
  showGallerySelectModal.value = true
  loadingGallery.value = true
  selectedPhotoUrl.value = theme.value.bgImageUrl || ''
  const token = localStorage.getItem('satoken')
  try {
    const response = await axios.get('http://localhost:8080/api/gallery/list', {
      headers: { satoken: token }
    })
    if (response.data && response.data.code === 200) {
      galleryPhotos.value = (response.data.data || []).filter((p: any) => p.type !== 'video')
    }
  } catch (err) {
    console.error('Failed to load gallery photos', err)
  } finally {
    loadingGallery.value = false
  }
}

const confirmGallerySelect = () => {
  theme.value.bgImageUrl = selectedPhotoUrl.value
  showGallerySelectModal.value = false
  message.success('已从照片墙选中并应用背景')
}

const handleResetDefaultTheme = () => {
  theme.value = JSON.parse(JSON.stringify(defaultTheme))
  message.success('已重置为系统默认外观主题，请记得点击下方保存')
}

interface PresetColors {
  accentColor: string
  accentSoftColor: string
  bgColor: string
  bgSoftColor: string
  darkAccentColor: string
  darkAccentSoftColor: string
  darkBgColor: string
  darkBgSoftColor: string
}

interface ThemePreset {
  id: string
  name: string
  desc: string
  colors: PresetColors
}

const themePresets: ThemePreset[] = [
  {
    id: 'amber',
    name: '琥珀橙',
    desc: '温暖秋日默认',
    colors: {
      accentColor: '#D9865F',
      accentSoftColor: '#F1B894',
      bgColor: '#F7F8F1',
      bgSoftColor: '#EAF0E5',
      darkAccentColor: '#F1A77C',
      darkAccentSoftColor: '#F5C6A8',
      darkBgColor: '#17211B',
      darkBgSoftColor: '#203027'
    }
  },
  {
    id: 'matcha',
    name: '抹茶绿',
    desc: '清晨森系治愈',
    colors: {
      accentColor: '#4A7758',
      accentSoftColor: '#A3C1AD',
      bgColor: '#F6F8F5',
      bgSoftColor: '#EDF1EB',
      darkAccentColor: '#93C5A8',
      darkAccentSoftColor: '#6E9C80',
      darkBgColor: '#121A15',
      darkBgSoftColor: '#1B261F'
    }
  },
  {
    id: 'lavender',
    name: '忧郁紫',
    desc: '落日薰衣草',
    colors: {
      accentColor: '#635170',
      accentSoftColor: '#C5B4C9',
      bgColor: '#F8F6F9',
      bgSoftColor: '#EFEBF2',
      darkAccentColor: '#C3B0CD',
      darkAccentSoftColor: '#A890B5',
      darkBgColor: '#161219',
      darkBgSoftColor: '#201A24'
    }
  },
  {
    id: 'foggy',
    name: '雾霾蓝',
    desc: '冰川冷湖现代',
    colors: {
      accentColor: '#467285',
      accentSoftColor: '#A3C6D3',
      bgColor: '#F4F7F9',
      bgSoftColor: '#E8EEF1',
      darkAccentColor: '#82B2C6',
      darkAccentSoftColor: '#5C899E',
      darkBgColor: '#11161B',
      darkBgSoftColor: '#1B222A'
    }
  },
  {
    id: 'sakura',
    name: '樱花粉',
    desc: '春雨初樱浪漫',
    colors: {
      accentColor: '#A65B69',
      accentSoftColor: '#ECC3C9',
      bgColor: '#FCF5F6',
      bgSoftColor: '#F7EAEB',
      darkAccentColor: '#E8A2AE',
      darkAccentSoftColor: '#D18491',
      darkBgColor: '#1B1214',
      darkBgSoftColor: '#261A1D'
    }
  },
  {
    id: 'druid',
    name: '德鲁伊红',
    desc: '神秘赤红泥土',
    colors: {
      accentColor: '#8C3B32',
      accentSoftColor: '#D98A82',
      bgColor: '#F9F5F4',
      bgSoftColor: '#F1E6E4',
      darkAccentColor: '#E58E84',
      darkAccentSoftColor: '#C3766D',
      darkBgColor: '#1C1211',
      darkBgSoftColor: '#261A19'
    }
  },
  {
    id: 'camel',
    name: '旷野驼',
    desc: '落叶橡木温暖',
    colors: {
      accentColor: '#876445',
      accentSoftColor: '#CA9B7C',
      bgColor: '#F7F5F0',
      bgSoftColor: '#EFECE3',
      darkAccentColor: '#D9B48F',
      darkAccentSoftColor: '#B89370',
      darkBgColor: '#1A1612',
      darkBgSoftColor: '#251F1A'
    }
  }
]

const applyPreset = (preset: ThemePreset) => {
  theme.value.accentColor = preset.colors.accentColor
  theme.value.accentSoftColor = preset.colors.accentSoftColor
  theme.value.bgColor = preset.colors.bgColor
  theme.value.bgSoftColor = preset.colors.bgSoftColor
  theme.value.darkAccentColor = preset.colors.darkAccentColor
  theme.value.darkAccentSoftColor = preset.colors.darkAccentSoftColor
  theme.value.darkBgColor = preset.colors.darkBgColor
  theme.value.darkBgSoftColor = preset.colors.darkBgSoftColor
  message.success(`已应用“${preset.name}”主题配色，点击底部应用生效 ✨`)
}

const isCurrentPreset = (preset: ThemePreset) => {
  if (!theme.value.accentColor) return false
  return theme.value.accentColor.toLowerCase() === preset.colors.accentColor.toLowerCase() &&
         theme.value.accentSoftColor.toLowerCase() === preset.colors.accentSoftColor.toLowerCase() &&
         theme.value.bgColor.toLowerCase() === preset.colors.bgColor.toLowerCase() &&
         theme.value.bgSoftColor.toLowerCase() === preset.colors.bgSoftColor.toLowerCase() &&
         theme.value.darkAccentColor.toLowerCase() === preset.colors.darkAccentColor.toLowerCase() &&
         theme.value.darkAccentSoftColor.toLowerCase() === preset.colors.darkAccentSoftColor.toLowerCase() &&
         theme.value.darkBgColor.toLowerCase() === preset.colors.darkBgColor.toLowerCase() &&
         theme.value.darkBgSoftColor.toLowerCase() === preset.colors.darkBgSoftColor.toLowerCase()
}

onMounted(() => {
  fetchConfigs()
})
</script>
