<template>
  <div class="links-desk flex flex-col gap-6">
    <!-- 顶部状态与操作栏 -->
    <section class="border border-(--archive-border) rounded-3xl bg-(--archive-bg-card) p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 select-none">
      <div class="flex items-start gap-3.5">
        <div class="h-12 w-12 rounded-2xl bg-(--archive-accent)/10 text-(--archive-accent) flex items-center justify-center shrink-0">
          <span class="i-mdi-link-variant text-2xl animate-pulse"></span>
        </div>
        <div class="flex flex-col text-left">
          <h3 class="text-lg font-bold text-(--archive-text) tracking-wide">友情链接管理</h3>
          <p class="text-xs text-(--archive-text)/60 mt-1 leading-relaxed max-w-192">
            管理与邻居们的友链连接。在这里新增、编辑或移除友情互链。所有链接会按排序权重升序展现。
          </p>
        </div>
      </div>

      <div class="flex items-center gap-3 w-full sm:w-auto">
        <n-input
          v-model:value="searchQuery"
          clearable
          placeholder="搜索站点名称或描述..."
          class="w-full sm:w-60"
        >
          <template #prefix>
            <span class="i-mdi-magnify tone-faint text-lg"></span>
          </template>
        </n-input>
        <button
          class="px-4 py-2 text-xs font-bold rounded-xl border border-(--archive-border) hover:bg-black/5 dark:hover:bg-white/5 active:scale-[0.98] transition-all text-(--archive-text) cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap"
          @click="loadLinks"
        >
          <span class="i-mdi-refresh"></span>
          <span>刷新</span>
        </button>
        <button
          class="px-4 py-2 text-xs font-bold rounded-xl bg-(--archive-accent) text-white hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 shadow-sm whitespace-nowrap cursor-pointer"
          @click="openCreate"
        >
          <span class="i-mdi-plus"></span>
          <span>新增链接</span>
        </button>
      </div>
    </section>



    <!-- 主加载状态 -->
    <div v-if="loading" class="flex justify-center items-center py-24">
      <n-spin size="large" />
    </div>

    <!-- 空白状态 -->
    <div v-else-if="filteredLinks.length === 0" class="border border-(--archive-border) rounded-3xl bg-(--archive-bg-card) p-16 text-center shadow-sm">
      <span class="i-mdi-link-variant-off text-5xl tone-muted opacity-30 mb-3 block"></span>
      <p class="text-sm tone-muted">未检索到任何友情链接，点击右上方“新增链接”开始创建</p>
    </div>

    <!-- 友情链接网格列表 -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <div
        v-for="link in filteredLinks"
        :key="link.id"
        class="border border-(--archive-border) rounded-2xl bg-(--archive-bg-card) p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-all relative group overflow-hidden"
      >
        <!-- 背景渐变光晕 (微动画) -->
        <div class="absolute -right-16 -top-16 w-32 h-32 rounded-full bg-(--archive-accent-soft)/10 group-hover:scale-150 transition-all duration-500 blur-xl"></div>

        <div>
          <!-- 头部 Logo 与 标题 -->
          <div class="flex items-center gap-3">
            <div class="logo-box h-12 w-12 rounded-xl flex items-center justify-center font-bold text-lg select-none bg-gradient-to-br from-(--archive-accent-soft) to-(--archive-accent) text-white shadow-sm overflow-hidden shrink-0">
              <img v-if="link.logo" :src="link.logo" @error="handleLogoError(link)" class="h-full w-full object-cover" />
              <span v-else>{{ link.title.charAt(0).toUpperCase() }}</span>
            </div>
            <div class="flex flex-col text-left overflow-hidden">
              <a
                :href="link.url"
                target="_blank"
                rel="noopener noreferrer"
                class="text-sm font-bold text-(--archive-text) hover:text-(--archive-accent) transition-colors truncate flex items-center gap-1"
              >
                <span>{{ link.title }}</span>
                <span class="i-mdi-open-in-new text-xs opacity-60"></span>
              </a>
              <span class="text-[10px] text-(--archive-text)/40 font-mono mt-0.5 truncate">{{ getCleanUrl(link.url) }}</span>
            </div>
          </div>

          <!-- 分类和状态标签 -->
          <div class="flex items-center gap-2 mt-3 select-none flex-wrap">
            <span class="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-(--archive-accent)/10 text-(--archive-accent)">
              {{ link.category || '小伙伴' }}
            </span>
            <span
              v-if="link.visibility === 'private'"
              class="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-(--archive-danger)/10 text-(--archive-danger) flex items-center gap-0.5"
            >
              <span class="i-mdi-lock text-[9px]"></span>
              <span>私密</span>
            </span>
            <span
              v-else
              class="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-(--archive-success)/10 text-(--archive-success) flex items-center gap-0.5"
            >
              <span class="i-mdi-eye-outline text-[9px]"></span>
              <span>公开</span>
            </span>
            <span class="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-(--archive-info)/10 text-(--archive-info) font-mono">
              权重: {{ link.sortOrder || 0 }}
            </span>
          </div>

          <!-- 简介内容 -->
          <p class="mt-4 text-xs text-(--archive-text)/70 leading-relaxed text-left line-clamp-3 min-h-9 break-all">
            {{ link.description || '主人很懒，还没写关于该站的简短描述呢 ☕' }}
          </p>
        </div>

        <!-- 底部修改操作栏 -->
        <div class="flex items-center justify-between border-t border-(--archive-border)/60 mt-4 pt-3 select-none">
          <span class="text-[9px] text-(--archive-text)/30 font-mono">
            {{ formatTime(link.createTime) }}
          </span>
          <div class="flex gap-2">
            <button
              class="h-7 px-2.5 rounded-lg border border-(--archive-border) hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 transition-all text-xs font-semibold text-(--archive-text) cursor-pointer flex items-center justify-center gap-1"
              @click="openEdit(link)"
            >
              <span class="i-mdi-pencil text-xs"></span>
              <span>编辑</span>
            </button>
            <button
              class="h-7 px-2.5 rounded-lg bg-(--archive-danger)/10 hover:bg-(--archive-danger)/15 active:scale-95 transition-all text-xs font-semibold text-(--archive-danger) cursor-pointer flex items-center justify-center gap-1"
              @click="handleDelete(link.id!)"
            >
              <span class="i-mdi-delete text-xs"></span>
              <span>删除</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 新增/编辑友情链接弹窗 -->
    <n-modal
      v-model:show="showModal"
      preset="card"
      :title="isEdit ? '编辑友情链接' : '添加友情链接'"
      class="w-full max-w-120 border border-(--archive-border) bg-(--archive-bg-card) rounded-2xl"
    >
      <n-form
        ref="formRef"
        :model="formModel"
        :rules="rules"
        label-placement="top"
        class="text-left"
      >
        <n-form-item label="站点名称 (Title)" path="title">
          <n-input v-model:value="formModel.title" placeholder="如: RRTiamo" />
        </n-form-item>

        <n-form-item label="站点链接 (URL)" path="url">
          <n-input v-model:value="formModel.url" placeholder="如: https://github.com/RRTiamo" />
        </n-form-item>

        <n-form-item label="LOGO 地址 (Logo URL)" path="logo">
          <n-input v-model:value="formModel.logo" placeholder="如: https://avatars.githubusercontent.com/... (可选)" />
        </n-form-item>

        <n-form-item label="站点描述 (Description)" path="description">
          <n-input
            v-model:value="formModel.description"
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 4 }"
            placeholder="关于该站的简短描述或寄语 (可选)"
          />
        </n-form-item>

        <div class="grid grid-cols-2 gap-4">
          <n-form-item label="站点分类 (Category)" path="category">
            <n-input v-model:value="formModel.category" placeholder="如: 博主、技术、生活" />
          </n-form-item>

          <n-form-item label="排序权重 (Sort Order)" path="sortOrder">
            <n-input-number v-model:value="formModel.sortOrder" :min="0" class="w-full" />
          </n-form-item>
        </div>

        <n-form-item label="可见性 (Visibility)" path="visibility">
          <n-radio-group v-model:value="formModel.visibility">
            <n-radio-button value="public">公开 (展示在博客中)</n-radio-button>
            <n-radio-button value="private">私密 (仅自己后台可见)</n-radio-button>
          </n-radio-group>
        </n-form-item>

        <!-- 弹窗动作按钮 -->
        <div class="flex justify-end gap-3 pt-3 border-t border-(--archive-border)/60 mt-6">
          <button
            class="px-4 py-2 text-xs font-bold rounded-xl border border-(--archive-border) hover:bg-black/5 dark:hover:bg-white/5 active:scale-[0.98] transition-all text-(--archive-text) cursor-pointer"
            @click="showModal = false"
            type="button"
          >
            取消
          </button>
          <button
            class="px-4 py-2 text-xs font-bold rounded-xl bg-(--archive-accent) text-white hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
            @click="handleSave"
            :disabled="submitting"
            type="button"
          >
            <span v-if="submitting" class="i-mdi-loading animate-spin"></span>
            <span>保存</span>
          </button>
        </div>
      </n-form>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  NInput,
  NSpin,
  NModal,
  NForm,
  NFormItem,
  NRadioGroup,
  NRadioButton,
  NInputNumber,
  useDialog,
  useMessage
} from 'naive-ui'
import type { FormInst } from 'naive-ui'
import type { FriendLink } from '@/interface/links'
import {
  getLinksList,
  createLink,
  updateLink,
  deleteLink
} from '@/api/links'


