<template>
  <div class="space-y-6">
    <div class="archive-card p-5 sm:p-6 bg-(--archive-bg-card) border border-(--archive-border) rounded-2xl">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-(--archive-border)/40">
        <div>
          <h3 class="m-0 text-base font-760 text-(--archive-text) flex items-center gap-2">
            <span class="i-mdi-cloud-upload-outline text-lg tone-accent"></span>
            存储与图床配置
          </h3>
          <p class="tone-muted text-xs mt-1">配置博文、照片、日记和恋爱瞬间上传时的媒体文件存储图床。</p>
        </div>
        <n-button 
          secondary 
          strong 
          size="small" 
          tag="a" 
          :href="getBlogUrl('/writing/config-guide')" 
          target="_blank" 
          rel="noopener noreferrer"
          class="archive-btn shrink-0"
        >
          <template #icon><span class="i-mdi-help-circle-outline"></span></template>
          查看配置文档
        </n-button>
      </div>

      <n-form label-placement="top" class="mt-5 space-y-4">
        <n-form-item label="当前存储介质类型" required>
          <n-select v-model:value="formModel.storageType" :options="storageOptions" />
        </n-form-item>

        <div class="soft-panel p-3.5 bg-(--archive-accent)/5 border border-(--archive-accent)/10 rounded-2xl flex items-start gap-3">
          <span class="i-mdi-information-outline tone-accent mt-0.5 text-base"></span>
          <div>
            <p class="m-0 text-xs font-700 text-(--archive-text)">{{ activeStorageLabel }}已激活</p>
            <p class="m-0 mt-0.5 text-[11px] leading-relaxed tone-muted">
              {{ storageOptions.find(o => o.value === formModel.storageType)?.desc }}
            </p>
          </div>
        </div>

        <!-- Local Config (No fields, local is server disk) -->
        <div v-if="formModel.storageType === 'local'" class="soft-panel p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-dashed border-(--archive-border)/40 text-center">
          <span class="i-mdi-folder-home-outline text-3xl tone-faint block mx-auto mb-1"></span>
          <span class="text-xs tone-muted">本地存储无需配置额外参数。上传的文件将物理存放于服务端的 /uploads/ 目录下。</span>
        </div>

        <!-- MinIO Config -->
        <div v-else-if="formModel.storageType === 'minio'" class="space-y-4 pt-2">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <n-form-item label="MinIO Endpoint (API访问端点)" required>
              <n-input v-model:value="formModel.minio.endpoint" placeholder="如: http://127.0.0.1:9000" />
            </n-form-item>
            <n-form-item label="MinIO Bucket Name (存储桶名称)" required>
              <n-input v-model:value="formModel.minio.bucketName" placeholder="如: my-house" />
            </n-form-item>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <n-form-item label="MinIO Access Key (用户名/ID)" required>
              <n-input v-model:value="formModel.minio.accessKey" placeholder="输入 MinIO 访问密钥 ID" />
            </n-form-item>
            <n-form-item label="MinIO Secret Key (密码/密文)" required>
              <n-input v-model:value="formModel.minio.secretKey" type="password" show-password-on="click" placeholder="输入 MinIO 安全访问密钥" />
            </n-form-item>
          </div>
        </div>

        <!-- 七牛云 Config -->
        <div v-else-if="formModel.storageType === 'qiniu'" class="space-y-4 pt-2">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <n-form-item label="七牛云 Access Key (公钥)" required>
              <n-input v-model:value="formModel.qiniu.accessKey" placeholder="输入七牛云账户 AccessKey" />
            </n-form-item>
            <n-form-item label="七牛云 Secret Key (私钥)" required>
              <n-input v-model:value="formModel.qiniu.secretKey" type="password" show-password-on="click" placeholder="输入七牛云账户 SecretKey" />
            </n-form-item>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <n-form-item label="七牛云 Bucket Name (空间名称)" required>
              <n-input v-model:value="formModel.qiniu.bucketName" placeholder="如: myhouse-bucket" />
            </n-form-item>
            <n-form-item label="七牛云加速域名 (绑定外链CDN域名)" required>
              <n-input v-model:value="formModel.qiniu.domain" placeholder="如: http://qiniu.yourdomain.com" />
            </n-form-item>
          </div>
        </div>

        <div class="border-t border-(--archive-border)/40 pt-4 mt-2 flex justify-end">
          <n-button type="primary" :loading="saving" @click="handleSave">
            <template #icon><span class="i-mdi-content-save-outline"></span></template>
            保存存储配置
          </n-button>
        </div>
      </n-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useMessage, NForm, NFormItem, NSelect, NInput, NButton } from 'naive-ui'
