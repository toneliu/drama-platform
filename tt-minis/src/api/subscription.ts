import api from './index'

export interface SubscriptionPlan {
  id: string
  name: string
  product_id: string
  price: number
  duration_days: number
  description: string
  features: string[]
  is_current?: boolean
}

export const subscriptionApi = {
  /** 订阅档位列表 */
  getPlans() {
    return api.get<any, { data: SubscriptionPlan[] }>('/subscription/plans')
  },

  /** 当前订阅状态 */
  getStatus() {
    return api.get<any, { data: { plan: SubscriptionPlan | null; expire_at: string; auto_renew: boolean } }>('/subscription/status')
  },

  /** 取消订阅 */
  cancel() {
    return api.post<any, { data: { success: boolean } }>('/subscription/cancel')
  },
}
