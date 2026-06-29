<template>
  <div ref="articlesRef" class="flex flex-col gap-4 overflow-hidden">
    <!-- 列表视图 -->
    <div v-if="!showEditor" class="list-view-anim flex flex-col gap-4">
      <ArticlesFilter
        v-model:searchQuery="searchQuery"
        :status-color="statusColor"
        :status-icon="statusIcon"
        :status-text="statusText"
        @create="openCreate"
      />



      <!-- 骨架屏加载状态 -->
      <section v-if="loading" class="grid gap-3">
        <div v-for="index in 3" :key="index" class="archive-card p-5">
          <div class="flex gap-4">
            <div class="skeleton-block h-24 w-28 shrink-0 rounded-[18px]"></div>
            <div class="min-w-0 flex-1">
              <div class="skeleton-line h-4 w-36 rounded-full"></div>
              <div class="skeleton-line mt-4 h-5 w-3/5 rounded-full"></div>
              <div class="skeleton-line mt-3 h-3 w-4/5 rounded-full"></div>
              <div class="skeleton-line mt-2 h-3 w-2/5 rounded-full"></div>
            </div>
          </div>
        </div>
      </section>

      <!-- 空列表状态 -->
      <section v-else-if="filteredBlogs.length === 0" class="archive-card p-10 text-center">
        <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-[22px] bg-[color-mix(in_srgb,var(--archive-accent)_14%,transparent)] text-(--archive-accent)">
          <span class="i-mdi-text-box-search-outline text-2xl"></span>
        </div>
        <h2 class="m-0 mt-5 text-xl font-760 text-(--archive-text)">没有找到文章</h2>
        <p class="mx-auto m-0 mt-2 max-w-md text-sm leading-6 tone-muted">
          换个关键词，或者先新建一篇文章。
        </p>
        <n-button type="primary" class="mt-5" @click="openCreate">新建文章</n-button>
      </section>

      <!-- 文章表格与卡片 -->
      <ArticlesTable
        v-else
        v-model:currentPage="currentPage"
        v-model:pageSize="pageSize"
        :paginated-blogs="paginatedBlogs"
        :filtered-blogs="filteredBlogs"
        @edit="openEdit"
        @delete="handleDelete"
      />
    </div>

    <!-- 页内全屏编辑/写作视图 -->
    <ArticleForm
      v-else
      v-model:formModel="formModel"
      :is-edit="isEdit"
      :submitting="submitting"
      :generating-summary="generatingSummary"
      :category-tree-options="categoryTreeOptions"
      :mood-options="moodOptions"
      :visibility-options="visibilityOptions"
      :form-rules="formRules"
      :upload-headers="uploadHeaders"
      @close="closeEditor"
      @save="handleSubmit"
      @open-gallery="openGallerySelector"
      @import-md="handleImportMarkdownContent"
      @ai-summary="generateAISummary"
    />

    <!-- 图册选择弹窗 -->
    <GallerySelectModal
      v-model:showGallerySelectModal="showGallerySelectModal"
      :gallery-list="galleryList"
      :gallery-loading="galleryLoading"
      @select="handleSelectGalleryCover"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { NButton, useDialog, useMessage } from 'naive-ui'
import { getBlogsList, createBlog, updateBlog, deleteBlog, generateSummary } from '@/api/blogs'
import { getCategoriesList } from '@/api/categories'
import { getFileList } from '@/api/files'
import { gsap } from 'gsap'
import type { Blog } from '@/interface/love'

// 导入子组件
import ArticlesFilter from './components/ArticlesFilter.vue'
import ArticlesTable from './components/ArticlesTable.vue'
import ArticleForm from './components/ArticleForm.vue'
import GallerySelectModal from './components/GallerySelectModal.vue'

type BackendMode = 'checking' | 'live' | 'error'

const message = useMessage()
const dialog = useDialog()
const articlesRef = ref<HTMLElement | null>(null)