import axios from 'axios'

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

const formModel = ref({
  storageType: 'local',
  minio: {
    endpoint: '',
    accessKey: '',
    secretKey: '',
    bucketName: ''
  },
  qiniu: {
    accessKey: '',
    secretKey: '',
    bucketName: '',
    domain: ''
  }
})

const storageOptions = [
  {
    value: 'local',
    label: '本地服务器存储',
    desc: '零外部依赖，图片直接上传至后端服务器 uploads 目录中。'
  },
  {
    value: 'minio',
    label: 'MinIO 对象存储',
    desc: '适合本地搭建的私有 S3 存储，大文件与媒体库好去处。'
  },
  {
    value: 'qiniu',
    label: '七牛云 Kodo 图床',
    desc: '集成加速域名 CDN，上传极速，适合线上公网生产环境部署。'
  }
]

const activeStorageLabel = computed(() => {
  const opt = storageOptions.find(o => o.value === formModel.value.storageType)
  return opt ? opt.label : ''
})

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

      formModel.value.storageType = getValue('storage.type', 'local')
      formModel.value.minio.endpoint = getValue('storage.minio.endpoint', '')
      formModel.value.minio.accessKey = getValue('storage.minio.accessKey', '')
      formModel.value.minio.secretKey = getValue('storage.minio.secretKey', '')
      formModel.value.minio.bucketName = getValue('storage.minio.bucketName', '')
      
      formModel.value.qiniu.accessKey = getValue('storage.qiniu.accessKey', '')
      formModel.value.qiniu.secretKey = getValue('storage.qiniu.secretKey', '')
      formModel.value.qiniu.bucketName = getValue('storage.qiniu.bucketName', '')
      formModel.value.qiniu.domain = getValue('storage.qiniu.domain', '')
    }
  } catch (err) {
    console.error('Failed to fetch storage configs', err)
  }
}

const handleSave = async () => {
  saving.value = true
  const token = localStorage.getItem('satoken')
  
  const payload = [
    { configKey: 'storage.type', configValue: formModel.value.storageType, description: '存储方式: local, minio, qiniu' },
    { configKey: 'storage.minio.endpoint', configValue: formModel.value.minio.endpoint, description: 'MinIO服务访问端点' },
    { configKey: 'storage.minio.accessKey', configValue: formModel.value.minio.accessKey, description: 'MinIO Access Key' },
    { configKey: 'storage.minio.secretKey', configValue: formModel.value.minio.secretKey, description: 'MinIO Secret Key' },
    { configKey: 'storage.minio.bucketName', configValue: formModel.value.minio.bucketName, description: 'MinIO 存储空间桶名' },
    { configKey: 'storage.qiniu.accessKey', configValue: formModel.value.qiniu.accessKey, description: '七牛云 Access Key' },
    { configKey: 'storage.qiniu.secretKey', configValue: formModel.value.qiniu.secretKey, description: '七牛云 Secret Key' },
    { configKey: 'storage.qiniu.bucketName', configValue: formModel.value.qiniu.bucketName, description: '七牛云 存储空间名' },
    { configKey: 'storage.qiniu.domain', configValue: formModel.value.qiniu.domain, description: '七牛云加速域名' }
  ]

  try {
    const response = await axios.post('http://localhost:8080/api/config/update-batch', payload, {
      headers: { satoken: token }
    })
    
    if (response.data && response.data.code === 200) {
      message.success('存储与图床配置已成功保存')
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
