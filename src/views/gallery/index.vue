<template>
  <div ref="galleryDeskRef" class="flex flex-col gap-4 overflow-hidden">
    <!-- 列表视图 -->
    <div v-if="!showEditor" class="list-view-anim flex flex-col gap-4">
      <!-- 头部检索与操作栏 -->
      <section class="archive-card p-4 sm:p-5">
        <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div class="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center">
            <n-input
              v-model:value="searchQuery"
              clearable
              placeholder="搜索照片标题、相机、胶卷或拍摄地"
              class="w-full sm:max-w-[420px]"
            >
              <template #prefix>
                <span class="i-mdi-magnify tone-faint text-lg"></span>
              </template>
            </n-input>

            <span class="status-chip w-fit" :style="{ color: statusColor }">
              <span :class="statusIcon"></span>
              {{ statusText }}
            </span>
          </div>

          <n-button type="primary" class="w-full sm:w-auto" @click="openCreate">
            <template #icon>
              <span class="i-mdi-plus"></span>
            </template>
            新增影像
          </n-button>
        </div>
      </section>



      <!-- 骨架屏加载状态 -->
      <section v-if="loading" class="grid gap-3">
        <div v-for="index in 2" :key="index" class="archive-card p-5">
          <div class="flex gap-4">
            <div class="skeleton-block h-24 w-28 shrink-0 rounded-[18px]"></div>
            <div class="min-w-0 flex-1">
              <div class="skeleton-line h-4 w-36 rounded-full"></div>
              <div class="skeleton-line mt-4 h-5 w-3/5 rounded-full"></div>
            </div>
          </div>
        </div>
      </section>

      <!-- 空列表状态 -->
      <section v-else-if="filteredPhotos.length === 0" class="archive-card p-10 text-center">
        <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-[22px] bg-[color-mix(in_srgb,var(--archive-accent)_14%,transparent)] text-(--archive-accent)">
          <span class="i-mdi-image-off-outline text-2xl"></span>
        </div>
        <h2 class="m-0 mt-5 text-xl font-760 text-(--archive-text)">无影像记录</h2>
        <p class="mx-auto m-0 mt-2 max-w-md text-sm leading-6 tone-muted">
          用镜头捕捉第一缕阳光，添加你的第一张照片。
        </p>
        <n-button type="primary" class="mt-5" @click="openCreate">添加照片</n-button>
      </section>

      <!-- 照片表格与网格布局 -->
      <GalleryGrid
        v-else
        v-model:currentPage="currentPage"
        v-model:pageSize="pageSize"
        :paginated-photos="paginatedPhotos"
        :filtered-photos="filteredPhotos"
        @edit="openEdit"
        @delete="handleDelete"
      />
    </div>

    <!-- 页内全屏编辑/写作视图 -->
    <PhotoForm
      v-else
      v-model:formModel="formModel"
      :is-edit="isEdit"
      :submitting="submitting"
      :type-options="typeOptions"
      :footprint-type-options="footprintTypeOptions"
      :form-rules="formRules"
      :upload-headers="uploadHeaders"
      @close="closeEditor"
      @save="handleSave"
      @gps="getDeviceLocation"
      @open-map="openMapSelect"
    />

    <!-- OSM 地图选点弹窗 -->
    <MapSelectModal
      v-model:showMapModal="showMapModal"
      :longitude="formModel.longitude"
      :latitude="formModel.latitude"
      @confirm="handleConfirmMapSelect"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useMessage, useDialog, NInput, NButton } from 'naive-ui'
import { getGalleryList, createGallery, updateGallery, deleteGallery, getFootprintCategoryList } from '@/api/gallery'
import gsap from 'gsap'
import type { GalleryPhoto } from '@/interface/love'

// 导入子组件
import GalleryGrid from './components/GalleryGrid.vue'
import PhotoForm from './components/PhotoForm.vue'
import MapSelectModal from './components/MapSelectModal.vue'

const message = useMessage()
const dialog = useDialog()
const galleryDeskRef = ref<HTMLElement | null>(null)

