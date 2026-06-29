<template>
  <div ref="pageRef" class="app-shell bg-transparent flex min-h-dvh items-center justify-center px-4 py-8 sm:px-6">
    <button class="icon-button absolute right-4 top-4 z-10 sm:right-6 sm:top-6" type="button" :aria-label="themeLabel"
      @click="toggleTheme">
      <span :class="theme === 'dark' ? 'i-mdi-white-balance-sunny' : 'i-mdi-weather-night'" class="text-lg"></span>
    </button>

    <div class="archive-card overflow-hidden grid w-full max-w-5xl grid-cols-1 lg:grid-cols-[1.08fr_0.92fr] gap-0">
      <section class="login-visual relative min-h-90 overflow-hidden p-6 sm:min-h-130 sm:p-8">
        <img src="/life-assets/bg-image.png" alt="月色和花枝" class="life-image absolute inset-0" />
        <div class="image-scrim"></div>
        <div class="relative z-10 flex h-full flex-col justify-between">
          <router-link :to="{ name: 'Dashboard' }"
            class="inline-flex w-fit items-center gap-2 rounded-full border border-white/22 bg-white/16 px-3 py-2 text-sm font-650 text-white backdrop-blur-md">
            <span class="i-mdi-home-heart text-base"></span>
            春风不解别离
          </router-link>
        </div>
      </section>

      <section class="login-form-container flex flex-col justify-center p-6 sm:p-8">
        <div class="mb-8">
          <p class="m-0 text-sm font-650 tone-accent">欢迎回来</p>
          <h2 class="m-0 mt-2 text-3xl font-760 tracking-[-0.03em] text-(--archive-text)">进入后台</h2>
          <p class="m-0 mt-3 text-sm leading-6 tone-muted">
            后端不可用时仍可进入本地预览模式，方便检查界面和交互。
          </p>
        </div>

        <n-form ref="formRef" :model="formValue" :rules="rules" size="large" label-placement="top">
          <n-form-item label="管理员账号" path="username">
            <n-input v-model:value="formValue.username" placeholder="请输入管理员账号">
              <template #prefix>
                <span class="i-mdi-account-outline tone-faint text-lg"></span>
              </template>
            </n-input>
          </n-form-item>

          <n-form-item label="登录密码" path="password">
            <n-input v-model:value="formValue.password" type="password" show-password-on="mousedown"
              placeholder="请输入登录密码" @keyup.enter="handleLogin">
              <template #prefix>
                <span class="i-mdi-lock-outline tone-faint text-lg"></span>
              </template>
            </n-input>
          </n-form-item>

          <n-button type="primary" block size="large" :loading="loading" class="mt-4" @click="handleLogin">
            登录
          </n-button>
        </n-form>

        <div class="mt-8 grid gap-3 sm:grid-cols-2">
          <div class="soft-panel p-4">
            <p class="m-0 text-sm font-700 text-(--archive-text)">文章</p>
            <p class="m-0 mt-1 text-xs leading-5 tone-muted">管理随笔、摘要和标签。</p>
          </div>
          <div class="soft-panel p-4">
            <p class="m-0 text-sm font-700 text-(--archive-text)">状态</p>
            <p class="m-0 mt-1 text-xs leading-5 tone-muted">查看访问和分类概览。</p>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { NButton, NForm, NFormItem, NInput, useMessage } from 'naive-ui'
import type { FormInst } from 'naive-ui'
import { login } from '@/api/auth'
import { gsap } from 'gsap'

type ThemeMode = 'light' | 'dark'

const router = useRouter()
const message = useMessage()
const formRef = ref<FormInst | null>(null)
const pageRef = ref<HTMLElement | null>(null)
const loading = ref(false)
const theme = ref<ThemeMode>('light')
let gsapCtx: gsap.Context | null = null

const formValue = ref({
  username: '',
  password: ''
})

const rules = {
  username: { required: true, message: '请输入管理员账号', trigger: 'blur' },
  password: { required: true, message: '请输入登录密码', trigger: 'blur' }
}

const themeLabel = computed(() => (theme.value === 'dark' ? '切换到浅色模式' : '切换到深色模式'))

const applyTheme = (nextTheme: ThemeMode) => {
  theme.value = nextTheme
  localStorage.setItem('atlas_theme', nextTheme)
  document.documentElement.classList.toggle('dark', nextTheme === 'dark')
  window.dispatchEvent(new CustomEvent('atlas-theme-change', { detail: { theme: nextTheme } }))
}

const toggleTheme = () => {
  applyTheme(theme.value === 'dark' ? 'light' : 'dark')
}

const handleLogin = () => {
  formRef.value?.validate(async (errors) => {
    if (errors) return

    loading.value = true
    try {
      const formData = new URLSearchParams()
      formData.append('username', formValue.value.username)
      formData.append('password', formValue.value.password)

      const response = await login(formData)

      if (response.data && response.data.code === 200) {
        const token = response.data.data.token
        localStorage.setItem('satoken', token)
        message.success('登录成功')
        router.push('/')
      } else {
        message.error(response.data.msg || '登录失败，请检查账号和密码')
      }
    } catch (err) {
      console.error('Backend server connection failed', err)
      message.error('登录失败，后端服务连接异常')
    } finally {
      loading.value = false
    }
  })
}

onMounted(() => {
  theme.value = document.documentElement.classList.contains('dark') ? 'dark' : 'light'

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !pageRef.value) return
  gsapCtx = gsap.context(() => {
    gsap.from('.login-visual', {
      y: 18,
      opacity: 0,
      duration: 0.55,
      ease: 'power2.out'
    })
    gsap.from('.login-form-container', {
      y: 22,
      opacity: 0,
      duration: 0.55,
      ease: 'power2.out',
      delay: 0.08
    })
  }, pageRef.value)
})

onUnmounted(() => {
  gsapCtx?.revert()
})
</script>
