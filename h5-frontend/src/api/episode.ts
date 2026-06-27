import api from './index'

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

/** 获取播放信息（需 JWT） */
export function getPlayInfo(episodeId: string) {
  return api.get<any, PlayInfo>(`/episode/${episodeId}/play`)
}

/** 金币解锁（需 JWT） */
export function unlockByCoins(episodeId: string) {
  return api.post<any, { success: boolean }>(`/episode/${episodeId}/unlock/coins`)
}

/** 广告解锁（需 JWT） */
export function unlockByAd(episodeId: string) {
  return api.post<any, { success: boolean }>(`/episode/${episodeId}/unlock/ad`)
}
