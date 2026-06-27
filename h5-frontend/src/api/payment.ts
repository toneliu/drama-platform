import api from './index'

export interface CoinPackage {
  id: string
  coins: number
  price: number
  label?: string
  bonus?: number
}

export interface OrderResult {
  orderId: string
  payUrl?: string
}

export interface OrderStatus {
  orderId: string
  status: 'pending' | 'paid' | 'failed'
  coins?: number
}

/** 金币套餐列表 */
export function getCoinPackages() {
  return api.get<any, CoinPackage[]>('/payment/coin-packages')
}

/** 创建充值订单 */
export function createPaymentOrder(packageId: string, platform = 'h5') {
  return api.post<any, OrderResult>('/payment/create', {
    package_id: packageId,
    platform,
  })
}

/** 查询订单状态（需 JWT） */
export function getOrderStatus(orderId: string) {
  return api.get<any, OrderStatus>(`/payment/status/${orderId}`)
}
