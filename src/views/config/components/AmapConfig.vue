<template>
  <div class="space-y-6">
    <div class="archive-card p-5 sm:p-6 bg-(--archive-bg-card) border border-(--archive-border) rounded-2xl">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-(--archive-border)/40">
        <div>
          <h3 class="m-0 text-base font-760 text-(--archive-text) flex items-center gap-2">
            <span class="i-mdi-map-marker-outline text-lg tone-accent"></span>
            高德地图服务 API 配置
          </h3>
          <p class="tone-muted text-xs mt-1">用于后台恋爱足迹管理中的地图选点定位、反向地址解析。</p>
        </div>
        <n-button 
          secondary 
          strong 
          size="small" 
          tag="a" 
          :href="getBlogUrl('/writing/amap-guide')" 
          target="_blank" 
          rel="noopener noreferrer"
          class="archive-btn shrink-0"
        >
          <template #icon><span class="i-mdi-help-circle-outline"></span></template>
          查看配置文档
        </n-button>
      </div>

      <n-form label-placement="top" class="mt-5 space-y-4">
        <n-form-item label="高德地图 Web端 API Key" required>
          <n-input v-model:value="amap.key" type="password" show-password-on="click" placeholder="输入高德地图开发平台申请的 Web端 JS Key" />
        </n-form-item>
        <n-form-item label="高德地图安全密钥 (SecurityJsCode)" required>
          <n-input v-model:value="amap.securityJsCode" type="password" show-password-on="click" placeholder="输入高德地图 API 安全密钥" />
        </n-form-item>

        <div class="soft-panel p-3.5 bg-neutral-500/5 border border-neutral-500/10 rounded-2xl flex items-start gap-3">
          <span class="i-mdi-alert-circle-outline tone-muted mt-0.5 text-base"></span>
          <div>
            <p class="m-0 text-xs font-700 tone-muted">安全提示</p>
            <p class="m-0 mt-0.5 text-[11px] leading-relaxed tone-faint">
              保存时，高德密钥将在前端进行混淆加密后提交至数据库，防范明文传输与泄露风险。拉取展示时以星号（*）掩码呈现。
            </p>
          </div>
        </div>

        <div class="border-t border-(--archive-border)/40 pt-4 mt-2 flex justify-end">
          <n-button type="primary" :loading="saving" @click="handleSave">
            <template #icon><span class="i-mdi-content-save-outline"></span></template>
            保存地图配置
          </n-button>
        </div>
      </n-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useMessage, NForm, NFormItem, NInput, NButton } from 'naive-ui'
import request from '@/api/request'

const getBlogUrl = (path: string) => {
  const protocol = window.location.protocol
  const hostname = window.location.hostname
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return `${protocol}//localhost:3000${path}`
  }
  if (hostname.startsWith('admin.')) {
    const mainDomain = hostname.replace('admin.', '')
    return `${protocol}//${mainDomain}${path}`
  }
  return `${protocol}//${hostname}${path}`
}

const message = useMessage()
const saving = ref(false)

const amap = ref({
  key: '',
  securityJsCode: ''
})

const rawAmapKey = ref('')
const rawAmapSecurityJsCode = ref('')
const SALT = "ArchiveAmapSalt_2026"

const encryptKey = (str: string): string => {
  if (!str) return ''
  if (str.startsWith('enc_v2:') || str.startsWith('enc:')) return str
  try {
    let xorStr = ''
    for (let i = 0; i < str.length; i++) {
      const charCode = str.charCodeAt(i) ^ SALT.charCodeAt(i % SALT.length)
      xorStr += String.fromCharCode(charCode)
    }
    const bytes = new TextEncoder().encode(xorStr)
    let binary = ''
    const len = bytes.byteLength
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return 'enc_v2:' + btoa(binary)
  } catch (e) {
    const shifted = str.split('').map(c => String.fromCharCode(c.charCodeAt(0) + 3)).join('')
    return 'enc:' + btoa(encodeURIComponent(shifted))
  }
}

const fetchConfigs = async () => {
  try {
    const token = localStorage.getItem('satoken')
    const response = await request.get('/config/list', {
      headers: { satoken: token }
    })
    
    if (response.data && response.data.code === 200) {
      const list = response.data.data || []
      const getValue = (key: string, def: string) => {
        const item = list.find((c: any) => c.configKey === key)
        return item ? item.configValue : def
      }

      rawAmapKey.value = getValue('page.footprint.amap.key', '')
      rawAmapSecurityJsCode.value = getValue('page.footprint.amap.securityJsCode', '')

      amap.value.key = rawAmapKey.value ? '●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●' : ''
      amap.value.securityJsCode = rawAmapSecurityJsCode.value ? '●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●' : ''
    }
  } catch (err) {
    console.error('Failed to load map configs', err)
  }
}

const handleSave = async () => {
  saving.value = true
  const token = localStorage.getItem('satoken')

  let finalKey = amap.value.key
  if (finalKey === '●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●') {
    finalKey = rawAmapKey.value
  } else {
    finalKey = encryptKey(finalKey)
  }

  let finalCode = amap.value.securityJsCode
  if (finalCode === '●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●') {
    finalCode = rawAmapSecurityJsCode.value
  } else {
    finalCode = encryptKey(finalCode)
  }

  const payload = [
    { configKey: 'page.footprint.amap.key', configValue: finalKey, description: '高德地图 API Key (JS端)' },
    { configKey: 'page.footprint.amap.securityJsCode', configValue: finalCode, description: '高德地图 API 安全密钥 (SecurityJsCode)' }
  ]

  try {
    const response = await request.post('/config/update-batch', payload, {
      headers: { satoken: token }
    })
    
    if (response.data && response.data.code === 200) {
      message.success('地图服务配置已成功保存')
      await fetchConfigs()
    } else {
      throw new Error(response.data?.msg || '保存失败')
    }
  } catch (err: any) {
    message.error(err.message || '网络连接失败，配置保存失败。')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  fetchConfigs()
})
</script>
