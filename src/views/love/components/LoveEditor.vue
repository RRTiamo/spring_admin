<template>
  <div class="editor-view-anim archive-card p-5 sm:p-7 flex flex-col gap-5">
    <div class="flex items-center justify-between border-b border-(--archive-border)/50 pb-4 mb-1">
      <div class="flex items-center gap-3">
        <n-button secondary size="small" @click="emit('close')">
          <template #icon><span class="i-mdi-arrow-left"></span></template>
          返回列表
        </n-button>
        <h2 class="m-0 text-xl font-760 text-(--archive-text)">
          {{ isEdit ? (formType === 'moment' ? '编辑甜蜜瞬间' : (formType === 'diary' ? '编辑恋爱日记' : '编辑纪念事件')) : (formType === 'moment' ? '记录新瞬间' : (formType === 'diary' ? '记录新日记' : '新建纪念事件')) }}
        </h2>
      </div>
    </div>

    <!-- 温馨提醒 -->
    <div v-if="formType === 'moment'" class="soft-panel p-3.5 flex items-start gap-3 bg-amber-500/5 border border-amber-500/10 rounded-2xl">
      <span class="i-mdi-camera tone-accent mt-0.5 text-lg"></span>
      <div>
        <p class="m-0 text-xs font-700 text-(--archive-text)">甜蜜瞬间记录贴士</p>
        <p class="m-0 mt-0.5 text-[11px] leading-relaxed tone-muted">甜蜜瞬间会以<b>拍立得照片墙</b>形式呈现，建议重点上传或填入一张精美的<b>封面图片路径</b>。</p>
      </div>
    </div>

    <div v-if="formType === 'diary'" class="soft-panel p-3.5 flex items-start gap-3 bg-pink-500/5 border border-pink-500/10 rounded-2xl">
      <span class="i-mdi-book-open-page-variant tone-accent mt-0.5 text-lg"></span>
      <div>
        <p class="m-0 text-xs font-700 text-(--archive-text)">恋爱日记记录贴士</p>
        <p class="m-0 mt-0.5 text-[11px] leading-relaxed tone-muted">日记更侧重文字的温度，请详细记录那些暖心的大声欢笑、一起下厨或是漫步雨中的故事。</p>
      </div>
    </div>

    <n-form ref="formRef" :model="formModel" :rules="formRules" label-placement="top">
      <div class="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <n-form-item :label="formType === 'moment' ? '瞬间主题' : (formType === 'diary' ? '日记标题' : '事件名称')" path="title">
          <n-input v-model:value="formModel.title" :placeholder="formType === 'moment' ? '如：三周年从日落到星空' : (formType === 'diary' ? '如：厨房里的灾难与大笑' : '如：去西岸美术馆漫步')" />
        </n-form-item>
        <n-form-item label="唯一 Slug (留空将自动生成)" path="slug">
          <n-input v-model:value="formModel.slug" placeholder="如: anniversary-3years" />
        </n-form-item>
        <n-form-item label="足迹类别" path="footprintType">
          <n-select v-model:value="formModel.footprintType" :options="footprintTypeOptions" />
        </n-form-item>
      </div>

      <div class="grid gap-4 grid-cols-1 sm:grid-cols-4">
        <n-form-item label="记录日期/时间" path="dateTimestamp">
          <n-date-picker v-model:value="formModel.dateTimestamp" type="datetime" placeholder="选择记录发生的时间" class="w-full" />
        </n-form-item>
        <n-form-item label="发生地点" path="location">
          <div class="flex gap-2 w-full">
            <n-input v-model:value="formModel.location" placeholder="如：阿那亚" class="flex-1" />
            <n-button secondary @click="openMapSelect"><template #icon><span class="i-mdi-map-marker-radius-outline"></span></template>选点</n-button>
            <n-button secondary @click="getDeviceLocation"><template #icon><span class="i-mdi-crosshairs-gps"></span></template>GPS</n-button>
          </div>
        </n-form-item>
        <n-form-item label="经度 (Longitude)" path="longitude">
          <n-input-number v-model:value="formModel.longitude" placeholder="如: 119.8660" :show-button="false" class="w-full" clearable />
        </n-form-item>
        <n-form-item label="纬度 (Latitude)" path="latitude">
          <n-input-number v-model:value="formModel.latitude" placeholder="如: 39.7342" :show-button="false" class="w-full" clearable />
        </n-form-item>
        <n-form-item label="写作心情 (Mood)" path="mood">
          <n-select v-model:value="formModel.mood" :options="moodOptions" />
        </n-form-item>
        <n-form-item label="可见性权限" path="visibility">
          <n-select v-model:value="formModel.visibility" :options="visibilityOptions" />
        </n-form-item>
      </div>

      <n-form-item :label="formType === 'moment' ? '瞬间封面图片路径 (拍立得正面图)' : '封面图片路径 (选填)'" path="cover">
        <div class="flex items-center gap-4 w-full">
          <div class="relative w-28 h-16 rounded-xl overflow-hidden border border-(--archive-border)/40 bg-black/5 shrink-0 flex items-center justify-center">
            <img v-if="formModel.cover" :src="formModel.cover" class="w-full h-full object-cover" />
            <span v-else class="i-mdi-image-outline text-2xl tone-faint"></span>
          </div>
          <n-input v-model:value="formModel.cover" placeholder="如：/assets/love-anniversary.png" class="flex-1" />
        </div>
      </n-form-item>

      <n-form-item :label="formType === 'diary' ? '日记详细正文' : '详情/事件描述'" path="content">
        <n-input v-model:value="formModel.content" type="textarea" :rows="10" :placeholder="formType === 'diary' ? '今天发生了什么难忘的事？在这里慢慢记录，写下故事细节...' : '在这里简要写下当时的感触或事件记录...'" />
      </n-form-item>

      <div class="flex justify-end gap-3 border-t border-(--archive-border)/40 pt-4 mt-2">
        <n-button secondary @click="emit('close')">取消</n-button>
        <n-button type="primary" :loading="submitting" @click="handleSave">
          <template #icon><span class="i-mdi-content-save-outline"></span></template>
          保存记录
        </n-button>
      </div>
    </n-form>

    <!-- 地图选点弹窗 -->
    <n-modal
      v-model:show="showMapModal"
      preset="card"
      title="选择发生地点坐标 (OSM 地图)"
      class="w-[90vw] max-w-[640px]"
      @after-enter="initMap"
      @after-leave="destroyMap"
    >
      <div class="mb-3 flex gap-2">
        <n-input v-model:value="searchAddress" placeholder="输入城市或地名快速检索定位，如：南京、杭州、阿那亚" size="small" @keyup.enter="searchLocation" />
        <n-button type="primary" size="small" :loading="searching" @click="searchLocation">搜索定位</n-button>
      </div>
      <div id="love-select-map" class="h-[400px] w-full rounded-xl overflow-hidden border border-(--archive-border) z-50"></div>
      <template #footer>
        <div class="flex items-center justify-between text-xs tone-muted">
          <span>当前已选：经度 {{ tempLongitude || '未选择' }}, 纬度 {{ tempLatitude || '未选择' }}</span>
          <div class="flex gap-2">
            <n-button size="small" @click="showMapModal = false">取消</n-button>
            <n-button size="small" type="primary" :disabled="tempLongitude === null" @click="confirmMapSelect">确认选择</n-button>
          </div>
        </div>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useMessage, NInput, NButton, NForm, NFormItem, NSelect, NDatePicker, NInputNumber, NModal } from 'naive-ui'
