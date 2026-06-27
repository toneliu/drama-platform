import api from './index'

export function getUserList(params?: { page?: number; pageSize?: number; keyword?: string; vipStatus?: number }) {
  return api.get('/admin/users', { params })
}

export function getUserDetail(id: string | number) {
  return api.get(`/admin/users/${id}`)
}
