<template>
  <n-config-provider
    :theme="isDark ? darkTheme : null"
    :theme-overrides="activeThemeOverrides"
  >
    <n-loading-bar-provider>
      <n-dialog-provider>
        <n-message-provider>
          <router-view />
        </n-message-provider>
      </n-dialog-provider>
    </n-loading-bar-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { darkTheme, NConfigProvider, NDialogProvider, NLoadingBarProvider, NMessageProvider } from 'naive-ui'
import type { GlobalThemeOverrides } from 'naive-ui'
import { getPublicConfig } from '@/api/config'

type ThemeMode = 'light' | 'dark'

const themeMode = ref<ThemeMode>('light')

const lightThemeOverrides = ref<GlobalThemeOverrides>({
  common: {
    primaryColor: '#D9865F',
    primaryColorHover: '#E79870',
    primaryColorPressed: '#C9704E',
    primaryColorSuppl: '#F1B894',
    infoColor: '#6688A3',
    successColor: '#6F9569',
    warningColor: '#D99B5D',
    errorColor: '#C85E5A',
    borderRadius: '16px',
    textColor1: '#223326',
    textColor2: 'rgba(34, 51, 38, 0.74)',
    textColor3: 'rgba(34, 51, 38, 0.54)',
    borderColor: 'rgba(34, 51, 38, 0.12)',
    inputColor: '#FFFFFF',
    cardColor: 'rgba(255, 255, 255, 0.82)',
    popoverColor: '#FFFFFF',
    bodyColor: '#F7F8F1'
  },
  Button: {
    borderRadiusSmall: '999px',
    borderRadiusMedium: '999px',
    borderRadiusLarge: '999px',
    textColorText: '#223326',
    textColorTextHover: '#D9865F',
    textColorTextPressed: '#C9704E',
    borderHover: '1px solid rgba(217, 134, 95, 0.55)',
    borderPressed: '1px solid rgba(217, 134, 95, 0.75)',
    boxShadowFocus: '0 0 0 3px rgba(217, 134, 95, 0.18)'
  },
  Input: {
    borderRadius: '16px',
    color: '#FFFFFF',
    colorFocus: '#FFFFFF',
    border: '1px solid rgba(34, 51, 38, 0.12)',
    borderHover: '1px solid rgba(217, 134, 95, 0.48)',
    borderFocus: '1px solid rgba(217, 134, 95, 0.72)',
    boxShadowFocus: '0 0 0 3px rgba(217, 134, 95, 0.16)',
    placeholderColor: 'rgba(34, 51, 38, 0.42)'
  },
  Card: {
    borderRadius: '24px',
    borderColor: 'rgba(34, 51, 38, 0.1)',
    color: 'rgba(255, 255, 255, 0.84)',
    titleTextColor: '#223326',
    textColor: 'rgba(34, 51, 38, 0.72)'
  },
  Modal: {
    borderRadius: '24px',
    color: '#FFFFFF',
    titleTextColor: '#223326',
    textColor: 'rgba(34, 51, 38, 0.72)'
  },
  Dialog: {
    borderRadius: '22px',
    color: '#FFFFFF',
    titleTextColor: '#223326',
    textColor: 'rgba(34, 51, 38, 0.72)'
  }
})

const darkThemeOverrides = ref<GlobalThemeOverrides>({
  common: {
    primaryColor: '#F1A77C',
    primaryColorHover: '#F5B88F',
    primaryColorPressed: '#D9865F',
    primaryColorSuppl: '#F5C6A8',
    infoColor: '#86A7BE',
    successColor: '#9FBD8E',
    warningColor: '#EDB76E',
    errorColor: '#E17A76',
    borderRadius: '16px',
    textColor1: '#F1F4EA',
    textColor2: 'rgba(241, 244, 234, 0.76)',
    textColor3: 'rgba(241, 244, 234, 0.54)',
    borderColor: 'rgba(241, 244, 234, 0.14)',
    inputColor: 'rgba(255, 255, 255, 0.08)',
    cardColor: 'rgba(255, 255, 255, 0.08)',
    popoverColor: '#203027',
    bodyColor: '#17211B'
  },
  Button: {
    borderRadiusSmall: '999px',
    borderRadiusMedium: '999px',
    borderRadiusLarge: '999px',
    textColorText: '#F1F4EA',
    textColorTextHover: '#F1A77C',
    textColorTextPressed: '#F5C6A8',
    borderHover: '1px solid rgba(241, 167, 124, 0.55)',
    borderPressed: '1px solid rgba(241, 167, 124, 0.72)',
    boxShadowFocus: '0 0 0 3px rgba(241, 167, 124, 0.2)'
  },
  Input: {
    borderRadius: '16px',
    color: 'rgba(255, 255, 255, 0.08)',
    colorFocus: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(241, 244, 234, 0.14)',
    borderHover: '1px solid rgba(241, 167, 124, 0.5)',
    borderFocus: '1px solid rgba(241, 167, 124, 0.76)',
    boxShadowFocus: '0 0 0 3px rgba(241, 167, 124, 0.18)',
    placeholderColor: 'rgba(241, 244, 234, 0.42)'
  },
  Card: {
    borderRadius: '24px',
    borderColor: 'rgba(241, 244, 234, 0.14)',
    color: 'rgba(255, 255, 255, 0.08)',
    titleTextColor: '#F1F4EA',
    textColor: 'rgba(241, 244, 234, 0.76)'
  },
  Modal: {
    borderRadius: '24px',
    color: '#203027',
    titleTextColor: '#F1F4EA',
    textColor: 'rgba(241, 244, 234, 0.76)'
  },
  Dialog: {
    borderRadius: '22px',
    color: '#203027',
    titleTextColor: '#F1F4EA',
    textColor: 'rgba(241, 244, 234, 0.76)'
  }
})

