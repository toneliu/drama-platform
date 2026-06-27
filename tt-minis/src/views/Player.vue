<template>
  <div class="player-page">
    <!-- 返回按钮 -->
    <div class="player-topbar safe-area-top">
      <div class="back-btn" @click="$router.back()">
        <van-icon name="arrow-left" size="20" />
      </div>
      <span class="player-title">{{ episodeInfo.title }}</span>
      <div class="topbar-right" />
    </div>

    <!-- 视频播放器 -->
    <VideoPlayer
      ref="playerRef"
      :src="videoSrc"
      :poster="episodeInfo.cover"
      @ended="onVideoEnded"
    />

    <!-- 剧集信息 -->
    <div class="episode-info">
      <h3>{{ episodeInfo.title }}</h3>
      <div class="episode-meta">
        <span>第{{ episodeInfo.episode_number }}集</span>
        <span>{{ formatDuration(episodeInfo.duration) }}</span>
      </div>
    </div>

    <!-- 操作区 -->
    <div class="player-actions">
      <van-button
        v-if="episodeInfo.episode_number > 1"
        plain
        round
        size="small"
        @click="playPrev"
      >
        上一集
      </van-button>
      <van-button
        type="primary"
        round
        size="small"
        @click="playNext"
      >
        下一集
      </van-button>
      <van-button plain round size="small" @click="handleShare">
        分享
      </van-button>
    </div>

    <!-- 解锁弹窗 -->
    <UnlockDialog
      v-model:show="showUnlock"
      :episode="episodeInfo"
      :user-coins="userStore.coins"
      :is-vip="userStore.isVip"
      @unlock-by-coins="unlockByCoins"
      @unlock-by-ad="unlockByAd"
      @go-recharge="$router.push('/recharge')"
      @go-subscribe="$router.push('/subscription')"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { dramaApi, type Episode } from '@/api/drama'
import { paymentApi } from '@/api/payment'
import { ttSDK } from '@/utils/tt'
import VideoPlayer from '@/components/VideoPlayer.vue'
import UnlockDialog from '@/components/UnlockDialog.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const episodeId = route.params.episodeId as string

const playerRef = ref()
const showUnlock = ref(false)
const videoSrc = ref('')
const episodePrice = ref(0)
const episodeInfo = ref<Episode & { unlocked?: boolean }>({
  id: episodeId,
  drama_id: '',
  episode_number: 1,
  title: '加载中...',
  duration: 0,
  is_free: true,
  unlock_cost: 0,
  video_url: '',
  cover: '',
  unlocked: true,
})

onMounted(async () => {
  try {
    const res = await dramaApi.getPlayInfo(episodeId)
    episodeInfo.value = res.data
    if (res.data.unlocked || res.data.is_free) {
      videoSrc.value = res.data.video_url
    } else {
      showUnlock.value = true
    }
  } catch {
    // Mock
    episodeInfo.value = {
      ...episodeInfo.value,
      episode_number: 1,
      title: '第1集',
      duration: 135,
      is_free: false,
      unlock_cost: 50,
      unlocked: false,
    }
    showUnlock.value = true
  }
})

function formatDuration(sec: number) {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

async function unlockByCoins() {
  try {
    const res = await paymentApi.unlockEpisode(episodeId, 'coins')
    if (res.data.success) {
      userStore.addCoins(-(episodePrice.value || 0))
      showUnlock.value = false
      // 重新获取播放信息
      const playRes = await dramaApi.getPlayInfo(episodeId)
      videoSrc.value = playRes.data.video_url
    }
  } catch (e: any) {
    ttSDK.showToast(e.message || '解锁失败')
  }
}

async function unlockByAd() {
  try {
    const ad = await ttSDK.createRewardedVideoAd('your-ad-unit-id')
    await ad.show()
    // 广告看完，请求后端发放奖励并解锁
    const res = await paymentApi.unlockEpisode(episodeId, 'ad')
    if (res.data.success) {
      showUnlock.value = false
      const playRes = await dramaApi.getPlayInfo(episodeId)
      videoSrc.value = playRes.data.video_url
    }
  } catch (e: any) {
    ttSDK.showToast(e.message || '广告未完成')
  }
}

function onVideoEnded() {
  // 自动播放下一集
  playNext()
}

function playPrev() {
  const prevEp = episodeInfo.value.episode_number - 1
  if (prevEp >= 1) {
    // 通过 drama detail 获取上一集 id
    router.replace(`/play/ep-${episodeInfo.value.drama_id}-${prevEp}`)
    // 重新加载
    window.location.reload()
  }
}

function playNext() {
  const nextEp = episodeInfo.value.episode_number + 1
  router.replace(`/play/ep-${episodeInfo.value.drama_id}-${nextEp}`)
  window.location.reload()
}

function handleShare() {
  ttSDK.share({
    title: `我在看这部短剧，超精彩！`,
    imageUrl: episodeInfo.value.cover,
    path: `/pages/play?episodeId=${episodeId}`,
  })
}
</script>

<style scoped>
.player-page {
  background: #000;
  min-height: 100vh;
}
.player-topbar {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
  background: linear-gradient(rgba(0,0,0,0.6), transparent);
}
.back-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.player-title {
  flex: 1;
  text-align: center;
  font-size: 14px;
}
.topbar-right {
  width: 36px;
}
.episode-info {
  padding: 16px;
}
.episode-info h3 {
  font-size: 16px;
  font-weight: 600;
}
.episode-meta {
  font-size: 12px;
  color: var(--color-text-hint);
  margin-top: 4px;
  display: flex;
  gap: 12px;
}
.player-actions {
  display: flex;
  gap: 10px;
  padding: 0 16px;
  justify-content: center;
}
</style>
