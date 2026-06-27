import api from './index'

export interface CoinPackage {
  id: string
  coins: number
  price: number
  label?: string
  bonus?: number
}

export const paymentApi = {
  /** 金币套餐列表 */
  getPackages() {
    return api.get<any, { data: CoinPackage[] }>('/payment/packages')
  },

  /** 创建支付订单（tt.requestPayment 之前调后端） */
  createOrder(productId: string, amount: number) {
    return api.post<any, { data: { order_id: string } }>('/payment/create-order', { product_id: productId, amount })
  },

  /** 支付回调确认 */
  confirmPayment(orderId: string, ttPayResult: any) {
    return api.post<any, { data: { success: boolean; coins: number } }>('/payment/confirm', { order_id: orderId, tt_result: ttPayResult })
  },

  /** 看广告获取奖励 */
  claimAdReward(adUnitId: string) {
    return api.post<any, { data: { reward_coins: number } }>('/payment/ad-reward', { ad_unit_id: adUnitId })
  },

  /** 解锁单集 */
  unlockEpisode(episodeId: string, method: 'coins' | 'ad') {
    return api.post<any, { data: { success: boolean; remaining_coins: number } }>(`/episode/${episodeId}/unlock`, { method })
  },
}
