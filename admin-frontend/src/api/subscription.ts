import api from './index'

export function getSubscriptionList(params?: { page?: number; pageSize?: number; status?: string }) {
  return api.get('/admin/subscriptions', { params })
}

export function getSubscriptionTierList() {
  return api.get('/admin/subscription-tiers')
}

export function createSubscriptionTier(data: Record<string, any>) {
  return api.post('/admin/subscription-tiers', data)
}

export function updateSubscriptionTier(id: string | number, data: Record<string, any>) {
  return api.put(`/admin/subscription-tiers/${id}`, data)
}
