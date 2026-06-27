import api from './index'

export interface CoinPackage {
  id: string
  coins: number
  price: number
  label?: string
  bonus?: number
}

/** 金币套餐 */
export function getCoinPackages() {
  return api.get<any, CoinPackage[]>('/payment/coin-packages')
}

/** 创建充值订单 */
export function createRechargeOrder(packageId: string, payMethod: string) {
  return api.post<any, { orderId: string; payUrl?: string }>('/payment/recharge', {
    packageId,
    payMethod,
  })
}
