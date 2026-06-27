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

export interface LoginResult {
  token: string
  user: UserProfile
}

export interface CheckinStatus {
  checkedInToday: boolean
  continuousDays: number
  calendar: { date: string; checked: boolean }[]
  rewards: { day: number; reward: string }[]
}

/** 手机号登录 */
export function login(phone: string, code: string) {
  return api.post<any, LoginResult>('/auth/h5/login', { phone, code })
}

/** 用户信息 */
export function getUserProfile() {
  return api.get<any, UserProfile>('/user/profile')
}

/** 签到 */
export function doCheckin() {
  return api.post<any, { coins: number; continuousDays: number }>('/checkin')
}

/** 签到状态 */
export function getCheckinStatus() {
  return api.get<any, CheckinStatus>('/checkin/status')
}

/** 兑换码 */
export function redeemCode(code: string) {
  return api.post<any, { success: boolean; reward: string }>('/redeem', { code })
}
