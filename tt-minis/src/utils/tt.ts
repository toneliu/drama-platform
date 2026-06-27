/**
 * TikTok Minis SDK 封装
 * 在 TikTok 环境中使用真实 tt.* API，浏览器中使用 mock
 */

const isTikTok = typeof tt !== 'undefined' && typeof tt.login === 'function'

// ---------- mock helpers ----------
function mockDelay(ms = 300) {
  return new Promise(r => setTimeout(r, ms))
}

function mockOpenId() {
  const stored = localStorage.getItem('mock_tt_open_id')
  if (stored) return stored
  const id = 'mock_' + Math.random().toString(36).slice(2, 10)
  localStorage.setItem('mock_tt_open_id', id)
  return id
}

// ---------- SDK wrapper ----------
export const ttSDK = {
  /** 静默登录 → 获取 tt_open_id */
  async login(): Promise<{ tt_open_id: string }> {
    if (isTikTok) {
      const res = await tt.login()
      // 拿 code 换 open_id，这里简化为直接返回
      // 实际需后端用 code 调 tt.oauth 换取
      return { tt_open_id: res.code }
    }
    await mockDelay()
    return { tt_open_id: mockOpenId() }
  },

  /** 获取用户信息 */
  async getUserInfo(): Promise<{ nickname: string; avatar: string }> {
    if (isTikTok) {
      const res = await tt.getUserInfo()
      return {
        nickname: res.userInfo.nickName,
        avatar: res.userInfo.avatarUrl,
      }
    }
    await mockDelay()
    return {
      nickname: '测试用户',
      avatar: '',
    }
  },

  /** VIP 订阅 (TTMinis.subscribe) */
  async subscribe(options: { product_id: string }): Promise<any> {
    if (isTikTok && typeof TTMinis !== 'undefined') {
      return new Promise((resolve, reject) => {
        TTMinis.subscribe({
          product_id: options.product_id,
          success: () => resolve({ status: 'subscribed' }),
          fail: (err: any) => reject(err),
        })
      })
    }
    await mockDelay(500)
    console.log('[mock] subscribe', options)
    return { status: 'subscribed', mock: true }
  },

  /** 一次性支付（金币充值） */
  async requestPayment(options: { product_id: string; amount: number }): Promise<any> {
    if (isTikTok) {
      return tt.requestPayment(options)
    }
    await mockDelay(500)
    console.log('[mock] requestPayment', options)
    return { status: 'paid', mock: true }
  },

  /** 激励视频广告 */
  async createRewardedAd(adUnitId: string): Promise<{ show(): Promise<any> }> {
    if (isTikTok) {
      const ad = tt.createRewardedVideoAd({ adUnitId })
      return {
        show(): Promise<any> {
          return new Promise((resolve, reject) => {
            ad.onClose((res: any) => {
              if (res && res.isEnded) {
                resolve(res)
              } else {
                reject(new Error('广告未看完'))
              }
            })
            ad.onError((err: any) => reject(err))
            ad.show().catch(reject)
          })
        },
      }
    }
    // 浏览器 mock：模拟看完广告
    await mockDelay(300)
    return {
      async show() {
        console.log('[mock] rewarded ad shown')
        await mockDelay(2000)
        return { isEnded: true, mock: true }
      },
    }
  },

  /** 分享 */
  async share(options: { title: string; imageUrl: string; path: string }): Promise<any> {
    if (isTikTok) {
      return tt.shareAppMessage(options)
    }
    await mockDelay()
    console.log('[mock] share', options)
    // 浏览器用 Web Share API 降级
    if (navigator.share) {
      try {
        await navigator.share({ title: options.title, url: options.path })
      } catch { /* user cancelled */ }
    }
    return { mock: true }
  },

  /** 显示 Toast */
  showToast(title: string) {
    if (isTikTok) {
      tt.showToast({ title, icon: 'none' })
      return
    }
    // 浏览器降级
    console.log('[toast]', title)
  },

  /** 获取系统信息 */
  getSystemInfo(): { platform: string; statusBarHeight: number } {
    if (isTikTok) {
      return tt.getSystemInfoSync()
    }
    return { platform: 'devtools', statusBarHeight: 44 }
  },

  /** 是否在 TikTok 环境 */
  get isTikTokEnv() {
    return isTikTok
  },
}