const photos = ref<GalleryPhoto[]>([])
const loading = ref(false)
const searchQuery = ref('')
const backendMode = ref<'db' | 'error'>('db')

const showEditor = ref(false)
const isEdit = ref(false)
const submitting = ref(false)
let gsapCtx: gsap.Context | null = null

const currentPage = ref(1)
const pageSize = ref(12)

const footprintCategories = ref<any[]>([])

const formModel = ref({
  id: 0,
  slug: '',
  title: '',
  dateTimestamp: Date.now(),
  camera: '',
  lens: '',
  filmStock: '',
  settings: '',
  location: '',
  src: '',
  description: '',
  type: 'image',
  longitude: null as number | null,
  latitude: null as number | null,
  footprintType: 'photo'
})

const formRules = {
  title: { required: true, message: '请输入影像标题', trigger: 'blur' },
  src: { required: true, message: '请填充媒体 URL 资源路径', trigger: 'blur' }
}

const typeOptions = [
  { label: '图片影像 (Image)', value: 'image' },
  { label: '短片影像 (Video)', value: 'video' }
]

const footprintTypeOptions = computed(() => {
  return footprintCategories.value.map((cat) => ({
    label: cat.name,
    value: cat.code
  }))
})

const statusColor = computed(() => {
  if (backendMode.value === 'db') return 'var(--archive-success)'
  return 'var(--archive-danger)'
})

const statusIcon = computed(() => {
  if (backendMode.value === 'db') return 'i-mdi-check-circle'
  return 'i-mdi-alert-circle'
})

const statusText = computed(() => {
  if (backendMode.value === 'db') return 'API 服务器在线'
  return 'API 连接失败'
})

// 地图选点状态
const showMapModal = ref(false)

const uploadHeaders = computed(() => ({
  satoken: localStorage.getItem('satoken') || ''
}))

// 检索过滤
const filteredPhotos = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return photos.value
  return photos.value.filter((p) =>
    p.title.toLowerCase().includes(query) ||
    p.camera?.toLowerCase().includes(query) ||
    p.filmStock?.toLowerCase().includes(query) ||
    p.location?.toLowerCase().includes(query)
  )
})

const paginatedPhotos = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredPhotos.value.slice(start, end)
})

const fetchPhotos = async () => {
  loading.value = true
  try {
    const response = await getGalleryList()
    if (response.data?.code === 200) {
      photos.value = response.data.data
      backendMode.value = 'db'
    } else {
      throw new Error(response.data?.msg || 'API return not 200')
    }
  } catch (err: any) {
    console.error('Failed to load gallery photos', err)
    backendMode.value = 'error'
    message.error(err.message || '加载照片墙数据失败，请检查网络或服务状态')
  } finally {
    loading.value = false
    animateList()
  }
}

const animateList = () => {
  if (!galleryDeskRef.value) return
  requestAnimationFrame(() => {
    gsap.fromTo(
      '.photo-card',
      { opacity: 0, scale: 0.95, y: 15 },
      { opacity: 1, scale: 1, y: 0, duration: 0.4, stagger: 0.08, ease: 'power2.out', overwrite: 'auto' }
    )
  })
}

const openCreate = () => {
  isEdit.value = false
  formModel.value = {
    id: 0,
    slug: '',
    title: '',
    dateTimestamp: Date.now(),
    camera: '',
    lens: '',
    filmStock: '',
    settings: '',
    location: '',
    src: '',
    description: '',
    type: 'image',
    longitude: null,
    latitude: null,
    footprintType: 'photo'
  }
  showEditor.value = true
}

const openEdit = (photo: GalleryPhoto) => {
  isEdit.value = true
  formModel.value = {
    id: photo.id,
    slug: photo.slug,
    title: photo.title,
    dateTimestamp: photo.date ? new Date(photo.date).getTime() : Date.now(),
    camera: photo.camera,
    lens: photo.lens,
    filmStock: photo.filmStock,
    settings: photo.settings,
    location: photo.location,
    src: photo.src,
    description: photo.description,
    type: photo.type,
    longitude: photo.longitude ? Number(photo.longitude) : null,
    latitude: photo.latitude ? Number(photo.latitude) : null,
    footprintType: photo.footprintType || 'photo'
  }
  showEditor.value = true
}