// 亮度调整辅助函数，用于动态计算悬浮与按下色值
function adjustColor(hex: string, percent: number): string {
  // 如果是简写形式如 #fff, 补全为六位
  let color = hex;
  if (color.length === 4) {
    color = '#' + color[1] + color[1] + color[2] + color[2] + color[3] + color[3];
  }
  let R = parseInt(color.substring(1, 3), 16);
  let G = parseInt(color.substring(3, 5), 16);
  let B = parseInt(color.substring(5, 7), 16);

  R = Math.max(0, Math.min(255, R + percent));
  G = Math.max(0, Math.min(255, G + percent));
  B = Math.max(0, Math.min(255, B + percent));

  const rHex = R.toString(16).padStart(2, '0');
  const gHex = G.toString(16).padStart(2, '0');
  const bHex = B.toString(16).padStart(2, '0');

  return `#${rHex}${gHex}${bHex}`;
}

const isDark = computed(() => themeMode.value === 'dark')
const activeThemeOverrides = computed(() => (isDark.value ? darkThemeOverrides.value : lightThemeOverrides.value))

const applyTheme = (mode: ThemeMode) => {
  themeMode.value = mode
  document.documentElement.classList.toggle('dark', mode === 'dark')
}

const loadAndApplyTheme = async () => {
  try {
    const response = await getPublicConfig()
    if (response.data && response.data.code === 200) {
      const list = response.data.data || []
      const configMap: Record<string, string> = {}
      list.forEach((item: any) => {
        configMap[item.configKey] = item.configValue
      })

      // 检查是否启用了自定义主题
      if (configMap['page.theme.enabled'] !== 'true') {
        // 恢复 Naive UI 默认配色
        if (lightThemeOverrides.value.common) {
          lightThemeOverrides.value.common.primaryColor = '#D9865F'
          lightThemeOverrides.value.common.primaryColorHover = '#E79870'
          lightThemeOverrides.value.common.primaryColorPressed = '#C9704E'
          lightThemeOverrides.value.common.primaryColorSuppl = '#F1B894'
          lightThemeOverrides.value.common.bodyColor = '#F7F8F1'
        }
        if (darkThemeOverrides.value.common) {
          darkThemeOverrides.value.common.primaryColor = '#F1A77C'
          darkThemeOverrides.value.common.primaryColorHover = '#F5B88F'
          darkThemeOverrides.value.common.primaryColorPressed = '#D9865F'
          darkThemeOverrides.value.common.primaryColorSuppl = '#F5C6A8'
          darkThemeOverrides.value.common.bodyColor = '#17211B'
        }

        const defaultCss = `
          body {
            background-image: linear-gradient(
              to bottom, 
              rgba(247, 248, 241, 0.88) 0%, 
              rgba(238, 243, 231, 0.88) 100%
            ), url('/life-assets/bg-image.png') !important;
            background-size: cover !important;
            background-attachment: fixed !important;
            background-position: center !important;
            background-repeat: no-repeat !important;
          }
          html.dark body {
            background-image: linear-gradient(
              to bottom, 
              rgba(23, 33, 27, 0.9) 0%, 
              rgba(32, 48, 39, 0.9) 100%
            ), url('/life-assets/bg-image.png') !important;
          }
          .app-layout, .main-container, #admin-main {
            background: transparent !important;
          }
        `
        let styleEl = document.getElementById('custom-theme-style-admin')
        if (!styleEl) {
          styleEl = document.createElement('style')
          styleEl.id = 'custom-theme-style-admin'
          document.head.appendChild(styleEl)
        }
        styleEl.innerHTML = defaultCss
        return
      }

      const getValidVal = (key: string, fallback: string) => {
        const val = configMap[key]
        if (!val) return fallback
        const lower = val.trim().toLowerCase()
        if (lower === 'null' || lower === 'undefined' || lower === 'none' || lower === '') {
          return fallback
        }
        return val
      }

      const accent = getValidVal('page.theme.accentColor', '#D9865F')
      const accentSoft = getValidVal('page.theme.accentSoftColor', '#F1B894')
      const bg = getValidVal('page.theme.bgColor', '#F7F8F1')
      const bgSoft = getValidVal('page.theme.bgSoftColor', '#EAF0E5')

      const darkAccent = getValidVal('page.theme.darkAccentColor', '#F1A77C')
      const darkAccentSoft = getValidVal('page.theme.darkAccentSoftColor', '#F5C6A8')
      const darkBg = getValidVal('page.theme.darkBgColor', '#17211B')
      const darkBgSoft = getValidVal('page.theme.darkBgSoftColor', '#203027')

      // 更新 lightThemeOverrides 响应式变量
      if (lightThemeOverrides.value.common) {
        lightThemeOverrides.value.common.primaryColor = accent
        lightThemeOverrides.value.common.primaryColorHover = adjustColor(accent, 15)
        lightThemeOverrides.value.common.primaryColorPressed = adjustColor(accent, -15)
        lightThemeOverrides.value.common.primaryColorSuppl = accentSoft
        lightThemeOverrides.value.common.bodyColor = bg
      }

      // 更新 darkThemeOverrides 响应式变量
      if (darkThemeOverrides.value.common) {
        darkThemeOverrides.value.common.primaryColor = darkAccent
        darkThemeOverrides.value.common.primaryColorHover = adjustColor(darkAccent, 15)
        darkThemeOverrides.value.common.primaryColorPressed = adjustColor(darkAccent, -15)
        darkThemeOverrides.value.common.primaryColorSuppl = darkAccentSoft
        darkThemeOverrides.value.common.bodyColor = darkBg
      }

      const customBgImageUrl = getValidVal('page.theme.bgImageUrl', '/life-assets/bg-image.png')

      // 注入原生 CSS 变量覆盖
      const css = `
        :root {
          --archive-accent: ${accent} !important;
          --archive-accent-soft: ${accentSoft} !important;
          --archive-bg: ${bg} !important;
          --archive-bg-soft: ${bgSoft} !important;
        }
        html.dark {
          --archive-accent: ${darkAccent} !important;
          --archive-accent-soft: ${darkAccentSoft} !important;
          --archive-bg: ${darkBg} !important;
          --archive-bg-soft: ${darkBgSoft} !important;
        }
        
        body {
          background-image: linear-gradient(
            to bottom, 
            color-mix(in srgb, ${bg} 88%, transparent) 0%, 
            color-mix(in srgb, ${bgSoft} 88%, transparent) 100%
          ), url('${customBgImageUrl}') !important;
          background-size: cover !important;
          background-attachment: fixed !important;
          background-position: center !important;
          background-repeat: no-repeat !important;
        }
        html.dark body {
          background-image: linear-gradient(
            to bottom, 
            color-mix(in srgb, ${darkBg} 90%, transparent) 0%, 
            color-mix(in srgb, ${darkBgSoft} 90%, transparent) 100%
          ), url('${customBgImageUrl}') !important;
        }
        .app-layout, .main-container, #admin-main {
          background: transparent !important;
        }
      `
      let styleEl = document.getElementById('custom-theme-style-admin')
      if (!styleEl) {
        styleEl = document.createElement('style')
        styleEl.id = 'custom-theme-style-admin'
        document.head.appendChild(styleEl)
      }
      styleEl.innerHTML = css
    }
  } catch (err) {
    console.warn('Failed to load and apply dynamic config in admin app:', err)
  }
}