const message = useMessage()
const dialog = useDialog()
const formRef = ref<FormInst | null>(null)

// 数据状态
const links = ref<FriendLink[]>([])
const loading = ref(false)
const searchQuery = ref('')

// 弹窗表单控制
const showModal = ref(false)
const isEdit = ref(false)
const submitting = ref(false)

const formModel = ref<FriendLink>({
  id: undefined,
  title: '',
  url: '',
  logo: '',
  description: '',
  category: '小伙伴',
  sortOrder: 0,
  visibility: 'public'
})

// 表单验证规则
const rules = {
  title: [
    { required: true, message: '请输入邻居站点名称', trigger: 'blur' }
  ],
  url: [
    { required: true, message: '请输入站点地址 (URL)', trigger: 'blur' },
    {
      validator: (_rule: any, value: string) => {
        if (!value) return true
        return value.startsWith('http://') || value.startsWith('https://')
      },
      message: '链接必须以 http:// 或 https:// 开头',
      trigger: 'blur'
    }
  ]
}

// 过滤后的友情链接列表
const filteredLinks = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return links.value
  return links.value.filter(
    l =>
      l.title.toLowerCase().includes(q) ||
      (l.description && l.description.toLowerCase().includes(q)) ||
      (l.category && l.category.toLowerCase().includes(q))
  )
})

