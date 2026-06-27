import api from './index'

export interface UserProfile {
  tt_open_id: string
  nickname: string
  avatar: string
  coins: number
  vip_level: number
  vip_expire_at: string
  checkin_streak: number
  total_watch: number
}

export const userApi = {
  /** TT 登录换取 JWT */
  loginWithTT(tt_open_id: string) {
    return api.post<any, { data: { token: string } & UserProfile }>('/auth/tt-login', { tt_open_id })
  },

  /** 获取个人资料 */
  getProfile() {
    return api.get<any, { data: UserProfile }>('/user/profile')
  },

  /** 签到 */
  checkin() {
    return api.post<any, { data: { reward_coins: number; streak: number } }>('/user/checkin')
  },

  /** 签到状态 */
  getCheckinStatus() {
    return api.get<any, { data: { checked_today: boolean; streak: number; rewards: { day: number; coins: number }[] } }>('/user/checkin/status')
  },
}
