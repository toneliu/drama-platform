import axios from 'axios'
import { showToast } from 'vant'
import router from '@/router'

const api = axios.create({
  baseURL: '/api/v1',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor — attach JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor — handle 401
api.interceptors.response.use(
  (response) => {
    const data = response.data
    if (data.code && data.code !== 0) {
      showToast(data.message || '请求失败')
      return Promise.reject(new Error(data.message))
    }
    return data.data ?? data
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      router.push('/login')
      showToast('请先登录')
    } else {
      showToast(error.response?.data?.message || '网络错误')
    }
    return Promise.reject(error)
  }
)

export default api
