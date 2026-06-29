<template>
  <div class="categories-desk space-y-6">
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <!-- 左侧：分类层级树卡片 -->
      <div class="lg:col-span-7">
        <CategoriesTree
          v-model:expandedIds="expandedIds"
          :loading="loading"
          :render-list="renderList"
          @refresh="fetchCategories"
          @add-child="addChild"
          @start-edit="startEdit"
          @delete="handleDelete"
        />
      </div>

      <!-- 右侧：表单配置 -->
      <div class="lg:col-span-5">
        <CategoryForm
          ref="formRef"
          v-model:formModel="formModel"
          :is-edit="isEdit"
          :submitting="submitting"
          :parent-category-options="parentCategoryOptions"
          :available-icons="availableIcons"
          :form-rules="formRules"
          :slug-dictionary="slugDictionary"
          @save="handleSubmit"
          @cancel="cancelEdit"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useMessage, useDialog } from 'naive-ui'
import { getCategoriesList, createCategory, updateCategory, deleteCategory } from '@/api/categories'
import type { Category } from '@/interface/love'

// 导入子组件
import CategoriesTree from './components/CategoriesTree.vue'
import CategoryForm from './components/CategoryForm.vue'

interface RenderItem {
  id: number
  name: string
  slug: string
  parentId: number
  icon: string
  depth: number
  hasChildren: boolean
}

const message = useMessage()
const dialog = useDialog()
const formRef = ref<any>(null)

const loading = ref(false)
const submitting = ref(false)
const isEdit = ref(false)
const categories = ref<Category[]>([])

// 展开的分类 ID 集合
const expandedIds = ref<Set<number>>(new Set())

// 可选专属图标列表
const availableIcons = [
  { class: 'i-mdi-heart-outline', name: '恋爱/随笔' },
  { class: 'i-mdi-code-tags', name: '代码/技术' },
  { class: 'i-mdi-lightbulb-on-outline', name: '思考/感悟' },
  { class: 'i-mdi-wallet-travel', name: '旅行/户外' },
  { class: 'i-mdi-camera-outline', name: '摄影/视觉' },
  { class: 'i-mdi-notebook-outline', name: '日常/记事' },
  { class: 'i-mdi-pine-tree', name: '自然/露营' },
  { class: 'i-mdi-music', name: '音乐/艺术' },
  { class: 'i-mdi-food-apple-outline', name: '美食/健康' },
  { class: 'i-mdi-run', name: '运动/跑步' },
  { class: 'i-mdi-car-outline', name: '出行/自驾' },
  { class: 'i-mdi-coffee-outline', name: '咖啡/下午' },
  { class: 'i-mdi-home-outline', name: '港湾/家具' },
  { class: 'i-mdi-key-outline', name: '隐私/安全' },
  { class: 'i-mdi-tag-outline', name: '标记/整理' },
  { class: 'i-mdi-star-outline', name: '珍贵/收藏' },
  { class: 'i-mdi-folder-outline', name: '通用文件夹' }
]

const formModel = ref({
  id: 0,
  relationType: 'top', // 'top' 顶级, 'existing' 已有父级, 'new' 直接新建父级
  parentId: null as number | null,
  name: '',
  slug: '',
  icon: 'i-mdi-folder-outline',

  // 直接新建父分类所需的字段
  newParentName: '',
  newParentSlug: '',
  newParentIcon: 'i-mdi-folder-outline'
})

const formRules = {
  name: { required: true, message: '请输入分类名称', trigger: 'blur' },
  slug: { 
    required: true, 
    trigger: 'blur',
    validator: (_rule: any, value: string) => {
      if (!value) return new Error('请输入别名 (Slug)')
      if (!/^[a-zA-Z0-9-_]+$/.test(value)) return new Error('别名只能由英文字母、数字、短横线-和下划线_组成')
      return true
    }
  },
  newParentName: {
    trigger: 'blur',
    validator: (_rule: any, value: string) => {
      if (!isEdit.value && formModel.value.relationType === 'new' && !value) {
        return new Error('请输入新父分类名称')
      }
      return true
    }
  },
  newParentSlug: {
    trigger: 'blur',
    validator: (_rule: any, value: string) => {
      if (!isEdit.value && formModel.value.relationType === 'new') {
        if (!value) return new Error('请输入新父分类别名 (Slug)')
        if (!/^[a-zA-Z0-9-_]+$/.test(value)) return new Error('别名只能由英文字母、数字、短横线-和下划线_组成')
      }
      return true
    }
  },
  parentId: {
    trigger: 'change',
    validator: (_rule: any, value: any) => {
      if (!isEdit.value && formModel.value.relationType === 'existing' && !value) {
        return new Error('请选择父级分类')
      }
      return true
    }
  }
}

