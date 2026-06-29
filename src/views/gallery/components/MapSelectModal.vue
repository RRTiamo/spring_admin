<template>
  <n-modal
    v-model:show="visible"
    preset="card"
    title="选择拍摄地点坐标 (OSM 地图)"
    class="w-[90vw] max-w-[640px]"
    @after-enter="initMap"
    @after-leave="destroyMap"
  >
    <div class="mb-3 flex gap-2">
      <n-input v-model:value="searchAddress" placeholder="输入城市或地名快速检索定位，如：南京、杭州、阿那亚" size="small" @keyup.enter="searchLocation" />
      <n-button type="primary" size="small" :loading="searching" @click="searchLocation">搜索定位</n-button>
    </div>
    <div id="gallery-select-map" class="h-[400px] w-full rounded-xl overflow-hidden border border-(--archive-border) z-50"></div>
    <template #footer>
      <div class="flex items-center justify-between text-xs tone-muted">
        <span>当前已选：经度 {{ tempLongitude || '未选择' }}, 纬度 {{ tempLatitude || '未选择' }}</span>
        <div class="flex gap-2">
          <n-button size="small" @click="visible = false">取消</n-button>
          <n-button size="small" type="primary" :disabled="tempLongitude === null" @click="confirmMapSelect">确认选择</n-button>
        </div>
      </div>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { NInput, NButton, NModal, useMessage } from 'naive-ui'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const props = defineProps<{
  showMapModal: boolean
  longitude: number | null
  latitude: number | null
}>()

const emit = defineEmits<{
  (e: 'update:showMapModal', visible: boolean): void
  (e: 'confirm', data: { longitude: number, latitude: number, address: string }): void
}>()

const message = useMessage()

const visible = computed({
  get: () => props.showMapModal,
  set: (val) => emit('update:showMapModal', val)
})

const tempLongitude = ref<number | null>(null)
const tempLatitude = ref<number | null>(null)
const searchAddress = ref('')
const tempAddressName = ref('')
const searching = ref(false)
let leafletMap: L.Map | null = null
let marker: L.Marker | null = null

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

const initMap = () => {
  tempLongitude.value = props.longitude ? Number(props.longitude) : null
  tempLatitude.value = props.latitude ? Number(props.latitude) : null
  searchAddress.value = ''
  tempAddressName.value = ''

  const centerLat = tempLatitude.value ? Number(tempLatitude.value) : 31.2304
  const centerLng = tempLongitude.value ? Number(tempLongitude.value) : 121.4737
  const zoom = tempLongitude.value ? 13 : 8

  const defaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41]
  })

  leafletMap = L.map('gallery-select-map').setView([centerLat, centerLng], zoom)

  L.tileLayer('https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}', {
    subdomains: ['1', '2', '3', '4'],
    maxZoom: 18,
    attribution: '© AutoNavi Gaode Map'
  }).addTo(leafletMap)

  if (tempLatitude.value !== null && tempLongitude.value !== null) {
    marker = L.marker([tempLatitude.value, tempLongitude.value], { icon: defaultIcon }).addTo(leafletMap)
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
  if (tempLongitude.value !== null && tempLatitude.value !== null) {
    emit('confirm', {
      longitude: tempLongitude.value,
      latitude: tempLatitude.value,
      address: tempAddressName.value
    })
  }
  visible.value = false
}
</script>
