import api from './index'

export function getDashboard() {
  return api.get('/admin/dashboard')
}

export function adminLogin(data: { username: string; password: string }) {
  return api.post('/admin/login', data)
}
