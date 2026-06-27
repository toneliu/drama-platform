import api from './index'

export interface Drama {
  id: string
  title: string
  cover: string
  description: string
  category: string
  total_episodes: number
  is_new: boolean
  is_hot: boolean
  tags: string[]
  score: number
}

export interface Episode {
  id: string
  drama_id: string
  episode_number: number
  title: string
  duration: number
  is_free: boolean
  unlock_cost: number
  video_url: string
  cover: string
}

export const dramaApi = {
  /** 首页推荐 */
  getRecommend(params?: { page?: number; size?: number }) {
    return api.get<any, { data: Drama[]; total: number }>('/drama/recommend', { params })
  },

  /** 新剧上线 */
  getNewDramas(params?: { page?: number; size?: number }) {
    return api.get<any, { data: Drama[]; total: number }>('/drama/new', { params })
  },

  /** 排行榜 */
  getRanking(params?: { type?: string; page?: number }) {
    return api.get<any, { data: Drama[] }>('/drama/ranking', { params })
  },

  /** 分类列表 */
  getCategories() {
    return api.get<any, { data: { id: string; name: string; icon: string }[] }>('/drama/categories')
  },

  /** 分类下的剧集 */
  getByCategory(categoryId: string, params?: { page?: number }) {
    return api.get<any, { data: Drama[]; total: number }>(`/drama/category/${categoryId}`, { params })
  },

  /** 剧集详情 */
  getDetail(id: string) {
    return api.get<any, { data: Drama & { episodes: Episode[] } }>(`/drama/${id}`)
  },

  /** 搜索 */
  search(keyword: string, params?: { page?: number }) {
    return api.get<any, { data: Drama[]; total: number }>('/drama/search', { params: { keyword, ...params } })
  },

  /** 获取播放信息（含解锁状态） */
  getPlayInfo(episodeId: string) {
    return api.get<any, { data: Episode & { unlocked: boolean; video_url: string } }>(`/episode/${episodeId}/play`)
  },
}