const handleThemeEvent = (event: Event) => {
  const nextTheme = (event as CustomEvent<{ theme?: ThemeMode }>).detail?.theme
  if (nextTheme === 'light' || nextTheme === 'dark') {
    applyTheme(nextTheme)
  }
}

let systemThemeQuery: MediaQueryList | null = null

const handleSystemTheme = (event: MediaQueryListEvent) => {
  if (!localStorage.getItem('atlas_theme')) {
    applyTheme(event.matches ? 'dark' : 'light')
  }
}

onMounted(() => {
  systemThemeQuery = window.matchMedia('(prefers-color-scheme: dark)')
  const savedTheme = localStorage.getItem('atlas_theme')
  const initialTheme: ThemeMode = savedTheme === 'dark' || (!savedTheme && systemThemeQuery.matches) ? 'dark' : 'light'

  applyTheme(initialTheme)
  loadAndApplyTheme()

  window.addEventListener('atlas-theme-change', handleThemeEvent)
  window.addEventListener('atlas-config-changed', loadAndApplyTheme)
  systemThemeQuery.addEventListener('change', handleSystemTheme)
})

onUnmounted(() => {
  window.removeEventListener('atlas-theme-change', handleThemeEvent)
  window.removeEventListener('atlas-config-changed', loadAndApplyTheme)
  systemThemeQuery?.removeEventListener('change', handleSystemTheme)
})
</script>