// 自动推荐 Slug 的常用汉字英译字典，提供极致体验
const slugDictionary: Record<string, string> = {
  '恋爱': 'love',
  '代码': 'code',
  '想法': 'thoughts',
  '思考': 'thoughts',
  '日常': 'daily',
  '碎碎念': 'fragments',
  '随笔': 'essay',
  '日记': 'diary',
  '旅行': 'travel',
  '摄影': 'photography',
  '生活': 'life',
  '生活随笔': 'life-notes',
  '技术': 'tech',
  '技术积累': 'tech-notes',
  '前端': 'frontend',
  '后端': 'backend',
  '读书': 'reading',
  '电影': 'movies',
  '游戏': 'gaming'
}

// 获取分类树深度结构
const categoryTree = computed(() => {
  const map: Record<number, any> = {}
  const roots: any[] = []

  categories.value.forEach(cat => {
    map[cat.id] = { ...cat, children: [], hasChildren: false }
  })

  categories.value.forEach(cat => {
    const node = map[cat.id]
    if (!node) return
    const pId = cat.parentId || 0
    if (pId === 0) {
      roots.push(node)
    } else {
      const parentNode = map[pId]
      if (parentNode) {
        parentNode.children.push(node)
        parentNode.hasChildren = true
      } else {
        roots.push(node)
      }
    }
  })

  return roots
})

// 生成用于渲染的平铺列表 (带有深度属性 depth，支持展开折叠)
const renderList = computed(() => {
  const result: RenderItem[] = []

  const traverse = (node: any, depth: number) => {
    result.push({
      id: node.id,
      name: node.name,
      slug: node.slug,
      parentId: node.parentId,
      icon: node.icon,
      depth: depth,
      hasChildren: node.hasChildren
    })

    if (node.hasChildren && expandedIds.value.has(node.id)) {
      node.children.forEach((child: any) => traverse(child, depth + 1))
    }
  }

  categoryTree.value.forEach(root => traverse(root, 0))
  return result
})

// 右侧父级分类 TreeSelect 的下拉选项数据 (只允许选择顶级分类作为父分类)
const parentCategoryOptions = computed(() => {
  return categoryTree.value
    .filter(cat => cat.id !== formModel.value.id) // 排除自身
    .map(cat => ({
      label: cat.name,
      key: cat.id
    }))
})

// 快捷操作：给当前分类添加子类
const addChild = (item: RenderItem) => {
  cancelEdit()
  formModel.value.relationType = 'existing'
  formModel.value.parentId = item.id
  expandedIds.value.add(item.id)
}

// 快捷操作：编辑分类
const startEdit = (item: RenderItem) => {
  isEdit.value = true
  formModel.value = {
    id: item.id,
    relationType: item.parentId === 0 ? 'top' : 'existing',
    parentId: item.parentId === 0 ? null : item.parentId,
    name: item.name,
    slug: item.slug,
    icon: item.icon || 'i-mdi-folder-outline',
    newParentName: '',
    newParentSlug: '',
    newParentIcon: 'i-mdi-folder-outline'
  }
}

const cancelEdit = () => {
  isEdit.value = false
  formModel.value = {
    id: 0,
    relationType: 'top',
    parentId: null,
    name: '',
    slug: '',
    icon: 'i-mdi-folder-outline',
    newParentName: '',
    newParentSlug: '',
    newParentIcon: 'i-mdi-folder-outline'
  }
  formRef.value?.restoreValidation()
}

// 获取后端分类数据
const fetchCategories = async () => {
  loading.value = true
  try {
    const response = await getCategoriesList()
    if (response.data?.code !== 200) {
      throw new Error(response.data?.msg || '拉取分类失败')
    }
    categories.value = response.data.data
    
    // 默认展开所有含有子节点的父节点，方便用户管理
    categoryTree.value.forEach(node => {
      if (node.hasChildren) {
        expandedIds.value.add(node.id)
      }
    })
  } catch (err: any) {
    message.error('无法连接到后台 API 服务器。已降级至本地模拟数据模式运行 📌')
    // 降级使用 mock 数据
    categories.value = [
      { id: 1, name: '恋爱', slug: 'love', parentId: 0, icon: 'i-mdi-heart-outline' },
      { id: 2, name: '代码', slug: 'code', parentId: 0, icon: 'i-mdi-code-tags' },
      { id: 3, name: '旅行', slug: 'travel', parentId: 1, icon: 'i-mdi-wallet-travel' },
      { id: 4, name: '日常', slug: 'daily-love', parentId: 1, icon: 'i-mdi-notebook-outline' },
      { id: 5, name: 'Vue', slug: 'vue', parentId: 2, icon: 'i-mdi-code-tags' },
      { id: 6, name: 'Spring Boot', slug: 'spring-boot', parentId: 2, icon: 'i-mdi-code-tags' },
      { id: 7, name: '思考', slug: 'thoughts', parentId: 0, icon: 'i-mdi-lightbulb-on-outline' },
      { id: 8, name: '碎碎念', slug: 'fragments', parentId: 0, icon: 'i-mdi-tag-outline' }
    ]
  } finally {
    loading.value = false
  }
}

