import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi, userApi } from '@/api'

interface UserInfo {
  id: number
  nickname: string
  avatar: string | null
  coins: number
  vip_status: string
  vip_expire_time: string | null
  invite_code: string
}

export const useUserStore = defineStore('user', () => {
  const token = ref<string>(localStorage.getItem('token') || '')
  const userInfo = ref<UserInfo | null>(null)

  const isLoggedIn = computed(() => !!token.value)
  const isVip = computed(() => userInfo.value?.vip_status === 'active')
  const coinBalance = computed(() => userInfo.value?.coins || 0)
  const profile = computed(() => userInfo.value)

  function setToken(t: string) {
    token.value = t
    localStorage.setItem('token', t)
  }

  // 设置认证信息
  function setAuth(t: string, user: UserInfo) {
    token.value = t
    userInfo.value = user
    localStorage.setItem('token', t)
    localStorage.setItem('user', JSON.stringify(user))
  }

  // TikTok 登录
  async function tiktokLogin(tt_open_id: string, nickname?: string, avatar?: string) {
    const res: any = await authApi.tiktokLogin({ tt_open_id, nickname, avatar })
    setAuth(res.token, res.user)
    return res
  }

  // H5 登录
  async function h5Login(phone: string, sms_code?: string) {
    const res: any = await authApi.h5Login({ phone, sms_code })
    setAuth(res.token, res.user)
    return res
  }

  // 获取用户信息
  async function fetchProfile() {
    if (!token.value) return
    try {
      const res: any = await userApi.getProfile()
      userInfo.value = res
      localStorage.setItem('user', JSON.stringify(res))
    } catch (e) {
      console.error('获取用户信息失败', e)
    }
  }

  // 登出
  function logout() {
    token.value = ''
    userInfo.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  // 初始化：从 localStorage 恢复
  function init() {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      try {
        userInfo.value = JSON.parse(savedUser)
      } catch (e) {}
    }
    if (token.value) {
      fetchProfile()
    }
  }

  return {
    token, userInfo, isLoggedIn, isVip, coinBalance, profile,
    setAuth, setToken, tiktokLogin, h5Login, fetchProfile, logout, init,
  }
})
