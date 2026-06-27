import api from './index'

export interface Drama {
  id: string
  title: string
  coverUrl: string
  description: string
  category: string
  totalEpisodes: number
  playCount: number
  tags: string[]
  createdAt: string
}

export interface Episode {
  id: string
  dramaId: string
  episodeNumber: number
  title: string
  duration: number
  isUnlocked: boolean
  previewSeconds: number
  videoUrl: string
}

export interface DramaDetail extends Drama {
  episodes: Episode[]
}

export interface PlayInfo {
  episodeId: string
  videoUrl: string
  isUnlocked: boolean
  previewSeconds: number
  unlockMethods: {
    coins?: number
    vip?: boolean
    ad?: boolean
  }
}

export interface RankingItem {
  rank: number
  drama: Drama
}

/** 精选推荐 */
export function getFeatured(limit = 10) {
  return api.get<any, Drama[]>('/drama/featured', { params: { limit } })
}

/** 新剧上线 */
export function getNewRelease(limit = 10) {
  return api.get<any, Drama[]>('/drama/new-release', { params: { limit } })
}

/** 排行榜 (hot/new/male/female) */
export function getRanking(type: string) {
  return api.get<any, RankingItem[]>(`/drama/ranking/${type}`)
}

/** 分类列表 */
export function getCategory(name: string, page = 1, limit = 20) {
  return api.get<any, Drama[]>(`/drama/category/${name}`, { params: { page, limit } })
}

/** 搜索 */
export function searchDrama(keyword: string, page = 1, limit = 20) {
  return api.get<any, Drama[]>('/drama/search', { params: { keyword, page, limit } })
}

/** 剧集详情（含 episodes 列表） */
export function getDramaDetail(id: string) {
  return api.get<any, DramaDetail>(`/drama/${id}`)
}
