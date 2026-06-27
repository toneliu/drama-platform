/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// TikTok Minis SDK 全局类型声明
interface TT {
  login(options?: any): Promise<{ code: string; anonymousCode: string }>
  getUserInfo(options?: any): Promise<{ userInfo: { nickName: string; avatarUrl: string } }>
  requestPayment(options: any): Promise<any>
  createRewardedVideoAd(options: { adUnitId: string }): any
  shareAppMessage(options: any): Promise<any>
  navigateToMiniProgram(options: any): void
  showToast(options: { title: string; icon?: string }): void
  showLoading(options: { title: string }): void
  hideLoading(): void
  getSystemInfoSync(): { platform: string; statusBarHeight: number }
  getMenuButtonBoundingClientRect(): { top: number; height: number }
}

interface TTMinis {
  subscribe(options: { product_id: string; success?: () => void; fail?: (err: any) => void }): Promise<any>
}

declare const tt: TT
declare const TTMinis: TTMinis
