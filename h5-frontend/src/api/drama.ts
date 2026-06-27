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
export function getFeatured() {
  return api.get<any, Drama[]>('/drama/featured')
}

/** 新剧上线 */
export function getNewRelease() {
  return api.get<any, Drama[]>('/drama/new-release')
}

/** 排行榜 */
export function getRanking(type: string) {
  return api.get<any, RankingItem[]>(`/drama/ranking/${type}`)
}

/** 分类列表 */
export function getCategory(name: string) {
  return api.get<any, Drama[]>(`/drama/category/${name}`)
}

/** 搜索 */
export function searchDrama(keyword: string) {
  return api.get<any, Drama[]>('/drama/search', { params: { keyword } })
}

/** 剧集详情 */
export function getDramaDetail(id: string) {
  return api.get<any, DramaDetail>(`/drama/${id}`)
}

/** 播放信息 */
export function getPlayInfo(episodeId: string) {
  return api.get<any, PlayInfo>(`/episode/${episodeId}/play`)
}

/** 金币解锁 */
export function unlockByCoins(episodeId: string) {
  return api.post<any, { success: boolean }>(`/episode/${episodeId}/unlock/coins`)
}

/** 广告解锁 */
export function unlockByAd(episodeId: string) {
  return api.post<any, { success: boolean }>(`/episode/${episodeId}/unlock/ad`)
}