const blogs = ref<Blog[]>([])
const loading = ref(false)
const searchQuery = ref('')
const backendMode = ref<BackendMode>('checking')

const showEditor = ref(false)
const isEdit = ref(false)
const submitting = ref(false)
const generatingSummary = ref(false)
let gsapCtx: gsap.Context | null = null

// 分类和图册选择数据状态
const categories = ref<any[]>([])
const galleryList = ref<any[]>([])
const galleryLoading = ref(false)
const showGallerySelectModal = ref(false)

// 分页控制
const currentPage = ref(1)
const pageSize = ref(10)

const formModel = ref({
  id: 0,
  slug: '',
  title: '',
  summary: '',
  content: '',
  tags: [] as string[],
  category: 'Thoughts',
  categoryId: null as string | number | null,
  mood: 'quiet',
  visibility: 'public',
  cover: ''
})

const formRules = {
  title: { required: true, message: '请输入文章标题', trigger: 'blur' },
  content: { required: true, message: '请输入文章正文内容', trigger: 'blur' },
  categoryId: { required: true, type: 'number', message: '请选择文章归档分类', trigger: 'change' }
}

const moodOptions = [
  { label: '平静日常 (Quiet)', value: 'quiet' },
  { label: '愉悦开心 (Happy)', value: 'happy' },
  { label: '甜蜜浪漫 (Romantic)', value: 'romantic' },
  { label: '感伤忧郁 (Sad)', value: 'sad' },
  { label: '热血澎湃 (Excited)', value: 'excited' }
]

const visibilityOptions = [
  { label: '公开可见 (Public)', value: 'public' },
  { label: '仅限主页密码访问 (Protected)', value: 'protected' },
  { label: '个人私密 (Private)', value: 'private' }
]

// 接口状态描述
const statusColor = computed(() => {
  if (backendMode.value === 'live') return 'var(--archive-success)'
  if (backendMode.value === 'error') return 'var(--archive-danger)'
  return 'var(--archive-text-muted)'
})

const statusIcon = computed(() => {
  if (backendMode.value === 'live') return 'i-mdi-check-circle'
  if (backendMode.value === 'error') return 'i-mdi-alert-circle'
  return 'i-mdi-loading animate-spin'
})

const statusText = computed(() => {
  if (backendMode.value === 'live') return 'API 服务器在线'
  if (backendMode.value === 'error') return 'API 连接失败'
  return '正在检测后端...'
})

// 分类下拉项生成 (树状展示)
const categoryTreeOptions = computed(() => {
  const map: Record<number, any> = {}
  const roots: any[] = []

  categories.value.forEach((cat) => {
    map[cat.id] = { label: cat.name, value: cat.id, children: [] }
  })

  categories.value.forEach((cat) => {
    const node = map[cat.id]
    if (!node) return
    const pId = cat.parentId || 0
    if (pId === 0) {
      roots.push(node)
    } else {
      const parentNode = map[pId]
      if (parentNode) {
        parentNode.children.push(node)
      } else {
        roots.push(node)
      }
    }
  })

  const removeEmptyChildren = (nodes: any[]) => {
    nodes.forEach((n) => {
      if (n.children.length === 0) {
        delete n.children
      } else {
        removeEmptyChildren(n.children)
      }
    })
  }
  removeEmptyChildren(roots)
  return roots
})

// 文件上传 Headers
const uploadHeaders = computed(() => ({
  satoken: localStorage.getItem('satoken') || ''
}))

// 数据过滤和分页
const filteredBlogs = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return blogs.value
  return blogs.value.filter((blog) => {
    const titleMatch = blog.title.toLowerCase().includes(query)
    const tagMatch = blog.tags?.toLowerCase().includes(query)
    const categoryMatch = blog.category?.toLowerCase().includes(query)
    return titleMatch || tagMatch || categoryMatch
  })
})

