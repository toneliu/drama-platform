import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getUserProfile } from '@/api/user'
import type { UserProfile } from '@/api/user'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  const profile = ref<UserProfile | null>(null)

  const isLoggedIn = computed(() => !!token.value)
  const coinBalance = computed(() => profile.value?.coinBalance ?? 0)
  const isVip = computed(() => profile.value?.isVip ?? false)
  const vipExpireAt = computed(() => profile.value?.vipExpireAt ?? '')

  function setToken(newToken: string) {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }

  function clearToken() {
    token.value = ''
    localStorage.removeItem('token')
    profile.value = null
  }

  async function fetchProfile() {
    if (!token.value) return
    try {
      const data = await getUserProfile()
      profile.value = data
    } catch (e) {
      console.error('Failed to fetch profile:', e)
    }
  }

  function logout() {
    clearToken()
  }

  return {
    token,
    profile,
    isLoggedIn,
    coinBalance,
    isVip,
    vipExpireAt,
    setToken,
    clearToken,
    fetchProfile,
    logout,
  }
})
