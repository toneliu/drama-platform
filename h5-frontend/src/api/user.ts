import api from './index'

export interface UserProfile {
  id: string
  nickname: string
  avatar: string
  phone: string
  coinBalance: number
  isVip: boolean
  vipExpireAt: string
  totalWatched: number
}

/** 获取用户信息 */
export function getUserProfile() {
  return api.get<any, UserProfile>('/user/profile')
}

/** 更新用户信息 */
export function updateUserProfile(data: { nickname?: string; avatar?: string }) {
  return api.patch<any, UserProfile>('/user/profile', data)
}