const paginatedBlogs = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredBlogs.value.slice(start, end)
})

// 监听分类树选择变化，自动填补 category 英文名称
watch(() => formModel.value.categoryId, (newId) => {
  if (!newId) {
    formModel.value.category = ''
    return
  }
  const match = categories.value.find((c) => c.id === newId)
  if (match) {
    formModel.value.category = match.slug || match.name
  }
})

// 异步接口调用
const fetchBlogs = async () => {
  loading.value = true
  try {
    const response = await getBlogsList()
    if (response.data?.code === 200) {
      blogs.value = response.data.data
      backendMode.value = 'live'
    } else {
      throw new Error(response.data?.msg || 'API return not 200')
    }
  } catch (err: any) {
    console.error('API connection failed', err)
    backendMode.value = 'error'
    message.error(err.message || '加载文章列表失败，请检查网络或服务状态')
  } finally {
    loading.value = false
  }
}

const fetchCategories = async () => {
  try {
    const response = await getCategoriesList()
    if (response.data?.code === 200) {
      categories.value = response.data.data
    }
  } catch (err) {
    console.error('Failed to fetch categories list', err)
  }
}



const openCreate = () => {
  isEdit.value = false
  formModel.value = {
    id: 0,
    slug: '',
    title: '',
    summary: '',
    content: '',
    tags: [],
    category: 'Thoughts',
    categoryId: categories.value[0]?.id || null,
    mood: 'quiet',
    visibility: 'public',
    cover: '/assets/writing-tokyo.png'
  }
  showEditor.value = true
}

const openEdit = (blog: Blog) => {
  isEdit.value = true
  formModel.value = {
    id: blog.id,
    slug: blog.slug,
    title: blog.title,
    summary: blog.summary,
    content: blog.content,
    tags: blog.tags ? blog.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
    category: blog.category,
    categoryId: blog.categoryId ? Number(blog.categoryId) : null,
    mood: blog.mood || 'quiet',
    visibility: blog.visibility || 'public',
    cover: blog.cover
  }
  showEditor.value = true
}

const closeEditor = () => {
  showEditor.value = false
}

const handleSubmit = async () => {
  submitting.value = true
  try {
    const payload = {
      ...formModel.value,
      tags: formModel.value.tags.join(',')
    }
    if (isEdit.value) {
      const response = await updateBlog(payload)
      if (response.data?.code !== 200) {
        throw new Error(response.data?.msg || '更新失败')
      }
      message.success('文章已更新')
      await fetchBlogs()
    } else {
      const response = await createBlog(payload)
      if (response.data?.code !== 200) {
        throw new Error(response.data?.msg || '发布失败')
      }
      message.success('文章已发布')
      await fetchBlogs()
    }
  } catch (err: any) {
    console.error('Failed to submit article', err)
    message.error(err.message || '文章保存失败，请检查网络或后端服务状态')
  } finally {
    submitting.value = false
    showEditor.value = false
  }
}

const handleDelete = (id: number) => {
  dialog.warning({
    title: '删除文章',
    content: '删除后无法恢复。确认要删除这篇文章吗？',
    positiveText: '删除',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        const response = await deleteBlog(id)
        if (response.data?.code !== 200) {
          throw new Error(response.data?.msg || '删除失败')
        }
        message.success('文章已删除')
        await fetchBlogs()
      } catch (err: any) {
        console.error('Delete article failed', err)
        message.error(err.message || '文章删除失败，请检查网络或后端接口服务')
      }
    }
  })
}

