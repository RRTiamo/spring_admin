import axios from 'axios'
import router from '@/router'

// 转换本地时间格式 YYYY-MM-DD HH:mm:ss
function formatLocalDate(date: Date): string {
  const pad = (num: number) => String(num).padStart(2, '0')
  const year = date.getFullYear()
  const month = pad(date.getMonth() + 1)
  const day = pad(date.getDate())
  const hours = pad(date.getHours())
  const minutes = pad(date.getMinutes())
  const seconds = pad(date.getSeconds())
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

// 递归处理请求体/Query参数中的日期和ISO时间字符串
function processDates(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj
  }

  // Date 实例直接格式化
  if (obj instanceof Date) {
    return formatLocalDate(obj)
  }

  // ISO 8601 字符串格式，顶层直接拦截处理
  if (typeof obj === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/.test(obj)) {
    const d = new Date(obj)
    if (!isNaN(d.getTime())) {
      return formatLocalDate(d)
    }
  }

  // 数组
  if (Array.isArray(obj)) {
    return obj.map(item => processDates(item))
  }

  // 排除特殊的浏览器对象 (FormData, URLSearchParams, Blob, File)
  const isBrowserObject = (val: any) => {
    return (
      (typeof window !== 'undefined') && (
        (typeof FormData !== 'undefined' && val instanceof FormData) ||
        (typeof URLSearchParams !== 'undefined' && val instanceof URLSearchParams) ||
        (typeof Blob !== 'undefined' && val instanceof Blob) ||
        (typeof File !== 'undefined' && val instanceof File)
      )
    )
  }

  // 普通对象
  if (typeof obj === 'object' && !isBrowserObject(obj)) {
    const newObj: any = {}
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        newObj[key] = processDates(obj[key])
      }
    }
    return newObj
  }

  return obj
}

const request = axios.create({
  baseURL: 'http://localhost:8080/api',
  timeout: 15000,
})

// 请求拦截器，自动注入 satoken
request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('satoken')
    if (token) {
      config.headers.satoken = token
    }
    
    // 自动对请求参数进行日期格式化
    if (config.data) {
      config.data = processDates(config.data)
    }
    if (config.params) {
      config.params = processDates(config.params)
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器，自动捕获 Sa-Token 失效或者未登录 401 并重定向
request.interceptors.response.use(
  (response) => {
    if (response.data && response.data.code === 401) {
      localStorage.removeItem('satoken')
      if (router.currentRoute.value.path !== '/login') {
        router.push('/login')
      }
    }
    return response
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('satoken')
      if (router.currentRoute.value.path !== '/login') {
        router.push('/login')
      }
    }
    return Promise.reject(error)
  }
)

export default request
