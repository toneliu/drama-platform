import api from './index'

export function getDramaList(params?: { page?: number; pageSize?: number; keyword?: string }) {
  return api.get('/drama/featured', { params })
}

export function getDramaDetail(id: string | number) {
  return api.get(`/drama/${id}`)
}

export function createDrama(data: Record<string, any>) {
  return api.post('/drama', data)
}

export function updateDrama(id: string | number, data: Record<string, any>) {
  return api.put(`/drama/${id}`, data)
}

export function getEpisodeList(dramaId: string | number, params?: { page?: number; pageSize?: number }) {
  return api.get(`/episode/list/${dramaId}`, { params })
}

export function getEpisodeDetail(id: string | number) {
  return api.get(`/episode/${id}`)
}

export function createEpisode(data: Record<string, any>) {
  return api.post('/episode', data)
}

export function updateEpisode(id: string | number, data: Record<string, any>) {
  return api.put(`/episode/${id}`, data)
}