// DeepSeek 摘要生成
const generateAISummary = async () => {
  if (!formModel.value.content || !formModel.value.content.trim()) {
    message.warning('请先输入随笔正文内容，再生成简介 ✨')
    return
  }

  if (backendMode.value === 'error') {
    message.warning('当前网络连接异常，暂不支持 AI 生成功能 ⚠️')
    return
  }

  generatingSummary.value = true
  try {
    const response = await generateSummary({ content: formModel.value.content })
    if (response.data?.code === 200 && response.data.data) {
      formModel.value.summary = response.data.data
      message.success('AI 简介生成成功 ✍️')
    } else {
      throw new Error(response.data?.msg || '接口返回错误')
    }
  } catch (err: any) {
    message.error(`AI 生成失败: ${err.message || '网络连接异常'}`)
  } finally {
    generatingSummary.value = false
  }
}

// 导入 Markdown 文件
const handleImportMarkdownContent = (text: string) => {
  const frontmatterRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/
  const match = frontmatterRegex.exec(text)

  if (match) {
    const yamlContent = match[1]
    const bodyContent = match[2]
    const lines = yamlContent.split(/\r?\n/)
    const meta: Record<string, string> = {}
    lines.forEach((line) => {
      const colonIdx = line.indexOf(':')
      if (colonIdx !== -1) {
        const key = line.substring(0, colonIdx).trim().toLowerCase()
        const val = line.substring(colonIdx + 1).trim().replace(/^["']|["']$/g, '')
        meta[key] = val
      }
    })

    formModel.value.title = meta['title'] || '导入文章'
    formModel.value.slug = meta['slug'] || ''
    formModel.value.tags = meta['tags'] ? meta['tags'].split(',').map((t) => t.trim()).filter(Boolean) : []
    formModel.value.summary = meta['description'] || meta['summary'] || ''
    formModel.value.category = meta['category'] || 'Thoughts'
    formModel.value.mood = meta['mood'] || 'quiet'
    formModel.value.visibility = meta['visibility'] || 'public'
    formModel.value.cover = meta['cover'] || '/assets/writing-camera.png'
    formModel.value.content = bodyContent.trim()
  } else {
    formModel.value.title = '导入文章'
    formModel.value.content = text.trim()
    formModel.value.tags = []
    formModel.value.summary = ''
    formModel.value.category = 'Thoughts'
    formModel.value.mood = 'quiet'
    formModel.value.visibility = 'public'
    formModel.value.cover = '/assets/writing-camera.png'
  }
}

// 图册封面选择器
const openGallerySelector = async () => {
  galleryLoading.value = true
  showGallerySelectModal.value = true
  try {
    const response = await getFileList()
    if (response.data?.code === 200) {
      const allFiles = response.data.data || []
      const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico']
      galleryList.value = allFiles
        .filter((file: any) => {
          const name = file.fileName || ''
          const ext = name.substring(name.lastIndexOf('.') + 1).toLowerCase()
          return imageExtensions.includes(ext)
        })
        .map((file: any) => ({
          id: file.fileName,
          src: file.url
        }))
    }
  } catch (err) {
    console.error('Failed to load files for cover selection', err)
  } finally {
    galleryLoading.value = false
  }
}

const handleSelectGalleryCover = (src: string) => {
  formModel.value.cover = src
  message.success('已应用所选图册照片为封面 🖼️')
}

// GSAP 动画处理
watch(showEditor, (newVal) => {
  nextTick(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !articlesRef.value) return
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
        gsap.from('.article-row', {
          y: 14,
          opacity: 0,
          duration: 0.42,
          stagger: 0.04,
          ease: 'power2.out',
          overwrite: 'auto'
        })
      }
    }, articlesRef.value)
  })
})

watch(filteredBlogs, () => {
  if (showEditor.value) return
  nextTick(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !articlesRef.value) return
    gsapCtx?.revert()
    gsapCtx = gsap.context(() => {
      gsap.from('.article-row', {
        y: 14,
        opacity: 0,
        duration: 0.42,
        stagger: 0.04,
        ease: 'power2.out',
        overwrite: 'auto'
      })
    }, articlesRef.value)
  })
})

onMounted(() => {
  fetchBlogs()
  fetchCategories()
})

onUnmounted(() => {
  gsapCtx?.revert()
})
</script>