// 提交创建或编辑表单
const handleSubmit = async () => {
  submitting.value = true
  try {
    if (isEdit.value) {
      // 编辑分类状态
      const payload = {
        id: formModel.value.id,
        parentId: formModel.value.parentId || 0,
        name: formModel.value.name.trim(),
        slug: formModel.value.slug.trim(),
        icon: formModel.value.icon
      }

      const response = await updateCategory(payload)
      if (response.data?.code !== 200) {
        throw new Error(response.data?.msg || '分类更新失败')
      }
      message.success('分类已成功更新')
      cancelEdit()
      await fetchCategories()
    } else {
      // 新建分类状态
      let targetParentId = 0

      if (formModel.value.relationType === 'existing') {
        targetParentId = formModel.value.parentId || 0
      } else if (formModel.value.relationType === 'new') {
        // 第一步：链式创建新的父分类
        const parentPayload = {
          parentId: 0,
          name: formModel.value.newParentName.trim(),
          slug: formModel.value.newParentSlug.trim(),
          icon: formModel.value.newParentIcon
        }
        
        message.info(`正在建立新父分类「${parentPayload.name}」...`)
        const parentResponse = await createCategory(parentPayload)
        
        if (parentResponse.data?.code !== 200) {
          throw new Error(parentResponse.data?.msg || '父分类创建失败，中止关联')
        }
        targetParentId = parentResponse.data.data.id
        message.success(`父分类「${parentPayload.name}」建立成功`)
      }

      // 第二步：创建当前分类并关联
      const childPayload = {
        parentId: targetParentId,
        name: formModel.value.name.trim(),
        slug: formModel.value.slug.trim(),
        icon: formModel.value.icon
      }

      const response = await createCategory(childPayload)
      if (response.data?.code !== 200) {
        throw new Error(response.data?.msg || '子分类创建失败')
      }
      message.success('新子分类已关联创建成功')
      cancelEdit()
      await fetchCategories()
    }
  } catch (err: any) {
    console.warn('Backend API unavailable, executing local mock CRUD.', err)
    // 内存降级模拟
    if (isEdit.value) {
      const idx = categories.value.findIndex(c => c.id === formModel.value.id)
      if (idx !== -1) {
        categories.value[idx] = {
          ...categories.value[idx],
          parentId: formModel.value.parentId || 0,
          name: formModel.value.name.trim(),
          slug: formModel.value.slug.trim(),
          icon: formModel.value.icon
        }
      }
      message.success('分类更新成功 (本地临时模拟)')
    } else {
      let parentId = 0
      if (formModel.value.relationType === 'existing') {
        parentId = formModel.value.parentId || 0
      } else if (formModel.value.relationType === 'new') {
        // 本地模拟创建新父分类
        parentId = Math.max(...categories.value.map(c => c.id), 100) + 1
        categories.value.push({
          id: parentId,
          parentId: 0,
          name: formModel.value.newParentName.trim(),
          slug: formModel.value.newParentSlug.trim(),
          icon: formModel.value.newParentIcon
        })
      }
      
      const childId = Math.max(...categories.value.map(c => c.id), 100) + 1
      categories.value.push({
        id: childId,
        parentId: parentId,
        name: formModel.value.name.trim(),
        slug: formModel.value.slug.trim(),
        icon: formModel.value.icon
      })
      message.success('新分类创建并成功关联 (本地临时模拟)')
    }
    cancelEdit()
  } finally {
    submitting.value = false
  }
}

// 删除分类
const handleDelete = (item: RenderItem) => {
  const content = item.hasChildren 
    ? `确认删除分类「${item.name}」？此操作将级联删除其下的所有子分类，且被关联文章将自动取消此分类归属。`
    : `确认删除分类「${item.name}」？被关联文章将自动取消此分类归属。`

  dialog.warning({
    title: '危险操作 - 删除分类',
    content: content,
    positiveText: '确认删除',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        const response = await deleteCategory(item.id)
        if (response.data?.code !== 200) {
          throw new Error(response.data?.msg || '删除分类失败')
        }
        message.success('分类已成功删除')
        cancelEdit()
        await fetchCategories()
      } catch (err: any) {
        console.warn('Backend API unavailable, deleting locally.', err)
        // 内存降级删除
        const deleteMockRecursively = (id: number) => {
          const children = categories.value.filter(c => c.parentId === id)
          children.forEach(c => deleteMockRecursively(c.id))
          categories.value = categories.value.filter(c => c.id !== id)
        }
        deleteMockRecursively(item.id)
        message.success('分类已删除 (本地临时模拟)')
        cancelEdit()
      }
    }
  })
}

onMounted(() => {
  fetchCategories()
})
</script>
