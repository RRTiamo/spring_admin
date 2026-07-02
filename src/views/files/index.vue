<template>
  <div class="files-manager space-y-6">
    <!-- 顶部状态概览栏 -->
    <div class="border border-(--archive-border) rounded-2xl bg-(--archive-bg-card) p-6 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6 transition-all hover:shadow-md">
      <div class="flex items-start gap-4">
        <div class="h-12 w-12 rounded-2xl bg-(--archive-accent)/10 text-(--archive-accent) flex items-center justify-center shrink-0">
          <span class="i-mdi-folder-open-outline text-2xl animate-pulse"></span>
        </div>
        <div class="flex flex-col text-left">
          <h3 class="text-lg font-bold text-(--archive-text) tracking-wide">文件与附件管理</h3>
          <p class="text-xs text-(--archive-text)/60 mt-1 leading-relaxed max-w-192">
            统一检索和清理您在博客、照片墙或恋爱记录中上传的全部媒体资源。系统将根据您的当前存储配置，自动管理本地磁盘目录或云端服务。
          </p>
        </div>
      </div>
      
      <!-- 搜索过滤操作区 -->
      <div class="flex flex-wrap items-center gap-3 w-full lg:w-auto">
        <n-input
          v-model:value="searchQuery"
          placeholder="搜索文件名..."
          clearable
          class="archive-input min-w-50 lg:max-w-64"
        >
          <template #prefix>
            <span class="i-mdi-magnify tone-muted"></span>
          </template>
        </n-input>

        <n-select
          v-model:value="typeFilter"
          :options="typeOptions"
          class="min-w-36 lg:max-w-40"
        />

        <button
          class="px-4 py-2 text-xs font-semibold rounded-xl bg-(--archive-bg) border border-(--archive-border) text-(--archive-text) hover:bg-(--archive-border)/40 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
          @click="viewMode = viewMode === 'folder' ? 'flat' : 'folder'; page = 1;"
        >
          <span :class="viewMode === 'folder' ? 'i-mdi-format-list-bulleted' : 'i-mdi-folder-outline'"></span>
          <span>{{ viewMode === 'folder' ? '平铺视图' : '文件夹视图' }}</span>
        </button>

        <button
          class="px-4 py-2 text-xs font-semibold rounded-xl bg-(--archive-bg) border border-(--archive-border) text-(--archive-text) hover:bg-(--archive-border)/40 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
          @click="loadData"
        >
          <span class="i-mdi-refresh"></span>
          <span>刷新</span>
        </button>

        <button
          class="px-4 py-2 text-xs font-semibold rounded-xl bg-(--archive-accent) text-white hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer whitespace-nowrap"
          @click="goToConfig"
        >
          <span class="i-mdi-cog-outline"></span>
          <span>存储配置</span>
        </button>
      </div>
    </div>

    <!-- 路径面包屑导航 -->
    <div v-if="viewMode === 'folder'" class="border border-(--archive-border) rounded-2xl bg-(--archive-bg-card) px-5 py-3 shadow-sm flex items-center justify-between gap-4 transition-all hover:shadow-md">
      <div class="flex items-center gap-1.5 text-xs font-medium text-left">
        <span class="tone-muted flex items-center gap-1">
          <span class="i-mdi-home-outline text-sm"></span>
          当前位置:
        </span>
        <button
          class="px-2 py-0.5 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer border-none bg-transparent font-semibold"
          :class="currentDir === '' ? 'text-(--archive-accent)' : 'text-(--archive-text)'"
          @click="currentDir = ''; page = 1;"
        >
          根目录
        </button>

        <template v-for="(part, idx) in breadcrumbs" :key="idx">
          <span class="text-(--archive-text)/40">/</span>
          <button
            class="px-2 py-0.5 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer border-none bg-transparent font-semibold"
            :class="idx === breadcrumbs.length - 1 ? 'text-(--archive-accent)' : 'text-(--archive-text)'"
            @click="navigateToBreadcrumb(idx)"
          >
            {{ part }}
          </button>
        </template>
      </div>

      <div class="flex items-center gap-2">
        <n-button
          v-if="currentDir !== ''"
          size="tiny"
          secondary
          round
          @click="goBackDir"
        >
          <template #icon>
            <span class="i-mdi-arrow-up"></span>
          </template>
          返回上级
        </n-button>
      </div>
    </div>

    <!-- 统计指示面板 -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
      <!-- 存储介质卡片 -->
      <div class="border border-(--archive-border) rounded-2xl bg-(--archive-bg-card) p-5 flex items-center justify-between shadow-sm transition-all hover:shadow-md">
        <div class="flex items-center gap-3.5">
          <div class="h-11 w-11 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center shrink-0">
            <span class="i-mdi-database text-xl"></span>
          </div>
          <div class="flex flex-col text-left">
            <span class="text-xs tone-muted">存储驱动类型</span>
            <span class="text-sm font-bold text-(--archive-text) mt-0.5 uppercase">
              {{ storageInfo?.type || 'LOCAL (本地)' }}
            </span>
          </div>
        </div>
        <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/15 text-sky-600 border border-sky-500/20">
          {{ storageInfo?.type === 'local' ? '本地存储' : '云端存储' }}
        </span>
      </div>

      <!-- 文件空间详细参数 -->
      <div class="border border-(--archive-border) rounded-2xl bg-(--archive-bg-card) p-5 flex items-center justify-between shadow-sm transition-all hover:shadow-md">
        <div class="flex items-center gap-3.5">
          <div class="h-11 w-11 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
            <span class="i-mdi-server-network text-xl"></span>
          </div>
          <div class="flex flex-col text-left">
            <span class="text-xs tone-muted">工作空间 / 存储桶</span>
            <span class="text-sm font-bold text-(--archive-text) mt-0.5 truncate max-w-48" :title="getBucketTitle">
              {{ getBucketTitle }}
            </span>
          </div>
        </div>
      </div>

      <!-- 文件数量与占用容量总计 -->
      <div class="border border-(--archive-border) rounded-2xl bg-(--archive-bg-card) p-5 flex items-center justify-between shadow-sm transition-all hover:shadow-md">
        <div class="flex items-center gap-3.5">
          <div class="h-11 w-11 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
            <span class="i-mdi-chart-donut text-xl"></span>
          </div>
          <div class="flex flex-col text-left">
            <span class="text-xs tone-muted">统计 (全部 / 占用容量)</span>
            <span class="text-sm font-bold text-(--archive-text) mt-0.5">
              {{ filteredFiles.length }} 个文件 / {{ totalSizeFormatted }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 加载中 -->
    <div v-if="loading" class="flex justify-center items-center py-24">
      <n-spin size="large" />
    </div>

    <!-- 空白状态 -->
    <div v-else-if="filteredFiles.length === 0" class="border border-(--archive-border) rounded-2xl bg-(--archive-bg-card) p-16 text-center shadow-sm">
      <span class="i-mdi-image-remove-outline text-5xl tone-muted opacity-30 mb-3 block"></span>
      <p class="text-sm tone-muted">
        {{ searchQuery || typeFilter !== 'all' ? '未找到符合检索条件的文件' : '当前存储目录下未检测到任何已上传文件' }}
      </p>
    </div>

    <!-- 文件卡片网格列表 -->
    <div v-else class="space-y-6">
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
        <div
          v-for="item in paginatedItems"
          :key="item.isDir ? 'dir_' + item.path : 'file_' + item.fileName"
          class="border border-(--archive-border) rounded-2xl bg-(--archive-bg-card) p-3 flex flex-col group transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
          @click="handleItemClick(item)"
        >
          <!-- 文件夹卡片 -->
          <template v-if="item.isDir">
            <div class="relative w-full h-38 rounded-xl overflow-hidden bg-(--archive-accent)/5 flex flex-col items-center justify-center gap-2.5 shrink-0 transition-colors group-hover:bg-(--archive-accent)/10">
              <span class="i-mdi-folder text-5xl text-(--archive-accent) drop-shadow-sm transition-transform duration-300 group-hover:scale-105"></span>
              <span class="text-[10px] uppercase font-bold tracking-wider text-(--archive-accent)/80">
                文件夹
              </span>
            </div>

            <div class="mt-3 flex flex-col text-left grow">
              <span class="text-xs font-bold text-(--archive-text) truncate" :title="item.name">
                {{ item.name }}
              </span>
              <div class="flex items-center justify-between mt-2.5">
                <span class="text-[10px] px-1.5 py-0.5 rounded font-medium bg-(--archive-accent)/10 text-(--archive-accent)">
                  {{ item.childCount }} 个文件
                </span>
                <span class="text-[10px] tone-muted">
                  目录
                </span>
              </div>
            </div>
          </template>

          <!-- 文件卡片 -->
          <template v-else>
            <!-- 预览图/占位图 -->
            <div class="relative w-full h-38 rounded-xl overflow-hidden bg-white/2 dark:bg-white/5 shrink-0">
              <template v-if="isImage(item.fileName)">
                <n-image
                  :src="item.url"
                  class="w-full h-full"
                  :img-props="{ class: 'w-full h-full object-cover transition-transform duration-500 group-hover:scale-103' }"
                  show-toolbar-tooltip
                  fallback-src="/life-assets/placeholder.jpg"
                />
              </template>
              <template v-else>
                <div class="w-full h-full flex flex-col items-center justify-center gap-2 text-(--archive-text)/40 bg-black/5 dark:bg-white/5">
                  <span :class="getFileIcon(item.fileName)" class="text-4xl"></span>
                  <span class="text-[10px] uppercase font-bold tracking-wider opacity-60">
                    {{ getFileExt(item.fileName) }} 文件
                  </span>
                </div>
              </template>

              <!-- 悬浮操作层 (阻止冒泡防误触) -->
              <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3" @click.stop>
                <n-tooltip trigger="hover">
                  <template #trigger>
                    <button
                      class="h-9 w-9 rounded-full bg-white text-gray-800 flex items-center justify-center hover:bg-(--archive-accent) hover:text-white active:scale-95 transition-all shadow cursor-pointer border-none"
                      @click="copyUrl(item.url)"
                    >
                      <span class="i-mdi-content-copy text-base"></span>
                    </button>
                  </template>
                  复制链接
                </n-tooltip>

                <n-tooltip trigger="hover">
                  <template #trigger>
                    <button
                      class="h-9 w-9 rounded-full bg-white text-red-600 flex items-center justify-center hover:bg-red-600 hover:text-white active:scale-95 transition-all shadow cursor-pointer border-none"
                      @click="handleDelete(item)"
                    >
                      <span class="i-mdi-trash-can-outline text-base"></span>
                    </button>
                  </template>
                  删除文件
                </n-tooltip>
              </div>
            </div>

            <!-- 详细信息区 -->
            <div class="mt-3 flex flex-col text-left grow">
              <span
                class="text-xs font-bold text-(--archive-text) truncate"
                :title="item.fileName"
              >
                {{ item.name }}
              </span>
              <div class="flex items-center justify-between mt-2.5">
                <span class="text-[10px] px-1.5 py-0.5 rounded font-medium bg-black/5 dark:bg-white/10 tone-muted">
                  {{ formatBytes(item.size) }}
                </span>
                <span class="text-[10px] tone-muted">
                  {{ formatTime(item.updateTime) }}
                </span>
              </div>
            </div>
          </template>
        </div>
      </div>

      <!-- 分页组件 -->
      <div class="flex justify-center mt-6">
        <n-pagination
          v-model:page="page"
          v-model:page-size="pageSize"
          :item-count="totalItemsCount"
          :page-sizes="[10, 20, 30, 40, 50]"
          show-size-picker
          class="archive-pagination"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { NInput, NSelect, NSpin, NImage, NTooltip, NPagination, useDialog, useMessage } from 'naive-ui'
import { getStorageType, getFileList, deleteFile } from '@/api/files'
import type { StorageInfo, FileItem } from '@/interface/files'

const router = useRouter()
const message = useMessage()
const dialog = useDialog()

// 状态参数
const loading = ref(false)
const storageInfo = ref<StorageInfo | null>(null)
const files = ref<FileItem[]>([])
const searchQuery = ref('')
const typeFilter = ref('all')

// 视图与路径参数
const viewMode = ref<'folder' | 'flat'>('folder')
const currentDir = ref('')

// 分页状态
const page = ref(1)
const pageSize = ref(10)

const typeOptions = [
  { label: '📂 全部文件', value: 'all' },
  { label: '🖼️ 图片文件', value: 'image' },
  { label: '📄 其它附件', value: 'other' }
]

// 检索或分类变化时，重置分页到第一页
watch([searchQuery, typeFilter, pageSize], () => {
  page.value = 1
})

// 当用户输入搜索内容时，自动切换为“平铺视图”，以方便全局快速检索文件
watch(searchQuery, (newVal) => {
  if (newVal.trim()) {
    viewMode.value = 'flat'
  }
})

// 计算属性：当前工作空间/桶名标题
const getBucketTitle = computed(() => {
  if (!storageInfo.value) return 'uploads'
  const info = storageInfo.value
  if (info.type === 'qiniu') return info.bucketName || '未命名桶 (Qiniu)'
  if (info.type === 'minio') return info.bucketName || '未命名桶 (MinIO)'
  return 'uploads/ (本地文件夹)'
})

// 计算属性：路径面包屑片段
const breadcrumbs = computed(() => {
  if (!currentDir.value) return []
  return currentDir.value.split('/')
})

// 文件过滤列表 (搜索与类型)
const filteredFiles = computed(() => {
  let list = files.value

  // 1. 类型过滤
  if (typeFilter.value === 'image') {
    list = list.filter(item => isImage(item.fileName))
  } else if (typeFilter.value === 'other') {
    list = list.filter(item => !isImage(item.fileName))
  }

  // 2. 搜索框模糊过滤
  const q = searchQuery.value.trim().toLowerCase()
  if (q) {
    list = list.filter(item => item.fileName.toLowerCase().includes(q))
  }

  return list
})

interface FolderItem {
  isDir: true
  name: string
  path: string
  childCount: number
}

interface FileItemWrap {
  isDir: false
  fileName: string
  name: string
  url: string
  size: number
  updateTime: number
  storageType: string
}

type DisplayItem = FolderItem | FileItemWrap

// 计算属性：当前文件夹下的所有子文件夹与文件集合 (虚拟文件树解析)
const currentItems = computed<DisplayItem[]>(() => {
  const list = filteredFiles.value
  const foldersMap = new Map<string, { path: string; files: any[] }>()
  const filesList: FileItemWrap[] = []

  const currentPrefix = currentDir.value ? (currentDir.value.endsWith('/') ? currentDir.value : currentDir.value + '/') : ''

  list.forEach(item => {
    const name = item.fileName
    if (currentPrefix && !name.startsWith(currentPrefix)) {
      return
    }

    const relative = currentPrefix ? name.substring(currentPrefix.length) : name

    if (relative.includes('/')) {
      const dirName = relative.split('/')[0]
      const fullSubDirPath = currentPrefix + dirName

      if (!foldersMap.has(dirName)) {
        foldersMap.set(dirName, { path: fullSubDirPath, files: [] })
      }
      foldersMap.get(dirName)!.files.push(item)
    } else {
      filesList.push({
        isDir: false,
        fileName: item.fileName,
        name: relative,
        url: item.url,
        size: item.size,
        updateTime: item.updateTime,
        storageType: item.storageType
      })
    }
  })

  // 转换为展示用文件夹对象列表
  const displayFolders: FolderItem[] = Array.from(foldersMap.entries()).map(([name, val]) => ({
    isDir: true,
    name,
    path: val.path,
    childCount: val.files.length
  }))

  // 文件夹按拼音/字母排序在前，文件保持更新时间倒序在后
  return [
    ...displayFolders.sort((a, b) => a.name.localeCompare(b.name)),
    ...filesList
  ]
})

// 分页切片数据源
const paginatedItems = computed(() => {
  const start = (page.value - 1) * pageSize.value
  const end = start + pageSize.value

  if (viewMode.value === 'flat') {
    return filteredFiles.value.map(item => ({
      isDir: false as const,
      fileName: item.fileName,
      name: getFileNameOnly(item.fileName),
      url: item.url,
      size: item.size,
      updateTime: item.updateTime,
      storageType: item.storageType
    })).slice(start, end)
  } else {
    return currentItems.value.slice(start, end)
  }
})

// 分页所用总项数
const totalItemsCount = computed(() => {
  return viewMode.value === 'flat' ? filteredFiles.value.length : currentItems.value.length
})

// 总文件占用容量格式化
const totalSizeFormatted = computed(() => {
  const sumBytes = filteredFiles.value.reduce((acc, cur) => acc + (cur.size || 0), 0)
  return formatBytes(sumBytes)
})

// 点击网格卡片的回调
const handleItemClick = (item: DisplayItem) => {
  if (item.isDir) {
    currentDir.value = item.path
    page.value = 1
  }
}

// 导航到指定面包屑层级
const navigateToBreadcrumb = (index: number) => {
  const parts = currentDir.value.split('/')
  currentDir.value = parts.slice(0, index + 1).join('/')
  page.value = 1
}

// 返回上一级文件夹
const goBackDir = () => {
  const parts = currentDir.value.split('/')
  if (parts.length <= 1) {
    currentDir.value = ''
  } else {
    currentDir.value = parts.slice(0, -1).join('/')
  }
  page.value = 1
}

// 加载后台数据
const loadData = async () => {
  loading.value = true
  try {
    // 1. 获取存储介质配置
    const typeRes = await getStorageType()
    if (typeRes.data?.code === 200) {
      storageInfo.value = typeRes.data.data
    }

    // 2. 获取上传文件列表
    const listRes = await getFileList()
    if (listRes.data?.code === 200) {
      files.value = listRes.data.data || []
    } else {
      throw new Error(listRes.data?.msg || '获取文件列表出错')
    }
  } catch (err: any) {
    console.error('加载文件数据失败:', err)
    message.error(err.message || '加载存储文件信息失败，请检查网络或服务状态')
  } finally {
    loading.value = false
  }
}

// 拷贝 URL
const copyUrl = async (url: string) => {
  try {
    await navigator.clipboard.writeText(url)
    message.success('已成功复制链接到剪贴板 📋')
  } catch (err) {
    console.error('复制链接失败:', err)
    message.error('复制失败，请手动拷贝')
  }
}

// 删除文件操作
const handleDelete = (item: any) => {
  dialog.warning({
    title: '强物理删除确认',
    content: `您确定要彻底删除文件「${getFileNameOnly(item.fileName)}」吗？该删除行为将在存储中进行物理擦除，不可撤销。已在博客内容中引用该文件的链接将会失效。`,
    positiveText: '确定物理删除',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        const response = await deleteFile(item.fileName)
        if (response.data?.code === 200) {
          message.success('文件物理删除成功 🗑️')
          await loadData()
        } else {
          throw new Error(response.data?.msg || '删除失败')
        }
      } catch (err: any) {
        console.error('删除文件失败:', err)
        message.error(err.message || '删除文件失败，请检查服务状态')
      }
    }
  })
}

