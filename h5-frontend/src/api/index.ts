import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

// 请求拦截器 - 添加 JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 响应拦截器
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response?.status
    if (status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ============ Auth ============
export const authApi = {
  tiktokLogin: (data: { tt_open_id: string; nickname?: string; avatar?: string }) =>
    api.post('/auth/tiktok/login', data),
  h5Login: (data: { phone: string; sms_code?: string }) =>
    api.post('/auth/h5/login', data),
}

// ============ User ============
export const userApi = {
  getProfile: () => api.get('/user/profile'),
  updateProfile: (data: { nickname?: string; avatar?: string }) =>
    api.patch('/user/profile', data),
}

// ============ Drama ============
export const dramaApi = {
  getFeatured: (limit = 10) => api.get('/drama/featured', { params: { limit } }),
  getNewRelease: (limit = 10) => api.get('/drama/new-release', { params: { limit } }),
  getRanking: (type: string, limit = 10) => api.get(`/drama/ranking/${type}`, { params: { limit } }),
  getByCategory: (category: string, page = 1, limit = 20) =>
    api.get(`/drama/category/${category}`, { params: { page, limit } }),
  search: (keyword: string, page = 1, limit = 20) =>
    api.get('/drama/search', { params: { keyword, page, limit } }),
  getDetail: (id: number) => api.get(`/drama/${id}`),
  getCategories: () => api.get('/drama/categories'),
}

// ============ Episode ============
export const episodeApi = {
  getPlayInfo: (id: number) => api.get(`/episode/${id}/play`),
  unlockWithCoins: (id: number) => api.post(`/episode/${id}/unlock/coins`),
  unlockByAd: (id: number) => api.post(`/episode/${id}/unlock/ad`),
}

// ============ Checkin ============
export const checkinApi = {
  getStatus: () => api.get('/checkin/status'),
  checkin: () => api.post('/checkin'),
}

// ============ Subscription ============
export const subscriptionApi = {
  getTiers: () => api.get('/subscription/tiers'),
  createOrder: (tier_id: string, platform = 'h5') =>
    api.post('/subscription/create', { tier_id, platform }),
  getStatus: () => api.get('/subscription/status'),
  cancelAutoRenew: () => api.post('/subscription/cancel-auto-renew'),
}

// ============ Payment ============
export const paymentApi = {
  getCoinPackages: () => api.get('/payment/coin-packages'),
  createOrder: (package_id: number, platform = 'h5') =>
    api.post('/payment/create', { package_id, platform }),
  getOrderStatus: (order_id: string) => api.get(`/payment/status/${order_id}`),
}

// ============ Redeem ============
export const redeemApi = {
  redeem: (code: string) => api.post('/redeem', { code }),
}

export default api