import { createLove, updateLove } from '@/api/love'
import { getFootprintCategoryList } from '@/api/gallery'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { FootprintCategory } from '@/interface/love'

const props = defineProps<{
  model: any
  isEdit: boolean
  formType: 'moment' | 'diary' | 'event'
}>()

const emit = defineEmits(['close', 'save'])

const message = useMessage()
const formRef = ref<any>(null)
const submitting = ref(false)

const formModel = ref({ ...props.model })

const footprintCategories = ref<FootprintCategory[]>([])

const footprintTypeOptions = computed(() => {
  return footprintCategories.value.map(cat => ({
    label: `${cat.name} (${cat.code})`,
    value: cat.code
  }))
})

const moodOptions = [
  { label: '浪漫 (Romantic)', value: 'romantic' },
  { label: '俏皮 (Playful)', value: 'playful' },
  { label: '安宁 (Peaceful)', value: 'peaceful' },
  { label: '安静 (Quiet)', value: 'quiet' },
  { label: '开心 (Happy)', value: 'happy' },
  { label: '欣喜 (Joyful)', value: 'joyful' }
]

const visibilityOptions = [
  { label: '完全公开 (Public)', value: 'public' },
  { label: '口令隐藏 (Hidden)', value: 'hidden' },
  { label: '绝对私密 (Private)', value: 'private' }
]

const formRules = {
  title: { required: true, message: '请填写记录主题/标题', trigger: 'blur' }
}

// 地图定位相关状态
const showMapModal = ref(false)
const tempLongitude = ref<number | null>(null)
const tempLatitude = ref<number | null>(null)
const searchAddress = ref('')
const tempAddressName = ref('')
const searching = ref(false)
let leafletMap: L.Map | null = null
let marker: L.Marker | null = null

const fetchFootprintCategories = async () => {
  try {
    const response = await getFootprintCategoryList()
    if (response.data?.data) {
      footprintCategories.value = response.data.data
    }
  } catch (err) {
    console.error('Failed to fetch categories in editor', err)
  }
}

