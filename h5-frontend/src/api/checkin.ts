import api from './index'

export interface CheckinStatus {
  checkedInToday: boolean
  continuousDays: number
  calendar: { date: string; checked: boolean }[]
  rewards: { day: number; reward: string }[]
}

export interface CheckinResult {
  coins: number
  continuousDays: number
}

/** 签到状态（需 JWT） */
export function getCheckinStatus() {
  return api.get<any, CheckinStatus>('/checkin/status')
}

/** 执行签到（需 JWT） */
export function doCheckin() {
  return api.post<any, CheckinResult>('/checkin')
}