// 跳转到配置界面
const goToConfig = () => {
  router.push({ name: 'Config' })
}

// 辅助方法：判断文件是否是图片
function isImage(fileName: string): boolean {
  if (!fileName) return false
  const ext = getFileExt(fileName)
  return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico'].includes(ext)
}

// 辅助方法：获取文件后缀名 (不带点且小写)
function getFileExt(fileName: string): string {
  if (!fileName || !fileName.includes('.')) return ''
  return fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase()
}

// 辅助方法：仅展示真实文件名（如果是云存储带目录前缀的，剔除前缀）
function getFileNameOnly(fileName: string): string {
  if (!fileName) return ''
  if (fileName.includes('/')) {
    return fileName.substring(fileName.lastIndexOf('/') + 1)
  }
  return fileName
}

// 辅助方法：根据扩展名返回代表 icon
function getFileIcon(fileName: string): string {
  const ext = getFileExt(fileName)
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return 'i-mdi-zip-box-outline'
  if (['mp3', 'wav', 'ogg', 'flac'].includes(ext)) return 'i-mdi-music-box-outline'
  if (['mp4', 'mkv', 'avi', 'mov', 'webm'].includes(ext)) return 'i-mdi-video-box'
  if (['pdf'].includes(ext)) return 'i-mdi-file-pdf-box'
  if (['doc', 'docx', 'txt', 'md'].includes(ext)) return 'i-mdi-file-document-outline'
  return 'i-mdi-file-outline'
}

// 辅助方法：格式化字节大小
function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

// 辅助方法：格式化毫秒修改时间为 YYYY-MM-DD HH:mm
function formatTime(timestamp: number): string {
  if (!timestamp) return '-'
  const date = new Date(timestamp)
  const pad = (num: number) => String(num).padStart(2, '0')
  const y = date.getFullYear()
  const m = pad(date.getMonth() + 1)
  const d = pad(date.getDate())
  const hh = pad(date.getHours())
  const mm = pad(date.getMinutes())
  return `${y}-${m}-${d} ${hh}:${mm}`
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
/* 遵循 CSS 变量简写语法，不出现硬编码 [var(...)] */
.files-manager {
  color: var(--archive-text);
}
</style>