const openMapSelect = () => {
  tempLongitude.value = formModel.value.longitude ? Number(formModel.value.longitude) : null
  tempLatitude.value = formModel.value.latitude ? Number(formModel.value.latitude) : null
  searchAddress.value = ''
  tempAddressName.value = ''
  showMapModal.value = true
}

const initMap = () => {
  const centerLat = tempLatitude.value ? Number(tempLatitude.value) : 31.2304
  const centerLng = tempLongitude.value ? Number(tempLongitude.value) : 121.4737
  const zoom = tempLongitude.value ? 13 : 8
  const defaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41]
  })
  
  leafletMap = L.map('love-select-map').setView([centerLat, centerLng], zoom)
  L.tileLayer('https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}', {
    subdomains: ['1', '2', '3', '4'],
    maxZoom: 18,
    attribution: '© AutoNavi Gaode Map'
  }).addTo(leafletMap)

  if (tempLatitude.value !== null && tempLongitude.value !== null) {
    const latNum = Number(tempLatitude.value)
    const lngNum = Number(tempLongitude.value)
    marker = L.marker([latNum, lngNum], { icon: defaultIcon }).addTo(leafletMap)
  }

  leafletMap.on('click', async (e: L.LeafletMouseEvent) => {
    const { lat, lng } = e.latlng
    tempLatitude.value = Number(lat.toFixed(6))
    tempLongitude.value = Number(lng.toFixed(6))
    if (marker) {
      marker.setLatLng(e.latlng)
    } else {
      marker = L.marker(e.latlng, { icon: defaultIcon }).addTo(leafletMap!)
    }
    
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=zh-CN`)
      const data = await res.json()
      if (data) {
        tempAddressName.value = data.name || data.display_name.split(',')[0] || ''
      }
    } catch (err) {
      console.warn('Reverse geocoding failed:', err)
    }
  })
}

const destroyMap = () => {
  if (leafletMap) {
    leafletMap.remove()
    leafletMap = null
  }
  marker = null
}

const confirmMapSelect = () => {
  formModel.value.longitude = tempLongitude.value ? Number(tempLongitude.value) : null
  formModel.value.latitude = tempLatitude.value ? Number(tempLatitude.value) : null
  if (tempAddressName.value) {
    formModel.value.location = tempAddressName.value
  }
  showMapModal.value = false
  message.success('已应用选择的地理坐标与地址 📍')
}

const searchLocation = async () => {
  if (!searchAddress.value.trim()) {
    message.warning('请输入搜索地址')
    return
  }
  searching.value = true
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchAddress.value)}&format=json&limit=1`)
    const data = await response.json()
    if (data && data.length > 0) {
      const result = data[0]
      const lat = Number(result.lat)
      const lng = Number(result.lon)
      tempLatitude.value = Number(lat.toFixed(6))
      tempLongitude.value = Number(lng.toFixed(6))
      tempAddressName.value = result.name || result.display_name.split(',')[0] || searchAddress.value.trim()
      
      if (leafletMap) {
        leafletMap.setView([lat, lng], 13)
        const defaultIcon = L.icon({
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41]
        })
        if (marker) {
          marker.setLatLng([lat, lng])
        } else {
          marker = L.marker([lat, lng], { icon: defaultIcon }).addTo(leafletMap)
        }
        message.success(`已定位至：${result.display_name.split(',')[0]}`)
      }
    } else {
      message.warning('未能搜索到该地址，请尝试输入更简单的关键词，如：“杭州市”或“南京”')
    }
  } catch (err) {
    console.error('Geocoding search failed:', err)
    message.error('地理检索服务连接失败，请检查网络或手动选点')
  } finally {
    searching.value = false
  }
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
      message.success('已成功获取并填充当前设备 GPS 坐标')
    },
    (err) => {
      console.warn('Geolocation error', err)
      message.error('定位获取失败，请确认是否允许定位权限或手动选择')
    },
    { timeout: 8000 }
  )
}

const handleSave = () => {
  formRef.value?.validate(async (errors: any) => {
    if (errors) return
    
    if (props.formType === 'diary' && !formModel.value.content.trim()) {
      message.warning('请填写日记的正文内容')
      return
    }

    submitting.value = true
    const formattedDate = new Date(formModel.value.dateTimestamp).toISOString().replace('Z', '')
    const payload = {
      ...formModel.value,
      date: formattedDate
    }
    try {
      const response = props.isEdit
        ? await updateLove(payload)
        : await createLove(payload)
      
      if (response.data?.code !== 200) {
        throw new Error(response.data?.msg || '保存失败')
      }
      message.success(props.isEdit ? '更新成功' : '创建成功')
      emit('save')
    } catch (err: any) {
      console.error('Failed to save love note in editor', err)
      message.error(err.message || '保存失败，请检查网络或后端接口服务')
    } finally {
      submitting.value = false
    }
  })
}

onMounted(() => {
  fetchFootprintCategories()
})
</script>
