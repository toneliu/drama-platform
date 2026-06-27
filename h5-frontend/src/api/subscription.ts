import api from './index'

export interface SubTier {
  id: string
  name: string
  price: number
  duration: string
  features: string[]
  isPopular?: boolean
}

export interface SubStatus {
  isSubscribed: boolean
  tier?: SubTier
  expireAt?: string
  autoRenew?: boolean
}

/** 订阅档位列表 */
export function getSubTiers() {
  return api.get<any, SubTier[]>('/subscription/tiers')
}

/** 创建订阅订单 */
export function createSubOrder(tierId: string, platform = 'h5') {
  return api.post<any, { orderId: string; payUrl?: string }>('/subscription/create', {
    tier_id: tierId,
    platform,
  })
}

/** 订阅状态（需 JWT） */
export function getSubStatus() {
  return api.get<any, SubStatus>('/subscription/status')
}

/** 取消自动续费（需 JWT） */
export function cancelAutoRenew() {
  return api.post<any, { success: boolean }>('/subscription/cancel-auto-renew')
}
