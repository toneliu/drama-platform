import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ttSDK } from '@/utils/tt'
import { userApi } from '@/api/user'

export const useUserStore = defineStore('user', () => {
  const ttOpenId = ref('')
  const nickname = ref('')
  const avatar = ref('')
  const coins = ref(0)
  const vipLevel = ref(0)
  const vipExpireAt = ref('')
  const isLoggedIn = ref(false)
  const token = ref('')

  const isVip = computed(() => vipLevel.value > 0 && new Date(vipExpireAt.value) > new Date())

  async function autoLogin() {
    try {
      const { tt_open_id } = await ttSDK.login()
      ttOpenId.value = tt_open_id

      const userInfo = await ttSDK.getUserInfo()
      nickname.value = userInfo.nickname
      avatar.value = userInfo.avatar

      // 向后端换取 JWT
      const res = await userApi.loginWithTT(tt_open_id)
      token.value = res.data.token
      coins.value = res.data.coins
      vipLevel.value = res.data.vip_level
      vipExpireAt.value = res.data.vip_expire_at
      isLoggedIn.value = true

      // 存储 token
      localStorage.setItem('tt_token', token.value)
    } catch (e) {
      console.warn('自动登录失败，使用游客模式', e)
      isLoggedIn.value = false
    }
  }

  async function refreshUserInfo() {
    if (!isLoggedIn.value) return
    try {
      const res = await userApi.getProfile()
      coins.value = res.data.coins
      vipLevel.value = res.data.vip_level
      vipExpireAt.value = res.data.vip_expire_at
      nickname.value = res.data.nickname || nickname.value
      avatar.value = res.data.avatar || avatar.value
    } catch (e) {
      console.error('刷新用户信息失败', e)
    }
  }

  function logout() {
    ttOpenId.value = ''
    nickname.value = ''
    avatar.value = ''
    coins.value = 0
    vipLevel.value = 0
    vipExpireAt.value = ''
    isLoggedIn.value = false
    token.value = ''
    localStorage.removeItem('tt_token')
  }

  return {
    ttOpenId, nickname, avatar, coins, vipLevel, vipExpireAt,
    isLoggedIn, token, isVip,
    autoLogin, refreshUserInfo, logout,
  }
})
