import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import UnoCSS from 'unocss/vite'
import { fileURLToPath, URL } from 'node:url'
import {
  extractorSplit,
  presetAttributify,
  presetIcons,
  presetUno,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const devApiTarget = env.VITE_DEV_API_TARGET || 'http://localhost:8080'

  return {
    server: {
      proxy: {
        '/api': {
          target: devApiTarget,
          changeOrigin: true,
        },
      },
    },
  plugins: [
    vue(),
    UnoCSS({
      safelist: [
        'i-mdi-trophy-outline',
        'i-mdi-medal-outline',
        'i-mdi-file-certificate-outline',
        'i-mdi-school-outline',
        'i-mdi-briefcase-outline',
        'i-mdi-heart-outline',
        'i-mdi-bowl-mix-outline',
        'i-mdi-book-open-variant',
        'i-mdi-star-outline',
        'i-mdi-earth',
        'i-mdi-upload',
        // 侧边栏及核心功能图标
        'i-mdi-view-dashboard-outline',
        'i-mdi-text-box-multiple-outline',
        'i-mdi-folder-multiple-outline',
        'i-mdi-image-multiple-outline',
        'i-mdi-clock-outline',
        'i-mdi-notebook-outline',
        'i-mdi-cog-outline',
        'i-mdi-fish',
        'i-mdi-link-variant'
      ],
      presets: [
        presetUno(),
        presetAttributify(),
        presetIcons({
          scale: 1.2,
          warn: true,
        }),
      ],
      transformers: [
        transformerDirectives(),
        transformerVariantGroup(),
      ],
      extractors: [
        extractorSplit,
        {
          name: 'parentheses-extractor',
          order: 0,
          extract({ code }) {
            const matches = code.matchAll(/(?:[\w:-]+:)?(?:bg|text|border|ring)-\((--[\w-]+)\)(?:\/\d+)?/g)
            return new Set(Array.from(matches).map(m => m[0]))
          }
        }
      ],
      rules: [
        [/^bg-\((--[\w-]+)\)(?:\/(\d+))?$/, ([, varName, opacity]) => {
          if (opacity) {
            return { 'background-color': `color-mix(in srgb, var(${varName}) ${opacity}%, transparent)` }
          }
          return { 'background-color': `var(${varName})` }
        }],
        [/^bg---([\w-]+)(?:\/(\d+))?$/, ([, varName, opacity]) => {
          const fullVar = `--${varName}`
          if (opacity) {
            return { 'background-color': `color-mix(in srgb, var(${fullVar}) ${opacity}%, transparent)` }
          }
          return { 'background-color': `var(${fullVar})` }
        }],
        [/^text-\((--[\w-]+)\)(?:\/(\d+))?$/, ([, varName, opacity]) => {
          if (opacity) {
            return { 'color': `color-mix(in srgb, var(${varName}) ${opacity}%, transparent)` }
          }
          return { 'color': `var(${varName})` }
        }],
        [/^text---([\w-]+)(?:\/(\d+))?$/, ([, varName, opacity]) => {
          const fullVar = `--${varName}`
          if (opacity) {
            return { 'color': `color-mix(in srgb, var(${fullVar}) ${opacity}%, transparent)` }
          }
          return { 'color': `var(${fullVar})` }
        }],
        [/^border-\((--[\w-]+)\)(?:\/(\d+))?$/, ([, varName, opacity]) => {
          if (opacity) {
            return { 'border-color': `color-mix(in srgb, var(${varName}) ${opacity}%, transparent)` }
          }
          return { 'border-color': `var(${varName})` }
        }],
        [/^border---([\w-]+)(?:\/(\d+))?$/, ([, varName, opacity]) => {
          const fullVar = `--${varName}`
          if (opacity) {
            return { 'border-color': `color-mix(in srgb, var(${fullVar}) ${opacity}%, transparent)` }
          }
          return { 'border-color': `var(${fullVar})` }
        }],
        [/^ring-\((--[\w-]+)\)(?:\/(\d+))?$/, ([, varName, opacity]) => {
          if (opacity) {
            return { '--un-ring-color': `color-mix(in srgb, var(${varName}) ${opacity}%, transparent)` }
          }
          return { '--un-ring-color': `var(${varName})` }
        }],
        [/^ring---([\w-]+)(?:\/(\d+))?$/, ([, varName, opacity]) => {
          const fullVar = `--${varName}`
          if (opacity) {
            return { '--un-ring-color': `color-mix(in srgb, var(${fullVar}) ${opacity}%, transparent)` }
          }
          return { '--un-ring-color': `var(${fullVar})` }
        }]
      ],
      theme: {
        colors: {
          primary: '#D9865F',
        }
      }
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
    }
  }
})
