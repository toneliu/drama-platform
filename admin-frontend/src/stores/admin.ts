import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAdminStore = defineStore('admin', () => {
  const token = ref<string>(localStorage.getItem('admin_token') || '')
  const username = ref<string>(localStorage.getItem('admin_username') || '')

  const isLoggedIn = computed(() => !!token.value)

  function setAuth(t: string, name: string) {
    token.value = t
    username.value = name
    localStorage.setItem('admin_token', t)
    localStorage.setItem('admin_username', name)
  }

  function logout() {
    token.value = ''
    username.value = ''
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_username')
  }

  return { token, username, isLoggedIn, setAuth, logout }
})
