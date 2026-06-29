import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginScreen.vue'),
    meta: { title: '管理后台登录' }
  },
  {
    path: '/',
    component: () => import('@/views/ShellLayout.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/DashboardHome.vue'),
        meta: { title: '仪表盘 - 个人博客', requiresAuth: true }
      },
      {
        path: 'articles',
        name: 'Articles',
        component: () => import('@/views/articles/index.vue'),
        meta: { title: '文章管理 - 个人博客', requiresAuth: true }
      },
      {
        path: 'categories',
        name: 'Categories',
        component: () => import('@/views/categories/index.vue'),
        meta: { title: '分类管理 - 个人博客', requiresAuth: true }
      },
      {
        path: 'love',
        name: 'Love',
        component: () => import('@/views/love/index.vue'),
        meta: { title: '恋爱日记管理 - 个人博客', requiresAuth: true }
      },
      {
        path: 'letter',
        name: 'Letter',
        component: () => import('@/views/letter/index.vue'),
        meta: { title: '岁月信箱管理 - 个人博客', requiresAuth: true }
      },
      {
        path: 'gallery',
        name: 'Gallery',
        component: () => import('@/views/gallery/index.vue'),
        meta: { title: '照片墙管理 - 个人博客', requiresAuth: true }
      },
      {
        path: 'now',
        name: 'Now',
        component: () => import('@/views/now/index.vue'),
        meta: { title: '此时此刻管理 - 个人博客', requiresAuth: true }
      },
      {
        path: 'about',
        name: 'About',
        component: () => import('@/views/about/index.vue'),
        meta: { title: '关于作者配置 - 个人博客', requiresAuth: true }
      },
      {
        path: 'config',
        name: 'Config',
        component: () => import('@/views/config/index.vue'),
        meta: { title: '系统配置 - 个人博客', requiresAuth: true }
      },
      {
        path: 'notes',
        name: 'Notes',
        component: () => import('@/views/notes/index.vue'),
        meta: { title: '随笔便签管理 - 个人博客', requiresAuth: true }
      },
      {
        path: 'achievements',
        name: 'Achievements',
        component: () => import('@/views/achievements/index.vue'),
        meta: { title: '成就奖状管理 - 个人博客', requiresAuth: true }
      },
      {
        path: 'pond',
        name: 'PondFeedback',
        component: () => import('@/views/pond/index.vue'),
        meta: { title: '鱼塘反馈管理 - 个人博客', requiresAuth: true }
      },
      {
        path: 'links',
        name: 'Links',
        component: () => import('@/views/links/index.vue'),
        meta: { title: '友情链接管理 - 个人博客', requiresAuth: true }
      },
      {
        path: 'files',
        name: 'Files',
        component: () => import('@/views/files/index.vue'),
        meta: { title: '文件管理 - 个人博客', requiresAuth: true }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Authentication navigation guard
router.beforeEach((to, _from, next) => {
  document.title = (to.meta.title as string) || '个人博客后台'
  
  const token = localStorage.getItem('satoken')
  if (to.meta.requiresAuth && !token) {
    next('/login')
  } else {
    next()
  }
})

export default router
