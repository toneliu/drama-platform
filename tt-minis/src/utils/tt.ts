/**
 * TikTok Minis SDK 封装
 * 参照 tiktok-drama-mini 的实现
 */

const tt = (window as any).tt || (window as any).TTMinis

export const ttSDK = {
  /** 是否在小程序环境 */
  isMiniApp: (): boolean => {
    return typeof tt !== 'undefined' && typeof tt.login === 'function'
  },

  /** 登录获取 code */
  login: (): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!tt) {
        // 开发环境模拟
        resolve('mock_code_' + Date.now())
        return
      }
      tt.login({
        success: (res: any) => resolve(res.code),
        fail: (err: any) => reject(err),
      })
    })
  },

  /** 获取用户信息 */
  getUserInfo: () => {
    return new Promise<{
      openId: string
      nickname: string
      avatarUrl: string
    }>((resolve, reject) => {
      if (!tt) {
        resolve({
          openId: 'mock_open_id',
          nickname: '测试用户',
          avatarUrl: '',
        })
        return
      }
      tt.getUserInfo({
        success: (res: any) => resolve(res.userInfo),
        fail: (err: any) => reject(err),
      })
    })
  },

  /** 支付 */
  pay: (tradeOrderId: string) => {
    return new Promise<{ orderId: string }>((resolve, reject) => {
      if (!tt) {
        setTimeout(() => resolve({ orderId: tradeOrderId }), 1000)
        return
      }
      tt.pay({
        tradeOrderId,
        success: (res: any) => resolve(res),
        fail: (err: any) => reject(new Error(err.errMsg)),
      })
    })
  },

  /** 发起支付请求 */
  requestPayment: (params: { orderInfo: string; service: number }) => {
    return new Promise<void>((resolve, reject) => {
      if (!tt) {
        setTimeout(() => resolve(), 1000)
        return
      }
      tt.pay({
        orderInfo: params.orderInfo,
        service: params.service,
        success: () => resolve(),
        fail: (err: any) => reject(new Error(err.errMsg)),
      })
    })
  },

  /** 显示提示 */
  showToast: (title: string, icon = 'none') => {
    if (!tt) {
      console.log('[Toast]', title)
      return
    }
    tt.showToast({ title, icon })
  },

  /** 分享 */
  share: (params: { title: string; imageUrl?: string; path?: string } | string) => {
    return new Promise<void>((resolve, reject) => {
      if (!tt) { resolve(); return }
      const videoUrl = typeof params === 'string' ? params : params.path || ''
      tt.shareToFeed({
        videoUrl,
        success: () => resolve(),
        fail: (err: any) => reject(err),
      })
    })
  },

  /** 订阅 */
  subscribe: (params: { planId: string }) => {
    return new Promise<void>((resolve, reject) => {
      if (!tt) { resolve(); return }
      // 实际调用支付
      tt.pay({
        orderInfo: params.planId,
        success: () => resolve(),
        fail: (err: any) => reject(new Error(err.errMsg)),
      })
    })
  },

  /** 分享 */
  shareToFeed: (videoUrl: string) => {
    return new Promise<void>((resolve, reject) => {
      if (!tt) { resolve(); return }
      tt.shareToFeed({
        videoUrl,
        success: () => resolve(),
        fail: (err: any) => reject(err),
      })
    })
  },

  /** 激励视频广告 */
  createRewardedVideoAd: (adUnitId: string) => {
    if (!tt) return null
    return tt.createRewardedVideoAd({ adUnitId })
  },

  /** 设置导航栏标题 */
  setNavigationBarTitle: (title: string) => {
    return new Promise<void>((resolve, reject) => {
      if (!tt) { resolve(); return }
      tt.setNavigationBarTitle({
        title,
        success: () => resolve(),
        fail: (err: any) => reject(err),
      })
    })
  },

  /** 获取系统信息 */
  getSystemInfo: () => {
    return new Promise<any>((resolve, reject) => {
      if (!tt) {
        resolve({
          screenWidth: 375, screenHeight: 812,
          windowWidth: 375, windowHeight: 812,
          platform: 'devtools', language: 'zh',
        })
        return
      }
      tt.getSystemInfo({
        success: (res: any) => resolve(res),
        fail: (err: any) => reject(err),
      })
    })
  },

  /** 存储 */
  storage: {
    set: (key: string, data: any) => {
      return new Promise<void>((resolve, reject) => {
        if (!tt) { localStorage.setItem(key, JSON.stringify(data)); resolve(); return }
        tt.setStorage({ key, data, success: () => resolve(), fail: (err: any) => reject(err) })
      })
    },
    get: <T = any>(key: string): Promise<T | null> => {
      return new Promise((resolve) => {
        if (!tt) {
          const data = localStorage.getItem(key)
          resolve(data ? JSON.parse(data) : null)
          return
        }
        tt.getStorage({ key, success: (res: any) => resolve(res.data), fail: () => resolve(null) })
      })
    },
    remove: (key: string) => {
      return new Promise<void>((resolve, reject) => {
        if (!tt) { localStorage.removeItem(key); resolve(); return }
        tt.removeStorage({ key, success: () => resolve(), fail: (err: any) => reject(err) })
      })
    },
  },
}

export default ttSDK
