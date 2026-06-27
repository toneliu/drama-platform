import api from './index'

export function getPaymentList(params?: { page?: number; pageSize?: number; status?: string }) {
  return api.get('/payment/orders', { params })
}
