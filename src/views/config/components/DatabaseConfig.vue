<template>
  <div class="space-y-6">
    <div class="archive-card p-5 sm:p-6 bg-(--archive-bg-card) border border-(--archive-border) rounded-2xl">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-(--archive-border)/40">
        <div>
          <h3 class="m-0 text-base font-760 text-(--archive-text) flex items-center gap-2">
            <span class="i-mdi-database-outline text-lg tone-accent"></span>
            数据库连接属性设置
          </h3>
          <p class="tone-muted text-xs mt-1">博主可以直接在这里修改服务端 PostgreSQL 连接属性，完成平滑的物理库重连迁移。</p>
        </div>
        <n-button 
          secondary 
          strong 
          size="small" 
          tag="a" 
          :href="getBlogUrl('/writing/database-guide')" 
          target="_blank" 
          rel="noopener noreferrer"
          class="archive-btn shrink-0"
        >
          <template #icon><span class="i-mdi-help-circle-outline"></span></template>
          查看配置文档
        </n-button>
      </div>

      <n-form label-placement="top" class="mt-5 space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <n-form-item label="主机地址 (Host)" required>
            <n-input v-model:value="dbConfig.host" placeholder="如: localhost 或 127.0.0.1" />
          </n-form-item>
          <n-form-item label="端口号 (Port)" required>
            <n-input v-model:value="dbConfig.port" placeholder="如: 5432" />
          </n-form-item>
          <n-form-item label="数据库库名 (Database)" required>
            <n-input v-model:value="dbConfig.databaseName" placeholder="如: my_house" />
          </n-form-item>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <n-form-item label="数据库账号用户名 (Username)" required>
            <n-input v-model:value="dbConfig.username" placeholder="如: postgres" />
          </n-form-item>
          <n-form-item label="数据库账号密码 (Password)" required>
            <n-input v-model:value="dbConfig.password" type="password" show-password-on="click" placeholder="输入对应数据库密码" />
          </n-form-item>
        </div>

        <div class="soft-panel p-3.5 bg-red-500/5 border border-red-500/10 rounded-2xl flex items-start gap-3">
          <span class="i-mdi-flash-outline text-red-500 mt-0.5 text-base"></span>
          <div>
            <p class="m-0 text-xs font-700 text-red-500">高危操作提示</p>
            <p class="m-0 mt-0.5 text-[11px] leading-relaxed text-red-500/70">
              更改数据库配置可能会导致服务端与当前数据库失去连接并发生自动重连。如果填写的账号或者主机密码错误，会导致整个系统中断无法服务。
            </p>
          </div>
        </div>

        <div class="border-t border-(--archive-border)/40 pt-4 mt-2 flex justify-end">
          <n-button type="primary" :loading="saving" @click="handleSave">
            <template #icon><span class="i-mdi-content-save-outline"></span></template>
            测试并更新数据库连接
          </n-button>
        </div>
      </n-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useMessage, NForm, NFormItem, NInput, NButton } from 'naive-ui'
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

const dbConfig = ref({
  host: '',
  port: '',
  databaseName: '',
  username: '',
  password: ''
})

const fetchDbConfig = async () => {
  try {
    const token = localStorage.getItem('satoken')
    const response = await axios.get('http://localhost:8080/api/config/database', {
      headers: { satoken: token }
    })
    if (response.data && response.data.code === 200) {
      dbConfig.value = response.data.data || { host: '', port: '', databaseName: '', username: '', password: '' }
    }
  } catch (err) {
    console.error('Failed to fetch database configuration', err)
  }
}

const handleSave = async () => {
  saving.value = true
  const token = localStorage.getItem('satoken')
  try {
    const response = await axios.post('http://localhost:8080/api/config/database', dbConfig.value, {
      headers: { satoken: token }
    })
    if (response.data && response.data.code === 200) {
      message.success(response.data.msg || '数据库配置已成功保存')
      await fetchDbConfig()
    } else {
      throw new Error(response.data?.msg || '保存失败')
    }
  } catch (err: any) {
    message.error(err.message || '网络连接失败，数据库配置保存失败。')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  fetchDbConfig()
})
</script>
