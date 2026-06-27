import api from './index'

/** 兑换码（需 JWT） */
export function redeemCode(code: string) {
  return api.post<any, { success: boolean; reward: string }>('/redeem', { code })
}
