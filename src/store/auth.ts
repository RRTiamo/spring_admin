import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('satoken') || '')
  const username = ref('admin')

  const setToken = (newToken: string) => {
    token.value = newToken
    localStorage.setItem('satoken', newToken)
  }

  const clearToken = () => {
    token.value = ''
    localStorage.removeItem('satoken')
  }

  return {
    token,
    username,
    setToken,
    clearToken
  }
})