const closeEditor = () => {
  showEditor.value = false
  animateList()
}

// 地图定位相关
const openMapSelect = () => {
  showMapModal.value = true
}

const handleConfirmMapSelect = (data: { longitude: number; latitude: number; address: string }) => {
  formModel.value.longitude = data.longitude
  formModel.value.latitude = data.latitude
  if (data.address) {
    formModel.value.location = data.address
  }
  message.success('已成功应用选择的地理坐标与地址 📍')
}

const getDeviceLocation = () => {
  if (!navigator.geolocation) {
    message.warning('当前浏览器不支持获取地理位置')
    return
  }
  message.loading('正在获取当前 GPS 位置...')
  navigator.geolocation.getCurrentPosition(
    (position) => {
      formModel.value.latitude = Number(position.coords.latitude.toFixed(6))
      formModel.value.longitude = Number(position.coords.longitude.toFixed(6))
      message.success('已成功获取并填充当前设备 GPS 坐标 📍')
    },
    (err) => {
      console.warn('Geolocation error', err)
      message.error('定位获取失败，请确认是否允许定位权限或手动选择 ⚠️')
    },
    { timeout: 8000 }
  )
}

const handleSave = async () => {
  submitting.value = true
  const formattedDate = new Date(formModel.value.dateTimestamp).toISOString().replace('Z', '')
  const payload = {
    ...formModel.value,
    date: formattedDate
  }

  try {
    if (isEdit.value) {
      const response = await updateGallery(payload)
      if (response.data?.code === 200) {
        message.success('更新成功')
        await fetchPhotos()
      } else {
        throw new Error(response.data?.msg || '更新失败')
      }
    } else {
      const response = await createGallery(payload)
      if (response.data?.code === 200) {
        message.success('影像已添加')
        await fetchPhotos()
      } else {
        throw new Error(response.data?.msg || '保存失败')
      }
    }
  } catch (err: any) {
    console.error('Save gallery photo failed', err)
    message.error(err.message || '保存失败，请检查网络或后端服务状态')
  } finally {
    submitting.value = false
    showEditor.value = false
    animateList()
  }
}

const handleDelete = (id: number) => {
  dialog.warning({
    title: '确认删除',
    content: '删除此影像记录后将无法恢复，确认删除吗？',
    positiveText: '删除',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        const response = await deleteGallery(id)
        if (response.data?.code === 200) {
          message.success('影像已删除')
          await fetchPhotos()
        } else {
          throw new Error(response.data?.msg || '删除失败')
        }
      } catch (err: any) {
        console.error('Delete gallery photo failed', err)
        message.error(err.message || '影像删除失败，请检查网络或后端接口服务')
      }
    }
  })
}

const fetchFootprintCategories = async () => {
  try {
    const response = await getFootprintCategoryList()
    if (response.data?.code === 200) {
      footprintCategories.value = response.data.data
    } else {
      throw new Error(response.data?.msg || 'Failed to load footprint categories')
    }
  } catch (e) {
    console.error('Failed to fetch footprint categories', e)
  }
}

watch(showEditor, (newVal) => {
  nextTick(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !galleryDeskRef.value) return
    gsapCtx?.revert()
    gsapCtx = gsap.context(() => {
      if (newVal) {
        gsap.from('.editor-view-anim', {
          y: 20,
          opacity: 0,
          duration: 0.45,
          ease: 'power2.out',
          overwrite: 'auto'
        })
      } else {
        gsap.from('.photo-card', {
          y: 15,
          opacity: 0,
          duration: 0.4,
          stagger: 0.08,
          ease: 'power2.out',
          overwrite: 'auto'
        })
      }
    }, galleryDeskRef.value)
  })
})

onMounted(() => {
  fetchPhotos()
  fetchFootprintCategories()
})

onUnmounted(() => {
  gsapCtx?.revert()
})
</script>
