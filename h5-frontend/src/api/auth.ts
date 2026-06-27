import api from './index'

export interface LoginResult {
  token: string
  user: {
    id: string
    nickname: string
    avatar: string
    phone: string
    coinBalance: number
    isVip: boolean
    vipExpireAt: string
    totalWatched: number
  }
}

/** H5 手机号登录 */
export function loginByPhone(phone: string, smsCode: string) {
  return api.post<any, LoginResult>('/auth/h5/login', { phone, sms_code: smsCode })
}
