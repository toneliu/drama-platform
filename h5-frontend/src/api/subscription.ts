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

/** 订阅档位 */
export function getSubTiers() {
  return api.get<any, SubTier[]>('/subscription/tiers')
}

/** 创建订阅订单 */
export function createSubOrder(tierId: string) {
  return api.post<any, { orderId: string; payUrl?: string }>('/subscription/create', {
    tierId,
  })
}

/** 订阅状态 */
export function getSubStatus() {
  return api.get<any, SubStatus>('/subscription/status')
}
