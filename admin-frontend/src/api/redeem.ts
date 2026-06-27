import api from './index'

export function generateRedeemCodes(data: {
  count: number
  coins?: number
  vipDays?: number
  expiresInDays?: number
}) {
  return api.post('/redeem/generate', data)
}

export function getRedeemCodeList(params?: { page?: number; pageSize?: number }) {
  return api.get('/redeem/list', { params })
}