// 加载友情链接
const loadLinks = async () => {
  loading.value = true
  try {
    const response = await getLinksList()
    if (response.data?.code === 200) {
      links.value = response.data.data
    } else {
      throw new Error(response.data?.msg || '接口异常')
    }
  } catch (err) {
    console.error('Failed to load links', err)
    message.error('加载友情链接失败，请检查网络或后端接口服务')
  } finally {
    loading.value = false
  }
}

// 打开“新增”弹窗
const openCreate = () => {
  isEdit.value = false
  formModel.value = {
    id: undefined,
    title: '',
    url: '',
    logo: '',
    description: '',
    category: '小伙伴',
    sortOrder: 0,
    visibility: 'public'
  }
  showModal.value = true
}

// 打开“编辑”弹窗
const openEdit = (link: FriendLink) => {
  isEdit.value = true
  formModel.value = { ...link }
  showModal.value = true
}

// 保存链接操作
const handleSave = () => {
  formRef.value?.validate(async (errors) => {
    if (errors) return

    submitting.value = true
    const payload = { ...formModel.value }

    try {
      const response = isEdit.value
        ? await updateLink(payload)
        : await createLink(payload)

      if (response.data?.code === 200) {
        message.success(isEdit.value ? '链接更新成功！' : '新友链添加成功！')
        showModal.value = false
        await loadLinks()
      } else {
        throw new Error(response.data?.msg || '保存失败')
      }
    } catch (err: any) {
      console.error('Failed to save link', err)
      message.error(err.message || '保存失败，请检查网络或后端接口服务')
    } finally {
      submitting.value = false
    }
  })
}

// 删除链接操作
const handleDelete = (id: number) => {
  dialog.warning({
    title: '确认删除链接',
    content: '撕掉这枚邻居标签将解除与其友情关联，确定吗？',
    positiveText: '确认撕下',
    negativeText: '保留',
    onPositiveClick: async () => {
      try {
        const response = await deleteLink(id)
        if (response.data?.code === 200) {
          message.success('邻居友链已成功撕下')
          await loadLinks()
        } else {
          throw new Error(response.data?.msg || '删除失败')
        }
      } catch (err: any) {
        console.error('Failed to delete link', err)
        message.error(err.message || '删除操作失败，后端接口响应异常')
      }
    }
  })
}

// LOGO 图片加载失败时，置空以展示首字备用头像
const handleLogoError = (link: FriendLink) => {
  link.logo = ''
}

// 提炼用于展示的简洁 URL 路径
const getCleanUrl = (urlStr: string) => {
  try {
    const parsed = new URL(urlStr)
    return parsed.hostname + (parsed.pathname === '/' ? '' : parsed.pathname)
  } catch (e) {
    return urlStr.replace(/^https?:\/\//i, '')
  }
}

// 时间转换器
const formatTime = (timeStr?: string) => {
  if (!timeStr) return '刚刚'
  try {
    const d = new Date(timeStr)
    return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`
  } catch (e) {
    return '刚刚'
  }
}

onMounted(() => {
  loadLinks()
})
</script>
