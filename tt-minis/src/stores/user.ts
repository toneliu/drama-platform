import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi, userApi } from '@/api'
import { ttSDK } from '@/utils/tt'

interface UserInfo {
  id: number
  nickname: string
  avatar: string | null
  coins: number
  vip_status: string
  vip_expire_time: string | null
}

export const useUserStore = defineStore('user', () => {
  const token = ref<string>(localStorage.getItem('tt_token') || '')
  const userInfo = ref<UserInfo | null>(null)
  const ttOpenId = ref<string>(localStorage.getItem('tt_open_id') || '')

  const isLoggedIn = computed(() => !!token.value)
  const isVip = computed(() => userInfo.value?.vip_status === 'active')
  const coins = computed(() => userInfo.value?.coins || 0)
  const avatar = computed(() => userInfo.value?.avatar || '')
  const nickname = computed(() => userInfo.value?.nickname || '未登录')

  // 自动登录
  async function autoLogin() {
    if (token.value) {
      await fetchProfile()
    } else {
      await login()
    }
  }

  function setAuth(t: string, user: UserInfo) {
    token.value = t
    userInfo.value = user
    localStorage.setItem('tt_token', t)
    localStorage.setItem('tt_user', JSON.stringify(user))
  }

  // TikTok 小程序登录
  async function login() {
    try {
      const code = await ttSDK.login()
      const ttUserInfo = await ttSDK.getUserInfo()

      const res: any = await authApi.tiktokLogin({
        tt_open_id: ttUserInfo.openId || code,
        nickname: ttUserInfo.nickname,
        avatar: ttUserInfo.avatarUrl,
      })

      setAuth(res.token, res.user)
      ttOpenId.value = ttUserInfo.openId || code
      localStorage.setItem('tt_open_id', ttOpenId.value)

      return res
    } catch (e) {
      console.error('登录失败', e)
      throw e
    }
  }

  async function fetchProfile() {
    if (!token.value) return
    try {
      const res: any = await userApi.getProfile()
      userInfo.value = res
      localStorage.setItem('tt_user', JSON.stringify(res))
    } catch (e) {
      console.error('获取用户信息失败', e)
    }
  }

  function logout() {
    token.value = ''
    userInfo.value = null
    localStorage.removeItem('tt_token')
    localStorage.removeItem('tt_user')
  }

  function init() {
    const savedUser = localStorage.getItem('tt_user')
    if (savedUser) {
      try { userInfo.value = JSON.parse(savedUser) } catch (e) {}
    }
    if (token.value) fetchProfile()
  }

  // 刷新用户信息
  async function refreshUserInfo() {
    await fetchProfile()
  }

  // 增加金币（UI用）
  function addCoins(amount: number) {
    if (userInfo.value) {
      userInfo.value = { ...userInfo.value, coins: userInfo.value.coins + amount }
    }
  }

  return {
    token, userInfo, ttOpenId, isLoggedIn, isVip, coins, avatar, nickname,
    setAuth, login, fetchProfile, logout, init, refreshUserInfo, autoLogin, addCoins,
  }
})
